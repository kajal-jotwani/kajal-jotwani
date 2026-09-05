/** Tiny counter store for post views + likes.
 *
 *  Talks to Upstash Redis over its REST API — no SDK, no npm dependency, just
 *  fetch. If the two env vars aren't set (local dev, or before the Vercel
 *  integration is added) it quietly falls back to an in-process Map so the UI
 *  still works; those numbers just don't survive a restart. */

const URL_ = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

export const persistent = Boolean(URL_ && TOKEN);

/** dev-only stand-in for redis */
const memory = new Map<string, number>();

async function redis(...command: (string | number)[]): Promise<number> {
  const res = await fetch(URL_!, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`upstash ${res.status}`);
  const { result } = (await res.json()) as { result: unknown };
  return Number(result) || 0;
}

const key = (slug: string, kind: "views" | "likes") => `life:${slug}:${kind}`;

export interface Counts {
  views: number;
  likes: number;
}

export async function getCounts(slug: string): Promise<Counts> {
  if (!persistent) {
    return {
      views: memory.get(key(slug, "views")) ?? 0,
      likes: memory.get(key(slug, "likes")) ?? 0,
    };
  }
  const [views, likes] = await Promise.all([
    redis("GET", key(slug, "views")),
    redis("GET", key(slug, "likes")),
  ]);
  return { views, likes };
}

export async function bump(slug: string, kind: "views" | "likes", by = 1): Promise<number> {
  if (!persistent) {
    const k = key(slug, kind);
    const next = Math.max(0, (memory.get(k) ?? 0) + by);
    memory.set(k, next);
    return next;
  }
  return redis("INCRBY", key(slug, kind), by);
}
