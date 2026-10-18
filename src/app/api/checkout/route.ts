import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { getPlanConfig } from "@/lib/plans";
import { createYouPiPayment } from "@/lib/youpi-client";
import { createOrderRecord } from "@/lib/orders";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    // Support both { planId, pageId } and { plan, proposalId }
    const rawPlanId = body.planId || body.plan || "starter";
    const proposalId = body.pageId || body.proposalId || body.id || null;

    // Single source of truth: authoritative price loaded ONLY from server config
    const planConfig = getPlanConfig(rawPlanId);

    // Optional user session (supports both authenticated creators and guest creators)
    let userId: string | null = null;
    let customerInfo: { email?: string; name?: string } | undefined = undefined;

    try {
      const session = await auth.api.getSession({ headers: request.headers });
      if (session?.user) {
        userId = session.user.id;
        customerInfo = {
          email: session.user.email,
          name: session.user.name,
        };
      }
    } catch {
      // Non-fatal if auth session cannot be parsed
    }

    const orderId = `lh_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const returnUrl = `${origin}/checkout/callback?orderId=${encodeURIComponent(orderId)}`;

    // 1. Create order with status 'pending'
    const order = await createOrderRecord({
      id: orderId,
      userId,
      proposalId,
      planId: planConfig.id,
      amountPaise: planConfig.priceInPaise,
      currency: "INR",
      status: "pending",
    });

    // 2. Initialize payment with YouPI gateway
    const paymentSession = await createYouPiPayment(
      {
        orderId,
        amountPaise: planConfig.priceInPaise,
        returnUrl,
        metadata: {
          planId: planConfig.id,
          proposalId,
          orderId,
        },
        customer: customerInfo,
      },
      origin
    );

    // 3. Update order with checkout URL and payment session ID
    order.paymentId = paymentSession.paymentId;
    order.checkoutUrl = paymentSession.checkoutUrl;

    logger.info("Checkout initiated via YouPI", {
      orderId,
      planId: planConfig.id,
      amountPaise: planConfig.priceInPaise,
      paymentId: paymentSession.paymentId,
    });

    return apiSuccess({
      orderId: order.id,
      paymentId: paymentSession.paymentId,
      checkoutUrl: paymentSession.checkoutUrl,
      status: "pending",
      amountRupees: planConfig.priceInRupees,
      planId: planConfig.id,
      planName: planConfig.name,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
