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
  Maximize
} from 'lucide-react';

import DashboardView from './views/DashboardView';
import ComparisonsView from './views/ComparisonsView';
import SimulatorView from './views/SimulatorView';
import RankingView from './views/RankingView';
import DataView from './views/DataView';
import SettingsView from './views/SettingsView';

import { AIRPORT_DATA } from './data/airportData';
import { DEFAULT_FACTORS, CalculationFactors } from './utils/calculations';

// Logos
import logoGadhoc from './logo_gadhoc.png';
import logoGepea from './logo_gepea.png';

export type MetricType = 'time' | 'fuel' | 'co2' | 'distance';

export default function App() {
  const [scale, setScale] = useState<number>(100);
  const [view, setView] = useState<'Técnico' | 'Executivo'>('Executivo');
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [factors, setFactors] = useState<CalculationFactors>(DEFAULT_FACTORS);
  
  // New Global Selectors State
  const [activeMetric, setActiveMetric] = useState<MetricType>('fuel');
  
  // Get unique aerodromes from data
  const aerodromes = useMemo(() => Array.from(new Set(AIRPORT_DATA.map(a => a.aerodrome))), []);
  const [activeAerodrome, setActiveAerodrome] = useState<string>(aerodromes[0] || 'SBBR');

  const renderContent = () => {
    const commonProps = { scale, factors, activeMetric, activeAerodrome };
    
    switch (activeTab) {
      case 'Dashboard':
        return <DashboardView {...commonProps} />;
      case 'Comparações':
        return <ComparisonsView {...commonProps} />;
      case 'Simulador':
        return <SimulatorView scale={scale} factors={factors} />;
      case 'Ranking':
        return <RankingView scale={scale} factors={factors} globalMetric={activeMetric} />;
      case 'Dados':
        return <DataView factors={factors} />;
      case 'Configurações':
        return <SettingsView factors={factors} onUpdateFactors={setFactors} />;
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
      <aside className="w-64 fixed left-0 top-0 h-screen bg-sidebar flex flex-col py-6 shadow-2xl z-50">
        <div className="px-6 mb-10 flex flex-col items-center">
          <img src={logoGadhoc} alt="Grupo AdHoc" className="w-full max-h-32 object-contain" />
        </div>
        
        <nav className="flex-1 flex flex-col gap-1 px-2">
          <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active={activeTab === 'Dashboard'} onClick={() => setActiveTab('Dashboard')} />
          <NavItem icon={<ArrowRightLeft size={18} />} label="Comparações" active={activeTab === 'Comparações'} onClick={() => setActiveTab('Comparações')} />
          <NavItem icon={<Activity size={18} />} label="Simulador" active={activeTab === 'Simulador'} onClick={() => setActiveTab('Simulador')} />
          <NavItem icon={<Trophy size={18} />} label="Ranking" active={activeTab === 'Ranking'} onClick={() => setActiveTab('Ranking')} />
          <NavItem icon={<Database size={18} />} label="Dados" active={activeTab === 'Dados'} onClick={() => setActiveTab('Dados')} />
          <div className="my-2 border-t border-slate-700/50 mx-4"></div>
          <NavItem icon={<Settings size={18} />} label="Configurações" active={activeTab === 'Configurações'} onClick={() => setActiveTab('Configurações')} />
        </nav>

        <div className="mt-auto px-6 py-4 flex flex-col items-center border-t border-slate-700/50">
          <img src={logoGepea} alt="GEPEA" className="h-12 opacity-80" />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* Topbar */}
        <header className="h-16 sticky top-0 z-40 bg-surface-bg/80 backdrop-blur-md flex justify-between items-center px-8 border-b border-slate-200/50">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setView('Técnico')}
                className={`text-sm font-display font-semibold transition-all ${view === 'Técnico' ? 'text-gain border-b-2 border-gain pb-1' : 'text-text-muted hover:text-text-main'}`}
              >
                Técnico
              </button>
              <button 
                onClick={() => setView('Executivo')}
                className={`text-sm font-display font-semibold transition-all ${view === 'Executivo' ? 'text-gain border-b-2 border-gain pb-1' : 'text-text-muted hover:text-text-main'}`}
              >
                Executivo
              </button>
            </div>
            
            <div className="h-6 w-px bg-slate-200 mx-2"></div>

            {/* Aerodrome Selector */}
            <div className="flex items-center bg-surface-low rounded-lg p-1 gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase px-2">AERO:</span>
              {aerodromes.map(a => (
                <button 
                  key={a}
                  onClick={() => setActiveAerodrome(a)}
                  className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${activeAerodrome === a ? 'bg-white shadow-sm text-text-main' : 'text-text-muted hover:bg-white/50'}`}
                >
                  {a}
                </button>
              ))}
            </div>

            {/* Metric Selector */}
            <div className="flex items-center bg-surface-low rounded-lg p-1 gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase px-2">MÉTRICA:</span>
              {(['time', 'fuel', 'co2', 'distance'] as MetricType[]).map(m => (
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
              <span className="text-[10px] font-bold text-slate-400 uppercase px-2">Escala:</span>
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

            <div className="flex gap-2 ml-4">
              <button className="p-2 hover:bg-slate-100 rounded-md text-text-muted transition-colors"><Bell size={18} /></button>
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
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-full transition-all ${
        active 
          ? 'bg-slate-600/50 text-white scale-95' 
          : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
      }`}
    >
      {icon}
      <span className="font-sans text-sm font-medium">{label}</span>
    </button>
  );
}
