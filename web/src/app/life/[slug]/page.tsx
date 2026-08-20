import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLifePost, getLifePosts } from "@/lib/life";
import RidgeArt from "@/components/RidgeArt";
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

  return (
    <article className="mx-auto max-w-2xl px-5 py-16">
      <Link
        href="/#notes"
        className="squiggle font-mono text-[12px] lowercase tracking-widest text-muted"
      >
        ← back to the portfolio
      </Link>

      {/* the post's masthead: its title, broadcast as a signal */}
      <figure className="mt-8 overflow-hidden rounded-2xl border border-line bg-bg-card/70">
        <RidgeArt seed={post.slug} title={post.title} />
        <figcaption className="border-t border-line px-4 py-2.5 font-mono text-[10px] tracking-[0.22em] text-muted">
          SIGNAL /{post.slug.toUpperCase()} · 24 SCANS · TITLE READ AS WAVEFORM
        </figcaption>
      </figure>

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

      {/* liner note for the masthead */}
      <footer className="mt-14 border-t border-line pt-6">
        <p className="font-mono text-[10px] tracking-[0.25em] text-muted">
          ABOUT THE ARTWORK UP TOP
        </p>
        <p className="mt-3 text-[14px] leading-relaxed text-muted">
          It&apos;s a ridgeline plot — the form made famous by the stacked radio trace of{" "}
          <a
            href="https://en.wikipedia.org/wiki/PSR_B1919%2B21"
            target="_blank"
            rel="noreferrer"
            className="squiggle text-accent"
          >
            CP1919
          </a>
          , the first pulsar ever discovered (you&apos;ve seen it on the{" "}
          <span className="text-ink">Unknown Pleasures</span> album cover). Here the signal
          isn&apos;t a star: it&apos;s this post&apos;s <span className="text-ink">title, read as a
          waveform</span> — each character sets a peak, each row echoes the broadcast with a
          little drift. Drawn as plain SVG, seeded by the post&apos;s name: every post
          transmits its own trace, and nothing on this page moves while you read.
        </p>
      </footer>
    </article>
  );
}
