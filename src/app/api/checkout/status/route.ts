import { NextRequest } from "next/server";
import { getOrderById, updateOrderStatus } from "@/lib/orders";
import { getYouPiPaymentSession } from "@/lib/youpi-client";
import { markProposalPaid } from "@/lib/proposal-storage";
import { db } from "@/db";
import { proposals, subscriptions } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return apiError("Missing orderId parameter", "BAD_REQUEST", 400);
    }

    const order = await getOrderById(orderId);
    if (!order) {
      return apiError("Order not found", "NOT_FOUND", 404);
    }

    // If order is already paid, return paid status
    if (order.status === "paid") {
      return apiSuccess({
        orderId: order.id,
        status: "paid",
        utr: order.utr || "PAID_CONFIRMED",
        planId: order.planId,
        amountPaise: order.amountPaise,
        proposalId: order.proposalId,
      });
    }

    // Authoritative Server-to-Server Verification with YouPI-PG Gateway
    // Never trust client redirect params; always check server session directly!
    let verifiedStatus: "pending" | "paid" | "failed" | "cancelled" = order.status;
    let bankUtr: string | null = null;

    if (order.paymentId) {
      const gatewaySession = await getYouPiPaymentSession(order.paymentId);
      if (gatewaySession) {
        if (gatewaySession.status === "SUCCESS") {
          verifiedStatus = "paid";
          bankUtr = gatewaySession.utr || `utr_${Date.now()}`;
        } else if (
          gatewaySession.status === "FAILED" ||
          gatewaySession.status === "EXPIRED" ||
          gatewaySession.status === "CANCELLED"
        ) {
          verifiedStatus = gatewaySession.status.toLowerCase() as "failed" | "cancelled";
        }
      }
    }

    // If payment verified as paid: update order, activate proposal, remove preview expiry
    if (verifiedStatus === "paid" && (order.status as string) !== "paid") {
      await updateOrderStatus(order.id, "paid", { utr: bankUtr || undefined });

      // 1. Activate Proposal in DB if present
      if (order.proposalId) {
        try {
          markProposalPaid(order.proposalId);

          const [existing] = await db
            .select()
            .from(proposals)
            .where(or(eq(proposals.id, order.proposalId), eq(proposals.slug, order.proposalId)));

          if (existing) {
            const currentContent = (existing.content as Record<string, unknown>) || {};
            const plan = (order.planId || (existing.plan as string) || "romantic").toLowerCase();
            const isAdmin = Boolean((existing as any).createdByAdmin || currentContent.createdByAdmin);
            const isVip = plan === "premium" || plan === "vip" || plan === "custom";

            const updatedContent: Record<string, unknown> = {
              ...currentContent,
              isPaid: true,
              paidAt: Date.now(),
            };

            if (isAdmin || isVip) {
              updatedContent.isPermanent = true;
              delete updatedContent.expiresAt;
              delete updatedContent.retentionDays;
            } else if (plan === "extend_30" || plan === "extend" || plan === "extension") {
              const currentExpires = Number(currentContent.expiresAt) || Date.now();
              const base = Math.max(Date.now(), currentExpires);
              updatedContent.isPermanent = false;
              updatedContent.retentionDays = 30;
              updatedContent.expiresAt = base + 30 * 24 * 60 * 60 * 1000;
            } else {
              // Pro Plan: Stored for 30 days
              updatedContent.isPermanent = false;
              updatedContent.retentionDays = 30;
              updatedContent.expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
            }

            await db
              .update(proposals)
              .set({
                status: "final",
                content: updatedContent,
                updatedAt: new Date(),
              })
              .where(eq(proposals.id, existing.id));
          }
        } catch (dbErr) {
          logger.warn("Could not update proposal in DB, local storage updated:", { dbErr });
        }
      }

      // 2. Activate user subscription if user is logged in
      if (order.userId) {
        try {
          await db
            .insert(subscriptions)
            .values({
              id: `sub_${order.id}`,
              userId: order.userId,
              provider: "youpi",
              providerCustomerId: bankUtr || order.id,
              plan: order.planId === "premium" ? "premium" : "pro",
              status: "active",
              currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            })
            .onConflictDoNothing();
        } catch (subErr) {
          logger.warn("Could not record subscription in DB:", { subErr });
        }
      }

      logger.info("Order marked as paid via authoritative gateway status check", {
        orderId: order.id,
        utr: bankUtr,
        proposalId: order.proposalId,
      });
    }

    return apiSuccess({
      orderId: order.id,
      status: verifiedStatus,
      utr: bankUtr || order.utr,
      planId: order.planId,
      amountPaise: order.amountPaise,
      proposalId: order.proposalId,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
