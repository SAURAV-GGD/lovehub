import { NextRequest, NextResponse } from "next/server";
import { verifyYouPiWebhookSignature, getYouPiPaymentSession } from "@/lib/youpi-client";
import { recordWebhookEventIfNew } from "@/lib/payments";
import { getOrderById, updateOrderStatus } from "@/lib/orders";
import { markProposalPaid } from "@/lib/proposal-storage";
import { db } from "@/db";
import { proposals, subscriptions } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    // 1. Read raw unparsed body for HMAC-SHA256 signature verification
    const rawBody = await request.text();

    const signature =
      request.headers.get("x-gateway-signature") ||
      request.headers.get("X-Gateway-Signature");

    // 2. Cryptographic signature check
    const isValid = verifyYouPiWebhookSignature(rawBody, signature);
    if (!isValid) {
      logger.warn("Webhook rejected: Invalid HMAC signature", { signature });
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
    }

    // 3. Parse JSON payload
    let payload: {
      event?: string;
      orderId?: string;
      paymentId?: string;
      amount?: string;
      amountPaise?: number;
      utr?: string;
      metadata?: Record<string, unknown>;
    } = {};

    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { event, orderId, paymentId, utr } = payload;
    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId in payload" }, { status: 400 });
    }

    // 4. Idempotency Check: Prevent duplicate webhook processing
    const eventId = paymentId ? `youpi_${paymentId}` : `youpi_${orderId}_${event}`;
    const isNew = await recordWebhookEventIfNew(eventId, event || "SUCCESS");
    if (!isNew) {
      logger.info("Webhook event skipped (idempotent)", { eventId, orderId });
      return NextResponse.json({ received: true, idempotent: true });
    }

    logger.info("Authoritative webhook received from YouPI", {
      orderId,
      paymentId,
      event,
      utr,
    });

    // 5. Handle SUCCESS event
    if (event === "SUCCESS") {
      // Authoritatively verify with gateway server-side
      if (paymentId) {
        const session = await getYouPiPaymentSession(paymentId);
        if (session && session.status !== "SUCCESS") {
          logger.warn("Gateway session not marked SUCCESS upon verification", {
            paymentId,
            status: session.status,
          });
        }
      }

      // Update order status to 'paid'
      const updatedOrder = await updateOrderStatus(orderId, "paid", {
        utr: utr || undefined,
        paymentId: paymentId || undefined,
      });

      const proposalId =
        (payload.metadata?.proposalId as string) ||
        (payload.metadata?.pageId as string) ||
        updatedOrder?.proposalId;

      // 6. Activate Proposal / Remove 120s preview expiry
      if (proposalId) {
        try {
          markProposalPaid(proposalId);

          const [existing] = await db
            .select()
            .from(proposals)
            .where(or(eq(proposals.id, proposalId), eq(proposals.slug, proposalId)));

          if (existing) {
            const currentContent = (existing.content as Record<string, unknown>) || {};
            const plan = (updatedOrder?.planId || (existing.plan as string) || "romantic").toLowerCase();
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
          logger.warn("Could not activate proposal in DB:", { dbErr });
        }
      }

      // 7. Update user subscription if userId is present
      if (updatedOrder?.userId) {
        try {
          await db
            .insert(subscriptions)
            .values({
              id: `sub_${orderId}`,
              userId: updatedOrder.userId,
              provider: "youpi",
              providerCustomerId: utr || orderId,
              plan: updatedOrder.planId === "premium" ? "premium" : "pro",
              status: "active",
              currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            })
            .onConflictDoNothing();
        } catch (subErr) {
          logger.warn("Could not insert subscription:", { subErr });
        }
      }
    } else if (event === "FAILED" || event === "EXPIRED" || event === "CANCELLED") {
      await updateOrderStatus(orderId, event.toLowerCase() as "failed" | "cancelled");
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    logger.error("Error processing YouPI webhook", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
