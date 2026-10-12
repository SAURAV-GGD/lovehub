"use client";

import React, { useState } from "react";
import { Film, Play, Sparkles, Video as VideoIcon } from "lucide-react";
import { extractYouTubeVideoId } from "@/lib/music";

interface BirthdayVideoSectionProps {
  videoUrl?: string;
  youtubeVideoId?: string;
  personName: string;
}

export function BirthdayVideoSection({
  videoUrl,
  youtubeVideoId,
  personName,
}: BirthdayVideoSectionProps) {
  const [isPlayingDirect, setIsPlayingDirect] = useState(false);

  // Determine YouTube ID if present
  const resolvedYtId =
    youtubeVideoId || (videoUrl ? extractYouTubeVideoId(videoUrl) : null);

  const isDirectVideo =
    Boolean(videoUrl) &&
    !resolvedYtId &&
    /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(videoUrl || "");

  if (!resolvedYtId && !videoUrl) {
    return null;
  }

  return (
    <section className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-[#E6DCC6] space-y-6 overflow-hidden">
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold uppercase tracking-wider">
          <Film className="w-3.5 h-3.5" /> Special Birthday Video Reel
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#14231F]">
          A Heartfelt Video Tribute for {personName}
        </h2>
        <p className="text-xs text-[#55655F]">
          Memories in motion, candid laughs, and special wishes
        </p>
      </div>

      <div className="relative max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-2xl bg-slate-950 border border-slate-800 aspect-video">
        {resolvedYtId ? (
          <iframe
            src={`https://www.youtube.com/embed/${resolvedYtId}?rel=0&modestbranding=1&playsinline=1`}
            title={`Birthday Video for ${personName}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0 rounded-2xl"
          />
        ) : isDirectVideo || videoUrl ? (
          <video
            src={videoUrl}
            controls
            playsInline
            preload="metadata"
            className="w-full h-full object-cover rounded-2xl"
            onPlay={() => setIsPlayingDirect(true)}
            onPause={() => setIsPlayingDirect(false)}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 text-xs">
            Video link unavailable
          </div>
        )}
      </div>
    </section>
  );
}
