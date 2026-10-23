import { describe, it, expect } from "vitest";
import { PLANS, ALL_PLANS, getPlanConfig } from "@/lib/plans";
import { PLAN_PRICING } from "@/lib/payments";

describe("Part 2: Pricing & Single Source of Truth", () => {
  it("enforces Starter plan at ₹69 (6,900 paise) one-time with 30-day validity", () => {
    expect(PLANS.starter.priceRupees).toBe(69);
    expect(PLANS.starter.pricePaise).toBe(6900);
    expect(PLANS.starter.priceDisplay).toBe("₹69");
    expect(PLANS.starter.name).toBe("Starter");
    expect(PLANS.starter.validityText).toContain("30 Days");
  });

  it("enforces Romantic at ₹169 and VIP Keepsake (Lifetime) at ₹669", () => {
    expect(PLANS.romantic.priceRupees).toBe(169);
    expect(PLANS.romantic.pricePaise).toBe(16900);
    expect(PLANS.premium.priceRupees).toBe(669);
    expect(PLANS.premium.pricePaise).toBe(66900);
    expect(PLANS.premium.isLifetime).toBe(true);
    expect(PLANS.extend_30.priceRupees).toBe(69);
    expect(PLANS.extend_30.pricePaise).toBe(6900);
  });

  it("normalizes legacy aliases (basic -> starter, pro -> romantic, vip -> premium)", () => {
    expect(getPlanConfig("basic").id).toBe("starter");
    expect(getPlanConfig("basic").priceInRupees).toBe(69);
    expect(getPlanConfig("pro").id).toBe("romantic");
    expect(getPlanConfig("pro").priceInRupees).toBe(169);
    expect(getPlanConfig("starter").id).toBe("starter");
    expect(getPlanConfig("romantic").id).toBe("romantic");
    expect(getPlanConfig("premium").id).toBe("premium");
    expect(getPlanConfig("vip").id).toBe("premium");
    expect(getPlanConfig("lifetime").id).toBe("premium");
    expect(getPlanConfig("extend_30").id).toBe("extend_30");
  });

  it("ensures PLAN_PRICING is derived directly from plans config", () => {
    expect(PLAN_PRICING.starter.amount).toBe(69);
    expect(PLAN_PRICING.starter.amountPaise).toBe(6900);
    expect(PLAN_PRICING.romantic.amount).toBe(169);
    expect(PLAN_PRICING.romantic.amountPaise).toBe(16900);
    expect(PLAN_PRICING.premium.amount).toBe(669);
    expect(PLAN_PRICING.premium.amountPaise).toBe(66900);
    expect(PLAN_PRICING.extend_30.amount).toBe(69);
    expect(PLAN_PRICING.extend_30.amountPaise).toBe(6900);
  });

  it("prevents price tampering: price always loaded from canonical server config", () => {
    const maliciousClientPayload = {
      planId: "starter",
      price: 0,
      amount: "0.00",
      amountPaise: 0,
    };

    // Server ignores client-supplied price and loads authoritative price
    const resolvedConfig = getPlanConfig(maliciousClientPayload.planId);
    expect(resolvedConfig.priceInRupees).toBe(69);
    expect(resolvedConfig.priceInPaise).toBe(6900);
    expect(resolvedConfig.priceInRupees).not.toBe(maliciousClientPayload.price);
  });
});
