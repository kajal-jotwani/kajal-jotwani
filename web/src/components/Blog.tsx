import { site } from "@/lib/content";
import { getPosts } from "@/lib/blog";
import Reveal from "@/components/Reveal";
import TrackLabel from "@/components/TrackLabel";

export default async function Blog() {
  const b = site.blog;
  const { posts, live } = await getPosts();

  return (
    <section data-section id="notes" className="mx-auto max-w-5xl px-5 py-24">
      <TrackLabel n={5} title={b.trackTitle} />
      <Reveal>
        <p className="font-hand mb-10 -rotate-1 text-lg text-muted">{b.intro}</p>
      </Reveal>

      <div className="grid gap-5 md:grid-cols-2">
        {posts.slice(0, 6).map((p, i) => (
          <Reveal key={p.link} delay={i * 70}>
            <a
              href={p.link}
              target="_blank"
              rel="noreferrer"
              className="group block h-full rounded-2xl border border-line bg-bg-card/70 p-6 transition-all hover:-translate-y-0.5 hover:border-line-strong"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] tracking-[0.2em] text-muted">
                  {p.date ? p.date.toUpperCase() : "ON MEDIUM"}
                </span>
                <span className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent">
                  →
                </span>
              </div>
              <h3 className="font-display mt-3 text-xl leading-snug group-hover:text-accent">
                {p.title}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">{p.snippet}</p>
            </a>
          </Reveal>
        ))}
      </div>

      <Reveal delay={200}>
        <div className="mt-8 flex items-center gap-3">
          <a
            href={b.mediumUrl}
            target="_blank"
            rel="noreferrer"
            className="squiggle font-mono text-[13px] lowercase tracking-widest text-accent"
          >
            all posts on medium ↗
          </a>
          {live && (
            <span className="font-mono flex items-center gap-1.5 text-[10px] tracking-widest text-muted">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-green" />
              LIVE FEED
            </span>
          )}
        </div>
      </Reveal>
    </section>
  );
}
