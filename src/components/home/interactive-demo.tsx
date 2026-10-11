"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Sparkles,
  ArrowRight,
  PartyPopper,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

const playfulNoPhrases = [
  "No 😢",
  "Nice try! 😉",
  "Error 404: No not found ❌",
  "Are you sure? 🥺",
  "Think again! ❤️",
  "Can't click me! 🚀",
  "Only YES allowed! ✨",
  "Try the other button! 💍",
];

export function InteractiveDemo() {
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [saidYes, setSaidYes] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleNoDodge = () => {
    if (saidYes) return;
    setAttempts((prev) => prev + 1);
    setPhraseIndex((prev) => (prev + 1) % playfulNoPhrases.length);

    // Random displacement within the demo card container boundaries
    const maxX = 130;
    const maxY = 70;
    const randomX = (Math.random() - 0.5) * 2 * maxX;
    const randomY = (Math.random() - 0.5) * 2 * maxY;

    setNoPosition({ x: randomX, y: randomY });
  };

  const handleReset = () => {
    setSaidYes(false);
    setNoPosition({ x: 0, y: 0 });
    setPhraseIndex(0);
    setAttempts(0);
  };

  return (
    <section id="interactive-demo" className="relative py-24 sm:py-32 bg-slate-900 text-white overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-18 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm font-semibold tracking-wide">
            <Sparkles className="w-4 h-4 text-rose-400" />
            <span>Interactive Simulator</span>
          </div>

          <h2 className="font-[family-name:var(--font-playfair)] italic text-3xl sm:text-5xl md:text-6xl text-white tracking-tight">
            Experience The Runaway &ldquo;NO&rdquo;
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Try clicking or tapping &ldquo;No&rdquo; below. Notice how effortlessly it escapes, guaranteeing your partner only has one beautiful option.
          </p>
        </div>

        {/* Live Device Simulator Frame */}
        <div
          ref={containerRef}
          className="relative max-w-2xl mx-auto rounded-3xl bg-slate-950/80 backdrop-blur-xl border border-white/15 p-6 sm:p-10 shadow-2xl shadow-rose-950/20"
        >
          {/* Top simulated browser bar */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-2 font-mono text-slate-400">lovehub.site/p/alex-and-sam</span>
            </div>
            {attempts > 0 && !saidYes && (
              <span className="text-rose-400 font-medium">
                Dodged {attempts} {attempts === 1 ? "time" : "times"}! 🏃
              </span>
            )}
            {saidYes && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                title="Restart simulator"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Replay
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {!saidYes ? (
              <motion.div
                key="proposal-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-6 sm:py-8 space-y-6"
              >
                {/* Floating Heart Icon */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 p-0.5 shadow-lg shadow-rose-500/30">
                  <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
                    <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-rose-500 fill-rose-500 animate-pulse" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Will You Be Mine Forever?
                  </h3>
                  <p className="text-slate-300 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
                    &ldquo;From our very first late-night talks to every milestone we shared, every second with you feels like home.&rdquo;
                  </p>
                </div>

                {/* Interactive Action Buttons */}
                <div className="relative pt-6 min-h-[120px] flex items-center justify-center gap-6 flex-wrap">
                  {/* YES Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setSaidYes(true)}
                    className="relative px-8 py-3.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-base shadow-lg shadow-rose-500/35 hover:shadow-rose-500/50 transition-all cursor-pointer z-10"
                  >
                    YES, Absolutely! ❤️
                  </motion.button>

                  {/* Runaway NO Button */}
                  <motion.button
                    animate={{ x: noPosition.x, y: noPosition.y }}
                    transition={{ type: "spring", stiffness: 450, damping: 25 }}
                    onMouseEnter={handleNoDodge}
                    onTouchStart={handleNoDodge}
                    onClick={handleNoDodge}
                    className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-slate-300 font-medium text-sm transition-colors cursor-pointer select-none"
                  >
                    {playfulNoPhrases[phraseIndex]}
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="celebration-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10 space-y-6"
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
                  <PartyPopper className="w-10 h-10 text-rose-400 animate-bounce" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-[family-name:var(--font-playfair)] italic text-3xl sm:text-4xl text-rose-300 font-bold">
                    She Said YES! 💍🎉
                  </h3>
                  <p className="text-slate-300 text-base max-w-md mx-auto">
                    Confetti explodes across the screen, romantic melodies play, and memories begin.
                  </p>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/create"
                    className="inline-flex items-center gap-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-semibold px-7 py-3 text-sm shadow-lg shadow-rose-500/30 transition-all hover:scale-105"
                  >
                    Build Your Custom Proposal <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white px-5 py-3 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" /> Try Again
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
