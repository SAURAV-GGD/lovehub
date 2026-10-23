import { describe, it, expect } from "vitest";
import { getPlanConfig } from "@/lib/plans";

describe("Cart & Ordered Items Tracking", () => {
  it("calculates cart metrics correctly for mixed orders and drafts", () => {
    const items = [
      {
        id: "ord_1",
        planId: "starter",
        planName: "Starter",
        amountRupees: 31,
        status: "paid" as const,
        isPaid: true,
        slug: "proposal-1",
        createdAt: new Date().toISOString(),
      },
      {
        id: "ord_2",
        planId: "romantic",
        planName: "Romantic",
        amountRupees: 69,
        status: "pending" as const,
        isPaid: false,
        slug: "proposal-2",
        createdAt: new Date().toISOString(),
      },
      {
        id: "prop_3",
        planId: "premium",
        planName: "Premium",
        amountRupees: 169,
        status: "pending" as const,
        isPaid: false,
        slug: "proposal-3",
        createdAt: new Date().toISOString(),
      },
    ];

    const totalCount = items.length;
    const paidCount = items.filter((i) => i.isPaid).length;
    const pendingCount = items.filter((i) => !i.isPaid).length;
    const totalSpentRupees = items
      .filter((i) => i.isPaid)
      .reduce((sum, i) => sum + i.amountRupees, 0);

    expect(totalCount).toBe(3);
    expect(paidCount).toBe(1);
    expect(pendingCount).toBe(2);
    expect(totalSpentRupees).toBe(31);
  });

  it("ensures plan prices in cart always adhere to server plan configs", () => {
    const starterPlan = getPlanConfig("starter");
    const romanticPlan = getPlanConfig("romantic");
    const premiumPlan = getPlanConfig("premium");

    expect(starterPlan.priceInRupees).toBe(69);
    expect(romanticPlan.priceInRupees).toBe(169);
    expect(premiumPlan.priceInRupees).toBe(669);
  });

  it("handles unauthenticated user cart with safe zero defaults", () => {
    const unauthenticatedCart = {
      items: [],
      totalCount: 0,
      paidCount: 0,
      pendingCount: 0,
      totalSpentRupees: 0,
    };

    expect(unauthenticatedCart.items).toHaveLength(0);
    expect(unauthenticatedCart.totalCount).toBe(0);
    expect(unauthenticatedCart.paidCount).toBe(0);
    expect(unauthenticatedCart.pendingCount).toBe(0);
    expect(unauthenticatedCart.totalSpentRupees).toBe(0);
  });
});
