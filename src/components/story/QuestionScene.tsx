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
  const yesButtonRef = useRef<HTMLButtonElement>(null);
  const noButtonRef = useRef<HTMLButtonElement>(null);
  const initialNoPosRef = useRef<{ left: number; top: number } | null>(null);

  // Dynamic runaway logic: jumps away across 100% of the visible phone screen
  // Guaranteed zero box clipping and strictly avoids landing on or behind the YES button
  const moveNoButton = useCallback(
    (e?: React.SyntheticEvent) => {
      if (!runawayNo || hasAccepted) return;

      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(30);
      }

      const container = containerRef.current;
      const noBtn = noButtonRef.current;
      const yesBtn = yesButtonRef.current;

      // Detect the visible phone screen / preview frame container
      const scrollContainer = container?.closest(".overflow-y-auto") as HTMLElement | null;
      const screenRect = scrollContainer
        ? scrollContainer.getBoundingClientRect()
        : {
            left: 0,
            top: 0,
            right: typeof window !== "undefined" ? window.innerWidth : 400,
            bottom: typeof window !== "undefined" ? window.innerHeight : 800,
            width: typeof window !== "undefined" ? window.innerWidth : 400,
            height: typeof window !== "undefined" ? window.innerHeight : 800,
          };

      const yesRect = yesBtn?.getBoundingClientRect();
      const btnWidth = noBtn?.offsetWidth || 110;
      const btnHeight = noBtn?.offsetHeight || 44;

      // Capture initial unshifted position of the NO button on first dodge
      if (!initialNoPosRef.current && noBtn) {
        const curRect = noBtn.getBoundingClientRect();
        const curX = noPosition?.x || 0;
        const curY = noPosition?.y || 0;
        initialNoPosRef.current = {
          left: curRect.left - curX,
          top: curRect.top - curY,
        };
      }

      const origPos = initialNoPosRef.current || {
        left: screenRect.left + screenRect.width / 2,
        top: screenRect.top + screenRect.height / 2 + 50,
      };

      // Screen boundary limits: allows free runaway across 100% of the phone screen
      const padX = 14;
      const padTop = 64; // Under top header / notch
      const padBottom = 28; // Above bottom home bar

      const minLeft = screenRect.left + padX;
      const maxLeft = Math.max(minLeft + 10, screenRect.right - btnWidth - padX);
      const minTop = screenRect.top + padTop;
      const maxTop = Math.max(minTop + 10, screenRect.bottom - btnHeight - padBottom);

      // Current position in screen coordinates
      const curScreenLeft = noPosition ? origPos.left + noPosition.x : origPos.left;
      const curScreenTop = noPosition ? origPos.top + noPosition.y : origPos.top;

      // Minimum jump distance (at least 30% of screen dimension)
      const minJumpDist = Math.min(screenRect.width, screenRect.height) * 0.3;

      // Safe buffer around YES button so NO NEVER lands on or hides behind YES
      const safeYesBuffer = 32;
      const isOverlappingYes = (candLeft: number, candTop: number) => {
        if (!yesRect) return false;
        const candRight = candLeft + btnWidth;
        const candBottom = candTop + btnHeight;
        const noOverlap =
          candRight < yesRect.left - safeYesBuffer ||
          candLeft > yesRect.right + safeYesBuffer ||
          candBottom < yesRect.top - safeYesBuffer ||
          candTop > yesRect.bottom + safeYesBuffer;
        return !noOverlap;
      };

      let targetLeft = curScreenLeft;
      let targetTop = curScreenTop;
      let found = false;

      // Try up to 25 randomized positions across the full phone screen
      for (let i = 0; i < 25; i++) {
        const candLeft = minLeft + Math.random() * (maxLeft - minLeft);
        const candTop = minTop + Math.random() * (maxTop - minTop);
        const dist = Math.hypot(candLeft - curScreenLeft, candTop - curScreenTop);

        if (dist >= minJumpDist && !isOverlappingYes(candLeft, candTop)) {
          targetLeft = candLeft;
          targetTop = candTop;
          found = true;
          break;
        }
      }

      // Fallback: pick one of 4 corners furthest from YES and current position
      if (!found) {
        const corners = [
          { left: minLeft, top: minTop },
          { left: maxLeft, top: minTop },
          { left: minLeft, top: maxTop },
          { left: maxLeft, top: maxTop },
        ];
        const safeCorners = corners.filter((c) => !isOverlappingYes(c.left, c.top));
        const candidates = safeCorners.length > 0 ? safeCorners : corners;
        candidates.sort(
          (a, b) =>
            Math.hypot(b.left - curScreenLeft, b.top - curScreenTop) -
            Math.hypot(a.left - curScreenLeft, a.top - curScreenTop)
        );
        targetLeft = candidates[0].left;
        targetTop = candidates[0].top;
      }

      // Convert target screen coords to transform offset from original position
      const nextX = Math.round(targetLeft - origPos.left);
      const nextY = Math.round(targetTop - origPos.top);

      setNoPosition({ x: nextX, y: nextY });
      setEvadeCount((prev) => prev + 1);
    },
    [runawayNo, hasAccepted, noPosition]
  );

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
            className="w-full bg-white/[0.07] backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-visible"
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
                ref={yesButtonRef}
                data-yes-button="true"
                animate={{ scale: yesScale }}
                whileHover={{ scale: yesScale * 1.06 }}
                whileTap={{ scale: yesScale * 0.95 }}
                onClick={handleYes}
                className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-lg text-white bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 hover:from-pink-600 hover:to-red-600 shadow-xl shadow-pink-500/40 flex items-center justify-center gap-2 transition-all cursor-pointer z-20"
              >
                <Sparkles className="w-5 h-5 text-yellow-200" />
                <span>{yesText}</span>
              </motion.button>

              {/* Invisible placeholder when escaped to maintain card layout stability */}
              {noPosition && (
                <div
                  className="w-28 h-12 pointer-events-none opacity-0 select-none hidden sm:inline-block"
                  aria-hidden="true"
                />
              )}

              {/* Classic Infinite Runaway NO Button - Escapes all boxes across entire phone screen */}
              <motion.button
                ref={noButtonRef}
                animate={
                  noPosition
                    ? {
                        x: noPosition.x,
                        y: noPosition.y,
                        transition: { type: "spring", stiffness: 450, damping: 20 },
                      }
                    : {}
                }
                onMouseEnter={moveNoButton}
                onTouchStart={moveNoButton}
                onPointerDown={moveNoButton}
                onClick={moveNoButton}
                className={`rounded-full font-semibold text-sm transition-all select-none cursor-pointer z-40 shadow-xl backdrop-blur-md ${
                  noPosition
                    ? "px-5 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 text-white border-2 border-white/70 shadow-rose-500/50 scale-105 whitespace-nowrap inline-block"
                    : "w-full sm:w-auto px-6 py-3.5 text-white/80 bg-white/10 hover:bg-white/20 border border-white/15"
                }`}
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
