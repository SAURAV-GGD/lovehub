import { NextRequest } from "next/server";
import { db } from "@/db";
import { proposalResponses, proposals } from "@/db/schema";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { eq, or, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { getAdminSessionFromRequest } from "@/lib/admin-auth";
import { rateLimit } from "@/lib/rate-limit";

interface Params {
  params: Promise<{ id: string }>;
}

// In-memory fallback if database query encounters transient connection issue
const responseCache = new Map<string, Array<{ id: string; proposalId: string; eventType: string; payload: any; createdAt: Date }>>();

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    if (!id) {
      return apiError("Proposal ID is required", "BAD_REQUEST", 400);
    }

    // Rate Limiting Protection (20 submissions per minute per IP)
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown-ip";
    const limit = rateLimit(`resp_submit:${ip}`, { interval: 60000, maxRequests: 20 });
    if (!limit.success) {
      return apiError("Too many responses submitted. Please wait a minute.", "RATE_LIMITED", 429);
    }

    const body = await request.json().catch(() => ({}));
    const eventType = typeof body.eventType === "string" ? body.eventType.trim().slice(0, 50) : "response";
    
    // Validate payload size (prevent oversized storage attacks)
    const payload = (body.payload && typeof body.payload === "object") ? body.payload : {};
    if (JSON.stringify(payload).length > 20000) {
      return apiError("Response payload exceeds maximum allowed size", "BAD_REQUEST", 400);
    }

    const eventId = `resp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const newEntry = {
      id: eventId,
      proposalId: id,
      eventType,
      payload,
      createdAt: new Date(),
    };

    // Store in DB
    try {
      await db.insert(proposalResponses).values({
        id: eventId,
        proposalId: id,
        eventType,
        payload,
      });
    } catch {
      // Memory fallback if DB is temporarily unreachable
      const list = responseCache.get(id) || [];
      list.push(newEntry);
      responseCache.set(id, list);
    }

    return apiSuccess({
      success: true,
      logged: true,
      eventId,
      eventType,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    if (!id) {
      return apiError("Proposal ID is required", "BAD_REQUEST", 400);
    }

    // 1. Identify User or Admin Session
    let authenticatedUserId: string | null = null;
    let isAdmin = false;
    try {
      const userSession = await auth.api.getSession({ headers: request.headers });
      if (userSession?.user?.id) {
        authenticatedUserId = userSession.user.id;
      }
    } catch {}

    if (!authenticatedUserId) {
      const adminSession = getAdminSessionFromRequest(request);
      if (adminSession?.email) {
        isAdmin = true;
        authenticatedUserId = `admin-${adminSession.email.split("@")[0]}`;
      }
    }

    if (!authenticatedUserId) {
      return apiError("Authentication required to view private proposal responses", "UNAUTHORIZED", 401);
    }

    // 2. Verify ownership unless administrator
    if (!isAdmin) {
      let proposalOwnerId: string | null = null;
      try {
        const [prop] = await db
          .select({ userId: proposals.userId })
          .from(proposals)
          .where(or(eq(proposals.id, id), eq(proposals.slug, id)));
        if (prop) {
          proposalOwnerId = prop.userId;
        }
      } catch {}

      if (!proposalOwnerId) {
        const { getProposalByIdOrSlug } = await import("@/lib/admin-store");
        const storeProp = await getProposalByIdOrSlug(id);
        if (storeProp) {
          proposalOwnerId = (storeProp as any).userId;
        }
      }

      if (proposalOwnerId && proposalOwnerId !== authenticatedUserId) {
        return apiError("You do not have permission to view responses for this proposal", "FORBIDDEN", 403);
      }
    }

    // 3. Return responses
    try {
      const records = await db
        .select()
        .from(proposalResponses)
        .where(eq(proposalResponses.proposalId, id))
        .orderBy(desc(proposalResponses.createdAt));

      if (records && records.length > 0) {
        return apiSuccess(records);
      }
    } catch {
      // Fallback to cache below
    }

    const cached = responseCache.get(id) || [];
    return apiSuccess(cached);
  } catch (err) {
    return handleApiError(err);
  }
}
