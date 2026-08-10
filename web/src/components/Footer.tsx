import Link from "next/link";
import { site } from "@/lib/content";
import { waveformBars } from "@/lib/seeded";

export default function Footer() {
  const bars = waveformBars(site.identity.name, 96);
  return (
    <footer className="border-t border-line">
      {/* the site's "outro" waveform */}
      <svg viewBox="0 0 384 32" className="h-8 w-full opacity-30" aria-hidden>
        {bars.map((b, j) => (
          <rect
            key={j}
            x={j * 4}
            y={16 - b * 14}
            width={2.2}
            height={Math.max(1.5, b * 28)}
            rx={1}
            className="fill-accent"
            opacity={0.3 + b * 0.7}
          />
        ))}
      </svg>
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-5 py-10 text-center">
        <p className="font-hand text-lg">{site.footer.line}</p>
        <p className="font-mono text-[11px] tracking-widest text-muted">
          {site.footer.smallPrint}
        </p>
        <Link
          href="/play"
          className="squiggle font-mono mt-2 text-[12px] lowercase tracking-widest text-accent"
        >
          {site.footer.playHint}
        </Link>
      </div>
    </footer>
  );
}
