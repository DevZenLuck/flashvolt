# Project Summary

> **Status:** ⇌ steady state
> **Session:** resumed
> **Paused on:** verifying ChargeNeeded page changes via headless-browser QA (optional, see QA note below).
> **Verify:** `node scripts/calc.test.mjs` and `npm run build` — both currently pass.

## What this project is

FlashVolt — a Vite + React calculator app (Client-side SPA) for comparing ICE vehicle ownership costs vs. EVs in India (₹ INR). All calculation logic lives in **`src/utils/calculations.js`** — the wheels do **not** re-derive numbers; they consume the exported math. Vehicles are data-driven: raw rows live in **`src/data/cars.json`** (not `public/`); **add one entry there and pick it up everywhere automatically** via the normaliser in `src/utils/vehicles.js`.

**Routes:** Home (calculator picker) · EV Specs · Compare · EV Charging Cost · Charge Needed · Trip Calculator. Aggregated `liveData` (per-litre price `₹/L` for Petrol/Diesel/EVs) by state from `public/data/live-prices.json`. Big table at bottom of Home compares vehicle running costs per 100 km.

**Key utilities** (import paths in `src/utils/`):
- `calculations.js` — all math; exports `ELECTRICITY_RATE`, `GST_RATE`, `priceWithGst`, `evEnergyRequired`, `batteryEnergyKwh`, `evChargingCost`, `fuelCost`, `chargeWindowEnergy`, `chargerOptions`, `chargingTimeHours` (taper-aware), `chargeRecommendation`, `planTrip`, `vehicleRange`, `taperedPowerAt`, and constants `CHARGER_POWER_KWH` / `RESERVE_PERCENT` / `TRIP_RESERVE_PERCENT`.
- `src/utils/vehicles.js` — imports & normalises `src/data/cars.json` (499 vehicles; `type` is `ev`/`petrol`/`diesel`/`hybrid`/`cng`). Exports: `allVehicles`, `evVehicles`, `fuelVehicles`, `petrolVehicles`, `dieselVehicles`, `fuelLabel`, `getVehicle`. **There is no `vehicleMap` or `PRICE_HINTS` export** — don't call them.
- `src/utils/format.js` — `formatINR`, `formatNum`, `formatKwh`, `toNumber`.
- `src/utils/live-prices.js` — `loadLivePrices` (fetch + AggregateError), `getVariantField`, `getRegionPricing`, `getAllFuelPrices`.

**Important conventions / traps:**
- Vehicles must be keyed by **`id`** (always `<brand>-<model>` lowercased) — NOT `slug`, NOT `name`. Page defaults use IDs like `tata-nexon-ev-1`, `hyundai-creta`. **`id` is the data contract**; fix it if a vehicle won't select.
- **`price` is a "unit price"** (₹ per kWh / per L). GST is applied inside the math via `priceWithGst` — callers pass base price and the cost already includes 18% GST. Petrol/diesel price hints are listed as indicative numbers per‑litre with a note that they are not actual quotes.
- **Do not hardcode `₹`-symbol + `formatINR` together** — `formatINR` already includes the ₹ symbol (use only for currency; `formatKwh` for kWh; `formatNum` for plain numbers).
- `formatNum(n, 0)` = rounded integer; `formatKwh(n)` auto-chossr kW (‖kWh). `toNumber` strips commas/whitespace.
- **Range slider**: `.fv-range` styles the native `<input type="range">`; the lime fill (left portion, up to the thumb) is drawn from `--fv-pct` (set inline by `SliderInput`; defaults to 0%).
- Use `npm run build` to check compile. Run `node scripts/calc.test.mjs` after touching calculations to keep the math regression‑safe.
- Replit has **no npm exec path** → `npm run ...` must be run from the repo root.
- The machine cannot load backgrounded tabs = headless‑browser QA has irregular results (see QA note).

## Things we paused / never got around to

- Verifying the ChargeNeeded page visually (slider fill, reserve text) — **optional**; build + unit tests pass (see QA note).
- App favicon still the default Vite icon (logo `.png` is in `public/` and works if added to `index.html`).
- Infinite-scroll pagination on the vehicle table was deferred.

## Charging data (market): MPgrates

| Charger | Type | Recommended | Notes |
|---|---|---|---|
| 30 kW | DC | ₹19–22/kWh | slow DC, budget option |
| 60 kW | DC | ₹24–26/kWh | most common fast charger |
| 90 kW | DC | ₹26–28/kWh | faster DC |
| 120 kW | DC | ₹27–30/kWh | used by OEMs; ccaveat: 800V may not be supported |
| 150 kW | DC | ₹28–30/kWh | public fast charging |
| 180 kW | DC | ₹30–32/kWh | HyperCharger speed |

*(EV tariff + GST at 18%; flat unit rate assumption. Same multiplier for all chargers — fine for a rough tool.)*

## Data (tier-1 vehicles)

| Name | Type | Battery | usb cap | efficiency (km/kWh) | range (km) | top charger (kW) | price hint |
|---|---|---|---|---|---|---|---|
| Tata Nexon EV 40.5 | EV | 40.5 kWh | 37.5 | 6.0 | 225 | 60 kW | `18.00 L` |
| MG Windsor EV | EV | 38 kWh | 34.9 | 7.9 | 331 | 80 kW | `13.50 L` |
| BYD Atto 3 (Advanced) | EV | 49.9 kWh | 46.6 | 5.7 | 265 | 115 kW | `25.00 L` |
| Hyundai Ioniq 5 | EV | 72.6 kWh | 70.5 | 5.7 | 405 | 240 kW | `42.00 L` |
| Maruti Swift | Petrol | — | — | 24.8 km/l | — | — | `6.50 L` |
| Maruti Brezza | Petrol | — | — | 17.4 km/l | — | — | `8.00 L` |
| Hyundai Creta 1.5 MPi Petrol | Petrol | — | — | 17.4 km/l | — | — | `11.00 L` |
| Hyundai Creta 1.5 CRDi Diesel | Diesel | — | — | 21.1 km/l | — | — | `12.50 L` |
| Mahindra Scorpio-N Z8E    | Diesel | — | — | 17.9 km/l | — | — | `18.00 L` |
| Honda City | Petrol | — | — | 17.8 km/l | — | — | `12.00 L` |
| Kia Seltos 1.5 | Petrol | — | — | 17.0 km/l | — | — | `11.00 L` |
| Maruti Dzire | Petrol | — | — | 24.75 km/l | — | — | `7.00 L` |

**Newer data fields:** ev `chargeWindow` (20–80) % , `efficiency`, `ev.costPerKmPerKwh` (km per ₹); most cap `maxChargingPower`; diesel Marutis omitted (no diesel). EV top‑charger caps: Nexon 60, Windsor 80, Atto 3 115, Ioniq 5 240.

## Decisions & reasoning

**Why headless QA is unreliable here:** this machine cannot load backgrounded tabs. When starting a new background tab (`window.open(..., "_blank")` or a plain foreground click that open a background tab) the tab starts in a "blocked" state (about:blank) — scripts never run. The dedicated browser-automation skill was added but it belongs to the tests / was unreliable last time. Build + unit tests (`node scripts/calc.test.mjs`) go "green" reliably, so we rely on those. Best when you need to verify: **prefer build + unit tests over browser QA; if visual check needed, ask me / manually visit the dev server.** (Last session: a browser‑automation attempt failed on both "just check page" and full runs for known‑good code.)

**Why defaults live in `calculations.js`:** single source of truth for numbers used by live‑price hints, integrals everywhere, etc. `ELECTRICITY_RATE = 22`, `GST_RATE = 18` — update there, update hints, then Spot the new numbers in ⚡Speed with Compare chip… (was not fully batched — grep `ELECTRICITY_RATE` for touch points).

**Why `planTrip` keeps a 15% reserve and tops up the last leg:** arriving at 0% is unrealistic for a trip calculator — `TRIP_RESERVE_PERCENT = 15` (a "safety buffer"). Every stop charges back to the target **except the last one**, which only tops up what the final leg needs so you land exactly on the reserve — no wasted kWh/cost on surplus battery. `chargeRecommendation` (Charge Needed page) uses its own 10% reserve (`RESERVE_PERCENT`); keep the two constants distinct.

**Why charging time uses a taper curve, not a flat rate:** EVs don't charge linearly — power holds until ~50% SOC then falls to ~60% of max at 80% and ~20% at 100% (calibrated average across NMC/LFP packs; real curves vary by chemistry/voltage/OEM). `chargingTimeHours(energyKwh, powerKw, socFrom, socTo)` integrates that curve in 1% steps, so the same energy costs more time at the top of the battery. `chargerOptions(car, energyKwh, socFrom, socTo)` threads the window through (defaults 0→100%). Callers pass real windows: ChargingTime (current→target), ChargeNeeded (current→targetPct), Trip (15%→target). `taperedPowerAt(soc, power)` is the exported curve helper.

**Why Solar/UPS pages are skipped:** CSP abuse, correct on all OS, but that's not our road to travel now.

## How the build works

- Node+React SPA. Vite dev (`npm run dev`); **build = `npm run build`** (works from repo root, produces `dist/`).
- Vehicle tables are data‑driven from `src/data/cars.json`.
- Live prices loaded from `public/data/live-prices.json` and expressed as ₹ per litre (India).

## Git state tips

**(pre‑handoff check)** `git status` → edits pending:
- `src/pages/Compare.jsx` — EV cost cards split **charging cost into base + a separate "GST (18%)" row** (`+ ₹X`); the big "Cost for trip" total stays GST-inclusive.
- `src/pages/ChargeNeeded.jsx` — results list now shows **"Units to charge"** (extra kWh to charge) instead of full energy required; **10%‑reserve‑aware** recommendation (matches `planTrip`); SufficientView copy now promises arrival ≥ 10% reserve; InfoNote explains reserve + usable + charge to add; page description mentions reserve. Header uses compact layout; "Target battery" stat carries a "10% kept as reserve" sub-label.
- `src/pages/TripCalculator.jsx` — journey strip labels each stop as **"charge 15% → X%"** (reserve → target; last stop tops up to its own % instead of units); overview adds **Energy charged** (what you pay for) + **Stops needed** + **Charging time @ top kW**; validation & copy reference the 15% trip reserve.
- `src/pages/VehicleDetails.jsx` + `src/components/ChargingCurveChart.jsx` — **EV Specs** page (`/vehicle`): pick an EV, see the full spec sheet (battery, efficiency, range, DC/AC, connector, seating, transmission, data status) and an SVG **charging speed vs % curve** built from `taperedPowerAt`, plus 10→80% / 80→100% / 10→100% times at the car's top charger. Navbar/Footer link to it; Home has a banner button above the pick-a-tool grid (grid stays 2×2 with 4 tool cards).
- `src/components/PageHeader.jsx` + `src/components/CalculatorLayout.jsx` — `compact` prop shrinks the hero (padding, title, description); all four calculator pages use it so their headers align (Home keeps its own hero, not `compact`).
- `src/utils/calculations.js` — `chargeRecommendation` now reserves 10% (`reserveEnergy`), `additionalKwh` = required − usable-spendable. `planTrip` now reserves **15%** (`TRIP_RESERVE_PERCENT`) and tops up only what the final leg needs (`lastStopCharged` / `lastStopTargetPct`) so the trip ends on the reserve. `chargingTimeHours` **integrates a charging taper** (full to 50%, →60% at 80%, →20% at 100%) in 1% steps; `chargerOptions`/`chargingTimeHours` take an optional SOC window (default 0→100%).
- `src/components/SliderInput.jsx` + `src/index.css` — `.fv-range` lime fill (left portion) via `--fv-pct`.
- `scripts/calc.test.mjs` — updated to assert the reserve‑aware `additionalKwh` and the top-up-only last leg.

**(terminology)** "price" = per‑unit base (₹/kWh, ₹/L). "cost" = GST-inclusive total. Do not confuse them in copy.

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `node scripts/calc.test.mjs` — run the calculation regression tests