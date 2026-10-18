import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { subscriptions, webhookEvents, proposals } from "@/db/schema";
import { checkoutSchema } from "@/lib/validators";
import { updateOrderStatus } from "@/lib/orders";
import { markProposalPaid } from "@/lib/proposal-storage";
import { eq, or } from "drizzle-orm";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const validated = checkoutSchema.parse({
      plan: body.plan,
      proposalId: body.proposalId,
    });

    const utr = typeof body.utr === "string" ? body.utr.trim() : "";
    const orderId = typeof body.orderId === "string" ? body.orderId.trim() : `upi_${Date.now()}`;

    if (!utr || utr.length < 6) {
      return apiError("Please provide a valid 12-digit UPI UTR / Reference number from your bank payment.", "BAD_REQUEST", 400);
    }

    // 1. Update order status in orders table/cache
    await updateOrderStatus(orderId, "paid", { utr });

    // 2. Get current session if user is logged in
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

    // 3. Record payment reference in webhookEvents table for accounting / audit
    await db
      .insert(webhookEvents)
      .values({
        id: `upi_evt_${orderId}`,
        type: `upi.payment.confirmed.${validated.plan}`,
        processedAt: new Date(),
      })
      .onConflictDoNothing();

    // 4. Update proposal if proposalId is provided
    if (validated.proposalId) {
      markProposalPaid(validated.proposalId);

      try {
        const [existing] = await db
          .select()
          .from(proposals)
          .where(
            or(
              eq(proposals.id, validated.proposalId),
              eq(proposals.slug, validated.proposalId)
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
      orderId,
      plan: validated.plan,
      proposalId: validated.proposalId,
      url: redirectUrl,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
