"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import Pants from "./Pants";
import Mountains from "./Mountains";
import Atmosphere from "./Atmosphere";
import { scrollState, damp } from "@/lib/scrollStore";
import { pantsPosition, cameraPosition } from "@/lib/journey";

/** Tracking shot: the camera stays locked on the garment as it climbs. */
function CameraRig() {
  const look = useRef(new THREE.Vector3(0, 0, 0));
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const p = scrollState.progress;
    const cam = cameraPosition(p, scrollState.pointerX, scrollState.pointerY);
    state.camera.position.x = damp(state.camera.position.x, cam.x, 2.2, dt);
    state.camera.position.y = damp(state.camera.position.y, cam.y, 2.2, dt);
    state.camera.position.z = damp(state.camera.position.z, cam.z, 2.2, dt);

    const tgt = pantsPosition(p);
    look.current.x = damp(look.current.x, tgt.x, 2.5, dt);
    look.current.y = damp(look.current.y, tgt.y, 2.5, dt);
    look.current.z = damp(look.current.z, tgt.z, 2.5, dt);
    state.camera.lookAt(look.current);
  });
  return null;
}

export default function Scene() {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 1.2, 6.2], fov: 42, near: 0.1, far: 600 }}
    >
      <Suspense fallback={null}>
        <Atmosphere />
        <Mountains />
        <Pants />

        {/* Procedural reflections for the fabric — no remote HDR fetched. */}
        <Environment resolution={256}>
          <Lightformer intensity={2.4} position={[0, 6, 6]} scale={[12, 5, 1]} color="#ffffff" />
          <Lightformer intensity={1.6} position={[-6, 2, 2]} scale={[6, 6, 1]} color="#5b7be0" />
          <Lightformer intensity={1.2} position={[6, -1, -2]} scale={[6, 6, 1]} color="#1b2a6b" />
        </Environment>
      </Suspense>

      <CameraRig />
    </Canvas>
  );
}
