import React, { useState, useEffect } from 'react';
import { Database, Download, Filter, Search, Info, Plus, Trash2, Edit2, Check, X, Plane, MapPin, Navigation, ArrowRight, Save } from 'lucide-react';
import { calculateGains, CalculationFactors } from '../utils/calculations';
import { aerodromeService, Aerodromo, PistaConfiguracao } from '../utils/aerodromeService';
import { MetricType, EtapaType } from '../App';

interface DataViewProps {
  factors: CalculationFactors;
  onUpdateFactors: (factors: CalculationFactors) => void;
  scale: number;
  activeMetric: MetricType;
  activeAerodromeId: number;
  activeAerodrome?: Aerodromo;
  activeEtapa: EtapaType;
}

export default function DataView({ 
  factors, 
  onUpdateFactors, 
  scale, 
  activeMetric, 
  activeAerodromeId, 
  activeAerodrome,
  activeEtapa
}: DataViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [pistas, setPistas] = useState<(PistaConfiguracao & { aerodromo?: Aerodromo })[]>([]);
  const [aerodromos, setAerodromos] = useState<Aerodromo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newPista, setNewPista] = useState<Partial<PistaConfiguracao>>({
    aerodromo_id: activeAerodromeId,
    pista_identificador: '',
    dep_taxiway: '',
    arr_taxiway: '',
    dist_dep_cabeceira: 0,
    dist_dep_intersecao: 0,
    dist_arr_cabeceira: 0,
    dist_arr_intersecao: 0,
    rot_dep_cabeceira: 0,
    rot_dep_intersecao: 0,
    taxi_dep_cabeceira: 0,
    taxi_dep_intersecao: 0,
    omni_antiga: 0,
    omni_otimizada: 0,
    destaque: false
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [aeros, allPistas] = await Promise.all([
        aerodromeService.getAerodromos(),
        aerodromeService.getPistasConfiguracao()
      ]);
      setAerodromos(aeros);
      setPistas(allPistas.map(p => ({
        ...p,
        aerodromo: aeros.find(a => a.id === p.aerodromo_id)
      })));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!newPista.aerodromo_id || !newPista.pista_identificador) {
      alert('Preencha o aeródromo e identificador da pista.');
      return;
    }
    try {
      if (editingId) {
        await aerodromeService.updatePistaConfiguracao(editingId, newPista as any);
      } else {
        await aerodromeService.createPistaConfiguracao(newPista as any);
      }
      setIsAdding(false);
      setEditingId(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving pista:', error);
      alert('Erro ao salvar pista.');
    }
  };

  const handleEdit = (item: PistaConfiguracao) => {
    setNewPista({
      aerodromo_id: item.aerodromo_id,
      pista_identificador: item.pista_identificador,
      dep_taxiway: item.dep_taxiway,
      arr_taxiway: item.arr_taxiway,
      dist_dep_cabeceira: item.dist_dep_cabeceira,
      dist_dep_intersecao: item.dist_dep_intersecao,
      dist_arr_cabeceira: item.dist_arr_cabeceira,
      dist_arr_intersecao: item.dist_arr_intersecao,
      rot_dep_cabeceira: item.rot_dep_cabeceira,
      rot_dep_intersecao: item.rot_dep_intersecao,
      rot_arr_cabeceira: item.rot_arr_cabeceira,
      rot_arr_intersecao: item.rot_arr_intersecao,
      taxi_dep_cabeceira: item.taxi_dep_cabeceira,
      taxi_dep_intersecao: item.taxi_dep_intersecao,
      taxi_arr_cabeceira: item.taxi_arr_cabeceira,
      taxi_arr_intersecao: item.taxi_arr_intersecao,
      omni_antiga: item.omni_antiga,
      omni_otimizada: item.omni_otimizada,
      destaque: item.destaque
    });
    setEditingId(item.id);
    setIsAdding(true);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setNewPista({
      aerodromo_id: activeAerodromeId,
      pista_identificador: '',
      dep_taxiway: '',
      arr_taxiway: '',
      dist_dep_cabeceira: 0,
      dist_dep_intersecao: 0,
      dist_arr_cabeceira: 0,
      dist_arr_intersecao: 0,
      rot_dep_cabeceira: 0,
      rot_dep_intersecao: 0,
      rot_arr_cabeceira: 0,
      rot_arr_intersecao: 0,
      taxi_dep_cabeceira: 0,
      taxi_dep_intersecao: 0,
      taxi_arr_cabeceira: 0,
      taxi_arr_intersecao: 0,
      omni_antiga: 0,
      omni_otimizada: 0,
      destaque: false
    });
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta pista?')) {
      try {
        await aerodromeService.deletePistaConfiguracao(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting pista:', error);
        alert('Erro ao excluir pista.');
      }
    }
  };

  const filteredData = pistas.filter(item => 
    item.aerodromo?.indicativo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.pista_identificador.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <section>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-display font-extrabold text-text-main tracking-tight leading-none mb-2">
              Gerenciamento de Configurações
            </h2>
            <p className="text-text-muted">
              Configure os parâmetros técnicos para cada pista e aeródromo da rede.
            </p>
          </div>
          
          <button 
            onClick={() => {
              if (isAdding) {
                setIsAdding(false);
                setEditingId(null);
                resetForm();
              } else {
                setIsAdding(true);
              }
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gain text-white rounded-xl text-sm font-black hover:bg-gain/90 transition-all shadow-lg shadow-gain/20 active:scale-95"
          >
            {isAdding ? <><X size={18} /> Cancelar</> : <><Plus size={18} /> Nova Pista</>}
          </button>
        </div>

        {isAdding && (
          <div className="bg-surface-card p-8 rounded-2xl shadow-xl border border-gain/20 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
            <h4 className="text-lg font-display font-bold text-text-main mb-6 flex items-center gap-2">
              <Navigation size={20} className="text-gain" /> {editingId ? 'Editar Pista' : 'Cadastrar Nova Pista'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <FormField 
                label="Aeródromo" 
                type="select" 
                options={aerodromos.map(a => ({ value: a.id, label: a.indicativo }))} 
                value={newPista.aerodromo_id || ''}
                onChange={(v) => setNewPista({...newPista, aerodromo_id: Number(v)})}
              />
              <FormField 
                label="Identificador Pista" 
                placeholder="Ex: 11L" 
                value={newPista.pista_identificador}
                onChange={(v) => setNewPista({...newPista, pista_identificador: v})}
              />
              <FormField 
                label="TWY Decolagem" 
                placeholder="Ex: AA" 
                value={newPista.dep_taxiway} 
                onChange={(v) => setNewPista({...newPista, dep_taxiway: v})}
              />
              <FormField 
                label="TWY Pouso" 
                placeholder="Ex: BB" 
                value={newPista.arr_taxiway}
                onChange={(v) => setNewPista({...newPista, arr_taxiway: v})}
              />
              
              <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl">
                 <FormField label="ROT DEP CAB (s)" type="number" value={newPista.rot_dep_cabeceira} onChange={(v) => setNewPista({...newPista, rot_dep_cabeceira: Number(v)})} />
                 <FormField label="ROT DEP INT (s)" type="number" value={newPista.rot_dep_intersecao} onChange={(v) => setNewPista({...newPista, rot_dep_intersecao: Number(v)})} />
                 <FormField label="TAXI DEP CAB (m)" type="number" value={newPista.taxi_dep_cabeceira} onChange={(v) => setNewPista({...newPista, taxi_dep_cabeceira: Number(v)})} />
                 <FormField label="TAXI DEP INT (m)" type="number" value={newPista.taxi_dep_intersecao} onChange={(v) => setNewPista({...newPista, taxi_dep_intersecao: Number(v)})} />
              </div>

              <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gain-light/5 rounded-xl">
                 <FormField label="ROT ARR CAB (s)" type="number" value={newPista.rot_arr_cabeceira} onChange={(v) => setNewPista({...newPista, rot_arr_cabeceira: Number(v)})} />
                 <FormField label="ROT ARR INT (s)" type="number" value={newPista.rot_arr_intersecao} onChange={(v) => setNewPista({...newPista, rot_arr_intersecao: Number(v)})} />
                 <FormField label="TAXI ARR CAB (m)" type="number" value={newPista.taxi_arr_cabeceira} onChange={(v) => setNewPista({...newPista, taxi_arr_cabeceira: Number(v)})} />
                 <FormField label="TAXI ARR INT (m)" type="number" value={newPista.taxi_arr_intersecao} onChange={(v) => setNewPista({...newPista, taxi_arr_intersecao: Number(v)})} />
              </div>

              <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-sidebar/5 rounded-xl border border-sidebar/10">
                <FormField label="OMNI ANTERIOR (ft" type="number" value={newPista.omni_antiga} onChange={(v) => setNewPista({...newPista, omni_antiga: Number(v)})} />
                <FormField label="OMNI OTIMIZADA (ft)" type="number" value={newPista.omni_otimizada} onChange={(v) => setNewPista({...newPista, omni_otimizada: Number(v)})} />
                <div className="flex items-center gap-2 p-2 mt-4 sm:mt-6">
                  <input 
                    type="checkbox" 
                    id="destaque"
                    checked={newPista.destaque} 
                    onChange={(e) => setNewPista({...newPista, destaque: e.target.checked})}
                    className="w-4 h-4 rounded border-slate-300 text-gain focus:ring-gain"
                  />
                  <label htmlFor="destaque" className="text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer">Pista Preferencial</label>
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
               <button 
                onClick={handleSubmit}
                className="flex items-center gap-2 px-8 py-3 bg-text-main text-white rounded-xl text-sm font-black hover:bg-slate-800 transition-all shadow-lg"
               >
                 <Save size={18} /> {editingId ? 'Atualizar Configuração' : 'Salvar Configuração'}
               </button>
            </div>
          </div>
        )}

        <div className="bg-surface-card rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Toolbar */}
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Buscar aeródromo ou pista..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-surface-low text-sm focus:outline-none focus:ring-2 focus:ring-gain/50 transition-shadow"
              />
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-surface-low/50 border-b border-slate-200">
                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest sticky left-0 bg-surface-low z-10 w-48">Aeródromo / Pista</th>
                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">TWY</th>
                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">ROT (C/I)</th>
                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">TAXI (C/I)</th>
                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">OMNI (A/O)</th>
                  <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr><td colSpan={6} className="py-10 text-center text-text-muted italic">Carregando...</td></tr>
                ) : filteredData.length === 0 ? (
                  <tr><td colSpan={6} className="py-10 text-center text-text-muted italic">Nenhum dado encontrado.</td></tr>
                ) : filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-6 sticky left-0 bg-white group-hover:bg-slate-50/50 z-10">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black shadow-sm ${item.destaque ? 'bg-gain text-white' : 'bg-slate-100 text-slate-400'}`}>
                          {item.aerodromo?.indicativo}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-text-main text-[13px]">Pista {item.pista_identificador}</span>
                          <span className="text-[10px] text-text-muted uppercase font-bold">{item.destaque ? 'Principal' : 'Secundária'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-text-muted flex items-center gap-1"><ArrowRight size={10} className="text-gain"/> DEP: {item.dep_taxiway}</span>
                        <span className="text-[10px] font-bold text-text-muted flex items-center gap-1"><ArrowRight size={10} className="text-gain-light"/> ARR: {item.arr_taxiway}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                       <ValueCompare c={item.rot_dep_cabeceira} i={item.rot_dep_intersecao} unit="s" />
                       <ValueCompare c={item.rot_arr_cabeceira} i={item.rot_arr_intersecao} unit="s" />
                    </td>
                    <td className="py-4 px-6 text-center">
                       <ValueCompare c={item.taxi_dep_cabeceira} i={item.taxi_dep_intersecao} unit="m" />
                       <ValueCompare c={item.taxi_arr_cabeceira} i={item.taxi_arr_intersecao} unit="m" />
                    </td>
                    <td className="py-4 px-6 text-center">
                       <ValueCompare c={item.omni_antiga} i={item.omni_otimizada} unit="s" />
                    </td>
                    <td className="py-4 px-6 text-right">
                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(item)}
                            className="p-2 text-slate-400 hover:text-sidebar hover:bg-surface-low rounded-lg transition-all"
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

function DocItem({ title, desc, fields }: { title: string, desc: string, fields: string[] }) {
  return (
    <div className="p-5 rounded-xl bg-slate-50 border border-slate-100">
      <h4 className="text-xs font-black text-gain uppercase mb-2 tracking-widest">{title}</h4>
      <p className="text-[11px] text-text-muted leading-relaxed mb-4">{desc}</p>
      <div className="flex flex-wrap gap-2">
        {fields.map(f => (
          <span key={f} className="px-2 py-0.5 bg-white text-[9px] font-black text-slate-400 rounded border border-slate-100 uppercase">{f}</span>
        ))}
      </div>
    </div>
  );
}

function FormField({ label, type = 'text', value, onChange, options, placeholder }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      {type === 'select' ? (
        <select 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-gain/20 outline-none"
        >
          <option value="">Selecione...</option>
          {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input 
          type={type} 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-gain/20 outline-none"
        />
      )}
    </div>
  );
}

function ValueCompare({ c, i, unit }: { c: number, i: number, unit: string }) {
  return (
    <div className="flex justify-center items-center gap-2 text-[10px] font-bold text-slate-400">
      <span>{c}{unit}</span>
      <span className="text-gain">→</span>
      <span className="text-text-main">{i}{unit}</span>
    </div>
  );
}
