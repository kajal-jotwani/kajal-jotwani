import { seededRng } from "@/lib/seeded";

/**
 * Chladni figures: scatter sand on a metal plate, bow its edge, and the
 * grains leap away from the vibrating regions to settle along the nodal
 * lines — the curves where the plate stays perfectly still. Sound, made
 * visible. Ernst Chladni drew crowds across Europe with this in 1787.
 *
 * A square plate vibrating in mode (n, m) moves like
 *
 *    f(x, y) = a·cos(nπx)cos(mπy) + b·cos(mπx)cos(nπy)
 *
 * and the sand collects where f ≈ 0. Every blog post gets its own mode,
 * seeded by the post's name — its own chord, struck in sand.
 */

export interface ChladniParams {
  n: number;
  m: number;
  a: number;
  b: number;
  hueA: number; // palette index for most grains
  hueB: number; // accent grains
}

export function chladni(seed: string): ChladniParams {
  const rng = seededRng(seed);
  const n = 2 + Math.floor(rng() * 5); // 2..6
  let m = 2 + Math.floor(rng() * 5);
  if (m === n) m = n + 1 + Math.floor(rng() * 2); // distinct modes make the rich figures
  const a = 0.7 + rng() * 0.6;
  const b = (rng() > 0.5 ? 1 : -1) * (0.7 + rng() * 0.6);
  const hueA = Math.floor(rng() * 3);
  const hueB = (hueA + 1 + Math.floor(rng() * 2)) % 3;
  return { n, m, a, b, hueA, hueB };
}

/** plate displacement at (x, y), both in 0..1 */
export function vibration(p: ChladniParams, x: number, y: number): number {
  return (
    p.a * Math.cos(p.n * Math.PI * x) * Math.cos(p.m * Math.PI * y) +
    p.b * Math.cos(p.m * Math.PI * x) * Math.cos(p.n * Math.PI * y)
  );
}
