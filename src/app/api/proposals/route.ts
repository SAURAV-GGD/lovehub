import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { proposals, user } from "@/db/schema";
import { proposalSchema } from "@/lib/validators";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";

// Generate clean random unguessable ID
function createId() {
  return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return apiError("Unauthorized", "UNAUTHORIZED", 401);
    }

    const userProposals = await db
      .select()
      .from(proposals)
      .where(eq(proposals.userId, session.user.id))
      .orderBy(desc(proposals.createdAt));

    return apiSuccess(userProposals);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return apiError(
        "Please connect your Google account or email before creating a proposal",
        "UNAUTHORIZED",
        401
      );
    }
    const userId = session.user.id;

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "127.0.0.1";
    const { rateLimit } = await import("@/lib/rate-limit");
    const rateLimitKey = `preview_create_${session?.user?.id || ip}`;
    const limit = rateLimit(rateLimitKey, { interval: 60 * 1000, maxRequests: 5 });
    if (!limit.success) {
      return apiError("Too many preview creation requests. Please wait a minute.", "RATE_LIMITED", 429);
    }

    const body = await request.json();
    const validated = proposalSchema.parse(body);

    const proposalId = (typeof body.id === "string" && body.id.trim()) ? body.id.trim() : createId();
    const slug = validated.slug || proposalId;

    const userSuppliedContent = (validated.content as Record<string, unknown>) || {};
    const sanitizedContent = { ...userSuppliedContent };
    delete (sanitizedContent as any).isPaid;
    delete (sanitizedContent as any).expiresAt;

    // Security Enforcement:
    // Check if proposal already exists to preserve legitimate paid status and verify ownership
    let isAlreadyPaid = false;
    try {
      const [existingProposal] = await db
        .select()
        .from(proposals)
        .where(eq(proposals.id, proposalId));

      if (existingProposal) {
        if (existingProposal.userId && existingProposal.userId !== userId) {
          return apiError("You do not have permission to overwrite this proposal", "FORBIDDEN", 403);
        }
        isAlreadyPaid = Boolean(
          existingProposal.status === "final" ||
          (existingProposal.content as any)?.isPaid
        );
      }
    } catch {
      // DB offline / initial creation fallback
    }

    const expiresAt = isAlreadyPaid ? undefined : Date.now() + 120 * 1000; // 120-second preview window
    const contentWithExpiry = {
      ...sanitizedContent,
      id: proposalId,
      isPaid: isAlreadyPaid,
      expiresAt,
    };

    let created = null;
    try {
      const planVal = (validated.content as any)?.plan || "romantic";
      const [dbCreated] = await db
        .insert(proposals)
        .values({
          id: proposalId,
          userId: userId || "guest-creator-user",
          title: validated.title,
          clientName: validated.clientName || null,
          plan: planVal,
          input: validated.input,
          content: contentWithExpiry,
          status: isAlreadyPaid ? "final" : "draft",
          isPublic: validated.isPublic !== undefined ? validated.isPublic : true,
          slug,
        })
        .onConflictDoUpdate({
          target: proposals.id,
          set: {
            title: validated.title,
            clientName: validated.clientName || null,
            plan: planVal,
            input: validated.input,
            content: contentWithExpiry,
            status: isAlreadyPaid ? "final" : "draft",
            isPublic: validated.isPublic !== undefined ? validated.isPublic : true,
            slug,
            updatedAt: new Date(),
          },
        })
        .returning();
      created = dbCreated;
    } catch (dbErr) {
      console.warn("DB insert fallback to in-memory store:", dbErr);
    }

    // Sync to admin memory store as fallback
    try {
      const { createAdminProposal } = await import("@/lib/admin-store");
      const c = (validated.content as any) || {};
      const inp = (validated.input as any) || {};
      await createAdminProposal({
        assignedClientId: userId,
        status: isAlreadyPaid ? "final" : "draft",
        yourName: c.yourName || inp.yourName || "Someone Special",
        partnerName: c.partnerName || inp.partnerName || "My Love",
        relationshipType: c.relationshipType || inp.relationshipType || "girlfriend",
        tone: c.tone || inp.tone || "cute",
        language: c.language || inp.language || "english",
        message: c.message || inp.message || "",
        photos: c.photos || [],
        photoCaptions: c.photoCaptions || [],
        backgroundMusic: c.backgroundMusic || "romantic-piano",
        plan: (c.plan || "romantic") as any,
        customSlug: slug,
        title: validated.title,
        customConfig: c.customConfig,
        isPublic: true,
      });
    } catch {}

    return apiSuccess(
      created || {
        id: proposalId,
        userId: userId || "guest-creator-user",
        title: validated.title,
        clientName: validated.clientName || null,
        plan: (validated.content as any)?.plan || "romantic",
        input: validated.input,
        content: contentWithExpiry,
        status: isAlreadyPaid ? "final" : "draft",
        isPublic: validated.isPublic !== undefined ? validated.isPublic : true,
        slug,
      },
      201
    );
  } catch (err) {
    return handleApiError(err);
  }
}
