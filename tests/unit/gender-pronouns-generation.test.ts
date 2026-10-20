import { describe, it, expect } from "vitest";
import { generateProposalSchema } from "@/lib/validators";
import { generateProposalMessage } from "@/lib/ai-generator";
import { generateProposal } from "@/lib/ai/generate";
import { ToneType } from "@/lib/proposal-types";

describe("Gender & Pronoun Customization with Romantic AI Generation", () => {
  describe("Schema Validation", () => {
    it("accepts valid yourPronouns and partnerPronouns", () => {
      const parsed = generateProposalSchema.parse({
        yourName: "Rahul",
        partnerName: "Ananya",
        yourPronouns: "he/him",
        partnerPronouns: "she/her",
        relationshipType: "girlfriend",
        tone: "cute",
        language: "hinglish",
      });

      expect(parsed.yourPronouns).toBe("he/him");
      expect(parsed.partnerPronouns).toBe("she/her");
    });

    it("defaults yourPronouns to he/him and partnerPronouns to she/her when omitted", () => {
      const parsed = generateProposalSchema.parse({
        yourName: "Rahul",
        partnerName: "Ananya",
      });

      expect(parsed.yourPronouns).toBe("he/him");
      expect(parsed.partnerPronouns).toBe("she/her");
    });
  });

  describe("Offline Client-Side AI Generator (generateProposalMessage)", () => {
    const tones: ToneType[] = ["cute", "emotional", "filmy", "funny", "deep-romantic", "poetic-vip"];

    it("adapts verbs naturally for female creator proposing to male partner in Hinglish", () => {
      for (const tone of tones) {
        const message = generateProposalMessage({
          yourName: "Pooja",
          partnerName: "Rohan",
          yourPronouns: "she/her",
          partnerPronouns: "he/him",
          relationshipType: "boyfriend",
          tone,
          language: "hinglish",
        });

        // Must not contain unresolved slashes from old templates
        expect(message).not.toContain("karti/karta");
        expect(message).not.toContain("rakhunga/rakhungi");
        expect(message).not.toContain("hero/heroine");
        expect(message).not.toContain("Tumhara/Tumhari");
        expect(message).not.toContain("chahti/chahta");

        // Must NEVER leak technical pronoun labels into romantic proposal text
        expect(message).not.toMatch(/\b(he\/him|she\/her|they\/them)\b/i);
      }
    });

    it("adapts verbs naturally for male creator proposing to female partner in Hinglish", () => {
      for (const tone of tones) {
        const message = generateProposalMessage({
          yourName: "Aman",
          partnerName: "Simran",
          yourPronouns: "he/him",
          partnerPronouns: "she/her",
          relationshipType: "girlfriend",
          tone,
          language: "hinglish",
        });

        // Must not contain unresolved slashes
        expect(message).not.toContain("karti/karta");
        expect(message).not.toContain("rakhunga/rakhungi");
        expect(message).not.toContain("hero/heroine");
        expect(message).not.toContain("Tumhara/Tumhari");
        expect(message).not.toContain("chahti/chahta");

        // Must NEVER leak technical pronoun labels into romantic proposal text
        expect(message).not.toMatch(/\b(he\/him|she\/her|they\/them)\b/i);
      }
    });

    it("generates natural English proposals without pronoun leakage", () => {
      for (const tone of tones) {
        const message = generateProposalMessage({
          yourName: "Alex",
          partnerName: "Jordan",
          yourPronouns: "they/them",
          partnerPronouns: "they/them",
          relationshipType: "partner",
          tone,
          language: "english",
        });

        expect(message).not.toContain("hero/heroine");
        expect(message).not.toMatch(/\b(he\/him|she\/her|they\/them)\b/i);
      }
    });
  });

  describe("Server Fallback Generator (generateProposal)", () => {
    it("generates gender-adapted fallback content without pronoun tokens", async () => {
      const result = await generateProposal({
        yourName: "Pooja",
        partnerName: "Rohan",
        yourPronouns: "she/her",
        partnerPronouns: "he/him",
        relationshipType: "boyfriend",
        tone: "filmy",
        language: "hinglish",
      });

      expect(result.loveLetter).toContain("chahti hoon");
      expect(result.story).toContain("hero");
      expect(result.question).toContain("mere banoge");
      expect(result.loveLetter).not.toContain("chahta/chahti");
      expect(result.loveLetter).not.toMatch(/\b(he\/him|she\/her|they\/them)\b/i);
    });

    it("generates female partner fallback content correctly", async () => {
      const result = await generateProposal({
        yourName: "Rohan",
        partnerName: "Pooja",
        yourPronouns: "he/him",
        partnerPronouns: "she/her",
        relationshipType: "girlfriend",
        tone: "filmy",
        language: "hinglish",
      });

      expect(result.loveLetter).toContain("chahta hoon");
      expect(result.story).toContain("heroine");
      expect(result.question).toContain("meri banogi");
      expect(result.loveLetter).not.toContain("chahta/chahti");
      expect(result.loveLetter).not.toMatch(/\b(he\/him|she\/her|they\/them)\b/i);
    });
  });
});
