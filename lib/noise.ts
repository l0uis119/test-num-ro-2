import { createNoise2D } from "simplex-noise";

/** Small deterministic PRNG so the mountains look identical on every load. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const noise2D = createNoise2D(mulberry32(1337));

/**
 * Fractal Brownian Motion — stacks several octaves of simplex noise to get the
 * craggy, self-similar look of a real mountain range.
 */
export function fbm(
  x: number,
  y: number,
  octaves = 5,
  lacunarity = 2.0,
  gain = 0.5,
): number {
  let amp = 0.5;
  let freq = 1.0;
  let sum = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise2D(x * freq, y * freq);
    freq *= lacunarity;
    amp *= gain;
  }
  return sum;
}

/**
 * Height field for the terrain. Ridged noise (1 - |fbm|) builds sharp alpine
 * crests; a radial falloff pushes the tallest peaks toward the horizon so the
 * foreground stays readable.
 */
export function terrainHeight(x: number, z: number): number {
  const n = fbm(x * 0.06, z * 0.06, 6);
  const ridged = 1 - Math.abs(n); // sharpen into ridges
  const peaks = Math.pow(ridged, 2.2);
  const distanceBoost = Math.min(1, Math.abs(z) / 60); // taller in the distance
  return peaks * (6 + distanceBoost * 16) - 2;
}
