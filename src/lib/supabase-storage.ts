import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { logger } from "./logger";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_FILE_SIZE_BYTES,
  getFileExtension,
} from "./cloudflare-r2";

export interface SupabaseStorageConfig {
  url: string;
  key: string;
  bucket: string;
}

export function getSupabaseStorageConfig(): SupabaseStorageConfig {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "";
  const bucket =
    process.env.SUPABASE_STORAGE_BUCKET ||
    "proposal-photos";

  return { url: url.trim().replace(/\/$/, ""), key: key.trim(), bucket: bucket.trim() };
}

export function isSupabaseStorageConfigured(): boolean {
  const cfg = getSupabaseStorageConfig();
  return Boolean(cfg.url && cfg.key && cfg.bucket);
}

let supabaseClientInstance: SupabaseClient | null = null;

export function getSupabaseStorageClient(): SupabaseClient {
  if (supabaseClientInstance) return supabaseClientInstance;
  const cfg = getSupabaseStorageConfig();

  if (!isSupabaseStorageConfigured()) {
    throw new Error(
      "Supabase Storage is not configured. Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  supabaseClientInstance = createClient(cfg.url, cfg.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseClientInstance;
}

export interface UploadToSupabaseInput {
  buffer: Buffer | Uint8Array;
  mimeType: string;
  originalName?: string;
  folder?: "proposals" | "birthdays" | "avatars" | "uploads";
  userId?: string;
  proposalId?: string;
}

export interface UploadToSupabaseResult {
  url: string;
  key: string;
  bucket: string;
  size: number;
  mimeType: string;
  isMock?: boolean;
}

/**
 * Uploads a user photo or media buffer to Supabase Storage bucket.
 * Guarantees persistent cloud CDN storage with public read access.
 */
export async function uploadToSupabaseStorage(
  input: UploadToSupabaseInput
): Promise<UploadToSupabaseResult> {
  const { buffer, mimeType, originalName, folder = "proposals", userId, proposalId } = input;

  if (buffer.length > MAX_IMAGE_FILE_SIZE_BYTES) {
    throw new Error(
      `File size exceeds maximum allowed size of 10MB (${(buffer.length / (1024 * 1024)).toFixed(1)}MB)`
    );
  }

  const normalizedMime = mimeType.toLowerCase();
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(normalizedMime)) {
    throw new Error(
      `Unsupported image type "${mimeType}". Allowed: ${ALLOWED_IMAGE_MIME_TYPES.join(", ")}`
    );
  }

  const cfg = getSupabaseStorageConfig();
  const supabase = getSupabaseStorageClient();
  const ext = getFileExtension(normalizedMime, originalName);
  const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "");
  const safeUserId = (userId || "guest").replace(/[^a-zA-Z0-9_-]/g, "");
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 10);

  const key = proposalId
    ? `${safeFolder}/${safeUserId}/${proposalId.replace(/[^a-zA-Z0-9_-]/g, "")}/${timestamp}-${randomSuffix}.${ext}`
    : `${safeFolder}/${safeUserId}/${timestamp}-${randomSuffix}.${ext}`;

  // 1. Attempt upload to configured bucket
  const fileBody = buffer instanceof Buffer ? buffer : Buffer.from(buffer);
  const { error: uploadError } = await supabase.storage
    .from(cfg.bucket)
    .upload(key, fileBody, {
      contentType: normalizedMime,
      upsert: true,
      cacheControl: "31536000",
    });

  if (uploadError) {
    // If bucket does not exist, attempt to auto-create it with public access enabled
    if (uploadError.message?.toLowerCase().includes("bucket not found")) {
      logger.info(`Bucket "${cfg.bucket}" not found. Attempting auto-creation...`);
      const { error: createBucketErr } = await supabase.storage.createBucket(cfg.bucket, {
        public: true,
        fileSizeLimit: "10MB",
        allowedMimeTypes: ALLOWED_IMAGE_MIME_TYPES,
      });

      if (!createBucketErr) {
        // Retry upload once after bucket creation
        const { error: retryErr } = await supabase.storage
          .from(cfg.bucket)
          .upload(key, fileBody, {
            contentType: normalizedMime,
            upsert: true,
            cacheControl: "31536000",
          });

        if (retryErr) {
          logger.error("Supabase storage upload failed after bucket creation", {
            error: retryErr.message,
            key,
          });
          throw new Error(`Supabase upload error: ${retryErr.message}`);
        }
      } else {
        logger.error("Supabase bucket auto-creation failed", {
          error: createBucketErr.message,
        });
        throw new Error(`Supabase bucket error: ${createBucketErr.message}`);
      }
    } else {
      logger.error("Supabase storage upload error", {
        error: uploadError.message,
        key,
      });
      throw new Error(`Supabase upload error: ${uploadError.message}`);
    }
  }

  // 2. Retrieve public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(cfg.bucket).getPublicUrl(key);

  logger.info("Successfully uploaded picture to Supabase Storage", {
    url: publicUrl,
    key,
    bucket: cfg.bucket,
    size: buffer.length,
  });

  return {
    url: publicUrl,
    key,
    bucket: cfg.bucket,
    size: buffer.length,
    mimeType: normalizedMime,
    isMock: false,
  };
}

/**
 * Deletes a picture from Supabase Storage by its key or public URL.
 */
export async function deleteFromSupabaseStorage(urlOrKey: string): Promise<boolean> {
  if (!isSupabaseStorageConfigured() || !urlOrKey) return false;

  try {
    const cfg = getSupabaseStorageConfig();
    const supabase = getSupabaseStorageClient();

    let storageKey = urlOrKey;
    if (urlOrKey.startsWith("http")) {
      // e.g. https://<ref>.supabase.co/storage/v1/object/public/<bucket>/<path>
      const bucketPattern = new RegExp(`/storage/v1/object/(?:public/)?${cfg.bucket}/(.+)$`);
      const match = urlOrKey.match(bucketPattern);
      if (match && match[1]) {
        storageKey = decodeURIComponent(match[1]);
      }
    }

    const { error } = await supabase.storage.from(cfg.bucket).remove([storageKey]);
    if (error) {
      logger.warn("Supabase storage deletion error (non-fatal)", {
        error: error.message,
        storageKey,
      });
      return false;
    }

    logger.info("Successfully deleted picture from Supabase Storage", { storageKey });
    return true;
  } catch (err) {
    logger.warn("Supabase storage delete failed", { err });
    return false;
  }
}
