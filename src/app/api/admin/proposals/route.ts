import { NextRequest } from "next/server";
import { getAdminSessionFromRequest } from "@/lib/admin-auth";
import {
  getAdminProposals,
  createAdminProposal,
  deleteAdminProposal,
  CreateAdminProposalInput,
} from "@/lib/admin-store";
import { apiSuccess, apiError } from "@/lib/api-response";
import { PlanType } from "@/lib/proposal-types";

export async function GET(request: NextRequest) {
  const session = getAdminSessionFromRequest(request);
  if (!session) {
    return apiError("Unauthorized: Admin credentials required", "UNAUTHORIZED", 401);
  }

  try {
    const { searchParams } = new URL(request.url);
    const clientEmail = searchParams.get("clientEmail") || undefined;
    const plan = searchParams.get("plan") || undefined;
    const search = searchParams.get("search") || undefined;

    const list = await getAdminProposals({ clientEmail, plan, search });
    return apiSuccess(list);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load proposals";
    return apiError(msg, "INTERNAL_ERROR", 500);
  }
}

export async function POST(request: NextRequest) {
  const session = getAdminSessionFromRequest(request);
  if (!session) {
    return apiError("Unauthorized: Admin credentials required", "UNAUTHORIZED", 401);
  }

  try {
    const body = await request.json();

    if (!body.yourName || !body.partnerName || !body.message) {
      return apiError(
        "Sender name (yourName), partner name, and message are required",
        "VALIDATION_ERROR",
        400
      );
    }

    const plan: PlanType = (body.plan || "custom") as PlanType;

    const input: CreateAdminProposalInput = {
      title: body.title,
      clientName: body.partnerName,
      assignedClientId: body.assignedClientId,
      assignedClientEmail: body.assignedClientEmail,
      assignedClientName: body.assignedClientName,
      plan,
      yourName: body.yourName,
      partnerName: body.partnerName,
      relationshipType: body.relationshipType || "girlfriend",
      tone: body.tone || "deep-romantic",
      language: body.language || "english",
      message: body.message,
      photos: body.photos || [],
      photoCaptions: body.photoCaptions || [],
      backgroundMusic: body.backgroundMusic || "romantic-piano",
      customSlug: body.customSlug,
      customConfig: body.customConfig || {},
      storyConfig: body.storyConfig,
      status: body.status || "final",
      isPublic: body.isPublic !== false,
    };

    const created = await createAdminProposal(input);
    return apiSuccess(created, 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create admin proposal";
    return apiError(msg, "INTERNAL_ERROR", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const session = getAdminSessionFromRequest(request);
  if (!session) {
    return apiError("Unauthorized: Admin credentials required", "UNAUTHORIZED", 401);
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return apiError("Proposal ID is required", "VALIDATION_ERROR", 400);
    }

    await deleteAdminProposal(id);
    return apiSuccess({ deleted: true, id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete proposal";
    return apiError(msg, "INTERNAL_ERROR", 500);
  }
}
