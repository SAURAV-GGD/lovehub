import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getR2Config,
  isR2Configured,
  getFileExtension,
  uploadToR2,
  deleteFromR2,
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_FILE_SIZE_BYTES,
} from "../../src/lib/cloudflare-r2";
import { NextRequest } from "next/server";

describe("Cloudflare R2 Object Storage Backend", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  describe("Configuration & Environment", () => {
    it("reports not configured when credentials are missing", () => {
      delete process.env.R2_ACCOUNT_ID;
      delete process.env.R2_ACCESS_KEY_ID;
      delete process.env.R2_SECRET_ACCESS_KEY;
      delete process.env.CLOUDFLARE_ACCOUNT_ID;

      expect(isR2Configured()).toBe(false);
    });

    it("reports configured when all credentials are provided", () => {
      process.env.R2_ACCOUNT_ID = "mock_cf_account_123";
      process.env.R2_ACCESS_KEY_ID = "mock_r2_key_id";
      process.env.R2_SECRET_ACCESS_KEY = "mock_r2_secret_key";
      process.env.R2_BUCKET_NAME = "lovehub-photos";
      process.env.R2_PUBLIC_DOMAIN = "https://images.lovehub.in";

      expect(isR2Configured()).toBe(true);
      const config = getR2Config();
      expect(config.accountId).toBe("mock_cf_account_123");
      expect(config.accessKeyId).toBe("mock_r2_key_id");
      expect(config.bucketName).toBe("lovehub-photos");
      expect(config.publicDomain).toBe("https://images.lovehub.in");
    });

    it("sanitizes trailing slash on public domain", () => {
      process.env.R2_PUBLIC_DOMAIN = "https://pub-abc.r2.dev/";
      const config = getR2Config();
      expect(config.publicDomain).toBe("https://pub-abc.r2.dev");
    });
  });

  describe("File Extension & Validation Rules", () => {
    it("resolves extensions for common image formats", () => {
      expect(getFileExtension("image/jpeg")).toBe("jpg");
      expect(getFileExtension("image/png")).toBe("png");
      expect(getFileExtension("image/webp")).toBe("webp");
      expect(getFileExtension("image/gif")).toBe("gif");
      expect(getFileExtension("image/avif")).toBe("avif");
      expect(getFileExtension("image/heic")).toBe("heic");
    });

    it("preserves valid extension from original filename if provided", () => {
      expect(getFileExtension("image/jpeg", "our-first-date.jpeg")).toBe("jpeg");
      expect(getFileExtension("image/png", "sunset.png")).toBe("png");
    });

    it("defines 10MB as maximum image file size", () => {
      expect(MAX_IMAGE_FILE_SIZE_BYTES).toBe(10 * 1024 * 1024);
    });

    it("includes modern and standard web image formats in allowed list", () => {
      expect(ALLOWED_IMAGE_MIME_TYPES).toContain("image/jpeg");
      expect(ALLOWED_IMAGE_MIME_TYPES).toContain("image/png");
      expect(ALLOWED_IMAGE_MIME_TYPES).toContain("image/webp");
      expect(ALLOWED_IMAGE_MIME_TYPES).toContain("image/gif");
      expect(ALLOWED_IMAGE_MIME_TYPES).toContain("image/heic");
    });
  });

  describe("Upload & Resilience", () => {
    it("rejects files exceeding maximum file size", async () => {
      const oversizedBuffer = Buffer.alloc(MAX_IMAGE_FILE_SIZE_BYTES + 1024);
      await expect(
        uploadToR2({
          buffer: oversizedBuffer,
          mimeType: "image/jpeg",
          originalName: "huge.jpg",
        })
      ).rejects.toThrow(/exceeds maximum allowed size/);
    });

    it("rejects unsupported MIME types", async () => {
      const buffer = Buffer.from("not an image");
      await expect(
        uploadToR2({
          buffer,
          mimeType: "application/pdf",
          originalName: "document.pdf",
        })
      ).rejects.toThrow(/Unsupported image type/);
    });

    it("gracefully falls back to data URI mode in local/test environment without R2 credentials", async () => {
      delete process.env.R2_ACCOUNT_ID;
      delete process.env.R2_ACCESS_KEY_ID;
      delete process.env.R2_SECRET_ACCESS_KEY;

      const samplePixel = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");
      const result = await uploadToR2({
        buffer: samplePixel,
        mimeType: "image/gif",
        originalName: "pixel.gif",
        folder: "proposals",
        userId: "user_test_123",
      });

      expect(result.isMock).toBe(true);
      expect(result.url).toMatch(/^data:image\/gif;base64,/);
      expect(result.key).toContain("user_test_123");
      expect(result.mimeType).toBe("image/gif");
      expect(result.size).toBe(samplePixel.length);
    });
  });

  describe("Delete from R2", () => {
    it("handles deletion without errors even in fallback mode", async () => {
      delete process.env.R2_ACCOUNT_ID;
      const res = await deleteFromR2("fallback/proposals/user_123/sample.jpg");
      expect(res.success).toBe(true);
      expect(res.key).toBe("fallback/proposals/user_123/sample.jpg");
    });

    it("extracts object key when given a full public URL", async () => {
      delete process.env.R2_ACCOUNT_ID;
      const res = await deleteFromR2("https://images.lovehub.in/proposals/user_456/photo.jpg");
      expect(res.success).toBe(true);
      expect(res.key).toBe("proposals/user_456/photo.jpg");
    });
  });

  describe("API Endpoint /api/upload", () => {
    it("GET /api/upload returns storage capabilities", async () => {
      const { GET } = await import("../../src/app/api/upload/route");
      const res = await GET();
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.provider).toBeTruthy();
      expect(json.data.maxSizeMB).toBe(10);
      expect(Array.isArray(json.data.allowedMimeTypes)).toBe(true);
    });

    it("POST /api/upload accepts base64 payload in application/json", async () => {
      const { POST } = await import("../../src/app/api/upload/route");
      const req = new NextRequest("http://localhost:3000/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
          filename: "test-heart.png",
          folder: "proposals",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(201);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.url).toBeTruthy();
      expect(json.data.mimeType).toBe("image/png");
    });

    it("POST /api/upload rejects request missing image data", async () => {
      const { POST } = await import("../../src/app/api/upload/route");
      const req = new NextRequest("http://localhost:3000/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toMatch(/Missing 'image'/);
    });

    it("DELETE /api/upload deletes requested key", async () => {
      const { DELETE } = await import("../../src/app/api/upload/route");
      const req = new NextRequest("http://localhost:3000/api/upload?key=proposals/guest/test-123.jpg", {
        method: "DELETE",
      });

      const res = await DELETE(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.deleted).toBe(true);
    });
  });
});
