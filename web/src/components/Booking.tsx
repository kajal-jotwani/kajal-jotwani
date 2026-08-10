import { site } from "@/lib/content";
import Reveal from "@/components/Reveal";

export default function Booking() {
  const b = site.booking;
  const hasCal = b.calLink.trim().length > 0;

  return (
    <Reveal delay={100}>
      <div className="flex h-full flex-col rounded-2xl border border-line bg-bg-card/70 p-6 sm:p-8">
        <h3 className="font-display text-2xl">{b.trackTitle}</h3>
        <p className="mt-2 flex-1 text-[14px] leading-relaxed text-muted">{b.intro}</p>
        <div className="mt-6">
          {hasCal ? (
            <a
              href={`https://cal.com/${b.calLink}`}
              target="_blank"
              rel="noreferrer"
              className="inline-block rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              {b.buttonLabel} ↗
            </a>
          ) : (
            <a
              href={`mailto:${site.identity.email}?subject=Let's chat!`}
              className="inline-block rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              {b.fallbackLabel} ✉
            </a>
          )}
        </div>
      </div>
    </Reveal>
  );
}
