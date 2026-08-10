import Link from "next/link";
import { site } from "@/lib/content";
import { getPosts } from "@/lib/blog";
import { getLifePosts } from "@/lib/life";
import Reveal from "@/components/Reveal";
import SectionTitle from "@/components/SectionTitle";
import Icon from "@/components/Icons";

export default async function Blog() {
  const b = site.blog;
  const { posts, live } = await getPosts();
  const life = getLifePosts();

  return (
    <section data-section id="notes" className="mx-auto max-w-5xl px-5 py-24">
      <SectionTitle title={b.trackTitle} note={b.intro} />

      <div className="grid gap-10 lg:grid-cols-2">
        {/* life notes — written on this site */}
        <div>
          <h3 className="font-hand mb-5 flex items-center gap-2 text-xl text-pink">
            life, documented here 🌱
          </h3>
          <div className="space-y-4">
            {life.map((p, i) => (
              <Reveal key={p.slug} delay={i * 70}>
                <Link
                  href={`/life/${p.slug}`}
                  className="group block rounded-2xl border border-line bg-bg-card/70 p-6 transition-all hover:-translate-y-0.5 hover:border-pink/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] tracking-[0.2em] text-muted">
                      {p.date
                        ? new Date(p.date)
                            .toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                            .toUpperCase()
                        : ""}
                    </span>
                    <span className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-pink">
                      →
                    </span>
                  </div>
                  <h4 className="font-display mt-3 text-xl leading-snug group-hover:text-pink">
                    {p.title}
                  </h4>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted">{p.snippet}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>

        {/* tech notes — on medium */}
        <div>
          <h3 className="font-hand mb-5 flex items-center gap-2 text-xl text-accent">
            tech, on medium <Icon name="medium" className="h-5 w-5" />
          </h3>
          <div className="space-y-4">
            {posts.slice(0, 4).map((p, i) => (
              <Reveal key={p.link} delay={i * 70}>
                <a
                  href={p.link}
                  target="_blank"
                  rel="noreferrer"
                  className="group block rounded-2xl border border-line bg-bg-card/70 p-6 transition-all hover:-translate-y-0.5 hover:border-accent/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] tracking-[0.2em] text-muted">
                      {p.date ? p.date.toUpperCase() : "ON MEDIUM"}
                    </span>
                    <span className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent">
                      ↗
                    </span>
                  </div>
                  <h4 className="font-display mt-3 text-xl leading-snug group-hover:text-accent">
                    {p.title}
                  </h4>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted">{p.snippet}</p>
                </a>
              </Reveal>
            ))}
          </div>
          <Reveal delay={200}>
            <div className="mt-6 flex items-center gap-3">
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
        </div>
      </div>
    </section>
  );
}
