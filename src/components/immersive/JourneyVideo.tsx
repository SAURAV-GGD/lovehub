"use client";

import { useEffect, useRef } from "react";
import { scrollState } from "@/lib/immersive/scrollState";

export default function JourneyVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    // Explicitly enforce muted attributes for Safari/iOS autoplay/scrub policy
    v.muted = true;
    (v as HTMLVideoElement & { defaultMuted?: boolean }).defaultMuted = true;

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

    // iOS Safari requires a user gesture (touch or scroll) to prime the video pipeline for scrubbing
    const unlock = () => {
      try {
        const p = v.play();
        if (p !== undefined) {
          p.then(() => v.pause()).catch(() => {});
        }
      } catch {}
    };

    const unlockEvents = ["touchstart", "touchend", "pointerdown", "scroll"] as const;
    unlockEvents.forEach((evt) => {
      window.addEventListener(evt, unlock, { once: true, passive: true });
    });

    const loop = () => {
      const d = v.duration;
      // Guard readyState >= 1 (HAVE_METADATA) to prevent iOS Safari throwing InvalidStateError on currentTime assignment
      if (d && isFinite(d) && v.readyState >= 1) {
        const target = Math.min(Math.max(scrollState.progress, 0), 1) * (d - 0.05);
        if (!primed) {
          cur = target;
          primed = true;
        }
        cur += (target - cur) * 0.15;
        if (!v.seeking && Math.abs(cur - last) > 0.008) {
          try {
            v.currentTime = cur;
            last = cur;
          } catch {
            // Guard against edge-case seek rejections during high-frequency touch scrub
          }
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
      unlockEvents.forEach((evt) => {
        window.removeEventListener(evt, unlock);
      });
      mediaQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  return (
    <video
      ref={ref}
      id="journey-video"
      className="fixed inset-0 z-0 h-[100dvh] min-h-[100vh] w-full object-cover object-center pointer-events-none"
      style={{
        transform: "translateZ(0)",
        WebkitTransform: "translateZ(0)",
        willChange: "transform",
      }}
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
