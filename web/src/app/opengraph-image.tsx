import { ImageResponse } from "next/og";
import { site } from "@/lib/content";
import { waveformBars } from "@/lib/seeded";

/** The card people actually see when this site is pasted into Slack, X or
 *  LinkedIn. Dark theme, the site's own mark, and the waveform seeded by
 *  Kajal's name — the same one the footer draws. */
export const alt = site.meta.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#f2ede4";
const MUTED = "#9a90a8";
const ACCENT = "#a18aff";

export default function OpengraphImage() {
  const bars = waveformBars(site.identity.name, 64);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "#100d16",
          backgroundImage:
            "radial-gradient(900px 500px at 88% -10%, rgba(161,138,255,0.22), transparent 70%), radial-gradient(700px 420px at 0% 110%, rgba(255,122,184,0.14), transparent 70%)",
          color: INK,
        }}
      >
        {/* mark + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              width: 64,
              height: 64,
              borderRadius: 16,
              background: ACCENT,
            }}
          >
            {[26, 44, 18].map((h) => (
              <div
                key={h}
                style={{ width: 11, height: h, borderRadius: 6, background: "#100d16" }}
              />
            ))}
          </div>
          <div style={{ fontSize: 22, letterSpacing: 6, color: MUTED }}>
            {site.meta.siteUrl.replace(/^https?:\/\//, "").toUpperCase()}
          </div>
        </div>

        {/* the pitch */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 108, letterSpacing: -3, lineHeight: 1.05 }}>
            {site.identity.name}
          </div>
          <div style={{ display: "flex", marginTop: 18, fontSize: 34, color: MUTED }}>
            {site.identity.role} · {site.identity.subRole}
          </div>
          <div style={{ display: "flex", marginTop: 26, fontSize: 27, color: ACCENT }}>
            a portfolio you can press play on
          </div>
        </div>

        {/* the site's own waveform, seeded by her name */}
        <div style={{ display: "flex", alignItems: "center", height: 92, gap: 5 }}>
          {bars.map((b, i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: Math.max(4, Math.round(b * 88)),
                borderRadius: 4,
                background: ACCENT,
                opacity: 0.28 + b * 0.62,
              }}
            />
          ))}
        </div>
      </div>
    ),
    size,
  );
}
