import { describe, it, expect } from "vitest";
import { extractYouTubeVideoId, CURATED_MUSIC_PRESETS, getPresetAudioUrl } from "@/lib/music";

describe("Music Utilities & YouTube Parser", () => {
  it("should extract 11-char ID from standard youtube.com watch URL", () => {
    const id = extractYouTubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(id).toBe("dQw4w9WgXcQ");
  });

  it("should extract ID from youtu.be short URL", () => {
    const id = extractYouTubeVideoId("https://youtu.be/dQw4w9WgXcQ?si=test1234");
    expect(id).toBe("dQw4w9WgXcQ");
  });

  it("should extract ID from music.youtube.com URL", () => {
    const id = extractYouTubeVideoId("https://music.youtube.com/watch?v=kJQP7kiw5Fk&feature=share");
    expect(id).toBe("kJQP7kiw5Fk");
  });

  it("should extract ID from youtube.com/shorts/ URL", () => {
    const id = extractYouTubeVideoId("https://www.youtube.com/shorts/9bZkp7q19f0");
    expect(id).toBe("9bZkp7q19f0");
  });

  it("should extract ID when given a raw 11-char string", () => {
    const id = extractYouTubeVideoId("dQw4w9WgXcQ");
    expect(id).toBe("dQw4w9WgXcQ");
  });

  it("should return null for invalid URLs", () => {
    expect(extractYouTubeVideoId("https://google.com")).toBeNull();
    expect(extractYouTubeVideoId("")).toBeNull();
    expect(extractYouTubeVideoId("not-a-valid-id")).toBeNull();
  });

  it("should resolve curated presets and URLs", () => {
    expect(CURATED_MUSIC_PRESETS.length).toBeGreaterThanOrEqual(6);
    const pianoUrl = getPresetAudioUrl("romantic-piano");
    expect(pianoUrl).toBeTruthy();
    expect(pianoUrl).toContain(".mp3");
  });
});
