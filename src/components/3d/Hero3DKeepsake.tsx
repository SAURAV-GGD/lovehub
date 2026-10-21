"use client";

import { useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Sparkles, MeshDistortMaterial } from "@react-three/drei";
import { Mesh, Group, MathUtils } from "three";
import { Sparkles as SparklesIcon, Eye } from "lucide-react";

function FloatingKeepsakeHeart() {
  const meshRef = useRef<Mesh>(null);
  const ringRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state, dt) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += dt * (hovered ? 1.4 : 0.6);
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.8) * 0.15;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += dt * (hovered ? 0.9 : 0.35);
      ringRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.6) * 0.2;
    }
  });

  return (
    <group>
      {/* Central 3D Faceted Romantic Love Crystal */}
      <Float speed={2.5} rotationIntensity={1.2} floatIntensity={1.8}>
        <mesh
          ref={meshRef}
          scale={hovered ? 1.45 : 1.3}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <icosahedronGeometry args={[1.2, 0]} />
          <MeshDistortMaterial
            color={hovered ? "#f43f5e" : "#fb7185"}
            roughness={0.12}
            metalness={0.2}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
            distort={hovered ? 0.45 : 0.25}
            speed={3}
            transparent
            opacity={0.92}
          />
        </mesh>
      </Float>

      {/* Orbiting 3D Diamond Wedding Band / Infinity Ring */}
      <mesh ref={ringRef} scale={1.8} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[1.1, 0.05, 16, 64]} />
        <meshStandardMaterial
          color="#fbbf24"
          metalness={0.85}
          roughness={0.18}
          emissive="#f59e0b"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Radiant particle cloud inside the keepsake */}
      <Sparkles count={45} scale={4} size={3.5} speed={0.8} opacity={0.7} color="#f472b6" />
    </group>
  );
}

export function Hero3DKeepsake() {
  const [interactiveNotice, setInteractiveNotice] = useState(true);

  return (
    <div className="relative w-full max-w-xs sm:max-w-sm aspect-square mx-auto my-4 group">
      {/* 3D Glass pedestal glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/20 via-pink-500/10 to-amber-500/15 rounded-3xl blur-2xl transform group-hover:scale-105 transition-transform duration-500 pointer-events-none" />

      {/* 3D Canvas Box */}
      <div className="relative w-full h-full rounded-3xl border border-white/20 bg-slate-950/40 backdrop-blur-xl overflow-hidden shadow-2xl flex items-center justify-center">
        {/* Helper Badge */}
        {interactiveNotice && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 border border-white/20 text-[10px] font-mono text-white/90 backdrop-blur-md shadow-sm pointer-events-none">
            <SparklesIcon className="w-3 h-3 text-rose-400" />
            <span>Interactive 3D Keepsake</span>
          </div>
        )}

        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 text-[10px] font-mono text-white/60 bg-black/40 px-2 py-0.5 rounded-md pointer-events-none">
          <Eye className="w-3 h-3" />
          <span>Drag to Rotate</span>
        </div>

        <Suspense
          fallback={
            <div className="w-full h-full flex flex-col items-center justify-center text-xs text-rose-300 space-y-2">
              <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
              <span>Initializing 3D Jewel...</span>
            </div>
          }
        >
          <Canvas
            dpr={[1, 1.5]}
            camera={{ position: [0, 0, 4.5], fov: 50 }}
            gl={{ antialias: true, alpha: true, powerPreference: "default" }}
            onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
          >
            <ambientLight intensity={1.2} />
            <directionalLight position={[5, 10, 5]} intensity={2.0} color="#fff1f2" />
            <pointLight position={[-4, -3, -2]} intensity={2.5} color="#e11d48" distance={10} />
            <pointLight position={[4, 3, 2]} intensity={2.5} color="#fbbf24" distance={10} />

            <FloatingKeepsakeHeart />

            {/* Orbit controls with zoom disabled to never intercept vertical scroll */}
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
