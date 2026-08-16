/**
 * Generic fill bar. Used for battery %, savings and the cost comparison
 * bars. Fills animate via a CSS transition on width.
 */
export default function ProgressBar({
  percent,
  color = "lime",
  className = "",
  showLabel,
  label,
}) {
  const pct = Math.max(0, Math.min(100, percent));
  const barColor =
    color === "lime"
      ? "bg-gradient-to-r from-lime to-lime-bright"
      : color === "navy"
        ? "bg-navy"
        : color === "soft"
          ? "bg-navy/15"
          : "bg-navy/25";
  return (
    <div className={className}>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-navy/10" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <p className="mt-1.5 text-sm font-medium text-navy/70">{label ?? `${Math.round(pct)}%`}</p>
      )}
    </div>
  );
}