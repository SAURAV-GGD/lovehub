import { db } from "@/db";
import { subscriptions, usage, webhookEvents } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { logger } from "./logger";

import { PLANS, getPlanConfig } from "./plans";

export const PLAN_LIMITS = {
  starter: 3,
  free: 3,
  basic: 3,
  romantic: 15,
  pro: 30,
  premium: 999,
};

export const PLAN_PRICING = {
  starter: {
    name: PLANS.starter.name,
    amount: PLANS.starter.priceRupees, // ₹31
    amountPaise: PLANS.starter.pricePaise,
    currency: "inr",
  },
  basic: {
    name: PLANS.starter.name,
    amount: PLANS.starter.priceRupees, // ₹31
    amountPaise: PLANS.starter.pricePaise,
    currency: "inr",
  },
  romantic: {
    name: PLANS.romantic.name,
    amount: PLANS.romantic.priceRupees, // ₹69
    amountPaise: PLANS.romantic.pricePaise,
    currency: "inr",
  },
  pro: {
    name: PLANS.romantic.name,
    amount: PLANS.romantic.priceRupees, // ₹69
    amountPaise: PLANS.romantic.pricePaise,
    currency: "inr",
  },
  premium: {
    name: PLANS.premium.name,
    amount: PLANS.premium.priceRupees, // ₹169
    amountPaise: PLANS.premium.pricePaise,
    currency: "inr",
  },
};

export async function getUserPlan(userId: string): Promise<string> {
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")));

  return sub?.plan || "free";
}

export async function checkCanGenerate(userId: string): Promise<{
  allowed: boolean;
  plan: string;
  used: number;
  limit: number;
}> {
  const plan = await getUserPlan(userId);
  const limit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] ?? PLAN_LIMITS.free;

  const currentMonth = new Date().toISOString().substring(0, 7); // "YYYY-MM"
  const [userUsage] = await db
    .select()
    .from(usage)
    .where(and(eq(usage.userId, userId), eq(usage.month, currentMonth)));

  const used = userUsage?.generationsUsed || 0;

  return {
    allowed: used < limit,
    plan,
    used,
    limit,
  };
}

export async function recordGenerationUsage(userId: string): Promise<void> {
  const currentMonth = new Date().toISOString().substring(0, 7);

  const [existing] = await db
    .select()
    .from(usage)
    .where(and(eq(usage.userId, userId), eq(usage.month, currentMonth)));

  if (existing) {
    await db
      .update(usage)
      .set({ generationsUsed: existing.generationsUsed + 1 })
      .where(eq(usage.id, existing.id));
  } else {
    await db.insert(usage).values({
      id: `${userId}_${currentMonth}`,
      userId,
      month: currentMonth,
      generationsUsed: 1,
    });
  }
}

export async function recordWebhookEventIfNew(
  eventId: string,
  type: string
): Promise<boolean> {
  const [existing] = await db
    .select()
    .from(webhookEvents)
    .where(eq(webhookEvents.id, eventId));

  if (existing) {
    logger.info("Webhook event already processed (idempotent skip)", { eventId, type });
    return false;
  }

  await db.insert(webhookEvents).values({
    id: eventId,
    type,
    processedAt: new Date(),
  });

  return true;
}
