// ---------------------------------------------------------------------------
// Vehicle data accessors. Raw data lives in src/data/cars.json (see the
// source file src/cars.json). This module normalises the raw schema into the
// calculator model: type/efficiency/range/batteryCapacity/maxChargingPower
// for EVs and fuelEfficiency/fuelTankCapacity for fuel cars.
// ---------------------------------------------------------------------------

import rawCars from "../data/cars.json";

const FUEL_LABELS = {
  petrol: "Petrol",
  diesel: "Diesel",
  hybrid: "Hybrid",
  cng: "CNG",
};

function normalizeCar(raw) {
  // A handful of rows have a column shift: fuelType holds the engine cc and
  // engineCapacityCc holds the real fuel type. Detect and repair those.
  let fuelType = raw.fuelType;
  let engineCc = raw.engineCapacityCc;
  if (typeof fuelType === "number" || typeof engineCc === "string") {
    const swap = fuelType;
    fuelType = engineCc;
    engineCc = swap;
  }

  const type = String(fuelType || "").toLowerCase();
  const isEV = type === "electric" || type === "ev";

  const car = {
    id: raw.id,
    brand: raw.brand,
    model: raw.model,
    variant: raw.variant || null,
    type: isEV ? "ev" : type,
    dataStatus: raw.dataStatus || null,
    seatingCapacity: raw.seatingCapacity || null,
    transmission: raw.transmission || null,
  };

  if (isEV) {
    car.efficiency = raw.efficiencyKmPerKwh;
    car.range = raw.claimedRangeKm;
    car.batteryCapacity = raw.batteryCapacityKwh;
    car.usableBatteryCapacity =
      raw.usableBatteryCapacityKwh || raw.batteryCapacityKwh;
    car.maxChargingPower = raw.maxDcChargingKw;
    car.acCharging = raw.maxAcChargingKw;
    car.connectorType = raw.chargingConnector;
  } else {
    car.fuelEfficiency = raw.fuelEfficiencyKmPerLitre;
    car.fuelTankCapacity = raw.fuelTankCapacityLitres;
    car.engineCapacityCc = engineCc;
  }

  return car;
}

export const allVehicles = rawCars.map(normalizeCar);

export const evVehicles = allVehicles.filter((c) => c.type === "ev");

export const fuelVehicles = allVehicles.filter((c) => c.type === "petrol" || c.type === "diesel");

export const petrolVehicles = allVehicles.filter((c) => c.type === "petrol");

export const dieselVehicles = allVehicles.filter((c) => c.type === "diesel");

/** Human-readable fuel label for badges ("Petrol", "Diesel", "CNG", …). */
export function fuelLabel(type) {
  return FUEL_LABELS[type] || "Fuel";
}

export function getVehicle(id) {
  return allVehicles.find((c) => c.id === id) || null;
}
