import { Info } from "lucide-react";

/** Subtle, low-emphasis note explaining estimate limitations. */
export default function InfoNote({ children, icon: Icon = Info, tone = "default" }) {
  const tones = {
    default: "bg-offwhite border-navy/8 text-navy/70",
    lime: "bg-lime-light border-lime/30 text-green-900",
    navy: "bg-navy/[0.04] border-navy/10 text-navy/70",
  };
  return (
    <div className={`flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm leading-relaxed ${tones[tone]}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-lime-dark" aria-hidden="true" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}