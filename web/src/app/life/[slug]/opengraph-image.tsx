import { ImageResponse } from "next/og";
import { getLifePost } from "@/lib/life";
import { contourPaths } from "@/lib/contours";
import { site } from "@/lib/content";

/** Share card for a blog post: the post's own terrain map, the same one the
 *  page draws — so a shared link carries the artwork with it. */
export const alt = "A note by Kajal Jotwani";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#f2ede4";
const MUTED = "#9a90a8";
const ACCENT = "#a18aff";

export default async function PostOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getLifePost(slug);
  const title = post?.title ?? "field notes";
  const paths = contourPaths(slug, size.width, size.height);
  const dateLabel = post?.date
    ? new Date(post.date)
        .toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
        .toUpperCase()
    : "FIELD NOTES";
  const byline = `${dateLabel}   ·   ${site.identity.name.toUpperCase()}`;

  // the terrain, baked into one data-URI image — satori renders <img> reliably,
  // where inline <svg> children trip it up
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size.width}" height="${size.height}" viewBox="0 0 ${size.width} ${size.height}">` +
    paths
      .map(
        (p) =>
          `<path d="${p.d}" fill="none" stroke="${p.index ? ACCENT : INK}" stroke-opacity="${
            p.index ? 0.42 : 0.16
          }" stroke-width="${p.index ? 1.6 : 1}"/>`,
      )
      .join("") +
    `</svg>`;
  const terrain = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 68px",
          background: "#100d16",
          color: INK,
          position: "relative",
        }}
      >
        {/* the post's terrain */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={terrain}
          alt=""
          width={size.width}
          height={size.height}
          style={{ position: "absolute", top: 0, left: 0 }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              width: 54,
              height: 54,
              borderRadius: 14,
              background: ACCENT,
            }}
          >
            {[22, 37, 15].map((h) => (
              <div key={h} style={{ width: 9, height: h, borderRadius: 5, background: "#100d16" }} />
            ))}
          </div>
          <div style={{ display: "flex", fontSize: 20, letterSpacing: 5, color: MUTED }}>
            {`${site.meta.siteUrl.replace(/^https?:\/\//, "").toUpperCase()} / LIFE`}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 76,
              lineHeight: 1.1,
              letterSpacing: -2,
              maxWidth: 980,
            }}
          >
            {title}
          </div>
          <div style={{ display: "flex", marginTop: 22, fontSize: 26, color: MUTED }}>
            {byline}
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 21, color: ACCENT }}>
          a terrain generated from this post&apos;s name
        </div>
      </div>
    ),
    size,
  );
}
