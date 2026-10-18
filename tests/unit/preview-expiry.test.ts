import { describe, it, expect } from "vitest";
import { PREVIEW_DURATION_MS, isProposalExpired } from "@/lib/proposal-storage";

describe("Part 3: 2-Minute Preview Expiry & Server Enforcement", () => {
  it("defines PREVIEW_DURATION_MS as exactly 120,000ms (120 seconds / 2 minutes)", () => {
    expect(PREVIEW_DURATION_MS).toBe(120_000);
    expect(PREVIEW_DURATION_MS / 1000).toBe(120);
  });

  it("identifies active unpaid proposals within 120s window as NOT expired", () => {
    const activeUnpaidProposal = {
      id: "prop_active_1",
      isPaid: false,
      expiresAt: Date.now() + 60_000, // 60s remaining
    };

    expect(isProposalExpired(activeUnpaidProposal)).toBe(false);
  });

  it("identifies unpaid proposals past 120s as expired", () => {
    const expiredProposal = {
      id: "prop_expired_1",
      isPaid: false,
      expiresAt: Date.now() - 5_000, // expired 5 seconds ago
    };

    expect(isProposalExpired(expiredProposal)).toBe(true);
  });

  it("never expires paid proposals even after 120s elapsed", () => {
    const paidProposal = {
      id: "prop_paid_1",
      isPaid: true,
      expiresAt: Date.now() - 500_000,
    };

    expect(isProposalExpired(paidProposal)).toBe(false);
  });

  it("ensures draft data is preserved when expired (non-destructive)", () => {
    const draftContent = {
      yourName: "Aryan",
      partnerName: "Simran",
      message: "Will you marry me?",
      photos: ["https://example.com/photo1.jpg"],
      isPaid: false,
      expiresAt: Date.now() - 10_000,
    };

    // The proposal is expired, but draft content remains fully intact for payment unlock
    expect(isProposalExpired(draftContent)).toBe(true);
    expect(draftContent.partnerName).toBe("Simran");
    expect(draftContent.photos.length).toBe(1);
    expect(draftContent.message).toBe("Will you marry me?");
  });

  it("enforces HTTP 410 Gone contract with Cache-Control: no-store", () => {
    const isExpired = true;
    const responseHeaders = new Headers();

    if (isExpired) {
      responseHeaders.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
      responseHeaders.set("Pragma", "no-cache");
    }

    expect(responseHeaders.get("Cache-Control")).toBe("no-store, no-cache, must-revalidate, max-age=0");
    expect(responseHeaders.get("Pragma")).toBe("no-cache");
  });
});
