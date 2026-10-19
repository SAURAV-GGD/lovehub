import { logger } from "./logger";

export interface ImgBBUploadResult {
  url: string;
  deleteUrl?: string;
  width?: number;
  height?: number;
  size?: number;
}

/**
 * Uploads an image (Buffer or Base64 string) to ImgBB using the ImgBB REST API.
 */
export async function uploadToImgBB(
  imageBufferOrBase64: Buffer | string,
  filename?: string
): Promise<ImgBBUploadResult> {
  const apiKey =
    process.env.IMGBB_API_KEY ||
    "5452553ac886d36484774131660dc2f6";

  if (!apiKey) {
    throw new Error("IMGBB_API_KEY is not configured.");
  }

  let base64String: string;
  if (typeof imageBufferOrBase64 === "string") {
    base64String = imageBufferOrBase64.replace(
      /^data:image\/[a-zA-Z0-9-.+]+;base64,/,
      ""
    );
  } else {
    base64String = imageBufferOrBase64.toString("base64");
  }

  const formData = new URLSearchParams();
  formData.append("image", base64String);
  if (filename) {
    formData.append("name", filename.replace(/\.[^/.]+$/, ""));
  }

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: "POST",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    body: formData,
  });

  const data = await res.json().catch(() => null);

  if (res.ok && data?.success && data?.data?.url) {
    logger.info("Successfully uploaded image to ImgBB", {
      url: data.data.url,
      id: data.data.id,
    });
    return {
      url: data.data.url,
      deleteUrl: data.data.delete_url,
      width: data.data.width,
      height: data.data.height,
      size: data.data.size,
    };
  }

  const errorMsg =
    data?.error?.message ||
    `ImgBB upload failed with status ${res.status}: ${res.statusText}`;

  logger.warn("ImgBB upload failed", { errorMsg, statusCode: data?.status_code });
  throw new Error(errorMsg);
}
