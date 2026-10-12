"use client";

import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Music, Play, Pause } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { YouTubeAudioPlayer } from "@/components/music/youtube-audio-player";
import { extractYouTubeVideoId, getPresetAudioUrl } from "@/lib/music";

const BIRTHDAY_AUDIO_PRESETS: Record<string, string> = {
  "birthday-cheer": "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3",
  "festive-acoustic": "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3",
  "party-pop": "https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3",
  "romantic-piano": "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",
};

interface BirthdayMusicPlayerProps {
  music?: string;
  musicType?: "preset" | "youtube" | "custom" | "none";
  musicTitle?: string;
  customMusicUrl?: string;
  youtubeUrl?: string;
  youtubeVideoId?: string;
}

export function BirthdayMusicPlayer({
  music = "birthday-cheer",
  musicType = "preset",
  musicTitle,
  customMusicUrl,
  youtubeUrl,
  youtubeVideoId,
}: BirthdayMusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Resolve YouTube ID
  const resolvedYtId =
    youtubeVideoId || (youtubeUrl ? extractYouTubeVideoId(youtubeUrl) : null);

  // Resolve direct audio source URL
  const audioSourceUrl =
    musicType === "custom" && customMusicUrl
      ? customMusicUrl
      : customMusicUrl
      ? customMusicUrl
      : BIRTHDAY_AUDIO_PRESETS[music] || getPresetAudioUrl(music) || BIRTHDAY_AUDIO_PRESETS["birthday-cheer"];

  const effectiveTitle =
    musicTitle ||
    (resolvedYtId
      ? "YouTube Celebration Track"
      : music === "party-pop"
      ? "Party Celebration Beat"
      : music === "festive-acoustic"
      ? "Cozy Acoustic Melody"
      : "Joyful Birthday Anthem");

  // Handle HTML5 audio playback
  useEffect(() => {
    if (resolvedYtId || music === "none" || musicType === "none") return;

    if (audioSourceUrl) {
      const audio = new Audio(audioSourceUrl);
      audio.loop = true;
      audio.volume = 0.75;
      audioRef.current = audio;

      // Attempt gentle autoplay on first user interaction or mount
      const attemptPlay = () => {
        audio
          .play()
          .then(() => {
            setIsPlaying(true);
            setHasInteracted(true);
          })
          .catch(() => {
            // Autoplay blocked by browser policy
            setIsPlaying(false);
          });
      };

      attemptPlay();

      const handleUserTouch = () => {
        if (!hasInteracted && audioRef.current && audioRef.current.paused) {
          audioRef.current.play().then(() => {
            setIsPlaying(true);
            setHasInteracted(true);
          }).catch(() => {});
        }
      };

      window.addEventListener("click", handleUserTouch, { once: true });
      window.addEventListener("touchstart", handleUserTouch, { once: true });

      return () => {
        window.removeEventListener("click", handleUserTouch);
        window.removeEventListener("touchstart", handleUserTouch);
        audio.pause();
        audio.src = "";
      };
    }
  }, [audioSourceUrl, resolvedYtId, music, musicType]);

  const togglePlay = () => {
    setHasInteracted(true);
    if (resolvedYtId) {
      setIsPlaying(!isPlaying);
      return;
    }

    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  };

  const toggleMute = () => {
    if (resolvedYtId) {
      setIsMuted(!isMuted);
      return;
    }

    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  if (music === "none" || musicType === "none") {
    return null;
  }

  return (
    <>
      {/* Hidden YouTube background player if YouTube soundtrack is active */}
      {resolvedYtId && (
        <div className="hidden">
          <YouTubeAudioPlayer
            videoId={resolvedYtId}
            isPlaying={isPlaying}
            isMuted={isMuted}
            onReady={() => setIsPlaying(true)}
          />
        </div>
      )}

      {/* Floating Modern Audio Controller Pill */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-[#14231F]/90 backdrop-blur-md text-white px-3.5 py-2 rounded-full shadow-2xl border border-white/20 select-none text-xs"
      >
        <button
          type="button"
          onClick={togglePlay}
          className="flex items-center gap-2 hover:text-[#F2B134] transition-colors"
          title={isPlaying ? "Pause music" : "Play music"}
        >
          {isPlaying ? (
            <div className="flex items-end gap-0.5 h-3.5 w-3.5">
              <span className="w-0.5 bg-[#F2B134] animate-[bounce_0.8s_infinite] h-full" />
              <span className="w-0.5 bg-[#F2B134] animate-[bounce_1.2s_infinite] h-2" />
              <span className="w-0.5 bg-[#F2B134] animate-[bounce_0.6s_infinite] h-3" />
            </div>
          ) : (
            <Play className="w-3.5 h-3.5 text-white/80" />
          )}

          <span className="font-medium max-w-[130px] sm:max-w-[180px] truncate">
            {effectiveTitle}
          </span>
        </button>

        <div className="w-px h-3.5 bg-white/20" />

        <button
          type="button"
          onClick={toggleMute}
          className="p-1 hover:text-[#F2B134] transition-colors rounded-full"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <VolumeX className="w-3.5 h-3.5 text-rose-400" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-white/80" />
          )}
        </button>
      </motion.div>
    </>
  );
}
