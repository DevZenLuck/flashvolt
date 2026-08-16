import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Menu, X, Zap } from "lucide-react";
import Logo from "./Logo";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/compare", label: "Compare" },
  { to: "/charge-needed", label: "Charge Needed" },
  { to: "/charging-time", label: "Charging Time" },
  { to: "/trip-calculator", label: "Trip Calculator" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy/95 text-white backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo to="/" dark />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "bg-white/10 text-lime" : "text-white/80 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <NavLink
            to="/vehicle"
            className="hidden items-center gap-1.5 rounded-md bg-lime px-4 py-2 text-sm font-semibold text-navy transition-colors hover:bg-lime-bright sm:inline-flex"
          >
            <Zap className="h-4 w-4" aria-hidden="true" />
            EV Specs
          </NavLink>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-md text-white transition-colors hover:bg-white/10 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-white/10 bg-navy md:hidden">
          <nav className="mx-auto max-w-6xl px-4 py-3" aria-label="Mobile">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  `block rounded-md px-3 py-3 text-base font-medium ${
                    isActive ? "bg-white/10 text-lime" : "text-white/85 hover:bg-white/5"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <NavLink
              to="/vehicle"
              className="mt-2 flex items-center justify-center gap-1.5 rounded-md bg-lime px-4 py-3 text-base font-semibold text-navy"
            >
              <Zap className="h-4 w-4" aria-hidden="true" />
              EV Specs
            </NavLink>
          </nav>
        </div>
      )}
    </header>
  );
}