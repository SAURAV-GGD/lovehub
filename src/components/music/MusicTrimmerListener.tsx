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
  Repeat,
  Music2,
  Disc3,
  Flame,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { getPresetAudioUrl } from "@/lib/music";
import { MusicSelectionState } from "./music-selector";
import { toast } from "sonner";

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

  // Handle timeupdate and seamless loop bounds
  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    setCurrentTime(cur);

    if (isPreviewingLoop) {
      const activeEnd = endSec || duration;
      if (activeEnd && cur >= activeEnd) {
        audioRef.current.currentTime = startSec;
        audioRef.current.play().catch(() => {});
      }
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
        .catch(() => {
          setIsPlaying(false);
          toast.error("Audio playback interrupted. Tap again to play.");
        });
    }
  };

  // Reversible, 2-way toggle for preview loop
  const togglePreviewLoop = () => {
    if (!audioRef.current) return;

    if (isPreviewingLoop) {
      // Turn OFF loop preview
      setIsPreviewingLoop(false);
      audioRef.current.pause();
      setIsPlaying(false);
      toast.info("Loop preview stopped");
    } else {
      // Turn ON loop preview
      audioRef.current.currentTime = startSec;
      setIsPreviewingLoop(true);
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          toast.success(
            `Looping from ${formatTime(startSec)} to ${
              endSec ? formatTime(endSec) : "end"
            } 🔁`
          );
        })
        .catch(() => {
          setIsPlaying(false);
          setIsPreviewingLoop(false);
        });
    }
  };

  const handleSeek = (newTime: number) => {
    if (!audioRef.current) return;
    const clamped = Math.max(0, Math.min(duration || 1000, newTime));
    audioRef.current.currentTime = clamped;
    setCurrentTime(clamped);
  };

  const handleSetCurrentAsStart = () => {
    const cur = Math.floor(currentTime);
    onStartSecChange(cur);
    if (endSec !== undefined && cur >= endSec) {
      onEndSecChange(undefined);
    }
    toast.success(`Start point set to ${formatTime(cur)} 📍`);
  };

  const handleSetCurrentAsEnd = () => {
    const cur = Math.ceil(currentTime);
    if (cur > startSec) {
      onEndSecChange(cur);
      toast.success(`End point set to ${formatTime(cur)} 🏁`);
    } else {
      toast.error("End time must be after Start time");
    }
  };

  const handleResetTrimming = () => {
    onStartSecChange(0);
    onEndSecChange(undefined);
    setIsPreviewingLoop(false);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
    toast.info("Trimming reset to full track");
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

  // Waveform heights for animated visualizer
  const visualizerHeights = [40, 75, 55, 90, 60, 100, 70, 85, 45, 95, 65, 80, 50, 90, 60, 40];

  return (
    <div className="rounded-2xl border border-rose-200/90 dark:border-rose-900/50 bg-gradient-to-b from-white via-rose-50/20 to-white dark:from-slate-900 dark:via-rose-950/10 dark:to-slate-900 p-4 sm:p-5 space-y-5 shadow-sm">
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

      {/* Header Info with Explanation Tooltip */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-xs">
            <Scissors className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Interactive Music Listener &amp; Studio Trimmer
              </h4>
              <InfoTooltip
                title="Soundtrack Precision Trimmer"
                description="Fine-tune the exact starting and ending seconds of your proposal music. Skip quiet intros to start directly on the chorus, or loop the most romantic musical climax seamlessly."
                tip="Use the 'Set to Current' buttons while listening to capture the exact timestamp in 1 tap!"
              />
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                Live Studio
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[240px] sm:max-w-md">
              {musicSelection.musicTitle || "Active Proposal Soundtrack"}
            </p>
          </div>
        </div>

        {(startSec > 0 || endSec !== undefined) && (
          <button
            type="button"
            onClick={handleResetTrimming}
            className="text-xs text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 font-medium flex items-center gap-1.5 cursor-pointer transition-colors px-2 py-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40"
            title="Reset to Full Track"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Mode A: Native Turntable Vinyl Player with Animated Rotating Record */}
      {resolvedAudioSrc && (
        <div className="space-y-4 p-4 rounded-2xl bg-stone-950 text-white border border-stone-800 shadow-xl overflow-hidden relative">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Row: Turntable Disc & Audio Waveform Visualizer */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            {/* Vintage Rotating Vinyl Record Disc */}
            <div className="relative group shrink-0">
              <div
                className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-stone-900 border-4 border-stone-800 shadow-2xl relative flex items-center justify-center transition-transform ${
                  isPlaying ? "animate-[spin_3.5s_linear_infinite]" : ""
                }`}
                style={{
                  backgroundImage:
                    "radial-gradient(circle at center, #1c1917 25%, #292524 35%, #0c0a09 45%, #292524 55%, #0c0a09 70%, #1c1917 100%)",
                }}
              >
                {/* Vinyl Grooves Rings */}
                <div className="absolute inset-2 rounded-full border border-stone-700/40 pointer-events-none" />
                <div className="absolute inset-4 rounded-full border border-stone-700/30 pointer-events-none" />
                <div className="absolute inset-6 rounded-full border border-stone-700/20 pointer-events-none" />

                {/* Center Record Label Badge */}
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-rose-600 to-pink-500 flex flex-col items-center justify-center shadow-inner border border-rose-300/40 relative z-10">
                  <Flame className="w-4 h-4 text-white animate-pulse" />
                  <span className="text-[6px] font-bold text-white uppercase tracking-tighter">
                    33 RPM
                  </span>
                  {/* Spindle Center Hole */}
                  <div className="absolute w-2 h-2 rounded-full bg-black border border-stone-700" />
                </div>
              </div>

              {/* Tonearm Stylus Visual */}
              <div
                className={`absolute -top-1 -right-1 w-8 h-12 pointer-events-none transition-transform duration-500 origin-top-right ${
                  isPlaying ? "rotate-12" : "-rotate-12 opacity-60"
                }`}
              >
                <div className="w-1 h-10 bg-gradient-to-b from-stone-400 to-stone-600 rounded-full mx-auto" />
                <div className="w-2.5 h-3 bg-rose-500 rounded-xs -mt-1 mx-auto shadow-xs" />
              </div>
            </div>

            {/* Middle Section: Title, Status & Dynamic Bouncing Equalizer Bars */}
            <div className="flex-1 w-full space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isPlaying ? "bg-rose-400 animate-ping" : "bg-stone-500"
                      }`}
                    />
                    {isPlaying ? (isPreviewingLoop ? "Previewing Loop 🔁" : "Now Playing 🎵") : "Paused"}
                  </span>
                  <span className="text-xs font-mono text-stone-400">
                    {formatTime(currentTime)} / {duration > 0 ? formatTime(duration) : "--:--"}
                  </span>
                </div>

                <div className="text-[11px] text-stone-400 font-medium">
                  Trimmed: <span className="text-rose-400 font-semibold">{formatTime(startSec)}</span>
                  {" → "}
                  <span className="text-indigo-400 font-semibold">
                    {endSec ? formatTime(endSec) : "Full Track"}
                  </span>
                </div>
              </div>

              {/* Animated Audio Equalizer Visualizer */}
              <div className="h-9 bg-stone-900/80 rounded-xl p-1.5 flex items-end justify-between gap-1 border border-stone-800">
                {visualizerHeights.map((maxH, idx) => {
                  const barProgress = duration > 0 ? currentTime / duration : 0;
                  const isPast = idx / visualizerHeights.length <= barProgress;
                  const inTrimSlice =
                    duration > 0 &&
                    idx / visualizerHeights.length >= startSec / duration &&
                    idx / visualizerHeights.length <= (endSec || duration) / duration;

                  return (
                    <div
                      key={idx}
                      className={`w-full rounded-full transition-all duration-150 ${
                        inTrimSlice
                          ? "bg-gradient-to-t from-rose-500 to-pink-400 shadow-xs"
                          : isPast
                          ? "bg-stone-500"
                          : "bg-stone-800"
                      }`}
                      style={{
                        height: isPlaying
                          ? `${Math.max(15, (Math.sin(currentTime * 5 + idx) * 0.5 + 0.5) * maxH)}%`
                          : inTrimSlice
                          ? "45%"
                          : "20%",
                      }}
                    />
                  );
                })}
              </div>

              {/* Range Slider & Active Trim Banner */}
              <div className="relative w-full h-5 flex items-center">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.25}
                  value={currentTime}
                  onChange={(e) => handleSeek(parseFloat(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-stone-800 accent-rose-500 focus:outline-none"
                  aria-label="Seek audio position"
                />

                {/* Highlighted Trim Slice on the timeline */}
                {duration > 0 && (
                  <div
                    className="absolute h-2 bg-rose-500/40 rounded-lg pointer-events-none border-x border-rose-400 shadow-sm"
                    style={{
                      left: `${(startSec / duration) * 100}%`,
                      width: `${(((endSec || duration) - startSec) / duration) * 100}%`,
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Bottom Controls Row: Play/Pause, Reversible Preview Loop & 1-Tap Stampers */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-stone-800/80">
            <div className="flex items-center gap-2">
              {/* Play / Pause Button */}
              <button
                type="button"
                onClick={togglePlay}
                className={`h-9 px-4 rounded-xl flex items-center gap-2 font-bold text-xs transition-all cursor-pointer shadow-md ${
                  isPlaying
                    ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30"
                    : "bg-white hover:bg-stone-100 text-stone-900"
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    <span>Play Song</span>
                  </>
                )}
              </button>

              {/* Reversible Preview Loop Button with ? Explainer */}
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={togglePreviewLoop}
                  className={`h-9 text-xs font-semibold gap-1.5 cursor-pointer transition-all ${
                    isPreviewingLoop
                      ? "border-rose-500 bg-rose-600 text-white ring-2 ring-rose-400 hover:bg-rose-700"
                      : "border-stone-700 bg-stone-900 text-stone-200 hover:bg-stone-800 hover:text-white hover:border-rose-400"
                  }`}
                  title={
                    isPreviewingLoop
                      ? "Click to stop loop preview"
                      : "Click to preview this trimmed loop"
                  }
                >
                  <Repeat
                    className={`w-3.5 h-3.5 ${
                      isPreviewingLoop ? "animate-spin text-white" : "text-rose-400"
                    }`}
                  />
                  <span>
                    {isPreviewingLoop ? "Stop Loop ⏹️" : "Preview Loop"}
                  </span>
                </Button>
                {/* Info Tooltip for Preview Loop */}
                <InfoTooltip
                  title="Preview Loop Feature"
                  description="Plays only your selected slice (from Start Time to End Time) on continuous repeat. This lets you hear the exact seamless loop your partner will hear when reading your proposal."
                  tip="Click the button again anytime to toggle it off or resume standard playback."
                />
              </div>
            </div>

            {/* 1-Tap Timestamp Stampers */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={handleSetCurrentAsStart}
                className="text-[11px] px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 hover:text-white hover:border-rose-400 font-semibold transition-all flex items-center gap-1 cursor-pointer"
                title="Capture current song timestamp as the starting point"
              >
                <Clock className="w-3 h-3 text-rose-400" />
                <span>Start = {formatTime(currentTime)}</span>
              </button>

              <button
                type="button"
                onClick={handleSetCurrentAsEnd}
                disabled={currentTime <= startSec}
                className="text-[11px] px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 hover:text-white hover:border-indigo-400 font-semibold transition-all flex items-center gap-1 disabled:opacity-30 cursor-pointer"
                title="Capture current song timestamp as the loop end point"
              >
                <Clock className="w-3 h-3 text-indigo-400" />
                <span>End = {formatTime(currentTime)}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode B: YouTube Specific Notice */}
      {isYouTube && (
        <div className="p-3.5 rounded-xl bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-xs text-red-900 dark:text-red-200 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-red-600" />
            <span>YouTube Stream Trimming Active</span>
            <InfoTooltip
              title="YouTube Cloud Streaming"
              description="Enter your target start and end timestamps in seconds. When your partner opens your proposal, YouTube automatically skips directly to your chosen moment (e.g. skips the video intro straight to the romantic chorus)."
            />
          </div>
          <p className="text-[11px] text-red-800/80 dark:text-red-300/80 leading-relaxed">
            Enter the exact start and end timestamps in seconds below. When your partner views the proposal, YouTube will start streaming automatically from your chosen moment.
          </p>
        </div>
      )}

      {/* Precision Numeric Time Setters with Interactive -1s / +1s and Tooltips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Start Time Box */}
        <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <span>Start Time</span>
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">
                ({formatTime(startSec)})
              </span>
              <InfoTooltip
                title="Start Timestamp"
                description="The exact second where your music starts playing when your partner opens the proposal. Use this to skip silent intros or jump straight to the chorus."
                tip="You can use the -1s and +1s buttons for micro-adjustments."
              />
            </label>
            <span className="text-[10px] text-slate-500 font-medium">Seconds</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onStartSecChange(Math.max(0, startSec - 1))}
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 hover:border-rose-400 cursor-pointer transition-colors active:scale-95"
            >
              -1s
            </button>
            <Input
              type="number"
              min={0}
              value={startSec}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                onStartSecChange(isNaN(val) ? 0 : Math.max(0, val));
              }}
              className="h-8 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-center"
            />
            <button
              type="button"
              onClick={() => onStartSecChange(startSec + 1)}
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 hover:border-rose-400 cursor-pointer transition-colors active:scale-95"
            >
              +1s
            </button>
          </div>
          <p className="text-[10px] text-slate-500">Audio begins at this exact timestamp</p>
        </div>

        {/* End Time Box */}
        <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <span>End Time (Optional)</span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                ({endSec ? formatTime(endSec) : "Full Song"})
              </span>
              <InfoTooltip
                title="End Timestamp & Looping"
                description="Optional. When playback reaches this second, it seamlessly loops back to your start timestamp so your proposal never has awkward silence. Leave blank to let the entire song play out."
                tip="To reset to full song, simply clear the input box."
              />
            </label>
            <span className="text-[10px] text-slate-500 font-medium">Seconds</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                const currentEnd = endSec ?? (duration ? Math.floor(duration) : 60);
                if (currentEnd > startSec + 1) {
                  onEndSecChange(currentEnd - 1);
                }
              }}
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 hover:border-indigo-400 cursor-pointer transition-colors active:scale-95"
            >
              -1s
            </button>
            <Input
              type="number"
              min={startSec + 1}
              value={endSec ?? ""}
              placeholder="Full track (e.g. 180)"
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (isNaN(val) || val <= 0) {
                  onEndSecChange(undefined);
                } else {
                  onEndSecChange(val > startSec ? val : undefined);
                }
              }}
              className="h-8 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-center"
            />
            <button
              type="button"
              onClick={() => {
                const currentEnd = endSec ?? (duration ? Math.floor(duration) : 60);
                onEndSecChange(currentEnd + 1);
              }}
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 hover:border-indigo-400 cursor-pointer transition-colors active:scale-95"
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
