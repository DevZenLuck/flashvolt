import { Link } from "react-router-dom";
import { Info, Instagram } from "lucide-react";
import Logo from "./Logo";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/vehicle", label: "EV Specs" },
  { to: "/compare", label: "Compare" },
  { to: "/charge-needed", label: "Charge Needed" },
  { to: "/charging-time", label: "Charging Time" },
  { to: "/trip-calculator", label: "Trip Calculator" },
];

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo to="/" dark />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
              Smart tools for smarter EV journeys. Estimate charging costs,
              required charge, charging time and trip expenses — no sign-up, no
              guesswork.
            </p>
          </div>
          <nav className="md:col-span-4" aria-label="Footer">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-white/50">
              Tools
            </h2>
            <ul className="mt-4 space-y-2.5">
              {LINKS.filter((l) => l.to !== "/").map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm text-white/75 transition-colors hover:text-lime"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="md:col-span-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-white/50">
              Home
            </h2>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link to="/" className="text-sm text-white/75 transition-colors hover:text-lime">
                  FlashVolt overview
                </Link>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/flashvolt.evcs/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-white/75 transition-colors hover:text-lime"
                >
                  <Instagram className="h-4 w-4" aria-hidden="true" />
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex items-start gap-2.5 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-xs leading-relaxed text-white/55">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-lime" aria-hidden="true" />
          <p>
            <span className="font-semibold text-white/75">Estimates only.</span>{" "}
            Actual range, energy consumption and charging time vary with driving
            speed, weather, road conditions, battery temperature, vehicle load
            and charging behaviour. DC fast-charging power typically drops as
            the battery nears a high state of charge, so real times are usually
            longer.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} FlashVolt. A demo EV decision tool.</p>
          <p>Running costs shown for India (₹).</p>
        </div>
      </div>
    </footer>
  );
}