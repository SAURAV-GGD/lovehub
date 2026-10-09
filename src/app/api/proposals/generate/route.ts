import { NextRequest } from "next/server";
import { generateProposalSchema } from "@/lib/validators";
import { generateProposal } from "@/lib/ai/generate";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rate = rateLimit(`gen_${ip}`, { interval: 60000, maxRequests: 10 });
    if (!rate.success) {
      return apiError(
        "Too many generation requests. Please wait a moment.",
        "RATE_LIMITED",
        429
      );
    }

    const body = await request.json();
    const validated = generateProposalSchema.parse(body);

    const generated = await generateProposal(validated);
    return apiSuccess(generated);
  } catch (err) {
    return handleApiError(err);
  }
}
