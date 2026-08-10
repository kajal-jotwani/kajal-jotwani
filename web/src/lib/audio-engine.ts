"use client";

/**
 * The site's instrument. Hand-rolled WebAudio — no libraries.
 *
 *  - a warm two-oscillator pad whose chord follows the section you're reading
 *  - scroll velocity opens a lowpass filter (scrolling "performs" the page)
 *  - keystrokes & UI plinks play notes on a D-minor pentatonic scale
 *  - everything hangs off one master gain kept deliberately quiet
 */

import { state, on } from "@/lib/bus";

const PENTA = [146.83, 174.61, 196.0, 220.0, 261.63, 293.66, 349.23, 392.0]; // D3 F3 G3 A3 C4 D4 F4 G4

// one chord per section: [root, third-ish, fifth] in Hz (D minor world)
const CHORDS: number[][] = [
  [73.42, 110.0, 146.83], // hero      D2 A2 D3
  [87.31, 130.81, 174.61], // about    F2 C3 F3
  [98.0, 146.83, 196.0], // timeline   G2 D3 G3
  [110.0, 164.81, 220.0], // projects  A2 E3 A3
  [87.31, 130.81, 174.61], // blog     F2 C3 F3
  [73.42, 110.0, 146.83], // ama+chat  D2 A2 D3
];

class Engine {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private padGain!: GainNode;
  private filter!: BiquadFilterNode;
  private oscs: OscillatorNode[] = [];
  private oscGains: GainNode[] = [];
  private currentChord = -1;
  private raf = 0;
  private unsubs: (() => void)[] = [];
  running = false;

  start() {
    if (this.running) return;
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    if (!this.ctx) {
      this.ctx = new Ctx();
      this.build();
    }
    this.ctx.resume();
    this.running = true;
    state.soundOn = true;
    this.master.gain.setTargetAtTime(0.5, this.ctx.currentTime, 0.8);
    this.loop();
    this.bindInputs();
  }

  stop() {
    if (!this.ctx || !this.running) return;
    this.master.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.4);
    this.running = false;
    state.soundOn = false;
    cancelAnimationFrame(this.raf);
    this.unsubs.forEach((u) => u());
    this.unsubs = [];
    const ctx = this.ctx;
    setTimeout(() => {
      if (!this.running) ctx.suspend();
    }, 1500);
  }

  private build() {
    const ctx = this.ctx!;
    this.master = ctx.createGain();
    this.master.gain.value = 0.0001;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -28;
    comp.ratio.value = 8;
    this.master.connect(comp).connect(ctx.destination);

    // pad: 3 voices × 2 detuned triangles through a lowpass
    this.filter = ctx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.value = 320;
    this.filter.Q.value = 0.6;
    this.padGain = ctx.createGain();
    this.padGain.gain.value = 0.16;
    this.filter.connect(this.padGain).connect(this.master);

    for (let v = 0; v < 3; v++) {
      for (const detune of [-5, 5]) {
        const osc = ctx.createOscillator();
        osc.type = "triangle";
        osc.frequency.value = CHORDS[0][v];
        osc.detune.value = detune;
        const g = ctx.createGain();
        g.gain.value = 0.33;
        osc.connect(g).connect(this.filter);
        osc.start();
        this.oscs.push(osc);
        this.oscGains.push(g);
      }
    }

    // slow shimmer so the pad breathes
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.09;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.05;
    lfo.connect(lfoGain).connect(this.padGain.gain);
    lfo.start();
  }

  private setChord(i: number) {
    if (!this.ctx || i === this.currentChord) return;
    this.currentChord = i;
    const chord = CHORDS[i % CHORDS.length];
    const t = this.ctx.currentTime;
    this.oscs.forEach((osc, idx) => {
      const target = chord[Math.floor(idx / 2)];
      osc.frequency.setTargetAtTime(target, t, 1.4);
    });
  }

  /** short melodic plink, pentatonic */
  plink(index?: number, velocity = 1) {
    if (!this.ctx || !this.running) return;
    const ctx = this.ctx;
    const f = PENTA[(index ?? Math.floor(Math.random() * PENTA.length)) % PENTA.length];
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = f * 2;
    const g = ctx.createGain();
    const t = ctx.currentTime;
    const peak = 0.08 * velocity;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    // a soft octave-up partial for sparkle
    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.value = f * 4;
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.0001, t);
    g2.gain.exponentialRampToValueAtTime(peak * 0.25, t + 0.01);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    osc.connect(g).connect(this.master);
    osc2.connect(g2).connect(this.master);
    osc.start(t);
    osc2.start(t);
    osc.stop(t + 1);
    osc2.stop(t + 0.6);
  }

  private lastKeyTime = 0;
  private keyStep = 0;

  private bindInputs() {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement;
      const typing = target.tagName === "INPUT" || target.tagName === "TEXTAREA";
      const now = performance.now();
      if (now - this.lastKeyTime < 70) return; // fast typing → gentle arpeggio, not hail
      this.lastKeyTime = now;
      // walk the scale melodically instead of random jumps
      this.keyStep += (e.key.charCodeAt(0) % 3) - 1;
      this.keyStep = Math.max(0, Math.min(PENTA.length - 1, this.keyStep));
      this.plink(this.keyStep, typing ? 0.7 : 0.9);
    };
    window.addEventListener("keydown", onKey);
    this.unsubs.push(() => window.removeEventListener("keydown", onKey));
    this.unsubs.push(on("plink", (i) => this.plink(typeof i === "number" ? i : undefined)));
  }

  private loop = () => {
    if (!this.ctx || !this.running) return;
    this.setChord(state.sectionIndex);
    // scroll velocity opens the filter: still page ≈ 300 Hz, flying ≈ 2000 Hz
    const v = Math.min(Math.abs(state.scrollVelocity), 60);
    const target = 300 + (v / 60) * 1700;
    this.filter.frequency.setTargetAtTime(target, this.ctx.currentTime, 0.25);
    this.raf = requestAnimationFrame(this.loop);
  };
}

let engine: Engine | null = null;

export function getEngine(): Engine {
  if (!engine) engine = new Engine();
  return engine;
}
