export default function TrackLabel({
  n,
  title,
}: {
  n: number;
  title: string;
}) {
  return (
    <div className="mb-10 flex items-center gap-4">
      <span className="font-mono text-[11px] tracking-[0.25em] text-muted">
        TRACK {String(n).padStart(2, "0")}
      </span>
      <span className="h-px flex-1 bg-line" />
      <span className="font-hand text-lg text-accent">{title}</span>
    </div>
  );
}
