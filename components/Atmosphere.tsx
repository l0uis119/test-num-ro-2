"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import { scrollState } from "@/lib/scrollStore";

type Stop = readonly [number, THREE.Color];

/** Samples a colour gradient defined by [progress, color] stops. */
function sampleColor(stops: Stop[], p: number, out: THREE.Color) {
  for (let i = 0; i < stops.length - 1; i++) {
    const [p0, c0] = stops[i];
    const [p1, c1] = stops[i + 1];
    if (p >= p0 && p <= p1) {
      return out.copy(c0).lerp(c1, (p - p0) / (p1 - p0 || 1));
    }
  }
  return out.copy(stops[stops.length - 1][1]);
}

function sampleNum(stops: ReadonlyArray<readonly [number, number]>, p: number) {
  for (let i = 0; i < stops.length - 1; i++) {
    const [p0, v0] = stops[i];
    const [p1, v1] = stops[i + 1];
    if (p >= p0 && p <= p1)
      return THREE.MathUtils.lerp(v0, v1, (p - p0) / (p1 - p0 || 1));
  }
  return stops[stops.length - 1][1];
}

const SKY: Stop[] = [
  [0.0, new THREE.Color("#243152")], // dawn
  [0.35, new THREE.Color("#48639f")], // clear day
  [0.65, new THREE.Color("#8a5778")], // dusk mauve
  [1.0, new THREE.Color("#080d20")], // night
];
const SUN: Stop[] = [
  [0.0, new THREE.Color("#ffd9a0")],
  [0.35, new THREE.Color("#ffffff")],
  [0.65, new THREE.Color("#ff9d5c")],
  [1.0, new THREE.Color("#8097ea")],
];
const SUN_INT = [
  [0.0, 1.7],
  [0.35, 2.6],
  [0.65, 2.1],
  [1.0, 0.7],
] as const;

/** Lightweight snow that drifts down and recycles around the camera. */
function Snow({ count = 700 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = Math.random() * 24 - 4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30 - 5;
      speeds[i] = 0.6 + Math.random() * 1.2;
    }
    return { positions, speeds };
  }, [count]);

  useFrame((state, delta) => {
    const pts = ref.current;
    if (!pts) return;
    const dt = Math.min(delta, 0.05);
    const arr = pts.geometry.attributes.position as THREE.BufferAttribute;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      let y = arr.getY(i) - speeds[i] * dt;
      let x = arr.getX(i) + Math.sin(t + i) * 0.004;
      if (y < -6) y = 20;
      arr.setY(i, y);
      arr.setX(i, x);
    }
    arr.needsUpdate = true;
    // Snow follows the camera so it's always in view.
    pts.position.x = state.camera.position.x;
    pts.position.z = state.camera.position.z - 4;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        color="#eaf0ff"
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export default function Atmosphere() {
  const { scene } = useThree();
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);

  const bg = useMemo(() => new THREE.Color("#243152"), []);
  const fog = useMemo(() => new THREE.Fog("#243152", 22, 150), []);
  const sunColor = useMemo(() => new THREE.Color("#ffd9a0"), []);

  useFrame(() => {
    const p = scrollState.progress;
    sampleColor(SKY, p, bg);
    scene.background = bg;
    fog.color.copy(bg);
    scene.fog = fog;

    sampleColor(SUN, p, sunColor);
    if (sun.current) {
      sun.current.color.copy(sunColor);
      sun.current.intensity = sampleNum(SUN_INT, p);
      // Sun arcs down toward the horizon as the day fades.
      const ang = THREE.MathUtils.lerp(1.1, -0.2, p);
      sun.current.position.set(
        Math.cos(ang) * 20 + 8,
        Math.sin(ang) * 22 + 4,
        12,
      );
    }
    if (hemi.current) hemi.current.intensity = THREE.MathUtils.lerp(0.7, 0.2, p);
  });

  return (
    <>
      <hemisphereLight ref={hemi} args={["#bcd0ff", "#1a2038", 0.6]} />
      <directionalLight ref={sun} position={[18, 22, 12]} intensity={2.4} />
      <ambientLight intensity={0.25} />
      <Stars radius={120} depth={60} count={2500} factor={4} fade speed={0.6} />
      <Snow />
    </>
  );
}
