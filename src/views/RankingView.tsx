import React, { useState, useEffect } from 'react';
import { Trophy, Medal, MapPin, Clock, Fuel, Wind, Maximize } from 'lucide-react';
import { AIRPORT_DATA } from '../data/airportData';
import { calculateGains, CalculationFactors } from '../utils/calculations';
import { MetricType } from '../App';

interface RankingViewProps {
  scale: number;
  factors: CalculationFactors;
  globalMetric?: MetricType;
}

export default function RankingView({ scale, factors, globalMetric }: RankingViewProps) {
  const [activeMetric, setActiveMetric] = useState<MetricType>(globalMetric || 'fuel');

  // Sync with global metric if it changes
  useEffect(() => {
    if (globalMetric) {
      setActiveMetric(globalMetric);
    }
  }, [globalMetric]);

  // Calculate results for all records
  const results = AIRPORT_DATA.map(item => ({
    item,
    gains: calculateGains(item, factors, scale)
  }));

  // Sort by active metric
  const sortedResults = [...results].sort((a, b) => b.gains.total[activeMetric] - a.gains.total[activeMetric]);

  const renderMedal = (rank: number) => {
    if (rank === 1) return <Medal size={20} className="text-yellow-500" />;
    if (rank === 2) return <Medal size={20} className="text-slate-400" />;
    if (rank === 3) return <Medal size={20} className="text-amber-700" />;
    return <span className="text-sm font-bold text-slate-500 w-5 text-center">{rank}</span>;
  };

  const getMetricLabel = (type: MetricType) => {
    switch (type) {
      case 'time': return 'Tempo (s)';
      case 'fuel': return 'Combustível (kg)';
      case 'co2': return 'CO2 (kg)';
      case 'distance': return 'Distância (m)';
    }
  };

  const getMetricIcon = (type: MetricType) => {
    switch (type) {
      case 'time': return <Clock size={14} />;
      case 'fuel': return <Fuel size={14} />;
      case 'co2': return <Wind size={14} />;
      case 'distance': return <Maximize size={14} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <section className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-display font-extrabold text-text-main tracking-tight leading-none mb-2">
            Ranking de Eficiência
          </h2>
          <p className="text-text-muted">
            Impacto potencial de otimização por aeródromo e pista.
          </p>
        </div>

        <div className="flex bg-surface-low p-1 rounded-xl border border-slate-200 shadow-inner">
          {(['time', 'fuel', 'co2', 'distance'] as MetricType[]).map((m) => (
            <button
              key={m}
              onClick={() => setActiveMetric(m)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeMetric === m 
                  ? 'bg-white text-gain shadow-sm' 
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              {getMetricIcon(m)}
              {getMetricLabel(m).split(' ')[0]}
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Leaderboard */}
        <div className="lg:col-span-2 bg-surface-card p-8 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-surface-low rounded-lg text-text-main">
              <Trophy size={24} />
            </div>
            <h3 className="text-xl font-display font-bold text-text-main">Top Otimizações</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest w-16 text-center">Rank</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Aeródromo / Pista</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Potencial de Ganho</th>
                </tr>
              </thead>
              <tbody>
                {sortedResults.map((res, index) => (
                  <tr key={`${res.item.aerodrome}-${res.item.runway}`} className="border-b border-slate-100 last:border-0 hover:bg-surface-low transition-colors group">
                    <td className="py-4 px-4 flex justify-center items-center">
                      {renderMedal(index + 1)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 transition-colors group-hover:bg-gain-light/20 group-hover:text-gain">
                          {res.item.aerodrome}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-text-main text-sm">Pista {res.item.runway}</span>
                          <span className="text-[10px] text-text-muted uppercase tracking-wider">{res.item.taxiway_dep} / {res.item.taxiway_arr}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex flex-col items-end">
                        <span className="text-lg font-display font-bold text-gain">
                          {res.gains.total[activeMetric].toLocaleString('pt-BR', { maximumFractionDigits: 1 })}
                        </span>
                        <span className="text-[10px] font-medium text-text-muted uppercase tracking-tighter">
                          {getMetricLabel(activeMetric).split(' ')[1] || getMetricLabel(activeMetric)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-surface-card p-8 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-display font-bold text-text-main mb-6 flex items-center gap-2">
            <MapPin size={20} className="text-gain" />
            Análise por Recurso
          </h3>
          
          <div className="flex-1 space-y-6">
            <p className="text-sm text-text-muted mb-4 leading-relaxed">
              O ranking destaca os recursos aeroportuários com maior potencial de economia através da adoção de procedimentos otimizados.
            </p>
            
            <div className="space-y-4">
              <div className="bg-surface-low p-4 rounded-lg border-l-4 border-gain">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Métrica Ativa</span>
                <span className="text-sm font-bold text-text-main block">{getMetricLabel(activeMetric)}</span>
              </div>
              
              <div className="p-4 rounded-lg border border-slate-100">
                <h4 className="text-xs font-bold text-text-main uppercase mb-2">Resumo Geral</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">Total Aeródromos</span>
                    <span className="font-bold">2</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">Total Pistas</span>
                    <span className="font-bold">{AIRPORT_DATA.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
