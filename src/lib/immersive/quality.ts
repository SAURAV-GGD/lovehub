export type Tier = "high" | "mid" | "low" | "static";

export interface TierConfig {
  dprMax: number;
  petals: number;
}

export const TIER_CONFIG: Record<Tier, TierConfig> = {
  high: { dprMax: 2, petals: 120 },
  mid: { dprMax: 1.5, petals: 70 },
  low: { dprMax: 1, petals: 35 },
  static: { dprMax: 1, petals: 0 },
};

export function nextLowerTier(tier: Tier): Tier {
  if (tier === "high") return "mid";
  if (tier === "mid") return "low";
  return "static";
}

export function detectInitialTier(): Tier {
  if (typeof window === "undefined") return "high";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "static";

  // Check data-saver mode
  const conn = (navigator as unknown as { connection?: { saveData?: boolean } }).connection;
  if (conn?.saveData) return "static";

  // Hardware capability checks
  const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
  const cores = navigator.hardwareConcurrency || 4;
  if (memory && memory <= 4) return "low";
  if (cores <= 2) return "low";

  // Mobile viewport tier
  if (window.innerWidth < 768) return "mid";

  return "high";
}
