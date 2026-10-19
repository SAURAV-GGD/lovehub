import { describe, it, expect } from "vitest";
import { ensureStoryConfig, ProposalData } from "@/lib/proposal-types";

describe("Phase 2: Modular Story Engine & 7 Scenes", () => {
  describe("ensureStoryConfig helper", () => {
    it("synthesizes all 7 narrative scenes from basic proposal data", () => {
      const basicProposal: Partial<ProposalData> = {
        id: "prop_basic_test",
        yourName: "Rohan",
        partnerName: "Pooja",
        relationshipType: "girlfriend",
        message: "I promise to love you forever and ever.",
        photos: ["https://example.com/p1.jpg", "https://example.com/p2.jpg"],
        photoCaptions: ["Our First Date", "Goa Trip"],
        backgroundMusic: "romantic-piano",
      };

      const story = ensureStoryConfig(basicProposal);

      expect(story.version).toBe(2);
      expect(story.enabledScenes).toEqual([
        "intro",
        "quiz",
        "question",
        "memories",
        "letter",
        "gift",
        "finale",
      ]);

      // Scene 1: Intro contains personalized partner typography
      expect(story.intro.headline).toContain("Pooja");

      // Scene 2: Quiz contains custom questions and answers
      expect(story.quiz.questions.length).toBeGreaterThanOrEqual(4);
      expect(story.quiz.questions[0].options).toEqual(
        expect.arrayContaining([expect.stringContaining("Pooja"), expect.stringContaining("Rohan")])
      );

      // Scene 3: The Big Question
      expect(story.question.questionText).toBeDefined();
      expect(story.question.runawayNo).toBe(true);
      expect(story.question.successTitle).toContain("Pooja");

      // Scene 4: Memories mapped from photos and captions
      expect(story.memories.items.length).toBe(2);
      expect(story.memories.items[0].title).toBe("Our First Date");
      expect(story.memories.items[0].photoUrl).toBe("https://example.com/p1.jpg");

      // Scene 5: Letter
      expect(story.letter.content).toBe("I promise to love you forever and ever.");
      expect(story.letter.showTypewriter).toBe(true);

      // Scene 6: Gift
      expect(story.gift.cards.length).toBeGreaterThanOrEqual(4);

      // Scene 7: Finale
      expect(story.finale.showForeverCounter).toBe(true);
      expect(story.finale.allowReplay).toBe(true);
      expect(story.finale.allowShare).toBe(true);
    });

    it("preserves an existing version 2 storyConfig without overwriting customizations", () => {
      const customStory = {
        version: 2 as const,
        enabledScenes: ["intro", "letter", "finale"] as any[],
        intro: { headline: "Custom Welcome" },
        quiz: { questions: [] },
        question: {
          questionText: "Will you?",
          yesText: "Yes!",
          noText: "No!",
          runawayNo: false,
          successTitle: "Yay",
          successMessage: "Woohoo",
        },
        memories: { items: [] },
        letter: { title: "Custom Letter", content: "Secret", showTypewriter: false },
        gift: {
          giftType: "box" as const,
          boxTitle: "Box",
          boxSubtitle: "Sub",
          revealTitle: "Reveal",
          revealMessage: "Msg",
          cards: [],
        },
        finale: {
          title: "The End",
          message: "Bye",
          showForeverCounter: false,
          allowReplay: false,
          allowShare: false,
        },
      };

      const proposal: Partial<ProposalData> = {
        id: "prop_custom",
        yourName: "Sam",
        partnerName: "Alex",
        storyConfig: customStory,
      };

      const result = ensureStoryConfig(proposal);
      expect(result).toBe(customStory);
      expect(result.enabledScenes).toEqual(["intro", "letter", "finale"]);
      expect(result.intro.headline).toBe("Custom Welcome");
    });
  });

  describe("Proposal Response Tracking API (/api/proposals/[id]/response)", () => {
    it("successfully logs an acceptance event", async () => {
      const { POST, GET } = await import("@/app/api/proposals/[id]/response/route");
      const proposalId = `test_prop_resp_${Date.now()}`;

      const postReq = new Request(`http://localhost:3000/api/proposals/${proposalId}/response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "accepted",
          payload: { partnerName: "Simran", timestamp: new Date().toISOString() },
        }),
      });

      const postRes = await POST(postReq as any, { params: Promise.resolve({ id: proposalId }) });
      expect(postRes.status).toBe(200);
      const postJson = await postRes.json();
      expect(postJson.success).toBe(true);
      expect(postJson.data.logged).toBe(true);
      expect(postJson.data.eventType).toBe("accepted");

      // Verify retrieval (requires authentication as enforced by Finding 5)
      const { signToken } = await import("@/lib/admin-auth");
      const adminToken = signToken({ email: "admin@lovehub.test", role: "admin" });
      const getReq = new Request(`http://localhost:3000/api/proposals/${proposalId}/response`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const getRes = await GET(getReq as any, { params: Promise.resolve({ id: proposalId }) });
      expect(getRes.status).toBe(200);
      const getJson = await getRes.json();
      expect(getJson.success).toBe(true);
      expect(Array.isArray(getJson.data)).toBe(true);
      expect(getJson.data.some((e: any) => e.eventType === "accepted")).toBe(true);
    });

    it("successfully logs a quiz answer event", async () => {
      const { POST } = await import("@/app/api/proposals/[id]/response/route");
      const proposalId = `test_prop_quiz_${Date.now()}`;

      const postReq = new Request(`http://localhost:3000/api/proposals/${proposalId}/response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "quiz_answered",
          payload: { questionId: "q1", answer: "Nimii 👰🏻‍♀️" },
        }),
      });

      const postRes = await POST(postReq as any, { params: Promise.resolve({ id: proposalId }) });
      expect(postRes.status).toBe(200);
      const postJson = await postRes.json();
      expect(postJson.success).toBe(true);
      expect(postJson.data.eventType).toBe("quiz_answered");
    });
  });
});
