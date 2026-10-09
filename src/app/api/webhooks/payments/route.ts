import { NextRequest, NextResponse } from "next/server";
import { stripe, recordWebhookEventIfNew } from "@/lib/payments";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const bodyText = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event: any;

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(bodyText, signature, webhookSecret);
    } else {
      // For development without webhook secret, parse payload
      logger.warn("STRIPE_WEBHOOK_SECRET not set, parsing event without verification");
      event = JSON.parse(bodyText);
    }
  } catch (err) {
    logger.error("Stripe signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Idempotency check: prevent duplicate event processing
  const isNew = await recordWebhookEventIfNew(event.id, event.type);
  if (!isNew) {
    return NextResponse.json({ received: true, idempotent: true });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan || "romantic";

      if (userId) {
        logger.info("Processing checkout upgrade for user", { userId, plan });

        const [existing] = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.userId, userId));

        if (existing) {
          await db
            .update(subscriptions)
            .set({
              plan,
              status: "active",
              providerCustomerId: session.customer?.toString() || null,
            })
            .where(eq(subscriptions.id, existing.id));
        } else {
          await db.insert(subscriptions).values({
            id: `sub_${Date.now()}`,
            userId,
            provider: "stripe",
            providerCustomerId: session.customer?.toString() || null,
            plan,
            status: "active",
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    logger.error("Error processing Stripe webhook event", err, { eventId: event.id });
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
