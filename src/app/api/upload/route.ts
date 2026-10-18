import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminSessionFromRequest } from "@/lib/admin-auth";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";
import {
  uploadToR2,
  deleteFromR2,
  isR2Configured,
  getR2Config,
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_FILE_SIZE_BYTES,
} from "@/lib/cloudflare-r2";

/**
 * GET /api/upload
 * Returns status and configuration parameters of Cloudflare R2 storage.
 */
export async function GET() {
  const cfg = getR2Config();
  const configured = isR2Configured();

  return apiSuccess({
    provider: "Cloudflare R2",
    isConfigured: configured,
    bucketName: cfg.bucketName,
    publicDomain: cfg.publicDomain || null,
    maxSizeBytes: MAX_IMAGE_FILE_SIZE_BYTES,
    maxSizeMB: MAX_IMAGE_FILE_SIZE_BYTES / (1024 * 1024),
    allowedMimeTypes: ALLOWED_IMAGE_MIME_TYPES,
  });
}

/**
 * POST /api/upload
 * Uploads one or more user pictures to Cloudflare R2.
 * Supports both multipart/form-data (Files) and application/json (Base64 data URIs).
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting Protection (50 uploads per minute per IP)
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown-ip";
    const limit = rateLimit(`upload:${ip}`, { interval: 60000, maxRequests: 50 });
    if (!limit.success) {
      return apiError("Too many uploads. Please wait a minute and try again.", "RATE_LIMITED", 429);
    }

    // 2. Identify User or Admin Session
    let userId = "guest";
    try {
      const userSession = await auth.api.getSession({ headers: request.headers });
      if (userSession?.user?.id) {
        userId = userSession.user.id;
      } else {
        const adminSession = getAdminSessionFromRequest(request);
        if (adminSession?.email) {
          userId = `admin-${adminSession.email.split("@")[0]}`;
        }
      }
    } catch {
      // Allow guest uploads during draft proposal creation
    }

    const contentType = request.headers.get("content-type") || "";

    // 3. Handle multipart/form-data
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const folder = (formData.get("folder") as string) || "proposals";
      const proposalId = (formData.get("proposalId") as string) || undefined;

      // Extract all file entries
      const files: File[] = [];
      const singleFile = formData.get("file") || formData.get("photo");
      if (singleFile instanceof File) {
        files.push(singleFile);
      }

      const allFiles = formData.getAll("files");
      for (const f of allFiles) {
        if (f instanceof File && !files.includes(f)) {
          files.push(f);
        }
      }

      if (files.length === 0) {
        return apiError("No image files provided in form-data", "VALIDATION_ERROR", 400);
      }

      const results = [];
      for (const file of files) {
        if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
          return apiError(
            `File "${file.name}" exceeds the 10MB size limit (${(file.size / (1024 * 1024)).toFixed(1)}MB)`,
            "FILE_TOO_LARGE",
            400
          );
        }

        const mime = file.type.toLowerCase();
        if (!ALLOWED_IMAGE_MIME_TYPES.includes(mime)) {
          return apiError(
            `Unsupported file type "${file.type}". Allowed types: JPEG, PNG, WebP, GIF, AVIF, HEIC`,
            "UNSUPPORTED_MEDIA_TYPE",
            415
          );
        }

        const arrayBuf = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuf);

        const uploaded = await uploadToR2({
          buffer,
          mimeType: mime,
          originalName: file.name,
          folder: folder as any,
          userId,
          proposalId,
        });

        results.push(uploaded);
      }

      return apiSuccess(results.length === 1 ? results[0] : results, 201);
    }

    // 4. Handle application/json (Base64 data URI)
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const { image, images, folder = "proposals", filename, proposalId } = body;

      const rawImages: string[] = [];
      if (typeof image === "string") {
        rawImages.push(image);
      }
      if (Array.isArray(images)) {
        for (const img of images) {
          if (typeof img === "string") rawImages.push(img);
        }
      }

      if (rawImages.length === 0) {
        return apiError("Missing 'image' or 'images' in JSON body", "VALIDATION_ERROR", 400);
      }

      const results = [];
      for (let i = 0; i < rawImages.length; i++) {
        const item = rawImages[i];
        let mimeType = "image/jpeg";
        let buffer: Buffer;

        // Check if data URL
        const dataUrlMatch = item.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (dataUrlMatch) {
          mimeType = dataUrlMatch[1].toLowerCase();
          buffer = Buffer.from(dataUrlMatch[2], "base64");
        } else {
          // Raw base64 string
          buffer = Buffer.from(item, "base64");
        }

        if (buffer.length > MAX_IMAGE_FILE_SIZE_BYTES) {
          return apiError(
            `Image exceeds the 10MB size limit (${(buffer.length / (1024 * 1024)).toFixed(1)}MB)`,
            "FILE_TOO_LARGE",
            400
          );
        }

        if (!ALLOWED_IMAGE_MIME_TYPES.includes(mimeType)) {
          return apiError(
            `Unsupported file type "${mimeType}". Allowed types: JPEG, PNG, WebP, GIF, AVIF, HEIC`,
            "UNSUPPORTED_MEDIA_TYPE",
            415
          );
        }

        const uploaded = await uploadToR2({
          buffer,
          mimeType,
          originalName: filename || `photo-${i + 1}`,
          folder: folder as any,
          userId,
          proposalId,
        });

        results.push(uploaded);
      }

      return apiSuccess(results.length === 1 ? results[0] : results, 201);
    }

    return apiError(
      "Unsupported Content-Type. Please use multipart/form-data or application/json",
      "BAD_REQUEST",
      400
    );
  } catch (err) {
    return handleApiError(err);
  }
}

/**
 * DELETE /api/upload
 * Deletes an object from Cloudflare R2.
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let keyOrUrl = searchParams.get("key") || searchParams.get("url");

    if (!keyOrUrl && request.headers.get("content-type")?.includes("application/json")) {
      const body = await request.json().catch(() => ({}));
      keyOrUrl = body.key || body.url;
    }

    if (!keyOrUrl) {
      return apiError("Missing 'key' or 'url' to delete", "VALIDATION_ERROR", 400);
    }

    const result = await deleteFromR2(keyOrUrl);
    return apiSuccess({ deleted: true, key: result.key });
  } catch (err) {
    return handleApiError(err);
  }
}
