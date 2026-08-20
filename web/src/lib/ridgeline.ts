import { seededRng } from "@/lib/seeded";

/**
 * A ridgeline plot in the manner of CP1919 — the first pulsar's radio trace,
 * stacked scan by scan (you know it as the Unknown Pleasures cover).
 *
 * Here the signal is the post itself: the title's characters set the peak
 * heights, a seeded rng adds the noise floor, and successive rows echo the
 * signal with drift — so every post broadcasts its own trace. Rendered as
 * pure SVG at build time: no JavaScript, no animation, nothing that moves.
 */

export interface RidgeArtData {
  width: number;
  height: number;
  rows: { d: string; hot: boolean }[]; // back-to-front; `hot` rows get accent ink
}

export function ridgelines(seed: string, title: string): RidgeArtData {
  const rng = seededRng(seed);
  const width = 640;
  const height = 300;
  const ROWS = 24;
  const marginX = 90;
  const top = 46;
  const spacing = (height - top - 26) / (ROWS - 1);
  const innerW = width - marginX * 2;
  const STEP = 5;

  // the title, read as a signal: characters → normalized heights
  const chars = (title || seed).replace(/\s+/g, "");
  const sig = (k: number) =>
    ((chars.charCodeAt(((k % chars.length) + chars.length) % chars.length) * 2654435761) % 1000) /
    1000;

  // each row drifts a little from the last — echoes of one broadcast
  const rowPhase: number[] = [];
  const rowGain: number[] = [];
  for (let r = 0; r < ROWS; r++) {
    rowPhase.push((rng() - 0.5) * 6);
    rowGain.push(0.55 + rng() * 0.75);
  }

  const rows: RidgeArtData["rows"] = [];
  for (let r = 0; r < ROWS; r++) {
    const baseY = top + r * spacing;
    let d = `M 0 ${baseY.toFixed(1)} L ${marginX} ${baseY.toFixed(1)}`;
    const n = Math.floor(innerW / STEP);
    for (let i = 1; i < n; i++) {
      const x = marginX + i * STEP;
      const t = i / n; // 0..1 across the row
      // envelope: quiet edges, energetic middle — like the pulse window
      const env = Math.pow(Math.sin(Math.PI * t), 2.2);
      const k = Math.floor(i / 2 + rowPhase[r]) + r * 3;
      const a = sig(k);
      const b = sig(k + 1);
      const wave = (a * 0.7 + b * 0.3 - 0.35) * 2; // -0.7..1.3-ish, mostly positive spikes
      const jitter = (rng() - 0.5) * 2.2;
      const amp = Math.max(0, wave) * env * 44 * rowGain[r] + env * 3 + jitter * env;
      const y = baseY - amp;
      d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    d += ` L ${width - marginX} ${baseY.toFixed(1)} L ${width} ${baseY.toFixed(1)}`;
    rows.push({ d, hot: rng() > 0.82 });
  }
  return { width, height, rows };
}
