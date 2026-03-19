import React from 'react';
import { Clock, Fuel, Wind, Maximize, TrendingUp, ArrowUpRight } from 'lucide-react';
import { KpiCard, BarRow, MetricRow } from '../components/Shared';
import { AIRPORT_DATA } from '../data/airportData';
import { calculateGains, CalculationFactors } from '../utils/calculations';
import { MetricType } from '../App';

interface DashboardViewProps {
  scale: number;
  factors: CalculationFactors;
  activeMetric: MetricType;
  activeAerodrome: string;
}

export default function DashboardView({ scale, factors, activeMetric, activeAerodrome }: DashboardViewProps) {
  // Filter items for the active aerodrome
  const airportItems = AIRPORT_DATA.filter(item => item.aerodrome === activeAerodrome);
  
  // Calculate total gains for the active aerodrome
  const unitGains = airportItems.reduce((acc, item) => {
    const itemGains = calculateGains(item, factors, 1);
    acc.time += itemGains.total.time;
    acc.fuel += itemGains.total.fuel;
    acc.distance += itemGains.total.distance;
    acc.co2 += itemGains.total.co2;
    return acc;
  }, { time: 0, fuel: 0, distance: 0, co2: 0 });

  // Scaled totals for all metrics
  const totals = {
    time: unitGains.time * scale,
    fuel: unitGains.fuel * scale,
    distance: unitGains.distance * scale,
    co2: unitGains.co2 * scale,
  };

  const getMetricConfig = (type: MetricType) => {
    switch (type) {
      case 'time': return { label: 'Tempo', unit: 's', icon: <Clock size={20} />, value: totals.time };
      case 'fuel': return { label: 'Combustível', unit: 'kg', icon: <Fuel size={20} />, value: totals.fuel };
      case 'co2': return { label: 'CO2', unit: 'kg', icon: <Wind size={20} />, value: totals.co2 };
      case 'distance': return { label: 'Distância', unit: 'm', icon: <Maximize size={20} />, value: totals.distance };
    }
  };

  const activeConfig = getMetricConfig(activeMetric);

  return (
    <div className="max-w-7xl mx-auto">
      <section className="mb-10">
        <h2 className="text-3xl font-display font-extrabold text-text-main tracking-tight leading-none mb-2">
          Visão Geral Operacional ({activeAerodrome})
        </h2>
        <p className="text-text-muted">
          Economia potencial estimada acumulada para {scale} voos em todas as pistas de {activeAerodrome}.
        </p>
      </section>

      {/* Main KPI Row - Highlights the active metric first */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <KpiCard 
          title={`Ganho em ${activeConfig.label}`} 
          value={activeConfig.value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} 
          unit={activeConfig.unit} 
          icon={activeConfig.icon} 
          trend="+12%" 
          trendIcon={<TrendingUp size={12} />}
          highlight={true}
        />
        
        {/* Other metrics in smaller scale if needed, or just follow the same size */}
        {(['time', 'fuel', 'co2', 'distance'] as MetricType[])
          .filter(m => m !== activeMetric)
          .map(m => {
            const config = getMetricConfig(m);
            return (
              <KpiCard 
                key={m}
                title={config.label} 
                value={config.value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} 
                unit={config.unit} 
                icon={config.icon} 
              />
            );
          })
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface-card p-8 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-display font-bold text-text-main mb-8 flex justify-between items-center">
            Impacto por Pista ({activeConfig.label})
            <span className="text-xs font-medium text-text-muted uppercase">{activeAerodrome}</span>
          </h3>
          <div className="space-y-8">
            {airportItems.map(item => {
              const itemGains = calculateGains(item, factors, scale);
              const val = itemGains.total[activeMetric];
              const percent = (val / activeConfig.value) * 100;
              return (
                <BarRow 
                  key={item.runway}
                  label={`Pista ${item.runway}`} 
                  highlight={`${val.toFixed(0)} ${activeConfig.unit}`} 
                  fill1={percent} 
                  fill2={0} 
                />
              );
            })}
          </div>
        </div>

        <div className="bg-surface-card p-8 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-display font-bold text-text-main mb-8">Composição do Ganho ({activeConfig.label})</h3>
          <div className="space-y-4">
            {(() => {
              const comp = airportItems.reduce((acc, item) => {
                const g = calculateGains(item, factors, scale);
                acc.dep += g.dep[activeMetric];
                acc.arr += g.arr[activeMetric];
                acc.taxi += g.taxiDep[activeMetric] + g.taxiArr[activeMetric];
                acc.omni += g.omni[activeMetric];
                return acc;
              }, { dep: 0, arr: 0, taxi: 0, omni: 0 });

              return (
                <>
                  <MetricRow label="Otimização Decolagem (DEP)" value={`${comp.dep.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} ${activeConfig.unit}`} />
                  <MetricRow label="Otimização Pouso (ARR)" value={`${comp.arr.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} ${activeConfig.unit}`} />
                  <MetricRow label="Eficiência Taxiamento (DEP/ARR)" value={`${comp.taxi.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} ${activeConfig.unit}`} />
                  <MetricRow label="Procedimentos OMNI" value={`${comp.omni.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} ${activeConfig.unit}`} />
                  <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between text-lg font-bold text-gain">
                    <span>Total Economizado</span>
                    <span>{activeConfig.value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} {activeConfig.unit}</span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
