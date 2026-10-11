"use client";

import { MathUtils } from "three";
import { useFrame } from "@react-three/fiber";
import { scrollState } from "@/lib/immersive/scrollState";

export function CameraRig() {
  useFrame(({ camera }, dt) => {
    camera.position.x = MathUtils.damp(camera.position.x, scrollState.pointer.x * 0.5, 4, dt);
    camera.position.y = MathUtils.damp(camera.position.y, scrollState.pointer.y * 0.3, 4, dt);
    camera.lookAt(0, 0, -10);
  });
  return null;
}
