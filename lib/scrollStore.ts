/**
 * A tiny mutable store that bridges GSAP's ScrollTrigger (DOM world) and
 * react-three-fiber's render loop (WebGL world).
 *
 * GSAP writes `progress` (0 → 1 across the whole page) and the active
 * `section` index from a ScrollTrigger `onUpdate` callback. The 3D scene reads
 * those values every frame inside `useFrame` and lerps toward them, so the
 * model motion stays buttery even though scroll events are coarse.
 */

export type ScrollState = {
  /** Normalized scroll progress of the whole experience, 0 → 1. */
  progress: number;
  /** Pointer position in normalized device-ish coords, -1 → 1. */
  pointerX: number;
  pointerY: number;
};

export const scrollState: ScrollState = {
  progress: 0,
  pointerX: 0,
  pointerY: 0,
};

/** Linear interpolation helper shared by the scene. */
export const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * t;

/** Smooth, frame-rate independent damping toward a target. */
export const damp = (
  current: number,
  target: number,
  lambda: number,
  dt: number,
): number => lerp(current, target, 1 - Math.exp(-lambda * dt));
