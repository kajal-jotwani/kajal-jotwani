/** Deterministic pseudo-random generator so each project gets its own
 *  little waveform, stable across builds — seeded by its name. */
export function seededRng(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += h << 13;
    h ^= h >>> 7;
    h += h << 3;
    h ^= h >>> 17;
    h += h << 5;
    return ((h >>> 0) % 1000) / 1000;
  };
}

/** Bars of a fake audio clip, seeded by name. Returns heights 0..1 */
export function waveformBars(seed: string, count = 48): number[] {
  const rng = seededRng(seed);
  const bars: number[] = [];
  let momentum = 0.5;
  for (let i = 0; i < count; i++) {
    momentum = Math.max(0.08, Math.min(1, momentum + (rng() - 0.5) * 0.55));
    const envelope = Math.sin((i / (count - 1)) * Math.PI) * 0.6 + 0.4;
    bars.push(momentum * envelope);
  }
  return bars;
}
