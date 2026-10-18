import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { proposals } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { listOrdersForUser } from "@/lib/orders";
import { getPlanConfig } from "@/lib/plans";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export interface CartItem {
  id: string;
  orderId?: string | null;
  proposalId?: string | null;
  title: string;
  clientName?: string | null;
  planId: string;
  planName: string;
  amountRupees: number;
  status: "paid" | "pending" | "draft";
  isPaid: boolean;
  slug?: string | null;
  utr?: string | null;
  createdAt: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return apiSuccess({
        items: [],
        totalCount: 0,
        paidCount: 0,
        pendingCount: 0,
        totalSpentRupees: 0,
      });
    }

    const userId = session.user.id;

    // 1. Fetch user orders
    const orders = await listOrdersForUser(userId);

    // 2. Fetch user proposals
    let userProps: Array<{
      id: string;
      title: string;
      clientName: string | null;
      plan: string;
      status: string;
      slug: string | null;
      content: unknown;
      createdAt: Date;
    }> = [];

    try {
      userProps = await db
        .select({
          id: proposals.id,
          title: proposals.title,
          clientName: proposals.clientName,
          plan: proposals.plan,
          status: proposals.status,
          slug: proposals.slug,
          content: proposals.content,
          createdAt: proposals.createdAt,
        })
        .from(proposals)
        .where(eq(proposals.userId, userId))
        .orderBy(desc(proposals.createdAt));
    } catch {
      // In-memory fallback if DB table not yet connected
    }

    const items: CartItem[] = [];
    const seenProposalIds = new Set<string>();

    // Add orders first (they contain payment & authoritative amount)
    for (const ord of orders) {
      const planCfg = getPlanConfig(ord.planId);
      const isPaid = ord.status === "paid";
      const relatedProp = ord.proposalId
        ? userProps.find((p) => p.id === ord.proposalId || p.slug === ord.proposalId)
        : null;

      if (ord.proposalId) {
        seenProposalIds.add(ord.proposalId);
      }

      items.push({
        id: ord.id,
        orderId: ord.id,
        proposalId: ord.proposalId,
        title: relatedProp?.title || `Proposal Order #${ord.id.slice(-6)}`,
        clientName: relatedProp?.clientName || null,
        planId: planCfg.id,
        planName: planCfg.name,
        amountRupees: ord.amountPaise / 100,
        status: isPaid ? "paid" : "pending",
        isPaid,
        slug: relatedProp?.slug || ord.proposalId || null,
        utr: ord.utr,
        createdAt: ord.createdAt.toISOString(),
      });
    }

    // Add proposals that haven't been linked to an order yet (drafts/previews)
    for (const prop of userProps) {
      if (seenProposalIds.has(prop.id) || (prop.slug && seenProposalIds.has(prop.slug))) {
        continue;
      }

      const planCfg = getPlanConfig(prop.plan);
      const content = (prop.content as Record<string, unknown>) || {};
      const isPaid = Boolean(content.isPaid || prop.status === "final");

      items.push({
        id: prop.id,
        proposalId: prop.id,
        title: prop.title,
        clientName: prop.clientName,
        planId: planCfg.id,
        planName: planCfg.name,
        amountRupees: planCfg.priceInRupees,
        status: isPaid ? "paid" : "pending",
        isPaid,
        slug: prop.slug || prop.id,
        utr: null,
        createdAt: prop.createdAt.toISOString(),
      });
    }

    const totalCount = items.length;
    const paidCount = items.filter((i) => i.isPaid).length;
    const pendingCount = items.filter((i) => !i.isPaid).length;
    const totalSpentRupees = items
      .filter((i) => i.isPaid)
      .reduce((sum, i) => sum + i.amountRupees, 0);

    return apiSuccess({
      items,
      totalCount,
      paidCount,
      pendingCount,
      totalSpentRupees,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
