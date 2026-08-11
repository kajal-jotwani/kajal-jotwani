import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLifePost, getLifePosts } from "@/lib/life";
import { harmonograph } from "@/lib/harmonograph";
import HarmonographBg from "@/components/HarmonographBg";
import { site } from "@/lib/content";

export function generateStaticParams() {
  return getLifePosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getLifePost(slug);
  return {
    title: post ? `${post.title} — ${site.identity.name}` : site.meta.title,
    description: post?.snippet,
  };
}

export default async function LifePostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getLifePost(slug);
  if (!post) notFound();

  // this post's artwork — same seed every build, unique to this post
  const art = harmonograph(post.slug);
  const [a, b] = art.intervals;

  return (
    <>
      <HarmonographBg params={art} />

      <article className="relative mx-auto max-w-2xl px-5 py-16">
        <Link
          href="/#notes"
          className="squiggle font-mono text-[12px] lowercase tracking-widest text-muted"
        >
          ← back to the portfolio
        </Link>

        {post.date && (
          <p className="font-mono mt-8 text-[12px] tracking-[0.2em] text-muted">
            {new Date(post.date)
              .toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
              .toUpperCase()}
          </p>
        )}
        <h1 className="font-display mt-3 text-4xl leading-tight sm:text-5xl">{post.title}</h1>

        <div className="prose-life mt-8">
          <div dangerouslySetInnerHTML={{ __html: post.html }} />
        </div>

        <p className="font-hand mt-14 -rotate-1 text-lg text-pink">
          thanks for reading 🌸 —{" "}
          <Link href="/#chat" className="squiggle text-accent">
            say hi?
          </Link>
        </p>

        {/* the liner note for the drawing behind you */}
        <footer className="mt-14 border-t border-line pt-6">
          <p className="font-mono text-[10px] tracking-[0.25em] text-muted">
            ABOUT THE DRAWING BEHIND THIS PAGE
          </p>
          <p className="mt-3 text-[14px] leading-relaxed text-muted">
            It&apos;s a{" "}
            <a
              href="https://en.wikipedia.org/wiki/Harmonograph"
              target="_blank"
              rel="noreferrer"
              className="squiggle text-accent"
            >
              harmonograph
            </a>{" "}
            — a Victorian machine where two swinging pendulums hold a pen, and their
            sum traces one long, decaying line:{" "}
            <code className="font-mono text-[13px]">
              x(t) = Σ aᵢ·sin(fᵢt + φᵢ)·e
              <sup>−dᵢt</sup>
            </code>
            . This one is tuned to a{" "}
            <span className="text-ink">
              {a.name} ({a.label})
            </span>{" "}
            and a{" "}
            <span className="text-ink">
              {b.name} ({b.label})
            </span>
            .
          </p>
          <p className="mt-3 text-[14px] leading-relaxed text-muted">
            Those are musical intervals. A perfect fifth is the ratio 3:2 whether you
            hear it or draw it — consonance and symmetry turn out to be the same
            arithmetic. The shape is seeded by this post&apos;s name, so it belongs to
            this page and no other.
          </p>
        </footer>
      </article>
    </>
  );
}
