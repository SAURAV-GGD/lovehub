import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { subscriptions, webhookEvents, proposals } from "@/db/schema";
import { checkoutSchema } from "@/lib/validators";
import { updateOrderStatus, getOrderById } from "@/lib/orders";
import { getYouPiPaymentSession } from "@/lib/youpi-client";
import { markProposalPaid } from "@/lib/proposal-storage";
import { eq, or } from "drizzle-orm";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    const rawOrderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
    if (!rawOrderId) {
      return apiError(
        "Order ID is required to confirm payment.",
        "BAD_REQUEST",
        400
      );
    }
    const orderId = rawOrderId;
    const existingOrder = await getOrderById(orderId);
    if (!existingOrder) {
      return apiError(
        "Order not found. Please initiate checkout first.",
        "NOT_FOUND",
        404
      );
    }

    const rawPlan = body.plan || existingOrder?.planId || "starter";
    const validated = checkoutSchema.parse({
      plan: rawPlan,
      proposalId: body.proposalId || existingOrder?.proposalId || undefined,
    });

    const utr = typeof body.utr === "string" ? body.utr.trim() : "";

    if (!utr || !/^\d{10,16}$/.test(utr)) {
      return apiError(
        "Please provide a valid 12-digit UPI UTR / Reference number from your bank payment.",
        "BAD_REQUEST",
        400
      );
    }

    // 1. Authoritative Gateway Verification
    // Never mark an order paid purely from client-controlled UTR strings.
    // Check with the YouPI payment gateway or require explicit test mode flag.
    const isExplicitTestMode = process.env.ENABLE_TEST_PAYMENTS === "true";
    let isVerified = false;
    let bankUtr = utr;

    if (existingOrder.paymentId) {
      const session = await getYouPiPaymentSession(existingOrder.paymentId);
      if (session && session.status === "SUCCESS") {
        isVerified = true;
        bankUtr = session.utr || utr;
      }
    } else if (isExplicitTestMode) {
      isVerified = true;
    }

    if (!isVerified) {
      // Record the UTR on the pending order for gateway/manual reconciliation
      await updateOrderStatus(orderId, "pending", { utr });
      const origin =
        request.headers.get("origin") ||
        process.env.NEXT_PUBLIC_SITE_URL ||
        "https://www.lovehub.in";
      const redirectUrl = `${origin}/checkout/callback?orderId=${encodeURIComponent(orderId)}`;

      return apiSuccess({
        success: true,
        verified: false,
        orderId,
        status: "pending",
        message: "UTR reference received. Payment verification in progress with banking gateway.",
        url: redirectUrl,
      });
    }

    // 2. Verified: Update order status to 'paid'
    await updateOrderStatus(orderId, "paid", { utr: bankUtr });

    // 2. Get current session if user is logged in
    try {
      const session = await auth.api.getSession({ headers: request.headers });

      if (session?.user?.id) {
        const userId = session.user.id;
        await db
          .insert(subscriptions)
          .values({
            id: `sub_${orderId}`,
            userId,
            provider: "upipay",
            providerCustomerId: utr || orderId,
            plan: validated.plan === "premium" ? "premium" : "pro",
            status: "active",
            currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year access
          })
          .onConflictDoNothing();

        logger.info("UPI Payment confirmed for user", {
          userId,
          plan: validated.plan,
          orderId,
          utr,
        });
      }
    } catch (authErr) {
      logger.warn("Could not record subscription in DB (non-fatal):", { authErr });
    }

    // 3. Record payment reference in webhookEvents table for accounting / audit
    try {
      await db
        .insert(webhookEvents)
        .values({
          id: `upi_evt_${orderId}`,
          type: `upi.payment.confirmed.${validated.plan}`,
          processedAt: new Date(),
        })
        .onConflictDoNothing();
    } catch (evtErr) {
      logger.warn("Could not record webhook event in DB (non-fatal):", { evtErr });
    }

    // 4. Update proposal if proposalId is provided or found from order
    const effectiveProposalId = validated.proposalId || existingOrder?.proposalId;
    if (effectiveProposalId) {
      markProposalPaid(effectiveProposalId);

      try {
        const [existing] = await db
          .select()
          .from(proposals)
          .where(
            or(
              eq(proposals.id, effectiveProposalId),
              eq(proposals.slug, effectiveProposalId)
            )
          );

        if (existing) {
          const currentContent =
            (existing.content as Record<string, unknown>) || {};
          const updatedContent: Record<string, unknown> = {
            ...currentContent,
            isPaid: true,
          };
          delete updatedContent.expiresAt;

          await db
            .update(proposals)
            .set({
              status: "final",
              content: updatedContent,
              updatedAt: new Date(),
            })
            .where(eq(proposals.id, existing.id));
        }
      } catch (err) {
        logger.warn("Could not update proposal to paid in DB", { err });
      }
    }

    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://www.lovehub.in";
    const redirectUrl = `${origin}/checkout/callback?orderId=${encodeURIComponent(orderId)}`;

    return apiSuccess({
      success: true,
      verified: true,
      status: "paid",
      orderId,
      plan: validated.plan,
      proposalId: effectiveProposalId,
      url: redirectUrl,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
