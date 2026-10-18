"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StoryPromiseCard } from "@/lib/proposal-types";
import { Gift, Heart, Sparkles, ArrowRight, Shield, CheckCircle } from "lucide-react";

interface GiftSceneProps {
  boxTitle?: string;
  boxSubtitle?: string;
  revealTitle?: string;
  revealMessage?: string;
  cards: StoryPromiseCard[];
  onProceed: () => void;
}

export function GiftScene({
  boxTitle = "A Special Surprise For You 🎁",
  boxSubtitle = "Tap the gift box to unlock your love package",
  revealTitle = "For My Only One 🤍",
  revealMessage = "You are the greatest gift life has ever given me.",
  cards,
  onProceed,
}: GiftSceneProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const handleOpen = () => {
    setIsOpen(true);
  };

  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 py-8 max-w-xl mx-auto">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          /* Gift Box Initial Sealed State */
          <motion.div
            key="sealed-box"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center"
          >
            <motion.div
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              className="mb-6 space-y-2"
            >
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                {boxTitle}
              </h2>
              <p className="text-sm text-pink-200/80">{boxSubtitle}</p>
            </motion.div>

            {/* Interactive 3D-styled Gift Box */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpen}
              className="relative cursor-pointer group p-8 rounded-3xl bg-gradient-to-tr from-pink-600/30 via-rose-500/20 to-purple-600/30 border border-pink-500/40 shadow-2xl backdrop-blur-md"
            >
              {/* Floating Sparkles */}
              <Sparkles className="w-6 h-6 text-yellow-300 absolute -top-3 -right-3 animate-bounce" />
              <Heart className="w-5 h-5 fill-pink-400 text-pink-400 absolute -bottom-2 -left-2 animate-pulse" />

              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-xl shadow-pink-500/40 relative overflow-hidden group-hover:shadow-pink-500/70 transition-all">
                {/* Ribbon graphic */}
                <div className="absolute inset-x-0 h-4 bg-yellow-300/80 top-1/2 -translate-y-1/2" />
                <div className="absolute inset-y-0 w-4 bg-yellow-300/80 left-1/2 -translate-x-1/2" />
                <Gift className="w-16 h-16 text-white drop-shadow-lg z-10 animate-pulse" />
              </div>

              <div className="mt-4 px-4 py-1.5 rounded-full bg-white/20 text-white font-semibold text-xs tracking-wider uppercase group-hover:bg-white/30 transition-colors">
                Tap to Unwrap ✨
              </div>
            </motion.div>
          </motion.div>
        ) : (
          /* Unboxed Package: Promise Cards & Coupons */
          <motion.div
            key="revealed-box"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="w-full flex flex-col items-center"
          >
            {/* Header */}
            <div className="mb-6 space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-400/30 text-pink-300 text-xs font-medium mb-2">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>Gift Unlocked</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                {revealTitle}
              </h2>
              <p className="text-xs sm:text-sm text-pink-200/80 max-w-sm mx-auto">
                {revealMessage}
              </p>
            </div>

            {/* Promise Cards Grid */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {cards.map((card) => {
                const isSelected = selectedCardId === card.id;
                return (
                  <motion.div
                    key={card.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedCardId(isSelected ? null : card.id)}
                    className={`cursor-pointer text-left p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? "bg-gradient-to-br from-pink-900/60 to-purple-900/60 border-pink-400 shadow-lg shadow-pink-500/20"
                        : "bg-white/[0.08] hover:bg-white/[0.12] border-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-300">
                        <Heart className="w-4 h-4 fill-pink-400" />
                      </div>
                      <span className="text-[10px] tracking-wider uppercase font-semibold text-pink-300/80">
                        Love Coupon
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1">
                      {card.title}
                    </h3>
                    <p className="text-xs text-pink-100/75 leading-relaxed">
                      {card.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* Next CTA to Finale */}
            <button
              onClick={onProceed}
              className="px-8 py-3.5 rounded-full font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg flex items-center gap-2 transform hover:scale-105 active:scale-95 transition-all"
            >
              <span>Our Forever Journey ♾️</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
