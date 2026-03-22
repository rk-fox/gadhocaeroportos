import { PistaConfiguracao } from './aerodromeService';
import { EtapaType } from '../App';

export interface CalculationFactors {
  taxiSpeed: number;      // kt
  taxiDepFuelRate: number; // kg/s
  taxiArrFuelRate: number; // kg/s
  depFuelRate: number;    // kg/s
  arrIdleRate: number;    // kg/s
  arrRevRate: number;     // kg/s
  arrRollRate: number;    // kg/s
  arrVref: number;        // kt
  arrMinIntensity: number; // min intensity
  arrMaxIntensity: number; // max intensity
  arrMinRevPercent: number; // min reverse percentage (0.15)
  arrMaxRevPercent: number; // max reverse percentage (0.65)
  omniFuelRate: number;   // kg/s
  omniClimbRate: number;  // ft/min
  omniSpeed: number;      // kt
  co2Factor: number;      // multiplier
}

export const DEFAULT_FACTORS: CalculationFactors = {
  taxiSpeed: 15, // kt
  taxiDepFuelRate: 0.33,
  taxiArrFuelRate: 0.25,
  depFuelRate: 2.5,
  arrIdleRate: 0.16,
  arrRevRate: 1.20,
  arrRollRate: 0.14,
  arrVref: 140, //137 pro A320 e 147 pro B738
  arrMinIntensity: 0.6,
  arrMaxIntensity: 1.6,
  arrMinRevPercent: 0.15,
  arrMaxRevPercent: 0.80,
  omniFuelRate: 1.5,
  omniClimbRate: 2750, //3000 B738 e 2500 A320
  omniSpeed: 170, //165 B738 e 175 A320
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

export function calculateGains(
  item: PistaConfiguracao, 
  factors: CalculationFactors, 
  scale: number = 1,
  etapa?: EtapaType
): DetailedGainResult {
  const calculateResult = (timeS: number, fuelRate: number, distanceM: number): GainResult => {
    const time = Math.max(0, timeS) * scale;
    const distance = Math.max(0, distanceM) * scale;
    const fuel = time * fuelRate;
    const co2 = fuel * factors.co2Factor;
    return { category: '', time, fuel, distance, co2 };
  };

  const emptyResult = (): GainResult => ({ category: '', time: 0, fuel: 0, distance: 0, co2: 0 });

  // DEP Gain (only if Etapa is DEP or not specified)
  const dep = (etapa === 'ARR') ? emptyResult() : calculateResult(
    item.rot_dep_cabeceira - item.rot_dep_intersecao,
    factors.depFuelRate,
    item.dist_dep_cabeceira - item.dist_dep_intersecao
  );
  dep.category = 'Decolagem';

  // Dynamic ARR Fuel calculation
  const calculateDynamicLandingFuel = (timeOnRunway: number, runwayLength: number): number => {
    if (runwayLength <= 0 || timeOnRunway <= 0) return 0;
    const vrefMs = factors.arrVref * 0.514444; // converte knots para m/s
    const intensity = (vrefMs * timeOnRunway) / runwayLength;
    const diffIntensity = Math.max(0.001, factors.arrMaxIntensity - factors.arrMinIntensity);
    const diffRev = factors.arrMaxRevPercent - factors.arrMinRevPercent;
    let pRev = factors.arrMinRevPercent + (intensity - factors.arrMinIntensity) * (diffRev / diffIntensity);
    pRev = Math.max(factors.arrMinRevPercent, Math.min(factors.arrMaxRevPercent, pRev));
    const pIdle = 0.15; // Toque/Flare percent is fixed
    const pRoll = 1 - (pRev + pIdle);
    return timeOnRunway * (pIdle * factors.arrIdleRate + pRev * factors.arrRevRate + pRoll * factors.arrRollRate);
  };

  // ARR Gain (only if Etapa is ARR or not specified)
  let arr = emptyResult();
  if (etapa !== 'DEP') {
    const timeCab = item.rot_arr_cabeceira;
    const distCab = item.dist_arr_cabeceira;
    const timeInt = item.rot_arr_intersecao;
    const distInt = item.dist_arr_intersecao;

    const fuelCab = calculateDynamicLandingFuel(timeCab, distCab);
    const fuelInt = calculateDynamicLandingFuel(timeInt, distInt);

    const timeDiff = Math.max(0, timeCab - timeInt) * scale;
    const distDiff = Math.max(0, distCab - distInt) * scale;
    const fuelDiff = Math.max(0, fuelCab - fuelInt) * scale;
    const co2Diff = fuelDiff * factors.co2Factor;

    arr = {
      category: 'Pouso',
      time: timeDiff,
      distance: distDiff,
      fuel: fuelDiff,
      co2: co2Diff
    };
  }

  const taxiSpeedMs = factors.taxiSpeed * 0.514444;

  // TAXI DEP Gain (only if Etapa is DEP or not specified)
  const taxiDepDist = Math.max(0, item.taxi_dep_cabeceira - item.taxi_dep_intersecao);
  const taxiDepTime = taxiDepDist / taxiSpeedMs;
  const taxiDep = (etapa === 'ARR') ? emptyResult() : calculateResult(taxiDepTime, factors.taxiDepFuelRate, taxiDepDist);
  taxiDep.category = 'Taxi DEP';

  // TAXI ARR Gain (only if Etapa is ARR or not specified)
  const taxiArrDist = Math.max(0, item.taxi_arr_cabeceira - item.taxi_arr_intersecao);
  const taxiArrTime = taxiArrDist / taxiSpeedMs;
  const taxiArr = (etapa === 'DEP') ? emptyResult() : calculateResult(taxiArrTime, factors.taxiArrFuelRate, taxiArrDist);
  taxiArr.category = 'Taxi ARR';

  // OMNI Gain (only if Etapa is DEP or not specified - based on user description DEP = omni)
  const omniDiffH = item.omni_antiga - item.omni_otimizada;
  const omniTimeS = (omniDiffH / factors.omniClimbRate) * 60;
  const omniDistM = (omniTimeS / 3600 * factors.omniSpeed) * 1.852 * 1000;
  const omni = (etapa === 'ARR') ? emptyResult() : calculateResult(omniTimeS, factors.omniFuelRate, omniDistM);
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
