"use client";

import { useEffect, useRef } from "react";
import { scrollState } from "@/lib/immersive/scrollState";

export default function JourneyVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      try {
        v.pause();
      } catch {}
      return;
    }

    let raf = 0;
    let cur = 0;
    let last = -1;
    let primed = false;

    // iOS unlocks scrubbing after first user touch gesture
    const unlock = () => {
      v.play()
        .then(() => v.pause())
        .catch(() => {});
    };
    window.addEventListener("touchstart", unlock, { once: true, passive: true });

    const loop = () => {
      const d = v.duration;
      if (d && isFinite(d)) {
        const target = Math.min(Math.max(scrollState.progress, 0), 1) * (d - 0.05);
        if (!primed) {
          cur = target;
          primed = true;
        }
        cur += (target - cur) * 0.15;
        if (!v.seeking && Math.abs(cur - last) > 0.008) {
          v.currentTime = cur;
          last = cur;
        }
        const scale = 1.0 + (cur / d) * 0.04;
        v.style.transform = `scale(${scale.toFixed(4)})`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !mediaQuery.matches) {
        raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        cancelAnimationFrame(raf);
        try {
          v.pause();
        } catch {}
      } else {
        raf = requestAnimationFrame(loop);
      }
    };
    mediaQuery.addEventListener("change", handleMotionChange);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("touchstart", unlock);
      mediaQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  return (
    <video
      ref={ref}
      id="journey-video"
      className="fixed inset-0 z-0 h-full w-full object-cover pointer-events-none"
      muted
      playsInline
      preload="metadata"
      poster="/video/hero-poster.jpg"
      aria-hidden="true"
      tabIndex={-1}
    >
      <source src="/video/hero-journey.mp4" type="video/mp4" />
    </video>
  );
}
