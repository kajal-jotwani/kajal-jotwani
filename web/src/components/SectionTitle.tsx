export default function SectionTitle({
  title,
  note,
}: {
  title: string;
  note?: string;
}) {
  return (
    <div className="mb-12">
      <h2 className="font-display text-4xl tracking-tight sm:text-5xl">{title}</h2>
      {/* hand-drawn squiggle underline */}
      <svg viewBox="0 0 220 12" className="mt-3 h-3 w-52 text-accent" aria-hidden>
        <path
          d="M3 8 Q 20 2, 40 7 T 80 6 T 120 8 T 160 5 T 214 7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.85"
        />
      </svg>
      {note && <p className="font-hand mt-4 -rotate-1 text-lg text-muted">{note}</p>}
    </div>
  );
}
