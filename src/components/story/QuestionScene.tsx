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

  // Runaway logic: jumps away playfully within container bounds
  const moveNoButton = useCallback(() => {
    if (!runawayNo || hasAccepted) return;

    // After 6 playful evades, stop evading and show a sweet surrender prompt
    if (evadeCount >= 6) {
      setNoPosition({ x: 0, y: 0 });
      return;
    }

    const randomAngle = Math.random() * 2 * Math.PI;
    const distance = 80 + Math.random() * 60; // 80-140px jump
    const x = Math.cos(randomAngle) * distance;
    const y = Math.sin(randomAngle) * distance;

    setNoPosition({ x, y });
    setEvadeCount((prev) => prev + 1);
  }, [runawayNo, hasAccepted, evadeCount]);

  const handleYes = () => {
    setHasAccepted(true);
    onAccept();
  };

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
              {/* YES Button */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleYes}
                className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-lg text-white bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 hover:from-pink-600 hover:to-red-600 shadow-xl shadow-pink-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer z-10"
              >
                <Sparkles className="w-5 h-5 text-yellow-200" />
                <span>{yesText}</span>
              </motion.button>

              {/* Runaway NO Button */}
              <motion.button
                animate={
                  noPosition
                    ? {
                        x: noPosition.x,
                        y: noPosition.y,
                        transition: { type: "spring", stiffness: 350, damping: 20 },
                      }
                    : {}
                }
                onMouseEnter={moveNoButton}
                onTouchStart={moveNoButton}
                onClick={moveNoButton}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full font-medium text-sm text-white/70 bg-white/10 hover:bg-white/20 border border-white/10 transition-colors select-none"
              >
                {evadeCount >= 6 ? "Okay, only YES 🤍" : noText}
              </motion.button>
            </div>

            {/* Playful hint */}
            {evadeCount > 0 && evadeCount < 6 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-pink-300/80 mt-4 italic font-medium"
              >
                Hehe, you can&apos;t click No! 🤭
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
              className="px-8 py-3.5 rounded-full font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg flex items-center justify-center gap-2 mx-auto transform hover:scale-105 active:scale-95 transition-all"
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
