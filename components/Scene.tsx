"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import Pants from "./Pants";
import { scrollState, damp } from "@/lib/scrollStore";

/**
 * Eases the camera in/out as the page scrolls — a slow dolly that makes the
 * trousers feel like they're drifting through real space rather than just
 * spinning in place.
 */
function CameraRig() {
  const target = useRef(new THREE.Vector3(0, 0, 0));
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const p = scrollState.progress;
    const z = THREE.MathUtils.lerp(6.2, 7.4, Math.sin(p * Math.PI)); // pull in mid-scroll
    const y = THREE.MathUtils.lerp(0.4, -0.4, p);
    state.camera.position.x = damp(
      state.camera.position.x,
      scrollState.pointerX * 0.6,
      2.5,
      dt,
    );
    state.camera.position.y = damp(state.camera.position.y, y, 2.5, dt);
    state.camera.position.z = damp(state.camera.position.z, z, 2.5, dt);
    state.camera.lookAt(target.current);
  });
  return null;
}

export default function Scene() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0.4, 6.2], fov: 38 }}
    >
      <color attach="background" args={["#05070f"]} />
      <fog attach="fog" args={["#05070f", 9, 18]} />

      {/* Key + rim lighting tuned for deep, electric blues. */}
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[4, 6, 5]}
        intensity={2.4}
        color="#dce6ff"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-6, 2, -4]} intensity={1.6} color="#2240ff" />
      <pointLight position={[0, -3, 3]} intensity={1.2} color="#4f7bff" />

      <Suspense fallback={null}>
        <Pants />

        <ContactShadows
          position={[0, -2.2, 0]}
          opacity={0.5}
          scale={12}
          blur={2.6}
          far={5}
          color="#0a1230"
        />

        {/* Procedural environment built from Lightformers — gives the fabric
            crisp specular glints without fetching any remote HDR file. */}
        <Environment resolution={256}>
          <Lightformer
            intensity={3}
            position={[0, 4, 4]}
            scale={[10, 4, 1]}
            color="#ffffff"
          />
          <Lightformer
            intensity={2}
            position={[-5, 1, 1]}
            scale={[6, 6, 1]}
            color="#3a5cff"
          />
          <Lightformer
            intensity={1.5}
            position={[5, -1, -2]}
            scale={[6, 6, 1]}
            color="#1b2a6b"
          />
        </Environment>
      </Suspense>

      <CameraRig />
    </Canvas>
  );
}
