import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { createAdminBirthday, getAdminBirthdays } from "@/lib/admin-store";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const all = await getAdminBirthdays();

    if (session?.user) {
      const userBirthdays = all.filter(
        (b) => b.userId === session.user.id || b.userEmail === session.user.email
      );
      return apiSuccess(userBirthdays);
    }

    return apiSuccess(all.filter((b) => b.status === "published").slice(0, 10));
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
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
      createdByAdmin: false,
      userId: session?.user?.id || "guest-member",
      customConfig: body.customConfig || {
        enableConfetti: true,
        enableBalloons: true,
        enableCandles: true,
        vipBadge: "Birthday Celebration",
      },
    });

    return apiSuccess(created, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
