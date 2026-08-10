import fs from "fs";
import path from "path";
import { marked } from "marked";

/** On-site "life notes": drop a .md file into web/content/life/ with a tiny
 *  frontmatter block and it appears on the site. No CMS, no database. */

export interface LifePost {
  slug: string;
  title: string;
  date: string;
  snippet: string;
  html: string;
}

const DIR = path.join(process.cwd(), "content", "life");

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { meta: {}, body: raw };
  const meta: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx > 0) meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return { meta, body: raw.slice(m[0].length) };
}

export function getLifePosts(): LifePost[] {
  if (!fs.existsSync(DIR)) return [];
  const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".md"));
  const posts = files.map((f) => {
    const raw = fs.readFileSync(path.join(DIR, f), "utf8");
    const { meta, body } = parseFrontmatter(raw);
    const plain = body.replace(/[#>*_`\[\]!\(\)]/g, "").replace(/\s+/g, " ").trim();
    return {
      slug: f.replace(/\.md$/, ""),
      title: meta.title ?? f.replace(/\.md$/, ""),
      date: meta.date ?? "",
      snippet: meta.snippet ?? plain.slice(0, 150) + "…",
      html: marked.parse(body, { async: false }) as string,
    };
  });
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getLifePost(slug: string): LifePost | undefined {
  return getLifePosts().find((p) => p.slug === slug);
}
