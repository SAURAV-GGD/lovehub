import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { proposals } from "@/db/schema";
import { proposalSchema } from "@/lib/validators";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { eq, or } from "drizzle-orm";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: request.headers });

    const [proposal] = await db
      .select()
      .from(proposals)
      .where(or(eq(proposals.id, id), eq(proposals.slug, id)));

    if (!proposal) {
      return apiError("Proposal not found", "NOT_FOUND", 404);
    }

    // Public proposals can be viewed by anyone (e.g. the recipient)
    if (proposal.isPublic) {
      return apiSuccess(proposal);
    }

    // Private proposals require authentication and ownership
    if (!session?.user || session.user.id !== proposal.userId) {
      return apiError("Proposal is private", "FORBIDDEN", 403);
    }

    return apiSuccess(proposal);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return apiError("Unauthorized", "UNAUTHORIZED", 401);
    }

    const [existing] = await db
      .select()
      .from(proposals)
      .where(eq(proposals.id, id));

    if (!existing) {
      return apiError("Proposal not found", "NOT_FOUND", 404);
    }

    if (existing.userId !== session.user.id) {
      return apiError("You do not have permission to edit this proposal", "FORBIDDEN", 403);
    }

    const body = await request.json();
    const validated = proposalSchema.partial().parse(body);

    const [updated] = await db
      .update(proposals)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(eq(proposals.id, id))
      .returning();

    return apiSuccess(updated);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return apiError("Unauthorized", "UNAUTHORIZED", 401);
    }

    const [existing] = await db
      .select()
      .from(proposals)
      .where(eq(proposals.id, id));

    if (!existing) {
      return apiError("Proposal not found", "NOT_FOUND", 404);
    }

    if (existing.userId !== session.user.id) {
      return apiError("You do not have permission to delete this proposal", "FORBIDDEN", 403);
    }

    await db.delete(proposals).where(eq(proposals.id, id));
    return apiSuccess({ deleted: true, id });
  } catch (err) {
    return handleApiError(err);
  }
}
