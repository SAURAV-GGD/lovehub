"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ArrowRight,
  RotateCcw,
  Volume2,
  Lock,
  Wifi,
  Battery,
  Signal,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

const playfulNoPhrases = [
  "No",
  "Nice try!",
  "Are you sure?",
  "Think again!",
  "Can't tap me!",
  "Only YES works",
  "Look left!",
];

export function InteractiveDemo() {
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [saidYes, setSaidYes] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const phoneBodyRef = useRef<HTMLDivElement>(null);

  const handleNoDodge = () => {
    if (saidYes) return;
    setAttempts((prev) => prev + 1);
    setPhraseIndex((prev) => (prev + 1) % playfulNoPhrases.length);

    // Bounded deflection inside phone container
    const maxX = 85;
    const maxY = 65;
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
    <section id="demo" className="relative min-h-screen py-24 sm:py-32 text-white overflow-hidden flex items-center justify-center">
      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Context & Controls */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 space-y-6 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm font-semibold tracking-wide">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <span>Interactive Simulator</span>
            </div>

            <h2 className="font-[family-name:var(--font-playfair)] italic text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1]">
              See Exactly What Your Partner Experiences
            </h2>

            <p className="text-slate-300 text-base sm:text-lg max-w-[65ch] leading-relaxed">
              Most visitors open their proposal directly from a WhatsApp link on their phone. Try tapping the &ldquo;No&rdquo; button in the mobile frame—it actively avoids touch events until &ldquo;YES&rdquo; is selected.
            </p>

            {/* Feature details */}
            <ul className="space-y-3 pt-2 text-sm text-slate-200">
              <li className="flex items-center gap-3 justify-center lg:justify-start">
                <CheckCircle2 className="w-5 h-5 text-rose-400 shrink-0" />
                <span>Responsive touch tracking designed for Android &amp; iPhone</span>
              </li>
              <li className="flex items-center gap-3 justify-center lg:justify-start">
                <CheckCircle2 className="w-5 h-5 text-rose-400 shrink-0" />
                <span>Background music player with gentle fade-in</span>
              </li>
              <li className="flex items-center gap-3 justify-center lg:justify-start">
                <CheckCircle2 className="w-5 h-5 text-rose-400 shrink-0" />
                <span>Full celebration animation triggers instantly on approval</span>
              </li>
            </ul>

            {/* Interactive Stats / Indicator */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>Dodge count: {attempts} {attempts === 1 ? "attempt" : "attempts"}</span>
              </div>
              {saidYes && (
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-semibold text-white transition-all cursor-pointer min-h-[44px]"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Replay Demo
                </button>
              )}
            </div>
          </motion.div>

          {/* Right Column: Real Smartphone Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.94 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 flex justify-center"
          >
            <div className="relative w-full max-w-[340px] sm:max-w-[360px] aspect-[9/18.5] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-[6px] border-slate-800 ring-1 ring-white/20 select-none">
              
              {/* Phone Speaker & Dynamic Island */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-30 flex items-center justify-end px-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
              </div>

              {/* Screen Area */}
              <div
                ref={phoneBodyRef}
                className="relative w-full h-full bg-[#121016] rounded-[36px] overflow-hidden flex flex-col justify-between pt-7 pb-4 px-4 text-white border border-white/10"
              >
                {/* Simulated Phone Status Bar */}
                <div className="flex items-center justify-between px-2 text-[11px] text-slate-400 font-medium">
                  <span>9:41</span>
                  <div className="flex items-center gap-1.5">
                    <Signal className="w-3 h-3 text-slate-300" />
                    <Wifi className="w-3 h-3 text-slate-300" />
                    <Battery className="w-3.5 h-3.5 text-slate-300" />
                  </div>
                </div>

                {/* Simulated Browser Address Bar */}
                <div className="mx-1 mt-2.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 flex items-center justify-center gap-1.5 text-[11px] text-slate-300">
                  <Lock className="w-2.5 h-2.5 text-emerald-400" />
                  <span className="font-mono text-[10px] tracking-tight">lovehub.in/p/alex-and-sam</span>
                </div>

                {/* Proposal Inner View */}
                <div className="flex-1 flex flex-col items-center justify-center py-4 text-center">
                  <AnimatePresence mode="wait">
                    {!saidYes ? (
                      <motion.div
                        key="proposal-card"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.92 }}
                        className="w-full space-y-4"
                      >
                        {/* Audio Pill Playing Indicator */}
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] text-rose-300">
                          <Volume2 className="w-3 h-3 text-rose-400 animate-pulse" />
                          <span>Romantic Piano • Playing</span>
                        </div>

                        {/* Proposal Center Content */}
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center">
                          <Heart className="w-7 h-7 text-rose-500 fill-rose-500 animate-pulse" />
                        </div>

                        <div className="space-y-1.5 px-2">
                          <h3 className="font-[family-name:var(--font-playfair)] italic text-xl font-bold text-white">
                            Alex, Will You Be Mine?
                          </h3>
                          <p className="text-slate-300 text-xs leading-relaxed max-w-[240px] mx-auto">
                            &ldquo;From our late-night conversations to every milestone we shared, every day with you feels like home.&rdquo;
                          </p>
                        </div>

                        {/* Interactive Buttons Container */}
                        <div className="relative pt-4 min-h-[90px] flex items-center justify-center gap-3">
                          {/* YES Button */}
                          <button
                            type="button"
                            onClick={() => setSaidYes(true)}
                            className="px-5 py-2.5 min-h-[44px] rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer z-10"
                          >
                            YES!
                          </button>

                          {/* Runaway NO Button */}
                          <motion.button
                            type="button"
                            animate={{ x: noPosition.x, y: noPosition.y }}
                            transition={{ type: "spring", stiffness: 500, damping: 28 }}
                            onMouseEnter={handleNoDodge}
                            onTouchStart={handleNoDodge}
                            onClick={handleNoDodge}
                            className="px-4 py-2 min-h-[44px] rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-slate-300 font-medium text-xs transition-colors cursor-pointer select-none"
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
                        className="space-y-4 py-2 px-2"
                      >
                        <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
                          <Heart className="w-8 h-8 text-rose-400 fill-rose-400 animate-bounce" />
                        </div>

                        <div className="space-y-1">
                          <h3 className="font-[family-name:var(--font-playfair)] italic text-2xl text-rose-300 font-bold">
                            She Said YES!
                          </h3>
                          <p className="text-slate-300 text-xs">
                            Confetti showers light up the screen and your celebration begins.
                          </p>
                        </div>

                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={handleReset}
                            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-2 min-h-[44px] transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Reset Demo
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Home Indicator Bar */}
                <div className="w-28 h-1 bg-white/30 rounded-full mx-auto" />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
