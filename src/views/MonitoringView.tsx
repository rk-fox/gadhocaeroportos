import React, { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Plus, Edit2, History, RotateCcw, X, Info, Check, Eye, Trash2, KeyRound, ChevronUp, ChevronDown } from 'lucide-react';

export interface Action {
  id: number;
  aerodromo: string;
  conclusao: string;
  responsavel: string;
  acao: string;
  detalhes: string;
  reuniao: string;
  status: string;
  prazo: string | null;
  dt_conclusao: string | null;
  ult_att: string | null;
  created_at: string;
}

export interface ActionUpdate {
  id: number;
  id_action: number;
  nome: string;
  att: string;
  dt_att: string;
}

// --- Donut Chart Component ---
interface DonutChartProps {
  segments: { label: string; value: number; color: string }[];
  title: string;
  size?: number;
}

const DonutChart: React.FC<DonutChartProps> = ({ segments, title, size = 180 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const total = segments.reduce((s, seg) => s + seg.value, 0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    let progress = 0;
    const duration = 800;
    const startTime = performance.now();

    const draw = (now: number) => {
      progress = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      ctx.clearRect(0, 0, size, size);
      const cx = size / 2;
      const cy = size / 2;
      const outerR = size / 2 - 8;
      const innerR = outerR * 0.62;

      if (total === 0) {
        ctx.beginPath();
        ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
        ctx.arc(cx, cy, innerR, 0, Math.PI * 2, true);
        ctx.fillStyle = '#1e293b';
        ctx.fill();

        ctx.font = `bold ${size * 0.12}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#64748b';
        ctx.fillText('0', cx, cy);
        return;
      }

      let angle = -Math.PI / 2;
      segments.forEach(seg => {
        if (seg.value === 0) return;
        const sweep = (seg.value / total) * Math.PI * 2 * ease;
        ctx.beginPath();
        ctx.arc(cx, cy, outerR, angle, angle + sweep);
        ctx.arc(cx, cy, innerR, angle + sweep, angle, true);
        ctx.closePath();
        ctx.fillStyle = seg.color;
        ctx.fill();
        angle += sweep;
      });

      // Center text
      ctx.font = `bold ${size * 0.18}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(String(total), cx, cy - size * 0.03);

      ctx.font = `500 ${size * 0.07}px sans-serif`;
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('total', cx, cy + size * 0.1);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(draw);
      }
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [segments, total, size]);

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{title}</h3>
      <canvas ref={canvasRef} style={{ width: size, height: size }} />
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 max-w-[240px]">
        {segments.map(seg => (
          <div key={seg.label} className="flex items-center gap-1.5">
            <span className="inline-block size-2 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-[11px] text-slate-400 font-medium">
              {seg.label}: <span className="font-bold text-slate-200">{seg.value}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Helpers ---
const calcDeadlineDays = (prazo: string | null): number | null => {
  if (!prazo) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(prazo + 'T00:00:00');
  return Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const getDeadlineColor = (days: number | null): string => {
  if (days === null) return '#64748b';
  if (days > 7) return '#22c55e';
  if (days > 0) return '#eab308';
  return '#ef4444';
};

const getDeadlineLabel = (days: number | null): string => {
  if (days === null) return 'Sem prazo';
  if (days > 7) return 'No prazo';
  if (days > 0) return `${days}d restante${days > 1 ? 's' : ''}`;
  if (days === 0) return 'Vence hoje';
  return `${Math.abs(days)}d atrasado${Math.abs(days) > 1 ? 's' : ''}`;
};

const formatDate = (d: string | null): string => {
  if (!d) return '—';
  // Se for apenas data YYYY-MM-DD, fazemos o split e construímos a data local sem timezone shift
  if (d.length === 10 && d.includes('-')) {
    const [year, month, day] = d.split('-');
    return `${day}/${month}/${year}`;
  }
  const date = new Date(d);
  return date.toLocaleDateString('pt-BR');
};

const formatDateTime = (d: string | null): string => {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleString('pt-BR').replace(',', '');
};

const statusColor = (status: string): string => {
  switch (status) {
    case 'Concluída': return '#22c55e';
    case 'Em Andamento': return '#eab308';
    default: return '#64748b';
  }
};

const statusBg = (status: string): string => {
  switch (status) {
    case 'Concluída': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    case 'Em Andamento': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
  }
};

// --- Main Component ---
export default function MonitoringView() {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);

  // Sorting
  const [sortField, setSortField] = useState<keyof Action>('conclusao');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filters
  const [selectedAero, setSelectedAero] = useState('Todos');
  const [selectedReuniao, setSelectedReuniao] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Todos');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<Action | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState<Action | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState<Action | null>(null);

  // Password Modal State
  const [passwordModal, setPasswordModal] = useState<{
    open: boolean;
    error: string;
    onSuccess: () => void;
  }>({ open: false, error: '', onSuccess: () => {} });
  const [passwordInput, setPasswordInput] = useState('');

  // History data
  const [historyData, setHistoryData] = useState<ActionUpdate[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<ActionUpdate | null>(null);
  const [editUpdateForm, setEditUpdateForm] = useState({ nome: '', att: '' });

  // Form states
  const [isSaving, setIsSaving] = useState(false);
  const [createForm, setCreateForm] = useState({
    aerodromo: '', conclusao: '', responsavel: '', acao: '',
    detalhes: '', reuniao: '', status: 'Pendente', prazo: '',
  });
  const [updateForm, setUpdateForm] = useState({
    nome: '', att: '', status: 'Pendente',
  });

  const fetchActions = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('actions')
        .select('*')
        .order('id', { ascending: true });
      if (error) throw error;
      setActions(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar ações:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchActions(); }, [fetchActions]);

  // Derived filter options
  const aeroOptions = [...new Set(actions.map(a => a.aerodromo))].sort();
  const reuniaoOptions = [...new Set(actions.map(a => a.reuniao).filter(Boolean))].sort();
  const statusOptions = [...new Set(actions.map(a => a.status).filter(Boolean))].sort();

  // Filtered actions
  let filtered = actions.filter(a => {
    if (selectedAero !== 'Todos' && a.aerodromo !== selectedAero) return false;
    if (selectedReuniao !== 'Todos' && a.reuniao !== selectedReuniao) return false;
    if (selectedStatus !== 'Todos' && a.status !== selectedStatus) return false;
    return true;
  });

  filtered = filtered.sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    if (aVal === null) aVal = '';
    if (bVal === null) bVal = '';

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: keyof Action) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: keyof Action }) => {
    if (sortField !== field) return <div className="w-3.5" />;
    return sortDirection === 'asc' ? <ChevronUp size={14} className="text-sky-400" /> : <ChevronDown size={14} className="text-sky-400" />;
  };

  // Chart data
  const statusSegments = [
    { label: 'Pendente', value: filtered.filter(a => a.status === 'Pendente').length, color: '#64748b' },
    { label: 'Em Andamento', value: filtered.filter(a => a.status === 'Em Andamento').length, color: '#eab308' },
    { label: 'Concluída', value: filtered.filter(a => a.status === 'Concluída').length, color: '#22c55e' },
  ];

  const deadlineSegments = (() => {
    let green = 0, yellow = 0, red = 0;
    filtered.forEach(a => {
      if (a.status === 'Concluída') return;
      const days = calcDeadlineDays(a.prazo);
      if (days === null) return;
      if (days > 7) green++;
      else if (days > 0) yellow++;
      else red++;
    });
    return [
      { label: '> 7 dias', value: green, color: '#22c55e' },
      { label: '1–7 dias', value: yellow, color: '#eab308' },
      { label: '≤ 0 dias', value: red, color: '#ef4444' },
    ];
  })();

  // --- Password Gate Helper ---
  const requestPassword = (actionCallback: () => void) => {
    setPasswordInput('');
    setPasswordModal({
      open: true,
      error: '',
      onSuccess: actionCallback
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'Cgn@1234') {
      setPasswordModal(prev => ({ ...prev, open: false }));
      passwordModal.onSuccess();
    } else {
      setPasswordModal(prev => ({ ...prev, error: 'Senha incorreta!' }));
    }
  };

  // --- Handlers ---
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const payload = {
        ...createForm,
        prazo: createForm.prazo || null,
        dt_conclusao: createForm.status === 'Concluída' ? new Date().toISOString().split('T')[0] : null,
        ult_att: null,
      };
      const { error } = await supabase.from('actions').insert([payload]);
      if (error) throw error;
      setShowCreateModal(false);
      setCreateForm({ aerodromo: '', conclusao: '', responsavel: '', acao: '', detalhes: '', reuniao: '', status: 'Pendente', prazo: '' });
      fetchActions();
    } catch (err: any) {
      alert('Erro ao cadastrar: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showUpdateModal) return;
    try {
      setIsSaving(true);
      const now = new Date().toISOString();

      // Insert update record
      const { error: updateError } = await supabase.from('updates').insert([{
        id_action: showUpdateModal.id,
        nome: updateForm.nome,
        att: updateForm.att,
      }]);
      if (updateError) throw updateError;

      // Update action
      const updatePayload: any = {
        status: updateForm.status,
        ult_att: now,
      };
      if (updateForm.status === 'Concluída') {
        updatePayload.dt_conclusao = now.split('T')[0];
      }
      const { error: actionError } = await supabase
        .from('actions')
        .update(updatePayload)
        .eq('id', showUpdateModal.id);
      if (actionError) throw actionError;

      setShowUpdateModal(null);
      setUpdateForm({ nome: '', att: '', status: 'Pendente' });
      fetchActions();
    } catch (err: any) {
      alert('Erro ao atualizar: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevert = async (action: Action) => {
    if (!confirm(`Reverter status da ação "${action.acao}" de "Concluída" para "Em Andamento"?`)) return;
    try {
      const { error } = await supabase
        .from('actions')
        .update({ status: 'Em Andamento', dt_conclusao: null, ult_att: new Date().toISOString() })
        .eq('id', action.id);
      if (error) throw error;
      fetchActions();
    } catch (err: any) {
      alert('Erro ao reverter: ' + err.message);
    }
  };

  const fetchHistory = async (action: Action) => {
    setHistoryLoading(true);
    setShowHistoryModal(action);
    try {
      const { data, error } = await supabase
        .from('updates')
        .select('*')
        .eq('id_action', action.id)
        .order('dt_att', { ascending: false });
      if (error) throw error;
      setHistoryData(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar histórico:', err.message);
      setHistoryData([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const openUpdate = (action: Action) => {
    setUpdateForm({ nome: '', att: '', status: action.status });
    setShowUpdateModal(action);
  };

  const handleDeleteAction = (action: Action) => {
    requestPassword(async () => {
      if (confirm(`Tem certeza que deseja deletar permanentemente a ação "${action.acao}"?`)) {
        try {
          const { error: errorUpdates } = await supabase
            .from('updates')
            .delete()
            .eq('id_action', action.id);
          if (errorUpdates) throw errorUpdates;

          const { error } = await supabase
            .from('actions')
            .delete()
            .eq('id', action.id);
          if (error) throw error;

          fetchActions();
        } catch (err: any) {
          alert('Erro ao deletar ação: ' + err.message);
        }
      }
    });
  };

  const handleDeleteUpdate = (update: ActionUpdate, actionId: number) => {
    requestPassword(async () => {
      if (confirm(`Tem certeza que deseja deletar esta atualização?`)) {
        try {
          const { error } = await supabase
            .from('updates')
            .delete()
            .eq('id', update.id);
          if (error) throw error;

          // Refresh history and action's last update time
          const currentAction = actions.find(a => a.id === actionId);
          if (currentAction) {
            fetchHistory(currentAction);
          }
        } catch (err: any) {
          alert('Erro ao deletar atualização: ' + err.message);
        }
      }
    });
  };

  const handleStartEditUpdate = (update: ActionUpdate) => {
    requestPassword(() => {
      setEditingUpdate(update);
      setEditUpdateForm({ nome: update.nome, att: update.att });
    });
  };

  const handleSaveEditUpdate = async (e: React.FormEvent, update: ActionUpdate, actionId: number) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('updates')
        .update({
          nome: editUpdateForm.nome,
          att: editUpdateForm.att,
        })
        .eq('id', update.id);
      if (error) throw error;

      setEditingUpdate(null);
      const currentAction = actions.find(a => a.id === actionId);
      if (currentAction) {
        fetchHistory(currentAction);
      }
    } catch (err: any) {
      alert('Erro ao salvar atualização: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-extrabold text-oklch tracking-tight">
            Painel Gerencial de Monitoramento
          </h2>
          <p className="text-sm font-medium text-slate-400 mt-1">
            Monitoramento das Ações e Prazos das Equipes
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-sky-500/20 active:scale-95 text-sm"
        >
          <Plus size={16} />
          Cadastrar Ação
        </button>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        {/* Aerodromo Selectors */}
        <div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Aeródromo</span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedAero('Todos')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                selectedAero === 'Todos'
                  ? 'bg-white text-slate-950 shadow'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              Todos
            </button>
            {aeroOptions.map(a => (
              <button
                key={a}
                onClick={() => setSelectedAero(a)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  selectedAero === a
                    ? 'bg-white text-slate-950 shadow'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Dropdowns row */}
        <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reunião:</span>
            <select
              value={selectedReuniao}
              onChange={e => setSelectedReuniao(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-slate-300 p-2 min-w-[160px] focus:outline-none focus:border-slate-700"
            >
              <option value="Todos">Todas</option>
              {reuniaoOptions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status:</span>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-slate-300 p-2 min-w-[160px] focus:outline-none focus:border-slate-700"
            >
              <option value="Todos">Todos</option>
              {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex justify-center items-center">
          <DonutChart segments={statusSegments} title="Controle de Status" />
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex justify-center items-center">
          <DonutChart segments={deadlineSegments} title="Controle de Prazos (Não concluídas)" />
        </div>
      </div>

      {/* Actions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-display font-bold text-white text-base">Ações Cadastradas ({filtered.length})</h3>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-slate-500 text-sm">Nenhuma ação correspondente aos filtros.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-slate-950 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800 whitespace-nowrap select-none">
                  <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('aerodromo')}>
                    <div className="flex items-center gap-1.5">Aeródromo <SortIcon field="aerodromo" /></div>
                  </th>
                  <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('conclusao')}>
                    <div className="flex items-center gap-1.5">Conclusão <SortIcon field="conclusao" /></div>
                  </th>
                  <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('acao')}>
                    <div className="flex items-center gap-1.5">Ação <SortIcon field="acao" /></div>
                  </th>
                  <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors text-center" onClick={() => handleSort('status')}>
                    <div className="flex items-center justify-center gap-1.5">Status <SortIcon field="status" /></div>
                  </th>
                  <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors text-center" onClick={() => handleSort('prazo')}>
                    <div className="flex items-center justify-center gap-1.5">Prazo <SortIcon field="prazo" /></div>
                  </th>
                  <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors text-center" onClick={() => handleSort('ult_att')}>
                    <div className="flex items-center justify-center gap-1.5">Últ. Atualização <SortIcon field="ult_att" /></div>
                  </th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filtered.map(action => {
                  const days = calcDeadlineDays(action.prazo);
                  const dlColor = getDeadlineColor(days);
                  return (
                    <tr
                      key={action.id}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                      onClick={() => setShowDetailModal(action)}
                    >
                      <td className="px-6 py-4 font-bold text-white whitespace-nowrap">{action.aerodromo}</td>
                      <td className="px-6 py-4 text-slate-400 max-w-[180px] truncate">{action.conclusao}</td>
                      <td className="px-6 py-4 text-slate-200 max-w-[220px] truncate">{action.acao}</td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusBg(action.status)}`}>
                          {action.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center">
                          <span className="font-bold text-slate-200">{formatDate(action.prazo)}</span>
                          {action.status !== 'Concluída' && action.prazo && (
                            <span className="text-[9px] font-black uppercase mt-0.5" style={{ color: dlColor }}>
                              {getDeadlineLabel(days)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-slate-400 whitespace-nowrap">
                        {formatDate(action.ult_att)}
                      </td>
                      <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          {action.status !== 'Concluída' && (
                            <button
                              onClick={() => openUpdate(action)}
                              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-850 rounded-lg transition-all"
                              title="Atualizar"
                            >
                              <Edit2 size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => fetchHistory(action)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-850 rounded-lg transition-all"
                            title="Ver Histórico"
                          >
                            <History size={14} />
                          </button>
                          {action.status === 'Concluída' && (
                            <button
                              onClick={() => handleRevert(action)}
                              className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-850 rounded-lg transition-all"
                              title="Reverter Status"
                            >
                              <RotateCcw size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteAction(action)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-850 rounded-lg transition-all"
                            title="Deletar Ação"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===== MODAL: Inserir Senha (Bonito) ===== */}
      {passwordModal.open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex flex-col items-center bg-slate-950 text-center">
              <div className="p-3 bg-sky-500/10 text-sky-400 rounded-full mb-3">
                <KeyRound size={28} />
              </div>
              <h3 className="text-base font-bold text-white">Autorização Requerida</h3>
              <p className="text-xs text-slate-400 mt-1">Insira a senha de acesso para realizar esta operação</p>
            </div>
            <form onSubmit={handlePasswordSubmit}>
              <div className="p-6 space-y-4">
                <div className="flex flex-col gap-1.5">
                  <input
                    autoFocus
                    type="password"
                    required
                    value={passwordInput}
                    onChange={e => setPasswordInput(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg text-sm text-center text-white p-3 focus:outline-none focus:border-slate-700 placeholder-slate-600"
                    placeholder="••••••••"
                  />
                  {passwordModal.error && (
                    <span className="text-xs text-red-500 font-bold text-center mt-1">
                      {passwordModal.error}
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPasswordModal(prev => ({ ...prev, open: false }))}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-850 rounded-lg text-xs font-bold text-slate-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 rounded-lg text-xs font-bold text-white"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL: Cadastrar Ação ===== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Cadastrar Nova Ação
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <form id="createForm" onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aeródromo</label>
                  <input required value={createForm.aerodromo} onChange={e => setCreateForm({ ...createForm, aerodromo: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg text-sm text-white p-2.5 focus:outline-none focus:border-slate-700"
                    placeholder="Ex: 01_GADHOC AEROPORTOS" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conclusão</label>
                  <input required value={createForm.conclusao} onChange={e => setCreateForm({ ...createForm, conclusao: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg text-sm text-white p-2.5 focus:outline-none focus:border-slate-700"
                    placeholder="Ex: PROGRAMA DE REDUÇÃO DO TEMPO" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Responsável</label>
                  <input required value={createForm.responsavel} onChange={e => setCreateForm({ ...createForm, responsavel: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg text-sm text-white p-2.5 focus:outline-none focus:border-slate-700"
                    placeholder="Nome do responsável" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reunião</label>
                  <input required value={createForm.reuniao} onChange={e => setCreateForm({ ...createForm, reuniao: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg text-sm text-white p-2.5 focus:outline-none focus:border-slate-700"
                    placeholder="Ex: 19_GADHOC AEROPORTOS" />
                </div>
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ação</label>
                  <input required value={createForm.acao} onChange={e => setCreateForm({ ...createForm, acao: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg text-sm text-white p-2.5 focus:outline-none focus:border-slate-700"
                    placeholder="Descrição simplificada da ação" />
                </div>
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Detalhes</label>
                  <textarea value={createForm.detalhes} onChange={e => setCreateForm({ ...createForm, detalhes: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg text-sm text-white p-2.5 focus:outline-none focus:border-slate-700 min-h-[80px]"
                    placeholder="Detalhamento da ação..." />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</label>
                  <select value={createForm.status} onChange={e => setCreateForm({ ...createForm, status: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg text-sm text-white p-2.5 focus:outline-none focus:border-slate-700">
                    <option>Pendente</option>
                    <option>Em Andamento</option>
                    <option>Concluída</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prazo</label>
                  <input type="date" value={createForm.prazo} onChange={e => setCreateForm({ ...createForm, prazo: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg text-sm text-white p-2.5 focus:outline-none focus:border-slate-700" />
                </div>
              </form>
            </div>
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-2">
              <button onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-850 rounded-lg text-sm font-medium text-slate-300">
                Cancelar
              </button>
              <button type="submit" form="createForm" disabled={isSaving}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 rounded-lg text-sm font-bold text-white flex items-center justify-center min-w-[80px]">
                {isSaving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: Detalhes da Ação ===== */}
      {showDetailModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onMouseDown={() => setShowDetailModal(null)}
        >
          <div 
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Info size={16} className="text-sky-400" />
                Detalhes da Ação
              </h3>
              <button onClick={() => setShowDetailModal(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Aeródromo</span>
                  <p className="text-sm font-bold text-white">{showDetailModal.aerodromo}</p>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Conclusão</span>
                  <p className="text-sm font-bold text-white">{showDetailModal.conclusao}</p>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Responsável</span>
                  <p className="text-sm font-bold text-white">{showDetailModal.responsavel}</p>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Reunião</span>
                  <p className="text-sm font-bold text-white">{showDetailModal.reuniao}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Ação</span>
                  <p className="text-sm font-medium text-white">{showDetailModal.acao}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Detalhes</span>
                  <p className="text-sm text-slate-300 whitespace-pre-wrap">{showDetailModal.detalhes || '—'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Status</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusBg(showDetailModal.status)}`}>
                    {showDetailModal.status}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Prazo</span>
                  <p className="text-sm font-bold text-white">{formatDate(showDetailModal.prazo)}</p>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Data de Conclusão</span>
                  <p className="text-sm font-bold text-white">{formatDate(showDetailModal.dt_conclusao)}</p>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Última Atualização</span>
                  <p className="text-sm font-bold text-slate-400">{showDetailModal.ult_att ? formatDateTime(showDetailModal.ult_att) : '—'}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => { setShowDetailModal(null); fetchHistory(showDetailModal); }}
                  className="flex items-center gap-1.5 px-4 py-2 border border-slate-800 hover:bg-slate-800 rounded-lg text-sm font-bold text-slate-300"
                >
                  <History size={14} />
                  Ver Histórico
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: Atualizar Ação ===== */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <h3 className="text-lg font-bold text-white">Atualizar Ação</h3>
              <button onClick={() => setShowUpdateModal(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-850">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">Ação</span>
                <p className="text-xs font-bold text-white line-clamp-2">{showUpdateModal.acao}</p>
              </div>
              <form id="updateForm" onSubmit={handleUpdate} className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nome</label>
                  <input required value={updateForm.nome} onChange={e => setUpdateForm({ ...updateForm, nome: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg text-sm text-white p-2.5 focus:outline-none focus:border-slate-700"
                    placeholder="Seu nome" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Atualização</label>
                  <textarea required value={updateForm.att} onChange={e => setUpdateForm({ ...updateForm, att: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg text-sm text-white p-2.5 focus:outline-none focus:border-slate-700 min-h-[100px]"
                    placeholder="Descreva a atualização..." />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</label>
                  <select value={updateForm.status} onChange={e => setUpdateForm({ ...updateForm, status: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-lg text-sm text-white p-2.5 focus:outline-none focus:border-slate-700">
                    <option>Pendente</option>
                    <option>Em Andamento</option>
                    <option>Concluída</option>
                  </select>
                </div>
              </form>
            </div>
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-2">
              <button onClick={() => setShowUpdateModal(null)}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-850 rounded-lg text-sm font-medium text-slate-300">
                Cancelar
              </button>
              <button type="submit" form="updateForm" disabled={isSaving}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 rounded-lg text-sm font-bold text-white">
                {isSaving ? 'Salvando...' : 'Salvar Atualização'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: Histórico ===== */}
      {showHistoryModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onMouseDown={() => { setShowHistoryModal(null); setHistoryData([]); setEditingUpdate(null); }}
        >
          <div 
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <History size={16} className="text-sky-400" />
                Histórico de Atualizações
              </h3>
              <button onClick={() => { setShowHistoryModal(null); setHistoryData([]); setEditingUpdate(null); }} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-850">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">Ação</span>
                <p className="text-xs font-bold text-white">{showHistoryModal.acao}</p>
              </div>

              {historyLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500" />
                </div>
              ) : historyData.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm">
                  Nenhuma atualização registrada para esta ação.
                </div>
              ) : (
                <div className="overflow-hidden border border-slate-800 rounded-xl">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                        <th className="px-4 py-3 w-1/4">Nome</th>
                        <th className="px-4 py-3 w-1/2">Atualização</th>
                        <th className="px-4 py-3 whitespace-nowrap w-1/6">Data/Hora</th>
                        <th className="px-4 py-3 text-center w-1/12">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {historyData.map(u => {
                        const isEditing = editingUpdate?.id === u.id;
                        return (
                          <tr key={u.id} className="hover:bg-slate-800/40 align-top">
                            {isEditing ? (
                              <td colSpan={3} className="px-4 py-3">
                                <form onSubmit={(e) => handleSaveEditUpdate(e, u, showHistoryModal.id)} className="space-y-3">
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nome</label>
                                    <input required value={editUpdateForm.nome} onChange={e => setEditUpdateForm({ ...editUpdateForm, nome: e.target.value })}
                                      className="bg-slate-950 border border-slate-800 rounded-lg text-xs text-white p-2 focus:outline-none focus:border-slate-700 w-full" />
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Atualização</label>
                                    <textarea required value={editUpdateForm.att} onChange={e => setEditUpdateForm({ ...editUpdateForm, att: e.target.value })}
                                      className="bg-slate-950 border border-slate-800 rounded-lg text-xs text-white p-2 focus:outline-none focus:border-slate-700 w-full min-h-[60px]" />
                                  </div>
                                  <div className="flex gap-2">
                                    <button type="submit" className="px-3 py-1 bg-sky-500 hover:bg-sky-600 rounded text-xs font-bold text-white">
                                      Salvar
                                    </button>
                                    <button type="button" onClick={() => setEditingUpdate(null)} className="px-3 py-1 border border-slate-800 hover:bg-slate-850 rounded text-xs font-medium text-slate-300">
                                      Cancelar
                                    </button>
                                  </div>
                                </form>
                              </td>
                            ) : (
                              <>
                                <td className="px-4 py-3 font-bold text-white whitespace-nowrap">{u.nome}</td>
                                <td className="px-4 py-3 text-slate-400 whitespace-pre-wrap">{u.att}</td>
                                <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">{formatDateTime(u.dt_att)}</td>
                              </>
                            )}
                            <td className="px-4 py-3 text-center">
                              {!isEditing && (
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => handleStartEditUpdate(u)}
                                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
                                    title="Editar Atualização"
                                  >
                                    <Edit2 size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUpdate(u, showHistoryModal.id)}
                                    className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded"
                                    title="Excluir Atualização"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
