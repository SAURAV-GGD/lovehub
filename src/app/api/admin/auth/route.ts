import { NextRequest } from "next/server";
import {
  validateAdminCredentials,
  createAdminSession,
  setAdminCookie,
  clearAdminCookie,
  getAdminSessionFromRequest,
  DEFAULT_ADMIN_EMAIL,
} from "@/lib/admin-auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    // Rate Limiting: Maximum 5 attempts per minute per IP to mitigate brute-force
    const limit = rateLimit(`admin_auth:${ip}`, { interval: 60000, maxRequests: 5 });
    if (!limit.success) {
      return apiError(
        "Too many login attempts. Please wait a minute and try again.",
        "RATE_LIMITED",
        429
      );
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return apiError("Email and password are required", "VALIDATION_ERROR", 400);
    }

    const isValid = validateAdminCredentials(email, password);
    if (!isValid) {
      return apiError("Invalid administrator credentials", "INVALID_CREDENTIALS", 401);
    }

    const { session, token } = createAdminSession(email);
    const response = apiSuccess({
      user: {
        id: session.id,
        name: session.name,
        email: session.email,
        role: session.role,
      },
    });

    setAdminCookie(response, token);
    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to authenticate admin";
    return apiError(message, "INTERNAL_ERROR", 500);
  }
}

export async function GET(request: NextRequest) {
  const session = getAdminSessionFromRequest(request);
  if (!session) {
    return apiError("Not authenticated as administrator", "UNAUTHORIZED", 401);
  }

  return apiSuccess({
    user: {
      id: session.id,
      name: session.name,
      email: session.email,
      role: session.role,
    },
    defaultAdminEmail: DEFAULT_ADMIN_EMAIL,
  });
}

export async function DELETE() {
  const response = apiSuccess({ message: "Admin signed out successfully" });
  clearAdminCookie(response);
  return response;
}
