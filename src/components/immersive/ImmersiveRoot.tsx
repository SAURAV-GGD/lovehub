"use client";

import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { useEffect, useState } from "react";
import { TIER_CONFIG, nextLowerTier, type Tier } from "@/lib/immersive/quality";
import { CameraRig } from "./CameraRig";
import { Petals } from "./Petals";

export default function ImmersiveRoot({ initialTier }: { initialTier: Tier }) {
  const [tier, setTier] = useState<Tier>(initialTier);
  const [visible, setVisible] = useState(true);
  const cfg = tier === "static" ? TIER_CONFIG.low : TIER_CONFIG[tier];
  const [dpr, setDpr] = useState(cfg.dprMax);

  useEffect(() => {
    const onVis = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.immersive = tier;
  }, [tier]);

  if (tier === "static") return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[1]" aria-hidden="true">
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={dpr}
        gl={{ antialias: false, alpha: true, stencil: false, powerPreference: "default" }}
        camera={{ fov: 55, near: 0.1, far: 60, position: [0, 0, 0] }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <PerformanceMonitor
          flipflops={3}
          onDecline={() => setDpr((d) => Math.max(1, +(d - 0.25).toFixed(2)))}
          onIncline={() => setDpr((d) => Math.min(cfg.dprMax, +(d + 0.25).toFixed(2)))}
          onFallback={() => setTier((t) => nextLowerTier(t))}
        />
        <CameraRig />
        <Petals count={cfg.petals} />
      </Canvas>
    </div>
  );
}
