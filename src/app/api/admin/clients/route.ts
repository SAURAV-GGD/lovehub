import { NextRequest } from "next/server";
import { getAdminSessionFromRequest } from "@/lib/admin-auth";
import { getAdminClients, updateClientPlan, getAdminProposals } from "@/lib/admin-store";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const session = getAdminSessionFromRequest(request);
  if (!session) {
    return apiError("Unauthorized: Admin credentials required", "UNAUTHORIZED", 401);
  }

  try {
    const clients = await getAdminClients();
    return apiSuccess(clients);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load clients";
    return apiError(msg, "INTERNAL_ERROR", 500);
  }
}

export async function PATCH(request: NextRequest) {
  const session = getAdminSessionFromRequest(request);
  if (!session) {
    return apiError("Unauthorized: Admin credentials required", "UNAUTHORIZED", 401);
  }

  try {
    const body = await request.json();
    const { clientId, plan } = body;

    if (!clientId || !plan) {
      return apiError("clientId and plan are required", "VALIDATION_ERROR", 400);
    }

    await updateClientPlan(clientId, plan);
    return apiSuccess({ message: `Client plan updated to ${plan}` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update client plan";
    return apiError(msg, "INTERNAL_ERROR", 500);
  }
}
