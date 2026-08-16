import { Link } from "react-router-dom";
import {
  ArrowRight,
  BatteryCharging,
  Gauge,
  Route,
  Scale,
  Timer,
  Wallet,
  Zap,
} from "lucide-react";
import usePageMeta from "../hooks/usePageMeta";
import {
  chargingTimeHours,
  effectiveChargingPower,
  ELECTRICITY_RATE,
  evCostPerKm,
  planTrip,
  priceWithGst,
  TRIP_RESERVE_PERCENT,
  vehicleRange,
} from "../utils/calculations";
import { formatDurationReadable, formatNum } from "../utils/format";
import { getVehicle } from "../utils/vehicles";
import BatteryIndicator from "../components/BatteryIndicator";
import { Button } from "../components/Button";
import ChargingCurveChart from "../components/ChargingCurveChart";
import stationImg from "../assets/FlashVolt.png";

const MAPS_URL = "https://maps.app.goo.gl/hKDiEjbrWno7sN7z8";

const TOOLS = [
  {
    to: "/compare",
    icon: Scale,
    title: "EV vs Vehicle",
    desc: "Compare an EV against another EV, petrol or diesel — cost, cost per km and savings.",
    cta: "Start comparison",
  },
  {
    to: "/charge-needed",
    icon: BatteryCharging,
    title: "Charge Needed",
    desc: "Find out how much you need to charge to travel your required distance.",
    cta: "Check your charge",
  },
  {
    to: "/charging-time",
    icon: Timer,
    title: "Charging Time",
    desc: "Compare how long different charger powers take to charge your EV.",
    cta: "Compare chargers",
  },
  {
    to: "/trip-calculator",
    icon: Route,
    title: "Trip Cost",
    desc: "Estimate charging stops, charging time, energy usage and total trip cost.",
    cta: "Plan a trip",
  },
];

export default function Home() {
  usePageMeta(
    "FlashVolt — EV Charging Cost Calculator",
    "There is a FlashVolt calculator for every EV question. Compare EVs against petrol and diesel, see how much charge you need, compare charging times and price a full trip — all from real vehicle data.",
  );

  // Real data, pulled from the local vehicle file for the live-estimate card.
  const nexon = getVehicle("tata-nexon-ev-1");
  const price = ELECTRICITY_RATE;
  const cpm = evCostPerKm(nexon, priceWithGst(price));
  const range = vehicleRange(nexon);

  // Live-computed sample trip so the CTA card shows real, honest numbers.
  const sampleTrip = planTrip(nexon, 1400, 90, 80, priceWithGst(price));
  const sampleChargeH = chargingTimeHours(
    sampleTrip.totalCharged,
    effectiveChargingPower(120, nexon.maxChargingPower),
    TRIP_RESERVE_PERCENT,
    80,
  );

  // Live charging-curve preview for the EV Specs landing.
  const specPeak = Math.min(180, nexon.maxChargingPower || 180);
  const specCurves = [
    { label: `${specPeak} kW (Nexon EV)`, power: specPeak, color: "lime" },
    { label: "60 kW charger", power: 60, color: "navy" },
    { label: "180 kW charger", power: 180, color: "amber" },
  ];

  return (
    <>
      {/* 1 · Pick-a-tool landing (navy) — fills the first screen exactly */}
      <section className="flex h-[calc(100vh-4rem)] min-h-[calc(100vh-4rem)] flex-col overflow-hidden bg-navy text-white">
        <div className="mx-auto flex w-full max-w-6xl min-h-0 flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10 lg:py-12">
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
            <div>
              <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-lime sm:text-xs">
                <Zap className="h-3.5 w-3.5" aria-hidden="true" />
                FlashVolt · EV calculators
              </p>
              <h1 className="font-display text-2xl font-bold leading-none tracking-tight text-white sm:text-3xl lg:text-4xl">
                Pick your tool.{" "}
                <span className="text-lime">Get your answer.</span>
              </h1>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-white/65 sm:text-right">
              Cost, charge, time and trips — live from real vehicle data.
            </p>
          </div>

          <div className="mt-5 grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-3 sm:mt-8 sm:gap-5">
            {TOOLS.map((t) => {
              const Icon = t.icon;
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className="group relative flex flex-col justify-between rounded-xl border border-white/10 bg-white p-4 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-lime hover:shadow-lift focus:outline-none focus:ring-2 focus:ring-lime sm:p-6"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="grid h-9 w-9 place-items-center rounded-lg bg-navy text-lime transition-transform duration-200 group-hover:scale-105 sm:h-10 sm:w-10">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <ArrowRight
                        className="h-5 w-5 -translate-x-1 text-navy/30 transition-all duration-200 group-hover:translate-x-0 group-hover:text-lime"
                        aria-hidden="true"
                      />
                    </div>
                    <h2 className="mt-3 font-display text-base font-semibold text-navy sm:mt-3.5 sm:text-xl">
                      {t.title}
                    </h2>
                    <p className="mt-1 min-h-[2.75em] text-[13px] leading-snug text-navy/60 line-clamp-2 sm:mt-1.5 sm:min-h-[3.2em] sm:text-[15px] sm:leading-relaxed">
                      {t.desc}
                    </p>
                  </div>
                  <p className="mt-3 mb-1 text-[13px] font-semibold text-lime-dark transition-colors group-hover:text-navy sm:mt-4 sm:mb-2 sm:text-sm">
                    {t.cta} <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2 · EV Specs (white) — same depth as the other tool sections */}
      <section className="bg-white text-navy">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:py-20">
          <div className="lg:col-span-7">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-navy/10 bg-offwhite px-3 py-1 text-xs font-semibold uppercase tracking-wide text-lime-dark">
              <Gauge className="h-3.5 w-3.5" aria-hidden="true" />
              EV Specs · every detail, one page
            </p>
            <h2 className="font-display text-3xl font-bold leading-[1.08] tracking-tight text-navy sm:text-4xl lg:text-[2.9rem]">
              Every EV, fully unpacked.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-navy/60 sm:text-lg">
              Pick any EV and see everything we know about it — battery, usable
              capacity, efficiency, range and charging power — plus a realistic
              charging-speed curve.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button as={Link} to="/vehicle" variant="primary">
                Explore EV Specs
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-navy/10 bg-offwhite p-6 shadow-card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-navy/45">
                    Live preview
                  </p>
                  <p className="mt-1 font-display text-lg font-semibold text-navy">
                    {nexon.brand} {nexon.model} · charging curve
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-lime-light px-2.5 py-1 text-xs font-bold text-lime-dark">
                  <Zap className="h-3.5 w-3.5" aria-hidden="true" />
                  {Math.min(180, nexon.maxChargingPower)} kW peak
                </span>
              </div>
              <div className="mt-4">
                <ChargingCurveChart
                    curves={specCurves}
                    maxKw={Math.max(specPeak, 180)}
                    vehicleMaxKw={nexon.maxChargingPower}
                    height={240}
                  />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 · CTA band (navy) — planned-trip preview */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-lime/30 bg-lime/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-lime">
              <Route className="h-3.5 w-3.5" aria-hidden="true" />
              Plan ahead · not on the roadside
            </p>
            <h2 className="font-display text-3xl font-bold leading-[1.08] tracking-tight sm:text-4xl lg:text-[2.9rem]">
              Are you planning a trip?
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
              Long drives need a plan — not guesswork. The Trip Planner breaks
              your route into charging stops, tells you how much energy each one
              needs, how long the stops take and exactly what it all costs.
            </p>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2">
              {[
                { icon: Route, title: "How many stops", desc: "Route checked against real range and a 10% safety reserve." },
                { icon: BatteryCharging, title: "How much to charge", desc: "Energy and state of charge planned for at each stop." },
                { icon: Timer, title: "How long it takes", desc: "Charging time per stop at the chargers your EV supports." },
                { icon: Wallet, title: "What it costs", desc: "Total trip energy cost at your electricity tariff." },
              ].map((f) => (
                <li key={f.title} className="flex gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/10 text-lime">
                    <f.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{f.title}</p>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-white/55">
                      {f.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button as={Link} to="/trip-calculator" variant="primary">
                Plan your trip
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button as={Link} to="/compare" variant="light">
                Compare running costs
              </Button>
            </div>
          </div>

          <div className="lg:justify-self-end">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white p-6 text-navy shadow-lift">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-navy/45">
                    Sample trip
                  </p>
                  <p className="mt-1 font-display text-xl font-semibold">Delhi → Mumbai</p>
                </div>
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-lime/15 text-lime-dark">
                  <Route className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>

              <p className="mt-2 text-sm text-navy/55">
                {nexon.brand} {nexon.model} · drive to 10% reserve, rapid-charge
                to 80%.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  { label: "Distance", value: "1,400 km" },
                  { label: "Charging stops", value: `${sampleTrip.stops}` },
                  { label: "Charging time", value: formatDurationReadable(sampleChargeH) },
                  { label: "Trip energy cost", value: `₹${formatNum(sampleTrip.totalCost, 0)}` },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg bg-offwhite px-3 py-3">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-navy/45">
                      {s.label}
                    </p>
                    <p className="mt-0.5 text-base font-bold tabular-nums text-navy">
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>

              <p className="mt-5 text-xs text-navy/40">
                Computed live from the FlashVolt vehicle database · ₹
                {formatNum(price, 0)}/kWh · incl. 18% GST
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4 · Know your EV (offwhite) — brand intro with a live estimate */}
      <section className="bg-offwhite text-navy">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:py-20">
          <div className="lg:col-span-7">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-navy/10 bg-offwhite px-3 py-1 text-xs font-semibold uppercase tracking-wide text-lime-dark">
              <Zap className="h-3.5 w-3.5" aria-hidden="true" />
              Know your EV · know your cost
            </p>
            <h2 className="font-display text-3xl font-bold leading-[1.08] tracking-tight text-navy sm:text-4xl lg:text-[2.9rem]">
              Know your EV. Know your cost.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-navy/60 sm:text-lg">
              Calculate charging costs, charging time and trip expenses for your
              EV — all in one place. Pick a vehicle, enter a distance, and get an
              instant, honest answer.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button as={Link} to="/compare" variant="primary">
                Compare Vehicles
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button as={Link} to="/charge-needed" variant="secondary">
                Calculate Charging
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-navy/10 bg-navy p-6 shadow-card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/45">
                    Live estimate
                  </p>
                  <p className="mt-1 font-display text-xl font-semibold text-white">
                    {nexon.brand} {nexon.model}
                  </p>
                </div>
                <span className="rounded-full bg-lime px-2.5 py-1 text-xs font-bold text-navy">
                  EV
                </span>
              </div>

              <div className="mt-6">
                <BatteryIndicator percent={72} size="lg" />
                <p className="mt-2 text-sm font-medium text-white/60">
                  <span className="text-lime">{formatNum(72, 0)}%</span> battery ·{" "}
                  {formatNum(range, 0)} km real-world range
                </p>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { label: "Cost / km", value: `₹${formatNum(cpm, 2)}` },
                  { label: "Efficiency", value: `${nexon.efficiency} km/kWh` },
                  { label: "Max charge", value: `${nexon.maxChargingPower} kW` },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg bg-white/5 px-3 py-2.5">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-white/45">
                      {s.label}
                    </p>
                    <p className="mt-0.5 text-sm font-bold tabular-nums text-lime">{s.value}</p>
                  </div>
                ))}
              </div>

              <p className="mt-5 text-xs text-white/40">
                Computed live from the FlashVolt vehicle database · ₹{formatNum(price, 0)}/kWh · incl. 18% GST
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5 · Principles strip (white) + station location */}
      <section className="border-y border-navy/5 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open the FlashVolt charging station location on Google Maps"
            className="mx-auto block w-fit"
          >
            <img
              src={stationImg}
              alt="FlashVolt charging station"
              className="w-full max-w-xs sm:max-w-sm"
              draggable={false}
            />
          </a>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Real vehicle data",
                desc: "Specs for EVs, petrol and diesel cars live in one local file — add a car and it appears throughout.",
              },
              {
                title: "Transparent math",
                desc: "Efficiency, capacity and price per km. Every number you see is computed, not inflated.",
              },
              {
                title: "Instant answers",
                desc: "Results update as you type — change distance or price, and cost, stops and time adjust immediately.",
              },
            ].map((f) => (
              <div key={f.title}>
                <h2 className="font-display text-base font-semibold text-navy">{f.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-navy/60">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}