import { Link } from "react-router-dom";

/** FlashVolt lockup — bolt mark + wordmark. Renders as either a link or a div. */
export default function Logo({ to, dark = false, className = "" }) {
  const mark = (
    <span className="inline-flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-lg bg-white shadow-card">
        <img
          src={`${import.meta.env.BASE_URL}FlashVolt_logo.png`}
          alt="FlashVolt"
          className="h-full w-full object-contain"
          draggable={false}
        />
      </span>
      <span
        className={`font-display text-xl font-bold tracking-tight ${dark ? "text-white" : "text-navy"}`}
      >
        Flash<span className="text-lime">Volt</span>
      </span>
    </span>
  );

  if (to) {
    return (
      <Link to={to} className={`shrink-0 ${className}`} aria-label="FlashVolt home">
        {mark}
      </Link>
    );
  }
  return <span className={`shrink-0 ${className}`}>{mark}</span>;
}