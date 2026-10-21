"use client";

import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { useEffect, useState, Suspense } from "react";
import { TIER_CONFIG, nextLowerTier, type Tier } from "@/lib/immersive/quality";
import { CameraRig } from "./CameraRig";
import { Petals } from "./Petals";
import { ScrollCrystals } from "@/components/3d/ScrollCrystals";
import { StarDustField } from "@/components/3d/StarDustField";
import { FooterStarlightWave } from "@/components/3d/FooterStarlightWave";

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
        
        <Suspense fallback={null}>
          {/* 1. Luminous 3D StarDust & Sparkles spanning the entire depth */}
          <StarDustField count={cfg.petals * 2} />

          {/* 2. Floating 3D Love Crystals & Faceted Prisms that travel with scroll */}
          {tier !== "low" && <ScrollCrystals />}

          {/* 3. Falling cherry blossom romantic petals */}
          <Petals count={cfg.petals} />

          {/* 4. Undulating 3D Starlight Wave horizon near the Footer */}
          <FooterStarlightWave />
        </Suspense>
      </Canvas>
    </div>
  );
}
