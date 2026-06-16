"use client";

import { useEffect, useRef } from "react";
import { pointer } from "@/lib/scrollStore";

/**
 * A two-part custom cursor: a small instantly-tracking dot and a larger ring
 * that eases behind it. The ring swells when hovering anything tagged
 * `data-cursor="link"` (or native links/buttons). It also publishes the
 * pointer position into `scrollState` so the 3D scene can parallax with it.
 *
 * Pointer-device only — on touch screens it bails out and the OS cursor /
 * native tap behaviour is left untouched.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    document.body.classList.add("has-custom-cursor");

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPos = { x: mouse.x, y: mouse.y };
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      // The dot is locked to the real pointer for precision.
      dot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;

      // Feed normalized pointer (-1 → 1) to the parallax layers.
      pointer.x = (mouse.x / window.innerWidth) * 2 - 1;
      pointer.y = -((mouse.y / window.innerHeight) * 2 - 1);
    };

    const render = () => {
      ringPos.x += (mouse.x - ringPos.x) * 0.18;
      ringPos.y += (mouse.y - ringPos.y) * 0.18;
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
      raf = requestAnimationFrame(render);
    };

    const isInteractive = (el: EventTarget | null) =>
      el instanceof Element &&
      !!el.closest('a, button, [data-cursor="link"]');

    const onOver = (e: MouseEvent) => {
      if (isInteractive(e.target)) ring.classList.add("is-hovering");
    };
    const onOut = (e: MouseEvent) => {
      if (isInteractive(e.target)) ring.classList.remove("is-hovering");
    };
    const onDown = () => ring.classList.add("is-down");
    const onUp = () => ring.classList.remove("is-down");

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    window.addEventListener("mouseout", onOut);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    raf = requestAnimationFrame(render);

    return () => {
      document.body.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseout", onOut);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  );
}
