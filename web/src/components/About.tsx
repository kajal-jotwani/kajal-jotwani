import { site } from "@/lib/content";
import Reveal from "@/components/Reveal";
import SectionTitle from "@/components/SectionTitle";
import Icon from "@/components/Icons";

export default function About() {
  const a = site.about;
  return (
    <section data-section id="about" className="mx-auto max-w-5xl px-5 py-24">
      <SectionTitle title={a.trackTitle} />
      <div className="grid gap-12 md:grid-cols-[3fr_2fr]">
        <Reveal>
          <div className="space-y-5 text-[17px] leading-relaxed">
            {a.paragraphs.map((p, i) => (
              <p key={i} className={i === 0 ? "" : "text-muted"}>
                {p}
              </p>
            ))}
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="space-y-8">
            <div>
              <h3 className="font-mono mb-3 text-[11px] tracking-[0.25em] text-muted">
                CURRENTLY
              </h3>
              <ul className="space-y-2">
                {a.currently.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-[15px]">
                    <span className="mt-1 text-green">▸</span> {c}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-mono mb-3 text-[11px] tracking-[0.25em] text-muted">
                OFF THE CLOCK
              </h3>
              <ul className="space-y-2">
                {a.funFacts.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[15px] text-muted">
                    <span className="mt-1 text-pink">♡</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>

      {/* stack marquee */}
      <Reveal delay={200}>
        <div className="marquee mt-16 overflow-hidden border-y border-line py-3" aria-label="tech stack">
          <div className="marquee-track flex w-max items-center gap-10">
            {[...a.stack, ...a.stack].map((s, i) => (
              <span
                key={i}
                className="flex items-center gap-2.5 font-mono text-[13px] lowercase tracking-widest text-muted transition-colors hover:text-ink"
              >
                <Icon name={s.icon} className="h-5 w-5 opacity-80" />
                {s.name}
              </span>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
