import { ImageResponse } from "next/og";

/** iOS home-screen icon. Same three-bar mark as icon.svg, but full-bleed —
 *  iOS applies its own rounded mask, so we must not round it ourselves. */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const BARS = [74, 130, 50];

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          background: "#6d4aff",
        }}
      >
        {BARS.map((h) => (
          <div
            key={h}
            style={{
              width: 32,
              height: h,
              borderRadius: 16,
              background: "#fbf7f0",
            }}
          />
        ))}
      </div>
    ),
    size,
  );
}
