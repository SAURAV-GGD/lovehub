import { NextRequest } from "next/server";
import { getAdminSessionFromRequest } from "@/lib/admin-auth";
import {
  getAdminBirthdays,
  createAdminBirthday,
  deleteAdminBirthday,
} from "@/lib/admin-store";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const session = getAdminSessionFromRequest(request);
  if (!session) {
    return apiError("Unauthorized: Admin access required", "UNAUTHORIZED", 401);
  }

  const list = await getAdminBirthdays();
  return apiSuccess(list);
}

export async function POST(request: NextRequest) {
  const session = getAdminSessionFromRequest(request);
  if (!session) {
    return apiError("Unauthorized: Admin access required", "UNAUTHORIZED", 401);
  }

  try {
    const body = await request.json();
    if (!body.personName || !body.message) {
      return apiError("Person name and message are required", "VALIDATION_ERROR", 400);
    }

    const created = await createAdminBirthday({
      personName: body.personName,
      birthDate: body.birthDate,
      relationship: body.relationship || "friend",
      message: body.message,
      tone: body.tone || "celebratory",
      language: body.language || "english",
      photos: Array.isArray(body.photos) ? body.photos : [],
      photoCaptions: Array.isArray(body.photoCaptions) ? body.photoCaptions : [],
      music: body.music || "birthday-cheer",
      customSlug: body.customSlug || body.slug,
      createdByAdmin: true,
      userId: session.id,
      customConfig: body.customConfig || {
        enableConfetti: true,
        enableBalloons: true,
        enableCandles: true,
        vipBadge: "Executive VIP Bespoke Birthday Edition",
      },
    });

    return apiSuccess(created, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create birthday page";
    return apiError(message, "INTERNAL_ERROR", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const session = getAdminSessionFromRequest(request);
  if (!session) {
    return apiError("Unauthorized: Admin access required", "UNAUTHORIZED", 401);
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return apiError("Birthday ID is required", "VALIDATION_ERROR", 400);
  }

  await deleteAdminBirthday(id);
  return apiSuccess({ deleted: true, id });
}
