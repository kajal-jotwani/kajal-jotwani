import { site } from "@/lib/content";
import Reveal from "@/components/Reveal";
import SectionTitle from "@/components/SectionTitle";

/** Org logos come straight from GitHub's avatar CDN — always current. */
function OrgLogo({ src, name, size = 40 }: { src: string; name: string; size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`${name} logo`}
      width={size}
      height={size}
      loading="lazy"
      className="rounded-xl border border-line bg-bg-card object-cover"
      style={{ width: size, height: size }}
    />
  );
}

export default function OpenSource() {
  const o = site.oss;
  const f = o.featured;

  return (
    <section data-section id="oss" className="mx-auto max-w-5xl px-5 py-24">
      <SectionTitle title={o.trackTitle} note={o.intro} />

      {/* featured: pixi */}
      <Reveal>
        <div className="rounded-2xl border border-line bg-bg-card/80 p-6 backdrop-blur-[2px] sm:p-8">
          <div className="flex flex-wrap items-center gap-4">
            <OrgLogo src={f.logo} name={f.name} size={52} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-3">
                <h3 className="font-display text-2xl">{f.name}</h3>
                <span className="font-mono text-[12px] lowercase tracking-widest text-muted">
                  {f.org}
                </span>
                <span className="rounded-full bg-accent-soft px-2.5 py-1 font-mono text-[11px] text-accent">
                  {f.lang}
                </span>
              </div>
              <p className="mt-1 text-[14px] leading-relaxed text-muted">{f.blurb}</p>
            </div>
            <a
              href={f.url}
              target="_blank"
              rel="noreferrer"
              className="squiggle font-mono text-[12px] lowercase tracking-widest text-accent"
            >
              repo ↗
            </a>
          </div>

          <div className="mt-6 space-y-3">
            {f.prs.map((pr) => (
              <a
                key={pr.id}
                href={pr.url}
                target="_blank"
                rel="noreferrer"
                className="group flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-xl border border-line bg-bg-soft/60 px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-accent/50"
              >
                <span className="font-mono text-[12px] text-accent">{pr.id}</span>
                <span className="text-[14px] font-semibold group-hover:text-accent">
                  {pr.title}
                </span>
                <span
                  className={`font-mono rounded-full px-2 py-0.5 text-[10px] lowercase tracking-widest ${
                    pr.state === "merged" ? "bg-green-soft text-green" : "bg-pink-soft text-pink"
                  }`}
                >
                  {pr.state}
                </span>
                <span className="w-full text-[13px] leading-relaxed text-muted">{pr.desc}</span>
              </a>
            ))}
          </div>
        </div>
      </Reveal>

      {/* the rest of the orgs */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {o.orgs.map((org, i) => (
          <Reveal key={org.name} delay={i * 60}>
            <a
              href={org.url}
              target="_blank"
              rel="noreferrer"
              className="group flex h-full items-start gap-4 rounded-2xl border border-line bg-bg-card/70 p-5 transition-all hover:-translate-y-0.5 hover:border-line-strong"
            >
              <OrgLogo src={org.logo} name={org.name} />
              <div className="min-w-0">
                <h4 className="font-display text-lg group-hover:text-accent">
                  {org.name}{" "}
                  <span className="text-muted transition-transform group-hover:translate-x-0.5">
                    ↗
                  </span>
                </h4>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">{org.blurb}</p>
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
