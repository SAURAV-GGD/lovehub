import { describe, it, expect } from "vitest";
import {
  loginSchema,
  signupSchema,
  generateProposalSchema,
  proposalSchema,
  checkoutSchema,
} from "../../src/lib/validators";

describe("Zod Validators", () => {
  it("validates correct login data", () => {
    const valid = { email: "user@example.com", password: "password123" };
    expect(() => loginSchema.parse(valid)).not.toThrow();
  });

  it("rejects invalid login email or short password", () => {
    expect(() => loginSchema.parse({ email: "invalid", password: "123" })).toThrow();
  });

  it("validates signup matching passwords and accepted terms", () => {
    const valid = {
      name: "Romeo",
      email: "romeo@love.com",
      password: "secretpassword",
      confirmPassword: "secretpassword",
      acceptTerms: true,
    };
    expect(() => signupSchema.parse(valid)).not.toThrow();
  });

  it("rejects signup when terms are not accepted", () => {
    const invalid = {
      name: "Romeo",
      email: "romeo@love.com",
      password: "secretpassword",
      confirmPassword: "secretpassword",
      acceptTerms: false,
    };
    expect(() => signupSchema.parse(invalid)).toThrow();
  });

  it("rejects mismatched passwords on signup", () => {
    const invalid = {
      name: "Romeo",
      email: "romeo@love.com",
      password: "secretpassword",
      confirmPassword: "wrongpassword",
      acceptTerms: true,
    };
    expect(() => signupSchema.parse(invalid)).toThrow();
  });

  it("validates proposal generation input", () => {
    const valid = {
      yourName: "Romeo",
      partnerName: "Juliet",
      relationshipType: "girlfriend",
      tone: "deep-romantic",
      language: "english",
    };
    expect(() => generateProposalSchema.parse(valid)).not.toThrow();
  });

  it("validates checkout input", () => {
    expect(() => checkoutSchema.parse({ plan: "romantic" })).not.toThrow();
    expect(() => checkoutSchema.parse({ plan: "invalid" })).toThrow();
  });
});
