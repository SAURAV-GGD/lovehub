import { describe, it, expect } from "vitest";
import { ensureStoryConfig, StoryConfig } from "@/lib/proposal-types";

describe("Phase 5: Canvas Love Letter & Audio Controller", () => {
  it("ensures letter scene includes fontStyle and waxSealText defaults", () => {
    const config = ensureStoryConfig({
      yourName: "Aryan",
      partnerName: "Simran",
    });

    expect(config.letter).toBeDefined();
    expect(config.letter.fontStyle).toBe("playfair");
    expect(config.letter.waxSealText).toBe("Sealed with Love 🤍");
    expect(config.letter.showTypewriter).toBe(true);
    expect(config.letter.typingSpeedMs).toBe(25);
  });

  it("supports custom letter font styles and content", () => {
    const customConfig: StoryConfig = {
      ...ensureStoryConfig({
        yourName: "Kabir",
        partnerName: "Preeti",
      }),
      letter: {
        title: "A Handwritten Note",
        content: "You are my entire world.",
        fontStyle: "cursive",
        waxSealText: "Eternal Promise 💍",
        showTypewriter: false,
      },
    };

    expect(customConfig.letter.fontStyle).toBe("cursive");
    expect(customConfig.letter.waxSealText).toBe("Eternal Promise 💍");
    expect(customConfig.letter.showTypewriter).toBe(false);
  });

  it("supports precision audio trimming parameters", () => {
    const config = ensureStoryConfig({
      yourName: "Rahul",
      partnerName: "Anjali",
    });

    config.audio = {
      enabled: true,
      musicType: "preset",
      presetName: "romantic-piano",
      musicTitle: "Romantic Piano Melody",
      startTimestampSeconds: 15,
      endTimestampSeconds: 120,
      volume: 0.7,
    };

    expect(config.audio.startTimestampSeconds).toBe(15);
    expect(config.audio.endTimestampSeconds).toBe(120);
    expect(config.audio.volume).toBe(0.7);
    expect(config.audio.enabled).toBe(true);
  });
});
