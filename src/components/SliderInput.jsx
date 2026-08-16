import { useId } from "react";

/**
 * Range slider with a live value read-out. Track highlights in FlashVolt lime,
 * styled so it does not clash with the rest of the interface.
 */
export default function SliderInput({ label, value, onChange, min = 0, max = 100, step = 1, unit = "%", id }) {
  const autoId = useId();
  const sliderId = id || `${autoId}-slider`;

  return (
    <div className="w-full">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={sliderId} className="text-sm font-semibold text-navy">
          {label}
        </label>
        <span className="rounded-md bg-lime-light px-2 py-0.5 text-sm font-bold tabular-nums text-green-900">
          {value}
          {unit}
        </span>
      </div>
      <input
        id={sliderId}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="fv-range w-full"
        style={{ "--fv-pct": `${((value - min) / (max - min)) * 100}%` }}
        aria-valuetext={`${value}${unit}`}
      />
      <div className="mt-1 flex justify-between text-xs text-navy/40">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}