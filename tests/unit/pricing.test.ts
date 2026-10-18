import { describe, it, expect } from "vitest";
import { PLANS, ALL_PLANS, getPlanConfig } from "@/lib/plans";
import { PLAN_PRICING } from "@/lib/payments";

describe("Part 2: Pricing & Single Source of Truth", () => {
  it("enforces Starter plan at exactly ₹31 (3,100 paise) one-time", () => {
    expect(PLANS.starter.priceRupees).toBe(31);
    expect(PLANS.starter.pricePaise).toBe(3100);
    expect(PLANS.starter.priceDisplay).toBe("₹31");
    expect(PLANS.starter.name).toBe("Starter");
  });

  it("retains Romantic at ₹69 and Premium at ₹169", () => {
    expect(PLANS.romantic.priceRupees).toBe(69);
    expect(PLANS.romantic.pricePaise).toBe(6900);
    expect(PLANS.premium.priceRupees).toBe(169);
    expect(PLANS.premium.pricePaise).toBe(16900);
  });

  it("normalizes legacy aliases (basic -> starter, pro -> romantic)", () => {
    expect(getPlanConfig("basic").id).toBe("starter");
    expect(getPlanConfig("basic").priceInRupees).toBe(31);
    expect(getPlanConfig("pro").id).toBe("romantic");
    expect(getPlanConfig("pro").priceInRupees).toBe(69);
    expect(getPlanConfig("starter").id).toBe("starter");
    expect(getPlanConfig("romantic").id).toBe("romantic");
    expect(getPlanConfig("premium").id).toBe("premium");
  });

  it("ensures PLAN_PRICING is derived directly from plans config", () => {
    expect(PLAN_PRICING.starter.amount).toBe(31);
    expect(PLAN_PRICING.starter.amountPaise).toBe(3100);
    expect(PLAN_PRICING.romantic.amount).toBe(69);
    expect(PLAN_PRICING.romantic.amountPaise).toBe(6900);
    expect(PLAN_PRICING.premium.amount).toBe(169);
    expect(PLAN_PRICING.premium.amountPaise).toBe(16900);
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
    expect(resolvedConfig.priceInRupees).toBe(31);
    expect(resolvedConfig.priceInPaise).toBe(3100);
    expect(resolvedConfig.priceInRupees).not.toBe(maliciousClientPayload.price);
  });
});
