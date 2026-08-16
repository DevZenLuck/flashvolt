import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CarFront, Trophy, Zap } from "lucide-react";
import usePageMeta from "../hooks/usePageMeta";
import {
  carLabel,
  DIESEL_RATE,
  ELECTRICITY_RATE,
  evChargingCost,
  evCostPerKm,
  evEnergyRequired,
  fuelCost,
  fuelRequired,
  isEV,
  PETROL_RATE,
  priceWithGst,
} from "../utils/calculations";
import {
  clamp,
  formatINR,
  formatKwh,
  formatLitres,
  formatNum,
  formatPerKm,
  toNumber,
} from "../utils/format";
import { allVehicles, evVehicles, fuelLabel, getVehicle } from "../utils/vehicles";
import CalculatorLayout from "../components/CalculatorLayout";
import Card from "../components/Card";
import VehicleSelector from "../components/VehicleSelector";
import NumberInput from "../components/NumberInput";
import InfoNote from "../components/InfoNote";
import { AnimatedNumber } from "../hooks/useAnimatedNumber";

export default function Compare() {
  usePageMeta(
    "EV vs Petrol Cost Calculator | FlashVolt",
    "Compare an EV against another EV, a petrol or a diesel car. See total running cost and cost per km for the same distance, computed live from real vehicle data.",
  );

  const [v1Id, setV1Id] = useState("tata-nexon-ev-1");
  const [v2Id, setV2Id] = useState("honda-city-petrol-1");
  const [distance, setDistance] = useState("500");
  const [price, setPrice] = useState(String(ELECTRICITY_RATE));
  const [fuelPrice, setFuelPrice] = useState(String(PETROL_RATE));

  const v1 = getVehicle(v1Id);
  const v2 = getVehicle(v2Id);

  // Default the fuel price to the current fuel's market rate: ₹115 petrol, ₹105 diesel.
  useEffect(() => {
    if (v2 && !isEV(v2)) {
      setFuelPrice(String(v2.type === "diesel" ? DIESEL_RATE : PETROL_RATE));
    }
  }, [v2Id]);

  const result = useMemo(() => {
    const d = toNumber(String(distance).trim());
    const p = toNumber(String(price).trim());
    const fp = toNumber(String(fuelPrice).trim());

    const errors = [];
    if (!isEV(v1)) errors.push("Vehicle 1 must be an EV.");
    if (!d || d <= 0 || !Number.isFinite(d)) errors.push("Please enter a valid distance.");
    if (!p || p <= 0 || !Number.isFinite(p))
      errors.push("Enter electricity price to calculate charging cost.");
    if (!isEV(v2) && (!fp || fp <= 0 || !Number.isFinite(fp)))
      errors.push("Enter fuel price to calculate fuel cost.");

    if (errors.length) return { ok: false, errors };

    const evEnergy = evEnergyRequired(v1, d);
    const evCostBase = evChargingCost(v1, d, p);
    const evCost = evChargingCost(v1, d, priceWithGst(p));
    const evGst = evCost - evCostBase;
    const evKpm = evCostPerKm(v1, priceWithGst(p));

    const isFuelV2 = !isEV(v2);
    const fuelLiters = isFuelV2 ? fuelRequired(v2, d) : 0;
    const fuelTotal = isFuelV2 ? fuelCost(v2, d, fp) : 0;
    const fuelKpm = isFuelV2 ? fp / v2.fuelEfficiency : 0;

    const ev2Energy = isEV(v2) ? evEnergyRequired(v2, d) : 0;
    const ev2CostBase = isEV(v2) ? evChargingCost(v2, d, p) : 0;
    const ev2Cost = isEV(v2) ? evChargingCost(v2, d, priceWithGst(p)) : 0;
    const ev2Gst = ev2Cost - ev2CostBase;
    const ev2Kpm = isEV(v2) ? evCostPerKm(v2, priceWithGst(p)) : 0;

    const otherCost = isFuelV2 ? fuelTotal : ev2Cost;
    const maxCost = Math.max(evCost, otherCost, 1e-9);
    const evPct = clamp((evCost / maxCost) * 100, 0, 100);
    const otherPct = clamp((otherCost / maxCost) * 100, 0, 100);

    let cheaperId = null;
    let diff = 0;
    if (isEV(v2)) {
      if (evCost < ev2Cost - 0.01) cheaperId = v1.id;
      else if (ev2Cost < evCost - 0.01) cheaperId = v2.id;
      diff = Math.abs(evCost - ev2Cost);
    } else if (fuelTotal > evCost) {
      cheaperId = v1.id;
      diff = fuelTotal - evCost;
    }

    const savePct =
      cheaperId && diff > 0 ? (diff / Math.max(otherCost, evCost)) * 100 : 0;

    return {
      ok: true,
      d,
      p,
      fp,
      evEnergy,
      evCostBase,
      evCost,
      evGst,
      evKpm,
      isFuelV2,
      fuelLiters,
      fuelTotal,
      fuelKpm,
      ev2Energy,
      ev2CostBase,
      ev2Cost,
      ev2Gst,
      ev2Kpm,
      otherCost,
      evPct,
      otherPct,
      cheaperId,
      diff,
      savePct,
    };
  }, [v1, v2, distance, price, fuelPrice]);

  return (
    <CalculatorLayout
      eyebrow="EV vs Vehicle"
      compact
      title="Compare your EV against anything."
      description="Vehicle 1 is always an EV — pick your reference first. The other side can be another EV, a petrol or a diesel car. Both are priced for the same distance, using each vehicle's real efficiency."
      inputPanel={
        <Card className="space-y-5 p-6">
          <VehicleSelector
            label="Vehicle 1 · your EV"
            options={evVehicles}
            value={v1}
            onChange={(c) => setV1Id(c.id)}
            hint="Vehicle 1 is always an EV."
          />
          <VehicleSelector
            label="Vehicle 2 · compare against"
            options={allVehicles}
            value={v2}
            onChange={(c) => setV2Id(c.id)}
            hint="Any other EV, petrol or diesel car."
          />
          <NumberInput
            label="Distance"
            value={distance}
            onChange={setDistance}
            unit="km"
            placeholder="e.g. 500"
          />
          <NumberInput
            label="Electricity price"
            value={price}
            onChange={setPrice}
            prefix="₹"
            unit="/ kWh"
            placeholder="e.g. 22"
          />
          {v2 && !isEV(v2) && (
            <div className="animate-fade-up">
              <NumberInput
                label="Fuel price"
                value={fuelPrice}
                onChange={setFuelPrice}
                prefix="₹"
                unit="/ litre"
                placeholder="e.g. 115"
              />
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
                <h2 className="font-display text-lg font-semibold text-navy">Almost there</h2>
              </div>
              <ul className="mt-3 space-y-1.5">
                {result.errors.map((e) => (
                  <li key={e} className="text-sm text-red-600">
                    {e}
                  </li>
                ))}
              </ul>
            </Card>
          ) : (
            <div className="space-y-6">
              <CompareHeroRow r={result} v1={v1} v2={v2} />
              <ResultBars r={result} v1={v1} v2={v2} />
              <InfoNote tone="lime">
                <p>
                  <strong>Same distance, same inputs.</strong> Priced for{" "}
                  <strong>{formatNum(result.d, 0)} km</strong> at ₹{formatNum(result.p, 0)}/kWh
                  (incl. 18% GST)
                  {result.isFuelV2 ? ` and ₹${formatNum(result.fp, 0)}/litre` : ""}. Cost per km
                  reflects each vehicle's real-world efficiency; actual figures vary with driving
                  conditions.
                </p>
              </InfoNote>
            </div>
          )}
        </div>
      }
    />
  );
}

function CompareHeroRow({ r, v1, v2 }) {
  const [evCard, otherCard] = buildCards(r, v1, v2);
  return (
    <div className="animate-fade-up grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-stretch">
      <CostCard card={evCard} />
      <div className="flex items-center justify-center">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-navy/10 bg-white font-display text-sm font-bold uppercase tracking-wide text-navy shadow-card">
          vs
        </span>
      </div>
      <CostCard card={otherCard} />
    </div>
  );
}

function buildCards(r, v1, v2) {
  const evCard = {
    badge: "EV",
    name: carLabel(v1),
    sub: "Electric",
    cost: r.evCost,
    perKm: r.evKpm,
    tonenavy: false,
    cheaper: r.cheaperId === v1.id,
    diff: r.diff,
    rows: [
      { label: "Energy required", value: formatKwh(r.evEnergy) },
      { label: "Charging cost", value: formatINR(r.evCostBase) },
      { label: "GST (18%)", value: `+ ${formatINR(r.evGst)}` },
      { label: "Cost per km", value: formatPerKm(r.evKpm) },
    ],
  };

  let otherCard;
  if (r.isFuelV2) {
    otherCard = {
      badge: fuelLabel(v2.type),
      name: carLabel(v2),
      sub: `${fuelLabel(v2.type)} engine`,
      cost: r.fuelTotal,
      perKm: r.fuelKpm,
      tonenavy: true,
      cheaper: false,
      diff: null,
      rows: [
        { label: "Fuel required", value: formatLitres(r.fuelLiters) },
        { label: "Fuel cost", value: formatINR(r.fuelTotal) },
        { label: "Cost per km", value: formatPerKm(r.fuelKpm) },
      ],
    };
  } else {
    otherCard = {
      badge: "EV",
      name: carLabel(v2),
      sub: "Electric",
      cost: r.ev2Cost,
      perKm: r.ev2Kpm,
      tonenavy: false,
      cheaper: r.cheaperId === v2.id,
      diff: r.diff,
      rows: [
        { label: "Energy required", value: formatKwh(r.ev2Energy) },
        { label: "Charging cost", value: formatINR(r.ev2CostBase) },
        { label: "GST (18%)", value: `+ ${formatINR(r.ev2Gst)}` },
        { label: "Cost per km", value: formatPerKm(r.ev2Kpm) },
      ],
    };
  }
  return [evCard, otherCard];
}

function CostCard({ card }) {
  const navy = card.tonenavy;
  return (
    <Card
      tone={navy ? "navy" : "white"}
      className={`p-6 ${card.cheaper ? "border-lime ring-1 ring-lime" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span
            className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-bold ${
              navy ? "bg-lime text-navy" : "bg-lime-light text-lime-dark"
            }`}
          >
            {card.badge}
          </span>
          <p
            className={`mt-3 font-display text-base font-semibold leading-snug ${
              navy ? "text-white" : "text-navy"
            }`}
          >
            {card.name}
          </p>
          <p className={`text-xs ${navy ? "text-white/55" : "text-navy/50"}`}>{card.sub}</p>
        </div>
        {navy ? (
          <CarFront className="h-5 w-5 text-lime" aria-hidden="true" />
        ) : (
          <Zap className="h-5 w-5 text-navy/25" aria-hidden="true" />
        )}
      </div>

      <div className="mt-6">
        <p className={`text-xs font-semibold uppercase tracking-widest ${navy ? "text-white/45" : "text-navy/45"}`}>
          Cost for trip
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <AnimatedNumber
            value={card.cost}
            format={(v) => formatINR(v)}
            className={`font-display text-3xl font-bold tabular-nums sm:text-4xl ${navy ? "text-white" : "text-navy"}`}
          />
          {card.cheaper && (
            <span className="inline-flex items-center gap-1 rounded-full bg-lime px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-navy">
              <Trophy className="h-3 w-3" aria-hidden="true" />
              Cheaper
            </span>
          )}
        </div>
        {card.cheaper && card.diff > 0 && (
          <p className={`mt-1 text-xs font-semibold ${navy ? "text-lime" : "text-lime-dark"}`}>
            You save {formatINR(card.diff)} over the other vehicle.
          </p>
        )}
      </div>

      <div className={`mt-5 border-t pt-2 ${navy ? "border-white/10" : "border-navy/10"}`}>
        {card.rows.map((row) => (
          <div
            key={row.label}
            className="flex items-baseline justify-between gap-3 py-1.5 text-sm"
          >
            <span className={navy ? "text-white/55" : "text-navy/55"}>{row.label}</span>
            <span className={`font-semibold tabular-nums ${navy ? "text-white" : "text-navy"}`}>{row.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ResultBars({ r, v1, v2 }) {
  const otherLabel = r.isFuelV2
    ? `${fuelLabel(v2.type)} · ${carLabel(v2)}`
    : `EV · ${carLabel(v2)}`;

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-navy">Trip cost comparison</h2>
        {r.cheaperId ? (
          <p className="inline-flex flex-wrap items-center gap-1.5 text-sm font-semibold text-lime-dark">
            <Trophy className="h-4 w-4" aria-hidden="true" />
            You save {formatINR(r.diff)}
            <span className="rounded bg-lime-light px-1.5 py-0.5 text-xs tabular-nums">
              {formatNum(r.savePct, 1)}%
            </span>
          </p>
        ) : (
          <p className="text-sm text-navy/60">Both vehicles cost roughly the same.</p>
        )}
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <BarGroup
          label={`EV · ${carLabel(v1)}`}
          cost={r.evCost}
          perKm={r.evKpm}
          pct={r.evPct}
          color="lime"
          wiser={r.cheaperId === v1.id}
        />
        <BarGroup
          label={otherLabel}
          cost={r.otherCost}
          perKm={r.isFuelV2 ? r.fuelKpm : r.ev2Kpm}
          pct={r.otherPct}
          color="navy"
          wiser={r.cheaperId === v2.id}
        />
      </div>
    </Card>
  );
}

function BarGroup({ label, cost, perKm, pct, color, wiser }) {
  const barClass = color === "lime" ? "bg-gradient-to-r from-lime to-lime-bright" : "bg-navy";
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium text-navy/70">{label}</p>
        {wiser && (
          <span className="rounded-full bg-lime px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-navy">
            Better value
          </span>
        )}
      </div>
      <p className="mt-1 font-display text-2xl font-bold tabular-nums text-navy">{formatINR(cost)}</p>
      <p className="text-sm text-navy/50">{formatPerKm(perKm)} running cost</p>
      <div className="mt-3 h-3.5 w-full overflow-hidden rounded-full bg-navy/10">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs text-navy/40">Relative to the higher cost</p>
    </div>
  );
}