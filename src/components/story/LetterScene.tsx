"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Heart, Sparkles, ArrowRight, RotateCcw, FastForward, Play, Pause, Volume2, VolumeX } from "lucide-react";

interface LetterSceneProps {
  title?: string;
  content: string;
  typingSpeedMs?: number;
  showTypewriter?: boolean;
  fontStyle?: "playfair" | "poppins" | "serif" | "cursive" | "vintage";
  waxSealText?: string;
  onProceed: () => void;
}

export function LetterScene({
  title = "A Letter Straight From My Heart 💌",
  content,
  typingSpeedMs = 25,
  showTypewriter = true,
  fontStyle = "playfair",
  waxSealText = "Sealed with Love 🤍",
  onProceed,
}: LetterSceneProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(showTypewriter);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(typingSpeedMs);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Soft typewriter sound using Web Audio API
  const playTypewriterSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(500 + Math.random() * 200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.025);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.025);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.025);
    } catch {
      // Audio not allowed or unavailable
    }
  }, [soundEnabled]);

  // Typewriter effect
  useEffect(() => {
    if (!showTypewriter) {
      setDisplayedText(content);
      setIsTyping(false);
      return;
    }

    if (isPaused) return;

    const interval = setInterval(() => {
      if (indexRef.current < content.length) {
        const nextChar = content.charAt(indexRef.current);
        setDisplayedText((prev) => prev + nextChar);
        indexRef.current += 1;

        if (nextChar !== " " && nextChar !== "\n") {
          playTypewriterSound();
        }

        // Auto-scroll container as text types
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [content, showTypewriter, speed, isPaused, playTypewriterSound]);

  const handleSkip = () => {
    setDisplayedText(content);
    setIsTyping(false);
    setIsPaused(false);
    indexRef.current = content.length;
  };

  const handleRestart = () => {
    setDisplayedText("");
    indexRef.current = 0;
    setIsTyping(true);
    setIsPaused(false);
  };

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  // Font style mapper
  const fontClass =
    fontStyle === "poppins"
      ? "font-sans font-light tracking-wide text-rose-50"
      : fontStyle === "vintage"
      ? "font-mono tracking-tight text-amber-100"
      : fontStyle === "cursive"
      ? "font-serif italic tracking-wide text-pink-100"
      : "font-serif text-pink-100/95";

  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 py-8 max-w-xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 space-y-1"
      >
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white flex items-center justify-center gap-2">
          <Heart className="w-5 h-5 text-pink-400 fill-pink-400" />
          <span>{title}</span>
          <Heart className="w-5 h-5 text-pink-400 fill-pink-400" />
        </h2>
      </motion.div>

      {/* Control bar: Speed, Play/Pause, Sound, Skip, Restart */}
      <div className="flex flex-wrap items-center justify-between w-full max-w-md px-2 mb-3 text-xs text-pink-200/80 gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] opacity-75">Speed:</span>
          <button
            onClick={() => setSpeed(45)}
            className={`px-2 py-0.5 rounded transition-colors ${speed === 45 ? "bg-pink-500 text-white font-medium" : "bg-white/10 hover:bg-white/20"}`}
          >
            1x
          </button>
          <button
            onClick={() => setSpeed(20)}
            className={`px-2 py-0.5 rounded transition-colors ${speed === 20 ? "bg-pink-500 text-white font-medium" : "bg-white/10 hover:bg-white/20"}`}
          >
            2x
          </button>
          <button
            onClick={() => setSpeed(10)}
            className={`px-2 py-0.5 rounded transition-colors ${speed === 10 ? "bg-pink-500 text-white font-medium" : "bg-white/10 hover:bg-white/20"}`}
          >
            3x
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound toggle */}
          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
              soundEnabled ? "bg-pink-500/30 text-pink-200 border border-pink-400/30" : "bg-white/10 text-white/60 hover:text-white"
            }`}
            title={soundEnabled ? "Mute typewriter sound" : "Enable typewriter sound"}
          >
            {soundEnabled ? <Volume2 className="w-3 h-3 text-pink-300" /> : <VolumeX className="w-3 h-3" />}
            <span className="text-[10px] hidden sm:inline">Audio</span>
          </button>

          {/* Pause / Resume */}
          {isTyping && (
            <button
              onClick={togglePause}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 transition-colors"
            >
              {isPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3 text-yellow-300" />}
              <span className="text-[11px]">{isPaused ? "Resume" : "Pause"}</span>
            </button>
          )}

          {/* Skip / Show All */}
          {isTyping && (
            <button
              onClick={handleSkip}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>Show All</span>
            </button>
          )}

          {/* Restart */}
          {!isTyping && (
            <button
              onClick={handleRestart}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart</span>
            </button>
          )}
        </div>
      </div>

      {/* Letter Parchment Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full bg-gradient-to-b from-stone-900/95 via-stone-900/90 to-stone-950/95 backdrop-blur-xl border border-pink-500/25 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Decorative Wax Seal at Top */}
        <div className="flex items-center justify-center mb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-950/80 border border-rose-500/40 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-serif italic text-rose-200 tracking-wide font-medium">
              {waxSealText}
            </span>
          </div>
        </div>

        <div
          ref={containerRef}
          className="max-h-[50vh] overflow-y-auto text-left pr-2 space-y-4 scroll-smooth"
        >
          <p className={`${fontClass} text-base sm:text-lg leading-relaxed whitespace-pre-line`}>
            {displayedText}
            {isTyping && !isPaused && <span className="inline-block w-1.5 h-4 bg-pink-400 ml-1 animate-pulse" />}
            {isPaused && <span className="inline-block w-2 h-2 bg-yellow-400 ml-1 rounded-full animate-ping" />}
          </p>
        </div>
      </motion.div>

      {/* Next Scene CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6"
      >
        <button
          onClick={onProceed}
          className="px-8 py-3.5 rounded-full font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg flex items-center gap-2 transform hover:scale-105 active:scale-95 transition-all"
        >
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>Open Your Surprise Gift 🎁</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
}
