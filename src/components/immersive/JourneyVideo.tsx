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

    // Fluid background video playback engine
    const startPlayback = () => {
      try {
        const p = v.play();
        if (p !== undefined) {
          p.catch(() => {});
        }
      } catch {}
    };

    startPlayback();

    // Unlock on initial interaction if device policy required a user gesture
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
    let curRate = 1.0;

    const loop = (now: number) => {
      const elapsed = (now - startTime) * 0.001;

      // 1. Organic Ambient Breathing: 0.65Hz gentle harmonic expansion
      const breath = Math.sin(elapsed * 0.65) * 0.016;

      // 2. Multi-Plane Optical Scroll Parallax (translates subtly up with scroll depth)
      const targetY = -scrollState.progress * 42; // Smooth 0-42px drift
      curY += (targetY - curY) * 0.08;

      // 3. Combined Scale: Base + Breath + Subtle Scroll Depth
      const targetScale = 1.025 + breath + scrollState.progress * 0.035;
      curScale += (targetScale - curScale) * 0.08;

      // 4. Scroll Velocity-Reactive Playback Rate (organically breathes with scroll tempo without seeking)
      const velocity = Math.abs(scrollState.velocity || 0);
      const targetRate = Math.min(1.0 + velocity * 0.16, 1.35);
      curRate += (targetRate - curRate) * 0.08;

      if (v.playbackRate !== undefined && Math.abs(v.playbackRate - curRate) > 0.02) {
        try {
          v.playbackRate = Number(curRate.toFixed(2));
        } catch {}
      }

      // GPU hardware transform running at native 60/120 FPS
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
    <video
      ref={ref}
      id="journey-video"
      className="fixed inset-0 z-0 h-[100dvh] min-h-[100vh] w-full object-cover object-center pointer-events-none"
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
  );
}
