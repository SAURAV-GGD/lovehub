import { NextRequest } from "next/server";
import { db } from "@/db";
import { proposalResponses, proposals } from "@/db/schema";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { eq, or, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";

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

    const body = await request.json().catch(() => ({}));
    const eventType = typeof body.eventType === "string" ? body.eventType.trim() : "response";
    const payload = (body.payload && typeof body.payload === "object") ? body.payload : {};

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

    // Try fetching from DB
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
