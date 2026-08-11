import type { Metadata } from "next";
import { site } from "@/lib/content";

/** One place for page metadata + structured data, so every page describes the
 *  same person to crawlers and nothing drifts out of sync with content.json. */

const BASE = site.meta.siteUrl.replace(/\/$/, "");
const PERSON_ID = `${BASE}/#person`;

export const url = (path = "/") => `${BASE}${path.startsWith("/") ? path : `/${path}`}`;

/** Shared metadata for a sub-page. Next replaces the parent's `openGraph`
 *  wholesale rather than merging it, so siteName/locale have to be repeated on
 *  every page — this is that repetition, written once. */
export function pageMeta(page: {
  title: string;
  description: string;
  path: string;
  publishedTime?: string;
}): Metadata {
  const title = `${page.title} — ${site.identity.name}`;
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: page.path },
    openGraph: {
      type: page.publishedTime ? "article" : "website",
      url: page.path,
      siteName: site.identity.name,
      locale: "en_US",
      title,
      description: page.description,
      ...(page.publishedTime
        ? { publishedTime: page.publishedTime, authors: [site.identity.name] }
        : {}),
    },
  };
}

export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: site.identity.name,
    url: url("/"),
    image: url(site.identity.avatar),
    email: `mailto:${site.identity.email}`,
    jobTitle: site.identity.role,
    description: site.meta.description,
    address: { "@type": "PostalAddress", addressCountry: site.identity.location },
    // sameAs wants profile pages, so the mailto: social is filtered out
    sameAs: site.socials.map((s) => s.url).filter((u) => u.startsWith("http")),
    knowsAbout: site.about.stack.map((s) => s.name),
    award: site.experience.entries.map((e) => `${e.title} — ${e.org}`),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": url("/#website"),
    url: url("/"),
    name: site.meta.title,
    description: site.meta.description,
    inLanguage: "en",
    author: { "@id": PERSON_ID },
    publisher: { "@id": PERSON_ID },
  };
}

export function blogPostingSchema(post: {
  slug: string;
  title: string;
  date: string;
  snippet: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.snippet,
    ...(post.date ? { datePublished: post.date, dateModified: post.date } : {}),
    author: { "@id": PERSON_ID },
    publisher: { "@id": PERSON_ID },
    inLanguage: "en",
    mainEntityOfPage: { "@type": "WebPage", "@id": url(`/life/${post.slug}`) },
    url: url(`/life/${post.slug}`),
    image: url("/opengraph-image"),
  };
}
