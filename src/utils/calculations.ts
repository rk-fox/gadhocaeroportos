import { PistaConfiguracao } from './aerodromeService';
import { EtapaType } from '../App';

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
  depFuelRate: 2.5,
  arrFuelRate: 0.8, //(0.15*0.16)+(0.35*1.2)+(0.5*0.14) = 0.514kg/s na conta ponderada
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

  // ARR Gain (only if Etapa is ARR or not specified)
  const arr = (etapa === 'DEP') ? emptyResult() : calculateResult(
    item.rot_arr_cabeceira - item.rot_arr_intersecao,
    factors.arrFuelRate,
    item.dist_arr_cabeceira - item.dist_arr_intersecao
  );
  arr.category = 'Pouso';

  // TAXI DEP Gain (only if Etapa is DEP or not specified)
  const taxiDepDist = Math.max(0, item.taxi_dep_cabeceira - item.taxi_dep_intersecao);
  const taxiDepTime = taxiDepDist / factors.taxiSpeed;
  const taxiDep = (etapa === 'ARR') ? emptyResult() : calculateResult(taxiDepTime, factors.taxiFuelRate, taxiDepDist);
  taxiDep.category = 'Taxi DEP';

  // TAXI ARR Gain (only if Etapa is ARR or not specified)
  const taxiArrDist = Math.max(0, item.taxi_arr_cabeceira - item.taxi_arr_intersecao);
  const taxiArrTime = taxiArrDist / factors.taxiSpeed;
  const taxiArr = (etapa === 'DEP') ? emptyResult() : calculateResult(taxiArrTime, factors.taxiFuelRate, taxiArrDist);
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
