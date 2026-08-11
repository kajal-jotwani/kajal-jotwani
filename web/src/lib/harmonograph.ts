import { seededRng } from "@/lib/seeded";

/**
 * A harmonograph: the Victorian drawing machine where two swinging pendulums
 * hold a pen and the paper. Each axis is the sum of two damped sine waves —
 *
 *    x(t) = Σ aᵢ · sin(fᵢt + φᵢ) · e^(−dᵢt)
 *
 * When the frequencies sit at small whole-number ratios, the curve closes into
 * a figure; detune them slightly and it precesses, drawing those looping roses.
 *
 * The good part: those same ratios — 3:2, 5:4, 4:3 — are exactly the intervals
 * that sound consonant to us. A perfect fifth is 3:2 whether you hear it or
 * draw it. So every post on this site gets a picture of a chord, seeded by its
 * own name, and no two are alike.
 */

const INTERVALS = [
  { ratio: 9 / 8, label: "9:8", name: "major second" },
  { ratio: 6 / 5, label: "6:5", name: "minor third" },
  { ratio: 5 / 4, label: "5:4", name: "major third" },
  { ratio: 4 / 3, label: "4:3", name: "perfect fourth" },
  { ratio: 3 / 2, label: "3:2", name: "perfect fifth" },
  { ratio: 5 / 3, label: "5:3", name: "major sixth" },
  { ratio: 2, label: "2:1", name: "octave" },
];

export interface Pendulum {
  f: number; // frequency
  p: number; // phase
  a: number; // amplitude
  d: number; // damping
}

export interface Harmonograph {
  x: Pendulum[];
  y: Pendulum[];
  intervals: { label: string; name: string }[];
  hue: number; // 0 accent · 1 pink · 2 green
}

export function harmonograph(seed: string): Harmonograph {
  const rng = seededRng(seed);

  const a = INTERVALS[Math.floor(rng() * INTERVALS.length)];
  let b = INTERVALS[Math.floor(rng() * INTERVALS.length)];
  if (b.label === a.label) b = INTERVALS[(INTERVALS.indexOf(a) + 3) % INTERVALS.length];

  const base = 2 + Math.floor(rng() * 3); // 2–4
  // a whisper of detune is what turns a closed figure into a drifting rose
  const detune = () => (rng() - 0.5) * 0.008;

  const P = (f: number): Pendulum => ({
    f: f + detune(),
    p: rng() * Math.PI * 2,
    a: 0.5 + rng() * 0.5,
    d: 0.0035 + rng() * 0.0055,
  });

  return {
    x: [P(base), P(base * a.ratio)],
    y: [P(base * b.ratio), P(base)],
    intervals: [
      { label: a.label, name: a.name },
      { label: b.label, name: b.name },
    ],
    hue: Math.floor(rng() * 3),
  };
}

/** position of the pen at time t, in −1..1 space */
export function penAt(h: Harmonograph, t: number): [number, number, number] {
  let x = 0;
  let y = 0;
  let env = 0;
  for (const p of h.x) {
    const e = Math.exp(-p.d * t);
    x += p.a * Math.sin(p.f * t + p.p) * e;
    env = Math.max(env, e);
  }
  for (const p of h.y) {
    const e = Math.exp(-p.d * t);
    y += p.a * Math.sin(p.f * t + p.p) * e;
  }
  return [x / 2, y / 2, env];
}
