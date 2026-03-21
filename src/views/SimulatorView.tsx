import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Clock, Fuel, Wind, Maximize, BarChart3, Calculator } from 'lucide-react';
import { calculateGains, CalculationFactors } from '../utils/calculations';
import { EtapaType, MetricType } from '../App';
import { aerodromeService, Aerodromo, PistaConfiguracao } from '../utils/aerodromeService';
import { Tooltip } from '../components/Shared';

interface SimulatorViewProps {
  scale: number;
  factors: CalculationFactors;
  activeMetric: MetricType;
  activeAerodromeId: number;
  activeAerodrome?: Aerodromo;
  activeEtapa: EtapaType;
}

export default function SimulatorView({ factors, activeAerodromeId, activeAerodrome, activeEtapa }: SimulatorViewProps) {
  // Estados dos Parâmetros
  const [flightsPerDay, setFlightsPerDay] = useState(20);
  const [daysPerMonth, setDaysPerMonth] = useState(30);
  const [adoptionRate, setAdoptionRate] = useState(80);
  
  // Estados de Seleção
  const [pistas, setPistas] = useState<PistaConfiguracao[]>([]);
  const [selectedPistaId, setSelectedPistaId] = useState<number | null>(null);
  const [periodoSelecionado, setPeriodoSelecionado] = useState<'mes' | 'winter' | 'summer'>('mes');

  useEffect(() => {
    if (activeAerodromeId) {
      aerodromeService.getPistasConfiguracao(activeAerodromeId).then(data => {
        setPistas(data);
        if (data.length > 0) {
          const highlight = data.find(p => p.destaque);
          setSelectedPistaId(highlight ? highlight.id : data[0].id);
        }
      });
    }
  }, [activeAerodromeId]);

  const selectedPista = pistas.find(p => p.id === selectedPistaId);

  // Lógica de Período Dinâmico
  let activeDays = daysPerMonth;
  if (periodoSelecionado === 'winter') activeDays = 118;
  if (periodoSelecionado === 'summer') activeDays = 247;

  // Cálculos de Volume
  const totalFlights = flightsPerDay * activeDays * (adoptionRate / 100);
  
  // Informações para o card "Volume Projetado" (mantendo as projeções visíveis para ref.)
  const totalMonthlyFlights = flightsPerDay * daysPerMonth * (adoptionRate / 100);
  const totalWinter = flightsPerDay * 118 * (adoptionRate / 100);
  const totalSummer = flightsPerDay * 247 * (adoptionRate / 100);
  
  // Ganhos Unitários
  const unitGainsDEP = useMemo(() => 
    selectedPista ? calculateGains(selectedPista, factors, 1, 'DEP') : null,
  [selectedPista, factors]);
  
  const unitGainsARR = useMemo(() => 
    selectedPista ? calculateGains(selectedPista, factors, 1, 'ARR') : null,
  [selectedPista, factors]);

  // Economia Dinâmica (usada nos cards)
  const savingsDEP = useMemo(() => unitGainsDEP ? {
    time: unitGainsDEP.total.time * totalFlights,
    fuel: unitGainsDEP.total.fuel * totalFlights,
    distance: unitGainsDEP.total.distance * totalFlights,
    co2: unitGainsDEP.total.co2 * totalFlights,
  } : { time: 0, fuel: 0, distance: 0, co2: 0 }, [unitGainsDEP, totalFlights]);

  const savingsARR = useMemo(() => unitGainsARR ? {
    time: unitGainsARR.total.time * totalFlights,
    fuel: unitGainsARR.total.fuel * totalFlights,
    distance: unitGainsARR.total.distance * totalFlights,
    co2: unitGainsARR.total.co2 * totalFlights,
  } : { time: 0, fuel: 0, distance: 0, co2: 0 }, [unitGainsARR, totalFlights]);

  // Títulos dinâmicos
  const tituloPeriodo = periodoSelecionado === 'mes' ? 'Mensal' : periodoSelecionado === 'winter' ? 'Winter' : 'Summer';

  return (
    <div className="max-w-7xl mx-auto">
      <section className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-extrabold text-text-main tracking-tight leading-none mb-2">
            Simulador de Impacto {tituloPeriodo} ({activeAerodrome?.indicativo})
          </h2>
          <p className="text-text-muted">
            Projete a economia acumulada para a pista selecionada ({activeEtapa}) em {activeAerodrome?.indicativo}.
          </p>
        </div>

        {/* Periodicity Selector */}
        <div className="flex items-center bg-surface-low rounded-lg p-1 gap-1 border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase px-2">Período:</span>
          
          <button 
            onClick={() => setPeriodoSelecionado('mes')}
            className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${
              periodoSelecionado === 'mes' 
                ? 'bg-white shadow-sm text-gain border border-slate-100' 
                : 'text-text-muted hover:bg-white/50'
            }`}
          >
            Mês
          </button>

          <button 
            onClick={() => setPeriodoSelecionado('winter')}
            className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${
              periodoSelecionado === 'winter' 
                ? 'bg-white shadow-sm text-gain border border-slate-100' 
                : 'text-text-muted hover:bg-white/50'
            }`}
          >
            Winter
          </button>

          <button 
            onClick={() => setPeriodoSelecionado('summer')}
            className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${
              periodoSelecionado === 'summer' 
                ? 'bg-white shadow-sm text-gain border border-slate-100' 
                : 'text-text-muted hover:bg-white/50'
            }`}
          >
            Summer
          </button>
        </div>
        
        {/* Runway Selector */}
        <div className="flex items-center bg-surface-low rounded-lg p-1 gap-1 border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase px-2">Pista:</span>
          {pistas.map(p => (
            <button 
              key={p.id}
              onClick={() => setSelectedPistaId(p.id)}
              className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${selectedPistaId === p.id ? 'bg-white shadow-sm text-gain border border-slate-100' : 'text-text-muted hover:bg-white/50'}`}
            >
              {p.pista_identificador}
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Simulator Controls */}
        <div className="bg-surface-card p-8 rounded-xl shadow-sm border border-slate-100 space-y-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-surface-low rounded-lg text-text-main shadow-inner">
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
              unit=" voos"
            />
            
            {/* Oculta controle de dias se não for "mes" */}
            {periodoSelecionado === 'mes' && (
              <SliderGroup 
                label="Dias por mês" 
                value={daysPerMonth} 
                min={1} max={31} 
                onChange={setDaysPerMonth} 
                unit=" dias"
              />
            )}

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
            <div className="flex flex-col gap-y-1 mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Volume Projetado
              </span>
              <span className={`text-sm font-black transition-colors ${periodoSelecionado === 'mes' ? 'text-gain' : 'text-slate-400'}`}>
                {totalMonthlyFlights.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} voos/mês
              </span>
              <span className={`text-sm font-black transition-colors ${periodoSelecionado === 'summer' ? 'text-gain' : 'text-slate-400'}`}>
                {totalSummer.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} voos/temporada (Summer)
              </span>
              <span className={`text-sm font-black transition-colors ${periodoSelecionado === 'winter' ? 'text-gain' : 'text-slate-400'}`}>
                {totalWinter.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} voos/temporada (Winter)
              </span>
            </div>
            
            <p className="text-[10px] text-text-muted leading-relaxed italic">
              * Calculado para Pista {selectedPista?.pista_identificador} na etapa de {activeEtapa}.
            </p>
            <p className="text-[10px] text-text-muted leading-relaxed italic mt-1">
  * Para o período {periodoSelecionado === 'mes' ? 'mensal' : periodoSelecionado} são considerados {activeDays} dias no cálculo.
            </p>
          </div>
        </div>

        {/* Projection Results */}
        <div className="lg:col-span-2 space-y-12">
          {/* DEPARTURES */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-slate-200"></div>
              <h4 className="text-sm font-black text-gain uppercase tracking-widest px-4 py-1 bg-gain-light/10 rounded-full border border-gain/20">
                Ganhos em Decolagem (DEP)
              </h4>
              <div className="h-px flex-1 bg-slate-200"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Tooltip content="Redução total de distância percorrida em solo e ar (Decolagem).">
                <ResultCard 
                  label="Distância Reduzida" 
                  value={`${(savingsDEP.distance / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km`} 
                  icon={<Maximize size={24} className="text-sidebar" />} 
                />
              </Tooltip>
              <Tooltip content="Tempo total economizado considerando taxi e procedimentos (Decolagem).">
                <ResultCard 
                  label="Tempo de Voo Poupado" 
                  value={`${(savingsDEP.time / 3600).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} h`} 
                  icon={<Clock size={24} className="text-sidebar" />} 
                />
              </Tooltip>
              <Tooltip content="Economia estimada de combustível (Decolagem).">
                <ResultCard 
                  label="Economia de Combustível" 
                  value={`${savingsDEP.fuel.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} kg`} 
                  icon={<Fuel size={24} className="text-sidebar" />} 
                />
              </Tooltip>
              <Tooltip content="Redução direta na emissão de CO2 (Decolagem).">
                <ResultCard 
                  label="Redução de CO2" 
                  value={`${savingsDEP.co2.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} kg`} 
                  icon={<Wind size={24} className="text-sidebar" />} 
                />
              </Tooltip>
            </div>
          </div>

          {/* ARRIVALS */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-slate-200"></div>
              <h4 className="text-sm font-black text-gain uppercase tracking-widest px-4 py-1 bg-gain-light/10 rounded-full border border-gain/20">
                Ganhos em Pouso (ARR)
              </h4>
              <div className="h-px flex-1 bg-slate-200"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Tooltip content="Redução total de distância percorrida em solo e ar (Pouso).">
                <ResultCard 
                  label="Distância Reduzida" 
                  value={`${(savingsARR.distance / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km`} 
                  icon={<Maximize size={24} className="text-gain" />} 
                />
              </Tooltip>
              <Tooltip content="Tempo total economizado considerando taxi e procedimentos (Pouso).">
                <ResultCard 
                  label="Tempo de Voo Poupado" 
                  value={`${(savingsARR.time / 3600).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} h`} 
                  icon={<Clock size={24} className="text-gain" />} 
                />
              </Tooltip>
              <Tooltip content="Economia estimada de combustível (Pouso).">
                <ResultCard 
                  label="Economia de Combustível" 
                  value={`${savingsARR.fuel.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} kg`} 
                  icon={<Fuel size={24} className="text-gain" />} 
                />
              </Tooltip>
              <Tooltip content="Redução direta na emissão de CO2 (Pouso).">
                <ResultCard 
                  label="Redução de CO2" 
                  value={`${savingsARR.co2.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} kg`} 
                  icon={<Wind size={24} className="text-gain" />} 
                />
              </Tooltip>
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
      <div className="w-12 h-12 rounded-full bg-gain-light/10 flex items-center justify-center shadow-inner">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-bold text-text-muted uppercase tracking-tight">{label}</span>
        <span className="text-2xl font-display font-black text-text-main">{value}</span>
      </div>
    </div>
  );
}
