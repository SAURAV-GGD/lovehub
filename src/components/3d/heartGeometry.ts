import * as THREE from "three";

let cachedHeartGeometry: THREE.ExtrudeGeometry | null = null;

/**
 * Returns a shared, memoized 3D ExtrudeGeometry of a smooth, romantic heart.
 * Geometry is centered at (0, 0, 0) with smooth rounded bevels.
 */
export function getSharedHeartGeometry(): THREE.ExtrudeGeometry {
  if (cachedHeartGeometry) {
    return cachedHeartGeometry;
  }

  const shape = new THREE.Shape();
  // Symmetrical heart curve pointing downward at (0, -1) with top lobes at (±0.6, 1.1)
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

  cachedHeartGeometry = geom;
  return geom;
}
