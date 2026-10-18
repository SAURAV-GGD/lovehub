"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StoryMemoryItem } from "@/lib/proposal-types";
import { ChevronLeft, ChevronRight, Heart, Sparkles, ArrowRight, Image as ImageIcon } from "lucide-react";

interface MemoriesSceneProps {
  title?: string;
  subtitle?: string;
  items: StoryMemoryItem[];
  autoPlay?: boolean;
  intervalSec?: number;
  onProceed: () => void;
}

export function MemoriesScene({
  title = "Our Cherished Moments 📸",
  subtitle = "Every picture holds a thousand heartbeats",
  items,
  autoPlay = true,
  intervalSec = 4,
  onProceed,
}: MemoriesSceneProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Fallback if no images provided
  const memoryList: StoryMemoryItem[] =
    items && items.length > 0
      ? items
      : [
          {
            id: "default_1",
            title: "The First Time We Met",
            caption: "The world blurred, and in that moment, only you existed.",
            photoUrl: "",
            dateOrMonth: "A magical day",
          },
          {
            id: "default_2",
            title: "Our Favorite Conversations",
            caption: "Talking till 3 AM about everything and nothing.",
            photoUrl: "",
            dateOrMonth: "Under the stars",
          },
          {
            id: "default_3",
            title: "Overcoming Every Obstacle",
            caption: "Holding hands tighter through every storm life threw at us.",
            photoUrl: "",
            dateOrMonth: "Stronger together",
          },
        ];

  // Auto-play interval
  useEffect(() => {
    if (!autoPlay || isPaused || memoryList.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % memoryList.length);
    }, intervalSec * 1000);

    return () => clearInterval(timer);
  }, [autoPlay, isPaused, intervalSec, memoryList.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + memoryList.length) % memoryList.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % memoryList.length);
  };

  const currentItem = memoryList[currentIndex];

  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 py-8 max-w-xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 space-y-1"
      >
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-pink-400" />
          <span>{title}</span>
          <Sparkles className="w-5 h-5 text-pink-400" />
        </h2>
        {subtitle && <p className="text-xs sm:text-sm text-pink-200/70 font-light">{subtitle}</p>}
      </motion.div>

      {/* Memory Slide Card */}
      <div
        className="w-full relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.id || currentIndex}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.4 }}
            className="w-full bg-white/[0.08] backdrop-blur-xl border border-white/15 rounded-3xl overflow-hidden shadow-2xl relative"
          >
            {/* Image Container or Romantic Card Placeholder */}
            <div className="relative w-full h-72 sm:h-96 bg-black/40 flex items-center justify-center overflow-hidden">
              {currentItem.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentItem.photoUrl}
                  alt={currentItem.title}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              ) : (
                <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 rounded-full bg-pink-500/20 border border-pink-400/30 flex items-center justify-center mb-4 text-pink-300">
                    <Heart className="w-8 h-8 fill-pink-400/50" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-white mb-2">
                    {currentItem.title}
                  </h3>
                  <p className="text-sm text-pink-200/80 max-w-sm italic">
                    &ldquo;{currentItem.caption}&rdquo;
                  </p>
                </div>
              )}

              {/* Date / Milestone pill */}
              {currentItem.dateOrMonth && (
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs font-medium text-pink-200">
                  {currentItem.dateOrMonth}
                </div>
              )}
            </div>

            {/* Caption & Title Footer */}
            {currentItem.photoUrl && (
              <div className="p-5 text-left bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                <h3 className="text-lg font-serif font-semibold text-white">
                  {currentItem.title}
                </h3>
                {currentItem.caption && (
                  <p className="text-xs sm:text-sm text-pink-100/80 mt-1 line-clamp-2">
                    {currentItem.caption}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Carousel Prev/Next Buttons */}
        {memoryList.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all shadow-md active:scale-95"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all shadow-md active:scale-95"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Pagination Dots */}
      {memoryList.length > 1 && (
        <div className="flex items-center gap-1.5 mt-4">
          {memoryList.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                currentIndex === idx ? "w-6 bg-pink-500" : "w-2 bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Bottom CTA to next scene */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8"
      >
        <button
          onClick={onProceed}
          className="px-8 py-3.5 rounded-full font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg flex items-center gap-2 transform hover:scale-105 active:scale-95 transition-all"
        >
          <span>Read My Love Letter 💌</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
}
