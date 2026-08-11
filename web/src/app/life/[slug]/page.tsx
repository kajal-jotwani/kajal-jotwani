import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLifePost, getLifePosts } from "@/lib/life";
import { chladni } from "@/lib/chladni";
import ChladniBg from "@/components/ChladniBg";
import { site } from "@/lib/content";
import JsonLd from "@/components/JsonLd";
import { blogPostingSchema, pageMeta } from "@/lib/seo";

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
  if (!post) return { title: site.meta.title, description: site.meta.description };

  return pageMeta({
    title: post.title,
    description: post.snippet,
    path: `/life/${post.slug}`,
    publishedTime: post.date ? new Date(post.date).toISOString() : undefined,
  });
}

export default async function LifePostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getLifePost(slug);
  if (!post) notFound();

  // this post's sand figure — same seed every build, unique to this post
  const art = chladni(post.slug);

  return (
    <>
      <JsonLd schema={blogPostingSchema(post)} />
      <ChladniBg params={art} />

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

        {/* the liner note for the figure behind you */}
        <footer className="mt-14 border-t border-line pt-6">
          <p className="font-mono text-[10px] tracking-[0.25em] text-muted">
            ABOUT THE SAND BEHIND THIS PAGE
          </p>
          <p className="mt-3 text-[14px] leading-relaxed text-muted">
            It&apos;s a{" "}
            <a
              href="https://en.wikipedia.org/wiki/Chladni_figure"
              target="_blank"
              rel="noreferrer"
              className="squiggle text-accent"
            >
              Chladni figure
            </a>
            : scatter sand on a metal plate, draw a violin bow across its edge, and the
            grains leap away from the vibrating regions to settle along the lines where
            the plate stays silent. Sound, made visible — Ernst Chladni toured Europe
            with this trick in 1787.
          </p>
          <p className="mt-3 text-[14px] leading-relaxed text-muted">
            When you opened this page, {art.n * 1000 + art.m > 0 ? "a few thousand" : ""}{" "}
            simulated grains did exactly that, jumping wherever{" "}
            <code className="font-mono text-[13px]">
              cos({art.n}πx)cos({art.m}πy) ± cos({art.m}πx)cos({art.n}πy)
            </code>{" "}
            was loud until they found its silence. This page hums in mode{" "}
            <span className="text-ink">
              ({art.n}, {art.m})
            </span>
            , seeded by the post&apos;s name — every post on this site strikes a different
            chord in the sand.
          </p>
        </footer>
      </article>
    </>
  );
}
