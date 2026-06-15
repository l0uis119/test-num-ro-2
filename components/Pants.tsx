"use client";

import { useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { scrollState, damp } from "@/lib/scrollStore";
import { pantsPosition } from "@/lib/journey";

/**
 * ── Drop-in for a real GLB ───────────────────────────────────────────────
 * Put a trousers model at `public/models/pants.glb` and set MODEL_URL to
 * "/models/pants.glb". Everything else (placement, the climb animation, the
 * deep-blue recolour) keeps working. While it's null we render the parametric
 * trousers below.
 */
const MODEL_URL: string | null = null;

const DEEP_BLUE = "#1d3a85";

/* ------------------------------------------------------------------ */
/* Parametric garment construction                                     */
/* ------------------------------------------------------------------ */

function lerpProfile(
  keys: ReadonlyArray<readonly [number, number]>,
  u: number,
): number {
  const p = THREE.MathUtils.clamp(u, 0, 1);
  for (let i = 0; i < keys.length - 1; i++) {
    const [u0, r0] = keys[i];
    const [u1, r1] = keys[i + 1];
    if (p >= u0 && p <= u1) {
      return THREE.MathUtils.lerp(r0, r1, (p - u0) / (u1 - u0 || 1));
    }
  }
  return keys[keys.length - 1][1];
}

type ProfileFn = (u: number) => { a: number; b: number };

/**
 * Sweeps an ellipse along a CatmullRom path, varying its radii per ring with
 * `profile` and layering fold noise — a clean, controllable garment tube that
 * actually bends (at the knee) and tapers (at the cuff).
 */
function buildSweptTube(
  points: ReadonlyArray<[number, number, number]>,
  profile: ProfileFn,
  opts: {
    tubular?: number;
    radial?: number;
    foldBase?: number;
    foldPeak?: number;
    poolAt?: number;
    folds?: number;
    capStart?: boolean;
    capEnd?: boolean;
  } = {},
): THREE.BufferGeometry {
  const {
    tubular = 80,
    radial = 48,
    foldBase = 0.015,
    foldPeak = 0.04,
    poolAt = 0.5,
    folds = 9,
    capStart = false,
    capEnd = false,
  } = opts;

  const curve = new THREE.CatmullRomCurve3(
    points.map((p) => new THREE.Vector3(p[0], p[1], p[2])),
  );

  const positions: number[] = [];
  const indices: number[] = [];
  const P = new THREE.Vector3();

  for (let i = 0; i <= tubular; i++) {
    const u = i / tubular;
    curve.getPointAt(u, P);
    const { a, b } = profile(u);
    const amp =
      foldBase + foldPeak * Math.exp(-Math.pow((u - poolAt) / 0.22, 2));

    for (let j = 0; j <= radial; j++) {
      const theta = (j / radial) * Math.PI * 2;
      const fold =
        1 +
        amp *
          (0.6 * Math.cos(theta * folds) +
            0.4 * Math.cos(theta * folds * 2 + u * 6)) +
        0.022 * Math.sin(u * 38 + theta * 3);
      positions.push(
        P.x + Math.cos(theta) * a * fold,
        P.y,
        P.z + Math.sin(theta) * b * fold,
      );
    }
  }

  const ringVerts = radial + 1;
  for (let i = 0; i < tubular; i++) {
    for (let j = 0; j < radial; j++) {
      const a0 = i * ringVerts + j;
      const b0 = (i + 1) * ringVerts + j;
      indices.push(a0, b0, a0 + 1, b0, b0 + 1, a0 + 1);
    }
  }

  // Optional flat caps so the tube reads as solid where nothing covers it.
  const addCap = (ringIndex: number, flip: boolean) => {
    curve.getPointAt(ringIndex === 0 ? 0 : 1, P);
    const centerIdx = positions.length / 3;
    positions.push(P.x, P.y, P.z);
    const base = ringIndex * ringVerts;
    for (let j = 0; j < radial; j++) {
      const v0 = base + j;
      const v1 = base + j + 1;
      if (flip) indices.push(centerIdx, v1, v0);
      else indices.push(centerIdx, v0, v1);
    }
  };
  if (capStart) addCap(0, false);
  if (capEnd) addCap(tubular, true);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

const LEG_KEYS = [
  [0.0, 0.4],
  [0.12, 0.45],
  [0.3, 0.5],
  [0.5, 0.52], // baggy, pooled calf
  [0.7, 0.44],
  [0.85, 0.3],
  [0.94, 0.18], // cinch at the ankle
  [1.0, 0.2],
] as const;

const HIP_KEYS = [
  [0.0, 0.82],
  [0.5, 0.74],
  [1.0, 0.66],
] as const;

function ProceduralPants() {
  const legGeo = useMemo(
    () =>
      buildSweptTube(
        [
          [0, 1.3, 0],
          [0, 0.55, 0.05],
          [0, -0.25, 0.13], // knee pushes forward
          [0, -1.05, 0.05],
          [0, -1.62, 0],
        ],
        (u) => {
          const r = lerpProfile(LEG_KEYS, u);
          return { a: r, b: r * 0.82 };
        },
        { foldBase: 0.018, foldPeak: 0.045, poolAt: 0.5, folds: 9, capEnd: true },
      ),
    [],
  );

  const hipGeo = useMemo(
    () =>
      buildSweptTube(
        [
          [0, 0.55, 0],
          [0, 1.0, 0],
          [0, 1.45, 0],
        ],
        (u) => {
          const r = lerpProfile(HIP_KEYS, u);
          return { a: r, b: r * 0.62 };
        },
        { tubular: 40, foldBase: 0.012, foldPeak: 0.02, poolAt: 0.5, folds: 12 },
      ),
    [],
  );

  const fabric = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(DEEP_BLUE),
        roughness: 0.7,
        metalness: 0.04,
        sheen: 1,
        sheenRoughness: 0.8,
        sheenColor: new THREE.Color("#5b7be0"),
        clearcoat: 0.05,
        envMapIntensity: 0.6,
      }),
    [],
  );

  const accent = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#102254"),
        roughness: 0.85,
        metalness: 0.05,
      }),
    [],
  );

  return (
    <group>
      {/* hips / seat — merges the two legs into one garment */}
      <mesh geometry={hipGeo} material={fabric} />
      {/* legs */}
      <mesh geometry={legGeo} material={fabric} position={[-0.33, 0, 0]} rotation={[0, 0, 0.04]} />
      <mesh geometry={legGeo} material={fabric} position={[0.33, 0, 0]} rotation={[0, 0, -0.04]} />
      {/* waistband / belt */}
      <mesh material={accent} position={[0, 1.42, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1.12, 0.72, 1]}>
        <torusGeometry args={[0.6, 0.08, 14, 56]} />
      </mesh>
      {/* cinched ankle cuffs */}
      <mesh material={accent} position={[-0.33, -1.55, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.34, 0.28, 1]}>
        <torusGeometry args={[0.6, 0.09, 12, 40]} />
      </mesh>
      <mesh material={accent} position={[0.33, -1.55, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[0.34, 0.28, 1]}>
        <torusGeometry args={[0.6, 0.09, 12, 40]} />
      </mesh>
    </group>
  );
}

/** Loads a real GLB and recolours every mesh deep blue. Used when MODEL_URL is set. */
function GLBPants({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.material = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(DEEP_BLUE),
          roughness: 0.7,
          sheen: 1,
          sheenColor: new THREE.Color("#5b7be0"),
        });
      }
    });
    return c;
  }, [scene]);
  return <primitive object={cloned} />;
}

/** Outer group that flies the garment up the valley as you scroll. */
function Choreography({ children }: { children: ReactNode }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const p = scrollState.progress;
    const g = group.current;

    const path = pantsPosition(p);
    const bob = Math.sin(t * 1.2) * 0.06;

    g.position.x = damp(g.position.x, path.x, 3, dt);
    g.position.y = damp(g.position.y, path.y + bob, 3, dt);
    g.position.z = damp(g.position.z, path.z, 3, dt);

    // Not just a spin: it tumbles, leans into the climb and its legs swing.
    const rotY = t * 0.18 + p * 6.0 + scrollState.pointerX * 0.3;
    const rotX = 0.1 + Math.sin(p * Math.PI * 2) * 0.35 + scrollState.pointerY * 0.2;
    const rotZ = Math.sin(t * 0.8 + p * 9) * 0.12;
    g.rotation.y = damp(g.rotation.y, rotY, 4, dt);
    g.rotation.x = damp(g.rotation.x, rotX, 4, dt);
    g.rotation.z = damp(g.rotation.z, rotZ, 4, dt);

    // Hero-sized up close, recedes on the climb, with a bump near the summit.
    const targetScale =
      THREE.MathUtils.lerp(1.15, 0.55, p) +
      0.32 * Math.exp(-Math.pow((p - 0.68) / 0.12, 2));
    const s = damp(g.scale.x, targetScale, 3, dt);
    g.scale.setScalar(s);
  });

  return (
    <group ref={group} dispose={null}>
      {children}
    </group>
  );
}

export default function Pants() {
  return (
    <Choreography>
      {MODEL_URL ? <GLBPants url={MODEL_URL} /> : <ProceduralPants />}
    </Choreography>
  );
}
