import Link from "next/link";
import type { Metadata } from "next";
import { site } from "@/lib/content";
import PlayGround from "@/components/PlayGround";

export const metadata: Metadata = {
  title: `the studio — ${site.identity.name}`,
  description:
    "Make a beat in ten seconds, then live-code the real thing. No musical or coding experience required.",
};

const MISSIONS = [
  {
    n: "01",
    title: "press play",
    text: "Hit the ▶ button in the black window below. That's a whole band written in nine lines of code.",
  },
  {
    n: "02",
    title: "change one number",
    text: "Find gain(.9) and make it gain(.3). Press update (or Ctrl+Enter). The drums got quieter — you just live-coded.",
  },
  {
    n: "03",
    title: "break something",
    text: "Change \"kalimba\" to \"gm_music_box\", or add *2 after bd. Weird sounds are the point. Undo is Ctrl+Z.",
  },
];

export default function Play() {
  const code = site.play.strudelCode;
  const hash = Buffer.from(code, "utf-8").toString("base64");
  const url = `https://strudel.cc/#${encodeURIComponent(hash)}`;

  return (
    <div className="mx-auto max-w-5xl px-5 pb-16 pt-10">
      <Link
        href="/"
        className="squiggle font-mono text-[12px] lowercase tracking-widest text-muted"
      >
        ← back to the portfolio
      </Link>

      {/* part 1: the drum machine anyone can play */}
      <h1 className="font-display mt-6 text-4xl sm:text-6xl">the studio</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed">
        You don&apos;t need to know music. You don&apos;t need to know code.
        <span className="text-muted"> Click some squares, press play — you&apos;re making a beat in ten seconds.</span>
      </p>
      <p className="font-hand mt-3 -rotate-1 text-lg text-pink">
        step 1 — make a beat by clicking squares ↓
      </p>

      <div className="mt-6">
        <PlayGround />
      </div>

      {/* part 2: the real instrument */}
      <div className="mt-16">
        <h2 className="font-display text-3xl sm:text-4xl">now the real thing</h2>
        <p className="mt-3 max-w-2xl leading-relaxed text-muted">
          Below is <span className="text-ink font-medium">Strudel</span> — the actual instrument people play at{" "}
          <a
            className="squiggle text-accent"
            href="https://en.wikipedia.org/wiki/Algorave"
            target="_blank"
            rel="noreferrer"
          >
            algorave concerts
          </a>
          , where musicians write code live on stage and the crowd dances to it. The code inside is the
          score this site hums. Three tiny missions, no experience needed:
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {MISSIONS.map((m) => (
            <div key={m.n} className="rounded-2xl border border-line bg-bg-card/70 p-5">
              <span className="font-hand text-2xl text-accent">{m.n}</span>
              <h3 className="font-display mt-1 text-lg">{m.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">{m.text}</p>
            </div>
          ))}
        </div>

        <iframe
          src={url}
          title="Strudel live-coding REPL with the site's score"
          className="mt-6 h-[65svh] w-full rounded-2xl border border-line"
          allow="autoplay; midi"
        />
        <div className="mt-3 flex flex-wrap items-center gap-5">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="squiggle font-mono text-[12px] lowercase tracking-widest text-accent"
          >
            open in full strudel ↗
          </a>
          <a
            href="https://strudel.cc/workshop/getting-started/"
            target="_blank"
            rel="noreferrer"
            className="squiggle font-mono text-[12px] lowercase tracking-widest text-muted"
          >
            want more? strudel&apos;s free workshop ↗
          </a>
        </div>
      </div>
    </div>
  );
}
