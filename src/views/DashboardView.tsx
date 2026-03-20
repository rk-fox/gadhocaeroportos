import React, { useState, useEffect } from 'react';
import { Clock, Fuel, Wind, Maximize, TrendingUp, Globe } from 'lucide-react';
import { KpiCard, BarRow, MetricRow, Tooltip } from '../components/Shared';
import { calculateGains, CalculationFactors } from '../utils/calculations';
import { MetricType, EtapaType } from '../App';
import { aerodromeService, Aerodromo, PistaConfiguracao } from '../utils/aerodromeService';

interface DashboardViewProps {
  scale: number;
  factors: CalculationFactors;
  activeMetric: MetricType;
  activeAerodromeId: number;
  activeAerodrome?: Aerodromo;
  activeEtapa: EtapaType;
}

export default function DashboardView({ 
  scale, 
  factors, 
  activeMetric, 
  activeAerodromeId, 
  activeAerodrome,
  activeEtapa 
}: DashboardViewProps) {
  const [pistas, setPistas] = useState<PistaConfiguracao[]>([]);
  const [hoveredPista, setHoveredPista] = useState<PistaConfiguracao | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Assuming getPistasConfiguracao() without an ID returns all pistas
        // If it's meant to return only for the activeAerodromeId, the original call was correct.
        // Based on the diff, it seems the intent is to fetch all and then filter.
        const data = await aerodromeService.getPistasConfiguracao();
        setPistas(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchData();
  }, []); // Empty dependency array to fetch all pistas once

  // Filter pistas by the active aerodrome ID
  const aeroPistas = pistas.filter(p => p.aerodromo_id === activeAerodromeId);
  
  // Current pista being displayed in cards: hovered or destaque, filtered by active aerodrome
  const activePista = hoveredPista || aeroPistas.find(p => p.destaque) || (aeroPistas.length > 0 ? aeroPistas[0] : null);
  
  // Calculate gains for the active pista only (for cards)
  const activePistaGains = activePista ? calculateGains(activePista, factors, scale, activeEtapa) : null;

  // Calculate total gains for all runways of the active aerodrome
  const totalGainsRaw = aeroPistas.reduce((acc, p) => {
    const g = calculateGains(p, factors, scale, activeEtapa);
    acc.time += g.total.time;
    acc.fuel += g.total.fuel;
    acc.distance += g.total.distance;
    acc.co2 += g.total.co2;
    return acc;
  }, { time: 0, fuel: 0, distance: 0, co2: 0 });

  const getMetricConfig = (type: MetricType, source: any) => {
    if (!source) return { label: '', unit: '', icon: null, value: 0 };
    const value = source.total ? source.total[type] : source[type];
    
    switch (type) {
      case 'time': return { label: 'Tempo', unit: 's', icon: <Clock size={20} />, value };
      case 'fuel': return { label: 'Combustível', unit: 'kg', icon: <Fuel size={20} />, value };
      case 'co2': return { label: 'CO2', unit: 'kg', icon: <Wind size={20} />, value };
      case 'distance': return { label: 'Distância', unit: 'm', icon: <Maximize size={20} />, value };
    }
  };

  const activeConfig = getMetricConfig(activeMetric, activePistaGains);
  const totalConfig = getMetricConfig(activeMetric, totalGainsRaw);

  return (
    <div className="max-w-7xl mx-auto">
      <section className="mb-10">
        <h2 className="text-3xl font-display font-extrabold text-text-main tracking-tight leading-none mb-1">
          Visão Geral Operacional ({activeAerodrome?.indicativo || '...'})
        </h2>
        <p className="text-sm font-medium text-sidebar/70 mb-2 uppercase tracking-wide">
          {activeAerodrome?.nome} - {activeAerodrome?.concessionaria} - {activeAerodrome?.cidade}/{activeAerodrome?.estado}
        </p>
        <p className="text-text-muted">
          Economia potencial estimada acumulada para {scale} voo(s) na pista {activePista?.pista_identificador} ({activeEtapa}).
        </p>
      </section>

      {/* Main KPI Row - Fixed order: Distância, Tempo, Combustível, CO2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {(['distance', 'time', 'fuel', 'co2'] as MetricType[]).map(m => {
          const config = getMetricConfig(m, activePistaGains);
          
          return (
              <KpiCard 
                title={`Ganho em ${config.label}`} 
                value={config.value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} 
                unit={config.unit} 
                icon={config.icon} 
                
              />
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface-card p-8 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-display font-bold text-text-main mb-8 flex justify-between items-center">
            Impacto por Pista ({activeConfig.label})
            <span className="text-xs font-medium text-text-muted uppercase">{activeAerodrome?.indicativo}</span>
          </h3>
          <div className="space-y-4">
            {aeroPistas.map(p => {
              const pGains = calculateGains(p, factors, scale, activeEtapa);
              const val = pGains.total[activeMetric];
              // Use total among all runways for scaling, but if total is 0 avoid NaN
              const maxVal = Math.max(...aeroPistas.map(pi => calculateGains(pi, factors, scale, activeEtapa).total[activeMetric]), 1);
              const percent = (val / maxVal) * 100;
              
              return (
                <BarRow 
                  key={p.id}
                  label={`Pista ${p.pista_identificador}`} 
                  highlight={`${val.toFixed(0)} ${activeConfig.unit}`} 
                  fill1={percent} 
                  fill2={0}
                  isActive={activePista?.id === p.id}
                  onMouseEnter={() => setHoveredPista(p)}
                  onMouseLeave={() => setHoveredPista(null)}
                />
              );
            })}
          </div>
        </div>

        <div className="bg-surface-card p-8 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-display font-bold text-text-main mb-8">Composição do Ganho ({activeConfig.label})</h3>
          <p className="text-xs text-text-muted mb-6 -mt-6">Exibindo dados da Pista {activePista?.pista_identificador}</p>
          <div className="space-y-4">
            {activePistaGains && (
              <>
                <MetricRow label="Otimização Decolagem (DEP)" value={`${activePistaGains.dep[activeMetric].toLocaleString('pt-BR', { maximumFractionDigits: 0 })} ${activeConfig.unit}`} />
                <MetricRow label="Otimização Pouso (ARR)" value={`${activePistaGains.arr[activeMetric].toLocaleString('pt-BR', { maximumFractionDigits: 0 })} ${activeConfig.unit}`} />
                <MetricRow label="Eficiência Taxiamento (DEP/ARR)" value={`${(activePistaGains.taxiDep[activeMetric] + activePistaGains.taxiArr[activeMetric]).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} ${activeConfig.unit}`} />
                <MetricRow label="Procedimentos OMNI" value={`${activePistaGains.omni[activeMetric].toLocaleString('pt-BR', { maximumFractionDigits: 0 })} ${activeConfig.unit}`} />
                <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between text-lg font-bold text-gain">
                  <span>Total Pista {activePista?.pista_identificador}</span>
                  <span>{activePistaGains.total[activeMetric].toLocaleString('pt-BR', { maximumFractionDigits: 0 })} {activeConfig.unit}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Satellite Map Integration */}
      <div className="mt-12 bg-surface-card rounded-2xl shadow-sm border border-slate-100 overflow-hidden group/map relative">
        <div className="p-8 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-display font-bold text-text-main flex items-center gap-2">
                <Globe size={20} className="text-sidebar" /> 
                Vista Satélite - {activeAerodrome?.indicativo}
              </h3>
              <p className="text-[10px] text-text-muted mt-1 uppercase tracking-widest font-bold">
                Localização: {activeAerodrome?.latitude.toFixed(4)}, {activeAerodrome?.longitude.toFixed(4)} | Radar de Eficiência - Projeção de Pista ({activeAerodrome?.heading_geral}°)
              </p>
            </div>
            <div className="bg-surface-low px-3 py-1.5 rounded-lg border border-slate-200">
               <span className="text-[10px] font-black text-sidebar uppercase tracking-widest">Live Preview</span>
            </div>
          </div>
        </div>
        
        <div className="h-[400px] w-full relative bg-slate-100 flex items-center justify-center overflow-hidden">
           {/* Static Map Image with Heading Rotation - Normalized with 20-degree offset (Magnetic Declination) */}
           <div 
             className="absolute transition-transform duration-[1500ms] ease-in-out"
             style={{ 
               transform: `rotate(${110 - (activeAerodrome?.heading_geral || 0)}deg)`,
               width: '1200px',
               height: '1200px'
             }}
           >
              {activeAerodrome?.latitude && activeAerodrome?.longitude && (
                <img 
                  src={`https://maps.googleapis.com/maps/api/staticmap?center=${activeAerodrome.latitude},${activeAerodrome.longitude}&zoom=${activeAerodrome.zoom || 15}&size=640x640&scale=2&maptype=satellite&key=${import.meta.env.VITE_GOOGLE_MAPS_KEY}`}
                  alt="Airport Satellite View"
                  className="w-full h-full object-cover shadow-2xl brightness-90 contrast-110"
                />
              )}
           </div>
           
           {/* Futuristic Crosshair Overlays */}
           <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Central Target */}
              <div className="w-32 h-32 border border-white/20 rounded-full flex items-center justify-center">
                <div className="w-16 h-16 border border-white/30 rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-2 h-2 bg-gain-light rounded-full shadow-[0_0_10px_#4edea3]"></div>
                </div>
              </div>
              
              {/* Scanlines / Grid */}
              <div className="absolute w-full h-[1px] bg-white/5 top-1/4"></div>
              <div className="absolute w-full h-[1px] bg-white/5 bottom-1/4"></div>
              <div className="absolute w-[1px] h-full bg-white/5 left-1/4"></div>
              <div className="absolute w-[1px] h-full bg-white/5 right-1/4"></div>
              
              {/* Coordinate Markings */}
              <div className="absolute top-8 left-8 text-[8px] font-mono text-white/40 space-y-1">
                <div>SCN_01: ACTIVE</div>
                <div>LNK_OK: 99%</div>
              </div>
           </div>
           
           {/* Dynamic Compass - Adjusted for 110-degree (90+20) normalization */}
           <div className="absolute top-8 right-8 flex flex-col items-center gap-2">
              <div className="bg-black/40 backdrop-blur-md p-3 rounded-full border border-white/20 shadow-2xl group flex flex-col items-center">
                <div 
                  className="transition-transform duration-[1500ms]"
                  style={{ transform: `rotate(${110 - (activeAerodrome?.heading_geral || 0)}deg)` }}
                >
                   <Wind size={20} className="text-white" />
                </div>
                <div className="absolute -top-1 px-1 bg-gain text-[6px] font-black rounded text-black leading-none py-0.5">N</div>
              </div>
              <span className="text-[8px] font-bold text-white uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">North</span>
           </div>
           
           {/* Vignette effect */}
           <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.4)] pointer-events-none"></div>
        </div>
        
        <div className="p-6 bg-surface-low border-t border-slate-100 flex justify-between items-center">
          <p className="text-[10px] text-text-muted font-medium italic uppercase tracking-wider">
            Orientação horizontal normalizada para o objeto de interesse (Pista) a 90°.
          </p>
          <div className="flex gap-4">
             <div className="flex items-center gap-2 text-[9px] font-bold text-text-main">
                <div className="w-2 h-2 rounded-full bg-gain"></div>
                COBERTURA GARANTIDA
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
