/**
 * The flight path of the trousers across the scene, expressed purely as a
 * function of scroll progress (0 → 1). Both the model *and* the camera read
 * this so the camera can stay locked on the garment like a tracking shot as it
 * wanders the valley and climbs toward the peaks.
 *
 * Kept time-independent on purpose — per-frame bob/spin lives in the model so
 * the camera tracks a smooth centre line and never gets seasick.
 */
export type Vec3 = { x: number; y: number; z: number };

export function pantsPosition(p: number): Vec3 {
  return {
    x: Math.sin(p * Math.PI * 2) * 2.3, // wander left/right across the valley
    y: -0.4 + p * 3.1, // steadily ascend toward the summit
    z: 1.2 - p * 5.0 + Math.sin(p * Math.PI * 2) * 0.9, // drift into the range
  };
}

/** Where the camera should sit — a little behind/above the garment, easing back
 *  as the climb gets higher so the mountains open up around it. */
export function cameraPosition(p: number, pointerX: number, pointerY: number): Vec3 {
  const t = pantsPosition(p);
  return {
    x: t.x * 0.45 + pointerX * 0.9,
    y: t.y + 1.0 + p * 0.8 + pointerY * 0.5,
    z: t.z + 4.6 + Math.sin(p * Math.PI) * 1.6,
  };
}
