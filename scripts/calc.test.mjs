import assert from 'node:assert/strict';
import {
  CHARGER_POWERS,
  RESERVE_PERCENT,
  evEnergyRequired,
  batteryEnergyKwh,
  evChargingCost,
  fuelCost,
  chargerOptions,
  chargingTimeHours,
  chargeRecommendation,
  chargeWindowEnergy,
  planTrip,
  vehicleRange,
} from '../src/utils/calculations.js';

const nexon = {
  id: 'tata-nexon-ev',
  brand: 'Tata',
  model: 'Nexon EV',
  type: 'ev',
  batteryCapacity: 40.5,
  usableBatteryCapacity: 37.5,
  efficiency: 6.0,
  range: 225,
  maxChargingPower: 60,
};

const honda = {
  id: 'honda-city',
  brand: 'Honda',
  model: 'City',
  type: 'petrol',
  fuelTankCapacity: 40,
  fuelEfficiency: 17.8,
};

// -- Basic energy math (spec §20) --
assert.ok(Math.abs(evEnergyRequired(nexon, 150) - 25) < 1e-9, '150km @6km/kWh = 25kWh');
assert.ok(Math.abs(batteryEnergyKwh(nexon, 25) - 9.375) < 1e-9, '25% of 37.5kWh');
assert.ok(Math.abs(evChargingCost(nexon, 150, 10) - 250) < 1e-9, '25kWh @10 = ₹250');
assert.ok(Math.abs(fuelCost(honda, 500, 105) - (500 / 17.8) * 105) < 1e-6);

// -- Charging time (spec §13/§15, taper-aware) --
const pct = { current: 20, target: 80 };
const energy = chargeWindowEnergy(nexon, pct.current, pct.target); // 60% of 37.5 = 22.5
const opts = chargerOptions(nexon, energy, 20, 80);
const t60 = opts.find((o) => o.chargerPower === 60);
// Taper-aware: the same 22.5 kWh now takes *longer* than the naive 22.5 / 60.
assert.ok(t60.timeHours > 22.5 / 60, '20→80% is slower than the flat model');
assert.ok(
  Math.abs(t60.timeHours - chargingTimeHours(energy, 60, 20, 80)) < 1e-9,
  'chargerOptions honours the SOC window',
);
const t180 = opts.find((o) => o.chargerPower === 180);
assert.equal(t180.limited, true, '180kW limited for 60kW car');
assert.ok(Math.abs(t180.effectivePower - 60) < 1e-9, 'effectivePower = min(180,60)');
assert.ok(Math.abs(t180.timeHours - t60.timeHours) < 1e-9, '180kW behaves as 60kW');

// Below 50% SOC the taper is flat → exact linear time.
const flatEnergy = chargeWindowEnergy(nexon, 10, 40);
assert.ok(
  Math.abs(chargingTimeHours(flatEnergy, 60, 10, 40) - flatEnergy / 60) < 1e-12,
  '10→40% stays linear (no taper below 50%)',
);

// Higher SOC bands each take more time for the same energy (the taper's job).
const band = (a, b) => chargingTimeHours(chargeWindowEnergy(nexon, a, b), 60, a, b);
assert.ok(band(60, 70) > band(10, 20), '60→70% slower than 10→20%');
assert.ok(band(80, 100) > band(60, 70), '80→100% slower than 60→70%');

// -- Spec §15 example: 36 kWh @ chargers (default 0–100 window) --
const bigCarOpts = chargerOptions({ ...nexon, maxChargingPower: 200 }, 36);
assert.equal(bigCarOpts.length, CHARGER_POWERS.length);
for (const power of [30, 60, 90, 120, 180]) {
  const o = bigCarOpts.find((x) => x.chargerPower === power);
  assert.ok(!o.limited, `${power}kW not limited`);
  assert.ok(Math.abs(o.timeHours - chargingTimeHours(36, power, 0, 100)) < 1e-9);
  // A 0–100% window always takes longer than the naive flat rate.
  assert.ok(o.timeHours > 36 / power, `${power}kW slower than flat on a full window`);
}

// -- Charge needed (spec §12, reserve-aware): 25% → 150km @ ₹10 --
// Recommendation now always plans to arrive with the 10% safety reserve.
const rec = chargeRecommendation(nexon, 25, 150, 10);
assert.equal(rec.sufficient, false);
assert.ok(Math.abs(rec.energyRequired - 25) < 1e-9);
const reserve = batteryEnergyKwh(nexon, RESERVE_PERCENT);
assert.ok(Math.abs(rec.reserveEnergy - reserve) < 1e-9, 'exposes the 10% reserve in kWh');
assert.ok(
  Math.abs(rec.additionalKwh - (25 - batteryEnergyKwh(nexon, 25) + reserve)) < 1e-9,
  'extra units include the reserve shortfall',
);
assert.ok(Math.abs(rec.cost - rec.additionalKwh * 10) < 1e-9);

// Sufficient case → no recommendation
const rec2 = chargeRecommendation(nexon, 90, 50, 10);
assert.equal(rec2.sufficient, true, '90% covers 50km and still holds 10% reserve');

// -- Trip plan (spec §18): range 360km EV, 700km, 80% start, 80% target, ₹15 --
// Simulate the spec's own figures: eff 6, usable 60 → range 360.
const tripCar = { ...nexon, usableBatteryCapacity: 60, batteryCapacity: 61, efficiency: 6, range: 360 };
const trip = planTrip(tripCar, 700, 80, 80, 15);
assert.equal(trip.stops, 2, '2 charging stops');
// The last stop must only top up what the final leg needs (arrive on the reserve),
// so units charged = trip energy − energy already carried − nothing wasted.
const tripReserve = (60 * 15) / 100; // 15% trip reserve
assert.ok(Math.abs(trip.totalCharged - (700 / 6 - (48 - tripReserve))) < 1e-6, `77.67 kWh charged, got ${trip.totalCharged}`);
assert.ok(Math.abs(trip.lastStopCharged - 232 / 6) < 1e-6, `last stop tops up 38.67 kWh, got ${trip.lastStopCharged}`);
assert.ok(Math.abs(trip.totalCost - trip.totalCharged * 15) < 1e-6);
assert.ok(Math.abs(trip.energyRequired - 700 / 6) < 1e-9, '116.67 kWh energy');
assert.ok(Math.abs(trip.arrivalPct - 15) < 1e-6, `arrives on the 15% reserve, got ${trip.arrivalPct}%`);

// No-charge trip: short distance covered by start battery
const shortTrip = planTrip(tripCar, 150, 80, 80, 15);
assert.equal(shortTrip.stops, 0, '0 stops for short trip');
assert.ok(Math.abs(shortTrip.totalCharged - 0) < 1e-9);

// The finishing leg must not count as an unfinished/limit-hit trip
assert.equal(trip.limitHit, false, '700km Nexon-like trip completes cleanly');
assert.ok(trip.arrivalPct >= 15 - 1e-6, `arrives at or above the 15% reserve, got ${trip.arrivalPct}%`);

// Absurdly long distance → flagged, never an infinite loop
const longTrip = planTrip(tripCar, 30000, 80, 80, 15);
assert.equal(longTrip.limitHit, true, '30000km flagged as needing more practical stops');
assert.ok(longTrip.stops <= 50, `stop count capped, got ${longTrip.stops}`);

// Vehicle limit honoured across the whole comparison list
const limitedCarOpts = chargerOptions(nexon, 20);
for (const o of limitedCarOpts) {
  assert.ok(o.effectivePower <= 60, `${o.chargerPower}kW capped at 60`);
}

// Range from usable capacity
assert.ok(Math.abs(vehicleRange(tripCar) - 360) < 1e-9);

console.log('All calculation tests passed.');