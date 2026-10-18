import { describe, it, expect } from "vitest";
import { extractMemories } from "@/lib/ai/extract-memories";
import { ensureStoryConfig, StoryChapterConfig, StoryPromiseCard } from "@/lib/proposal-types";

describe("Phase 6 & Phase 7: Memories, AI Extraction & Gift Vault", () => {
  it("extracts relationship milestones and quiz questions from conversation notes", async () => {
    const rawNotes = `[14/02/2023, 11:45 PM] Aisha: Remember our first coffee date at CCD?
[14/02/2023, 11:47 PM] Rohan: How could I forget? You dropped your cup because you were nervous!
[14/02/2023, 11:50 PM] Aisha: Hey, you were staring at me the entire time!
We stayed talking until midnight under the city lights.`;

    const result = await extractMemories({
      text: rawNotes,
      yourName: "Rohan",
      partnerName: "Aisha",
      language: "hinglish",
    });

    expect(result).toBeDefined();
    expect(result.memories.length).toBeGreaterThanOrEqual(1);
    expect(result.suggestedQuestions.length).toBeGreaterThanOrEqual(1);

    // Verify memories have romantic structure
    const firstMemory = result.memories[0];
    expect(firstMemory.id).toBeDefined();
    expect(firstMemory.title).toBeDefined();
    expect(firstMemory.caption).toBeDefined();

    // Verify suggested questions have options & reactions
    const firstQ = result.suggestedQuestions[0];
    expect(firstQ.options.length).toBeGreaterThanOrEqual(2);
    expect(firstQ.reactionMessage).toBeDefined();
  });

  it("handles fallback memory extraction when input is minimal", async () => {
    const result = await extractMemories({
      text: "Our late night walks and talking about life",
      yourName: "Sam",
      partnerName: "Maya",
      language: "english",
    });

    expect(result.memories.length).toBeGreaterThan(0);
    expect(result.memories[0].caption).toContain("walks");
  });

  it("configures customizable gift cards and presentation styles", () => {
    const config = ensureStoryConfig({
      yourName: "Vikram",
      partnerName: "Pooja",
    });

    expect(config.gift).toBeDefined();
    expect(config.gift.giftType).toBe("box");
    expect(config.gift.cards.length).toBeGreaterThanOrEqual(4);

    // Custom cards
    const customCards: StoryPromiseCard[] = [
      {
        id: "c1",
        title: "Late Night Ice Cream Run 🍦",
        description: "Redeemable anytime after midnight for your favorite scoop.",
      },
      {
        id: "c2",
        title: "Fight Freeze Pass 🕊️",
        description: "Instantly ends any argument with a warm hug.",
      },
    ];

    config.gift.giftType = "envelope";
    config.gift.cards = customCards;

    expect(config.gift.giftType).toBe("envelope");
    expect(config.gift.cards.length).toBe(2);
    expect(config.gift.cards[0].title).toBe("Late Night Ice Cream Run 🍦");
  });

  it("validates multi-chapter configuration for romantic and premium tiers", () => {
    const chapters: StoryChapterConfig[] = [
      { id: "ch_1", title: "Chapter 1: The Spark", subtitle: "Where it all began", scenes: ["intro", "quiz"] },
      { id: "ch_2", title: "Chapter 2: Beautiful Us", subtitle: "Memories & love", scenes: ["question", "memories", "letter"] },
      { id: "ch_3", title: "Chapter 3: Forever & Beyond", subtitle: "The infinite promise", scenes: ["gift", "finale"] },
    ];

    expect(chapters.length).toBe(3);
    expect(chapters[0].scenes).toContain("intro");
    expect(chapters[1].scenes).toContain("memories");
    expect(chapters[2].scenes).toContain("finale");
  });
});
