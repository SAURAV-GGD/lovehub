"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingHeartItem {
  id: string;
  xPercent: number; // 5% - 95%
  size: number; // 22px - 58px
  duration: number; // 12s - 22s
  delay: number; // 0s - 8s
  swayAmplitude: number; // 15px - 45px
  swayDuration: number; // 3s - 6s
  initialRotation: number;
  layer: "back" | "mid" | "front";
  isBursting: boolean;
  burstX?: number;
  burstY?: number;
}

interface SparkleParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  type: "heart" | "sparkle" | "orb";
}

interface BurstEffect {
  id: string;
  x: number;
  y: number;
  particles: SparkleParticle[];
}

// Gentle Web Audio API pastel pop sound synthesizer
const playSoftPopSound = () => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    const now = ctx.currentTime;
    
    // Quick, sweet bubble pop pitch slide
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(940, now + 0.04);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.08);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 200);
  } catch {
    // Silent fail if audio policy blocks
  }
};

export default function InteractiveFloatingHearts({
  heartCount = 10,
}: {
  heartCount?: number;
}) {
  const [hearts, setHearts] = useState<FloatingHeartItem[]>([]);
  const [bursts, setBursts] = useState<BurstEffect[]>([]);
  const [poppedCount, setPoppedCount] = useState(0);
  const [showCounter, setShowCounter] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize atmospheric floating hearts
  useEffect(() => {
    const initialHearts: FloatingHeartItem[] = Array.from({ length: heartCount }).map((_, i) => {
      const layerRand = Math.random();
      const layer: "back" | "mid" | "front" = 
        layerRand < 0.35 ? "back" : layerRand < 0.75 ? "mid" : "front";

      const size = layer === "back" ? 22 + Math.random() * 8 : layer === "mid" ? 32 + Math.random() * 12 : 46 + Math.random() * 14;
      const duration = layer === "back" ? 18 + Math.random() * 8 : layer === "mid" ? 14 + Math.random() * 6 : 11 + Math.random() * 5;

      return {
        id: `heart-${i}-${Date.now()}`,
        xPercent: 4 + Math.random() * 92,
        size,
        duration,
        delay: Math.random() * 12,
        swayAmplitude: 15 + Math.random() * 30,
        swayDuration: 3.5 + Math.random() * 3,
        initialRotation: (Math.random() - 0.5) * 24,
        layer,
        isBursting: false,
      };
    });

    setHearts(initialHearts);
  }, [heartCount]);

  // Burst handler on touch or click
  const handleHeartBurst = useCallback((id: string, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(20);
    }

    playSoftPopSound();

    let clientX = window.innerWidth / 2;
    let clientY = window.innerHeight / 2;

    if ("touches" in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ("clientX" in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    // Generate burst particles radiating outward
    const particleColors = [
      "rgba(255, 182, 193, 0.95)", // Baby Pink
      "rgba(255, 192, 203, 0.9)",  // Pastel Pink
      "rgba(255, 218, 224, 0.95)", // Pale Rose
      "rgba(255, 255, 255, 0.95)", // Pure Shimmer White
      "rgba(255, 105, 180, 0.85)", // Vibrant Rose
    ];

    const burstId = `burst-${id}-${Date.now()}`;
    const particleCount = 12;
    const newParticles: SparkleParticle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const speed = 40 + Math.random() * 70;
      const typeRand = Math.random();
      const type: "heart" | "sparkle" | "orb" =
        typeRand < 0.35 ? "heart" : typeRand < 0.7 ? "sparkle" : "orb";

      newParticles.push({
        id: `${burstId}-p-${i}`,
        x: 0,
        y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        size: type === "heart" ? 14 : type === "sparkle" ? 10 : 6,
        type,
      });
    }

    setBursts((prev) => [...prev, { id: burstId, x: clientX, y: clientY, particles: newParticles }]);
    setPoppedCount((prev) => prev + 1);
    setShowCounter(true);

    // Remove the burst heart from view and schedule replacement
    setHearts((prev) => prev.filter((h) => h.id !== id));

    // Clear particles after 600ms
    setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== burstId));
    }, 600);

    // Respawn a new heart at the bottom after 1.5s
    setTimeout(() => {
      const layerRand = Math.random();
      const layer: "back" | "mid" | "front" = 
        layerRand < 0.35 ? "back" : layerRand < 0.75 ? "mid" : "front";
      const size = layer === "back" ? 22 + Math.random() * 8 : layer === "mid" ? 32 + Math.random() * 12 : 46 + Math.random() * 14;
      const duration = layer === "back" ? 18 + Math.random() * 8 : layer === "mid" ? 14 + Math.random() * 6 : 11 + Math.random() * 5;

      const newHeart: FloatingHeartItem = {
        id: `heart-respawn-${Date.now()}-${Math.random()}`,
        xPercent: 4 + Math.random() * 92,
        size,
        duration,
        delay: 0,
        swayAmplitude: 15 + Math.random() * 30,
        swayDuration: 3.5 + Math.random() * 3,
        initialRotation: (Math.random() - 0.5) * 24,
        layer,
        isBursting: false,
      };

      setHearts((prev) => [...prev, newHeart]);
    }, 1500);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 overflow-hidden pointer-events-none z-10" 
      aria-hidden="true"
    >
      {/* Floating baby-pink translucent hearts */}
      {hearts.map((heart) => {
        const isBack = heart.layer === "back";
        const isFront = heart.layer === "front";
        const opacity = isBack ? 0.38 : isFront ? 0.85 : 0.65;
        const blur = isBack ? "blur(1px)" : "none";

        return (
          <motion.div
            key={heart.id}
            initial={{
              y: "108vh",
              x: 0,
              rotate: heart.initialRotation,
              opacity: 0,
            }}
            animate={{
              y: "-16vh",
              x: [0, heart.swayAmplitude, -heart.swayAmplitude, 0],
              rotate: [heart.initialRotation - 8, heart.initialRotation + 8, heart.initialRotation - 8],
              opacity: [0, opacity, opacity, 0],
            }}
            transition={{
              y: {
                duration: heart.duration,
                repeat: Infinity,
                delay: heart.delay,
                ease: "linear",
              },
              x: {
                duration: heart.swayDuration,
                repeat: Infinity,
                ease: "easeInOut",
              },
              rotate: {
                duration: heart.swayDuration * 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              },
              opacity: {
                duration: heart.duration,
                repeat: Infinity,
                delay: heart.delay,
                times: [0, 0.1, 0.85, 1],
                ease: "linear",
              },
            }}
            style={{
              position: "absolute",
              left: `${heart.xPercent}%`,
              bottom: 0,
              width: heart.size,
              height: heart.size,
              filter: blur,
            }}
            className="pointer-events-auto cursor-pointer touch-manipulation group select-none"
            onClick={(e) => handleHeartBurst(heart.id, e)}
            onTouchStart={(e) => handleHeartBurst(heart.id, e)}
            title="Tap to pop!"
          >
            {/* Figma-crafted translucent baby-pink heart with glass highlights */}
            <div className="relative w-full h-full transition-transform duration-200 group-hover:scale-115 group-active:scale-90">
              <svg
                viewBox="0 0 100 90"
                className="w-full h-full filter drop-shadow-[0_8px_16px_rgba(255,182,193,0.45)]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  {/* Subtle translucent baby-pink luxury gradient */}
                  <linearGradient id={`heartGrad-${heart.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFF0F3" stopOpacity="0.75" />
                    <stop offset="45%" stopColor="#FFCCD5" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#FFB3C1" stopOpacity="0.4" />
                  </linearGradient>

                  {/* Glass refraction glow */}
                  <linearGradient id={`glassGleam-${heart.id}`} x1="20%" y1="0%" x2="80%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Main Translucent Body */}
                <path
                  d="M50 82C50 82 12 55.4 12 30.5C12 17.5 22.3 8 34.5 8C41.8 8 47.5 12 50 16.5C52.5 12 58.2 8 65.5 8C77.7 8 88 17.5 88 30.5C88 55.4 50 82 50 82Z"
                  fill={`url(#heartGrad-${heart.id})`}
                  stroke="rgba(255, 255, 255, 0.75)"
                  strokeWidth="2.2"
                />

                {/* Delicate inner rim highlight */}
                <path
                  d="M50 78C50 78 16 52.8 16 31C16 19.8 24.8 11.5 35 11.5C41 11.5 46.5 14.8 49 19.2C51.5 14.8 57 11.5 63 11.5C73.2 11.5 82 19.8 82 31C82 52.8 50 78 50 78Z"
                  stroke="rgba(255, 182, 193, 0.55)"
                  strokeWidth="1.2"
                  fill="none"
                />

                {/* Curved Frosted Glass Specular Reflection on Upper Left lobe */}
                <path
                  d="M26 18C20 22 17 29 17 36C17 37 18 37 18.5 36.5C21 32 25 24 33 21C34 20.8 34 19.5 33 19.2C30.5 18.5 28 18.2 26 18Z"
                  fill={`url(#glassGleam-${heart.id})`}
                />

                {/* Soft Micro Shimmer Dot */}
                <circle cx="70" cy="24" r="2.5" fill="rgba(255, 255, 255, 0.7)" />
              </svg>
            </div>
          </motion.div>
        );
      })}

      {/* Burst Explosion Particles */}
      <AnimatePresence>
        {bursts.map((burst) => (
          <div
            key={burst.id}
            style={{
              position: "fixed",
              left: burst.x,
              top: burst.y,
              transform: "translate(-50%, -50%)",
            }}
            className="pointer-events-none z-50"
          >
            {/* Central luminous shockwave expanding */}
            <motion.div
              initial={{ scale: 0.3, opacity: 0.9 }}
              animate={{ scale: 2.6, opacity: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="absolute w-14 h-14 -left-7 -top-7 rounded-full border-2 border-pink-300/80 bg-pink-200/30 backdrop-blur-xs"
            />

            {/* Micro heart + sparkle particles flying out */}
            {burst.particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ x: 0, y: 0, scale: 0.8, opacity: 1 }}
                animate={{
                  x: p.vx,
                  y: p.vy + 20, // gentle gravity downward
                  scale: [1, 1.2, 0],
                  opacity: [1, 0.9, 0],
                  rotate: (Math.random() - 0.5) * 180,
                }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  color: p.color,
                }}
                className="select-none flex items-center justify-center font-bold"
              >
                {p.type === "heart" ? (
                  <span style={{ fontSize: `${p.size}px` }}>♡</span>
                ) : p.type === "sparkle" ? (
                  <span style={{ fontSize: `${p.size}px` }}>✦</span>
                ) : (
                  <div
                    style={{
                      width: `${p.size}px`,
                      height: `${p.size}px`,
                      backgroundColor: p.color,
                      boxShadow: "0 0 6px rgba(255, 182, 193, 0.8)",
                    }}
                    className="rounded-full"
                  />
                )}
              </motion.div>
            ))}

            {/* Tiny Floating "+1 💕" pop text */}
            <motion.div
              initial={{ opacity: 1, y: 0, scale: 0.8 }}
              animate={{ opacity: 0, y: -36, scale: 1.15 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute -top-6 -left-6 text-xs font-bold text-rose-500 whitespace-nowrap bg-white/90 px-2 py-0.5 rounded-full shadow-sm border border-pink-200 select-none"
            >
              +1 💕
            </motion.div>
          </div>
        ))}
      </AnimatePresence>

      {/* Luxury discreet bottom badge: "✨ Tap hearts to pop" */}
      <AnimatePresence>
        {showCounter && poppedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-5 right-5 pointer-events-auto z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-pink-200/80 dark:border-pink-900/40 px-4 py-2 rounded-full shadow-lg text-xs font-medium text-rose-600 dark:text-rose-300 flex items-center gap-2 select-none"
          >
            <span className="inline-block w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            <span>Popped {poppedCount} {poppedCount === 1 ? "Heart" : "Hearts"}! 💕</span>
            <button
              onClick={() => setShowCounter(false)}
              className="ml-1 text-gray-400 hover:text-gray-600 text-xs px-1"
              aria-label="Dismiss counter"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
