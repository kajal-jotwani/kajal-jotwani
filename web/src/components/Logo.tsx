/** The mark: five centered pills — the same "sound made visible" idea the
 *  footer waveform and the project cards use, shrunk to a monogram.
 *  Bars inherit currentColor; the tall middle one carries the accent, so it
 *  matches the dot in "kajal." on either theme. */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden>
      <rect x="1" y="11" width="4" height="10" rx="2" opacity="0.55" />
      <rect x="7.5" y="8" width="4" height="16" rx="2" opacity="0.8" />
      <rect x="14" y="4" width="4" height="24" rx="2" className="fill-accent" />
      <rect x="20.5" y="9.5" width="4" height="13" rx="2" opacity="0.8" />
      <rect x="27" y="12.5" width="4" height="7" rx="2" opacity="0.55" />
    </svg>
  );
}
