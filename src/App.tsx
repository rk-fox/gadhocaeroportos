import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  Activity, 
  Trophy, 
  Database, 
  MapPin, 
  PlaneTakeoff, 
  Bell, 
  Settings,
  Clock,
  Fuel,
  Wind,
  Maximize,
  Globe,
  BookOpen
} from 'lucide-react';

import DashboardView from './views/DashboardView';
import ComparisonsView from './views/ComparisonsView';
import SimulatorView from './views/SimulatorView';
import RankingView from './views/RankingView';
import DataView from './views/DataView';
import SettingsView from './views/SettingsView';
import AboutView from './views/AboutView';
import GlobalRankView from './views/GlobalRankView';

import { AIRPORT_DATA } from './data/airportData';
import { DEFAULT_FACTORS, CalculationFactors } from './utils/calculations';
import { aerodromeService, Aerodromo } from './utils/aerodromeService';
import { preloadMapImage } from './utils/mapCache';

// Logos
import logoGadhoc from './logo_gadhoc.png';
import logoGepea from './logo_gepea.png';

export type MetricType = 'time' | 'fuel' | 'co2' | 'distance';
export type EtapaType = 'DEP' | 'ARR';

export default function App() {
  const [scale, setScale] = useState<number>(1);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [factors, setFactors] = useState<CalculationFactors>(DEFAULT_FACTORS);
  
  // New Global Selectors State
  const [activeMetric, setActiveMetric] = useState<MetricType>('fuel');
  const [activeEtapa, setActiveEtapa] = useState<EtapaType>('DEP');
  
  // Supabase Data
  const [aerodromos, setAerodromos] = useState<Aerodromo[]>([]);
  const [activeAerodromeId, setActiveAerodromeId] = useState<number | null>(null);

  React.useEffect(() => {
    Promise.all([
      aerodromeService.getAerodromos(),
      aerodromeService.getPistasConfiguracao()
    ]).then(([aeros, pistas]) => {
      // Filtrar apenas aeródromos que possuem pelo menos uma pista cadastrada
      const withPistas = aeros.filter(a => 
        pistas.some(p => p.aerodromo_id === a.id)
      );
      
      setAerodromos(withPistas);
      if (withPistas.length > 0) {
        setActiveAerodromeId(withPistas[0].id);
        
        // Pre-load static map images into browser memory to save API costs
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
        if (apiKey) {
          withPistas.forEach(aero => preloadMapImage(aero, apiKey as string));
        }
      }
    });
  }, []);

  const activeAerodrome = useMemo(() => 
    aerodromos.find(a => a.id === activeAerodromeId), 
  [aerodromos, activeAerodromeId]);

  const renderContent = () => {
    const commonProps = { 
      scale, 
      factors, 
      activeMetric, 
      activeAerodromeId: activeAerodromeId || 0,
      activeAerodrome,
      activeEtapa 
    };
    
    switch (activeTab) {
      case 'Dashboard':
        return <DashboardView {...commonProps} />;
      case 'Comparações':
        return <ComparisonsView {...commonProps} />;
      case 'Simulador':
        return <SimulatorView {...commonProps} />;
      case 'Ranking':
        return <RankingView {...commonProps} />;
      case 'Dados':
        return <DataView {...commonProps} onUpdateFactors={setFactors} />;
      case 'Configurações':
        return <SettingsView factors={factors} onUpdateFactors={setFactors} />;
      case 'Impacto Global':
        return <GlobalRankView {...commonProps} />;
      case 'Sobre':
        return <AboutView />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-slate-400">
            <p>Conteúdo da aba {activeTab} em desenvolvimento.</p>
          </div>
        );
    }
  };

  const getMetricIcon = (m: MetricType) => {
    switch (m) {
      case 'time': return <Clock size={12} />;
      case 'fuel': return <Fuel size={12} />;
      case 'co2': return <Wind size={12} />;
      case 'distance': return <Maximize size={12} />;
    }
  };

  const getMetricLabel = (m: MetricType) => {
    switch (m) {
      case 'time': return 'Tempo';
      case 'fuel': return 'Combust.';
      case 'co2': return 'CO2';
      case 'distance': return 'Distân.';
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-bg font-sans text-text-main">
      {/* Sidebar */}
      <aside className="w-64 fixed left-0 top-0 h-screen bg-sidebar flex flex-col py-8 shadow-2xl z-50 border-r border-white/5">
        <div className="px-8 mb-12 flex flex-col items-center">
          <div className="bg-black/20 p-4 rounded-2xl backdrop-blur-sm shadow-inner">
            <img 
              src={logoGadhoc} 
              alt="Grupo AdHoc" 
              className="w-full max-h-32 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" 
            />
          </div>
        </div>
        
        <nav className="flex-1 flex flex-col gap-1 px-3">
          <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active={activeTab === 'Dashboard'} onClick={() => setActiveTab('Dashboard')} />
          <NavItem icon={<Globe size={18} />} label="Impacto Global" active={activeTab === 'Impacto Global'} onClick={() => setActiveTab('Impacto Global')} />
          <NavItem icon={<ArrowRightLeft size={18} />} label="Comparações" active={activeTab === 'Comparações'} onClick={() => setActiveTab('Comparações')} />
          <NavItem icon={<Activity size={18} />} label="Simulador" active={activeTab === 'Simulador'} onClick={() => setActiveTab('Simulador')} />
          <NavItem icon={<Trophy size={18} />} label="Ranking" active={activeTab === 'Ranking'} onClick={() => setActiveTab('Ranking')} />
          <NavItem icon={<Database size={18} />} label="Dados" active={activeTab === 'Dados'} onClick={() => setActiveTab('Dados')} />
          <div className="my-4 border-t border-white/5 mx-6"></div>
          <NavItem icon={<Settings size={18} />} label="Configurações" active={activeTab === 'Configurações'} onClick={() => setActiveTab('Configurações')} />
          <NavItem icon={<BookOpen size={18} />} label="Sobre" active={activeTab === 'Sobre'} onClick={() => setActiveTab('Sobre')} />
        </nav>

        <div className="mt-auto px-8 py-6 flex flex-col items-center border-t border-white/5 bg-black/40">
          <img src={logoGepea} alt="GEPEA" className="h-10 opacity-100 transition-opacity" />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* Topbar */}
        <header className="h-16 sticky top-0 z-40 bg-surface-bg/80 backdrop-blur-md flex justify-between items-center px-8 border-b border-slate-200/50">
          <div className="flex items-center gap-6">
            {/* Aerodrome Selector */}
            <div className="flex items-center bg-surface-low rounded-lg p-1 gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase px-2">AERÓDROMO:</span>
              {aerodromos.map(a => (
                <button 
                  key={a.id}
                  onClick={() => setActiveAerodromeId(a.id)}
                  className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${activeAerodromeId === a.id ? 'bg-white shadow-sm text-text-main' : 'text-text-muted hover:bg-white/50'}`}
                >
                  {a.indicativo}
                </button>
              ))}
            </div>

            {/* Etapa Selector */}
            <div className="flex items-center bg-surface-low rounded-lg p-1 gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase px-2">FASE:</span>
              {(['DEP', 'ARR'] as EtapaType[]).map(e => (
                <button 
                  key={e}
                  onClick={() => setActiveEtapa(e)}
                  className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${activeEtapa === e ? 'bg-white shadow-sm text-text-main' : 'text-text-muted hover:bg-white/50'}`}
                >
                  {e}
                </button>
              ))}
            </div>

            {/* Metric Selector */}
            <div className="flex items-center bg-surface-low rounded-lg p-1 gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase px-2">MÉTRICA:</span>
              {(['distance', 'time', 'fuel', 'co2'] as MetricType[]).map(m => (
                <button 
                  key={m}
                  onClick={() => setActiveMetric(m)}
                  className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-md transition-all ${activeMetric === m ? 'bg-white shadow-sm text-gain' : 'text-text-muted hover:bg-white/50'}`}
                >
                  {getMetricIcon(m)}
                  {getMetricLabel(m)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Scale Toggle */}
            <div className="flex items-center bg-surface-low rounded-lg p-1 gap-1 mr-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase px-2">Escala de voos:</span>
              {[1, 20, 50, 100].map(val => (
                <button 
                  key={val}
                  onClick={() => setScale(val)}
                  className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${scale === val ? 'bg-white shadow-sm text-text-main' : 'text-text-muted hover:bg-white/50'}`}
                >
                  {val}v
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Main Canvas */}
        <main className="flex-1 p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

// --- Subcomponents ---

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative
        ${active 
          ? 'bg-white/10 text-white shadow-lg' 
          : 'text-white/50 hover:bg-white/5 hover:text-white/80'}
      `}
    >
      <div className={`
        transition-colors duration-300
        ${active ? 'text-gain-light' : 'text-inherit group-hover:text-gain-light/70'}
      `}>
        {icon}
      </div>
      <span className="text-sm font-bold tracking-wide">{label}</span>
      {active && (
        <div className="absolute right-0 h-6 w-1 bg-gain-light rounded-l-full shadow-[0_0_10px_rgba(78,222,163,0.5)]" />
      )}
    </button>
  );
}
