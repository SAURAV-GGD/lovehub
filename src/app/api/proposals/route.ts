import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { proposals } from "@/db/schema";
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
    if (!session?.user) {
      return apiError("Please sign in to save your proposal", "UNAUTHORIZED", 401);
    }

    const body = await request.json();
    const validated = proposalSchema.parse(body);

    const proposalId = createId();
    const slug = validated.slug || createId();

    const [created] = await db
      .insert(proposals)
      .values({
        id: proposalId,
        userId: session.user.id,
        title: validated.title,
        clientName: validated.clientName || null,
        input: validated.input,
        content: validated.content,
        status: validated.status,
        isPublic: validated.isPublic,
        slug,
      })
      .returning();

    return apiSuccess(created, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
