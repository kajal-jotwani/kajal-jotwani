"use client";

/** Tiny event bus so the audio engine, art canvas and playhead can talk
 *  without a state library. */
type Handler = (payload?: unknown) => void;

const handlers: Record<string, Set<Handler>> = {};

export function on(event: string, fn: Handler): () => void {
  (handlers[event] ??= new Set()).add(fn);
  return () => handlers[event]?.delete(fn);
}

export function emit(event: string, payload?: unknown): void {
  handlers[event]?.forEach((fn) => fn(payload));
}

/** shared mutable state, read by canvases on their raf loop */
export const state = {
  soundOn: false,
  scrollProgress: 0, // 0..1 across the whole page
  scrollVelocity: 0, // px/frame, smoothed
  sectionIndex: 0,
};
