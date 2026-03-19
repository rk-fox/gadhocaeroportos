import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, Info, PlaneTakeoff, Fuel, Clock, Wind, Maximize } from 'lucide-react';
import { AIRPORT_DATA } from '../data/airportData';
import { calculateGains, CalculationFactors } from '../utils/calculations';
import { MetricType } from '../App';

interface ComparisonsViewProps {
  scale: number;
  factors: CalculationFactors;
  activeMetric: MetricType;
  activeAerodrome: string;
}

export default function ComparisonsView({ scale, factors, activeMetric, activeAerodrome }: ComparisonsViewProps) {
  const filteredData = AIRPORT_DATA.filter(item => item.aerodrome === activeAerodrome);
  const [selectedRunwayIndex, setSelectedRunwayIndex] = useState(0);
  
  // Reset selected runway when aerodrome changes
  useEffect(() => {
    setSelectedRunwayIndex(0);
  }, [activeAerodrome]);

  const item = filteredData[selectedRunwayIndex] || filteredData[0];
  if (!item) return <div className="p-8 text-slate-400">Nenhum dado disponível para {activeAerodrome}.</div>;

  const gains = calculateGains(item, factors, scale);

  const getMetricConfig = (type: MetricType) => {
    switch (type) {
      case 'time': return { label: 'Tempo', unit: 's', icon: <Clock size={16} />, color: 'bg-blue-500' };
      case 'fuel': return { label: 'Combustível', unit: 'kg', icon: <Fuel size={16} />, color: 'bg-sidebar' };
      case 'co2': return { label: 'CO2', unit: 'kg', icon: <Wind size={16} />, color: 'bg-emerald-500' };
      case 'distance': return { label: 'Distância', unit: 'm', icon: <Maximize size={16} />, color: 'bg-slate-600' };
    }
  };

  const activeConfig = getMetricConfig(activeMetric);

  return (
    <div className="max-w-7xl mx-auto">
      <section className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-display font-extrabold text-text-main tracking-tight leading-none mb-2">
            Análise Comparativa Detalhada
          </h2>
          <p className="text-text-muted">
            Comparação entre procedimentos padrão e otimizados para a pista selecionada em {activeAerodrome}.
          </p>
        </div>

        <div className="flex bg-surface-low p-1 rounded-xl border border-slate-200 shadow-inner">
          <select 
            value={selectedRunwayIndex} 
            onChange={(e) => setSelectedRunwayIndex(parseInt(e.target.value))}
            className="bg-transparent text-sm font-bold text-text-main px-4 py-2 outline-none cursor-pointer"
          >
            {filteredData.map((d, i) => (
              <option key={i} value={i}>Pista {d.runway}</option>
            ))}
          </select>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Comparison Dashboard */}
        <div className="lg:col-span-2 space-y-8">
          {/* Waterfall Chart Representation */}
          <div className="bg-surface-card p-8 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-display font-bold text-text-main mb-8 flex items-center gap-3">
              Impacto por Etapa ({activeConfig.label})
            </h3>
            
            <div className="space-y-8">
              <WaterfallItem label="Decolagem (DEP)" value={gains.dep[activeMetric]} unit={activeConfig.unit} color={activeConfig.color} />
              <WaterfallItem label="Pouso (ARR)" value={gains.arr[activeMetric]} unit={activeConfig.unit} color={activeConfig.color} />
              <WaterfallItem label="Taxi DEP" value={gains.taxiDep[activeMetric]} unit={activeConfig.unit} color={activeConfig.color} />
              <WaterfallItem label="Taxi ARR" value={gains.taxiArr[activeMetric]} unit={activeConfig.unit} color={activeConfig.color} />
              <WaterfallItem label="Procedimentos OMNI" value={gains.omni[activeMetric]} unit={activeConfig.unit} color={activeConfig.color} />
              
              <div className="pt-6 border-t border-slate-100 flex justify-between items-end">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Total de Ganho Estimado</span>
                  <span className="text-4xl font-display font-black text-gain">
                    {gains.total[activeMetric].toLocaleString('pt-BR', { maximumFractionDigits: 0 })} <span className="text-lg font-medium text-text-muted">{activeConfig.unit}</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-gain flex items-center gap-1 justify-end">
                    <Wind size={12} /> {gains.total.co2.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} kg CO2
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Table */}
          <div className="bg-surface-card p-8 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-display font-bold text-text-main mb-6">Valores Absolutos (Pista {item.runway})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-4 px-2 text-xs font-bold text-slate-500 uppercase tracking-widest">Procedimento</th>
                    <th className="py-4 px-2 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Tempo (s)</th>
                    <th className="py-4 px-2 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Comb. (kg)</th>
                    <th className="py-4 px-2 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Dist. (m)</th>
                  </tr>
                </thead>
                <tbody>
                  <RowData label="Decolagem" data={gains.dep} activeMetric={activeMetric} />
                  <RowData label="Pouso" data={gains.arr} activeMetric={activeMetric} />
                  <RowData label="Taxi DEP" data={gains.taxiDep} activeMetric={activeMetric} />
                  <RowData label="Taxi ARR" data={gains.taxiArr} activeMetric={activeMetric} />
                  <RowData label="OMNI" data={gains.omni} activeMetric={activeMetric} />
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Technical Sidebar */}
        <div className="space-y-6">
          <div className="bg-surface-card p-6 rounded-xl shadow-sm border border-slate-100">
            <h4 className="text-sm font-bold text-text-main mb-4 flex items-center gap-2">
              <PlaneTakeoff size={18} className="text-gain" /> Detalhes da Pista
            </h4>
            <div className="space-y-4">
              <DetailItem label="Aeródromo" value={item.aerodrome} />
              <DetailItem label="Pista" value={item.runway} />
              <DetailItem label="TWY DEP" value={item.taxiway_dep} />
              <DetailItem label="TWY ARR" value={item.taxiway_arr} />
              <DetailItem label="ROT DEP (C/I)" value={`${item.rot_dep_cab}s / ${item.rot_dep_int}s`} />
            </div>
          </div>

          <div className="bg-surface-card p-6 rounded-xl shadow-sm border border-slate-100">
            <h4 className="text-sm font-bold text-text-main mb-4 flex items-center gap-2">
              <Info size={18} className="text-text-muted" /> Notas Técnicas
            </h4>
            <p className="text-xs text-text-muted leading-relaxed">
              Métrica Ativa: **{activeConfig.label}**.
              <br/><br/>
              Os cálculos consideram a diferença entre os procedimentos padrão (cabeceira/antigos) e os procedimentos otimizados (interseção/otimizados).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function WaterfallItem({ label, value, unit, color }: any) {
  const maxValue = 500; // Reference for bar width
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold">
        <span className="text-text-muted">{label}</span>
        <span className="text-gain">{value > 0 ? `+${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}` : '0'} {unit}</span>
      </div>
      <div className="h-4 bg-surface-low rounded-full overflow-hidden">
        <div className={`h-full ${color} opacity-80 transition-all duration-500`} style={{ width: `${Math.min(100, (value / maxValue) * 100)}%` }}></div>
      </div>
    </div>
  );
}

function RowData({ label, data, activeMetric }: any) {
  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-surface-low transition-colors">
      <td className="py-4 px-2 text-sm font-bold text-text-main">{label}</td>
      <td className={`py-4 px-2 text-sm font-mono text-right ${activeMetric === 'time' ? 'text-gain font-bold' : 'text-text-muted'}`}>
        {data.time.toFixed(1)}
      </td>
      <td className={`py-4 px-2 text-sm font-mono text-right ${activeMetric === 'fuel' ? 'text-gain font-bold' : 'text-text-main'}`}>
        {data.fuel.toFixed(1)}
      </td>
      <td className={`py-4 px-2 text-sm font-mono text-right ${activeMetric === 'distance' ? 'text-gain font-bold' : 'text-text-muted'}`}>
        {data.distance.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
      </td>
    </tr>
  );
}

function DetailItem({ label, value }: any) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-text-muted">{label}</span>
      <span className="font-bold text-text-main">{value}</span>
    </div>
  );
}
