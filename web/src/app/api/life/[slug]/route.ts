import { NextResponse } from "next/server";
import { getLifePosts } from "@/lib/life";
import { bump, getCounts } from "@/lib/counters";

/** GET  /api/life/<slug>  → { views, likes }
 *  POST /api/life/<slug>  { action: "view" | "like" | "unlike" } → { views, likes }
 *
 *  The slug has to match a real post, so nobody can spray junk keys into the
 *  store. Dedupe of views/likes is done client-side (localStorage) — this is a
 *  personal blog counter, not an ad network. */

export const dynamic = "force-dynamic";

function known(slug: string) {
  return getLifePosts().some((p) => p.slug === slug);
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!known(slug)) return NextResponse.json({ error: "unknown post" }, { status: 404 });
  try {
    return NextResponse.json(await getCounts(slug));
  } catch {
    return NextResponse.json({ views: 0, likes: 0 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!known(slug)) return NextResponse.json({ error: "unknown post" }, { status: 404 });

  const { action } = (await req.json().catch(() => ({}))) as { action?: string };

  try {
    if (action === "view") await bump(slug, "views");
    else if (action === "like") await bump(slug, "likes");
    else if (action === "unlike") await bump(slug, "likes", -1);
    else return NextResponse.json({ error: "bad action" }, { status: 400 });

    return NextResponse.json(await getCounts(slug));
  } catch {
    return NextResponse.json({ views: 0, likes: 0 });
  }
}
