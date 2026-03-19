import { AirportRunwayData } from '../data/airportData';

export interface CalculationFactors {
  taxiSpeed: number;      // m/s
  taxiFuelRate: number;   // kg/s
  depFuelRate: number;    // kg/s
  arrFuelRate: number;    // kg/s
  omniFuelRate: number;   // kg/s
  omniClimbRate: number;  // ft/min
  omniSpeed: number;      // kt
  co2Factor: number;      // multiplier
}

export const DEFAULT_FACTORS: CalculationFactors = {
  taxiSpeed: 7.7,
  taxiFuelRate: 0.33,
  depFuelRate: 5.4,
  arrFuelRate: 5.4,
  omniFuelRate: 1.5,
  omniClimbRate: 2500,
  omniSpeed: 200,
  co2Factor: 3.15,
};

export interface GainResult {
  category: string;
  time: number;     // seconds
  fuel: number;     // kg
  distance: number; // meters
  co2: number;      // kg
}

export interface DetailedGainResult {
  dep: GainResult;
  arr: GainResult;
  taxiDep: GainResult;
  taxiArr: GainResult;
  omni: GainResult;
  total: GainResult;
}

export function calculateGains(item: AirportRunwayData, factors: CalculationFactors, scale: number = 1): DetailedGainResult {
  const calculateResult = (timeS: number, fuelRate: number, distanceM: number): GainResult => {
    const time = Math.max(0, timeS) * scale;
    const distance = Math.max(0, distanceM) * scale;
    const fuel = time * fuelRate;
    const co2 = fuel * factors.co2Factor;
    return { category: '', time, fuel, distance, co2 };
  };

  // DEP Gain
  const dep = calculateResult(
    item.rot_dep_cab - item.rot_dep_int,
    factors.depFuelRate,
    item.dist_dep_cab - item.dist_dep_int
  );
  dep.category = 'Decolagem';

  // ARR Gain
  const arr = calculateResult(
    item.rot_arr_cab - item.rot_arr_int,
    factors.arrFuelRate,
    item.dist_arr_cab - item.dist_arr_int
  );
  arr.category = 'Pouso';

  // TAXI DEP Gain
  const taxiDepDist = Math.max(0, item.taxi_dep_cab - item.taxi_dep_int);
  const taxiDepTime = taxiDepDist / factors.taxiSpeed;
  const taxiDep = calculateResult(taxiDepTime, factors.taxiFuelRate, taxiDepDist);
  taxiDep.category = 'Taxi DEP';

  // TAXI ARR Gain
  const taxiArrDist = Math.max(0, item.taxi_arr_cab - item.taxi_arr_int);
  const taxiArrTime = taxiArrDist / factors.taxiSpeed;
  const taxiArr = calculateResult(taxiArrTime, factors.taxiFuelRate, taxiArrDist);
  taxiArr.category = 'Taxi ARR';

  // OMNI Gain
  // Time (s) = ( (H_old - H_opt) / 2500 ) * 60
  const omniDiffH = item.omni_old - item.omni_opt;
  const omniTimeS = (omniDiffH / factors.omniClimbRate) * 60;
  // Distance (m) = (Time_s / 3600 * Speed_kt) * 1.852 * 1000
  const omniDistM = (omniTimeS / 3600 * factors.omniSpeed) * 1.852 * 1000;
  const omni = calculateResult(omniTimeS, factors.omniFuelRate, omniDistM);
  omni.category = 'OMNI';

  // Total
  const total: GainResult = {
    category: 'Total',
    time: dep.time + arr.time + taxiDep.time + taxiArr.time + omni.time,
    fuel: dep.fuel + arr.fuel + taxiDep.fuel + taxiArr.fuel + omni.fuel,
    distance: dep.distance + arr.distance + taxiDep.distance + taxiArr.distance + omni.distance,
    co2: dep.co2 + arr.co2 + taxiDep.co2 + taxiArr.co2 + omni.co2,
  };

  return { dep, arr, taxiDep, taxiArr, omni, total };
}
