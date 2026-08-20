import { seededRng } from "@/lib/seeded";

/** Smooth seeded value noise with fractal octaves — the p5 staple.
 *  fbm(x, y) returns 0..1, coherent and organic, same every build. */
export function makeFbm(seed: string) {
  const rng = seededRng(seed);
  const N = 64;
  const grid: number[] = Array.from({ length: N * N }, () => rng());
  const sm = (t: number) => t * t * (3 - 2 * t);

  const noise = (x: number, y: number): number => {
    const xi = Math.floor(x) & (N - 1);
    const yi = Math.floor(y) & (N - 1);
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const a = grid[yi * N + xi];
    const b = grid[yi * N + ((xi + 1) & (N - 1))];
    const c = grid[((yi + 1) & (N - 1)) * N + xi];
    const d = grid[((yi + 1) & (N - 1)) * N + ((xi + 1) & (N - 1))];
    const u = sm(xf);
    const v = sm(yf);
    return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
  };

  return (x: number, y: number): number => {
    let sum = 0;
    let amp = 0.5;
    let f = 1;
    for (let o = 0; o < 4; o++) {
      sum += amp * noise(x * f, y * f);
      amp *= 0.5;
      f *= 2.03;
    }
    return sum / 0.9375; // normalize to ~0..1
  };
}
