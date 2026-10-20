"use client";

import { useEffect, useRef } from "react";
import { scrollState } from "@/lib/immersive/scrollState";

export default function JourneyVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    // Enforce muted attributes for cross-browser / iOS Safari autoplay policy
    v.muted = true;
    (v as HTMLVideoElement & { defaultMuted?: boolean }).defaultMuted = true;

    const startPlayback = () => {
      try {
        const p = v.play();
        if (p !== undefined) {
          p.catch(() => {});
        }
      } catch {}
    };

    startPlayback();

    const unlockEvents = ["touchstart", "pointerdown", "scroll", "wheel"] as const;
    const unlock = () => {
      startPlayback();
    };
    unlockEvents.forEach((evt) => {
      window.addEventListener(evt, unlock, { once: true, passive: true });
    });

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      return () => {
        unlockEvents.forEach((evt) => window.removeEventListener(evt, unlock));
      };
    }

    let raf = 0;
    let startTime = performance.now();
    let curScale = 1.03;
    let curY = 0;

    const loop = (now: number) => {
      const elapsed = (now - startTime) * 0.001;

      // 1. Organic Ambient Breathing: 0.65Hz gentle harmonic expansion
      const breath = Math.sin(elapsed * 0.65) * 0.016;

      // 2. Optical Scroll Parallax (subtle upward drift during scroll)
      const targetY = -scrollState.progress * 60;
      curY += (targetY - curY) * 0.08;

      // 3. Combined Scale: Base + Breath
      const targetScale = 1.03 + breath;
      curScale += (targetScale - curScale) * 0.08;

      // GPU hardware transform
      v.style.transform = `translate3d(0, ${curY.toFixed(2)}px, 0) scale(${curScale.toFixed(4)})`;

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        try {
          v.pause();
        } catch {}
      } else {
        startTime = performance.now();
        startPlayback();
        raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      unlockEvents.forEach((evt) => {
        window.removeEventListener(evt, unlock);
      });
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
      <video
        ref={ref}
        id="journey-video"
        className="w-full h-full object-cover object-center"
        style={{
          transform: "translate3d(0, 0px, 0) scale(1.03)",
          WebkitTransform: "translate3d(0, 0px, 0) scale(1.03)",
          willChange: "transform",
        }}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/video/hero-poster.jpg"
        disablePictureInPicture
        disableRemotePlayback
        aria-hidden="true"
        tabIndex={-1}
      >
        <source src="/video/hero-journey.mp4" type="video/mp4" />
      </video>

      {/* Cinematic Contrast Scrim & Bottom Soft Dissolve to #080B11 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 via-50% to-[#080B11]" />
    </div>
  );
}
