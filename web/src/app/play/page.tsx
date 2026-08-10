import Link from "next/link";
import type { Metadata } from "next";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: `the score — ${site.identity.name}`,
  description: "The live-codeable score behind the site. Edit it, break it, make it yours.",
};

export default function Play() {
  const code = site.play.strudelCode;
  const hash = Buffer.from(code, "utf-8").toString("base64");
  const url = `https://strudel.cc/#${encodeURIComponent(hash)}`;

  return (
    <div className="flex min-h-svh flex-col">
      <header className="mx-auto w-full max-w-5xl px-5 pb-6 pt-10">
        <Link
          href="/"
          className="squiggle font-mono text-[12px] lowercase tracking-widest text-muted"
        >
          ← back to the portfolio
        </Link>
        <h1 className="font-display mt-4 text-4xl sm:text-5xl">{site.play.title}</h1>
        <p className="mt-3 max-w-xl leading-relaxed text-muted">{site.play.intro}</p>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="squiggle font-mono mt-3 inline-block text-[12px] lowercase tracking-widest text-accent"
        >
          open in full strudel ↗
        </a>
      </header>
      <div className="mx-auto w-full max-w-5xl flex-1 px-5 pb-10">
        <iframe
          src={url}
          title="Strudel live-coding REPL with the site's score"
          className="h-[70svh] w-full rounded-2xl border border-line"
          allow="autoplay; midi"
        />
      </div>
    </div>
  );
}
