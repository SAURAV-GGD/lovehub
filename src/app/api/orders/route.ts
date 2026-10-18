import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { listOrdersForUser } from "@/lib/orders";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return apiSuccess([]);
    }

    const orders = await listOrdersForUser(session.user.id);
    return apiSuccess(orders);
  } catch (err) {
    return handleApiError(err);
  }
}
