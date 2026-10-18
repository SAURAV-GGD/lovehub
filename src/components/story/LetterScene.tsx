"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Heart, Sparkles, ArrowRight, RotateCcw, FastForward, Play, Pause } from "lucide-react";

interface LetterSceneProps {
  title?: string;
  content: string;
  typingSpeedMs?: number;
  showTypewriter?: boolean;
  onProceed: () => void;
}

export function LetterScene({
  title = "A Letter Straight From My Heart 💌",
  content,
  typingSpeedMs = 25,
  showTypewriter = true,
  onProceed,
}: LetterSceneProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(showTypewriter);
  const [speed, setSpeed] = useState(typingSpeedMs);
  const containerRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);

  // Typewriter effect
  useEffect(() => {
    if (!showTypewriter) {
      setDisplayedText(content);
      setIsTyping(false);
      return;
    }

    setDisplayedText("");
    indexRef.current = 0;
    setIsTyping(true);

    const interval = setInterval(() => {
      if (indexRef.current < content.length) {
        const nextChar = content.charAt(indexRef.current);
        setDisplayedText((prev) => prev + nextChar);
        indexRef.current += 1;

        // Auto-scroll container as text types
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [content, showTypewriter, speed]);

  const handleSkip = () => {
    setDisplayedText(content);
    setIsTyping(false);
    indexRef.current = content.length;
  };

  const handleRestart = () => {
    setDisplayedText("");
    indexRef.current = 0;
    setIsTyping(true);
  };

  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 py-8 max-w-xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 space-y-1"
      >
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white flex items-center justify-center gap-2">
          <Heart className="w-5 h-5 text-pink-400 fill-pink-400" />
          <span>{title}</span>
          <Heart className="w-5 h-5 text-pink-400 fill-pink-400" />
        </h2>
      </motion.div>

      {/* Control bar: Speed, Skip, Restart */}
      <div className="flex items-center justify-between w-full max-w-md px-2 mb-3 text-xs text-pink-200/80">
        <div className="flex items-center gap-2">
          <span>Speed:</span>
          <button
            onClick={() => setSpeed(40)}
            className={`px-2 py-0.5 rounded ${speed === 40 ? "bg-pink-500 text-white" : "bg-white/10"}`}
          >
            1x
          </button>
          <button
            onClick={() => setSpeed(20)}
            className={`px-2 py-0.5 rounded ${speed === 20 ? "bg-pink-500 text-white" : "bg-white/10"}`}
          >
            2x
          </button>
          <button
            onClick={() => setSpeed(10)}
            className={`px-2 py-0.5 rounded ${speed === 10 ? "bg-pink-500 text-white" : "bg-white/10"}`}
          >
            3x
          </button>
        </div>

        <div className="flex items-center gap-2">
          {isTyping && (
            <button
              onClick={handleSkip}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>Show All</span>
            </button>
          )}
          {!isTyping && (
            <button
              onClick={handleRestart}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart</span>
            </button>
          )}
        </div>
      </div>

      {/* Letter Parchment Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full bg-gradient-to-b from-stone-900/90 to-stone-950/90 backdrop-blur-xl border border-pink-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative"
      >
        <div
          ref={containerRef}
          className="max-h-[50vh] overflow-y-auto text-left pr-2 space-y-4 scroll-smooth"
        >
          <p className="font-serif text-base sm:text-lg text-pink-100/95 leading-relaxed whitespace-pre-line">
            {displayedText}
            {isTyping && <span className="inline-block w-1.5 h-4 bg-pink-400 ml-1 animate-pulse" />}
          </p>
        </div>
      </motion.div>

      {/* Next Scene CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6"
      >
        <button
          onClick={onProceed}
          className="px-8 py-3.5 rounded-full font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg flex items-center gap-2 transform hover:scale-105 active:scale-95 transition-all"
        >
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>Open Your Surprise Gift 🎁</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
}
