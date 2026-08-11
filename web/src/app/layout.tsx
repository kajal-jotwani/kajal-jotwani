import type { Metadata, Viewport } from "next";
import "@fontsource-variable/fraunces/full.css";
import "@fontsource-variable/instrument-sans";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/shantell-sans";
import { site } from "@/lib/content";
import { url } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.meta.siteUrl),
  title: {
    default: site.meta.title,
    template: `%s — ${site.identity.name}`,
  },
  description: site.meta.description,
  authors: [{ name: site.identity.name, url: url("/") }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: url("/"),
    siteName: site.identity.name,
    locale: "en_US",
    title: site.meta.title,
    description: site.meta.description,
  },
  // no twitter:image — X falls back to og:image, which is generated already
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf7f0" },
    { media: "(prefers-color-scheme: dark)", color: "#100d16" },
  ],
  colorScheme: "light dark",
};

const themeInit = `(function(){try{var t=localStorage.getItem("kj-theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
