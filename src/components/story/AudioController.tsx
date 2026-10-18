"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Volume2, VolumeX, Music } from "lucide-react";
import { getPresetAudioUrl, extractYouTubeVideoId } from "@/lib/music";
import { YouTubeAudioPlayer } from "@/components/music/youtube-audio-player";

interface AudioControllerProps {
  musicType?: "preset" | "youtube" | "custom" | "none";
  presetName?: string;
  customMusicUrl?: string;
  youtubeVideoId?: string;
  youtubeUrl?: string;
  musicTitle?: string;
  autoStart?: boolean;
}

export function AudioController({
  musicType = "preset",
  presetName = "romantic-piano",
  customMusicUrl,
  youtubeVideoId,
  youtubeUrl,
  musicTitle = "Romantic Melody",
  autoStart = false,
}: AudioControllerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const resolvedVideoId =
    youtubeVideoId || (youtubeUrl ? extractYouTubeVideoId(youtubeUrl) || "" : "");

  const audioSrc =
    musicType === "custom" && customMusicUrl
      ? customMusicUrl
      : musicType === "preset"
      ? getPresetAudioUrl(presetName)
      : null;

  const togglePlay = useCallback(() => {
    setHasInteracted(true);
    if (!audioRef.current && musicType !== "youtube") return;

    if (musicType === "youtube") {
      setIsPlaying((prev) => !prev);
      return;
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.volume = 0.5;
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    }
  }, [isPlaying, musicType]);

  useEffect(() => {
    if (autoStart && !hasInteracted && audioRef.current) {
      audioRef.current.volume = 0.4;
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setHasInteracted(true);
        })
        .catch(() => {
          // Autoplay policy prevented playback, waits for user interaction
        });
    }
  }, [autoStart, hasInteracted]);

  if (musicType === "none") return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      {/* HTML Audio element for preset/custom MP3 */}
      {audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          loop
          preload="auto"
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Hidden YouTube background player if musicType is YouTube */}
      {musicType === "youtube" && resolvedVideoId && (
        <div className="hidden">
          <YouTubeAudioPlayer
            videoId={resolvedVideoId}
            isPlaying={isPlaying}
            isMuted={!isPlaying}
          />
        </div>
      )}

      <button
        onClick={togglePlay}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-pink-500/30 text-white shadow-lg transition-all hover:scale-105 active:scale-95 group"
        title={isPlaying ? "Mute music" : "Play music"}
        aria-label={isPlaying ? "Mute music" : "Play music"}
      >
        {isPlaying ? (
          <>
            <Volume2 className="w-4 h-4 text-pink-400 animate-pulse" />
            <span className="text-xs font-medium tracking-wide hidden sm:inline max-w-[120px] truncate text-pink-200">
              {musicTitle}
            </span>
          </>
        ) : (
          <>
            <VolumeX className="w-4 h-4 text-gray-400 group-hover:text-pink-300" />
            <span className="text-xs text-gray-300 hidden sm:inline">Play Music</span>
          </>
        )}
      </button>
    </div>
  );
}
