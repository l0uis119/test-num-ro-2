/**
 * Tiny shared pointer store. The custom cursor writes the normalized pointer
 * position here (-1 → 1 on each axis) and the hero reads it every frame to
 * parallax the product and background — no React re-renders involved.
 */
export const pointer = { x: 0, y: 0 };

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
