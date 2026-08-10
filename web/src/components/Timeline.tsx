"use client";

import { useState } from "react";
import { site, type ExperienceEntry } from "@/lib/content";
import { emit } from "@/lib/bus";
import Reveal from "@/components/Reveal";
import SectionTitle from "@/components/SectionTitle";

const accentText: Record<string, string> = {
  violet: "text-accent",
  pink: "text-pink",
  green: "text-green",
};
const accentChip: Record<string, string> = {
  violet: "bg-accent-soft text-accent",
  pink: "bg-pink-soft text-pink",
  green: "bg-green-soft text-green",
};
const accentBorder: Record<string, string> = {
  violet: "hover:border-accent/60",
  pink: "hover:border-pink/60",
  green: "hover:border-green/60",
};

/** hand-drawn curvy arrow connecting the steps of the journey */
function Arrow({ flip }: { flip: boolean }) {
  return (
    <div className={`my-1 flex justify-center ${flip ? "-scale-x-100" : ""}`} aria-hidden>
      <svg viewBox="0 0 120 64" className="h-14 w-28 text-muted/60">
        <path
          d="M18 6 C 55 10, 88 22, 84 52"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeDasharray="1 7"
        />
        <path
          d="M76 44 L 84 54 L 92 44"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function Step({ e, i }: { e: ExperienceEntry; i: number }) {
  const [open, setOpen] = useState(false);
  const left = i % 2 === 0;

  return (
    <Reveal delay={60}>
      <div className={`flex ${left ? "justify-start" : "justify-end"}`}>
        <div className={`relative w-full md:w-[68%] ${left ? "md:rotate-[-0.6deg]" : "md:rotate-[0.6deg]"}`}>
          {/* big playful step number */}
          <span
            aria-hidden
            className={`font-hand absolute -top-7 text-4xl ${left ? "-left-1 md:-left-8" : "-right-1 md:-right-8"} ${accentText[e.accent] ?? "text-accent"}`}
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <button
            onClick={() => {
              setOpen(!open);
              emit("plink", open ? 2 : 5);
            }}
            aria-expanded={open}
            className={`group w-full rounded-2xl border border-line bg-bg-card/80 p-5 text-left backdrop-blur-[2px] transition-all hover:-translate-y-1 hover:shadow-[0_14px_40px_-20px_rgba(0,0,0,0.3)] sm:p-6 ${accentBorder[e.accent] ?? ""}`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className={`font-mono text-[11px] tracking-[0.25em] ${accentText[e.accent] ?? "text-accent"}`}>
                {e.time.toUpperCase()}
              </span>
              <span className="font-mono text-[11px] text-muted transition-transform group-hover:translate-x-0.5">
                {open ? "− less" : "+ more"}
              </span>
            </div>
            <h3 className="font-display mt-2 text-xl sm:text-2xl">{e.title}</h3>
            <p className="font-mono mt-1 text-[12px] lowercase tracking-widest text-muted">{e.org}</p>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">{e.short}</p>

            <div className={`liner ${open ? "open" : ""}`}>
              <div>
                <p className="mt-4 border-t border-line pt-4 text-[15px] leading-relaxed">{e.detail}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {e.tags.map((t) => (
                <span
                  key={t}
                  className={`rounded-full px-2.5 py-1 font-mono text-[11px] lowercase ${accentChip[e.accent] ?? "bg-accent-soft text-accent"}`}
                >
                  {t}
                </span>
              ))}
            </div>
          </button>
        </div>
      </div>
    </Reveal>
  );
}

export default function Timeline() {
  const ex = site.experience;
  const entries = ex.entries as ExperienceEntry[];
  return (
    <section data-section id="timeline" className="mx-auto max-w-5xl px-5 py-24">
      <SectionTitle title={ex.trackTitle} note={ex.intro} />
      <div className="space-y-2">
        {entries.map((e, i) => (
          <div key={e.id}>
            <Step e={e} i={i} />
            {i < entries.length - 1 && <Arrow flip={i % 2 === 1} />}
          </div>
        ))}
      </div>
      <Reveal>
        <p className="font-hand mt-10 rotate-1 text-center text-lg text-muted">
          …and the next chapter is loading ✦
        </p>
      </Reveal>
    </section>
  );
}
