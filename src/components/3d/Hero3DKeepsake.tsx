"use client";

import { useRef, useState, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Sparkles, MeshDistortMaterial } from "@react-three/drei";
import { Mesh, PointLight, Group, MathUtils, MeshStandardMaterial } from "three";
import { Heart as HeartIcon, Eye } from "lucide-react";
import { getSculptedHeartGeometry } from "./heartGeometry";

function RingEnclosedProposalHeart() {
  const heartMeshRef = useRef<Mesh>(null);
  const ringRef = useRef<Group>(null);
  const innerLightRef = useRef<PointLight>(null);
  const heartMatRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);

  // High-precision sculpted 3D volumetric heart
  const sculptedHeartGeom = useMemo(() => getSculptedHeartGeometry(56), []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const speed = hovered ? 2.4 : 1.5;
    const cycle = (t * speed) % 1;

    // Organic anatomical lub-dub heartbeat pulse
    let beat = 0;
    if (cycle < 0.13) {
      // First beat: Lub (stronger)
      beat = Math.sin((cycle / 0.13) * Math.PI) * (hovered ? 0.16 : 0.12);
    } else if (cycle > 0.17 && cycle < 0.3) {
      // Second beat: Dub (gentle echo)
      beat = Math.sin(((cycle - 0.17) / 0.13) * Math.PI) * (hovered ? 0.1 : 0.07);
    }

    // Heart scale pulse inside the ring
    if (heartMeshRef.current) {
      const baseScale = hovered ? 0.96 : 0.9;
      const targetScale = baseScale * (1 + beat);
      heartMeshRef.current.scale.set(targetScale, targetScale, targetScale);

      // Heart gentle romantic breathing rotation
      heartMeshRef.current.rotation.y += dt * (hovered ? 0.8 : 0.35);
      heartMeshRef.current.rotation.x = Math.sin(t * 0.8) * 0.08;
    }

    // Synchronized internal glow brightness with the heartbeat
    if (innerLightRef.current) {
      innerLightRef.current.intensity = MathUtils.lerp(
        hovered ? 3.0 : 2.2,
        hovered ? 7.5 : 5.8,
        beat / 0.12
      );
    }

    // Material emissive glow pulse
    if (heartMatRef.current) {
      heartMatRef.current.emissiveIntensity = MathUtils.lerp(
        0.28,
        hovered ? 0.95 : 0.75,
        beat / 0.12
      );
    }

    // Ring gentle floating sway (stays framing the heart)
    if (ringRef.current) {
      ringRef.current.rotation.y = Math.sin(t * 0.5) * 0.14;
      ringRef.current.rotation.z = Math.cos(t * 0.4) * 0.08;
    }
  });

  return (
    <group>
      {/* Dynamic Internal Volumetric Heart Glow */}
      <pointLight
        ref={innerLightRef}
        position={[0, 0, 0.1]}
        color="#ff2a6d"
        distance={5}
        decay={2}
        intensity={2.5}
      />

      {/* Floating Assembly: Heart Nestled Inside The Proposal Ring */}
      <Float speed={2.0} rotationIntensity={0.4} floatIntensity={0.6}>
        {/* 1. SCULPTED 3D VOLUMETRIC HEART (Nestled inside the ring aperture) */}
        <mesh
          ref={heartMeshRef}
          geometry={sculptedHeartGeom}
          position={[0, 0, 0]}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <MeshDistortMaterial
            ref={heartMatRef}
            color={hovered ? "#ff1744" : "#f43f5e"}
            emissive="#be123c"
            emissiveIntensity={0.3}
            roughness={0.12}
            metalness={0.2}
            clearcoat={1.0}
            clearcoatRoughness={0.05}
            distort={hovered ? 0.08 : 0.03}
            speed={2}
            transparent
            opacity={0.96}
          />
        </mesh>

        {/* 2. LUXURY 18K/24K PROPOSAL RING (Encircles & frames the heart) */}
        <group ref={ringRef} rotation={[Math.PI / 14, 0, 0]}>
          {/* Main Gold Eternity Band */}
          <mesh>
            <torusGeometry args={[1.62, 0.075, 24, 80]} />
            <meshStandardMaterial
              color="#fbbf24"
              metalness={0.94}
              roughness={0.12}
              emissive="#b45309"
              emissiveIntensity={0.22}
            />
          </mesh>

          {/* Solitaire Diamond Crown Setting at the apex of the ring */}
          <group position={[0, 1.62, 0]}>
            {/* Gold Prong Base */}
            <mesh position={[0, 0.06, 0]}>
              <cylinderGeometry args={[0.08, 0.12, 0.12, 16]} />
              <meshStandardMaterial
                color="#facc15"
                metalness={0.92}
                roughness={0.14}
              />
            </mesh>

            {/* Solitaire Diamond Gem */}
            <mesh position={[0, 0.15, 0]} rotation={[0, Math.PI / 4, 0]}>
              <octahedronGeometry args={[0.16, 0]} />
              <meshStandardMaterial
                color="#ffffff"
                metalness={0.08}
                roughness={0.04}
                emissive="#e0f2fe"
                emissiveIntensity={0.4}
              />
            </mesh>
          </group>
        </group>
      </Float>

      {/* Sparkling Stardust Orbiting The Ring */}
      <Sparkles
        count={hovered ? 40 : 25}
        scale={3.6}
        size={hovered ? 3.4 : 2.5}
        speed={hovered ? 1.4 : 0.8}
        opacity={0.8}
        color="#f472b6"
      />
      <Sparkles
        count={20}
        scale={3.2}
        size={2.8}
        speed={0.6}
        opacity={0.7}
        color="#fef08a"
      />
    </group>
  );
}

export function Hero3DKeepsake() {
  return (
    <div className="relative w-full max-w-[330px] sm:max-w-[370px] h-[240px] sm:h-[265px] mx-auto my-3 sm:my-4 group">
      {/* Soft Ethereal Radial Glow Aura */}
      <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/25 via-pink-500/15 to-amber-400/20 rounded-3xl blur-2xl transform group-hover:scale-105 transition-transform duration-500 pointer-events-none" />

      {/* Frosted Glass Frame (Apple iOS Design Language) */}
      <div className="relative w-full h-full rounded-3xl border border-white/20 bg-slate-950/35 backdrop-blur-2xl overflow-hidden shadow-2xl shadow-rose-950/40 flex items-center justify-center">
        {/* Top iOS-style Status Pill */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/15 backdrop-blur-xl text-[11px] font-medium text-white/95 shadow-sm pointer-events-none">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
          </span>
          <span className="tracking-tight">Proposal Ring &amp; Heart</span>
        </div>

        {/* Top Right Heartbeat Pulse Indicator */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-400/25 backdrop-blur-xl text-[10px] font-mono text-rose-200/90 pointer-events-none">
          <HeartIcon className="w-3 h-3 text-rose-400 fill-rose-400 animate-pulse" />
          <span>Alive</span>
        </div>

        {/* Bottom Interaction Hint */}
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 border border-white/15 backdrop-blur-xl text-[10px] font-medium text-white/70 pointer-events-none">
          <Eye className="w-3 h-3 text-rose-300" />
          <span>360° Drag to View</span>
        </div>

        <Suspense
          fallback={
            <div className="w-full h-full flex flex-col items-center justify-center text-xs text-rose-300 space-y-2">
              <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading 3D Keepsake...</span>
            </div>
          }
        >
          <Canvas
            dpr={[1, 1.5]}
            camera={{ position: [0, 0, 4.4], fov: 48 }}
            gl={{ antialias: true, alpha: true, powerPreference: "default" }}
            onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
          >
            {/* Cinematic 3D Lighting Setup */}
            <ambientLight intensity={1.2} />
            <directionalLight position={[5, 8, 4]} intensity={2.2} color="#fff7ed" />
            <pointLight position={[-4, -3, -2]} intensity={2.4} color="#e11d48" distance={10} />
            <pointLight position={[4, 3, 2]} intensity={2.5} color="#fbbf24" distance={10} />
            <pointLight position={[0, 0, -2.5]} intensity={2.0} color="#fda4af" distance={8} />

            <RingEnclosedProposalHeart />

            {/* Orbit Controls (zoom disabled to protect vertical page scroll) */}
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={0.7}
              maxPolarAngle={Math.PI / 1.6}
              minPolarAngle={Math.PI / 2.6}
            />
          </Canvas>
        </Suspense>
      </div>
    </div>
  );
}
