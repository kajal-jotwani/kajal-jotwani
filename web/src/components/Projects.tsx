"use client";

import { useState } from "react";
import { site, type Project } from "@/lib/content";
import { waveformBars } from "@/lib/seeded";
import { emit, state } from "@/lib/bus";
import Reveal from "@/components/Reveal";
import SectionTitle from "@/components/SectionTitle";

const accentText: Record<string, string> = {
  violet: "text-accent",
  pink: "text-pink",
  green: "text-green",
};
const accentFill: Record<string, string> = {
  violet: "fill-accent",
  pink: "fill-pink",
  green: "fill-green",
};
const accentChip: Record<string, string> = {
  violet: "bg-accent-soft text-accent",
  pink: "bg-pink-soft text-pink",
  green: "bg-green-soft text-green",
};

function Clip({ p, i }: { p: Project; i: number }) {
  const [open, setOpen] = useState(false);
  const [grooving, setGrooving] = useState(false);
  const bars = waveformBars(p.name);

  const startGroove = () => {
    if (!state.soundOn) return;
    emit("beat:start", p.name);
    setGrooving(true);
  };
  const stopGroove = () => {
    emit("beat:stop");
    setGrooving(false);
  };

  return (
    <Reveal delay={i * 90} className="h-full">
      <article className="group flex h-full flex-col rounded-2xl border border-line bg-bg-card/70 p-6 backdrop-blur-[2px] transition-all hover:-translate-y-1 hover:border-line-strong hover:shadow-[0_12px_40px_-18px_rgba(0,0,0,0.25)]">
        {/* each project is an audio clip: its own seeded waveform AND its own
            drum groove — hover (or tap) to hear it, if ♪ is on */}
        <svg
          viewBox="0 0 192 40"
          role="button"
          aria-label={`play ${p.name}'s beat (turn sound on first)`}
          tabIndex={0}
          className={`mb-5 h-10 w-full cursor-pointer transition-opacity ${grooving ? "opacity-100" : "opacity-70 group-hover:opacity-95"}`}
          onMouseEnter={startGroove}
          onMouseLeave={stopGroove}
          onClick={() => (grooving ? stopGroove() : startGroove())}
        >
          {bars.map((b, j) => (
            <rect
              key={j}
              x={j * 4}
              y={20 - b * 18}
              width={2.2}
              height={Math.max(2, b * 36)}
              rx={1.1}
              className={`${accentFill[p.accent] ?? "fill-accent"} ${grooving ? "animate-pulse" : ""}`}
              opacity={0.35 + b * 0.65}
            />
          ))}
        </svg>

        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-2xl">{p.name}</h3>
          <span className={`font-mono text-[11px] tracking-widest ${accentText[p.accent] ?? "text-accent"}`}>
            {String(i + 1).padStart(2, "0")}
          </span>
        </div>
        <p className="mt-1 text-[15px] font-medium">{p.oneLiner}</p>
        <p className="mt-3 flex-1 text-[14px] leading-relaxed text-muted">{p.description}</p>

        <div className={`liner ${open ? "open" : ""}`}>
          <div>
            <div className="mt-4 rounded-xl bg-bg-soft/80 p-4">
              <p className="font-mono mb-2 text-[10px] tracking-[0.25em] text-muted">
                LINER NOTES — WHAT I DID
              </p>
              <p className="text-[14px] leading-relaxed">{p.myWork}</p>
              {p.links.length > 0 && (
                <div className="mt-3 flex gap-4">
                  {p.links.map((l) => (
                    <a
                      key={l.url}
                      href={l.url}
                      target="_blank"
                      rel="noreferrer"
                      className="squiggle font-mono text-[12px] lowercase tracking-widest text-accent"
                    >
                      {l.label} ↗
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {p.tags.map((t) => (
              <span
                key={t}
                className={`rounded-full px-2.5 py-1 font-mono text-[11px] lowercase ${accentChip[p.accent] ?? "bg-accent-soft text-accent"}`}
              >
                {t}
              </span>
            ))}
          </div>
          <button
            onClick={() => {
              setOpen(!open);
              emit("plink", open ? 1 : 6);
            }}
            aria-expanded={open}
            className="font-mono whitespace-nowrap text-[12px] lowercase tracking-widest text-muted transition-colors hover:text-ink"
          >
            {open ? "close ▴" : "liner notes ▾"}
          </button>
        </div>
      </article>
    </Reveal>
  );
}

export default function Projects() {
  const pr = site.projects;
  return (
    <section data-section id="work" className="mx-auto max-w-5xl px-5 py-24">
      <SectionTitle title={pr.trackTitle} note={pr.intro} />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {(pr.items as Project[]).map((p, i) => (
          <Clip key={p.id} p={p} i={i} />
        ))}
      </div>
    </section>
  );
}
