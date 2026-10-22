import * as THREE from "three";

let cachedSculptedHeartGeometry: THREE.BufferGeometry | null = null;
let cachedExtrudeHeartGeometry: THREE.ExtrudeGeometry | null = null;

/**
 * Creates an exquisite, organic 3D volumetric heart geometry.
 * Modeled with high-precision closed manifold topology, deep romantic cleft,
 * bulbous rounded lobes, full Z-depth curvature, and an elegant tapering tip.
 */
export function getSculptedHeartGeometry(subdivisions = 54): THREE.BufferGeometry {
  if (cachedSculptedHeartGeometry) {
    return cachedSculptedHeartGeometry;
  }

  const geom = new THREE.SphereGeometry(1, subdivisions, subdivisions);
  const pos = geom.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    let x = v.x;
    let y = v.y;
    let z = v.z;

    // Sculpting the sphere into a perfect 3D heart
    if (y < 0) {
      // Bottom tapering towards an elegant tip
      const b = -y;
      x *= (1.0 - 0.48 * Math.pow(b, 1.25));
      z *= (1.0 - 0.58 * Math.pow(b, 1.25));
      y *= 1.15;
    } else {
      // Top lobes: deep sensual cleft in the center
      const cleftDepth = 0.42;
      const cleftWidth = 3.4;
      const cleft = Math.exp(-Math.pow(x * cleftWidth, 2)) * cleftDepth * y;
      y -= cleft;

      // Voluptuous upward swelling of the two lobes
      const lobeLift = 0.24 * Math.sin(Math.min(1, Math.abs(x) * 1.8) * Math.PI);
      y += lobeLift;
      x *= (1.0 + 0.16 * y);
    }

    // Organic Z thickness (fullest in the upper chest, tapering toward perimeter)
    const r = Math.sqrt(x * x + y * y);
    z *= (1.08 - 0.28 * Math.min(1.2, r));

    // Unit proportion scaling
    pos.setXYZ(i, x * 1.05, y * 1.05, z * 0.85);
  }

  geom.computeVertexNormals();
  geom.center();
  geom.computeBoundingBox();

  cachedSculptedHeartGeometry = geom;
  return geom;
}

/**
 * Returns a shared 3D extruded bezier heart geometry (used for background floating crystals).
 */
export function getSharedHeartGeometry(): THREE.ExtrudeGeometry {
  if (cachedExtrudeHeartGeometry) {
    return cachedExtrudeHeartGeometry;
  }

  const shape = new THREE.Shape();
  shape.moveTo(0, -1);
  shape.bezierCurveTo(-0.15, -0.65, -1.05, 0.1, -1.05, 0.65);
  shape.bezierCurveTo(-1.05, 1.25, -0.15, 1.35, 0, 0.7);
  shape.bezierCurveTo(0.15, 1.35, 1.05, 1.25, 1.05, 0.65);
  shape.bezierCurveTo(1.05, 0.1, 0.15, -0.65, 0, -1);

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: 0.36,
    bevelEnabled: true,
    bevelSegments: 5,
    steps: 1,
    curveSegments: 16,
    bevelSize: 0.14,
    bevelThickness: 0.14,
  };

  const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geom.center();
  geom.computeVertexNormals();

  cachedExtrudeHeartGeometry = geom;
  return geom;
}
