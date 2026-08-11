import type { MetadataRoute } from "next";
import { getLifePosts } from "@/lib/life";
import { url } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getLifePosts();

  return [
    { url: url("/"), lastModified: posts.find((p) => p.date)?.date },
    { url: url("/play") },
    ...posts.map((p) => ({ url: url(`/life/${p.slug}`), lastModified: p.date })),
  ];
}
