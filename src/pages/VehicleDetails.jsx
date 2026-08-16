import { useState } from "react";
import { BatteryCharging, Gauge, Zap } from "lucide-react";
import usePageMeta from "../hooks/usePageMeta";
import {
  chargeWindowEnergy,
  chargingTimeHours,
  effectiveChargingPower,
} from "../utils/calculations";
import { formatDurationShort, formatKwh, formatNum } from "../utils/format";
import { evVehicles, getVehicle } from "../utils/vehicles";
import CalculatorLayout from "../components/CalculatorLayout";
import Card from "../components/Card";
import VehicleSelector from "../components/VehicleSelector";
import InfoNote from "../components/InfoNote";
import ChargingCurveChart from "../components/ChargingCurveChart";
import { ResultStat } from "../components/ResultCard";
import { AnimatedNumber } from "../hooks/useAnimatedNumber";

export default function VehicleDetails() {
  usePageMeta(
    "EV Specs & Charging Curve | FlashVolt",
    "Pick any EV and see everything we know about it — battery, usable capacity, efficiency, range, charging power — plus its real charging-speed curve.",
  );

  const [evId, setEvId] = useState("tata-nexon-ev-1");
  const ev = getVehicle(evId);

  const peak = ev ? Math.min(180, ev.maxChargingPower || 180) : 180;
  const eff = ev ? effectiveChargingPower(peak, ev.maxChargingPower) : 0;

  const t10to80 = ev ? chargingTimeHours(chargeWindowEnergy(ev, 10, 80), eff, 10, 80) : 0;
  const t80to100 = ev ? chargingTimeHours(chargeWindowEnergy(ev, 80, 100), eff, 80, 100) : 0;

  const curves = ev
    ? [
        { label: `${peak} kW (your car)`, power: peak, color: "lime" },
        { label: "60 kW charger", power: 60, color: "navy" },
        { label: "180 kW charger", power: 180, color: "amber" },
      ]
    : [];

  const specs = ev
    ? [
        { label: "Gross battery", value: formatKwh(ev.batteryCapacity) },
        { label: "Usable battery", value: formatKwh(ev.usableBatteryCapacity) },
        { label: "Efficiency", value: `${formatNum(ev.efficiency, 1)} km/kWh` },
        { label: "Claimed range", value: `${formatNum(ev.range, 0)} km` },
        { label: "Max DC charging", value: `${formatNum(ev.maxChargingPower, 0)} kW` },
        { label: "AC charging", value: ev.acCharging ? `${formatNum(ev.acCharging, 1)} kW` : "—" },
        { label: "Connector", value: ev.connectorType || "—" },
        { label: "Seating", value: ev.seatingCapacity || "—" },
        { label: "Transmission", value: ev.transmission || "—" },
        { label: "Data status", value: ev.dataStatus || "—" },
      ]
    : [];

  return (
    <CalculatorLayout
      eyebrow="EV Specs"
      compact
      title="Your EV, in full."
      description="Pick an EV to see every spec we know — battery, efficiency, range, charging — plus a realistic charging-speed curve."
      inputPanel={
        <Card className="space-y-5 p-6">
          <VehicleSelector
            label="Choose an EV"
            options={evVehicles}
            value={ev}
            onChange={(c) => setEvId(c.id)}
          />
          {ev && (
            <div className="space-y-3 rounded-lg bg-lime-light p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-navy/50">
                Quick facts
              </p>
              <div className="grid grid-cols-2 gap-3">
                <ResultStat label="Range" value={`${formatNum(ev.range, 0)} km`} />
                <ResultStat label="Top DC" value={`${formatNum(ev.maxChargingPower, 0)} kW`} />
              </div>
            </div>
          )}
        </Card>
      }
      results={
        <div className="space-y-6">
          {!ev ? (
            <Card className="p-8">
              <p className="text-sm text-navy/70">Select an EV to see its full spec sheet.</p>
            </Card>
          ) : (
            <>
              <Card tone="navy" className="p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded bg-lime px-2 py-0.5 text-xs font-bold text-navy">
                      <Zap className="h-3.5 w-3.5" aria-hidden="true" />
                      Electric
                    </span>
                    <h2 className="mt-3 font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
                      {ev.brand} {ev.model}
                    </h2>
                    {ev.variant && (
                      <p className="mt-1 text-sm text-white/55">{ev.variant} variant</p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/85">
                        <BatteryCharging className="h-3.5 w-3.5 text-lime" aria-hidden="true" />
                        {formatNum(ev.range, 0)} km range
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/85">
                        <Gauge className="h-3.5 w-3.5 text-lime" aria-hidden="true" />
                        {formatNum(ev.maxChargingPower, 0)} kW max DC
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-widest text-white/45">
                      Claimed range
                    </p>
                    <p className="mt-1 font-display text-5xl font-bold tabular-nums text-white">
                      <AnimatedNumber value={ev.range} format={(v) => formatNum(v, 0)} />
                      <span className="text-2xl text-white/55"> km</span>
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="font-display text-lg font-semibold text-navy">Spec sheet</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {specs.map((s) => (
                    <ResultStat key={s.label} label={s.label} value={s.value} />
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-semibold text-navy">
                      Charging speed vs battery %
                    </h2>
                    <p className="mt-1 text-sm text-navy/55">
                      Real DC fast-charging tapers as the battery fills — the same charger
                      delivers less power high up.
                    </p>
                  </div>
                </div>
                <div className="mt-5">
                  <ChargingCurveChart curves={curves} maxKw={Math.max(peak, 180)} vehicleMaxKw={ev.maxChargingPower} />
                </div>
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <ResultStat
                    label={`10 → 80% @ ${peak} kW`}
                    value={formatDurationShort(t10to80)}
                  />
                  <ResultStat
                    label={`80 → 100% @ ${peak} kW`}
                    value={formatDurationShort(t80to100)}
                  />
                  <ResultStat
                    label={`Total 10 → 100%`}
                    value={formatDurationShort(t10to80 + t80to100)}
                  />
                </div>
                <div className="mt-5">
                  <InfoNote tone="lime">
                    <p>
                      <strong>Why it tapers:</strong> batteries protect themselves as they fill —
                      power holds until ~50%, falls to ~60% of max at 80% and ~20% at 100%. That's
                      why the top of the battery takes the longest.
                    </p>
                  </InfoNote>
                </div>
              </Card>
            </>
          )}
        </div>
      }
    />
  );
}
