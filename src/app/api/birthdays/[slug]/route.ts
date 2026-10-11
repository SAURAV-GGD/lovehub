import { NextRequest } from "next/server";
import { getBirthdayBySlug } from "@/lib/admin-store";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return apiError("Missing slug parameter", "VALIDATION_ERROR", 400);
    }

    const birthday = await getBirthdayBySlug(slug);
    if (!birthday) {
      return apiError("Birthday page not found", "NOT_FOUND", 404);
    }

    return apiSuccess(birthday);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load birthday page";
    return apiError(message, "INTERNAL_ERROR", 500);
  }
}
