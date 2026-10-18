import { describe, it, expect, vi } from "vitest";
import { proposalSchema } from "@/lib/validators";
import { proposalResponses, proposals } from "@/db/schema";
import { createOrderRecord, getOrderById } from "@/lib/orders";

describe("Phase 1: Reliability & Persistence Verification", () => {
  describe("Canonical Proposal ID & Schema", () => {
    it("allows explicit canonical proposal id in proposalSchema", () => {
      const canonicalId = "canonical_prop_uuid_12345";
      const validPayload = {
        id: canonicalId,
        title: "Pooja & Rohan Forever",
        clientName: "Rohan",
        input: {
          yourName: "Rohan",
          partnerName: "Pooja",
          theme: "rose",
        },
        content: {
          id: canonicalId,
          yourName: "Rohan",
          partnerName: "Pooja",
          theme: "rose",
        },
        isPublic: true,
      };

      const parsed = proposalSchema.safeParse(validPayload);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.id).toBe(canonicalId);
      }
    });

    it("allows payload without explicit id and validates schema", () => {
      const validPayload = {
        title: "Our Love Story",
        input: {
          yourName: "Aryan",
          partnerName: "Simran",
        },
        content: {
          yourName: "Aryan",
          partnerName: "Simran",
        },
      };

      const parsed = proposalSchema.safeParse(validPayload);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.id).toBeUndefined();
      }
    });
  });

  describe("Database Schema: Proposal Responses", () => {
    it("defines proposalResponses table with correct fields for persistence", () => {
      expect(proposalResponses).toBeDefined();
      expect(proposalResponses.id).toBeDefined();
      expect(proposalResponses.proposalId).toBeDefined();
      expect(proposalResponses.eventType).toBeDefined();
      expect(proposalResponses.payload).toBeDefined();
      expect(proposalResponses.createdAt).toBeDefined();
    });

    it("verifies proposal table has canonical id column", () => {
      expect(proposals.id).toBeDefined();
      expect(proposals.userId).toBeDefined();
      expect(proposals.content).toBeDefined();
    });
  });

  describe("Authoritative Payment Verification Guardrails", () => {
    it("rejects confirmation if orderId is missing", async () => {
      const { POST } = await import("@/app/api/checkout/confirm-upi/route");

      const badReq = new Request("http://localhost:3000/api/checkout/confirm-upi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ utr: "123456789012" }),
      });

      const res = await POST(badReq as any);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain("Order ID is required");
    });

    it("rejects confirmation if order does not exist in store", async () => {
      const { POST } = await import("@/app/api/checkout/confirm-upi/route");

      const nonExistentReq = new Request("http://localhost:3000/api/checkout/confirm-upi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: "non_existent_order_999", utr: "123456789012" }),
      });

      const res = await POST(nonExistentReq as any);
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.success).toBe(false);
    });

    it("rejects confirmation if UTR is invalid or too short (< 10 digits)", async () => {
      const orderId = `test_order_short_utr_${Date.now()}`;
      await createOrderRecord({
        id: orderId,
        planId: "starter",
        amountPaise: 3100,
        status: "pending",
      });

      const { POST } = await import("@/app/api/checkout/confirm-upi/route");

      const badReq = new Request("http://localhost:3000/api/checkout/confirm-upi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, utr: "123" }),
      });

      const res = await POST(badReq as any);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain("valid 12-digit UPI UTR");
    });

    it("does NOT mark order as paid when gateway has not verified transaction", async () => {
      const orderId = `test_order_unverified_${Date.now()}`;
      await createOrderRecord({
        id: orderId,
        planId: "starter",
        amountPaise: 3100,
        status: "pending",
        paymentId: "yp_sess_unsettled_999",
      });

      const { POST } = await import("@/app/api/checkout/confirm-upi/route");

      const req = new Request("http://localhost:3000/api/checkout/confirm-upi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, utr: "123456789012" }),
      });

      const res = await POST(req as any);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      // Status should remain pending verification, not prematurely marked paid
      expect(json.data.status).toBe("pending");
      expect(json.data.verified).toBe(false);

      const updated = await getOrderById(orderId);
      expect(updated?.status).toBe("pending");
      expect(updated?.utr).toBe("123456789012");
    });
  });
});
