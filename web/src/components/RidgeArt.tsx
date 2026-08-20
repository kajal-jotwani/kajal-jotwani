import { ridgelines } from "@/lib/ridgeline";

/**
 * The post's masthead artwork: its title, broadcast as a stacked signal trace.
 * Server-rendered SVG — ships as markup, never moves, costs no JavaScript.
 * Rows are drawn back-to-front with background fill so nearer ridges occlude
 * the ones behind, exactly like the CP1919 plot.
 */
export default function RidgeArt({ seed, title }: { seed: string; title: string }) {
  const art = ridgelines(seed, title);

  return (
    <svg
      viewBox={`0 0 ${art.width} ${art.height}`}
      className="block w-full"
      role="img"
      aria-label={`Generative signal artwork for “${title}” — the title's characters drawn as a stacked ridgeline trace`}
    >
      {art.rows.map((row, i) => (
        <g key={i}>
          {/* fill first so this ridge occludes the ones behind it */}
          <path
            d={`${row.d} L ${art.width} ${art.height} L 0 ${art.height} Z`}
            fill="var(--bg-card)"
            stroke="none"
          />
          <path
            d={row.d}
            fill="none"
            stroke={row.hot ? "var(--accent)" : "var(--ink)"}
            strokeOpacity={row.hot ? 0.9 : 0.55}
            strokeWidth={row.hot ? 1.4 : 1.1}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </g>
      ))}
    </svg>
  );
}
