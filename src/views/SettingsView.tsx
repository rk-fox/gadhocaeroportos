import React from 'react';
import { Settings, Save, RotateCcw } from 'lucide-react';
import { CalculationFactors, DEFAULT_FACTORS } from '../utils/calculations';

interface SettingsViewProps {
  factors: CalculationFactors;
  onUpdateFactors: (factors: CalculationFactors) => void;
}

export default function SettingsView({ factors, onUpdateFactors }: SettingsViewProps) {
  const handleChange = (key: keyof CalculationFactors, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onUpdateFactors({ ...factors, [key]: numValue });
    }
  };

  const resetToDefaults = () => {
    onUpdateFactors(DEFAULT_FACTORS);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <section className="mb-10">
        <h2 className="text-3xl font-display font-extrabold text-text-main tracking-tight leading-none mb-2">
          Parâmetros de Cálculo
        </h2>
        <p className="text-text-muted">
          Configure os fatores utilizados para os cálculos de eficiência operacional.
        </p>
      </section>

      <div className="bg-surface-card rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 space-y-8">
          {/* Taxi Parameters */}
          <div>
            <h3 className="text-lg font-bold text-text-main mb-4 flex items-center gap-2">
               Taxiamento
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup 
                label="Velocidade Média TAXI (m/s)" 
                value={factors.taxiSpeed} 
                onChange={(v) => handleChange('taxiSpeed', v)} 
                description="Velocidade padrão de taxiamento em solo."
              />
              <InputGroup 
                label="Consumo Médio TAXI (kg/s)" 
                value={factors.taxiFuelRate} 
                onChange={(v) => handleChange('taxiFuelRate', v)} 
                description="Consumo de combustível durante o taxiamento."
              />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Flight Parameters */}
          <div>
            <h3 className="text-lg font-bold text-text-main mb-4">Decolagem / Pouso / OMNI</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup 
                label="Consumo DEP (kg/s)" 
                value={factors.depFuelRate} 
                onChange={(v) => handleChange('depFuelRate', v)} 
              />
              <InputGroup 
                label="Consumo ARR (kg/s)" 
                value={factors.arrFuelRate} 
                onChange={(v) => handleChange('arrFuelRate', v)} 
              />
              <InputGroup 
                label="Consumo OMNI (kg/s)" 
                value={factors.omniFuelRate} 
                onChange={(v) => handleChange('omniFuelRate', v)} 
              />
              <InputGroup 
                label="Fator CO2 (kg CO2 / kg combustível)" 
                value={factors.co2Factor} 
                onChange={(v) => handleChange('co2Factor', v)} 
              />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Performance Parameters */}
          <div>
            <h3 className="text-lg font-bold text-text-main mb-4">Performance OMNI</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup 
                label="Razão de Subida Média (ft/min)" 
                value={factors.omniClimbRate} 
                onChange={(v) => handleChange('omniClimbRate', v)} 
              />
              <InputGroup 
                label="Velocidade Média Subida (kt)" 
                value={factors.omniSpeed} 
                onChange={(v) => handleChange('omniSpeed', v)} 
              />
            </div>
          </div>
        </div>

        <div className="p-6 bg-surface-low border-t border-slate-100 flex justify-end gap-3">
          <button 
            onClick={resetToDefaults}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-text-muted hover:text-text-main transition-colors"
          >
            <RotateCcw size={16} /> Restaurar Padrões
          </button>
          <button className="flex items-center gap-2 px-6 py-2 bg-text-main text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-shadow">
            <Save size={16} /> Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}

function InputGroup({ label, value, onChange, description }: { label: string, value: number, onChange: (v: string) => void, description?: string }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-bold text-text-main">{label}</label>
      <input 
        type="number" 
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-surface-low text-sm focus:outline-none focus:ring-2 focus:ring-gain/50 transition-shadow"
      />
      {description && <p className="text-[10px] text-text-muted">{description}</p>}
    </div>
  );
}
