import { NextRequest } from "next/server";
import { extractMemoriesSchema } from "@/lib/validators";
import { extractMemories } from "@/lib/ai/extract-memories";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rate = rateLimit(`extract_mem_${ip}`, { interval: 60000, maxRequests: 10 });
    if (!rate.success) {
      return apiError(
        "Too many extraction requests. Please wait a minute.",
        "RATE_LIMITED",
        429
      );
    }

    const body = await request.json();
    const validated = extractMemoriesSchema.parse(body);

    const result = await extractMemories(validated);
    return apiSuccess(result);
  } catch (err) {
    return handleApiError(err);
  }
}
