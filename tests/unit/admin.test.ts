import { describe, it, expect } from "vitest";
import {
  validateAdminCredentials,
  createAdminSession,
  verifyToken,
  signToken,
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSWORD,
} from "../../src/lib/admin-auth";
import {
  getAdminClients,
  getAdminProposals,
  createAdminProposal,
  getProposalByIdOrSlug,
  deleteAdminProposal,
} from "../../src/lib/admin-store";
import { planLimits, PlanType } from "../../src/lib/proposal-types";

describe("Admin Authentication & Security", () => {
  it("validates correct default admin credentials", () => {
    expect(validateAdminCredentials(DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD)).toBe(true);
  });

  it("rejects incorrect admin email or password", () => {
    expect(validateAdminCredentials("wrong@admin.com", DEFAULT_ADMIN_PASSWORD)).toBe(false);
    expect(validateAdminCredentials(DEFAULT_ADMIN_EMAIL, "WrongPassword!")).toBe(false);
  });

  it("creates and verifies a signed HMAC admin session token", () => {
    const { session, token } = createAdminSession();
    expect(token).toBeTruthy();
    expect(session.role).toBe("admin");

    const verified = verifyToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.email).toBe(DEFAULT_ADMIN_EMAIL);
    expect(verified?.role).toBe("admin");
  });

  it("rejects tampered admin session tokens", () => {
    const { token } = createAdminSession();
    const tampered = token.slice(0, -5) + "abcde";
    expect(verifyToken(tampered)).toBeNull();
  });
});

describe("Admin Multi-Version Plans & Unlimited Studio", () => {
  it("defines plan limits for all versions: starter, pro, premium, custom", () => {
    const plans: PlanType[] = ["starter", "pro", "premium", "custom", "basic", "romantic"];
    plans.forEach((p) => {
      expect(planLimits[p]).toBeDefined();
      expect(planLimits[p].maxPhotos).toBeGreaterThan(0);
    });

    expect(planLimits.custom.isUnlimited).toBe(true);
    expect(planLimits.custom.hasSlideshow).toBe(true);
    expect(planLimits.custom.hasCustomSlug).toBe(true);
  });

  it("allows admin to retrieve all registered clients and their proposal counts", async () => {
    const clients = await getAdminClients();
    expect(clients.length).toBeGreaterThan(0);
    expect(clients[0]).toHaveProperty("name");
    expect(clients[0]).toHaveProperty("email");
    expect(clients[0]).toHaveProperty("proposalCount");
    expect(clients[0]).toHaveProperty("plan");
  });

  it("allows admin to retrieve all saved proposals across the platform", async () => {
    const proposals = await getAdminProposals();
    expect(proposals.length).toBeGreaterThan(0);
    expect(proposals[0]).toHaveProperty("title");
    expect(proposals[0]).toHaveProperty("clientName");
    expect(proposals[0]).toHaveProperty("plan");
  });

  it("allows admin to create an unlimited custom VIP proposal for any recipient", async () => {
    const created = await createAdminProposal({
      title: "VIP Bespoke - Juliet Special Edition",
      partnerName: "Juliet",
      yourName: "Romeo",
      plan: "custom",
      relationshipType: "fiancee",
      tone: "poetic-vip",
      language: "english",
      message: "You are the poetry in my soul and the love of all my lifetimes.",
      photos: [
        "https://example.com/p1.jpg",
        "https://example.com/p2.jpg",
        "https://example.com/p3.jpg",
      ],
      photoCaptions: ["Caption 1", "Caption 2", "Caption 3"],
      backgroundMusic: "cinematic-strings",
      customSlug: "romeo-and-juliet-vip-test",
      customConfig: {
        enableRunawayButton: true,
        enableConfetti: true,
        enableHeartburst: true,
        enableSlideshow: true,
        vipBadge: "Executive VIP Bespoke Edition",
      },
    });

    expect(created.id).toBeTruthy();
    expect(created.slug).toBe("romeo-and-juliet-vip-test");
    expect(created.plan).toBe("custom");
    expect(created.createdByAdmin).toBe(true);

    // Verify lookup by slug or id
    const retrieved = await getProposalByIdOrSlug("romeo-and-juliet-vip-test");
    expect(retrieved).not.toBeNull();
    expect(retrieved?.clientName).toBe("Juliet");

    // Clean up
    await deleteAdminProposal(created.id);
  });
});
