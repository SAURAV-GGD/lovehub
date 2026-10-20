import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { logger } from "./logger";

export interface OrderRecord {
  id: string;
  userId: string | null;
  proposalId: string | null;
  planId: string;
  amountPaise: number;
  currency: string;
  status: "pending" | "paid" | "failed" | "cancelled";
  paymentId: string | null;
  utr: string | null;
  checkoutUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Memory fallback cache for local dev / tests
const memoryOrders = new Map<string, OrderRecord>();

export async function createOrderRecord(params: {
  id: string;
  userId?: string | null;
  proposalId?: string | null;
  planId: string;
  amountPaise: number;
  currency?: string;
  status?: "pending" | "paid" | "failed" | "cancelled";
  checkoutUrl?: string | null;
  paymentId?: string | null;
}): Promise<OrderRecord> {
  const record: OrderRecord = {
    id: params.id,
    userId: params.userId || null,
    proposalId: params.proposalId || null,
    planId: params.planId,
    amountPaise: params.amountPaise,
    currency: params.currency || "INR",
    status: params.status || "pending",
    paymentId: params.paymentId || null,
    utr: null,
    checkoutUrl: params.checkoutUrl || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  memoryOrders.set(record.id, record);

  try {
    await db
      .insert(orders)
      .values({
        id: record.id,
        userId: record.userId,
        proposalId: record.proposalId,
        planId: record.planId,
        amountPaise: record.amountPaise,
        currency: record.currency,
        status: record.status,
        paymentId: record.paymentId,
        checkoutUrl: record.checkoutUrl,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      })
      .onConflictDoNothing();
  } catch (err) {
    logger.warn("DB insert order skipped or non-fatal, stored in memory cache:", {
      orderId: record.id,
      err: err instanceof Error ? err.message : String(err),
    });
  }

  return record;
}

export async function getOrderById(orderId: string): Promise<OrderRecord | null> {
  try {
    const [row] = await db.select().from(orders).where(eq(orders.id, orderId));
    if (row) {
      return {
        id: row.id,
        userId: row.userId,
        proposalId: row.proposalId,
        planId: row.planId,
        amountPaise: row.amountPaise,
        currency: row.currency,
        status: row.status as OrderRecord["status"],
        paymentId: row.paymentId,
        utr: row.utr,
        checkoutUrl: row.checkoutUrl,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };
    }
  } catch (err) {
    logger.warn("DB get order fallback to memory:", { orderId });
  }

  return memoryOrders.get(orderId) || null;
}

export async function findActivePendingOrder(params: {
  proposalId?: string | null;
  userId?: string | null;
  planId?: string;
  maxAgeMinutes?: number;
}): Promise<OrderRecord | null> {
  const maxAgeMs = (params.maxAgeMinutes || 15) * 60 * 1000;
  const cutoff = Date.now() - maxAgeMs;

  // 1. Check memory cache first
  for (const order of memoryOrders.values()) {
    if (order.status !== "pending") continue;
    if (order.createdAt.getTime() < cutoff) continue;
    if (params.planId && order.planId !== params.planId) continue;
    if (params.proposalId && order.proposalId === params.proposalId) {
      return order;
    }
    if (params.userId && order.userId === params.userId) {
      return order;
    }
  }

  // 2. Query DB
  try {
    if (params.proposalId) {
      const rows = await db
        .select()
        .from(orders)
        .where(eq(orders.proposalId, params.proposalId))
        .orderBy(desc(orders.createdAt))
        .limit(3);

      for (const row of rows) {
        if (
          row.status === "pending" &&
          row.createdAt.getTime() >= cutoff &&
          (!params.planId || row.planId === params.planId) &&
          row.checkoutUrl
        ) {
          return {
            id: row.id,
            userId: row.userId,
            proposalId: row.proposalId,
            planId: row.planId,
            amountPaise: row.amountPaise,
            currency: row.currency,
            status: row.status as OrderRecord["status"],
            paymentId: row.paymentId,
            utr: row.utr,
            checkoutUrl: row.checkoutUrl,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
          };
        }
      }
    }
  } catch (err) {
    logger.warn("DB findActivePendingOrder fallback:", {
      err: err instanceof Error ? err.message : String(err),
    });
  }

  return null;
}

export async function updateOrderStatus(
  orderId: string,
  status: "pending" | "paid" | "failed" | "cancelled",
  details?: { utr?: string; paymentId?: string }
): Promise<OrderRecord | null> {
  const existing = await getOrderById(orderId);
  if (!existing) return null;

  const updated: OrderRecord = {
    ...existing,
    status,
    utr: details?.utr !== undefined ? details.utr : existing.utr,
    paymentId: details?.paymentId !== undefined ? details.paymentId : existing.paymentId,
    updatedAt: new Date(),
  };

  memoryOrders.set(orderId, updated);

  try {
    await db
      .update(orders)
      .set({
        status,
        utr: updated.utr,
        paymentId: updated.paymentId,
        updatedAt: updated.updatedAt,
      })
      .where(eq(orders.id, orderId));
  } catch (err) {
    logger.warn("DB update order status skipped, updated in memory:", { orderId, status });
  }

  return updated;
}

export async function listOrdersForUser(userId: string): Promise<OrderRecord[]> {
  const result: OrderRecord[] = [];

  try {
    const rows = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));

    for (const row of rows) {
      result.push({
        id: row.id,
        userId: row.userId,
        proposalId: row.proposalId,
        planId: row.planId,
        amountPaise: row.amountPaise,
        currency: row.currency,
        status: row.status as OrderRecord["status"],
        paymentId: row.paymentId,
        utr: row.utr,
        checkoutUrl: row.checkoutUrl,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      });
    }
  } catch {
    // Fall back to memory
    for (const order of memoryOrders.values()) {
      if (order.userId === userId) {
        result.push(order);
      }
    }
  }

  // Also include any memory orders that might not be in DB
  for (const order of memoryOrders.values()) {
    if (order.userId === userId && !result.some((r) => r.id === order.id)) {
      result.push(order);
    }
  }

  return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}
