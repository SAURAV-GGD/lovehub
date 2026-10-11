import { NextRequest, NextResponse } from "next/server";
import { recordWebhookEventIfNew } from "@/lib/payments";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text();
    let event: { id?: string; type?: string; data?: Record<string, unknown> } = {};

    try {
      event = JSON.parse(bodyText);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const eventId = event.id || `evt_${Date.now()}`;
    const eventType = event.type || "payment.processed";

    // Idempotency check: prevent duplicate event processing
    const isNew = await recordWebhookEventIfNew(eventId, eventType);
    if (!isNew) {
      return NextResponse.json({ received: true, idempotent: true });
    }

    logger.info("Payment webhook event received (Cashfree ready)", { eventId, eventType });

    return NextResponse.json({ received: true });
  } catch (err) {
    logger.error("Error processing webhook event", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
