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
import { uploadToImgBB } from "@/lib/imgbb";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  isCloudinaryConfigured,
  getCloudinaryConfig,
} from "@/lib/cloudinary";

/**
 * GET /api/upload
 * Returns status and configuration parameters of storage providers.
 */
export async function GET() {
  const r2Cfg = getR2Config();
  const cldCfg = getCloudinaryConfig();
  const r2Configured = isR2Configured();
  const cldConfigured = isCloudinaryConfigured();
  const imgbbConfigured = Boolean(process.env.IMGBB_API_KEY);

  let activeProvider = "In-App Database Storage";
  if (cldConfigured) {
    activeProvider = "Cloudinary";
  } else if (r2Configured) {
    activeProvider = "Cloudflare R2";
  } else if (imgbbConfigured) {
    activeProvider = "ImgBB";
  }

  return apiSuccess({
    provider: activeProvider,
    cloudinary: {
      isConfigured: cldConfigured,
      cloudName: cldCfg.cloudName || null,
    },
    cloudflareR2: {
      isConfigured: r2Configured,
      bucketName: r2Cfg.bucketName,
      publicDomain: r2Cfg.publicDomain || null,
    },
    imgbb: {
      isConfigured: imgbbConfigured,
    },
    maxSizeBytes: MAX_IMAGE_FILE_SIZE_BYTES,
    maxSizeMB: MAX_IMAGE_FILE_SIZE_BYTES / (1024 * 1024),
    allowedMimeTypes: ALLOWED_IMAGE_MIME_TYPES,
  });
}

async function uploadMedia(params: {
  buffer: Buffer;
  mimeType: string;
  originalName?: string;
  folder?: "proposals" | "birthdays" | "avatars" | "uploads";
  userId?: string;
  proposalId?: string;
}) {
  // 1. Cloudinary (Enterprise Free 25GB CDN)
  if (isCloudinaryConfigured()) {
    try {
      const cldResult = await uploadToCloudinary(
        params.buffer,
        params.folder || "proposals",
        params.originalName
      );
      return {
        url: cldResult.url,
        key: cldResult.publicId,
        bucket: "cloudinary",
        size: cldResult.bytes || params.buffer.length,
        mimeType: params.mimeType,
        isMock: false,
      };
    } catch (cldErr) {
      console.warn("Cloudinary upload failed, falling back to secondary provider:", cldErr);
    }
  }

  // 2. Cloudflare R2 if credentials provided
  if (isR2Configured()) {
    return await uploadToR2(params);
  }

  // 3. ImgBB if API key provided
  if (process.env.IMGBB_API_KEY) {
    try {
      const imgbbResult = await uploadToImgBB(params.buffer, params.originalName);
      return {
        url: imgbbResult.url,
        key: `imgbb/${imgbbResult.url.split("/").pop()}`,
        bucket: "imgbb",
        size: params.buffer.length,
        mimeType: params.mimeType,
        isMock: false,
      };
    } catch (imgbbErr) {
      console.warn("ImgBB upload error, falling back to local storage:", imgbbErr);
    }
  }

  // 4. Resilient Fallback
  return await uploadToR2(params);
}

/**
 * POST /api/upload
 * Uploads one or more user pictures. Supports Cloudflare R2, ImgBB, and resilient database storage.
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

        const uploaded = await uploadMedia({
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

        const uploaded = await uploadMedia({
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
    // 1. Rate Limiting Protection (20 deletes per minute per IP)
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown-ip";
    const limit = rateLimit(`upload_delete:${ip}`, { interval: 60000, maxRequests: 20 });
    if (!limit.success) {
      return apiError("Too many delete requests. Please wait a minute and try again.", "RATE_LIMITED", 429);
    }

    const { searchParams } = new URL(request.url);
    let keyOrUrl = searchParams.get("key") || searchParams.get("url");

    if (!keyOrUrl && request.headers.get("content-type")?.includes("application/json")) {
      const body = await request.json().catch(() => ({}));
      keyOrUrl = body.key || body.url;
    }

    if (!keyOrUrl) {
      return apiError("Missing 'key' or 'url' to delete", "VALIDATION_ERROR", 400);
    }

    // 2. Identify Caller Session
    let authenticatedUserId: string | null = null;
    let isAdmin = false;
    try {
      const userSession = await auth.api.getSession({ headers: request.headers });
      if (userSession?.user?.id) {
        authenticatedUserId = userSession.user.id;
      }
    } catch {}

    if (!authenticatedUserId) {
      const adminSession = getAdminSessionFromRequest(request);
      if (adminSession?.email) {
        isAdmin = true;
        authenticatedUserId = `admin-${adminSession.email.split("@")[0]}`;
      }
    }

    // 3. Ownership / Authorization Validation
    const isGuestKey =
      keyOrUrl.includes("/guest/") ||
      keyOrUrl.startsWith("guest/") ||
      keyOrUrl.includes("fallback/proposals/guest/");

    if (!isAdmin && !authenticatedUserId && !isGuestKey) {
      return apiError("Authentication required to delete non-guest media assets", "UNAUTHORIZED", 401);
    }

    if (authenticatedUserId && !isAdmin && !isGuestKey) {
      const ownsKey =
        keyOrUrl.includes(`/${authenticatedUserId}/`) ||
        keyOrUrl.includes(authenticatedUserId);

      if (!ownsKey) {
        return apiError("You do not have permission to delete this media asset", "FORBIDDEN", 403);
      }
    }

    if (keyOrUrl.includes("cloudinary.com") || (isCloudinaryConfigured() && !keyOrUrl.includes("r2.dev") && !keyOrUrl.includes("r2.cloudflarestorage"))) {
      await deleteFromCloudinary(keyOrUrl);
      return apiSuccess({ deleted: true, key: keyOrUrl });
    }

    const result = await deleteFromR2(keyOrUrl);
    return apiSuccess({ deleted: true, key: result.key });
  } catch (err) {
    return handleApiError(err);
  }
}
