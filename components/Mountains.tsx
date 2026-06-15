"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { terrainHeight } from "@/lib/noise";
import { scrollState, damp } from "@/lib/scrollStore";

const ROCK_LOW = new THREE.Color("#161f3d");
const ROCK_MID = new THREE.Color("#2b3a6b");
const SNOW = new THREE.Color("#c9d6ff");

/**
 * Builds one displaced terrain plane with baked vertex colours (deep-blue rock
 * fading to snow on the crests). Flat shading gives a crisp, stylised alpine
 * facet look that also hides noise artefacts and stays cheap to render.
 */
function buildTerrain(
  size: number,
  segments: number,
  heightScale: number,
): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(size, size, segments, segments);
  geo.rotateX(-Math.PI / 2);

  const pos = geo.attributes.position as THREE.BufferAttribute;
  const heights = new Float32Array(pos.count);
  let min = Infinity;
  let max = -Infinity;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const h = terrainHeight(x, z) * heightScale;
    heights[i] = h;
    pos.setY(i, h);
    if (h < min) min = h;
    if (h > max) max = h;
  }

  // Vertex colours by altitude — snowline near the top, blue rock below.
  const colors = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const t = THREE.MathUtils.clamp((heights[i] - min) / (max - min), 0, 1);
    if (t < 0.55) {
      c.copy(ROCK_LOW).lerp(ROCK_MID, t / 0.55);
    } else {
      c.copy(ROCK_MID).lerp(SNOW, Math.pow((t - 0.55) / 0.45, 1.4));
    }
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

function Range({
  size,
  segments,
  heightScale,
  position,
  scrollSpeed,
  flat = true,
}: {
  size: number;
  segments: number;
  heightScale: number;
  position: [number, number, number];
  scrollSpeed: number;
  flat?: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const geo = useMemo(
    () => buildTerrain(size, segments, heightScale),
    [size, segments, heightScale],
  );
  const baseZ = position[2];

  useFrame((_, delta) => {
    if (!ref.current) return;
    const dt = Math.min(delta, 0.05);
    // Each layer advances toward the camera at its own rate → parallax depth.
    const targetZ = baseZ + scrollState.progress * scrollSpeed;
    ref.current.position.z = damp(ref.current.position.z, targetZ, 2, dt);
    // A whisper of pointer-driven sway.
    ref.current.rotation.y = damp(
      ref.current.rotation.y,
      scrollState.pointerX * 0.04,
      1.5,
      dt,
    );
  });

  return (
    <group ref={ref} position={position}>
      <mesh geometry={geo} receiveShadow>
        <meshStandardMaterial
          vertexColors
          flatShading={flat}
          roughness={0.95}
          metalness={0.0}
        />
      </mesh>
    </group>
  );
}

export default function Mountains() {
  return (
    <group>
      {/* Distant silhouette range — taller, moves slowly. */}
      <Range
        size={320}
        segments={120}
        heightScale={2.1}
        position={[0, -6, -120]}
        scrollSpeed={26}
      />
      {/* Main valley the trousers travel across — moves faster. */}
      <Range
        size={240}
        segments={200}
        heightScale={1.0}
        position={[0, -8, -30]}
        scrollSpeed={48}
      />
    </group>
  );
}
