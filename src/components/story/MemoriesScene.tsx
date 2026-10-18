"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StoryMemoryItem } from "@/lib/proposal-types";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Sparkles,
  ArrowRight,
  Maximize2,
  X,
  MessageCircle,
  LayoutGrid,
  Film,
} from "lucide-react";

interface MemoriesSceneProps {
  title?: string;
  subtitle?: string;
  items: StoryMemoryItem[];
  autoPlay?: boolean;
  intervalSec?: number;
  layoutMode?: "slideshow" | "grid" | "chat_timeline";
  onProceed: () => void;
}

export function MemoriesScene({
  title = "Our Cherished Moments 📸",
  subtitle = "Every picture holds a thousand heartbeats",
  items,
  autoPlay = true,
  intervalSec = 4,
  layoutMode: initialLayoutMode = "slideshow",
  onProceed,
}: MemoriesSceneProps) {
  const [layout, setLayout] = useState<"slideshow" | "timeline">(
    initialLayoutMode === "chat_timeline" || initialLayoutMode === "grid" ? "timeline" : "slideshow"
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [activeModalItem, setActiveModalItem] = useState<StoryMemoryItem | null>(null);

  // Fallback if no memories provided
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
            type: "photo",
          },
          {
            id: "default_2",
            title: "Our 3 AM Conversations",
            caption: "Talking till dawn about everything, nothing, and our future.",
            photoUrl: "",
            dateOrMonth: "Under the stars",
            type: "chat",
            sender: "My Love",
            timestamp: "03:14 AM",
          },
          {
            id: "default_3",
            title: "Overcoming Every Storm",
            caption: "Holding hands tighter through every challenge life threw at us.",
            photoUrl: "",
            dateOrMonth: "Stronger together",
            type: "photo",
          },
        ];

  // Auto-play interval for slideshow mode
  useEffect(() => {
    if (layout !== "slideshow" || !autoPlay || isPaused || memoryList.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % memoryList.length);
    }, intervalSec * 1000);

    return () => clearInterval(timer);
  }, [layout, autoPlay, isPaused, intervalSec, memoryList.length]);

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
        className="mb-4 space-y-1"
      >
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-pink-400" />
          <span>{title}</span>
          <Sparkles className="w-5 h-5 text-pink-400" />
        </h2>
        {subtitle && <p className="text-xs sm:text-sm text-pink-200/70 font-light">{subtitle}</p>}
      </motion.div>

      {/* View Toggle: Slideshow vs Timeline */}
      <div className="flex items-center gap-2 mb-4 p-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs">
        <button
          onClick={() => setLayout("slideshow")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
            layout === "slideshow" ? "bg-pink-500 text-white font-medium shadow-md" : "text-white/70 hover:text-white"
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>Slideshow</span>
        </button>
        <button
          onClick={() => setLayout("timeline")}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
            layout === "timeline" ? "bg-pink-500 text-white font-medium shadow-md" : "text-white/70 hover:text-white"
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Timeline View</span>
        </button>
      </div>

      {/* Main Content Area */}
      {layout === "slideshow" ? (
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
              className="w-full bg-white/[0.08] backdrop-blur-xl border border-white/15 rounded-3xl overflow-hidden shadow-2xl relative cursor-pointer group"
              onClick={() => setActiveModalItem(currentItem)}
            >
              {/* Image Container or Romantic Card Placeholder */}
              <div className="relative w-full h-72 sm:h-96 bg-black/40 flex items-center justify-center overflow-hidden">
                {currentItem.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentItem.photoUrl}
                    alt={currentItem.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                    <div className="w-16 h-16 rounded-full bg-pink-500/20 border border-pink-400/30 flex items-center justify-center mb-4 text-pink-300">
                      {currentItem.type === "chat" ? (
                        <MessageCircle className="w-8 h-8 text-pink-400" />
                      ) : (
                        <Heart className="w-8 h-8 fill-pink-400/50" />
                      )}
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

                {/* Chat tag pill if chat screenshot */}
                {currentItem.type === "chat" && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-600/80 backdrop-blur-md text-[11px] font-semibold text-white shadow">
                    <MessageCircle className="w-3 h-3" />
                    <span>Saved Chat</span>
                  </div>
                )}

                {/* Zoom indicator on hover */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full bg-black/60 backdrop-blur-md text-white">
                  <Maximize2 className="w-4 h-4" />
                </div>
              </div>

              {/* Caption & Title Footer */}
              {currentItem.photoUrl && (
                <div className="p-5 text-left bg-gradient-to-t from-black/90 via-black/50 to-transparent">
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
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all shadow-md active:scale-95 z-20"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all shadow-md active:scale-95 z-20"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Pagination Dots */}
          {memoryList.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-4">
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
        </div>
      ) : (
        /* Timeline View of All Memories */
        <div className="w-full space-y-4 max-h-[55vh] overflow-y-auto pr-1">
          {memoryList.map((item, idx) => (
            <motion.div
              key={item.id || idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              onClick={() => setActiveModalItem(item)}
              className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-left cursor-pointer transition-all hover:scale-[1.01]"
            >
              {item.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.photoUrl}
                  alt={item.title}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 border border-white/10"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center shrink-0 text-pink-300">
                  {item.type === "chat" ? (
                    <MessageCircle className="w-6 h-6" />
                  ) : (
                    <Heart className="w-6 h-6 fill-pink-400" />
                  )}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-serif font-semibold text-white text-sm sm:text-base truncate">
                    {item.title}
                  </h4>
                  {item.dateOrMonth && (
                    <span className="text-[11px] text-pink-300/80 shrink-0 font-medium">
                      {item.dateOrMonth}
                    </span>
                  )}
                </div>
                {item.caption && (
                  <p className="text-xs text-pink-100/70 line-clamp-2 leading-relaxed">
                    {item.caption}
                  </p>
                )}
                {item.type === "chat" && item.sender && (
                  <span className="inline-block mt-1 text-[10px] text-pink-400 font-medium">
                    💬 {item.sender} {item.timestamp ? `• ${item.timestamp}` : ""}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Lightbox / High-Res Zoom Modal */}
      <AnimatePresence>
        {activeModalItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveModalItem(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg w-full bg-stone-900 border border-pink-500/30 rounded-3xl overflow-hidden shadow-2xl"
            >
              <button
                onClick={() => setActiveModalItem(null)}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {activeModalItem.photoUrl && (
                <div className="max-h-[60vh] overflow-hidden bg-black flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeModalItem.photoUrl}
                    alt={activeModalItem.title}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              <div className="p-6 text-left space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-lg text-white">
                    {activeModalItem.title}
                  </h3>
                  {activeModalItem.dateOrMonth && (
                    <span className="text-xs text-pink-300 bg-pink-500/20 px-2.5 py-0.5 rounded-full">
                      {activeModalItem.dateOrMonth}
                    </span>
                  )}
                </div>
                {activeModalItem.caption && (
                  <p className="text-sm text-pink-100/80 leading-relaxed italic">
                    &ldquo;{activeModalItem.caption}&rdquo;
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
