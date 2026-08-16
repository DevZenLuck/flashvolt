import { useEffect, useRef, useState } from "react";

/**
 * Animate a number towards `target` with a light ease-out. Used for result
 * figures so the numbers roll into place instead of popping.
 */
export function useAnimatedNumber(target, duration = 650) {
  const [display, setDisplay] = useState(target);
  const currentRef = useRef(target);

  useEffect(() => {
    const from = currentRef.current;
    const diff = target - from;
    if (Math.abs(diff) < 0.0001) {
      setDisplay(target);
      currentRef.current = target;
      return;
    }
    const effDuration = Math.min(1000, Math.max(320, duration * Math.min(1, Math.abs(diff) / 120)));
    let raf;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / effDuration);
      const eased = 1 - Math.pow(1 - p, 3);
      const value = from + diff * eased;
      currentRef.current = value;
      setDisplay(value);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return display;
}

/** A span that renders an animated numeric value with a custom formatter. */
export function AnimatedNumber({ value, format, className }) {
  const animated = useAnimatedNumber(Number.isFinite(Number(value)) ? Number(value) : 0);
  return <span className={className} tabIndex="-1">{format(animated, value)}</span>;
}