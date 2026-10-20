"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Scissors,
  Clock,
  Sparkles,
  HelpCircle,
  Repeat,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPresetAudioUrl } from "@/lib/music";
import { MusicSelectionState } from "./music-selector";

interface MusicTrimmerListenerProps {
  musicSelection: MusicSelectionState;
  startSec: number;
  endSec?: number;
  onStartSecChange: (sec: number) => void;
  onEndSecChange: (sec?: number) => void;
  hasMusicPlan: boolean;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function MusicTrimmerListener({
  musicSelection,
  startSec,
  endSec,
  onStartSecChange,
  onEndSecChange,
  hasMusicPlan,
}: MusicTrimmerListenerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPreviewingLoop, setIsPreviewingLoop] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Determine actual audio URL if it's preset or custom upload
  const resolvedAudioSrc =
    musicSelection.type === "custom" && musicSelection.customAudioUrl
      ? musicSelection.customAudioUrl
      : musicSelection.type === "preset" && musicSelection.presetId
      ? getPresetAudioUrl(musicSelection.presetId)
      : null;

  const isYouTube = musicSelection.type === "youtube";
  const isSilent = musicSelection.type === "none" || !hasMusicPlan;

  // Cleanup audio when unmounting or switching tracks
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [resolvedAudioSrc]);

  // Handle timeupdate and loop bounds
  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    setCurrentTime(cur);

    if (isPreviewingLoop && endSec && cur >= endSec) {
      audioRef.current.currentTime = startSec;
      audioRef.current.play().catch(() => {});
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      setIsPreviewingLoop(false);
    } else {
      setIsPreviewingLoop(false);
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const playTrimmedLoop = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = startSec;
    setIsPreviewingLoop(true);
    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  };

  const handleSeek = (newTime: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(duration || 1000, newTime));
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleSetCurrentAsStart = () => {
    const cur = Math.floor(currentTime);
    onStartSecChange(cur);
    if (endSec !== undefined && cur >= endSec) {
      onEndSecChange(undefined);
    }
  };

  const handleSetCurrentAsEnd = () => {
    const cur = Math.ceil(currentTime);
    if (cur > startSec) {
      onEndSecChange(cur);
    }
  };

  const handleResetTrimming = () => {
    onStartSecChange(0);
    onEndSecChange(undefined);
    setIsPreviewingLoop(false);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  if (isSilent) {
    return (
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 text-center space-y-1.5">
        <Volume2 className="w-5 h-5 text-slate-400 mx-auto" />
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Audio trimming is disabled because no background track is selected
        </p>
        <p className="text-[11px] text-slate-500">
          Choose a Curated Preset, YouTube song, or upload a custom Voice Note above to activate the live trimmer.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-rose-200/90 dark:border-rose-900/50 bg-white dark:bg-slate-900 p-4 space-y-4 shadow-sm">
      {/* Hidden Audio Element for direct playback */}
      {resolvedAudioSrc && (
        <audio
          ref={audioRef}
          src={resolvedAudioSrc}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => {
            if (isPreviewingLoop) {
              if (audioRef.current) {
                audioRef.current.currentTime = startSec;
                audioRef.current.play().catch(() => {});
              }
            } else {
              setIsPlaying(false);
            }
          }}
        />
      )}

      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20">
            <Scissors className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>Interactive Music Listener &amp; Trimmer</span>
              <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                Live Precision
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[240px] sm:max-w-xs">
              {musicSelection.musicTitle || "Active Proposal Soundtrack"}
            </p>
          </div>
        </div>

        {(startSec > 0 || endSec !== undefined) && (
          <button
            type="button"
            onClick={handleResetTrimming}
            className="text-[11px] text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 font-medium flex items-center gap-1 cursor-pointer transition-colors"
            title="Reset to Full Track"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Mode A: Native Audio Player & Waveform Timeline (Presets & Custom MP3/M4A/Voice Notes) */}
      {resolvedAudioSrc && (
        <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
          {/* Player Bar & Time Display */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={togglePlay}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition-all cursor-pointer shadow-sm ${
                isPlaying
                  ? "bg-rose-600 shadow-rose-500/30 scale-105"
                  : "bg-slate-900 dark:bg-rose-600 hover:bg-rose-600"
              }`}
              title={isPlaying ? "Pause Track" : "Play Track"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 fill-white ml-0.5" />
              )}
            </button>

            {/* Playhead Slider & Trim Visualizer */}
            <div className="flex-1 space-y-1">
              <div className="relative w-full h-5 flex items-center">
                {/* Background Track Bar */}
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.5}
                  value={currentTime}
                  onChange={(e) => handleSeek(parseFloat(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-200 dark:bg-slate-800 accent-rose-500 focus:outline-none"
                />

                {/* Trimmed active region indicator */}
                {duration > 0 && (
                  <div
                    className="absolute h-2 bg-rose-500/30 rounded-lg pointer-events-none"
                    style={{
                      left: `${(startSec / duration) * 100}%`,
                      width: `${(((endSec || duration) - startSec) / duration) * 100}%`,
                    }}
                  />
                )}
              </div>

              <div className="flex justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                <span>{formatTime(currentTime)}</span>
                <span>{duration > 0 ? formatTime(duration) : "--:--"}</span>
              </div>
            </div>

            {/* Preview Trimmed Loop Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={playTrimmedLoop}
              className={`h-8 text-xs font-semibold gap-1.5 cursor-pointer shrink-0 ${
                isPreviewingLoop
                  ? "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 ring-1 ring-rose-500"
                  : "border-slate-200 dark:border-slate-800 hover:border-rose-300"
              }`}
              title="Plays strictly between Start and End time"
            >
              <Repeat className={`w-3.5 h-3.5 ${isPreviewingLoop ? "animate-spin text-rose-500" : ""}`} />
              <span className="hidden sm:inline">Preview Loop</span>
            </Button>
          </div>

          {/* 1-Tap Timestamp Stampers */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleSetCurrentAsStart}
              className="text-[11px] px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-400 text-slate-700 dark:text-slate-300 font-semibold transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <Clock className="w-3 h-3 text-rose-500" />
              <span>Set Start to Current ({formatTime(currentTime)})</span>
            </button>

            <button
              type="button"
              onClick={handleSetCurrentAsEnd}
              disabled={currentTime <= startSec}
              className="text-[11px] px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-400 text-slate-700 dark:text-slate-300 font-semibold transition-colors flex items-center gap-1 shadow-2xs disabled:opacity-40 cursor-pointer"
            >
              <Clock className="w-3 h-3 text-indigo-500" />
              <span>Set End to Current ({formatTime(currentTime)})</span>
            </button>
          </div>
        </div>
      )}

      {/* Mode B: YouTube Specific Notice */}
      {isYouTube && (
        <div className="p-3 rounded-xl bg-red-50/60 dark:bg-red-950/20 border border-red-200/80 dark:border-red-900/40 text-xs text-red-900 dark:text-red-200 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-red-600" />
            <span>YouTube Stream Trimming Active</span>
          </div>
          <p className="text-[11px] text-red-800/80 dark:text-red-300/80 leading-relaxed">
            Enter the exact start and end timestamps in seconds below. When your partner views the proposal, YouTube will start streaming automatically from your chosen moment (e.g., skip introductory dialogue directly to the chorus).
          </p>
        </div>
      )}

      {/* Precision Numeric Time Setters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Start Time Box */}
        <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <span>Start Time</span>
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">
                ({formatTime(startSec)})
              </span>
            </label>
            <span className="text-[10px] text-slate-500">Seconds</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onStartSecChange(Math.max(0, startSec - 1))}
              className="w-7 h-8 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
            >
              -1s
            </button>
            <Input
              type="number"
              min={0}
              value={startSec}
              onChange={(e) => onStartSecChange(Math.max(0, parseInt(e.target.value) || 0))}
              className="h-8 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-center"
            />
            <button
              type="button"
              onClick={() => onStartSecChange(startSec + 1)}
              className="w-7 h-8 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
            >
              +1s
            </button>
          </div>
          <p className="text-[10px] text-slate-500">Audio begins at this exact timestamp</p>
        </div>

        {/* End Time Box */}
        <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <span>End Time (Optional)</span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                ({endSec ? formatTime(endSec) : "Full Song"})
              </span>
            </label>
            <span className="text-[10px] text-slate-500">Seconds</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                if (endSec !== undefined && endSec > startSec + 1) {
                  onEndSecChange(endSec - 1);
                }
              }}
              disabled={!endSec}
              className="w-7 h-8 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
            >
              -1s
            </button>
            <Input
              type="number"
              min={startSec + 1}
              value={endSec ?? ""}
              placeholder="Full track (or e.g. 180)"
              onChange={(e) => {
                const val = parseInt(e.target.value);
                onEndSecChange(val > startSec ? val : undefined);
              }}
              className="h-8 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-center"
            />
            <button
              type="button"
              onClick={() => {
                onEndSecChange((endSec || (duration ? Math.floor(duration) : 60)) + 1);
              }}
              className="w-7 h-8 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
            >
              +1s
            </button>
          </div>
          <p className="text-[10px] text-slate-500">Loops seamlessly back to start time</p>
        </div>
      </div>
    </div>
  );
}
