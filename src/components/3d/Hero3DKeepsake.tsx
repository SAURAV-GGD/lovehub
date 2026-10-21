"use client";

import { useRef, useState, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Sparkles, MeshDistortMaterial } from "@react-three/drei";
import { Mesh, Group } from "three";
import { Heart as HeartIcon, Sparkles as SparklesIcon, Eye } from "lucide-react";
import { getSharedHeartGeometry } from "./heartGeometry";

function FloatingKeepsakeHeart() {
  const heartMeshRef = useRef<Mesh>(null);
  const ring1Ref = useRef<Mesh>(null);
  const ring2Ref = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const heartGeom = useMemo(() => getSharedHeartGeometry(), []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;

    // Heart rotation & realistic anatomical heartbeat pulse (lub-dub)
    if (heartMeshRef.current) {
      heartMeshRef.current.rotation.y += dt * (hovered ? 1.3 : 0.55);
      heartMeshRef.current.rotation.x = Math.sin(t * 0.9) * 0.12;

      const speed = hovered ? 2.5 : 1.6;
      const cycle = (t * speed) % 1;
      let pulse = 1;
      if (cycle < 0.14) {
        pulse = 1 + Math.sin((cycle / 0.14) * Math.PI) * (hovered ? 0.2 : 0.13);
      } else if (cycle > 0.18 && cycle < 0.32) {
        pulse = 1 + Math.sin(((cycle - 0.18) / 0.14) * Math.PI) * (hovered ? 0.12 : 0.08);
      }

      const baseScale = hovered ? 1.25 : 1.15;
      heartMeshRef.current.scale.set(
        baseScale * pulse,
        baseScale * pulse,
        baseScale * pulse
      );
    }

    // Intertwined eternal wedding bands rotation
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += dt * (hovered ? 0.8 : 0.35);
      ring1Ref.current.rotation.x = Math.cos(t * 0.7) * 0.2;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= dt * (hovered ? 0.7 : 0.3);
      ring2Ref.current.rotation.y = Math.sin(t * 0.6) * 0.25;
    }
  });

  return (
    <group>
      {/* Floating 3D Love Heart */}
      <Float speed={2.2} rotationIntensity={0.8} floatIntensity={1.2}>
        <mesh
          ref={heartMeshRef}
          geometry={heartGeom}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <MeshDistortMaterial
            color={hovered ? "#ff1744" : "#f43f5e"}
            roughness={0.15}
            metalness={0.25}
            clearcoat={1.0}
            clearcoatRoughness={0.08}
            distort={hovered ? 0.22 : 0.09}
            speed={2.2}
            transparent
            opacity={0.95}
          />
        </mesh>
      </Float>

      {/* Ring 1 - Eternal Gold Proposal Band */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 3, 0.3, 0]}>
        <torusGeometry args={[1.5, 0.045, 16, 64]} />
        <meshStandardMaterial
          color="#fbbf24"
          metalness={0.92}
          roughness={0.14}
          emissive="#b45309"
          emissiveIntensity={0.22}
        />
      </mesh>

      {/* Ring 2 - Interlocking Promise Band */}
      <mesh ref={ring2Ref} rotation={[-Math.PI / 3.2, -0.35, 0]}>
        <torusGeometry args={[1.45, 0.04, 16, 64]} />
        <meshStandardMaterial
          color="#fde047"
          metalness={0.88}
          roughness={0.16}
          emissive="#ca8a04"
          emissiveIntensity={0.18}
        />
      </mesh>

      {/* Romantic Pink & Gold Stardust Particles */}
      <Sparkles
        count={hovered ? 45 : 28}
        scale={3.6}
        size={hovered ? 3.5 : 2.5}
        speed={hovered ? 1.2 : 0.7}
        opacity={0.75}
        color="#f472b6"
      />
      <Sparkles
        count={18}
        scale={3.2}
        size={2.8}
        speed={0.6}
        opacity={0.6}
        color="#fde047"
      />
    </group>
  );
}

export function Hero3DKeepsake() {
  return (
    <div className="relative w-full max-w-[310px] sm:max-w-[350px] h-[220px] sm:h-[240px] mx-auto my-3 group">
      {/* Ethereal Romantic Aura Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/25 via-pink-500/15 to-amber-400/20 rounded-3xl blur-2xl transform group-hover:scale-105 transition-transform duration-500 pointer-events-none" />

      {/* Romantic Glass Frame */}
      <div className="relative w-full h-full rounded-3xl border border-rose-300/30 bg-gradient-to-b from-rose-950/20 via-black/30 to-pink-950/20 backdrop-blur-md overflow-hidden shadow-2xl shadow-rose-950/30 flex items-center justify-center">
        {/* Helper Badge */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-300/30 text-[10px] font-medium text-rose-100 backdrop-blur-md shadow-sm pointer-events-none">
          <HeartIcon className="w-3 h-3 text-rose-300 fill-rose-300/50" />
          <span>3D Proposal Heart</span>
        </div>

        {/* Rotation Hint */}
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 text-[10px] font-mono text-rose-200/80 bg-black/40 px-2 py-0.5 rounded-full border border-white/10 pointer-events-none">
          <Eye className="w-3 h-3 text-rose-300" />
          <span>Drag to Rotate</span>
        </div>

        <Suspense
          fallback={
            <div className="w-full h-full flex flex-col items-center justify-center text-xs text-rose-300 space-y-2">
              <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading 3D Heart...</span>
            </div>
          }
        >
          <Canvas
            dpr={[1, 1.5]}
            camera={{ position: [0, 0, 4.2], fov: 46 }}
            gl={{ antialias: true, alpha: true, powerPreference: "default" }}
            onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
          >
            <ambientLight intensity={1.3} />
            <directionalLight position={[5, 10, 5]} intensity={2.2} color="#fff1f2" />
            <pointLight position={[-4, -3, -2]} intensity={2.5} color="#e11d48" distance={10} />
            <pointLight position={[4, 3, 2]} intensity={2.5} color="#fbbf24" distance={10} />

            <FloatingKeepsakeHeart />

            {/* Orbit controls with zoom disabled so page scroll is never blocked */}
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={0.8}
              maxPolarAngle={Math.PI / 1.5}
              minPolarAngle={Math.PI / 3}
            />
          </Canvas>
        </Suspense>
      </div>
    </div>
  );
}
