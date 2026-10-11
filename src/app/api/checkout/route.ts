import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { checkoutSchema } from "@/lib/validators";
import { PLAN_PRICING } from "@/lib/payments";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return apiError("Please sign in to proceed with checkout", "UNAUTHORIZED", 401);
    }

    const body = await request.json();
    const validated = checkoutSchema.parse(body);

    const planConfig = PLAN_PRICING[validated.plan as keyof typeof PLAN_PRICING];
    if (!planConfig) {
      return apiError("Invalid plan selected", "BAD_REQUEST", 400);
    }

    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    // Cashfree Payment Gateway will be hooked up here
    // For now, allow direct upgrade / redirect to create
    const redirectUrl = `${origin}/create?plan=${validated.plan}&upgraded=true`;

    return apiSuccess({ url: redirectUrl, plan: validated.plan });
  } catch (err) {
    return handleApiError(err);
  }
}
