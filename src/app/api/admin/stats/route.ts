import { NextRequest } from "next/server";
import { getAdminSessionFromRequest } from "@/lib/admin-auth";
import { getAdminStats } from "@/lib/admin-store";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const session = getAdminSessionFromRequest(request);
  if (!session) {
    return apiError("Unauthorized: Admin credentials required", "UNAUTHORIZED", 401);
  }

  try {
    const stats = await getAdminStats();
    return apiSuccess(stats);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load admin stats";
    return apiError(msg, "INTERNAL_ERROR", 500);
  }
}
