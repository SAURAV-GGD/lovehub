import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import {
  validateAdminCredentials,
  verifyToken,
  signToken,
  createAdminSession,
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSWORD,
} from "../../src/lib/admin-auth";
import { POST as adminAuthPost } from "../../src/app/api/admin/auth/route";
import { POST as proposalsPost } from "../../src/app/api/proposals/route";
import { PUT as proposalsPut } from "../../src/app/api/proposals/[id]/route";
import { DELETE as uploadDelete } from "../../src/app/api/upload/route";
import { GET as responseGet, POST as responsePost } from "../../src/app/api/proposals/[id]/response/route";
import { verifyYouPiWebhookSignature } from "../../src/lib/youpi-client";
import { auth } from "../../src/lib/auth";

describe("Security Audit Hardening & Vulnerability Remediations", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  describe("Finding 1: Timing-Safe Admin Authentication", () => {
    it("validates admin credentials with constant-time comparison", () => {
      expect(validateAdminCredentials(DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD)).toBe(true);
      expect(validateAdminCredentials(DEFAULT_ADMIN_EMAIL, "WrongPassword!")).toBe(false);
      expect(validateAdminCredentials("wrong@email.com", DEFAULT_ADMIN_PASSWORD)).toBe(false);
    });

    it("verifies and rejects tampered admin session tokens in constant time", () => {
      const { token } = createAdminSession();
      expect(verifyToken(token)).not.toBeNull();

      // Tamper signature byte
      const tampered = token.slice(0, -4) + "zzzz";
      expect(verifyToken(tampered)).toBeNull();
    });
  });

  describe("Finding 6: Admin Login Brute-Force Rate Limiting", () => {
    it("throttles excessive administrative login attempts with 429 RATE_LIMITED", async () => {
      const testIp = `192.168.1.${Math.floor(Math.random() * 800 + 100)}`;

      // Execute 5 rapid attempts
      for (let i = 0; i < 5; i++) {
        const req = new NextRequest("http://localhost:3000/api/admin/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": testIp,
          },
          body: JSON.stringify({
            email: DEFAULT_ADMIN_EMAIL,
            password: "WrongPasswordAttempt",
          }),
        });
        const res = await adminAuthPost(req);
        expect(res.status).toBe(401);
      }

      // 6th attempt from same IP must be rate limited
      const blockedReq = new NextRequest("http://localhost:3000/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": testIp,
        },
        body: JSON.stringify({
          email: DEFAULT_ADMIN_EMAIL,
          password: DEFAULT_ADMIN_PASSWORD,
        }),
      });
      const blockedRes = await adminAuthPost(blockedReq);
      expect(blockedRes.status).toBe(429);

      const json = await blockedRes.json();
      expect(json.success).toBe(false);
      expect(json.error).toMatch(/Too many login attempts/);
    });
  });

  describe("Finding 2 & 3: Proposal Commercial Paywall Enforcement", () => {
    it("neutralizes client-injected isPaid: true during proposal creation", async () => {
      // Mock session
      vi.spyOn(auth.api, "getSession").mockResolvedValue({
        user: { id: "test-user-security-1", name: "Test User", email: "test@security.com" },
        session: { id: "sess-1", userId: "test-user-security-1" } as any,
      } as any);

      const proposalId = `sec_prop_${Date.now()}`;
      const req = new NextRequest("http://localhost:3000/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: proposalId,
          title: "My Proposal",
          input: { yourName: "A", partnerName: "B" },
          content: {
            isPaid: true, // Attacker attempt to bypass paywall
            plan: "romantic",
          },
        }),
      });

      const res = await proposalsPost(req);
      expect(res.status).toBe(201);

      const json = await res.json();
      expect(json.success).toBe(true);
      // isPaid must be stripped/false, status must be draft, expiresAt must be computed
      expect(json.data.status).toBe("draft");
      expect(json.data.content.isPaid).toBe(false);
      expect(typeof json.data.content.expiresAt).toBe("number");
      expect(json.data.content.expiresAt).toBeGreaterThan(Date.now());
    });

    it("prevents status escalation to 'final' on proposal update", async () => {
      vi.spyOn(auth.api, "getSession").mockResolvedValue({
        user: { id: "user-attacker-1", name: "Attacker", email: "attacker@test.com" },
        session: { id: "sess-2", userId: "user-attacker-1" } as any,
      } as any);

      // Create initial draft
      const propId = `sec_draft_${Date.now()}`;
      const createReq = new NextRequest("http://localhost:3000/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: propId,
          title: "Initial Draft",
          input: {},
          content: {},
        }),
      });
      await proposalsPost(createReq);

      // Attempt to PUT { status: 'final', content: { isPaid: true } }
      const updateReq = new NextRequest(`http://localhost:3000/api/proposals/${propId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "final",
          content: { isPaid: true, title: "Hacked Title" },
        }),
      });

      const updateRes = await proposalsPut(updateReq, { params: Promise.resolve({ id: propId }) });
      expect(updateRes.status).toBe(200);

      const json = await updateRes.json();
      expect(json.success).toBe(true);
      // Status must remain draft, isPaid must remain false
      expect(json.data.status).toBe("draft");
      expect(json.data.content.isPaid).toBe(false);
    });
  });

  describe("Finding 4: Storage Media Deletion Authorization", () => {
    it("rejects unauthenticated deletion of non-guest media assets with 401 UNAUTHORIZED", async () => {
      const req = new NextRequest("http://localhost:3000/api/upload?key=proposals/user_vip_999/private-pic.jpg", {
        method: "DELETE",
      });

      const res = await uploadDelete(req);
      expect(res.status).toBe(401);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toMatch(/Authentication required/);
    });

    it("rejects authenticated user attempting to delete another user's asset with 403 FORBIDDEN", async () => {
      vi.spyOn(auth.api, "getSession").mockResolvedValue({
        user: { id: "user-normal-alice", name: "Alice", email: "alice@test.com" },
        session: { id: "sess-alice", userId: "user-normal-alice" } as any,
      } as any);

      // Alice tries to delete Bob's photo
      const req = new NextRequest("http://localhost:3000/api/upload?key=proposals/user-normal-bob/photo.jpg", {
        method: "DELETE",
      });

      const res = await uploadDelete(req);
      expect(res.status).toBe(403);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toMatch(/permission to delete/);
    });

    it("allows user to delete their own media assets", async () => {
      vi.spyOn(auth.api, "getSession").mockResolvedValue({
        user: { id: "user-normal-alice", name: "Alice", email: "alice@test.com" },
        session: { id: "sess-alice", userId: "user-normal-alice" } as any,
      } as any);

      const req = new NextRequest("http://localhost:3000/api/upload?key=proposals/user-normal-alice/photo.jpg", {
        method: "DELETE",
      });

      const res = await uploadDelete(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.deleted).toBe(true);
    });
  });

  describe("Finding 5: Partner Responses Confidentiality & Protection", () => {
    it("rejects unauthenticated requests to read partner responses with 401 UNAUTHORIZED", async () => {
      const req = new NextRequest("http://localhost:3000/api/proposals/test-prop-123/response", {
        method: "GET",
      });

      const res = await responseGet(req, { params: Promise.resolve({ id: "test-prop-123" }) });
      expect(res.status).toBe(401);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toMatch(/Authentication required/);
    });

    it("rate-limits response submissions to prevent database flooding", async () => {
      const testIp = `10.20.30.${Math.floor(Math.random() * 800 + 100)}`;

      // Execute 20 submissions
      for (let i = 0; i < 20; i++) {
        const req = new NextRequest("http://localhost:3000/api/proposals/flood-prop/response", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": testIp,
          },
          body: JSON.stringify({
            eventType: "answer",
            payload: { questionId: `q_${i}`, answer: "Yes" },
          }),
        });
        const res = await responsePost(req, { params: Promise.resolve({ id: "flood-prop" }) });
        expect(res.status).toBe(200);
      }

      // 21st submission must be rate limited
      const blockedReq = new NextRequest("http://localhost:3000/api/proposals/flood-prop/response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": testIp,
        },
        body: JSON.stringify({ eventType: "answer", payload: {} }),
      });
      const blockedRes = await responsePost(blockedReq, { params: Promise.resolve({ id: "flood-prop" }) });
      expect(blockedRes.status).toBe(429);
    });
  });

  describe("Finding 1 Guardrail: Webhook Secrets in Production", () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
    });

    it("rejects webhook signature in production if YOUPI_WEBHOOK_SECRET is unset", () => {
      (process.env as Record<string, string | undefined>).NODE_ENV = "production";
      delete process.env.YOUPI_WEBHOOK_SECRET;

      const isValid = verifyYouPiWebhookSignature("{}", "sha256=fake_signature");
      expect(isValid).toBe(false);
    });
  });
});
