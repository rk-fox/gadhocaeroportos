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
                   Cálculos de Distâncias
                </h5>
                <div className="space-y-4 text-sm text-text-muted">
                  <div className="p-4 bg-white rounded-xl border border-slate-100 italic space-y-2 shadow-sm">
                    <p className="font-bold text-text-main text-xs uppercase tracking-wider">Ganho na Decolagem:</p>
                    <p className="text-slate-600">(Dist. Cab. + Taxi Cab. + Omni Antiga) - (Dist. Int. + Taxi Int. + Omni Otimiz.)</p>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-slate-100 italic space-y-2 shadow-sm">
                    <p className="font-bold text-text-main text-xs uppercase tracking-wider">Ganho no Pouso:</p>
                    <p className="text-slate-600">(Dist. Cab. + Taxi Cab.) - (Dist. Int. + Taxi Int.)</p>
                  </div>
                </div>
                <br></br>
                <h5 className="font-bold text-text-main mb-4 flex items-center gap-2">
                   <div className="bg-sidebar p-1.5 rounded-lg text-white"><MoveRight size={14} /></div>
                   Detalhes
                </h5>
                <div className="space-y-4 text-sm text-text-muted">
                  <div className="p-4 bg-white rounded-xl border border-slate-100 italic space-y-2 shadow-sm">
                    <p className="font-bold text-text-main text-xs uppercase tracking-wider">Tempo de Dep/ARR:</p>
                    <p className="text-slate-600">Coletas realizadas pelo grupo na fase 1A ou pela equipe do CGNA em visitas operacionais.</p>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-slate-100 italic space-y-2 shadow-sm">
                    <p className="font-bold text-text-main text-xs uppercase tracking-wider">Tempo de Taxi:</p>
                    <p className="text-slate-600">Distância de Taxi / Velocidade Média de Taxi (15kt ou 7,7m/s).</p>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-slate-100 italic space-y-2 shadow-sm">
                    <p className="font-bold text-text-main text-xs uppercase tracking-wider">Redução de ROT:</p>
                    <p className="text-slate-600">Ganho direto no tempo de ocupação de pista.</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h5 className="font-bold text-text-main mb-4 flex items-center gap-2">
                   <div className="bg-gain p-1.5 rounded-lg text-white"><MoveRight size={14} className="rotate-90" /></div>
                   Cálculo de Consumo no Pouso
                </h5>
                <div className="space-y-4 text-sm text-text-muted">
                  <div className="p-4 bg-white rounded-xl border border-slate-100 italic shadow-sm">
                    <p className="font-bold text-text-main text-xs uppercase tracking-wider mb-3">Equação Principal de Consumo (Pouso):</p>
                    <div className="bg-slate-800 p-3 rounded-lg flex justify-center mb-4 text-center overflow-x-auto">
                      <p className="text-white text-[11px] font-mono flex items-center h-full">
                        C_pouso = T × [(P_idle × FF_idle) + (P_rev × FF_rev) + (P_roll × FF_roll)]
                      </p>
                    </div>
                    <ul className="text-slate-600 text-[11px] space-y-2 ml-4 list-disc mb-4">
                      <li><strong>T:</strong> Tempo total desde o cruzamento da cabeceira até livrar a pista (em segundos).</li>
                      <li><strong>P_fase:</strong> Percentual do tempo em cada fase.</li>
                      <li><strong>FF_fase:</strong> Fluxo de combustível em kg/s para a respectiva fase.</li>
                    </ul>

                    <p className="text-slate-700 text-[11px] font-bold border-t border-slate-200 pt-3 mb-2">
                      Como os percentuais (P) são definidos dinamicamente?
                    </p>
                    <p className="text-slate-600 text-[11px] font-mono mb-2 bg-slate-100 p-2 rounded">
                      Intensidade = (Vref[m/s] × TempoPista) ÷ Dist. Requerida
                    </p>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      A intensidade mapeia de forma contínua o percentual do uso de reverso (<span className="font-mono font-bold text-slate-700">P_rev</span>) entre <strong>{Math.round(factors.arrMinRevPercent * 100)}%</strong> (pistas longas, ex: BSB) e <strong>{Math.round(factors.arrMaxRevPercent * 100)}%</strong> (pistas curtas, ex: SDU). <br/><br/>
                      O <span className="font-mono font-bold text-slate-700">P_idle</span> (Voo/Toque) é fixo em 15%, e o <span className="font-mono font-bold text-slate-700">P_roll</span> (Roll-out) obtêm a diferença restante da pista: <span className="font-mono bg-slate-100 px-1 hover:bg-slate-200 rounded">100% - (P_idle + P_rev)</span>. Toda a conversão matemática do aplicativo se baseia nesses estágios interdependentes.
                    </p>
                  </div>
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
                detail="O cálculo das emissões de dióxido de carbono CO2 é realizado através da aplicação do Fator de Emissão Estequiométrico de 3,15kg de CO2/kg de combustível. Esta metodologia está em conformidade com o ICAO Doc 9988 (Guidance on the Use of Emissions Inventories and Models) e as diretrizes do IPCC para Inventários Nacionais de Gases de Efeito Estufa."
              />
              <ReferenceCard 
                title="Consumo de Combustível e Desaceleração"
                refText="Standard Operating Performance Coefficients (SOPC) baseados em manuais FCOM (Airbus/Boeing) e dados de telemetria operacional média."
                detail={
                  <div className="mt-2 space-y-2 text-[10px] font-mono bg-slate-900 text-gain-light p-4 rounded-xl shadow-inner border border-white/5">
                    <p className="font-bold border-b border-white/10 pb-2 mb-2 text-white">Taxas de Pouso (A320/B738 Pesado):</p>
                    <p className="flex justify-between"><span>Idle:</span> <span>~0.16 kg/s ({factors.arrIdleRate})</span></p>
                    <p className="flex justify-between text-yellow-500"><span>Reverso:</span> <span>~1.20 kg/s ({factors.arrRevRate})</span></p>
                    <p className="flex justify-between"><span>Roll-out:</span> <span>~0.14 kg/s ({factors.arrRollRate})</span></p>
                    <p className="font-bold border-y border-white/10 py-2 my-2 text-white">Gerais (Taxas médias motor/min):</p>
                    <p className="flex justify-between"><span>Taxi (Idle):</span> <span>~0.25 kg/min</span></p>
                    <p className="flex justify-between"><span>Takeoff (TOGA):</span> <span>~2.5 kg/s</span></p>
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
                refText="FAA AC 120-74B e EUROCONTROL - Aircraft Performance Database. [ATC-PFDB]"
                detail="Referência para velocidade de taxi, velocidades de voo e razões de subida."
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputGroup 
                label="Velocidade Média TAXI (kt)" 
                value={factors.taxiSpeed} 
                onChange={(v) => handleChange('taxiSpeed', v)} 
                description="Velocidade padrão de taxiamento em knots."
              />
              <InputGroup 
                label="Consumo TAXI DEP (kg/s)" 
                value={factors.taxiDepFuelRate} 
                onChange={(v) => handleChange('taxiDepFuelRate', v)} 
                description="Consumo no taxi de partida."
              />
              <InputGroup 
                label="Consumo TAXI ARR (kg/s)" 
                value={factors.taxiArrFuelRate} 
                onChange={(v) => handleChange('taxiArrFuelRate', v)} 
                description="Consumo no taxi de chegada."
              />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Flight Parameters */}
          <div>
            <h3 className="text-lg font-bold text-text-main mb-4">Decolagem / Pouso / OMNI</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <InputGroup 
                label="Consumo DEP (kg/s)" 
                value={factors.depFuelRate} 
                onChange={(v) => handleChange('depFuelRate', v)} 
              />
              <InputGroup 
                label="Consumo OMNI (kg/s)" 
                value={factors.omniFuelRate} 
                onChange={(v) => handleChange('omniFuelRate', v)} 
              />
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mb-6">
              <h4 className="font-bold text-text-main mb-4 flex items-center gap-2">Parâmetros Dinâmicos de Pouso (ARR)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <InputGroup 
                  label="Consumo Idle (kg/s)" 
                  value={factors.arrIdleRate} 
                  onChange={(v) => handleChange('arrIdleRate', v)} 
                  description="Fase de Toque/Flare."
                />
                <InputGroup 
                  label="Consumo Reverso (kg/s)" 
                  value={factors.arrRevRate} 
                  onChange={(v) => handleChange('arrRevRate', v)} 
                  description="Fase de desaceleração agressiva."
                />
                <InputGroup 
                  label="Consumo Rollout (kg/s)" 
                  value={factors.arrRollRate} 
                  onChange={(v) => handleChange('arrRollRate', v)} 
                  description="Fase final correndo na pista."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 border-t border-slate-200/60 pt-4">
                <InputGroup 
                  label="Intensidade Mín." 
                  value={factors.arrMinIntensity} 
                  onChange={(v) => handleChange('arrMinIntensity', v)} 
                  description="Longas (ex: 0.6)"
                />
                <InputGroup 
                  label="Intensidade Máx." 
                  value={factors.arrMaxIntensity} 
                  onChange={(v) => handleChange('arrMaxIntensity', v)} 
                  description="Curtas (ex: 1.6)"
                />
                <InputGroup 
                  label="% Rev Mínimo" 
                  value={factors.arrMinRevPercent} 
                  onChange={(v) => handleChange('arrMinRevPercent', v)} 
                  description="Ref: 0.15 (15%)"
                />
                <InputGroup 
                  label="% Rev Máximo" 
                  value={factors.arrMaxRevPercent} 
                  onChange={(v) => handleChange('arrMaxRevPercent', v)} 
                  description="Ref: 0.65 (65%)"
                />
                <InputGroup 
                  label="Vref Média (kt)" 
                  value={factors.arrVref} 
                  onChange={(v) => handleChange('arrVref', v)} 
                  description="Ref: 140 nós"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
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
  const safeId = label.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  return (
    <div className="space-y-1">
      <label htmlFor={safeId} className="block text-sm font-bold text-text-main">{label}</label>
      <input 
        id={safeId}
        name={safeId}
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
