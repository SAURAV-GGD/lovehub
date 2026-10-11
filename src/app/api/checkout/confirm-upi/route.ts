import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { subscriptions, webhookEvents } from "@/db/schema";
import { checkoutSchema } from "@/lib/validators";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const validated = checkoutSchema.parse({
      plan: body.plan,
      proposalId: body.proposalId,
    });

    const utr = typeof body.utr === "string" ? body.utr.trim() : "";
    const orderId = typeof body.orderId === "string" ? body.orderId : `upi_${Date.now()}`;

    // Get current session if user is logged in
    const session = await auth.api.getSession({ headers: request.headers });

    if (session?.user?.id) {
      const userId = session.user.id;
      // Record or update subscription in database
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

    // Record payment reference in webhookEvents table for accounting / audit
    await db
      .insert(webhookEvents)
      .values({
        id: `upi_evt_${orderId}`,
        type: `upi.payment.confirmed.${validated.plan}`,
        processedAt: new Date(),
      })
      .onConflictDoNothing();

    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const redirectUrl = `${origin}/create?plan=${validated.plan}&upgraded=true`;

    return apiSuccess({
      success: true,
      orderId,
      plan: validated.plan,
      url: redirectUrl,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
