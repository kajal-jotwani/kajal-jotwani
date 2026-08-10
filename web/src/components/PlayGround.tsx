"use client";

import { useEffect, useRef, useState } from "react";
import { getEngine, type BeatPattern } from "@/lib/audio-engine";

/**
 * A drum machine for people who've never made music or written code.
 * Click squares → hear a beat → watch the code write itself underneath.
 * The bridge between "normal person" and the Strudel REPL below it.
 */

const ROWS = [
  { key: "kick", label: "kick", code: "bd", color: "bg-accent", soft: "bg-accent-soft" },
  { key: "snare", label: "snare", code: "sd", color: "bg-pink", soft: "bg-pink-soft" },
  { key: "hat", label: "hats", code: "hh", color: "bg-green", soft: "bg-green-soft" },
] as const;

const STARTER: BeatPattern = {
  kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
  snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
  hat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
  open: new Array(16).fill(0),
  bass: new Array(16).fill(0),
};

function toMini(row: number[], sym: string): string {
  // 16 steps → grouped in 4s, "~" is silence: the actual Strudel notation
  const groups: string[] = [];
  for (let g = 0; g < 4; g++) {
    const cells = row.slice(g * 4, g * 4 + 4).map((v) => (v ? sym : "~"));
    groups.push(`[${cells.join(" ")}]`);
  }
  return groups.join(" ");
}

export default function PlayGround() {
  const patternRef = useRef<BeatPattern>({
    kick: [...STARTER.kick],
    snare: [...STARTER.snare],
    hat: [...STARTER.hat],
    open: [...STARTER.open],
    bass: [...STARTER.bass],
  });
  const [, force] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [bpm, setBpm] = useState(100);

  const toggle = (row: (typeof ROWS)[number]["key"], i: number) => {
    // mutate in place — the engine reads this object live, so the beat
    // changes on the very next step. that's the whole magic trick.
    patternRef.current[row][i] = patternRef.current[row][i] ? 0 : 1;
    force((n) => n + 1);
  };

  const play = () => {
    const engine = getEngine();
    engine.start(); // user gesture → audio allowed; also lights up the ♪
    engine.startPattern(patternRef.current, bpm, "playground");
    setPlaying(true);
  };

  const stop = () => {
    getEngine().stopBeat();
    setPlaying(false);
  };

  const changeBpm = (v: number) => {
    setBpm(v);
    if (playing) getEngine().startPattern(patternRef.current, v, "playground");
  };

  useEffect(() => () => getEngine().stopBeat(), []);

  const p = patternRef.current;

  return (
    <div className="rounded-2xl border border-line bg-bg-card/80 p-5 sm:p-7">
      {/* transport */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <button
          onClick={playing ? stop : play}
          className={`rounded-full px-6 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${
            playing ? "bg-pink text-white" : "bg-ink text-bg"
          }`}
        >
          {playing ? "■ stop" : "▶ play the beat"}
        </button>
        <label className="flex items-center gap-3 font-mono text-[12px] tracking-widest text-muted">
          tempo
          <input
            type="range"
            min={70}
            max={150}
            value={bpm}
            onChange={(e) => changeBpm(Number(e.target.value))}
            className="accent-[var(--accent)]"
          />
          {bpm} bpm
        </label>
      </div>

      {/* the grid */}
      <div className="space-y-2">
        {ROWS.map((row) => (
          <div key={row.key} className="flex items-center gap-2">
            <span className="font-mono w-12 shrink-0 text-right text-[11px] lowercase tracking-widest text-muted">
              {row.label}
            </span>
            <div className="grid flex-1 grid-cols-16 gap-1" style={{ gridTemplateColumns: "repeat(16, minmax(0,1fr))" }}>
              {p[row.key].map((v, i) => (
                <button
                  key={i}
                  onClick={() => toggle(row.key, i)}
                  aria-label={`${row.label} step ${i + 1} ${v ? "on" : "off"}`}
                  className={`aspect-square rounded-md transition-all ${
                    v ? `${row.color} scale-100` : `${row.soft} scale-90 opacity-60 hover:opacity-100`
                  } ${i % 4 === 0 ? "ring-1 ring-line" : ""}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* live code readout */}
      <div className="mt-6 rounded-xl bg-bg-soft/80 p-4">
        <p className="font-mono mb-2 text-[10px] tracking-[0.25em] text-muted">
          YOUR GRID, WRITTEN AS LIVE CODE — THIS IS REAL STRUDEL NOTATION
        </p>
        <pre className="font-mono overflow-x-auto text-[12px] leading-relaxed text-ink">
{`s("${toMini(p.kick, "bd")},
   ${toMini(p.snare, "sd")},
   ${toMini(p.hat, "hh")}")`}
        </pre>
        <p className="font-hand mt-3 -rotate-1 text-[15px] text-pink">
          every square you click edits this code. that&apos;s all live-coded music is ✨
        </p>
      </div>
    </div>
  );
}
