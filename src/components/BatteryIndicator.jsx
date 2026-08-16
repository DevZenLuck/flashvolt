import { Zap } from "lucide-react";

const SEGMENTS = 10;

/**
 * FlashVolt battery visualisation. Lime charge cells fill from the left and
 * animate on every change, mirroring the current state of charge.
 */
export default function BatteryIndicator({ percent, size = "md", className = "" }) {
  const filled = Math.max(0, Math.min(SEGMENTS, Math.round(((percent || 0) / 100) * SEGMENTS)));
  const big = size === "lg";

  return (
    <div className={className} aria-label={`Battery at ${Math.round(percent || 0)} percent`}>
      <div
        className={`flex items-stretch gap-1 rounded-md border-2 ${
          big ? "h-16 border-navy px-2 py-1.5" : "h-10 border-navy/25 px-1.5 py-1"
        }`}
      >
        {Array.from({ length: SEGMENTS }).map((_, i) => (
          <span
            key={i}
            className={`flex-1 rounded-sm transition-all duration-500 ${
              i < filled ? "bg-gradient-to-t from-lime to-lime-bright" : "bg-navy/10"
            } ${i === SEGMENTS - 1 ? "rounded-r-[3px]" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}

/** Compact battery read-out used in cards: icon + label + percentage. */
export function BatteryChip({ percent, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className="relative grid h-7 w-7 place-items-center rounded-full bg-lime-light">
        <Zap className="h-3.5 w-3.5 text-green-800" aria-hidden="true" />
      </span>
      <span className="text-sm">
        <span className="font-semibold text-navy">{Math.round(percent)}%</span>
        {label && <span className="ml-1.5 text-navy/55">{label}</span>}
      </span>
    </div>
  );
}