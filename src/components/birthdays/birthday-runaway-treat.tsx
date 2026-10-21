"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PartyPopper, Sparkles, CheckCircle2, Share2, Award, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const DODGE_PHRASES = [
  "Nahi Dunga 🏃‍♂️",
  "Aise kaise nahi! 😂",
  "Party toh deni padegi! 🍕",
  "Dost bane ho toh khilana padega! 🍰",
  "Kanjusi band karo! 💸",
  "Bach ke kidhar jaoge! 💨",
  "Phone tod doge par yeh button nahi dabega! 📱🔥",
  "Mission Impossible: Clicking NO 🕵️‍♂️",
  "Bass ab chupchap YES daba do! 🎂",
  "Catch me if you can! 🚀",
];

interface BirthdayRunawayTreatProps {
  personName: string;
  question?: string;
  yesText?: string;
  noText?: string;
}

export function BirthdayRunawayTreat({
  personName,
  question = "Will you give us a birthday party treat today? 🍕🎂",
  yesText = "Haan Bilkul! Party Pakki! 🎉",
  noText = "Nahi Dunga 🏃‍♂️💨",
}: BirthdayRunawayTreatProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dodgeCount, setDodgeCount] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hasEscaped, setHasEscaped] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState(noText);

  const dodge = useCallback(
    (e?: React.SyntheticEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(35);
      }

      setDodgeCount((prev) => {
        const next = prev + 1;
        const phraseIdx = next % DODGE_PHRASES.length;
        setCurrentPhrase(DODGE_PHRASES[phraseIdx]);
        return next;
      });

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const maxX = Math.max(140, (rect.width - 120) / 2);
      const maxY = 150;

      // Calculate random offset with minimum jump distance
      const signX = Math.random() > 0.5 ? 1 : -1;
      const signY = Math.random() > 0.5 ? 1 : -1;
      const newX = signX * (60 + Math.random() * (maxX - 60));
      const newY = signY * (50 + Math.random() * (maxY - 50));

      setPosition({ x: newX, y: newY });
      setHasEscaped(true);
    },
    []
  );

  const handleAccept = () => {
    setAccepted(true);
    toast.success("PARTY CONFIRMED! Screenshot leke sabko bhej do! 🍕🎉");
  };

  return (
    <section className="bg-gradient-to-br from-amber-50 via-white to-rose-50 rounded-3xl p-6 sm:p-10 shadow-xl border border-amber-200/80 relative overflow-visible text-center space-y-6">
      {/* Decorative ambient elements */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-200/40 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-rose-200/40 rounded-full blur-2xl pointer-events-none" />

      {/* Header Pill */}
      <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold tracking-wide uppercase shadow-sm">
        <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
        Official Birthday Treat Challenge
      </div>

      {!accepted ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-4xl font-serif font-black text-[#14231F] tracking-tight">
              {personName}, {question}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              There is strictly no escape from the birthday tradition. Choose your answer wisely! 😉
            </p>
          </div>

          {dodgeCount > 0 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-block px-3 py-1 bg-rose-100 text-rose-800 text-xs font-medium rounded-full"
            >
              🏃 Attempts to escape: <strong className="font-bold">{dodgeCount}</strong> times!
            </motion.div>
          )}

          {/* Interactive Arena */}
          <div
            ref={containerRef}
            className="min-h-[170px] relative flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 select-none"
          >
            {/* The YES Button */}
            <motion.div
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="z-10"
            >
              <Button
                size="lg"
                onClick={handleAccept}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base px-8 py-6 rounded-2xl shadow-lg shadow-emerald-600/30 transition-all border border-emerald-400"
              >
                <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                {yesText}
              </Button>
            </motion.div>

            {/* The Uncatchable Runaway NO Button */}
            <motion.div
              animate={{
                x: hasEscaped ? position.x : 0,
                y: hasEscaped ? position.y : 0,
              }}
              transition={{
                type: "spring",
                stiffness: 450,
                damping: 22,
              }}
              className="z-20 inline-block"
            >
              <Button
                size="lg"
                variant="outline"
                onMouseEnter={dodge}
                onTouchStart={dodge}
                onClick={dodge}
                className="border-2 border-rose-300 bg-white text-rose-700 font-bold text-sm px-6 py-6 rounded-2xl shadow-md hover:bg-rose-50 transition-all whitespace-nowrap cursor-pointer select-none"
              >
                {currentPhrase}
              </Button>
            </motion.div>
          </div>
        </div>
      ) : (
        /* Celebration Confirmed State */
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-5 py-4"
        >
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
            <Award className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-serif font-black text-emerald-800">
              Treat Confirmed! Party Pakki! 🍕🥂
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              {personName} has officially agreed to treat everyone. Take a screenshot for legal proof!
            </p>
          </div>

          {/* Certificate Card */}
          <div className="max-w-md mx-auto bg-white p-5 rounded-2xl border-2 border-emerald-200 shadow-sm text-left space-y-3 font-serif">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-emerald-700">
                Official Birthday Contract
              </span>
              <span className="text-[11px] font-sans text-slate-400">
                Status: Locked ✅
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              &ldquo;I, <strong>{personName}</strong>, hereby pledge to feed all my friends, family, and loved ones with pizza, cake, and snacks today without giving any excuses.&rdquo;
            </p>
            <div className="flex items-center gap-2 text-[10px] text-emerald-700 font-sans font-semibold pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified on LoveHub Birthday Edition
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              size="sm"
              onClick={() => {
                const url = window.location.href;
                window.open(
                  `https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `🎉 Look! ${personName} officially locked the birthday party treat! Proof here: ${url}`
                  )}`,
                  "_blank"
                );
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl"
            >
              <Share2 className="w-3.5 h-3.5 mr-1.5" /> Share Proof on WhatsApp
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(
                  `🍕 Official Birthday Treat Alert! ${personName} has locked the party on LoveHub: ${window.location.href}`
                );
                toast.success("Party contract copied! Send it in your group chat! 🎉");
              }}
              className="border-emerald-200 text-xs rounded-xl"
            >
              Copy Certificate
            </Button>
          </div>
        </motion.div>
      )}
    </section>
  );
}
