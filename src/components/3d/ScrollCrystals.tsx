"use client";

import { useRef, useMemo } from "react";
import { Group, Mesh, MathUtils, Color } from "three";
import { useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import { scrollState } from "@/lib/immersive/scrollState";
import { getSharedHeartGeometry } from "./heartGeometry";

interface CrystalItem {
  id: number;
  type: "heart-gem" | "diamond" | "torus-band" | "octa";
  basePos: [number, number, number];
  heroPos: [number, number, number];
  stepsPos: [number, number, number];
  featuresPos: [number, number, number];
  pricingPos: [number, number, number];
  footerPos: [number, number, number];
  scale: number;
  distort: number;
  speed: number;
  colorHero: string;
  colorMid: string;
  colorEnd: string;
}

export function ScrollCrystals() {
  const groupRef = useRef<Group>(null);
  const crystalRefs = useRef<(Mesh | null)[]>([]);
  const heartGeom = useMemo(() => getSharedHeartGeometry(), []);

  // Curated layout of 3D floating crystals distributed along the page journey
  const crystals = useMemo<CrystalItem[]>(() => [
    // 1. Hero Right floating romantic jewel
    {
      id: 0,
      type: "heart-gem",
      basePos: [4.2, 1.2, -6],
      heroPos: [4.5, 1.0, -5],
      stepsPos: [-4.2, 0.5, -8],
      featuresPos: [4.0, -1.0, -7],
      pricingPos: [-3.8, 0.8, -6],
      footerPos: [0, 1.5, -5],
      scale: 1.15,
      distort: 0.35,
      speed: 1.8,
      colorHero: "#fb7185", // rose-400
      colorMid: "#f43f5e",  // rose-500
      colorEnd: "#fbbf24",  // amber-400
    },
    // 2. Hero Left ethereal floating love knot band
    {
      id: 1,
      type: "torus-band",
      basePos: [-4.5, 2.0, -9],
      heroPos: [-4.8, 2.2, -8],
      stepsPos: [4.4, 1.5, -9],
      featuresPos: [-4.5, 1.0, -8],
      pricingPos: [4.2, -0.5, -7],
      footerPos: [-2.5, 0.5, -6],
      scale: 0.75,
      distort: 0.2,
      speed: 1.4,
      colorHero: "#f472b6", // pink-400
      colorMid: "#c084fc",  // purple-400
      colorEnd: "#fbcfe8",  // pink-200
    },
    // 3. Process Steps faceted prism
    {
      id: 2,
      type: "diamond",
      basePos: [3.8, -2.5, -8],
      heroPos: [5.2, -2.0, -9],
      stepsPos: [-3.8, -1.5, -6],
      featuresPos: [3.5, 2.0, -7],
      pricingPos: [-4.0, -2.0, -8],
      footerPos: [2.2, -0.5, -6],
      scale: 0.85,
      distort: 0.25,
      speed: 2.2,
      colorHero: "#fda4af", // rose-300
      colorMid: "#e11d48",  // rose-600
      colorEnd: "#fef08a",  // yellow-200
    },
    // 4. Deep background ambient octave jewel
    {
      id: 3,
      type: "octa",
      basePos: [-3.2, -1.8, -12],
      heroPos: [-3.5, -2.0, -12],
      stepsPos: [3.0, -2.5, -11],
      featuresPos: [-3.2, -2.0, -10],
      pricingPos: [3.5, 2.2, -9],
      footerPos: [-1.2, -1.8, -7],
      scale: 0.65,
      distort: 0.15,
      speed: 1.2,
      colorHero: "#fecdd3", // rose-200
      colorMid: "#a855f7",  // purple-500
      colorEnd: "#fde047",  // yellow-300
    },
    // 5. Centered romantic micro-crystal
    {
      id: 4,
      type: "heart-gem",
      basePos: [0.5, -3.0, -10],
      heroPos: [0.8, -3.2, -11],
      stepsPos: [-0.5, 2.8, -9],
      featuresPos: [0.2, -2.5, -8],
      pricingPos: [0.5, 2.5, -7],
      footerPos: [0.0, -0.2, -5],
      scale: 0.6,
      distort: 0.4,
      speed: 2.0,
      colorHero: "#f43f5e",
      colorMid: "#db2777",
      colorEnd: "#f59e0b",
    },
  ], []);

  useFrame((state, dt) => {
    const p = scrollState.progress; // 0 to 1
    const ptr = scrollState.pointer; // -1 to 1

    // Subtly rotate the entire crystal constellation on cursor movement
    if (groupRef.current) {
      groupRef.current.rotation.y = MathUtils.damp(
        groupRef.current.rotation.y,
        ptr.x * 0.25 + p * 0.6,
        3,
        dt
      );
      groupRef.current.rotation.x = MathUtils.damp(
        groupRef.current.rotation.x,
        -ptr.y * 0.15 + (p - 0.5) * 0.2,
        3,
        dt
      );
    }

    // Interpolate individual crystal positions along the 5 journey milestones
    crystals.forEach((c, idx) => {
      const mesh = crystalRefs.current[idx];
      if (!mesh) return;

      let targetX = c.heroPos[0];
      let targetY = c.heroPos[1];
      let targetZ = c.heroPos[2];

      if (p < 0.25) {
        // Hero -> Process Steps (0 to 0.25)
        const t = p / 0.25;
        targetX = MathUtils.lerp(c.heroPos[0], c.stepsPos[0], t);
        targetY = MathUtils.lerp(c.heroPos[1], c.stepsPos[1], t);
        targetZ = MathUtils.lerp(c.heroPos[2], c.stepsPos[2], t);
      } else if (p < 0.55) {
        // Process Steps -> Features Bento (0.25 to 0.55)
        const t = (p - 0.25) / 0.3;
        targetX = MathUtils.lerp(c.stepsPos[0], c.featuresPos[0], t);
        targetY = MathUtils.lerp(c.stepsPos[1], c.featuresPos[1], t);
        targetZ = MathUtils.lerp(c.stepsPos[2], c.featuresPos[2], t);
      } else if (p < 0.8) {
        // Features Bento -> Pricing (0.55 to 0.8)
        const t = (p - 0.55) / 0.25;
        targetX = MathUtils.lerp(c.featuresPos[0], c.pricingPos[0], t);
        targetY = MathUtils.lerp(c.featuresPos[1], c.pricingPos[1], t);
        targetZ = MathUtils.lerp(c.featuresPos[2], c.pricingPos[2], t);
      } else {
        // Pricing -> Final CTA & Footer (0.8 to 1.0)
        const t = (p - 0.8) / 0.2;
        targetX = MathUtils.lerp(c.pricingPos[0], c.footerPos[0], t);
        targetY = MathUtils.lerp(c.pricingPos[1], c.footerPos[1], t);
        targetZ = MathUtils.lerp(c.pricingPos[2], c.footerPos[2], t);
      }

      // Smooth position dampening
      mesh.position.x = MathUtils.damp(mesh.position.x, targetX, 2.5, dt);
      mesh.position.y = MathUtils.damp(mesh.position.y, targetY, 2.5, dt);
      mesh.position.z = MathUtils.damp(mesh.position.z, targetZ, 2.5, dt);

      // Continuous autonomous tumble + scroll velocity spin
      const rotSpeed = 0.4 + Math.abs(scrollState.velocity) * 0.8;
      mesh.rotation.x += dt * rotSpeed * 0.7;
      mesh.rotation.y += dt * rotSpeed;
      mesh.rotation.z += dt * rotSpeed * 0.5;

      // Color transition based on progress
      const mat = mesh.material as any;
      if (mat && mat.color) {
        const startColor = new Color(p < 0.5 ? c.colorHero : c.colorMid);
        const endColor = new Color(p < 0.5 ? c.colorMid : c.colorEnd);
        const factor = p < 0.5 ? p * 2 : (p - 0.5) * 2;
        mat.color.lerpColors(startColor, endColor, factor);
      }
    });
  });

  return (
    <group ref={groupRef}>
      {/* Dynamic 3D lighting for the crystal collection */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 15, 10]} intensity={1.5} color="#fff1f2" />
      <pointLight position={[-8, -5, -5]} intensity={2.0} color="#f43f5e" distance={25} />
      <pointLight position={[8, 5, -4]} intensity={2.2} color="#fb7185" distance={25} />
      <pointLight position={[0, -10, -8]} intensity={1.5} color="#c084fc" distance={20} />

      {crystals.map((c, i) => (
        <Float
          key={c.id}
          speed={c.speed}
          rotationIntensity={1.2}
          floatIntensity={1.5}
          floatingRange={[-0.2, 0.2]}
        >
          <mesh
            ref={(el) => {
              crystalRefs.current[i] = el;
            }}
            position={c.heroPos}
            scale={c.scale}
          >
            {c.type === "heart-gem" && (
              <primitive object={heartGeom} attach="geometry" />
            )}
            {c.type === "diamond" && (
              <octahedronGeometry args={[0.9, 0]} />
            )}
            {c.type === "torus-band" && (
              <torusGeometry args={[0.9, 0.08, 16, 64]} />
            )}
            {c.type === "octa" && (
              <primitive object={heartGeom} attach="geometry" />
            )}

            <MeshDistortMaterial
              color={c.colorHero}
              roughness={0.12}
              metalness={0.15}
              clearcoat={1.0}
              clearcoatRoughness={0.1}
              distort={c.distort}
              speed={2}
              transparent
              opacity={0.88}
              wireframe={false}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}
