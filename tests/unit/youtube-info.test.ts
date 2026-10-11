import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/music/youtube-info/route";
import { NextRequest } from "next/server";

describe("YouTube Info API Route", () => {
  it("should return 400 if url or id is missing", async () => {
    const req = new NextRequest("http://localhost:3000/api/music/youtube-info");
    const res = await GET(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it("should return 400 for completely invalid URL", async () => {
    const req = new NextRequest("http://localhost:3000/api/music/youtube-info?url=https://example.com/not-youtube");
    const res = await GET(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it("should extract videoId and return thumbnail for a valid YouTube URL", async () => {
    const req = new NextRequest("http://localhost:3000/api/music/youtube-info?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.videoId).toBe("dQw4w9WgXcQ");
    expect(json.thumbnail).toContain("dQw4w9WgXcQ");
  });
});
