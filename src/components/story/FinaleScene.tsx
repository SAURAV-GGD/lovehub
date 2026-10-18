"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Sparkles, RotateCcw, Share2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface FinaleSceneProps {
  title?: string;
  message?: string;
  startDate?: string;
  partnerName: string;
  yourName?: string;
  allowReplay?: boolean;
  allowShare?: boolean;
  onReplay: () => void;
}

export function FinaleScene({
  title = "Our Forever Journey ♾️",
  message = "This is not just code on a screen. This is our heart, captured in time forever.",
  startDate,
  partnerName,
  yourName = "Me",
  allowReplay = true,
  allowShare = true,
  onReplay,
}: FinaleSceneProps) {
  const [copied, setCopied] = useState(false);
  const [elapsed, setElapsed] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Ticking relationship counter
  useEffect(() => {
    const start = startDate ? new Date(startDate).getTime() : Date.now() - 365 * 86400000;

    const updateTimer = () => {
      const diff = Math.max(0, Date.now() - start);
      const seconds = Math.floor(diff / 1000) % 60;
      const minutes = Math.floor(diff / (1000 * 60)) % 60;
      const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      setElapsed({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startDate]);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: `For ${partnerName} 🤍`,
          text: `A romantic story created just for ${partnerName}`,
          url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Proposal link copied to clipboard! 💌");
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 py-8 max-w-lg mx-auto">
      {/* Floating Crown / Heart */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="relative mb-6"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-2xl shadow-pink-500/40">
          <Heart className="w-10 h-10 fill-white animate-pulse" />
        </div>
        <Sparkles className="w-6 h-6 text-yellow-300 absolute -top-2 -right-2 animate-bounce" />
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3 mb-8"
      >
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
          {title}
        </h2>
        <p className="text-sm sm:text-base text-pink-100/80 font-light leading-relaxed max-w-sm mx-auto">
          {message}
        </p>
      </motion.div>

      {/* Live Forever Counter Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full bg-white/[0.08] backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl mb-8"
      >
        <div className="text-xs uppercase tracking-widest font-semibold text-rose-300 mb-4 flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Our Love In Real Time ♾️</span>
          <Sparkles className="w-3.5 h-3.5" />
        </div>

        {/* Counter Grid */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-3 rounded-2xl bg-black/40 border border-white/10">
            <div className="text-2xl sm:text-3xl font-bold font-mono text-pink-400">
              {elapsed.days}
            </div>
            <div className="text-[10px] sm:text-xs text-white/60 uppercase font-medium mt-1">
              Days
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/10">
            <div className="text-2xl sm:text-3xl font-mono font-bold text-pink-300">
              {elapsed.hours}
            </div>
            <div className="text-[10px] sm:text-xs text-white/60 uppercase font-medium mt-1">
              Hours
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/10">
            <div className="text-2xl sm:text-3xl font-mono font-bold text-rose-300">
              {elapsed.minutes}
            </div>
            <div className="text-[10px] sm:text-xs text-white/60 uppercase font-medium mt-1">
              Mins
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/10">
            <div className="text-2xl sm:text-3xl font-mono font-bold text-yellow-300 animate-pulse">
              {elapsed.seconds}
            </div>
            <div className="text-[10px] sm:text-xs text-white/60 uppercase font-medium mt-1">
              Secs
            </div>
          </div>
        </div>

        <p className="text-xs text-pink-200/60 mt-4 italic">
          Every second with you is my favorite second. 🤍
        </p>
      </motion.div>

      {/* Action Buttons: Replay & Share */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm">
        {allowReplay && (
          <button
            onClick={onReplay}
            className="w-full sm:w-1/2 py-3 px-4 rounded-full font-semibold text-sm text-white bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4 text-pink-300" />
            <span>Replay Story</span>
          </button>
        )}

        {allowShare && (
          <button
            onClick={handleShare}
            className="w-full sm:w-1/2 py-3 px-4 rounded-full font-semibold text-sm text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-300" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Share Story</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
