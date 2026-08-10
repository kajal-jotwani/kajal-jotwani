"use client";

/**
 * The site's instrument, v2 — playful edition. Hand-rolled WebAudio, no libs.
 *
 *  - an FM e-piano for keystrokes, hovers and clicks (walks a pentatonic scale)
 *  - a synthesized drum kit: kick, snare, closed & open hats
 *  - a tiny step sequencer: every project has its own groove, seeded by name —
 *    hover a project's waveform and its beat plays
 *  - no background drone: silence until you touch something
 */

import { state, on } from "@/lib/bus";
import { seededRng } from "@/lib/seeded";

const PENTA = [293.66, 349.23, 392.0, 440.0, 523.25, 587.33, 698.46, 783.99]; // D4 F4 G4 A4 C5 D5 F5 G5

export interface BeatPattern {
  kick: number[];
  snare: number[];
  hat: number[];
  open: number[];
  bass: number[];
}

class Engine {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private noiseBuf!: AudioBuffer;
  private unsubs: (() => void)[] = [];
  running = false;

  // sequencer state
  private seqTimer: ReturnType<typeof setInterval> | null = null;
  private seqSeed = "";
  private nextStepTime = 0;
  private step = 0;
  private pattern: BeatPattern | null = null;

  start() {
    if (this.running) return;
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    if (!this.ctx) {
      this.ctx = new Ctx();
      this.build();
    }
    this.ctx.resume();
    this.running = true;
    state.soundOn = true;
    this.master.gain.setTargetAtTime(0.7, this.ctx.currentTime, 0.1);
    this.bindInputs();
  }

  stop() {
    if (!this.ctx || !this.running) return;
    this.stopBeat();
    this.master.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.15);
    this.running = false;
    state.soundOn = false;
    this.unsubs.forEach((u) => u());
    this.unsubs = [];
    const ctx = this.ctx;
    setTimeout(() => {
      if (!this.running) ctx.suspend();
    }, 800);
  }

  private build() {
    const ctx = this.ctx!;
    this.master = ctx.createGain();
    this.master.gain.value = 0.0001;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20;
    comp.ratio.value = 6;
    this.master.connect(comp).connect(ctx.destination);

    // one second of white noise, reused by snare & hats
    this.noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }

  /* ---------------- voices ---------------- */

  /** warm FM e-piano note */
  piano(freq: number, vel = 1, when = 0) {
    if (!this.ctx || !this.running) return;
    const ctx = this.ctx;
    const t = ctx.currentTime + when;

    const carrier = ctx.createOscillator();
    carrier.type = "sine";
    carrier.frequency.value = freq;

    // FM modulator gives the tine "bell" character
    const mod = ctx.createOscillator();
    mod.type = "sine";
    mod.frequency.value = freq * 2;
    const modGain = ctx.createGain();
    modGain.gain.setValueAtTime(freq * 1.6, t);
    modGain.gain.exponentialRampToValueAtTime(freq * 0.05, t + 0.5);
    mod.connect(modGain).connect(carrier.frequency);

    const g = ctx.createGain();
    const peak = 0.16 * vel;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);

    carrier.connect(g).connect(this.master);
    mod.start(t);
    carrier.start(t);
    mod.stop(t + 1.5);
    carrier.stop(t + 1.5);
  }

  kick(when = 0, vel = 1) {
    if (!this.ctx || !this.running) return;
    const ctx = this.ctx;
    const t = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(42, t + 0.11);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.9 * vel, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  snare(when = 0, vel = 1) {
    if (!this.ctx || !this.running) return;
    const ctx = this.ctx;
    const t = ctx.currentTime + when;
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuf;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1800;
    bp.Q.value = 0.8;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.5 * vel, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    noise.connect(bp).connect(g).connect(this.master);
    noise.start(t);
    noise.stop(t + 0.2);
    // body "thump"
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(196, t);
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.25 * vel, t);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
    osc.connect(g2).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  hat(when = 0, vel = 1, open = false) {
    if (!this.ctx || !this.running) return;
    const ctx = this.ctx;
    const t = ctx.currentTime + when;
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuf;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 7000;
    const g = ctx.createGain();
    const dur = open ? 0.3 : 0.05;
    g.gain.setValueAtTime(0.18 * vel, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    noise.connect(hp).connect(g).connect(this.master);
    noise.start(t);
    noise.stop(t + dur + 0.05);
  }

  /** melodic plink used by nav hovers etc. */
  plink(index?: number, velocity = 1) {
    const f = PENTA[(index ?? Math.floor(Math.random() * PENTA.length)) % PENTA.length];
    this.piano(f, velocity * 0.8);
  }

  /* ---------------- the seeded groove box ---------------- */

  /** Every seed string (= project name) gets its own 16-step groove. */
  startBeat(seed: string) {
    if (!this.ctx || !this.running) return;
    if (this.seqTimer && this.seqSeed === seed) return; // already grooving
    this.stopBeat();
    this.seqSeed = seed;

    const rng = seededRng(seed);
    const kick = Array.from({ length: 16 }, (_, i) =>
      i === 0 || i === 8 ? 1 : i % 2 === 0 && rng() > 0.72 ? 1 : 0
    );
    const snare = Array.from({ length: 16 }, (_, i) =>
      i === 4 || i === 12 ? 1 : rng() > 0.93 ? 1 : 0
    );
    const hat = Array.from({ length: 16 }, (_, i) => (i % 2 === 0 ? 1 : rng() > 0.5 ? 1 : 0));
    const open = Array.from({ length: 16 }, (_, i) => (i === 14 && rng() > 0.4 ? 1 : 0));
    // sparse bass notes from the low pentatonic
    const bass = Array.from({ length: 16 }, (_, i) =>
      i === 0 ? 1 : (i === 7 || i === 10) && rng() > 0.5 ? 1 : 0
    );
    const bpm = 88 + Math.floor(rng() * 24); // each project has its own tempo too
    this.startPattern({ kick, snare, hat, open, bass }, bpm, seed);
  }

  /** Play an arbitrary pattern (the /play drum machine uses this).
   *  The pattern object is read live each tick, so callers can mutate
   *  its arrays while the beat runs and hear changes instantly. */
  startPattern(pattern: BeatPattern, bpm: number, label = "custom") {
    if (!this.ctx || !this.running) return;
    this.stopBeat();
    this.seqSeed = label;
    this.pattern = pattern;

    const stepDur = 60 / bpm / 4;
    this.step = 0;
    this.nextStepTime = this.ctx.currentTime + 0.06;

    this.seqTimer = setInterval(() => {
      if (!this.ctx || !this.pattern) return;
      // schedule ahead for rock-solid timing
      while (this.nextStepTime < this.ctx.currentTime + 0.12) {
        const when = this.nextStepTime - this.ctx.currentTime;
        const s = this.step % 16;
        const swing = s % 2 === 1 ? stepDur * 0.12 : 0;
        if (this.pattern.kick[s]) this.kick(when + swing);
        if (this.pattern.snare[s]) this.snare(when + swing, 0.9);
        if (this.pattern.hat[s]) this.hat(when + swing, s % 4 === 0 ? 0.9 : 0.55);
        if (this.pattern.open[s]) this.hat(when + swing, 0.7, true);
        if (this.pattern.bass[s]) this.piano(PENTA[0] / 2, 0.5, when + swing);
        this.nextStepTime += stepDur;
        this.step++;
      }
    }, 30);
  }

  stopBeat() {
    if (this.seqTimer) {
      clearInterval(this.seqTimer);
      this.seqTimer = null;
    }
    this.seqSeed = "";
    this.pattern = null;
  }

  get beatSeed() {
    return this.seqSeed;
  }

  /* ---------------- inputs ---------------- */

  private lastKeyTime = 0;
  private keyStep = 2;

  private bindInputs() {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const now = performance.now();
      if (now - this.lastKeyTime < 70) return; // fast typing → arpeggio, not hail
      this.lastKeyTime = now;
      this.keyStep += (e.key.charCodeAt(0) % 3) - 1; // melodic walk
      this.keyStep = Math.max(0, Math.min(PENTA.length - 1, this.keyStep));
      this.piano(PENTA[this.keyStep], 0.75);
    };
    window.addEventListener("keydown", onKey);
    this.unsubs.push(() => window.removeEventListener("keydown", onKey));
    this.unsubs.push(on("plink", (i) => this.plink(typeof i === "number" ? i : undefined)));
    this.unsubs.push(
      on("beat:start", (seed) => typeof seed === "string" && this.startBeat(seed))
    );
    this.unsubs.push(on("beat:stop", () => this.stopBeat()));
  }
}

let engine: Engine | null = null;

export function getEngine(): Engine {
  if (!engine) engine = new Engine();
  return engine;
}
