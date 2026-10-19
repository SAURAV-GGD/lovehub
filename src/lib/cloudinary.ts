import crypto from "crypto";
import { logger } from "./logger";

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

/**
 * Reads Cloudinary credentials strictly from server environment variables.
 * Never exposed to browser or client bundles.
 */
export function getCloudinaryConfig(): CloudinaryConfig {
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  };
}

/**
 * Returns true if Cloudinary credentials are fully present.
 */
export function isCloudinaryConfigured(): boolean {
  const cfg = getCloudinaryConfig();
  return Boolean(cfg.cloudName && cfg.apiKey && cfg.apiSecret);
}

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

/**
 * Uploads an image to Cloudinary using secure server-side authenticated REST API.
 * The api_secret never leaves the server.
 */
export async function uploadToCloudinary(
  imageBufferOrBase64: Buffer | string,
  folder = "proposals",
  originalName?: string
): Promise<CloudinaryUploadResult> {
  const cfg = getCloudinaryConfig();
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary credentials are not configured.");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "");

  // Signature calculation: sorted alphabetical parameters + api_secret
  const toSign = `folder=${safeFolder}&timestamp=${timestamp}${cfg.apiSecret}`;
  const signature = crypto.createHash("sha1").update(toSign).digest("hex");

  let filePayload: string;
  if (typeof imageBufferOrBase64 === "string") {
    filePayload = imageBufferOrBase64.startsWith("data:")
      ? imageBufferOrBase64
      : `data:image/jpeg;base64,${imageBufferOrBase64}`;
  } else {
    filePayload = `data:image/jpeg;base64,${imageBufferOrBase64.toString("base64")}`;
  }

  const formData = new URLSearchParams();
  formData.append("file", filePayload);
  formData.append("api_key", cfg.apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("folder", safeFolder);
  formData.append("signature", signature);

  const endpoint = `https://api.cloudinary.com/v1_1/${cfg.cloudName}/image/upload`;
  const res = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  const data = await res.json().catch(() => null);

  if (res.ok && data?.secure_url) {
    logger.info("Successfully uploaded image to Cloudinary", {
      publicId: data.public_id,
      url: data.secure_url,
      bytes: data.bytes,
    });
    return {
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
      format: data.format,
      bytes: data.bytes,
    };
  }

  const errorMsg = data?.error?.message || `Cloudinary upload failed: ${res.statusText}`;
  logger.warn("Cloudinary upload failed", { errorMsg, statusCode: res.status });
  throw new Error(errorMsg);
}

/**
 * Deletes an image from Cloudinary by public ID or full URL.
 */
export async function deleteFromCloudinary(publicIdOrUrl: string): Promise<boolean> {
  const cfg = getCloudinaryConfig();
  if (!isCloudinaryConfigured()) return true;

  let publicId = publicIdOrUrl.trim();
  if (publicId.startsWith("http://") || publicId.startsWith("https://")) {
    try {
      const parsed = new URL(publicId);
      // Example: /eo03hxje/image/upload/v1792376008/proposals/xyz.jpg
      const match = parsed.pathname.match(/\/image\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/);
      if (match && match[1]) {
        publicId = match[1];
      }
    } catch {}
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const toSign = `public_id=${publicId}&timestamp=${timestamp}${cfg.apiSecret}`;
  const signature = crypto.createHash("sha1").update(toSign).digest("hex");

  const formData = new URLSearchParams();
  formData.append("public_id", publicId);
  formData.append("api_key", cfg.apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);

  const endpoint = `https://api.cloudinary.com/v1_1/${cfg.cloudName}/image/destroy`;
  const res = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  const data = await res.json().catch(() => null);
  return Boolean(data?.result === "ok");
}
