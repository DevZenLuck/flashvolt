import { useEffect, useId, useRef, useState } from "react";
import { Car, ChevronDown, Fuel, Zap } from "lucide-react";
import { isEV } from "../utils/calculations";
import { fuelLabel } from "../utils/vehicles";

function TypeBadge({ type }) {
  if (type === "ev") {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-lime-light px-1.5 py-0.5 text-xs font-semibold text-green-800">
        <Zap className="h-3 w-3" aria-hidden="true" />
        EV
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded bg-navy/10 px-1.5 py-0.5 text-xs font-semibold text-navy">
      <Fuel className="h-3 w-3" aria-hidden="true" />
      {fuelLabel(type)}
    </span>
  );
}

/**
 * Accessible custom dropdown populated from the local vehicle data file.
 * Shows "Brand Model" plus a small type badge, like a dealership selector.
 */
export default function VehicleSelector({
  label,
  options,
  value,
  onChange,
  hint,
  id,
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const autoId = useId();
  const listId = id || `${autoId}-select`;

  const selectedIndex = options.findIndex((o) => o.id === value?.id);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // keep the active option visible inside the scrollable list
  useEffect(() => {
    if (open && listRef.current) {
      const el = listRef.current.querySelector(`[data-index="${activeIndex}"]`);
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [open, activeIndex]);

  const pick = (index) => {
    if (options[index]) {
      onChange(options[index]);
      setOpen(false);
    }
  };

  const onButtonKeyDown = (e) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
        setOpen(true);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(options.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pick(activeIndex);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="w-full">
      <label
        id={`${listId}-label`}
        htmlFor={listId}
        className="mb-1.5 block text-sm font-semibold text-navy"
      >
        {label}
      </label>
      <button
        id={listId}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${listId}-label`}
        aria-controls={`${listId}-list`}
        className="flex w-full items-center justify-between gap-3 rounded-lg border border-navy/15 bg-white px-4 py-3 text-left shadow-card transition-colors hover:border-navy/30 focus:border-lime focus:outline-none focus:ring-2 focus:ring-lime/60"
      >
        {value ? (
          <span className="flex min-w-0 items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-navy/5">
              {isEV(value) ? (
                <Zap className="h-4 w-4 text-lime" aria-hidden="true" />
              ) : (
                <Car className="h-4 w-4 text-navy/60" aria-hidden="true" />
              )}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-navy">
                {value.brand}
              </span>
              <span className="block truncate text-sm text-navy/60">
                {value.model}
                {value.variant ? ` · ${value.variant}` : ""}
              </span>
            </span>
          </span>
        ) : (
          <span className="text-sm text-navy/45">Select a vehicle…</span>
        )}
        <span className="flex shrink-0 items-center gap-2">
          {value && <TypeBadge type={value.type} />}
          <ChevronDown
            className={`h-4 w-4 text-navy/50 transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </span>
      </button>

      {hint && <p className="mt-1.5 text-xs text-navy/55">{hint}</p>}

      {open && (
        <div
          id={`${listId}-list`}
          role="listbox"
          aria-labelledby={`${listId}-label`}
          aria-activedescendant={options[activeIndex] ? `${listId}-opt-${activeIndex}` : undefined}
          className="animate-fade-in z-30 mt-2 max-h-72 overflow-auto rounded-lg border border-navy/10 bg-white py-1.5 shadow-lift"
          ref={listRef}
        >
          {options.map((car, index) => {
            const active = index === activeIndex;
            const selected = car.id === value?.id;
            return (
              <div
                key={car.id}
                id={`${listId}-opt-${index}`}
                data-index={index}
                role="option"
                aria-selected={selected}
                onClick={() => pick(index)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 ${
                  active ? "bg-lime-light" : ""
                } ${selected ? "bg-navy/[0.04]" : ""}`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-navy">{car.brand}</span>
                  <span className="block truncate text-sm text-navy/60">
                    {car.model}
                    {car.variant ? ` · ${car.variant}` : ""}
                  </span>
                </span>
                <TypeBadge type={car.type} />
              </div>
            );
          })}
          {options.length === 0 && (
            <p className="px-4 py-3 text-sm text-navy/50">No vehicles available.</p>
          )}
        </div>
      )}
    </div>
  );
}