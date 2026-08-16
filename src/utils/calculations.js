// ---------------------------------------------------------------------------
// FlashVolt — calculation engine
// All math lives here, kept separate from the UI. Realistic but transparent.
// ---------------------------------------------------------------------------

export const CHARGER_POWERS = [30, 60, 90, 120, 150, 180];

// Minimum battery % a driver should plan to reach before fast charging.
export const RESERVE_PERCENT = 10;

// Minimum battery % an EV trip should finish with (Trip Planner). A trip ends
// on a partial top-up — just enough to arrive on this buffer, not a full charge.
export const TRIP_RESERVE_PERCENT = 15;

// Market rates used across the site — single source of truth.
export const ELECTRICITY_RATE = 22; // ₹ / kWh (base, before GST)
export const GST_RATE = 0.18; // 18% GST on electricity
export const GST_FACTOR = 1 + GST_RATE;
export const PETROL_RATE = 115; // ₹ / litre
export const DIESEL_RATE = 105; // ₹ / litre

/** Electricity price with 18% GST applied → cost the user actually pays. */
export function priceWithGst(base) {
  return Number.isFinite(base) ? base * GST_FACTOR : 0;
}

export const isEV = (car) => car && car.type === 'ev';
export const isFuel = (car) => car && (car.type === 'petrol' || car.type === 'diesel');
export const carLabel = (car) => (car ? `${car.brand} ${car.model}` : '');

/** Usable battery capacity in kWh (falls back to gross capacity). */
export function usableCapacity(car) {
  if (!car) return 0;
  return car.usableBatteryCapacity || car.batteryCapacity || 0;
}

/** Real-world-ish range from usable capacity × efficiency. */
export function vehicleRange(car) {
  if (!isEV(car)) return 0;
  return car.range || usableCapacity(car) * car.efficiency || 0;
}

// --- EV energy ------------------------------------------------------------

/** kWh needed to travel this distance (distance / efficiency). */
export function evEnergyRequired(car, distanceKm) {
  return distanceKm / car.efficiency;
}

/** Energy stored in the battery at a given percentage. */
export function batteryEnergyKwh(car, percent) {
  return (usableCapacity(car) * percent) / 100;
}

/** Cost of the energy used for a given distance. */
export function evChargingCost(car, distanceKm, pricePerKwh) {
  return evEnergyRequired(car, distanceKm) * pricePerKwh;
}

/** ₹ per km of driving an EV at a given electricity price. */
export function evCostPerKm(car, pricePerKwh) {
  return pricePerKwh / car.efficiency;
}

// --- Fuel energy ----------------------------------------------------------

/** Litres of fuel needed for this distance. */
export function fuelRequired(car, distanceKm) {
  return distanceKm / car.fuelEfficiency;
}

export function fuelCost(car, distanceKm, fuelPricePerLitre) {
  return fuelRequired(car, distanceKm) * fuelPricePerLitre;
}

export function fuelCostPerKm(car, fuelPricePerLitre) {
  return fuelPricePerLitre / car.fuelEfficiency;
}

// --- Charging time --------------------------------------------------------

/** The power a vehicle actually accepts from a charger. */
export function effectiveChargingPower(chargerPowerKw, vehicleMaxKw) {
  const max = vehicleMaxKw && vehicleMaxKw > 0 ? vehicleMaxKw : Infinity;
  return Math.min(chargerPowerKw, max);
}

// Charging-curve taper — a calibrated average across EV types (real curves
// vary with chemistry/voltage/OEM, so this is a good-planning approximation):
//   full power up to 50% SOC · falls linearly to 60% of max at 80% ·
//   falls to 20% of max at 100%.
const TAPER_FULL_AT = 50;
const TAPER_MID_AT = 80;
const TAPER_MID_RATIO = 0.6;
const TAPER_END_RATIO = 0.2;

/** Power the battery accepts at a given state of charge (taper applied). */
export function taperedPowerAt(socPct, powerKw) {
  if (!powerKw || powerKw <= 0) return 0;
  if (socPct <= TAPER_FULL_AT) return powerKw;
  if (socPct <= TAPER_MID_AT) {
    const f = (socPct - TAPER_FULL_AT) / (TAPER_MID_AT - TAPER_FULL_AT);
    return powerKw - f * powerKw * (1 - TAPER_MID_RATIO);
  }
  const f = (socPct - TAPER_MID_AT) / (100 - TAPER_MID_AT);
  return powerKw * (TAPER_MID_RATIO - f * (TAPER_MID_RATIO - TAPER_END_RATIO));
}

/**
 * Theoretical time in hours to deliver `energyKwh` across a given SOC window.
 * The energy is distributed in 1% steps so higher-SOC steps take longer —
 * charging is not linear; the top of the battery is slower (taper).
 */
export function chargingTimeHours(energyKwh, powerKw, socFrom = 0, socTo = 100) {
  if (!powerKw || powerKw <= 0 || !energyKwh || energyKwh <= 0) return 0;
  const lo = Math.max(0, Math.min(socFrom, socTo));
  const hi = Math.min(100, Math.max(socFrom, socTo));
  const span = Math.max(1e-9, hi - lo);
  const perStepEnergy = energyKwh / span;
  let hours = 0;
  for (let s = lo; s < hi - 1e-9; s += 1) {
    hours += perStepEnergy / taperedPowerAt(s + 0.5, powerKw);
  }
  return hours;
}

/** Descriptor for every charger the site compares against, honouring the
 *  vehicle's own charging limit and the SOC window the energy lands in. */
export function chargerOptions(car, energyKwh, socFrom = 0, socTo = 100) {
  const max = car && typeof car.maxChargingPower === 'number' ? car.maxChargingPower : Infinity;
  return CHARGER_POWERS.map((power) => {
    const effective = effectiveChargingPower(power, max);
    const limited = power > max;
    return {
      chargerPower: power,
      effectivePower: effective,
      limited,
      timeHours: chargingTimeHours(energyKwh, effective, socFrom, socTo),
    };
  });
}

// --- Charge-needed recommendation -----------------------------------------

export function chargeRecommendation(car, currentPct, distanceKm, pricePerKwh) {
  const capacity = usableCapacity(car);
  const energyInBattery = batteryEnergyKwh(car, currentPct);
  const energyRequired = evEnergyRequired(car, distanceKm);
  const reserveEnergy = batteryEnergyKwh(car, RESERVE_PERCENT);

  // Energy we can spend before hitting the 10% safety reserve.
  const spendable = energyInBattery - reserveEnergy;
  const sufficient = spendable >= energyRequired - 1e-9;

  let additionalKwh = 0;
  let recommendedIncreasePct = 0;
  let targetPct = currentPct;
  let cost = 0;

  if (!sufficient) {
    additionalKwh = Math.max(0, energyRequired - spendable);
    recommendedIncreasePct = (additionalKwh / capacity) * 100;
    targetPct = Math.min(100, currentPct + recommendedIncreasePct);
    cost = additionalKwh * pricePerKwh;
  }

  const exceedsCapacity = !sufficient && currentPct + recommendedIncreasePct > 100 + 1e-9;

  return {
    capacity,
    energyInBattery,
    energyRequired,
    reserveEnergy,
    sufficient,
    additionalKwh,
    recommendedIncreasePct,
    targetPct,
    exceedsCapacity,
    cost,
  };
}

// --- Charge-needed / charging-time energy ---------------------------------

export function chargeWindowEnergy(car, currentPct, targetPct) {
  return batteryEnergyKwh(car, targetPct) - batteryEnergyKwh(car, currentPct);
}

// --- Trip plan ------------------------------------------------------------

export function planTrip(car, distanceKm, startPct, targetPct, pricePerKwh) {
  const capacity = usableCapacity(car);
  const efficiency = car.efficiency;
  const reserveEnergy = batteryEnergyKwh(car, TRIP_RESERVE_PERCENT);
  const startEnergy = batteryEnergyKwh(car, startPct);
  const targetEnergy = batteryEnergyKwh(car, targetPct);

  const energyRequired = evEnergyRequired(car, distanceKm);

  let distanceLeft = distanceKm;
  let currentEnergy = startEnergy;
  let stops = 0;
  let totalCharged = 0;
  let lastStopCharged = 0;
  let lastStopTargetPct = 0;

  const MAX_STOPS = 50;
  let iter = 0;

  while (distanceLeft > 1e-9 && iter++ < MAX_STOPS) {
    const energyToFinish = distanceLeft / efficiency;
    const spendable = currentEnergy - reserveEnergy;

    // Current charge covers the rest (arriving with at least the reserve).
    if (spendable >= energyToFinish - 1e-9) {
      currentEnergy -= energyToFinish;
      distanceLeft = 0;
      break;
    }

    // Drive down to the reserve, then decide how much to recharge.
    const driveEnergy = Math.max(0, spendable);
    distanceLeft -= driveEnergy * efficiency;
    currentEnergy = reserveEnergy;

    // Fuel check (target lower than reserve would charge nothing).
    if (targetEnergy <= currentEnergy + 1e-9) break;

    // The final leg: only charge what's needed to finish on the reserve —
    // don't waste money charging back all the way to the target.
    const neededEnergy = distanceLeft / efficiency + reserveEnergy;

    if (neededEnergy <= targetEnergy + 1e-9) {
      lastStopCharged = Math.max(0, neededEnergy - currentEnergy);
      currentEnergy = neededEnergy;
      lastStopTargetPct = (neededEnergy / capacity) * 100;
      totalCharged += lastStopCharged;
      stops += 1;
      currentEnergy -= distanceLeft / efficiency; // drive the last leg
      distanceLeft = 0;
      break;
    }

    const charged = targetEnergy - currentEnergy;
    currentEnergy = targetEnergy;
    lastStopCharged = charged;
    lastStopTargetPct = targetPct;
    stops += 1;
    totalCharged += charged;
  }

  const limitHit = distanceLeft > 1e-9;
  const leftoverEnergy = Math.max(0, currentEnergy);
  const arrivalPct = capacity > 0 ? (leftoverEnergy / capacity) * 100 : 0;

  return {
    capacity,
    range: vehicleRange(car),
    energyRequired,
    startEnergy,
    stops,
    totalCharged,
    lastStopCharged,
    lastStopTargetPct,
    totalCost: totalCharged * pricePerKwh,
    perStopCharged: stops > 0 ? totalCharged / stops : 0,
    limitHit,
    distanceLeft,
    arrivalPct,
  };
}