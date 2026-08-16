import { useMemo, useState } from "react";
import { AlertTriangle, Timer } from "lucide-react";
import usePageMeta from "../hooks/usePageMeta";
import { chargeWindowEnergy, chargerOptions } from "../utils/calculations";
import { formatKwh } from "../utils/format";
import { evVehicles, getVehicle } from "../utils/vehicles";
import CalculatorLayout from "../components/CalculatorLayout";
import Card from "../components/Card";
import VehicleSelector from "../components/VehicleSelector";
import SliderInput from "../components/SliderInput";
import BatteryIndicator from "../components/BatteryIndicator";
import ChargingPowerGrid from "../components/ChargingPowerGrid";
import InfoNote from "../components/InfoNote";

export default function ChargingTime() {
  usePageMeta(
    "EV Charging Time Calculator | FlashVolt",
    "Find out how long it takes to charge an EV from one battery level to another across 30–180 kW chargers — respecting your vehicle's own charging limit.",
  );

  const [evId, setEvId] = useState("tata-nexon-ev-1");
  const [current, setCurrent] = useState(20);
  const [target, setTarget] = useState(80);

  const ev = getVehicle(evId);

  const result = useMemo(() => {
    if (!ev) return { ok: false, errors: ["Select a vehicle."] };
    if (target <= current)
      return { ok: false, errors: ["Target charge must be higher than your current charge."] };
    const energy = chargeWindowEnergy(ev, current, target);
    return { ok: true, energy, current, target };
  }, [ev, current, target]);

  return (
    <CalculatorLayout
      eyebrow="Charging Time"
      compact
      title="How long will charging take?"
      description="Pick a starting charge and a target, and compare 30–180 kW fast chargers. Times respect your vehicle's maximum charging power — an EV capped at 60 kW won't pretend to take 180."
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
          />
          <SliderInput
            label="Target battery"
            value={target}
            onChange={setTarget}
            min={0}
            max={100}
          />
          {result.ok && (
            <div className="rounded-lg bg-lime-light p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-navy">
                <Timer className="h-4 w-4 text-lime-dark" aria-hidden="true" />
                Charging window
              </div>
              <p className="mt-1 text-xs leading-relaxed text-navy/70">
                {current}% → {target}% means {formatKwh(result.energy)} to put in.
              </p>
            </div>
          )}
        </Card>
      }
      results={
        <div className="min-h-[420px]">
          {!result.ok ? (
            <Card className="p-8">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
                <h2 className="font-display text-lg font-semibold text-navy">Check your inputs</h2>
              </div>
              <ul className="mt-3 space-y-1.5">
                {result.errors.map((e) => (
                  <li key={e} className="text-sm text-red-600">{e}</li>
                ))}
              </ul>
            </Card>
          ) : result.energy <= 0 ? (
            <Card tone="lime" className="p-6">
              <p className="text-sm text-navy/70">
                No charging needed — the target is the same as (or below) your current charge.
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card className="space-y-5 p-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-navy/45">
                      {current}% → {target}%
                    </p>
                    <p className="mt-1 font-display text-3xl font-bold text-navy sm:text-4xl">
                      {formatKwh(result.energy)}
                    </p>
                    <p className="text-sm text-navy/55">energy required</p>
                  </div>
                  <BatteryIndicator percent={target} size="lg" className="max-w-[180px] flex-1" />
                </div>
                <InfoNote tone="navy">
                  <p>
                    <strong>Estimated charging time only.</strong> Actual DC fast-charging tends to
                    be slower than the theoretical estimate because charging power drops as the
                    battery approaches a high state of charge.
                  </p>
                </InfoNote>
              </Card>

              <ChargingPowerGrid
                options={chargerOptions(ev, result.energy, result.current, result.target)}
                title="Time on each charger"
              />
            </div>
          )}
        </div>
      }
    />
  );
}