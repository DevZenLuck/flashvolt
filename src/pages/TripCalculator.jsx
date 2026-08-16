import { useMemo, useState } from "react";
import { AlertTriangle, Coffee, Flag, Pause, PlugZap, Route } from "lucide-react";
import usePageMeta from "../hooks/usePageMeta";
import { chargerOptions, CHARGER_POWERS, chargingTimeHours, ELECTRICITY_RATE, planTrip, priceWithGst, TRIP_RESERVE_PERCENT } from "../utils/calculations";
import { formatDurationReadable, formatINR, formatKwh, formatNum, toNumber } from "../utils/format";
import { evVehicles, getVehicle } from "../utils/vehicles";
import CalculatorLayout from "../components/CalculatorLayout";
import Card from "../components/Card";
import VehicleSelector from "../components/VehicleSelector";
import NumberInput from "../components/NumberInput";
import SliderInput from "../components/SliderInput";
import ChargingComparisonTable from "../components/ChargingComparisonTable";
import InfoNote from "../components/InfoNote";
import { ResultStat } from "../components/ResultCard";
import { AnimatedNumber } from "../hooks/useAnimatedNumber";

export default function TripCalculator() {
  usePageMeta(
    "EV Trip Cost Calculator | FlashVolt",
    "Plan an EV trip: charging stops, energy, charging time and total cost. Compare 30–180 kW chargers for any distance, respecting your vehicle's limits.",
  );

  const [evId, setEvId] = useState("tata-nexon-ev-1");
  const [distance, setDistance] = useState("700");
  const [start, setStart] = useState(80);
  const [target, setTarget] = useState(80);
  const [price, setPrice] = useState(String(ELECTRICITY_RATE));

  const ev = getVehicle(evId);

  const result = useMemo(() => {
    const d = toNumber(String(distance).trim());
    const p = toNumber(String(price).trim());

    const errors = [];
    if (!d || d <= 0 || !Number.isFinite(d)) errors.push("Please enter a valid distance.");
    if (!p || p <= 0 || !Number.isFinite(p))
      errors.push("Enter electricity price to calculate charging cost.");

    if (!ev || errors.length) return { ok: false, errors: errors.length ? errors : ["Select a vehicle."] };

    const plan = planTrip(ev, d, start, target, priceWithGst(p));
    const rows = chargerOptions(ev, plan.totalCharged > 0 ? plan.totalCharged : 1e-9, TRIP_RESERVE_PERCENT, target).map((o) => ({
      ...o,
      stops: plan.stops,
      energy: plan.totalCharged,
      cost: plan.totalCost,
    }));

    const topPower = ev.maxChargingPower > 0 ? Math.min(CHARGER_POWERS[CHARGER_POWERS.length - 1], ev.maxChargingPower) : CHARGER_POWERS[CHARGER_POWERS.length - 1];
    const chargeHours =
      plan.stops > 0
        ? chargingTimeHours(plan.totalCharged, topPower, TRIP_RESERVE_PERCENT, target)
        : 0;

    return { ok: true, plan, rows, d, topPower, chargeHours };
  }, [ev, distance, start, target, price]);

  return (
    <CalculatorLayout
      eyebrow="Trip Cost"
      compact
      title="Plan a trip in your EV."
      description="Enter a distance and your starting charge — FlashVolt works out charging stops, energy used, charging time and total cost, charger by charger."
      inputPanel={
        <Card className="space-y-6 p-6">
          <VehicleSelector
            label="Your EV"
            options={evVehicles}
            value={ev}
            onChange={(c) => setEvId(c.id)}
          />
          <NumberInput
            label="Total trip distance"
            value={distance}
            onChange={setDistance}
            unit="km"
            placeholder="e.g. 700"
          />
          <SliderInput
            label="Starting battery"
            value={start}
            onChange={setStart}
            min={0}
            max={100}
          />
          <SliderInput
            label="Target battery after charging"
            value={target}
            onChange={setTarget}
            min={16}
            max={100}
            hint=""
          />
          <NumberInput
            label="Electricity price"
            value={price}
            onChange={setPrice}
            prefix="₹"
            unit="/ kWh"
            placeholder="e.g. 22"
          />
        </Card>
      }
      results={
        <div className="min-h-[420px]">
          {!result.ok ? (
            <Card className="p-8">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
                <h2 className="font-display text-lg font-semibold text-navy">Almost there</h2>
              </div>
              <ul className="mt-3 space-y-1.5">
                {result.errors.map((e) => (
                  <li key={e} className="text-sm text-red-600">{e}</li>
                ))}
              </ul>
            </Card>
          ) : (
            <div className="space-y-6">
              <TripOverview plan={result.plan} d={result.d} ev={ev} start={start} topPower={result.topPower} chargeHours={result.chargeHours} />

              {result.plan.stops === 0 ? (
                <Card tone="lime" className="p-6">
                  <p className="text-sm font-medium text-navy">
                    <strong>No charging stops needed.</strong> Your {start}% starting charge covers
                    the full {formatNum(result.d, 0)} km trip — you'll arrive with{" "}
                    {Math.round(result.plan.arrivalPct)}% left.
                  </p>
                </Card>
              ) : (
                <>
                  {result.plan.limitHit && (
                    <InfoNote>
                      <p>
                        This trip needs more charging stops than we can recommend here. Consider a
                        longer-range EV, a higher target battery (up to your vehicle's limit) or a
                        shorter daily stage.
                      </p>
                    </InfoNote>
                  )}
                  <JourneyStrip plan={result.plan} target={target} />
                  <Card className="overflow-hidden">
                    <div className="px-5 pt-5 pb-1">
                      <h2 className="font-display text-lg font-semibold text-navy">
                        Charger comparison
                      </h2>
                      <p className="text-sm text-navy/55">
                        Same stops and energy — only the charging time changes with charger power.
                      </p>
                    </div>
                    <div className="p-4">
                      <ChargingComparisonTable rows={result.rows} />
                    </div>
                  </Card>
                </>
              )}

              <InfoNote tone="lime">
                <p>
                  <strong>Plan outline:</strong> {formatNum(result.d, 0)} km, {formatNum(ev.range, 0)}{" "}
                  km range, starting at {start}%. You charge back to {target}% at each stop, and the
                  last stop only tops up what the final leg needs — so you arrive with a{" "}
                  {TRIP_RESERVE_PERCENT}% reserve. Real consumption, stops and times vary with road,
                  weather and charging curve.
                </p>
              </InfoNote>
            </div>
          )}
        </div>
      }
    />
  );
}

function TripOverview({ plan, d, ev, start, topPower, chargeHours }) {
  return (
    <Card tone="navy" className="animate-fade-up p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/45">
            Estimated trip cost
          </p>
          <p className="mt-1 font-display text-4xl font-bold tabular-nums text-white sm:text-5xl">
            <AnimatedNumber value={plan.totalCost} format={(v) => formatINR(v)} />
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-lime px-2.5 py-1 text-xs font-bold text-navy">
              <PlugZap className="h-3.5 w-3.5" aria-hidden="true" />
              {plan.stops} {plan.stops === 1 ? "stop" : "stops"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/85">
              <Route className="h-3.5 w-3.5 text-lime" aria-hidden="true" />
              {formatNum(d, 0)} km
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/85">
              {ev.brand} {ev.model}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
          <ResultStat label="Vehicle range" value={`${formatNum(ev.range, 0)} km`} />
          <ResultStat label="Starting battery" value={`${Math.round(start)}%`} />
          <ResultStat label="Energy required" value={formatKwh(plan.energyRequired)} />
          <ResultStat label="Energy charged" value={formatKwh(plan.totalCharged)} />
          <ResultStat label="Stops needed" value={`${plan.stops}`} />
          <ResultStat label={`Charging time @ ${formatNum(topPower, 0)} kW`} value={formatDurationReadable(chargeHours)} />
        </div>
      </div>
    </Card>
  );
}

function JourneyStrip({ plan, target }) {
  const segments = [];
  // Start
  segments.push({ label: "Start", icon: Flag, pct: Math.round((plan.startEnergy / plan.capacity) * 100) });
  for (let i = 0; i < plan.stops; i++) {
    const isLast = i === plan.stops - 1;
    segments.push({
      label: `Stop ${i + 1}`,
      icon: Pause,
      pct: isLast
        ? `charge ${TRIP_RESERVE_PERCENT}% → ${Math.round(plan.lastStopTargetPct)}%`
        : `charge ${TRIP_RESERVE_PERCENT}% → ${Math.round(target)}%`,
    });
  }
  segments.push({ label: "Arrive", icon: Coffee, pct: `${Math.round(plan.arrivalPct)}%` });

  return (
    <Card className="p-6">
      <h2 className="font-display text-lg font-semibold text-navy">The journey</h2>
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2.5 rounded-lg bg-offwhite px-3 py-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy text-lime">
              <s.icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 text-sm font-semibold text-navy">
              {s.label}
              <span className="block truncate text-xs font-normal text-navy/55">{s.pct}</span>
            </span>
          </div>
        ))}
      </div>
      {plan.stops > 0 && (
        <p className="mt-4 text-sm text-navy/55">
          {plan.stops === 1 ? (
            <>
              Your single stop tops up to about {Math.round(plan.lastStopTargetPct)}% — just what
              the trip needs, arriving with a {TRIP_RESERVE_PERCENT}% reserve.
            </>
          ) : (
            <>
              Every stop charges up to your target, except the last one — it tops up to about{" "}
              {Math.round(plan.lastStopTargetPct)}% so the trip finishes with a{" "}
              {TRIP_RESERVE_PERCENT}% reserve.
            </>
          )}
        </p>
      )}
    </Card>
  );
}