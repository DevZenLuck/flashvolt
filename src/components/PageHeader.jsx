/**
 * Consistent page hero for every calculator: eyebrow, heading, short
 * explanation. Keeps each page scannable and lets users start instantly.
 * Pass `compact` to shrink it, e.g. for pages where the hero should not
 * dominate the top of the viewport.
 */
export default function PageHeader({ eyebrow, title, description, children, compact = false }) {
  return (
    <header
      className={compact ? "pt-4 pb-3 sm:pt-6 sm:pb-4" : "pt-10 pb-8 sm:pt-14 sm:pb-10"}
    >
      {eyebrow && (
        <p
          className={`text-xs font-semibold uppercase tracking-[0.18em] text-lime-dark ${
            compact ? "mb-1" : "mb-3"
          }`}
        >
          {eyebrow}
        </p>
      )}
      <h1
        className={`max-w-2xl font-display font-bold leading-tight tracking-tight text-navy ${
          compact ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl"
        }`}
      >
        {title}
      </h1>
      {description && (
        <p
          className={`max-w-2xl leading-relaxed text-navy/60 ${
            compact ? "mt-1.5 text-sm" : "mt-3 text-base"
          }`}
        >
          {description}
        </p>
      )}
      {children}
    </header>
  );
}