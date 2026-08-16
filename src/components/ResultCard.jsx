import { AnimatedNumber } from "../hooks/useAnimatedNumber";

/** Small labelled stat used in result grids, e.g. "Energy required / 25.2 kWh". */
export function ResultStat({ label, value, sub, accent = false, format }) {
  return (
    <div className="rounded-lg bg-offwhite px-4 py-3.5">
      <p className="text-xs font-medium uppercase tracking-wide text-navy/50">{label}</p>
      {typeof value === "number" && !Number.isNaN(value) && format ? (
        <AnimatedNumber
          value={value}
          format={format}
          className={`mt-1 block text-xl font-bold tabular-nums ${
            accent ? "text-lime-dark" : "text-navy"
          }`}
        />
      ) : (
        <p className="mt-1 text-xl font-bold tabular-nums text-navy">{value}</p>
      )}
      {sub && <p className="mt-0.5 text-xs text-navy/50">{sub}</p>}
    </div>
  );
}

/** Key/value breakdown row: label on the left, value on the right. */
export function ResultRow({ label, value, muted, className = "" }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 py-2 ${className}`}>
      <span className={`text-sm ${muted ? "text-navy/50" : "text-navy/70"}`}>{label}</span>
      <span className="text-right text-sm font-semibold tabular-nums text-navy">{value}</span>
    </div>
  );
}

/** Section divider with an optional legend, used to group results. */
export function ResultSection({ title, children, id }) {
  return (
    <section id={id} className="animate-fade-up">
      {title && (
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-navy/50">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}