"use client";

import { useRef } from "react";
import { Group, MathUtils, Color } from "three";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { scrollState } from "@/lib/immersive/scrollState";

interface StarDustFieldProps {
  count?: number;
}

export function StarDustField({ count = 220 }: StarDustFieldProps) {
  const groupRef = useRef<Group>(null);
  const colorRef = useRef(new Color("#fda4af"));

  useFrame((state, dt) => {
    const p = scrollState.progress;
    const vel = scrollState.velocity;
    const ptr = scrollState.pointer;

    if (groupRef.current) {
      // Gentle parallax response to mouse cursor
      groupRef.current.position.x = MathUtils.damp(
        groupRef.current.position.x,
        ptr.x * 0.8,
        3,
        dt
      );
      groupRef.current.position.y = MathUtils.damp(
        groupRef.current.position.y,
        ptr.y * 0.5 - p * 3.5, // Drift upward as page scrolls down
        2.5,
        dt
      );

      // Subtle reactive rotation
      groupRef.current.rotation.y = MathUtils.damp(
        groupRef.current.rotation.y,
        p * 0.8 + ptr.x * 0.2,
        3,
        dt
      );
    }
  });

  return (
    <group ref={groupRef}>
      {/* 1. Large foreground sparkling particles */}
      <Sparkles
        count={Math.floor(count * 0.35)}
        scale={[18, 24, 15]}
        size={4.2}
        speed={0.4}
        opacity={0.65}
        color="#fb7185"
      />

      {/* 2. Midground soft romantic stars */}
      <Sparkles
        count={Math.floor(count * 0.45)}
        scale={[24, 32, 22]}
        size={2.8}
        speed={0.6}
        opacity={0.5}
        color="#f472b6"
      />

      {/* 3. Deep background constellation dust */}
      <Sparkles
        count={Math.floor(count * 0.4)}
        scale={[30, 40, 30]}
        size={1.6}
        speed={0.25}
        opacity={0.4}
        color="#c084fc"
      />

      {/* 4. Golden starlight sparks (reveals near pricing & footer) */}
      <Sparkles
        count={Math.floor(count * 0.25)}
        scale={[20, 25, 18]}
        size={3.0}
        speed={0.5}
        opacity={0.45}
        color="#fbbf24"
      />
    </group>
  );
}
