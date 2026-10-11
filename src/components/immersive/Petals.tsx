"use client";

import { useMemo, useRef } from "react";
import {
  BufferGeometry,
  Float32BufferAttribute,
  ShaderMaterial,
  NormalBlending,
  Color,
} from "three";
import { useFrame } from "@react-three/fiber";
import { scrollState } from "@/lib/immersive/scrollState";

interface PetalsProps {
  count?: number;
}

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uOpacity;

  attribute vec3 aRandom;
  attribute float aScale;

  varying float vAlpha;
  varying vec2 vCoordRot;

  void main() {
    vec3 pos = position;

    // Continuous downward drift with wrap-around
    float fallSpeed = 0.9 + aRandom.y * 0.7;
    float yRange = 22.0;
    float yOffset = mod(pos.y - uTime * fallSpeed, yRange);
    pos.y = yOffset - (yRange * 0.5);

    // Natural sinusoidal sway
    pos.x += sin(uTime * 1.4 + aRandom.x * 6.28) * (1.2 + aRandom.x * 0.8);
    pos.z += cos(uTime * 1.1 + aRandom.z * 6.28) * (0.8 + aRandom.z * 0.5);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Attenuated point size based on depth
    gl_PointSize = (uSize * aScale) / max(-mvPosition.z, 0.5);

    // Subtle distance fade
    float distFade = smoothstep(30.0, 5.0, -mvPosition.z);
    vAlpha = uOpacity * distFade * (0.75 + aRandom.x * 0.25);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;

  varying float vAlpha;

  void main() {
    // Center point coordinates [-0.5, 0.5]
    vec2 p = gl_PointCoord - vec2(0.5);

    // Organic petal oval shape with slight elongation
    p.y *= 1.25;
    float dist = length(p);

    if (dist > 0.48) {
      discard;
    }

    // Soft feathered edge
    float edge = smoothstep(0.48, 0.25, dist);

    // Subtle two-tone petal gradation
    vec3 col = mix(uColorA, uColorB, gl_PointCoord.y);

    gl_FragColor = vec4(col, vAlpha * edge);
  }
`;

export function Petals({ count = 80 }: PetalsProps) {
  const materialRef = useRef<ShaderMaterial>(null);
  const phaseRef = useRef<number>(0);

  const { geometry, uniforms } = useMemo(() => {
    const geo = new BufferGeometry();
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count * 3);
    const scales = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Spread across camera view volume
      positions[i3 + 0] = (Math.random() - 0.5) * 24; // x
      positions[i3 + 1] = (Math.random() - 0.5) * 22; // y
      positions[i3 + 2] = -Math.random() * 26 - 1.5;  // z (-1.5 to -27.5)

      randoms[i3 + 0] = Math.random();
      randoms[i3 + 1] = Math.random();
      randoms[i3 + 2] = Math.random();

      scales[i] = 0.65 + Math.random() * 0.65;
    }

    geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geo.setAttribute("aRandom", new Float32BufferAttribute(randoms, 3));
    geo.setAttribute("aScale", new Float32BufferAttribute(scales, 1));

    const uni = {
      uTime: { value: 0 },
      uSpeed: { value: 1 },
      uOpacity: { value: 1.0 },
      uSize: { value: 200.0 }, // daytime sizing per v2 spec
      uColorA: { value: new Color("#FF6F9C") }, // Rich cherry petal pink
      uColorB: { value: new Color("#FF8FB3") }, // Soft highlight pink
    };

    return { geometry: geo, uniforms: uni };
  }, [count]);

  useFrame((_, dt) => {
    if (!materialRef.current) return;

    // React to scroll velocity without jumping phase
    const velSpeed = 1 + Math.min(Math.abs(scrollState.velocity) * 0.15, 2.5);
    phaseRef.current += dt * velSpeed;

    materialRef.current.uniforms.uTime.value = phaseRef.current;
    materialRef.current.uniforms.uSpeed.value = velSpeed;
    materialRef.current.uniforms.uOpacity.value = 1.0;
  });

  return (
    <points geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
        blending={NormalBlending}
      />
    </points>
  );
}
