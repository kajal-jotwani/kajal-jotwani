import { site, type FallbackPost } from "@/lib/content";

export interface BlogPost {
  title: string;
  link: string;
  date: string;
  snippet: string;
}

function strip(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function pick(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  if (!m) return "";
  return m[1].replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, "$1").trim();
}

export async function getPosts(): Promise<{ posts: BlogPost[]; live: boolean }> {
  const fallback: BlogPost[] = (site.blog.fallbackPosts as FallbackPost[]) ?? [];
  try {
    const res = await fetch(`https://medium.com/feed/@${site.blog.mediumUser}`, {
      next: { revalidate: 3600 },
      headers: { "User-Agent": "Mozilla/5.0 (portfolio-rss-reader)" },
    });
    if (!res.ok) throw new Error(`feed ${res.status}`);
    const xml = await res.text();
    const items = xml.split(/<item>/i).slice(1, 7);
    const posts: BlogPost[] = items.map((raw) => {
      const dateRaw = pick(raw, "pubDate");
      const date = dateRaw
        ? new Date(dateRaw).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "";
      const body = pick(raw, "content:encoded") || pick(raw, "description");
      return {
        title: strip(pick(raw, "title")),
        link: pick(raw, "link").split("?")[0],
        date,
        snippet: strip(body).slice(0, 180) + "…",
      };
    });
    if (posts.length === 0) throw new Error("empty feed");
    return { posts, live: true };
  } catch {
    return { posts: fallback, live: false };
  }
}
