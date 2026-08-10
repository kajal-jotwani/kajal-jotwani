import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLifePost, getLifePosts } from "@/lib/life";
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
      {post.date && (
        <p className="font-mono mt-8 text-[12px] tracking-[0.2em] text-muted">
          {new Date(post.date)
            .toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
            .toUpperCase()}
        </p>
      )}
      <h1 className="font-display mt-3 text-4xl leading-tight sm:text-5xl">{post.title}</h1>
      <div className="prose-life mt-8" dangerouslySetInnerHTML={{ __html: post.html }} />
      <p className="font-hand mt-12 -rotate-1 text-lg text-pink">
        thanks for reading 🌸 — <Link href="/#chat" className="squiggle text-accent">say hi?</Link>
      </p>
    </article>
  );
}
