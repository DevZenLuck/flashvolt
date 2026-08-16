import { useMemo, useState } from "react";
import { AlertTriangle, BatteryCharging, CheckCircle2, TrendingUp } from "lucide-react";
import usePageMeta from "../hooks/usePageMeta";
import {
  chargeRecommendation,
  chargerOptions,
  ELECTRICITY_RATE,
  evEnergyRequired,
  priceWithGst,
  vehicleRange,
} from "../utils/calculations";
import { formatINR, formatKwh, formatNum, toNumber } from "../utils/format";
import { evVehicles, getVehicle } from "../utils/vehicles";
import CalculatorLayout from "../components/CalculatorLayout";
import Card from "../components/Card";
import VehicleSelector from "../components/VehicleSelector";
import NumberInput from "../components/NumberInput";
import SliderInput from "../components/SliderInput";
import BatteryIndicator from "../components/BatteryIndicator";
import ChargingPowerGrid from "../components/ChargingPowerGrid";
import InfoNote from "../components/InfoNote";
import { ResultStat } from "../components/ResultCard";

export default function ChargeNeeded() {
  usePageMeta(
    "EV Charging Calculator | How Much Charge Do I Need? | FlashVolt",
    "Tell FlashVolt your remaining distance and current battery, and it works out how much charge you need, the target battery level and the charging cost — plus charging time by charger.",
  );

  const [evId, setEvId] = useState("tata-nexon-ev-1");
  const [current, setCurrent] = useState(25);
  const [distance, setDistance] = useState("150");
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

    return {
      ok: true,
      ...chargeRecommendation(ev, current, d, priceWithGst(p)),
      d,
      price: p,
      range: vehicleRange(ev),
    };
  }, [ev, current, distance, price]);

  return (
    <CalculatorLayout
      eyebrow="Charge Needed"
      title="How much charge do I need?"
      description="Tell us your remaining km and current battery — we'll show how much to charge, the target %, the cost, and keep a 10% reserve."
      compact
      inputPanel={
        <Card className="space-y-6 p-6">
          <VehicleSelector
            label="Your EV"
            options={evVehicles}
            value={ev}
            onChange={(c) => setEvId(c.id)}
          />
          <SliderInput
            label="Current battery"
            value={current}
            onChange={setCurrent}
            min={0}
            max={100}
            step={1}
          />
          <NumberInput
            label="Distance remaining"
            value={distance}
            onChange={setDistance}
            unit="km"
            placeholder="e.g. 150"
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
          ) : result.sufficient ? (
            <SufficientView r={result} />
          ) : (
            <div className="space-y-6">
              <ResultCards r={result} ev={ev} current={current} />

              <Card className="space-y-5 p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-lg font-semibold text-navy">
                    Recommended target battery
                  </h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-lime-light px-2.5 py-1 text-xs font-semibold text-lime-dark">
                    <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                    +{Math.round(result.recommendedIncreasePct)}%
                  </span>
                </div>
                <BatteryIndicator percent={result.targetPct} size="lg" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-navy/55">
                    Start <strong className="text-navy">{Math.round(result.targetPct - result.recommendedIncreasePct)}%</strong>
                  </span>
                  <span className="text-navy/55">
                    Target <strong className="text-lime-dark">{Math.round(result.targetPct)}%</strong>
                  </span>
                </div>
                {result.exceedsCapacity && (
                  <InfoNote>
                    <p>
                      You need more than a single full charge for this trip. Charging to 100%
                      still leaves you short of the full distance — plan a top-up stop.
                    </p>
                  </InfoNote>
                )}
              </Card>

              <ChargingPowerGrid options={chargerOptions(ev, result.additionalKwh, current, result.targetPct)} />

              <InfoNote tone="lime">
                <p>
                  <strong>How this is worked out:</strong> driving {result.d} km at {ev.efficiency}{" "}
                  km/kWh needs {Math.round(evEnergyRequired(ev, result.d) * 10) / 10} kWh. Your
                  battery holds {Math.round(result.energyInBattery * 10) / 10} kWh today, but we
                  keep a 10% reserve ({Math.round(result.reserveEnergy * 10) / 10} kWh) so you
                  never arrive on empty — that leaves{" "}
                  {Math.round((result.energyRequired - result.additionalKwh) * 10) / 10} kWh
                  usable. So you charge {Math.round(result.additionalKwh * 10) / 10} kWh to cover
                  the difference. The cost includes 18% GST on electricity. Charging time is
                  theoretical — DC fast-charging slows down as the battery fills.
                </p>
              </InfoNote>
            </div>
          )}
        </div>
      }
    />
  );
}

function ResultCards({ r, ev, current }) {
  return (
    <div className="animate-fade-up grid grid-cols-2 gap-3 lg:grid-cols-3">
      <ResultStat label="Distance remaining" value={`${formatNum(r.d, 0)} km`} />
      <ResultStat label="Current charge" value={`${Math.round(current)}%`} />
      <ResultStat
        label="Recommended charge"
        value={`+${Math.round(r.recommendedIncreasePct)}%`}
        accent
      />
      <ResultStat label="Target battery" value={`${Math.round(r.targetPct)}%`} sub="10% kept as reserve" accent />
      <ResultStat label="Units to charge" value={formatKwh(r.additionalKwh)} />
      <ResultStat label="Estimated cost" value={formatINR(r.cost)} />
    </div>
  );
}

function SufficientView({ r }) {
  const arrivalPct = ((r.energyInBattery - r.energyRequired) / r.capacity) * 100;

  return (
    <div className="space-y-6">
      <Card tone="lime" className="p-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-lime-dark" aria-hidden="true" />
          <div>
            <h2 className="font-display text-lg font-semibold text-navy">
              You already have enough charge to cover this distance.
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-navy/70">
              Your battery holds {formatKwh(r.energyInBattery)}, which beats the{" "}
              {formatKwh(r.energyRequired)} needed for {formatNum(r.d, 0)} km. After driving
              you'll still have about <strong>{Math.round(arrivalPct)}%</strong> left — above our
              10% safety reserve — so no charging is required for this leg.
            </p>
          </div>
        </div>
      </Card>

      <Card className="space-y-5 p-6">
        <h2 className="font-display text-lg font-semibold text-navy">Your battery right now</h2>
        <BatteryIndicator percent={Math.round((r.energyInBattery / r.capacity) * 100)} size="lg" />
        <div className="grid grid-cols-2 gap-3">
          <ResultStat label="Energy in battery" value={formatKwh(r.energyInBattery)} />
          <ResultStat label="Energy needed" value={formatKwh(r.energyRequired)} />
        </div>
      </Card>
    </div>
  );
}