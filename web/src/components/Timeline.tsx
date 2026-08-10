"use client";

import { useEffect, useRef, useState } from "react";
import { site, type ExperienceEntry } from "@/lib/content";
import { emit } from "@/lib/bus";
import Reveal from "@/components/Reveal";
import TrackLabel from "@/components/TrackLabel";

const accentText: Record<string, string> = {
  violet: "text-accent",
  pink: "text-pink",
  green: "text-green",
};
const accentBg: Record<string, string> = {
  violet: "bg-accent",
  pink: "bg-pink",
  green: "bg-green",
};
const accentChip: Record<string, string> = {
  violet: "bg-accent-soft text-accent",
  pink: "bg-pink-soft text-pink",
  green: "bg-green-soft text-green",
};

function Entry({ e, i }: { e: ExperienceEntry; i: number }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: "-35% 0px -45% 0px" }
    );
    io.observe(ref.current!);
    return () => io.disconnect();
  }, []);

  return (
    <li ref={ref} className="relative pl-10 sm:pl-14">
      {/* node on the rail */}
      <span
        aria-hidden
        className={`absolute left-[7px] top-2 h-3 w-3 rounded-full border-2 border-bg transition-transform sm:left-[15px] ${
          accentBg[e.accent] ?? "bg-accent"
        } ${active ? "scale-125 node-active" : "opacity-70"}`}
      />
      <Reveal delay={i * 60}>
        <button
          onClick={() => {
            setOpen(!open);
            emit("plink", open ? 2 : 5);
          }}
          aria-expanded={open}
          className="group w-full rounded-2xl border border-line bg-bg-card/70 p-5 text-left backdrop-blur-[2px] transition-all hover:-translate-y-0.5 hover:border-line-strong sm:p-6"
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
          <p className="font-mono mt-1 text-[12px] lowercase tracking-widest text-muted">
            {e.org}
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">{e.short}</p>

          <div className={`liner ${open ? "open" : ""}`}>
            <div>
              <p className="mt-4 border-t border-line pt-4 text-[15px] leading-relaxed">
                {e.detail}
              </p>
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
      </Reveal>
    </li>
  );
}

export default function Timeline() {
  const ex = site.experience;
  return (
    <section data-section id="timeline" className="mx-auto max-w-5xl px-5 py-24">
      <TrackLabel n={3} title={ex.trackTitle} />
      <Reveal>
        <p className="font-hand mb-10 -rotate-1 text-lg text-muted">{ex.intro}</p>
      </Reveal>
      <div className="relative">
        {/* the rail — a dashed "tape track" */}
        <span
          aria-hidden
          className="absolute bottom-2 left-[12px] top-2 w-px border-l-2 border-dashed border-line sm:left-[20px]"
        />
        <ul className="space-y-6">
          {(ex.entries as ExperienceEntry[]).map((e, i) => (
            <Entry key={e.id} e={e} i={i} />
          ))}
        </ul>
      </div>
    </section>
  );
}
