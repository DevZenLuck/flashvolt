# FlashVolt — EV Cost & Charging Calculator

A fully frontend React + Vite + Tailwind application that answers the four
questions every EV owner asks, from a local vehicle data file — no backend,
no sign-up. Everything updates live as you type.

## Guided tour — how to use the website

### 1. Home (`/`)

The landing page is a tool picker. From the first screen you can jump into any
calculator. Scroll down and you'll find:

- **EV Specs** — a quick intro with a live charging-curve preview for the Tata
  Nexon.
- **Are you planning a trip?** — a summary of the Trip Calculator with a sample
  Delhi → Mumbai plan.
- **Know your EV** — a live estimate card (cost/km, efficiency, max charging
  power) for the Nexon.
- **Real vehicle data** — how the site works: local vehicle data, transparent
  math, instant answers.

The navbar's lime **EV Specs** button takes you straight to the full spec page.

### 2. EV Specs (`/vehicle`)

Pick any EV from the dropdown to see its complete spec sheet: gross/usable
battery, efficiency, claimed range, max DC charging, AC charging, connector,
seating and transmission. Below it, the **charging-speed curve** shows how fast
the battery accepts power from 0–100%. **Hover the chart** — a cursor line
follows your pointer and shows the kW the car actually accepts at that battery
percentage. Chargers faster than the car's limit are capped to the car's real
maximum.

### 3. Compare (`/compare`)

Pick two vehicles (EV vs EV, or EV vs petrol/diesel) and a daily commute. You
get the running cost per 100 km, cost per km, and the difference. For EVs the
charging cost is split into the base tariff and the GST (18%) row; the big
"Cost for trip" total is the real, GST-inclusive number.

### 4. Charge Needed (`/charge-needed`)

Enter how many km you still need to drive and your current battery %. FlashVolt
tells you the **units to charge**, the target battery % to reach, what that
costs, and how long it takes — while keeping a 10% reserve so you never plan to
arrive at 0%.

### 5. Charging Time (`/charging-time`)

Pick an EV, a charger power (30–180 kW) and a charging window. Times are
computed from a real **taper curve** — the battery accepts full power up to
~50%, then slows down, so topping up from 80→100% costs noticeably more time
than 10→80%.

### 6. Trip Calculator (`/trip-calculator`)

Plan a long drive: distance, starting battery, charger power and electricity
price. FlashVolt plans the route into charging stops, shows the charge %
at each stop (keeping a 15% safety reserve), the energy charged, the charging
time per stop and the total trip cost.

### Good to know

- **Prices**: per-litre (petrol/diesel) and per-kWh (EV) base prices, with 18%
  GST applied inside the calculations. Petrol/diesel hints are indicative
  numbers, not actual quotes.
- **Live prices** by state are loaded from `public/data/live-prices.json`.
- **Everything is an estimate** — real range, consumption and charging speed
  vary with driving style, weather and battery temperature.

## Tools at a glance

| Tool            | Route            | Answers                                          |
| --------------- | ---------------- | ------------------------------------------------ |
| EV vs Vehicle   | `/compare`       | EV vs EV / petrol / diesel cost, cost per km, savings |
| Charge Needed   | `/charge-needed` | How much charge, target battery %, cost, time     |
| Charging Time   | `/charging-time` | Charging time across 30–180 kW for a battery window |
| Trip Cost       | `/trip-calculator`| Stops, energy, charging time and total trip cost  |

## Getting started (for developers)

```bash
npm install
npm run dev       # start the dev server
npm run build     # production build to dist/
npm run test:calc # run the calculation engine's unit tests
```

Requires Node 18+.

## Project structure

```
src/
├── components/     # UI building blocks (Navbar, VehicleSelector, BatteryIndicator…)
├── pages/          # one file per route
├── data/cars.json  # all vehicle data (EVs, petrol, diesel)
├── utils/          # calculations.js (pure math) · format.js · vehicles.js · live-prices.js
├── hooks/          # useAnimatedNumber, usePageMeta
├── App.jsx         # router + shell
├── main.jsx
└── index.css       # Tailwind + FlashVolt tokens and slider styles
```

### Adding a vehicle

Append an object to `src/data/cars.json`, keyed by a lowercase `<brand>-<model>`
`id`. EVs use `batteryCapacity`, `efficiency` (km/kWh), `range` and
`maxChargingPower`; petrol/diesel use `fuelTankCapacity` and `fuelEfficiency`
(km/l). The calculator reads from this one file everywhere.

## Calculation model

- `energyRequired = distance / efficiency`
- `batteryEnergy = usableBatteryCapacity × percentage / 100`
- `chargingCost = energyCharged × electricityPrice`
- `effectiveChargingPower = min(chargerPower, vehicleMaxChargingPower)`
- `chargingTime` = integral of the charging taper curve (full power to ~50%
  SOC, then falling to ~60% of max at 80% and ~20% at 100%) — same energy takes
  more time at the top of the battery.

Trips use a drive-to-reserve / charge-to-target simulation with a 15% trip
reserve; Charge Needed keeps its own 10% reserve. Results are labelled as
estimates — real-world consumption and charging curves vary.

## Design

Deep Navy `#071D34` + Lime `#7CCB00` + White, with off-white work surfaces.
Calculations are kept as pure functions so more sophisticated models (charging
curves, weather-based range, live networks) can replace them later without
touching any UI.

## Follow FlashVolt

- Instagram: [@flashvolt.evcs](https://www.instagram.com/flashvolt.evcs/)
