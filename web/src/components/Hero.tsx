import Image from "next/image";
import { site } from "@/lib/content";
import Reveal from "@/components/Reveal";
import Icon from "@/components/Icons";

export default function Hero() {
  const h = site.hero;
  const avatar = site.identity.avatar;
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

      <div className="flex flex-col-reverse items-start gap-8 md:flex-row md:items-center md:justify-between">
        <Reveal delay={80}>
          <h1 className="font-display text-[16vw] leading-[0.92] tracking-tight sm:text-8xl md:text-9xl">
            {h.headlineTop}
            <br />
            <span className="text-accent">{h.headlineBottom}</span>
          </h1>
        </Reveal>
        {avatar && (
          <Reveal delay={140}>
            <div className="relative shrink-0">
              <Image
                src={avatar}
                alt={site.identity.name}
                width={176}
                height={176}
                priority
                className="h-32 w-32 rotate-[-4deg] rounded-3xl border-4 border-bg-card object-cover shadow-[0_16px_40px_-16px_rgba(0,0,0,0.4)] transition-transform duration-300 hover:rotate-[2deg] hover:scale-105 sm:h-40 sm:w-40 md:h-44 md:w-44"
              />
              <span className="font-hand absolute -bottom-7 left-1/2 -translate-x-1/2 rotate-[-3deg] whitespace-nowrap text-base text-pink">
                hi, that&apos;s me ↑
              </span>
            </div>
          </Reveal>
        )}
      </div>

      <Reveal delay={160}>
        <p className="mt-8 max-w-xl text-lg font-medium leading-relaxed">{h.roleLine}</p>
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
        <div className="mt-12 flex flex-wrap gap-3">
          {site.socials.map((s) => (
            <a
              key={s.label}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-2.5 rounded-full border border-line bg-bg-card/70 px-4 py-2.5 text-[13px] font-semibold text-muted transition-all hover:-translate-y-0.5 hover:border-accent hover:text-accent"
            >
              <Icon name={s.icon ?? s.label} className="h-[18px] w-[18px]" />
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
