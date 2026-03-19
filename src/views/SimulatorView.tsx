import React, { useState } from 'react';
import { Activity, Clock, Fuel, Wind, Maximize, BarChart3, Calculator } from 'lucide-react';
import { AIRPORT_DATA } from '../data/airportData';
import { calculateGains, CalculationFactors } from '../utils/calculations';

interface SimulatorViewProps {
  scale: number;
  factors: CalculationFactors;
  activeAerodrome?: string;
}

export default function SimulatorView({ factors, activeAerodrome = 'SBBR' }: SimulatorViewProps) {
  const [flightsPerDay, setFlightsPerDay] = useState(50);
  const [daysPerMonth, setDaysPerMonth] = useState(30);
  const [adoptionRate, setAdoptionRate] = useState(80);

  // Calculate potential monthly gain (sum of all runways in the active aerodrome)
  const airportItems = AIRPORT_DATA.filter(item => item.aerodrome === activeAerodrome);
  
  const unitGains = airportItems.reduce((acc, item) => {
    const g = calculateGains(item, factors, 1);
    acc.time += g.total.time;
    acc.fuel += g.total.fuel;
    acc.distance += g.total.distance;
    acc.co2 += g.total.co2;
    return acc;
  }, { time: 0, fuel: 0, distance: 0, co2: 0 });

  // Average unit gain across runways
  const avgUnitGain = {
    time: airportItems.length > 0 ? unitGains.time / airportItems.length : 0,
    fuel: airportItems.length > 0 ? unitGains.fuel / airportItems.length : 0,
    distance: airportItems.length > 0 ? unitGains.distance / airportItems.length : 0,
    co2: airportItems.length > 0 ? unitGains.co2 / airportItems.length : 0,
  };

  const totalMonthlyFlights = flightsPerDay * daysPerMonth * (adoptionRate / 100);
  
  const monthlySavings = {
    time: avgUnitGain.time * totalMonthlyFlights,
    fuel: avgUnitGain.fuel * totalMonthlyFlights,
    distance: avgUnitGain.distance * totalMonthlyFlights,
    co2: avgUnitGain.co2 * totalMonthlyFlights,
  };

  return (
    <div className="max-w-7xl mx-auto">
      <section className="mb-10">
        <h2 className="text-3xl font-display font-extrabold text-text-main tracking-tight leading-none mb-2">
          Simulador de Impacto Mensal ({activeAerodrome})
        </h2>
        <p className="text-text-muted">
          Projete a economia acumulada baseada no volume de tráfego e taxa de adesão para {activeAerodrome}.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Simulator Controls */}
        <div className="bg-surface-card p-8 rounded-xl shadow-sm border border-slate-100 space-y-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-surface-low rounded-lg text-text-main">
              <Calculator size={20} />
            </div>
            <h3 className="text-lg font-display font-bold text-text-main">Parâmetros da Operação</h3>
          </div>

          <div className="space-y-6">
            <SliderGroup 
              label="Voos por dia" 
              value={flightsPerDay} 
              min={1} max={500} 
              onChange={setFlightsPerDay} 
              unit="voos"
            />
            <SliderGroup 
              label="Dias por mês" 
              value={daysPerMonth} 
              min={1} max={31} 
              onChange={setDaysPerMonth} 
              unit="dias"
            />
            <SliderGroup 
              label="Taxa de Adesão" 
              value={adoptionRate} 
              min={0} max={100} 
              onChange={setAdoptionRate} 
              unit="%"
              color="accent-gain"
            />
          </div>

          <div className="pt-6 border-t border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Volume Projetado</span>
              <span className="text-sm font-bold text-text-main">{totalMonthlyFlights.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} voos/mês</span>
            </div>
            <p className="text-[10px] text-text-muted leading-relaxed">
              * Considera a média de potencial de economia entre todas as pistas de {activeAerodrome}.
            </p>
          </div>
        </div>

        {/* Projection Results */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ResultCard 
              label="Economia de Combustível" 
              value={`${monthlySavings.fuel.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} kg`} 
              icon={<Fuel size={24} className="text-gain" />} 
            />
            <ResultCard 
              label="Redução de CO2" 
              value={`${monthlySavings.co2.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} kg`} 
              icon={<Wind size={24} className="text-gain" />} 
            />
            <ResultCard 
              label="Tempo de Voo Poupado" 
              value={`${(monthlySavings.time / 3600).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} h`} 
              icon={<Clock size={24} className="text-gain" />} 
            />
            <ResultCard 
              label="Distância Reduzida" 
              value={`${(monthlySavings.distance / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km`} 
              icon={<Maximize size={24} className="text-gain" />} 
            />
          </div>

          {/* Chart Placeholder */}
          <div className="bg-surface-card p-8 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-center items-center min-h-[300px]">
            <BarChart3 size={48} className="text-slate-200 mb-4" />
            <span className="text-slate-400 text-sm font-medium">Projeção ({activeAerodrome})</span>
            <div className="w-full h-32 flex items-end gap-2 mt-8 px-8">
              {[40, 45, 55, 60, 75, 80, 85, 90, 95, 100, 100, 100].map((h, i) => (
                <div key={i} className="flex-1 bg-gain-light/30 rounded-t-sm transition-all hover:bg-gain hover:opacity-100" style={{ height: `${h}%` }}></div>
              ))}
            </div>
            <div className="w-full flex justify-between mt-2 px-8 text-[10px] font-bold text-slate-400 uppercase">
              <span>Jan</span>
              <span>Dez</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SliderGroup({ label, value, min, max, onChange, unit, color = 'accent-sidebar' }: any) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center bg-surface-low px-3 py-1.5 rounded-lg border border-slate-100">
        <label className="text-xs font-bold text-text-muted uppercase tracking-wider">{label}</label>
        <span className="text-sm font-black text-text-main">{value}{unit}</span>
      </div>
      <input 
        type="range" 
        min={min} max={max} 
        value={value} 
        onChange={(e) => onChange(parseInt(e.target.value))}
        className={`w-full h-1.5 bg-slate-200 rounded-lg cursor-pointer ${color}`}
      />
    </div>
  );
}

function ResultCard({ label, value, icon }: any) {
  return (
    <div className="bg-surface-card p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-full bg-gain-light/10 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-bold text-text-muted uppercase tracking-tight">{label}</span>
        <span className="text-2xl font-display font-black text-text-main">{value}</span>
      </div>
    </div>
  );
}
