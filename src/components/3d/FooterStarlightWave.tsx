"use client";

import { useRef, useMemo } from "react";
import { Mesh, PlaneGeometry, MathUtils, Color } from "three";
import { useFrame } from "@react-three/fiber";
import { scrollState } from "@/lib/immersive/scrollState";

export function FooterStarlightWave() {
  const meshRef = useRef<Mesh>(null);

  // 40x24 plane grid for undulating wave
  const { geometry, originalPositions } = useMemo(() => {
    const geo = new PlaneGeometry(28, 14, 36, 20);
    const pos = geo.attributes.position;
    const orig = new Float32Array(pos.array.length);
    orig.set(pos.array);
    return { geometry: geo, originalPositions: orig };
  }, []);

  useFrame((state, dt) => {
    if (!meshRef.current) return;

    const p = scrollState.progress;
    // Reveal only as we approach pricing, FAQ, and footer (p >= 0.6)
    const revealFactor = MathUtils.smoothstep(p, 0.55, 0.95);
    
    // Position below the viewport at start, raising up as we reach footer
    const targetY = MathUtils.lerp(-12, -4.8, revealFactor);
    const targetOpacity = MathUtils.lerp(0, 0.45, revealFactor);

    meshRef.current.position.y = MathUtils.damp(meshRef.current.position.y, targetY, 2.5, dt);
    meshRef.current.position.z = MathUtils.damp(meshRef.current.position.z, -8, 2.5, dt);

    const mat = meshRef.current.material as any;
    if (mat) {
      mat.opacity = MathUtils.damp(mat.opacity, targetOpacity, 3, dt);
    }

    // Skip heavy vertex computation if not yet visible
    if (revealFactor < 0.05) return;

    const time = state.clock.getElapsedTime() * 0.9;
    const pos = geometry.attributes.position;
    const arr = pos.array as Float32Array;

    for (let i = 0; i < arr.length; i += 3) {
      const x = originalPositions[i];
      const y = originalPositions[i + 1];

      // Subtle traveling wave simulation
      const wave1 = Math.sin(x * 0.4 + time * 1.2) * 0.45;
      const wave2 = Math.cos(y * 0.6 + time * 1.5) * 0.35;
      const wave3 = Math.sin((x + y) * 0.3 + time * 0.8) * 0.25;

      arr[i + 2] = wave1 + wave2 + wave3;
    }

    pos.needsUpdate = true;
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      rotation={[-Math.PI * 0.38, 0, 0]}
      position={[0, -12, -8]}
    >
      <meshStandardMaterial
        color="#f43f5e"
        emissive="#fb7185"
        emissiveIntensity={0.6}
        wireframe={true}
        transparent={true}
        opacity={0}
      />
    </mesh>
  );
}
