import { BirthdayRecord } from "./admin-store";

const STORAGE_KEY = "lovehub_birthdays";

/**
 * Normalizes slugs so "sakshi 13 10" or "sakshi-13-10" or "Sakshi_13_10"
 * resolve interchangeably and robustly.
 */
export function normalizeBirthdaySlug(input: string): string {
  if (!input) return "";
  try {
    input = decodeURIComponent(input);
  } catch {
    // Keep raw if malformed
  }
  return input
    .toLowerCase()
    .trim()
    .replace(/[\s_+]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * High-performance client-side image compression.
 * Resizes images to max 1280px maintaining aspect ratio,
 * compressing to clean JPEG (~100-200KB per image).
 * Prevents 413 Payload Too Large and LocalStorage quota errors.
 */
export function compressImageFile(
  file: File,
  maxDimension = 1280,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve) => {
    // If SVG or non-image, fallback to reader
    if (!file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Draw image with smooth scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(e.target?.result as string || "");
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

/**
 * Saves a birthday celebration record to localStorage for instantaneous offline/client retrieval.
 */
export function saveBirthday(record: BirthdayRecord): void {
  if (typeof window === "undefined") return;

  try {
    const list = getAllStoredBirthdays();
    const index = list.findIndex(
      (b) =>
        b.id === record.id ||
        normalizeBirthdaySlug(b.slug) === normalizeBirthdaySlug(record.slug)
    );

    if (index >= 0) {
      list[index] = record;
    } else {
      list.unshift(record);
    }

    // Keep up to 20 recent birthdays
    const trimmed = list.slice(0, 20);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      // If quota exceeded, save just the newest record (and if still large, trim photos)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([record]));
      } catch {
        const light = { ...record, photos: record.photos.slice(0, 3) };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify([light]));
        } catch {
          // Never throw, non-fatal
        }
      }
    }
  } catch (err) {
    console.warn("Could not save birthday to localStorage:", err);
  }
}

/**
 * Retrieve all locally stored birthdays
 */
export function getAllStoredBirthdays(): BirthdayRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Retrieve a single birthday from localStorage by slug or id with flexible normalization
 */
export function getStoredBirthday(slugOrId: string): BirthdayRecord | null {
  if (!slugOrId) return null;
  const targetNorm = normalizeBirthdaySlug(slugOrId);
  const list = getAllStoredBirthdays();

  return (
    list.find(
      (b) =>
        b.id === slugOrId ||
        b.slug === slugOrId ||
        normalizeBirthdaySlug(b.slug) === targetNorm ||
        normalizeBirthdaySlug(b.id) === targetNorm
    ) || null
  );
}
