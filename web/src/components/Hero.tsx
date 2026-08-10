import { site } from "@/lib/content";
import Reveal from "@/components/Reveal";

export default function Hero() {
  const h = site.hero;
  return (
    <section
      data-section
      id="top"
      className="relative mx-auto flex min-h-[92svh] max-w-5xl flex-col justify-center px-5 pt-24 pb-16"
    >
      <Reveal>
        <p className="font-mono mb-6 flex items-center gap-2 text-[12px] tracking-[0.3em] text-muted">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-green" />
          {h.eyebrow.toUpperCase()}
        </p>
      </Reveal>

      <Reveal delay={80}>
        <h1 className="font-display text-[17vw] leading-[0.92] tracking-tight sm:text-8xl md:text-9xl">
          {h.headlineTop}
          <br />
          <span className="text-accent">{h.headlineBottom}</span>
        </h1>
      </Reveal>

      <Reveal delay={160}>
        <p className="mt-8 max-w-xl text-lg font-medium leading-relaxed">
          {h.roleLine}
        </p>
        <p className="mt-4 max-w-xl leading-relaxed text-muted">{h.paragraph}</p>
      </Reveal>

      <Reveal delay={240}>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          {h.ctas.map((cta) => (
            <a
              key={cta.href}
              href={cta.href}
              className={
                cta.kind === "primary"
                  ? "rounded-full bg-ink px-6 py-3 text-sm font-semibold text-bg transition-transform hover:-translate-y-0.5"
                  : "rounded-full border border-line-strong px-6 py-3 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
              }
            >
              {cta.label}
            </a>
          ))}
          <span className="font-hand hidden -rotate-2 text-base text-pink sm:inline-block">
            ↖ {h.marginNote}
          </span>
        </div>
      </Reveal>

      <Reveal delay={320}>
        <div className="mt-12 flex flex-wrap gap-5">
          {site.socials.map((s) => (
            <a
              key={s.label}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="squiggle font-mono text-[12px] lowercase tracking-widest text-muted hover:text-ink"
            >
              {s.label}
            </a>
          ))}
        </div>
      </Reveal>

      <div className="font-mono absolute bottom-6 left-5 hidden text-[11px] tracking-[0.25em] text-muted/70 md:block">
        SCROLL TO PERFORM ↓
      </div>
    </section>
  );
}
