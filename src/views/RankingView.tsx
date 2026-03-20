import React, { useState, useEffect } from 'react';
import { Trophy, Medal, MapPin, Clock, Fuel, Wind, Maximize, TrendingUp } from 'lucide-react';
import { calculateGains, CalculationFactors } from '../utils/calculations';
import { MetricType, EtapaType } from '../App';
import { aerodromeService, Aerodromo, PistaConfiguracao } from '../utils/aerodromeService';
import { Tooltip } from '../components/Shared';

interface RankingViewProps {
  scale: number;
  factors: CalculationFactors;
  activeMetric: MetricType;
  activeEtapa: EtapaType;
  activeAerodromeId: number;
  activeAerodrome?: Aerodromo;
}

export default function RankingView({ scale, factors, activeMetric, activeEtapa }: RankingViewProps) {
  const [allPistas, setAllPistas] = useState<(PistaConfiguracao & { aerodromo?: Aerodromo })[]>([]);
  const [aerodromos, setAerodromos] = useState<Aerodromo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aeros, pistas] = await Promise.all([
          aerodromeService.getAerodromos(),
          aerodromeService.getPistasConfiguracao()
        ]);
        setAerodromos(aeros);
        
        const pistasWithAero = pistas.map(p => ({
          ...p,
          aerodromo: aeros.find(a => a.id === p.aerodromo_id)
        }));
        
        setAllPistas(pistasWithAero);
      } catch (error) {
        console.error('Error fetching ranking data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate results for all records
  const results = allPistas.map(pista => {
    const gains = calculateGains(pista, factors, scale, activeEtapa);
    
    let beforeVal = 0;
    let afterVal = 0;
    
    if (activeEtapa === 'DEP') {
      // Cenário Base: Taxi + ROT + OMNI Antiga
      beforeVal = pista.taxi_dep_cabeceira + pista.rot_dep_cabeceira + pista.omni_antiga;
      // Cenário Otimizado: Taxi + ROT + OMNI Otimizada
      afterVal = pista.taxi_dep_intersecao + pista.rot_dep_intersecao + pista.omni_otimizada;
    } else {
      // Cenário ARR: Taxi + ROT (Cuidado: Verifique se há OMNI aqui também no seu modelo)
      beforeVal = pista.taxi_arr_cabeceira + pista.rot_arr_cabeceira;
      afterVal = pista.taxi_arr_intersecao + pista.rot_arr_intersecao;
    }

    // A fórmula correta do ganho percentual (Redução em relação ao original)
    const gainPercent = beforeVal > 0 
      ? ((beforeVal - afterVal) / beforeVal) * 100 
      : 0;

    return {
      pista,
      gains,
      gainPercent: Math.max(0, gainPercent) // Evita valores negativos se o "otimizado" for pior
    };
  });

  // Sort by gain percentage
  const sortedResults = [...results].sort((a, b) => b.gainPercent - a.gainPercent);

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

  if (isLoading) return <div className="flex items-center justify-center h-64">Carregando ranking...</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <section className="mb-10">
        <h2 className="text-3xl font-display font-extrabold text-text-main tracking-tight leading-none mb-2">
          Ranking de Melhorias ({activeEtapa})
        </h2>
        <p className="text-text-muted">
          Comparação por percentual de ganho entre aeródromos e pistas.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Leaderboard */}
        <div className="lg:col-span-2 bg-surface-card p-8 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-surface-low rounded-lg text-sidebar shadow-inner">
              <Trophy size={24} />
            </div>
            <h3 className="text-xl font-display font-bold text-text-main">Melhores Aproveitamentos</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest w-16 text-center">Rank</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">AERÓDROMO / PISTA</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right whitespace-nowrap">GANHO (%)</th>
                </tr>
              </thead>
              <tbody>
                {sortedResults.map((res, index) => (
                  <tr 
                    key={res.pista.id} 
                    className="border-b border-slate-100 last:border-0 hover:bg-surface-low transition-colors group cursor-help"
                  >
                    <td className="py-4 px-4 flex justify-center items-center">
                      {renderMedal(index + 1)}
                    </td>
                    <td className="py-4 px-4">
                      <Tooltip content={`Ganho Bruto: ${res.gains.total[activeMetric].toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ${getMetricLabel(activeMetric).split(' ')[1] || ''}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 transition-colors group-hover:bg-gain-light/20 group-hover:text-gain">
                            {res.pista.aerodromo?.indicativo}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-text-main text-sm">Pista {res.pista.pista_identificador}</span>
                            <span className="text-[10px] text-text-muted uppercase tracking-wider">{res.pista.dep_taxiway} / {res.pista.arr_taxiway}</span>
                          </div>
                        </div>
                      </Tooltip>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex flex-col items-end">
                        <span className="text-lg font-display font-bold text-gain">
                          {res.gainPercent.toFixed(1)}%
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-text-muted">
                           <TrendingUp size={10} className="text-gain-light" />
                           <span>EFICIÊNCIA</span>
                        </div>
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
            Critério de Ranking
          </h3>
          
          <div className="flex-1 space-y-6">
            <p className="text-sm text-text-muted mb-4 leading-relaxed">
              O ranking utiliza o <strong>percentual de melhoria</strong> em relação ao cenário base para garantir uma comparação justa entre aeródromos de diferentes portes.
            </p>
            
            <div className="space-y-4">
              <div className="bg-surface-low p-4 rounded-lg border-l-4 border-sidebar">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Cenário Ativo</span>
                <span className="text-sm font-bold text-text-main block">Etapa de {activeEtapa}</span>
              </div>
              
              <div className="p-4 rounded-lg border border-slate-100 shadow-sm bg-gain-light/5">
                <h4 className="text-xs font-bold text-gain uppercase mb-2">Dica Operacional</h4>
                <p className="text-[11px] text-text-muted italic">
                  Passe o mouse sobre o rank da tabela para visualizar os valores brutos de economia em {getMetricLabel(activeMetric)}.
                </p>
              </div>

              <div className="p-4 rounded-lg border border-slate-100">
                <h4 className="text-xs font-bold text-text-main uppercase mb-2">Estatísticas</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Aeródromos</span>
                    <span className="font-bold">{aerodromos.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Pistas Analisadas</span>
                    <span className="font-bold">{allPistas.length}</span>
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
