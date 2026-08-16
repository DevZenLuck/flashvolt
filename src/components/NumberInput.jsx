import { useId } from "react";

/**
 * Numeric field with an optional unit suffix ("km", "%", "₹/kWh").
 * Accepts raw text and reports parsed values upward; keeps typing flexible.
 */
export default function NumberInput({
  label,
  value,
  onChange,
  unit,
  placeholder,
  hint,
  prefix,
  min = 0,
  id,
  ariaLabel,
}) {
  const autoId = useId();
  const inputId = id || `${autoId}-num`;

  return (
    <div className="w-full">
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-semibold text-navy">
        {label}
      </label>
      <div
        className={`flex items-center rounded-lg border border-navy/15 bg-white shadow-card transition-colors focus-within:border-lime focus-within:ring-2 focus-within:ring-lime/60`}
      >
        {prefix && (
          <span className="shrink-0 pl-4 text-sm font-semibold text-navy/60">{prefix}</span>
        )}
        <input
          id={inputId}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          aria-label={ariaLabel || label}
          className="w-full min-w-0 bg-transparent px-4 py-3 text-sm text-navy placeholder:text-navy/35 focus:outline-none"
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
        {unit && (
          <span className="shrink-0 pr-4 text-sm font-medium text-navy/45">{unit}</span>
        )}
      </div>
      {min > 0 && <span className="sr-only">Minimum {min}</span>}
      {hint && <p className="mt-1.5 text-xs text-navy/55">{hint}</p>}
    </div>
  );
}