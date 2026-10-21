"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Volume2, VolumeX, Sparkles } from "lucide-react";
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
  volume = 0.8,
}: AudioControllerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const resolvedVideoId =
    youtubeVideoId || (youtubeUrl ? extractYouTubeVideoId(youtubeUrl) || "" : "");

  const resolvedMusicType =
    musicType === "youtube" || resolvedVideoId
      ? "youtube"
      : musicType === "custom" && customMusicUrl
      ? "custom"
      : musicType === "none"
      ? "none"
      : "preset";

  const audioSrc =
    resolvedMusicType === "custom" && customMusicUrl
      ? customMusicUrl
      : resolvedMusicType === "preset"
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

    if (resolvedMusicType === "youtube") {
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
  }, [isPlaying, resolvedMusicType, playAudio]);

  // Handle timestamp limits and looping for HTML audio
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

  // Autoplay attempt on autoStart trigger (e.g. clicking Start Story button)
  useEffect(() => {
    if (autoStart) {
      setIsPlaying(true);
      setAutoplayBlocked(false);
      if (audioRef.current) {
        playAudio();
      }
    }
  }, [autoStart, playAudio]);

  // Global one-time user interaction listener to unblock audio on mobile / desktop browsers
  useEffect(() => {
    const handleFirstGesture = () => {
      setHasInteracted(true);
      setIsPlaying(true);
      setAutoplayBlocked(false);
      if (audioRef.current) {
        audioRef.current.volume = Math.max(0, Math.min(1, volume));
        audioRef.current.play().catch(() => {});
      }
    };

    window.addEventListener("click", handleFirstGesture, { once: true });
    window.addEventListener("touchstart", handleFirstGesture, { once: true });
    window.addEventListener("pointerdown", handleFirstGesture, { once: true });

    return () => {
      window.removeEventListener("click", handleFirstGesture);
      window.removeEventListener("touchstart", handleFirstGesture);
      window.removeEventListener("pointerdown", handleFirstGesture);
    };
  }, [volume]);

  if (resolvedMusicType === "none") return null;

  return (
    <div className="fixed top-[max(1rem,env(safe-area-inset-top,1rem))] right-[max(1rem,env(safe-area-inset-right,1rem))] z-50 flex items-center gap-2">
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

      {/* YouTube background player - NOT hidden with display:none so browser audio remains 100% active */}
      {resolvedMusicType === "youtube" && resolvedVideoId && (
        <YouTubeAudioPlayer
          videoId={resolvedVideoId}
          isPlaying={isPlaying}
          isMuted={!isPlaying}
          startTimestampSeconds={startTimestampSeconds}
          endTimestampSeconds={endTimestampSeconds}
        />
      )}

      {/* Autoplay blocked notification pill */}
      {autoplayBlocked && !isPlaying && (
        <button
          onClick={togglePlay}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-600/90 hover:bg-pink-500 text-white shadow-lg text-xs font-medium animate-pulse cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>Tap for music 🎵</span>
        </button>
      )}

      {/* Audio toggle button */}
      <button
        onClick={togglePlay}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-pink-500/30 text-white shadow-lg transition-all hover:scale-105 active:scale-95 group cursor-pointer"
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
