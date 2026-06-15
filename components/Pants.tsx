"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scrollState, damp } from "@/lib/scrollStore";

/**
 * Piecewise-linear radius profile of a single trouser leg.
 * `ny` runs 0 (ankle hem) → 1 (waist). The shape is deliberately *heavy and
 * baggy*: it pools wide around the calf/knee then cinches hard at the ankle,
 * exactly the silhouette BLOC is built around.
 */
const LEG_PROFILE: ReadonlyArray<readonly [number, number]> = [
  [0.0, 0.2], // hem flare of the cuff
  [0.05, 0.15], // tightest cinch at the ankle
  [0.14, 0.3],
  [0.3, 0.62], // fabric starts pooling up the shin
  [0.45, 0.74], // widest, heaviest drape
  [0.62, 0.66],
  [0.85, 0.6],
  [1.0, 0.58], // meets the waistband
];

function profileRadius(ny: number): number {
  const p = THREE.MathUtils.clamp(ny, 0, 1);
  for (let i = 0; i < LEG_PROFILE.length - 1; i++) {
    const [y0, r0] = LEG_PROFILE[i];
    const [y1, r1] = LEG_PROFILE[i + 1];
    if (p >= y0 && p <= y1) {
      const t = (p - y0) / (y1 - y0 || 1);
      return THREE.MathUtils.lerp(r0, r1, t);
    }
  }
  return LEG_PROFILE[LEG_PROFILE.length - 1][1];
}

/**
 * Builds one trouser leg by taking a high-resolution cylinder and rewriting
 * every side vertex onto the baggy profile above, then layering trig-based
 * "wrinkle" noise so the fabric reads as folded, weighty denim.
 */
function buildLeg(): THREE.BufferGeometry {
  const height = 2.8;
  const geo = new THREE.CylinderGeometry(0.58, 0.2, height, 80, 90, false);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const originalRadius = Math.hypot(v.x, v.z);
    // Leave the flat cap centers alone so the leg stays closed.
    if (originalRadius < 0.001) continue;

    const ny = (v.y + height / 2) / height;
    const angle = Math.atan2(v.z, v.x);

    // Heavier folds where the fabric pools (mid-low leg).
    const poolFactor = Math.exp(-Math.pow((ny - 0.33) / 0.22, 2));
    const amp = 0.025 + 0.06 * poolFactor;
    const folds =
      amp * (Math.cos(angle * 9) * 0.6 + Math.cos(angle * 17 + ny * 6) * 0.4) +
      0.018 * Math.sin(ny * Math.PI * 11 + angle * 3);

    const radius = Math.max(0.04, profileRadius(ny) + folds);
    v.x = Math.cos(angle) * radius;
    v.z = Math.sin(angle) * radius;
    // A touch of vertical ripple breaks the perfect ring symmetry.
    v.y += 0.012 * Math.sin(angle * 6 + ny * 22);
    pos.setXYZ(i, v.x, v.y, v.z);
  }

  geo.computeVertexNormals();
  return geo;
}

/** A short, wide waistband that ties the two legs together at the hips. */
function buildWaist(): THREE.BufferGeometry {
  const height = 0.7;
  const geo = new THREE.CylinderGeometry(0.66, 0.7, height, 72, 24, false);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const originalRadius = Math.hypot(v.x, v.z);
    if (originalRadius < 0.001) continue;
    const ny = (v.y + height / 2) / height;
    const angle = Math.atan2(v.z, v.x);
    const folds = 0.03 * Math.cos(angle * 14) + 0.015 * Math.cos(angle * 26);
    const radius = originalRadius + folds;
    v.x = Math.cos(angle) * radius;
    v.z = Math.sin(angle) * radius;
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}

export default function Pants() {
  const group = useRef<THREE.Group>(null);
  const legGeo = useMemo(buildLeg, []);
  const waistGeo = useMemo(buildWaist, []);

  // One shared deep-blue fabric material. Sheen + low metalness sells "cloth"
  // rather than "plastic"; the slightly high roughness keeps it matte denim.
  const fabric = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#13245a"),
        roughness: 0.62,
        metalness: 0.05,
        sheen: 1,
        sheenRoughness: 0.75,
        sheenColor: new THREE.Color("#2f54c7"),
        clearcoat: 0.06,
        envMapIntensity: 0.7,
      }),
    [],
  );

  useFrame((state, delta) => {
    if (!group.current) return;
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const p = scrollState.progress;

    // Continuous slow spin, accelerated by scroll (≈2.2 turns top→bottom),
    // plus a little pointer-driven parallax tilt.
    const targetRotY = t * 0.12 + p * Math.PI * 2.2 + scrollState.pointerX * 0.25;
    const targetRotX =
      THREE.MathUtils.lerp(0.12, -0.18, p) + scrollState.pointerY * 0.15;

    // Sweep across the stage (right → left → back to centre) so copy can
    // breathe on the opposite side, and float gently the whole time.
    const targetPosX = Math.sin(p * Math.PI * 2) * 1.6;
    const targetPosY = -0.05 + Math.sin(t * 0.8) * 0.05 + p * 0.25;

    // Grow on approach, then recede into the background for the final CTA.
    const targetScale =
      THREE.MathUtils.lerp(1.0, 0.72, p) + Math.sin(p * Math.PI) * 0.4;

    group.current.rotation.y = damp(group.current.rotation.y, targetRotY, 4, dt);
    group.current.rotation.x = damp(group.current.rotation.x, targetRotX, 4, dt);
    group.current.position.x = damp(group.current.position.x, targetPosX, 3, dt);
    group.current.position.y = damp(group.current.position.y, targetPosY, 3, dt);
    const s = damp(group.current.scale.x, targetScale, 3, dt);
    group.current.scale.setScalar(s);
  });

  return (
    <group ref={group} dispose={null}>
      {/* waistband */}
      <mesh
        geometry={waistGeo}
        material={fabric}
        position={[0, 1.2, 0]}
        scale={[1.55, 1, 1.15]}
        castShadow
        receiveShadow
      />
      {/* left leg */}
      <mesh
        geometry={legGeo}
        material={fabric}
        position={[-0.36, 0, 0]}
        rotation={[0, 0, 0.03]}
        castShadow
        receiveShadow
      />
      {/* right leg */}
      <mesh
        geometry={legGeo}
        material={fabric}
        position={[0.36, 0, 0]}
        rotation={[0, 0, -0.03]}
        castShadow
        receiveShadow
      />
    </group>
  );
}
