import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import PageHeader from "./PageHeader";

/**
 * Shared layout for every calculator: a back-to-tools link, page header, then
 * an input panel beside live results. Stacks vertically on smaller screens,
 * two columns on desktop.
 */
export default function CalculatorLayout({
  eyebrow,
  title,
  description,
  inputPanel,
  results,
  asideExtra,
  compact,
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-navy/55 transition-colors hover:text-navy"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Pick a tool
      </Link>
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        compact={compact}
      />

      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-24">{inputPanel}</div>
          {asideExtra && <div className="mt-6">{asideExtra}</div>}
        </aside>

        <section className="min-w-0 lg:col-span-8" aria-live="polite">
          {results}
        </section>
      </div>
    </div>
  );
}