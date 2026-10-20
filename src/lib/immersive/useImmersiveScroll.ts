"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { scrollState } from "./scrollState";

export function useImmersiveScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Helper to calculate scroll progress
    const computeProgress = (currentScroll: number) => {
      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );
      return Math.min(Math.max(currentScroll / maxScroll, 0), 1);
    };

    let lenis: Lenis | null = null;
    let rafId = 0;

    if (!reducedMotion) {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        touchMultiplier: 1.0,
      });

      lenis.on("scroll", (e: { scroll: number; velocity: number; direction: number }) => {
        const prog = computeProgress(e.scroll);
        scrollState.progress = prog;
        scrollState.target = prog;
        scrollState.velocity = e.velocity || 0;
        scrollState.direction = e.direction || 0;
        scrollState.isMoving = Math.abs(e.velocity) > 0.01;
      });

      const raf = (time: number) => {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    } else {
      // Reduced motion fallback: use native window scroll
      const onNativeScroll = () => {
        const scrollY = window.scrollY;
        const prog = computeProgress(scrollY);
        scrollState.progress = prog;
        scrollState.target = prog;
        scrollState.velocity = 0;
        scrollState.direction = 0;
        scrollState.isMoving = false;
      };

      window.addEventListener("scroll", onNativeScroll, { passive: true });
      onNativeScroll();
    }

    // Pointer tracking for subtle 3D parallax
    const onPointerMove = (e: MouseEvent) => {
      scrollState.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      scrollState.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    // Handle tab visibility
    const onVisibilityChange = () => {
      if (document.hidden) {
        if (lenis) lenis.stop();
        cancelAnimationFrame(rafId);
      } else {
        if (lenis) {
          lenis.start();
          const resumeRaf = (time: number) => {
            lenis?.raf(time);
            rafId = requestAnimationFrame(resumeRaf);
          };
          rafId = requestAnimationFrame(resumeRaf);
        }
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    // Initial sync
    const initialProg = computeProgress(window.scrollY);
    scrollState.progress = initialProg;
    scrollState.target = initialProg;

    return () => {
      if (lenis) {
        lenis.destroy();
      }
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);
}
