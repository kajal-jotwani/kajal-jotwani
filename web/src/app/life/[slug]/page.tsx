import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLifePost, getLifePosts } from "@/lib/life";
import TerrainBg from "@/components/TerrainBg";
import PostStats from "@/components/PostStats";
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
    <>
      {/* this post's terrain — seeded by its name, drawn once, forever still */}
      <TerrainBg seed={post.slug} />

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

        <PostStats slug={post.slug} />

        {/* the map legend */}
        <footer className="mt-14 border-t border-line pt-6">
          <p className="font-mono text-[10px] tracking-[0.25em] text-muted">
            ABOUT THE MAP BEHIND THIS PAGE
          </p>
          <p className="mt-3 text-[14px] leading-relaxed text-muted">
            It&apos;s a topographic survey of a mountain range that doesn&apos;t exist.
            This post&apos;s name seeds a field of{" "}
            <a
              href="https://en.wikipedia.org/wiki/Perlin_noise"
              target="_blank"
              rel="noreferrer"
              className="squiggle text-accent"
            >
              fractal noise
            </a>{" "}
            — the same trick behind procedural worlds in games — which becomes the
            elevation. Then{" "}
            <a
              href="https://en.wikipedia.org/wiki/Marching_squares"
              target="_blank"
              rel="noreferrer"
              className="squiggle text-accent"
            >
              marching squares
            </a>{" "}
            traces the contour lines, high ground gets a faint wash of colour, and a few
            surveyor&apos;s marks note the elevations. Drawn once when the page opens,
            then perfectly still. Every post on this site maps a different terrain —
            this is <span className="text-ink">/{post.slug}</span>&apos;s.
          </p>
        </footer>
      </article>
    </>
  );
}
