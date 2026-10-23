export type PlanId = "starter" | "romantic" | "premium" | "extend_30";

export interface PlanFeatureComparison {
  name: string;
  included: boolean;
  detail?: string;
}

export interface PlanConfig {
  id: PlanId;
  name: string;
  tagline: string;
  validityText: string;
  pricePaise: number; // price in paise (single source of truth)
  priceRupees: number;
  priceInPaise: number;
  priceInRupees: number;
  priceDisplay: string;
  photoLimit: number;
  featured?: boolean;
  isLifetime?: boolean;
  perks: string[];
  features: PlanFeatureComparison[];
}

export const PLANS: Record<PlanId, PlanConfig> = {
  starter: {
    id: "starter",
    name: "Starter",
    tagline: "Essential proposal page with AI romance letter & photo gallery",
    validityText: "Valid for 30 Days (Extend anytime for ₹69)",
    pricePaise: 6900, // Rs. 69
    priceRupees: 69,
    priceInPaise: 6900,
    priceInRupees: 69,
    priceDisplay: "₹69",
    photoLimit: 5,
    featured: false,
    isLifetime: false,
    perks: [
      "⏳ Active for 30 Days",
      "Up to 5 couple photos (Cloud CDN)",
      "AI romance letter (English & Hinglish)",
      "Private unguessable link",
      "100% mobile & desktop optimized",
      "Extend +30 days anytime for ₹69",
      "Upgrade to Lifetime forever for ₹669",
    ],
    features: [
      { name: "Proposal link validity", included: true, detail: "30 Days" },
      { name: "Couple photo gallery", included: true, detail: "Up to 5 photos" },
      { name: "AI romance letter (English & Hinglish)", included: true },
      { name: "Private unguessable link", included: true },
      { name: "Mobile optimized layout", included: true },
      { name: "Interactive runaway 'No' button", included: false },
      { name: "Romantic background music", included: false },
      { name: "Full celebration fireworks & confetti", included: false },
      { name: "3D memory flipbook slideshow", included: false },
      { name: "Lifetime permanent hosting", included: false, detail: "Only on VIP ₹669" },
    ],
  },
  romantic: {
    id: "romantic",
    name: "Romantic",
    tagline: "Interactive story proposal with runaway button, music & 3D memories",
    validityText: "Valid for 30 Days (Extend anytime for ₹69)",
    pricePaise: 16900, // Rs. 169
    priceRupees: 169,
    priceInPaise: 16900,
    priceInRupees: 169,
    priceDisplay: "₹169",
    photoLimit: 10,
    featured: true,
    isLifetime: false,
    perks: [
      "⏳ Active for 30 Days",
      "Playful runaway 'No' button",
      "Romantic background melodies (Piano / Guitar / YouTube)",
      "Up to 10 couple photos + 3D Memory Flipbook",
      "Full-screen celebration confetti & story quiz",
      "Instant WhatsApp & QR code share",
      "Extend +30 days anytime for ₹69",
      "Upgrade to Lifetime forever for ₹669",
    ],
    features: [
      { name: "Proposal link validity", included: true, detail: "30 Days" },
      { name: "Couple photo gallery", included: true, detail: "Up to 10 photos" },
      { name: "AI romance letter (English & Hinglish)", included: true },
      { name: "Private unguessable link", included: true },
      { name: "Interactive runaway 'No' button", included: true },
      { name: "Romantic background music", included: true },
      { name: "Full celebration fireworks & confetti", included: true },
      { name: "3D memory flipbook slideshow", included: true },
      { name: "Custom URL slug", included: false },
      { name: "Lifetime permanent hosting", included: false, detail: "Only on VIP ₹669" },
    ],
  },
  premium: {
    id: "premium",
    name: "VIP Keepsake",
    tagline: "Permanent digital love monument stored forever with custom URL slug",
    validityText: "✨ LIVE FOREVER (Lifetime Keepsake - Never Auto-Deleted)",
    pricePaise: 66900, // Rs. 669
    priceRupees: 669,
    priceInPaise: 66900,
    priceInRupees: 669,
    priceDisplay: "₹669",
    photoLimit: 20,
    featured: false,
    isLifetime: true,
    perks: [
      "✨ LIVE FOREVER • Lifetime permanent web hosting",
      "Zero auto-delete restriction (Never expires)",
      "Custom URL slug (e.g. lovehub.in/p/alex-and-sam)",
      "Up to 20 photos + 3D Memory Flipbook & Slideshow",
      "VIP Keepsake Gold Badge & luxury layout",
      "Priority 24/7 generation with unlimited revisions",
      "Permanent Cloud Storage preservation",
    ],
    features: [
      { name: "Proposal link validity", included: true, detail: "✨ FOREVER LIFETIME" },
      { name: "Zero auto-delete restriction", included: true, detail: "Permanent" },
      { name: "Couple photo gallery", included: true, detail: "Up to 20 photos" },
      { name: "AI romance letter (English & Hinglish)", included: true },
      { name: "Custom URL slug (personalised link)", included: true },
      { name: "Interactive runaway 'No' button", included: true },
      { name: "Romantic background music & trimmer", included: true },
      { name: "Full celebration fireworks & confetti", included: true },
      { name: "3D memory flipbook slideshow", included: true },
      { name: "VIP keepsake badge & watermark-free", included: true },
    ],
  },
  extend_30: {
    id: "extend_30",
    name: "Extend 30 Days",
    tagline: "Add +30 days of active validity to your proposal page",
    validityText: "+30 Days Added to Current Expiry",
    pricePaise: 6900, // Rs. 69
    priceRupees: 69,
    priceInPaise: 6900,
    priceInRupees: 69,
    priceDisplay: "₹69",
    photoLimit: 10,
    featured: false,
    isLifetime: false,
    perks: [
      "Adds +30 days to your proposal link immediately",
      "Preserves all existing photos, music, and quiz answers",
      "Instant re-activation if link was already expired",
      "Can be renewed anytime or upgraded to Lifetime (₹669)",
    ],
    features: [
      { name: "Validity Extension", included: true, detail: "+30 Days" },
      { name: "Preserve all photos & story", included: true },
      { name: "Instant reactivation", included: true },
      { name: "Upgrade to Lifetime option", included: true, detail: "₹669" },
    ],
  },
};

/**
 * Normalizes legacy plan aliases ("basic" -> "starter", "pro" -> "romantic", "vip"/"lifetime" -> "premium")
 * and returns the authoritative PlanConfig.
 */
export function getPlanConfig(planId: string | null | undefined): PlanConfig {
  const normalized = (planId || "romantic").toLowerCase().trim();
  if (normalized === "extend_30" || normalized === "extend" || normalized === "extension" || normalized === "extend-30") {
    return PLANS.extend_30;
  }
  if (normalized === "basic" || normalized === "starter") return PLANS.starter;
  if (normalized === "pro" || normalized === "romantic") return PLANS.romantic;
  if (normalized === "premium" || normalized === "custom" || normalized === "vip" || normalized === "lifetime") {
    return PLANS.premium;
  }
  return PLANS.romantic;
}

export const ALL_PLANS: PlanConfig[] = [PLANS.starter, PLANS.romantic, PLANS.premium];
