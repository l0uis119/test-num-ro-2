"use client";

import dynamic from "next/dynamic";
import Story from "@/components/Story";
import CustomCursor from "@/components/CustomCursor";

// The WebGL scene is browser-only — never render it on the server.
const Scene = dynamic(() => import("@/components/Scene"), {
  ssr: false,
  loading: () => <div className="scene-loading" aria-hidden="true" />,
});

export default function Home() {
  return (
    <main>
      <div className="scene-layer" aria-hidden="true">
        <Scene />
      </div>
      <Story />
      <CustomCursor />
    </main>
  );
}
