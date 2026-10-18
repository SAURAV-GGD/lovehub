export type PlanId = "starter" | "romantic" | "premium";

export interface PlanFeatureComparison {
  name: string;
  included: boolean;
  detail?: string;
}

export interface PlanConfig {
  id: PlanId;
  name: string;
  tagline: string;
  pricePaise: number; // price in paise (single source of truth)
  priceRupees: number;
  priceInPaise: number;
  priceInRupees: number;
  priceDisplay: string;
  photoLimit: number;
  featured?: boolean;
  perks: string[];
  features: PlanFeatureComparison[];
}

export const PLANS: Record<PlanId, PlanConfig> = {
  starter: {
    id: "starter",
    name: "Starter",
    tagline: "Essential proposal page with AI letter & photo gallery",
    pricePaise: 3100, // Rs. 31
    priceRupees: 31,
    priceInPaise: 3100,
    priceInRupees: 31,
    priceDisplay: "₹31",
    photoLimit: 3,
    featured: false,
    perks: [
      "Up to 3 photos",
      "AI romance letter (English & Hinglish)",
      "Private proposal link",
      "100% mobile & desktop optimized",
    ],
    features: [
      { name: "Couple photo gallery", included: true, detail: "Up to 3 photos" },
      { name: "AI romance letter (English & Hinglish)", included: true },
      { name: "Private unguessable link", included: true },
      { name: "Mobile optimized layout", included: true },
      { name: "Interactive runaway 'No' button", included: false },
      { name: "Romantic background music", included: false },
      { name: "Full celebration fireworks & confetti", included: false },
      { name: "3D memory flipbook slideshow", included: false },
      { name: "Custom URL slug", included: false },
    ],
  },
  romantic: {
    id: "romantic",
    name: "Romantic",
    tagline: "Interactive proposal with runaway button & romantic melodies",
    pricePaise: 6900, // Rs. 69
    priceRupees: 69,
    priceInPaise: 6900,
    priceInRupees: 69,
    priceDisplay: "₹69",
    photoLimit: 5,
    featured: true,
    perks: [
      "Playful runaway 'No' button",
      "Romantic background melodies (Piano / Guitar)",
      "Up to 5 couple photos",
      "Full-screen celebration confetti",
      "Instant WhatsApp & QR code share",
    ],
    features: [
      { name: "Couple photo gallery", included: true, detail: "Up to 5 photos" },
      { name: "AI romance letter (English & Hinglish)", included: true },
      { name: "Private unguessable link", included: true },
      { name: "Mobile optimized layout", included: true },
      { name: "Interactive runaway 'No' button", included: true },
      { name: "Romantic background music", included: true },
      { name: "Full celebration fireworks & confetti", included: true },
      { name: "3D memory flipbook slideshow", included: false },
      { name: "Custom URL slug", included: false },
    ],
  },
  premium: {
    id: "premium",
    name: "Premium",
    tagline: "VIP keepsake with custom slug, 3D flipbook & up to 12 photos",
    pricePaise: 16900, // Rs. 169
    priceRupees: 169,
    priceInPaise: 16900,
    priceInRupees: 169,
    priceDisplay: "₹169",
    photoLimit: 12,
    featured: false,
    perks: [
      "Custom URL slug (e.g. lovehub.in/p/alex-and-sam)",
      "Up to 12 photos + 3D Memory Flipbook",
      "Priority generation with unlimited revisions",
      "Lifetime permanent hosting",
      "Watermark-free luxury layout",
    ],
    features: [
      { name: "Couple photo gallery", included: true, detail: "Up to 12 photos" },
      { name: "AI romance letter (English & Hinglish)", included: true },
      { name: "Private unguessable link", included: true },
      { name: "Mobile optimized layout", included: true },
      { name: "Interactive runaway 'No' button", included: true },
      { name: "Romantic background music", included: true },
      { name: "Full celebration fireworks & confetti", included: true },
      { name: "3D memory flipbook slideshow", included: true },
      { name: "Custom URL slug", included: true },
    ],
  },
};

/**
 * Normalizes legacy plan aliases ("basic" -> "starter", "pro" -> "romantic")
 * and returns the authoritative PlanConfig.
 */
export function getPlanConfig(planId: string | null | undefined): PlanConfig {
  const normalized = (planId || "romantic").toLowerCase();
  if (normalized === "basic" || normalized === "starter") return PLANS.starter;
  if (normalized === "pro" || normalized === "romantic") return PLANS.romantic;
  if (normalized === "premium" || normalized === "custom") return PLANS.premium;
  return PLANS.romantic;
}

export const ALL_PLANS: PlanConfig[] = [PLANS.starter, PLANS.romantic, PLANS.premium];
