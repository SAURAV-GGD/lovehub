"use client";

import { motion } from "framer-motion";
import { Headphones, Heart, Sparkles, ArrowRight } from "lucide-react";

interface IntroSceneProps {
  partnerName: string;
  yourName?: string;
  relationshipType?: string;
  headline?: string;
  subheadline?: string;
  earphonesText?: string;
  onStart: () => void;
}

export function IntroScene({
  partnerName,
  yourName = "Me",
  relationshipType = "partner",
  headline,
  subheadline,
  earphonesText = "Wear earphones for the best experience 🤍",
  onStart,
}: IntroSceneProps) {
  const displayHeadline = headline || `For My Forever ${partnerName} 🤍`;
  const displaySubheadline =
    subheadline || "Every heartbeat, every memory, and every dream brought us right here.";

  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 py-8 max-w-xl mx-auto">
      {/* Soft Romantic Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-96 sm:h-96 bg-gradient-to-tr from-pink-600/20 via-rose-500/15 to-purple-600/10 blur-3xl pointer-events-none rounded-full" />

      {/* Earphones Recommendation Badge */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-pink-200 text-xs sm:text-sm font-medium mb-6 shadow-sm"
      >
        <Headphones className="w-4 h-4 text-pink-400 animate-bounce" />
        <span>{earphonesText}</span>
      </motion.div>

      {/* Romantic Partner Name Typography */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-center gap-2 text-rose-400">
          <Heart className="w-4 h-4 fill-rose-400 animate-pulse" />
          <span className="text-xs uppercase tracking-widest font-semibold text-rose-300/80">
            A Love Story Just For You
          </span>
          <Heart className="w-4 h-4 fill-rose-400 animate-pulse" />
        </div>

        <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-white leading-tight drop-shadow-md">
          {displayHeadline}
        </h1>

        <p className="text-base sm:text-lg text-pink-100/80 font-light leading-relaxed max-w-md mx-auto">
          {displaySubheadline}
        </p>
      </motion.div>

      {/* Floating Sparkles Divider */}
      <motion.div
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: "60px" }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="h-0.5 bg-gradient-to-r from-transparent via-pink-400 to-transparent my-8"
      />

      {/* Call to Action Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <button
          onClick={onStart}
          className="group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-full font-medium text-white shadow-xl bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 hover:from-pink-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          <Sparkles className="w-5 h-5 text-yellow-200 animate-spin" style={{ animationDuration: "4s" }} />
          <span className="text-base sm:text-lg font-semibold tracking-wide">
            Begin Our Story ✨
          </span>
          <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>

      {/* Intimate Subtext */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="text-xs text-white/40 mt-6 font-mono"
      >
        Created with all my heart by {yourName}
      </motion.p>
    </div>
  );
}
