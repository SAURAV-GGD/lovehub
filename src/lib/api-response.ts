import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { logger } from "./logger";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  details?: unknown;
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json<ApiResponse<T>>(
    {
      success: true,
      data,
    },
    { status }
  );
}

export function apiError(
  message: string,
  code = "BAD_REQUEST",
  status = 400,
  details?: unknown
) {
  logger.warn(`API Error response: [${code}] ${message}`, { status, details });
  return NextResponse.json<ApiResponse>(
    {
      success: false,
      error: message,
      code,
      details,
    },
    { status }
  );
}

export function handleApiError(err: unknown) {
  if (err instanceof ZodError) {
    const formatted = err.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
    return apiError("Validation failed", "VALIDATION_ERROR", 422, formatted);
  }

  logger.error("Unhandled API error", err);
  const message = err instanceof Error ? err.message : "Internal Server Error";
  return apiError(message, "INTERNAL_ERROR", 500);
}
