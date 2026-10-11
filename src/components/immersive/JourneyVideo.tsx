"use client";

import { useEffect, useRef } from "react";
import { scrollState } from "@/lib/immersive/scrollState";

export default function JourneyVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; // poster only

    let raf = 0;
    let cur = 0;
    let last = -1;
    let primed = false;

    // iOS only lets a video be controlled after one user gesture
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
        } // refresh mid-page: no scrub from 0
        cur += (target - cur) * 0.15; // extra smoothing on top of Lenis
        if (!v.seeking && Math.abs(cur - last) > 0.008) {
          v.currentTime = cur;
          last = cur;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(loop);
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("touchstart", unlock);
    };
  }, []);

  return (
    <video
      ref={ref}
      id="journey-video"
      className="fixed inset-0 z-0 h-full w-full object-cover pointer-events-none"
      muted
      playsInline
      preload="auto"
      poster="/video/hero-poster.jpg"
      aria-hidden="true"
      tabIndex={-1}
    >
      <source src="/video/hero-journey.mp4" type="video/mp4" />
    </video>
  );
}
