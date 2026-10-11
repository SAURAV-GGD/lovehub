"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  BookOpen,
  Sparkles,
  Heart,
} from "lucide-react";

interface CardsFlipbookProps {
  photos: string[];
  captions?: string[];
  autoPlay?: boolean;
  autoPlaySpeed?: number;
  className?: string;
}

/**
 * Synthesizes a realistic crisp paper-flip swoosh sound using Web Audio API
 * (100% client-side, zero network dependencies, instant response)
 */
function playPaperFlipSound() {
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const duration = 0.16;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    // Filtered pink noise simulating paper brush/friction
    for (let i = 0; i < bufferSize; i++) {
      const decay = Math.exp(-i / (bufferSize * 0.35));
      output[i] = (Math.random() * 2 - 1) * decay;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(950, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + duration);
    filter.Q.setValueAtTime(1.8, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + duration);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    whiteNoise.start();
  } catch {
    // Ignore audio permission/context errors silently
  }
}
const flipVariants: Variants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 120 : -120,
    rotateY: dir > 0 ? 35 : -35,
    rotateZ: dir > 0 ? 4 : -4,
    scale: 0.92,
    opacity: 0,
  }),
  center: {
    x: 0,
    rotateY: 0,
    rotateZ: 0,
    scale: 1,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -260 : 260,
    rotateY: dir > 0 ? -55 : 55,
    rotateZ: dir > 0 ? -8 : 8,
    scale: 0.88,
    opacity: 0,
    transition: { duration: 0.38, ease: [0.32, 0.72, 0, 1] as const },
  }),
};

export function CardsFlipbook({
  photos,
  captions = [],
  autoPlay = true,
  autoPlaySpeed = 4000,
  className = "",
}: CardsFlipbookProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalPages = photos.length;

  const triggerFlipSound = useCallback(() => {
    if (soundEnabled) {
      playPaperFlipSound();
    }
  }, [soundEnabled]);

  const paginate = useCallback(
    (newDirection: 1 | -1) => {
      if (totalPages <= 1) return;
      setDirection(newDirection);
      triggerFlipSound();
      setCurrentIndex((prev) => {
        if (newDirection === 1) {
          return (prev + 1) % totalPages;
        }
        return (prev - 1 + totalPages) % totalPages;
      });
    },
    [totalPages, triggerFlipSound]
  );

  const goToPage = useCallback(
    (pageIndex: number) => {
      if (pageIndex === currentIndex) return;
      setDirection(pageIndex > currentIndex ? 1 : -1);
      triggerFlipSound();
      setCurrentIndex(pageIndex);
    },
    [currentIndex, triggerFlipSound]
  );

  // Auto-flip slideshow interval
  useEffect(() => {
    if (!isPlaying || totalPages <= 1) return;
    const timer = setInterval(() => {
      paginate(1);
    }, autoPlaySpeed);
    return () => clearInterval(timer);
  }, [isPlaying, totalPages, autoPlaySpeed, paginate]);

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  if (totalPages === 0) return null;

  // Stacking indices for the 3D card deck
  const nextIndex1 = (currentIndex + 1) % totalPages;
  const nextIndex2 = (currentIndex + 2) % totalPages;

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-xl mx-auto flex flex-col items-center select-none py-4 ${
        isFullscreen ? "min-h-screen justify-center bg-black/95 p-6" : ""
      } ${className}`}
    >
      {/* Top Floating Utility Bar (Heyzine Style) */}
      <div className="w-full flex items-center justify-between px-3 py-1.5 mb-3 text-xs text-white/80">
        <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-sm">
          <BookOpen className="w-3.5 h-3.5 text-pink-300" />
          <span className="font-semibold text-[11px] tracking-wide uppercase">
            Storybook Deck
          </span>
          <span className="text-white/40">•</span>
          <span className="font-mono text-[11px] text-pink-200">
            {currentIndex + 1} / {totalPages}
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md p-1 rounded-full border border-white/10 shadow-sm">
          {/* Autoplay Toggle */}
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-1.5 rounded-full transition-colors ${
              isPlaying
                ? "bg-pink-500/80 text-white"
                : "text-white/60 hover:text-white hover:bg-white/10"
            }`}
            title={isPlaying ? "Pause auto-flip" : "Play auto-flip"}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
          </button>

          {/* Sound Flip Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-full transition-colors ${
              soundEnabled
                ? "text-pink-300 hover:bg-white/10"
                : "text-white/40 hover:bg-white/10"
            }`}
            title={soundEnabled ? "Mute flip sound" : "Enable flip sound"}
          >
            {soundEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen flipbook"}
          >
            {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* 3D Stack Stage (Heyzine Cards Viewport) */}
      <div
        className="relative w-full aspect-[4/3] sm:aspect-[16/11] max-w-lg mx-auto flex items-center justify-center"
        style={{ perspective: 1400 }}
      >
        {/* Layer 3: Deepest Background Stacked Card */}
        {totalPages > 2 && (
          <div
            className="absolute inset-x-8 inset-y-4 rounded-3xl overflow-hidden bg-black/40 border border-white/10 shadow-xl transition-all duration-300 pointer-events-none"
            style={{
              transform: "translate3d(18px, 16px, -140px) rotateZ(-3.5deg) scale(0.90)",
              opacity: 0.5,
              zIndex: 10,
            }}
          >
            <img
              src={photos[nextIndex2]}
              alt="Stacked background memory"
              className="w-full h-full object-cover filter blur-[1px] brightness-75"
            />
          </div>
        )}

        {/* Layer 2: Second Stacked Card (Waiting to Flip Up) */}
        {totalPages > 1 && (
          <div
            className="absolute inset-x-5 inset-y-2 rounded-3xl overflow-hidden bg-black/30 border border-white/20 shadow-2xl transition-all duration-300 pointer-events-none"
            style={{
              transform: "translate3d(10px, 9px, -70px) rotateZ(2deg) scale(0.95)",
              opacity: 0.85,
              zIndex: 20,
            }}
          >
            <img
              src={photos[nextIndex1]}
              alt="Next stacked memory"
              className="w-full h-full object-cover filter brightness-90"
            />
            {/* Soft shadow overlay simulating card depth */}
            <div className="absolute inset-0 bg-black/20" />
          </div>
        )}

        {/* Layer 1: Active Interactive Card with 3D Turn Animation */}
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={flipVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 26,
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.65}
            onDragEnd={(_, info) => {
              const swipeThreshold = 50;
              if (info.offset.x < -swipeThreshold) {
                paginate(1);
              } else if (info.offset.x > swipeThreshold) {
                paginate(-1);
              }
            }}
            className="absolute inset-0 z-30 cursor-grab active:cursor-grabbing rounded-3xl overflow-hidden bg-zinc-950 border-2 border-white/30 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.7)] group"
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            {/* Card Photo */}
            <img
              src={photos[currentIndex]}
              alt={captions[currentIndex] || `Memory ${currentIndex + 1}`}
              className="w-full h-full object-cover select-none transition-transform duration-700 group-hover:scale-105"
              draggable={false}
            />

            {/* Glossy Paper Sheen Overlay (Heyzine Style) */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/15 pointer-events-none" />

            {/* Left Spine Book Shadow */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/30 to-transparent pointer-events-none" />

            {/* Floating Top Badge */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full border border-white/20 text-white shadow-md">
              <Sparkles className="w-3 h-3 text-pink-300" />
              <span className="text-[11px] font-semibold tracking-wider">
                PAGE {currentIndex + 1}
              </span>
            </div>

            {/* Bottom Caption Pill */}
            {captions[currentIndex] && (
              <div className="absolute bottom-4 inset-x-4 z-20">
                <div className="bg-black/60 backdrop-blur-md border border-white/20 text-white px-4 py-2.5 rounded-2xl shadow-xl text-center">
                  <p className="text-sm font-medium italic text-pink-100 line-clamp-2">
                    &ldquo;{captions[currentIndex]}&rdquo;
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Left & Right Interactive Side Click Arrows (Heyzine Style) */}
        {totalPages > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                paginate(-1);
              }}
              className="absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 z-40 w-11 h-11 bg-white/20 hover:bg-white/40 border border-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-xl transition-all hover:scale-110 active:scale-95"
              title="Previous Page"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                paginate(1);
              }}
              className="absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 z-40 w-11 h-11 bg-white/20 hover:bg-white/40 border border-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-xl transition-all hover:scale-110 active:scale-95"
              title="Next Page"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Bottom Floating Navigation Dock (Heyzine Control Bar) */}
      {totalPages > 1 && (
        <div className="mt-5 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/15 shadow-xl">
          <button
            type="button"
            onClick={() => paginate(-1)}
            className="p-1 text-white/70 hover:text-white transition-colors"
            title="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5 px-1">
            {photos.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => goToPage(idx)}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentIndex
                    ? "w-6 h-2 bg-pink-400 shadow-sm shadow-pink-500/50"
                    : "w-2 h-2 bg-white/40 hover:bg-white/70"
                }`}
                title={`Go to page ${idx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => paginate(1)}
            className="p-1 text-white/70 hover:text-white transition-colors"
            title="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Touch / Swipe hint for mobile visitors */}
      <p className="mt-2 text-[11px] text-white/50 flex items-center gap-1">
        <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
        <span>Swipe or tap arrows to flip through our memories</span>
      </p>
    </div>
  );
}
