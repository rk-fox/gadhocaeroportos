import React, { useState, useEffect } from 'react';
import { Trophy, Info, TrendingUp } from 'lucide-react';
import { calculateGains, CalculationFactors } from '../utils/calculations';
import { MetricType, EtapaType } from '../App';
import { aerodromeService, Aerodromo, PistaConfiguracao } from '../utils/aerodromeService';
import { Tooltip } from '../components/Shared';

interface GlobalRankViewProps {
  scale: number;
  factors: CalculationFactors;
  activeMetric: MetricType;
  activeEtapa: EtapaType;
}

export default function GlobalRankView({ scale, factors, activeMetric, activeEtapa }: GlobalRankViewProps) {
  const [data, setData] = useState<{ aerodromo: Aerodromo; pista: PistaConfiguracao }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aeros, pistas] = await Promise.all([
          aerodromeService.getAerodromos(),
          aerodromeService.getPistasConfiguracao()
        ]);
        
        // Filter only highlight runways for each aerodrome
        const highlightPistas = pistas.filter(p => p.destaque);
        
        const mappedData = highlightPistas.map(p => {
          const aero = aeros.find(a => a.id === p.aerodromo_id);
          return {
            pista: p,
            aerodromo: aero!
          };
        }).filter(item => item.aerodromo); // Ensure aerodrome exists

        setData(mappedData);
      } catch (error) {
        console.error('Error fetching global data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) return <div className="flex items-center justify-center h-64 text-slate-400">Analisando dados globais...</div>;

  const getMetricLabel = (m: MetricType) => {
    switch (m) {
      case 'time': return 'Tempo (s)';
      case 'fuel': return 'Combustível (kg)';
      case 'co2': return 'CO2 (kg)';
      case 'distance': return 'Distância (m)';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <section className="mb-10 text-center">
        <h2 className="text-3xl font-display font-extrabold text-text-main tracking-tight mb-2">
          Comparação Global de Eficiência
        </h2>
        <p className="text-text-muted max-w-2xl mx-auto">
          Visão consolidada do ganho operacional por aeródromo (Pistas Destaque), comparando o cenário base com o otimizado na etapa de {activeEtapa}.
        </p>
      </section>

      <div className="bg-surface-card p-10 rounded-2xl shadow-sm border border-slate-100 min-h-[580px] flex flex-col">
        <div className="flex items-center gap-3 mb-12">
          <div className="p-2 bg-gain-light/10 rounded-lg text-gain">
            <Trophy size={20} />
          </div>
          <h3 className="text-lg font-display font-bold text-text-main uppercase tracking-widest">Impacto nas Pistas Principais ({getMetricLabel(activeMetric)})</h3>
        </div>

        <div className="flex-1 overflow-x-auto">
          <div className="min-w-[800px] flex items-end justify-around gap-8 px-10 pt-36 pb-12 border-b border-slate-100 h-full">
            {data.length === 0 ? (
              <div className="w-full flex flex-col items-center justify-center py-20 text-slate-300">
                 <span className="text-sm font-bold uppercase tracking-widest">Nenhuma pista destaque configurada</span>
              </div>
            ) : data.map((item) => {
              const calculateScenarioTotal = (pista: PistaConfiguracao, scenario: 'base' | 'optimized') => {
                const isBase = scenario === 'base';
                
                if (activeEtapa === 'DEP') {
                  const dist = isBase ? pista.dist_dep_cabeceira : pista.dist_dep_intersecao;
                  const taxiDist = isBase ? pista.taxi_dep_cabeceira : pista.taxi_dep_intersecao;
                  const rotTime = isBase ? pista.rot_dep_cabeceira : pista.rot_dep_intersecao;
                  const omniAlt = isBase ? pista.omni_antiga : pista.omni_otimizada;
                  
                  const omniTime = (omniAlt / factors.omniClimbRate) * 60;
                  const omniDist = (omniTime / 3600 * factors.omniSpeed) * 1.852 * 1000;
                  const omniFuel = omniTime * factors.omniFuelRate;

                  const taxiTime = taxiDist / factors.taxiSpeed;
                  const taxiFuel = taxiTime * factors.taxiFuelRate;
                  const depFuel = rotTime * factors.depFuelRate;

                  if (activeMetric === 'distance') return (dist + taxiDist + omniDist) * scale;
                  if (activeMetric === 'time') return (rotTime + taxiTime + omniTime) * scale;
                  if (activeMetric === 'fuel') return (depFuel + taxiFuel + omniFuel) * scale;
                  if (activeMetric === 'co2') return (depFuel + taxiFuel + omniFuel) * factors.co2Factor * scale;
                } else {
                  const dist = isBase ? pista.dist_arr_cabeceira : pista.dist_arr_intersecao;
                  const taxiDist = isBase ? pista.taxi_arr_cabeceira : pista.taxi_arr_intersecao;
                  const rotTime = isBase ? pista.rot_arr_cabeceira : pista.rot_arr_intersecao;

                  const taxiTime = taxiDist / factors.taxiSpeed;
                  const taxiFuel = taxiTime * factors.taxiFuelRate;
                  const arrFuel = rotTime * factors.arrFuelRate;

                  if (activeMetric === 'distance') return (dist + taxiDist) * scale;
                  if (activeMetric === 'time') return (rotTime + taxiTime) * scale;
                  if (activeMetric === 'fuel') return (arrFuel + taxiFuel) * scale;
                  if (activeMetric === 'co2') return (arrFuel + taxiFuel) * factors.co2Factor * scale;
                }
                return 0;
              };

              const baseTotal = calculateScenarioTotal(item.pista, 'base');
              const optTotal = calculateScenarioTotal(item.pista, 'optimized');
              const totalGain = Math.max(0, baseTotal - optTotal);
              
              const gainPercent = baseTotal > 0 ? (totalGain / baseTotal) * 100 : 0;
              const optPercent = 100 - gainPercent;

              const unit = getMetricLabel(activeMetric).split(' ')[1] || '';

              return (
                <div key={item.pista.id} className="flex flex-col items-center flex-1 max-w-[140px]">
                  <Tooltip content={
                     <div className="flex flex-col gap-1.5 min-w-[160px] whitespace-normal">
                       <div className="flex justify-between gap-4 text-white/70"><span>ANTERIOR:</span> <span className="text-white font-mono">{(baseTotal).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} {unit}</span></div>
                       <div className="flex justify-between gap-4 text-white/70"><span>NOVO:</span> <span className="text-white font-mono">{(optTotal).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} {unit}</span></div>
                       <div className="flex justify-between gap-4 border-t border-white/10 pt-1.5 mt-1 font-black">
                          <span className="text-gain-light">GANHO:</span> 
                          <span className="text-gain-light font-mono">{(totalGain).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} {unit}</span>
                       </div>
                     </div>
                  }>
                    <div className="w-16 h-[300px] flex flex-col justify-end cursor-help transition-all duration-300 hover:-translate-y-2">
                      {/* Gain Part (Top) */}
                      <div 
                        className="bg-gain-light/30 border-x border-t border-gain-light/50 relative overflow-hidden hover:bg-gain-light/50 transition-colors rounded-t-lg" 
                        style={{ height: `${gainPercent}%` }}
                      >
                        <div className="absolute inset-0 bg-gain opacity-5 animate-pulse"></div>
                      </div>
                      {/* Optimized Part (Bottom) */}
                      <div 
                        className="bg-sidebar rounded-b-lg relative hover:brightness-125 transition-all shadow-inner" 
                        style={{ height: `${optPercent}%` }}
                      >
                         <div className="absolute inset-x-0 top-0 h-px bg-white/20"></div>
                         <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-10 scale-50 hover:scale-100 transition-all">
                            <TrendingUp size={24} className="text-white" />
                         </div>
                      </div>
                    </div>
                  </Tooltip>
                  
                  <div className="mt-8 text-center flex flex-col items-center gap-1">
                    <span className="block text-sm font-black text-text-main tracking-tight uppercase">{item.aerodromo.indicativo}</span>
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest opacity-60">Pista {item.pista.pista_identificador}</span>
                  </div>
                  
                  <div className="mt-4 bg-gain text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg border border-gain/20 transform hover:scale-110 transition-transform">
                     +{gainPercent.toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-12 flex justify-center gap-12">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-gain-light/40 border border-gain-light/60 rounded shadow-inner"></div>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Ganho de Eficiência</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-sidebar rounded shadow-sm"></div>
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Cenário Otimizado</span>
          </div>
        </div>

        <div className="mt-auto px-10 py-6">
          <div className="flex items-start gap-4 bg-surface-low p-5 rounded-2xl border border-dashed border-slate-200">
             <div className="p-2 bg-white rounded-lg shadow-sm">
                <Info size={18} className="text-slate-400" />
             </div>
             <p className="text-[11px] text-text-muted leading-relaxed uppercase font-medium">
               Análise comparativa normalizada utilizando as **Pistas Destaque** (Designated Runways). 
               A altura total de cada coluna representa 100% da operação base no aeródromo. 
               O segmento inferior detalha a operação otimizada e o segmento superior destaca a redução direta em {activeMetric}.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
