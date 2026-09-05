"use client";

import { useEffect, useState } from "react";

/** A quiet little strip at the foot of a life note: a heart you can press and
 *  a count of how many people have read it.
 *
 *  Counts live server-side (see /api/life/[slug]); the browser only remembers
 *  whether *you* already liked or already counted as a read, so a refresh
 *  doesn't inflate anything. */

const VIEW_TTL = 12 * 60 * 60 * 1000; // one read per post per browser per 12h

export default function PostStats({ slug }: { slug: string }) {
  const [counts, setCounts] = useState<{ views: number; likes: number } | null>(null);
  const [liked, setLiked] = useState(false);
  const [pop, setPop] = useState(false);

  useEffect(() => {
    let alive = true;
    const likedKey = `life:liked:${slug}`;
    const viewKey = `life:viewed:${slug}`;

    setLiked(localStorage.getItem(likedKey) === "1");

    const last = Number(localStorage.getItem(viewKey) ?? 0);
    const fresh = Date.now() - last > VIEW_TTL;
    // stamp before the request so React's double-effect in dev can't double-count
    if (fresh) localStorage.setItem(viewKey, String(Date.now()));

    const req = fresh
      ? fetch(`/api/life/${slug}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "view" }),
        })
      : fetch(`/api/life/${slug}`);

    req
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => alive && d && setCounts(d))
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, [slug]);

  function toggleLike() {
    const next = !liked;
    setLiked(next);
    setCounts((c) => (c ? { ...c, likes: Math.max(0, c.likes + (next ? 1 : -1)) } : c));
    if (next) {
      setPop(true);
      setTimeout(() => setPop(false), 320);
    }
    localStorage.setItem(`life:liked:${slug}`, next ? "1" : "0");

    fetch(`/api/life/${slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: next ? "like" : "unlike" }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setCounts(d))
      .catch(() => {});
  }

  const n = (v: number | undefined) => (v == null ? "—" : v.toLocaleString("en-US"));

  return (
    <div className="mt-12 flex items-center gap-4">
      <button
        onClick={toggleLike}
        aria-pressed={liked}
        aria-label={liked ? "unlike this note" : "like this note"}
        className={`group flex items-center gap-2 rounded-full border px-3.5 py-1.5 transition-colors ${
          liked
            ? "border-pink/50 bg-pink-soft text-pink"
            : "border-line text-muted hover:border-pink/40 hover:text-pink"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className={`h-3.5 w-3.5 transition-transform duration-300 ${
            pop ? "motion-safe:scale-150" : "scale-100"
          }`}
          fill={liked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 1 0-7.1 7.1l8.8 8.8 8.8-8.8a5 5 0 0 0 0-7.1z" />
        </svg>
        <span className="font-mono text-[12px] tabular-nums tracking-widest">
          {n(counts?.likes)}
        </span>
      </button>

      <span className="font-mono text-[11px] tracking-[0.2em] text-muted">
        <span className="tabular-nums">{n(counts?.views)}</span> READS
      </span>
    </div>
  );
}
