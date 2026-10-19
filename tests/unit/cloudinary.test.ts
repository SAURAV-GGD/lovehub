import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getCloudinaryConfig,
  isCloudinaryConfigured,
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../../src/lib/cloudinary";

describe("Cloudinary Storage Provider", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  describe("Configuration & Security", () => {
    it("reports configured when CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are present", () => {
      process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
      process.env.CLOUDINARY_API_KEY = "123456789";
      process.env.CLOUDINARY_API_SECRET = "secret_abc_123";

      expect(isCloudinaryConfigured()).toBe(true);
      const cfg = getCloudinaryConfig();
      expect(cfg.cloudName).toBe("test-cloud");
      expect(cfg.apiKey).toBe("123456789");
      expect(cfg.apiSecret).toBe("secret_abc_123");
    });

    it("reports not configured when any required key is missing", () => {
      delete process.env.CLOUDINARY_CLOUD_NAME;
      delete process.env.CLOUDINARY_API_KEY;
      delete process.env.CLOUDINARY_API_SECRET;

      expect(isCloudinaryConfigured()).toBe(false);
    });

    it("throws clear error if uploadToCloudinary is called without credentials", async () => {
      delete process.env.CLOUDINARY_CLOUD_NAME;
      delete process.env.CLOUDINARY_API_KEY;
      delete process.env.CLOUDINARY_API_SECRET;

      await expect(
        uploadToCloudinary(Buffer.from("fake-image"), "proposals")
      ).rejects.toThrow(/Cloudinary credentials are not configured/);
    });

    it("deleteFromCloudinary returns true safely if not configured", async () => {
      delete process.env.CLOUDINARY_CLOUD_NAME;
      const res = await deleteFromCloudinary("proposals/test_img");
      expect(res).toBe(true);
    });
  });
});
