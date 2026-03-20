import React from 'react';
import { Settings, Save, RotateCcw, HelpCircle, Calculator, Book, Info, MoveRight, Plane } from 'lucide-react';
import { CalculationFactors, DEFAULT_FACTORS } from '../utils/calculations';
import { Tooltip, Modal } from '../components/Shared';

interface SettingsViewProps {
  factors: CalculationFactors;
  onUpdateFactors: (factors: CalculationFactors) => void;
}

export default function SettingsView({ factors, onUpdateFactors }: SettingsViewProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

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
        <h2 className="text-3xl font-display font-extrabold text-text-main tracking-tight leading-none mb-2 flex items-center gap-3">
          Parâmetros de Cálculo
          <button 
            onClick={() => setIsModalOpen(true)}
            className="p-1.5 bg-slate-100 hover:bg-gain/10 text-slate-400 hover:text-gain rounded-full transition-all border border-slate-200"
            title="Ver base científica e cálculos"
          >
            <HelpCircle size={20} />
          </button>
        </h2>
        <p className="text-text-muted">
          Configure os fatores utilizados para os cálculos de eficiência operacional.
        </p>
        <p className="text-text-muted text-sm italic">
          Essas configurações serão utilizadas em todas as telas, mas são temporárias e serão perdidas ao fechar o aplicativo.
        </p>
      </section>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="CIÊNCIA E METODOLOGIA DE CÁLCULO"
      >
        <div className="space-y-10 pb-10">
          {/* Section 1: Calculations */}
          <section>
            <h4 className="flex items-center gap-2 text-lg font-black text-text-main mb-6 uppercase tracking-wider border-b-2 border-gain/20 pb-2">
              <Calculator className="text-gain" size={20} /> Detalhamento das Fórmulas
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h5 className="font-bold text-text-main mb-4 flex items-center gap-2">
                   <div className="bg-sidebar p-1.5 rounded-lg text-white"><MoveRight size={14} /></div>
                   Cenário de Decolagem (DEP)
                </h5>
                <div className="space-y-4 text-sm text-text-muted">
                  <div className="p-4 bg-white rounded-xl border border-slate-100 italic space-y-2 shadow-sm">
                    <p className="font-bold text-text-main text-xs uppercase tracking-wider">Ganho de Distância:</p>
                    <p className="text-slate-600">(Dist. Cab. + Taxi Cab. + Omni Antiga) - (Dist. Int. + Taxi Int. + Omni Otimiz.)</p>
                  </div>
                  <ul className="list-disc pl-5 space-y-3 text-xs">
                    <li><strong>Tempo de Dep/ARR:</strong> Coletas realizadas pelo grupo.</li>
                    <li><strong>Tempo de Taxi:</strong> Distância de Taxi / Velocidade Média de Taxi (15kt).</li>
                    <li><strong>Consumo Total:</strong> Somatório dos tempos (Taxi, DEP e OMNI) x Taxas de Fluxo (BADA).</li>
                  </ul>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h5 className="font-bold text-text-main mb-4 flex items-center gap-2">
                   <div className="bg-gain p-1.5 rounded-lg text-white"><MoveRight size={14} className="rotate-90" /></div>
                   Cenário de Chegada (ARR)
                </h5>
                <div className="space-y-4 text-sm text-text-muted">
                  <div className="p-4 bg-white rounded-xl border border-slate-100 italic space-y-2 shadow-sm">
                    <p className="font-bold text-text-main text-xs uppercase tracking-wider">Ganho de Distância:</p>
                    <p className="text-slate-600">(Dist. Pouso Full + Taxi Cab.) - (Dist. Pouso Otimiz. + Taxi Int.)</p>
                  </div>
                  <ul className="list-disc pl-5 space-y-3 text-xs">
                    <li><strong>Redução de ROT:</strong> Ganho direto no tempo de ocupação de pista.</li>
                    <li><strong>CO2:</strong> Combustível Total x 3,15 (Fator Estequiométrico ICAO).</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Inclusão das Fórmulas Matemáticas de Conversão OMNI Corrigidas */}
<div className="mt-8 bg-slate-900 p-8 rounded-2xl text-slate-300 shadow-xl border border-slate-800">
  <h5 className="text-white font-bold mb-6 flex items-center gap-2 uppercase tracking-widest text-xs">
    <div className="bg-blue-500 p-1 rounded-md"><Calculator size={14} className="text-white" /></div>
    Conversões Técnicas (Cálculo OMNI)
  </h5>
  
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
    <div className="space-y-3">
      <p className="text-[10px] font-black text-blue-400 uppercase">1. Tempo de Subida (s)</p>
      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 font-mono text-white text-center text-sm">
        t_seg = (Altitude / Razão_Subida) * 60
      </div>
      <p className="text-[10px] leading-tight italic text-slate-500">
        Altitude em pés (ft) e Razão em ft/min. Resultado em segundos.
      </p>
    </div>

    <div className="space-y-3">
      <p className="text-[10px] font-black text-blue-400 uppercase">2. Distância Percorrida (NM)</p>
      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 font-mono text-white text-center text-sm">
        Dist_NM = Velocidade * (t_seg / 3600)
      </div>
      <p className="text-[10px] leading-tight italic text-slate-500">
        Velocidade em knots (kt) multiplicada pelo tempo em horas.
      </p>
    </div>

    <div className="space-y-3">
      <p className="text-[10px] font-black text-blue-400 uppercase">3. Conversão para Metros</p>
      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 font-mono text-white text-center text-sm">
        Dist_m = Dist_NM * 1852
      </div>
      <p className="text-[10px] leading-tight italic text-slate-500">
        Conversão da Milha Náutica para o Sistema Métrico Internacional.
      </p>
    </div>
  </div>
</div>
          </section>

          {/* Section 2: References */}
          <section>
            <h4 className="flex items-center gap-2 text-lg font-black text-text-main mb-6 uppercase tracking-wider border-b-2 border-gain/20 pb-2">
              <Book className="text-gain" size={20} /> Referências Científicas
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ReferenceCard 
                title="Emissões de CO2 (3,15)"
                refText="ICAO Document 9988 - Guidance on the Inventory and Reporting of Aircraft Emissions."
                detail="Padrão global que estabelece a relação de massa entre queima de QAV e emissão de carbono."
              />
              <ReferenceCard 
                title="Consumo de Combustível"
                refText="Eurocontrol BADA (Base of Aircraft Data)."
                detail={
                  <div className="mt-2 space-y-2 text-[10px] font-mono bg-slate-900 text-gain-light p-4 rounded-xl shadow-inner border border-white/5">
                    <p className="font-bold border-b border-white/10 pb-2 mb-2 text-white">Médias (A320/B737):</p>
                    <p className="flex justify-between"><span>Taxi (Idle):</span> <span>~12,5 kg/min/motor</span></p>
                    <p className="flex justify-between"><span>Takeoff (TOGA):</span> <span>~160-200 kg/min/motor</span></p>
                    <p className="flex justify-between"><span>Climb:</span> <span>~45 kg/min/motor</span></p>
                  </div>
                }
              />
              <ReferenceCard 
                title="Cálculo de Eficiência"
                refText="ICAO Doc 10013 - Operational Opportunities to Reduce Fuel Burn and Emissions."
                detail="Cálculos de ganhos baseados em redução de taxi e otimização de perfis de subida (SIDs)."
              />
              <ReferenceCard 
                title="Velocidades e Performance"
                refText="FAA AC 120-74B e Manuais Performance (FCOM)."
                detail="Referência para velocidades de taxi e razões de subida em empuxo de decolagem."
              />
            </div>
          </section>
        </div>
      </Modal>

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

        <div className="p-6 bg-surface-low border-t border-slate-100 flex justify-center">
          <button 
            onClick={resetToDefaults}
            className="flex items-center gap-2 px-8 py-3 bg-text-main text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95"
          >
            <RotateCcw size={16} /> Restaurar Padrões
          </button>
        </div>
      </div>
    </div>
  );
}

function ReferenceCard({ title, refText, detail }: { title: string, refText: string, detail: React.ReactNode }) {
  return (
    <div className="p-5 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
      <h5 className="font-bold text-text-main mb-2 text-sm group-hover:text-gain transition-colors">{title}</h5>
      <p className="text-xs text-text-muted mb-3 italic">
        <strong>Ref:</strong> {refText}
      </p>
      <div className="text-xs text-text-muted leading-relaxed">
        {detail}
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
