import { NextRequest, NextResponse } from "next/server";
import { extractYouTubeVideoId, getYouTubeThumbnail } from "@/lib/music";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("url") || searchParams.get("id");

    if (!query) {
      return NextResponse.json(
        { success: false, error: "Missing YouTube URL or video ID" },
        { status: 400 }
      );
    }

    const videoId = extractYouTubeVideoId(query);

    if (!videoId) {
      return NextResponse.json(
        { success: false, error: "Invalid YouTube URL. Please provide a valid YouTube or YouTube Music link." },
        { status: 400 }
      );
    }

    const defaultThumbnail = getYouTubeThumbnail(videoId);

    // Fetch official oEmbed metadata (Free, no API key needed)
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      const response = await fetch(oembedUrl, {
        headers: { "User-Agent": "LoveHub-Audio-Fetcher/1.0" },
        next: { revalidate: 3600 }, // Cache for 1 hour
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          success: true,
          videoId,
          title: data.title || "Romantic Melody",
          author: data.author_name || "YouTube Creator",
          thumbnail: data.thumbnail_url || defaultThumbnail,
        });
      }
    } catch {
      // Graceful fallback to default thumbnail & placeholder title
    }

    return NextResponse.json({
      success: true,
      videoId,
      title: "YouTube Romantic Track",
      author: "YouTube",
      thumbnail: defaultThumbnail,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
