"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Volume2, VolumeX, Music, Sparkles } from "lucide-react";
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
  startTimestampSeconds?: number;
  endTimestampSeconds?: number;
  volume?: number;
}

export function AudioController({
  musicType = "preset",
  presetName = "romantic-piano",
  customMusicUrl,
  youtubeVideoId,
  youtubeUrl,
  musicTitle = "Romantic Melody",
  autoStart = false,
  startTimestampSeconds = 0,
  endTimestampSeconds,
  volume = 0.5,
}: AudioControllerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const resolvedVideoId =
    youtubeVideoId || (youtubeUrl ? extractYouTubeVideoId(youtubeUrl) || "" : "");

  const audioSrc =
    musicType === "custom" && customMusicUrl
      ? customMusicUrl
      : musicType === "preset"
      ? getPresetAudioUrl(presetName)
      : null;

  const playAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
      if (startTimestampSeconds > 0 && audioRef.current.currentTime < startTimestampSeconds) {
        audioRef.current.currentTime = startTimestampSeconds;
      }
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setAutoplayBlocked(false);
        })
        .catch(() => {
          setIsPlaying(false);
          setAutoplayBlocked(true);
        });
    }
  }, [volume, startTimestampSeconds]);

  const togglePlay = useCallback(() => {
    setHasInteracted(true);
    setAutoplayBlocked(false);
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
        playAudio();
      }
    }
  }, [isPlaying, musicType, playAudio]);

  // Handle timestamp limits and looping
  useEffect(() => {
    const el = audioRef.current;
    if (!el || !endTimestampSeconds) return;

    const onTimeUpdate = () => {
      if (endTimestampSeconds && el.currentTime >= endTimestampSeconds) {
        el.currentTime = startTimestampSeconds || 0;
      }
    };

    el.addEventListener("timeupdate", onTimeUpdate);
    return () => el.removeEventListener("timeupdate", onTimeUpdate);
  }, [endTimestampSeconds, startTimestampSeconds]);

  // Autoplay attempt on mount or interaction
  useEffect(() => {
    if (autoStart && !hasInteracted && audioRef.current) {
      playAudio();
    }
  }, [autoStart, hasInteracted, playAudio]);

  // Global one-time interaction listener to unblock autoplay if blocked
  useEffect(() => {
    if (!autoplayBlocked) return;

    const handleFirstTap = () => {
      if (autoplayBlocked && audioRef.current) {
        playAudio();
      }
    };

    window.addEventListener("pointerdown", handleFirstTap, { once: true });
    return () => window.removeEventListener("pointerdown", handleFirstTap);
  }, [autoplayBlocked, playAudio]);

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
          onEnded={() => {
            if (audioRef.current && startTimestampSeconds > 0) {
              audioRef.current.currentTime = startTimestampSeconds;
              audioRef.current.play().catch(() => {});
            } else {
              setIsPlaying(false);
            }
          }}
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

      {/* Autoplay blocked notification pill */}
      {autoplayBlocked && !isPlaying && (
        <button
          onClick={togglePlay}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-600/90 hover:bg-pink-500 text-white shadow-lg text-xs font-medium animate-pulse"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>Tap for music 🎵</span>
        </button>
      )}

      {/* Audio toggle button */}
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
            <span className="text-xs text-gray-400 group-hover:text-pink-200 hidden sm:inline">
              Music
            </span>
          </>
        )}
      </button>
    </div>
  );
}
