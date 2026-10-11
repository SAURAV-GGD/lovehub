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
    
    // Resolve user ID: authenticated user or guest creator
    let userId = session?.user?.id;
    if (!userId) {
      const GUEST_ID = "guest-creator-user";
      try {
        const [existingGuest] = await db
          .select()
          .from(user)
          .where(eq(user.id, GUEST_ID))
          .limit(1);

        if (existingGuest) {
          userId = existingGuest.id;
        } else {
          const [newGuest] = await db
            .insert(user)
            .values({
              id: GUEST_ID,
              name: "LoveHub Guest",
              email: "guest@lovehub.in",
              role: "user",
            })
            .returning();
          userId = newGuest.id;
        }
      } catch {
        userId = GUEST_ID;
      }
    }

    const body = await request.json();
    const validated = proposalSchema.parse(body);

    const proposalId = createId();
    const slug = validated.slug || createId();

    let created = null;
    try {
      const [dbCreated] = await db
        .insert(proposals)
        .values({
          id: proposalId,
          userId: userId || "guest-creator-user",
          title: validated.title,
          clientName: validated.clientName || null,
          input: validated.input,
          content: validated.content,
          status: validated.status,
          isPublic: validated.isPublic,
          slug,
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

    return apiSuccess(created || { id: proposalId, slug, ...validated }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
