"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, ArrowRight } from "lucide-react";

interface QuestionSceneProps {
  questionText?: string;
  yesText?: string;
  noText?: string;
  runawayNo?: boolean;
  successTitle?: string;
  successMessage?: string;
  onAccept: () => void;
  onProceed: () => void;
}

const DODGE_TEXTS = [
  "NO 😈",
  "Nice try! 😜",
  "Can't click me! 🏃‍♀️",
  "Nope! 🙈",
  "Too slow! 💨",
  "Still NO? 😂",
  "Never! 🏃‍♂️",
  "Almost! 😜",
  "Not an option! 🤍",
  "Just say YES! ✨",
  "Destiny awaits! 💍",
];

export function QuestionScene({
  questionText = "Will you be my Valentine & Forever Person? ♾️",
  yesText = "YES 🤍✨",
  noText = "NO 😈",
  runawayNo = true,
  successTitle = "She said YES 🤍✨",
  successMessage = "No escape now 🥹 Forever mine ♾️",
  onAccept,
  onProceed,
}: QuestionSceneProps) {
  const [hasAccepted, setHasAccepted] = useState(false);
  const [noPosition, setNoPosition] = useState<{ x: number; y: number } | null>(null);
  const [evadeCount, setEvadeCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Classic infinite runaway logic: jumps away playfully FOREVER with zero surrender
  const moveNoButton = useCallback(() => {
    if (!runawayNo || hasAccepted) return;

    // Pick random angles and dynamic leap distances
    const randomAngle = Math.random() * 2 * Math.PI;
    const distance = 100 + Math.random() * 80; // 100-180px jump
    let x = Math.cos(randomAngle) * distance;
    let y = Math.sin(randomAngle) * distance;

    // Bound securely within visible container area
    x = Math.max(-140, Math.min(140, x));
    y = Math.max(-90, Math.min(90, y));

    setNoPosition({ x, y });
    setEvadeCount((prev) => prev + 1);
  }, [runawayNo, hasAccepted]);

  const handleYes = () => {
    setHasAccepted(true);
    onAccept();
  };

  const currentNoLabel =
    evadeCount === 0 ? noText : DODGE_TEXTS[evadeCount % DODGE_TEXTS.length];

  // YES button grows slightly bigger with every failed dodge attempt (classic meme mechanic)
  const yesScale = 1 + Math.min(evadeCount * 0.04, 0.35);

  return (
    <div
      ref={containerRef}
      className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 py-8 max-w-lg mx-auto"
    >
      <AnimatePresence mode="wait">
        {!hasAccepted ? (
          <motion.div
            key="question-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5 }}
            className="w-full bg-white/[0.07] backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden"
          >
            {/* Romantic Icon Header */}
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 shadow-inner">
              <Heart className="w-8 h-8 fill-pink-500 animate-pulse" />
            </div>

            {/* Question Text */}
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-8 leading-tight">
              {questionText}
            </h2>

            {/* Interactive Buttons */}
            <div className="relative min-h-[140px] flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* YES Button (grows bigger with every dodge) */}
              <motion.button
                animate={{ scale: yesScale }}
                whileHover={{ scale: yesScale * 1.06 }}
                whileTap={{ scale: yesScale * 0.95 }}
                onClick={handleYes}
                className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-lg text-white bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 hover:from-pink-600 hover:to-red-600 shadow-xl shadow-pink-500/40 flex items-center justify-center gap-2 transition-all cursor-pointer z-20"
              >
                <Sparkles className="w-5 h-5 text-yellow-200" />
                <span>{yesText}</span>
              </motion.button>

              {/* Classic Infinite Runaway NO Button */}
              <motion.button
                animate={
                  noPosition
                    ? {
                        x: noPosition.x,
                        y: noPosition.y,
                        transition: { type: "spring", stiffness: 450, damping: 18 },
                      }
                    : {}
                }
                onMouseEnter={moveNoButton}
                onTouchStart={moveNoButton}
                onPointerDown={moveNoButton}
                onClick={moveNoButton}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full font-semibold text-sm text-white/80 bg-white/10 hover:bg-white/20 border border-white/15 transition-colors select-none cursor-pointer z-10"
              >
                {currentNoLabel}
              </motion.button>
            </div>

            {/* Playful teasing hints that update with every dodge */}
            {evadeCount > 0 && (
              <motion.p
                key={evadeCount}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-pink-300 font-medium mt-5 italic"
              >
                {evadeCount === 1 && "Hehe, you can't click NO! 🤭"}
                {evadeCount === 2 && "Still trying? NO is dodging forever! 🏃‍♀️"}
                {evadeCount >= 3 && evadeCount < 6 && "Look how big YES is getting! It's destiny! ✨"}
                {evadeCount >= 6 && evadeCount < 10 && "Infinite dodging active! Only YES exists here! 💍❤️"}
                {evadeCount >= 10 && "10+ dodges! You know you want to click YES! 🥰"}
              </motion.p>
            )}
          </motion.div>
        ) : (
          /* Acceptance Celebration Screen */
          <motion.div
            key="success-card"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="w-full bg-gradient-to-b from-pink-900/40 to-black/60 backdrop-blur-2xl border border-pink-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl relative"
          >
            {/* Floating Sparkles & Hearts */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Heart className="w-16 h-16 fill-pink-500 text-pink-400 animate-bounce" />
                <Sparkles className="w-6 h-6 text-yellow-300 absolute -top-2 -right-2 animate-spin" />
              </div>
            </div>

            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-4">
              {successTitle}
            </h2>

            <p className="text-base sm:text-lg text-pink-200/90 font-light mb-8 max-w-sm mx-auto leading-relaxed">
              {successMessage}
            </p>

            <button
              onClick={onProceed}
              className="px-8 py-3.5 rounded-full font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg flex items-center justify-center gap-2 mx-auto transform hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <span>Explore Our Memories 📸</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
