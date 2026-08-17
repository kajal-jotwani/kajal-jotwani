import Image from "next/image";
import { site } from "@/lib/content";
import Reveal from "@/components/Reveal";
import Icon from "@/components/Icons";

function CalendarIcon({ className = "h-[18px] w-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="3" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

export default function Booking() {
  const b = site.booking;

  return (
    <Reveal delay={100}>
      <div className="flex h-full flex-col rounded-2xl border border-line bg-bg-card/70 p-6 sm:p-8">
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0">
            <h3 className="font-display text-2xl">{b.trackTitle}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-muted">{b.intro}</p>
          </div>
          {site.identity.avatar && (
            <Image
              src={site.identity.avatar}
              alt={site.identity.name}
              width={112}
              height={112}
              className="hidden h-24 w-24 shrink-0 rotate-2 rounded-2xl border-2 border-line object-cover shadow-[0_10px_30px_-14px_rgba(0,0,0,0.45)] transition-transform duration-300 hover:-rotate-2 hover:scale-105 sm:block"
            />
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={b.calUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2.5 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-bg transition-transform hover:-translate-y-0.5"
          >
            <CalendarIcon />
            {b.scheduleLabel}
          </a>
          <a
            href={`mailto:${site.identity.email}?subject=Let's build something together`}
            className="flex items-center gap-2.5 rounded-full border border-line-strong px-5 py-3 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
          >
            <Icon name="mail" className="h-[17px] w-[17px]" />
            {b.emailLabel}
          </a>
        </div>

        <div className="mt-auto pt-7">
          <p className="font-mono text-[10px] tracking-[0.25em] text-muted">
            {b.findMeOn.toUpperCase()}
          </p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {site.socials.map((s) => (
              <a
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                title={s.label}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-line text-muted transition-all hover:-translate-y-0.5 hover:border-accent hover:text-accent"
              >
                <Icon name={s.icon ?? s.label} className="h-[17px] w-[17px]" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
