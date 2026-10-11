import { NextRequest, NextResponse } from "next/server";
import {
  validateAdminCredentials,
  createAdminSession,
  setAdminCookie,
  clearAdminCookie,
  getAdminSessionFromRequest,
  DEFAULT_ADMIN_EMAIL,
} from "@/lib/admin-auth";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
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
    const response = NextResponse.json(
      apiSuccess({
        user: {
          id: session.id,
          name: session.name,
          email: session.email,
          role: session.role,
        },
      })
    );

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

  return NextResponse.json(
    apiSuccess({
      user: {
        id: session.id,
        name: session.name,
        email: session.email,
        role: session.role,
      },
      defaultAdminEmail: DEFAULT_ADMIN_EMAIL,
    })
  );
}

export async function DELETE() {
  const response = NextResponse.json(apiSuccess({ message: "Admin signed out successfully" }));
  clearAdminCookie(response);
  return response;
}
