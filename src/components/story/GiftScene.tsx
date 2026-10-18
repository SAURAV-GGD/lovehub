"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StoryPromiseCard } from "@/lib/proposal-types";
import { Gift, Heart, Sparkles, ArrowRight, Mail, CheckCircle2, Ticket } from "lucide-react";

interface GiftSceneProps {
  boxTitle?: string;
  boxSubtitle?: string;
  revealTitle?: string;
  revealMessage?: string;
  giftType?: "box" | "envelope" | "promise_cards" | "bouquet";
  cards: StoryPromiseCard[];
  onProceed: () => void;
}

export function GiftScene({
  boxTitle = "A Special Surprise For You 🎁",
  boxSubtitle = "Tap to unlock your romantic surprise",
  revealTitle = "For My Only One 🤍",
  revealMessage = "You are the greatest gift life has ever given me.",
  giftType = "box",
  cards,
  onProceed,
}: GiftSceneProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [redeemedCards, setRedeemedCards] = useState<Record<string, boolean>>({});

  const handleOpen = () => {
    setIsOpen(true);
  };

  const toggleRedeemCard = (cardId: string) => {
    setRedeemedCards((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 py-8 max-w-xl mx-auto">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          /* Gift Sealed State */
          <motion.div
            key="sealed-gift"
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

            {/* Visual trigger depending on giftType */}
            {giftType === "envelope" ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleOpen}
                className="relative cursor-pointer group p-8 rounded-3xl bg-gradient-to-tr from-rose-900/40 via-pink-900/30 to-purple-900/40 border border-pink-500/40 shadow-2xl backdrop-blur-md"
              >
                <Sparkles className="w-6 h-6 text-yellow-300 absolute -top-3 -right-3 animate-bounce" />
                <div className="w-40 h-28 sm:w-48 sm:h-32 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden">
                  <div className="w-12 h-12 rounded-full bg-red-950/80 border-2 border-yellow-400 flex items-center justify-center shadow-md">
                    <Heart className="w-6 h-6 fill-rose-400 text-rose-400 animate-pulse" />
                  </div>
                  <span className="text-[11px] font-serif italic text-white/90 mt-2">
                    Click Wax Seal
                  </span>
                </div>
                <div className="mt-4 px-4 py-1.5 rounded-full bg-white/20 text-white font-semibold text-xs tracking-wider uppercase group-hover:bg-white/30 transition-colors">
                  Open Sealed Envelope 💌
                </div>
              </motion.div>
            ) : giftType === "promise_cards" ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleOpen}
                className="relative cursor-pointer group p-8 rounded-3xl bg-gradient-to-tr from-pink-900/40 via-purple-900/30 to-rose-900/40 border border-pink-500/40 shadow-2xl backdrop-blur-md"
              >
                <Sparkles className="w-6 h-6 text-yellow-300 absolute -top-3 -right-3 animate-bounce" />
                <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl bg-gradient-to-br from-pink-600 to-purple-600 flex flex-col items-center justify-center shadow-xl shadow-pink-500/30 relative overflow-hidden">
                  <Ticket className="w-16 h-16 text-yellow-300 drop-shadow-md animate-pulse" />
                  <span className="text-xs font-semibold text-white/90 mt-2">
                    {cards.length} Love Coupons Inside
                  </span>
                </div>
                <div className="mt-4 px-4 py-1.5 rounded-full bg-white/20 text-white font-semibold text-xs tracking-wider uppercase group-hover:bg-white/30 transition-colors">
                  Reveal Coupons 🎟️
                </div>
              </motion.div>
            ) : (
              /* Default 3D Gift Box */
              <motion.div
                whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
                whileTap={{ scale: 0.95 }}
                onClick={handleOpen}
                className="relative cursor-pointer group p-8 rounded-3xl bg-gradient-to-tr from-pink-600/30 via-rose-500/20 to-purple-600/30 border border-pink-500/40 shadow-2xl backdrop-blur-md"
              >
                <Sparkles className="w-6 h-6 text-yellow-300 absolute -top-3 -right-3 animate-bounce" />
                <Heart className="w-5 h-5 fill-pink-400 text-pink-400 absolute -bottom-2 -left-2 animate-pulse" />

                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-xl shadow-pink-500/40 relative overflow-hidden group-hover:shadow-pink-500/70 transition-all">
                  <div className="absolute inset-x-0 h-4 bg-yellow-300/80 top-1/2 -translate-y-1/2" />
                  <div className="absolute inset-y-0 w-4 bg-yellow-300/80 left-1/2 -translate-x-1/2" />
                  <Gift className="w-16 h-16 text-white drop-shadow-lg z-10 animate-pulse" />
                </div>

                <div className="mt-4 px-4 py-1.5 rounded-full bg-white/20 text-white font-semibold text-xs tracking-wider uppercase group-hover:bg-white/30 transition-colors">
                  Tap to Unwrap ✨
                </div>
              </motion.div>
            )}
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
                const isRedeemed = !!redeemedCards[card.id];
                return (
                  <motion.div
                    key={card.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleRedeemCard(card.id)}
                    className={`cursor-pointer text-left p-4 rounded-2xl border transition-all relative overflow-hidden ${
                      isRedeemed
                        ? "bg-gradient-to-br from-pink-900/60 to-purple-900/60 border-pink-400 shadow-lg shadow-pink-500/20"
                        : "bg-white/[0.08] hover:bg-white/[0.12] border-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-300">
                        <Heart className="w-4 h-4 fill-pink-400" />
                      </div>
                      <span className="text-[10px] tracking-wider uppercase font-semibold text-pink-300/80">
                        {isRedeemed ? "Claimed ✨" : "Love Coupon"}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1">
                      {card.title}
                    </h3>
                    <p className="text-xs text-pink-100/75 leading-relaxed">
                      {card.description}
                    </p>

                    {isRedeemed && (
                      <div className="mt-2.5 flex items-center gap-1 text-[11px] text-emerald-300 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Ready to redeem anytime with you!</span>
                      </div>
                    )}
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
