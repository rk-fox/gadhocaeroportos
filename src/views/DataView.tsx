import React, { useState } from 'react';
import { Database, Download, Filter, Search, Info } from 'lucide-react';
import { AIRPORT_DATA } from '../data/airportData';
import { calculateGains, CalculationFactors } from '../utils/calculations';

interface DataViewProps {
  factors: CalculationFactors;
}

export default function DataView({ factors }: DataViewProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = AIRPORT_DATA.filter(item => 
    item.aerodrome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.runway.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.taxiway_dep.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">
      <section className="mb-10">
        <h2 className="text-3xl font-display font-extrabold text-text-main tracking-tight leading-none mb-2">
          Base de Dados Operacional
        </h2>
        <p className="text-text-muted">
          Métricas de referência para aeródromos e pistas, incluindo potenciais de ganho unitários.
        </p>
      </section>

      <div className="bg-surface-card rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Buscar aeródromo, pista ou taxiway..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-surface-low text-sm focus:outline-none focus:ring-2 focus:ring-gain/50 transition-shadow"
            />
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-text-main text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors">
              <Download size={16} /> Exportar CSV
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-surface-low/50 border-b border-slate-200">
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest sticky left-0 bg-surface-low/50 z-10">Aeródromo / Pista</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">TWY (DEP/ARR)</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">ROT DEP (C/I)</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">ROT ARR (C/I)</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">TAXI DEP (C/I)</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">TAXI ARR (C/I)</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-right bg-gain-light/5 text-gain">Ganho Tempo (s)</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-right bg-gain-light/5 text-gain">Ganho Comb. (kg)</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-right bg-gain-light/5 text-gain">Ganho CO2 (kg)</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => {
                const gains = calculateGains(item, factors, 1);
                return (
                  <tr key={`${item.aerodrome}-${item.runway}`} className="border-b border-slate-100 last:border-0 hover:bg-surface-low transition-colors group">
                    <td className="py-4 px-6 sticky left-0 bg-white group-hover:bg-surface-low z-10">
                      <div className="flex flex-col">
                        <span className="font-bold text-text-main text-sm">{item.aerodrome}</span>
                        <span className="text-xs text-text-muted">Pista {item.runway}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-mono px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">{item.taxiway_dep}</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-xs font-mono px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">{item.taxiway_arr}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center text-xs text-text-muted">
                      {item.rot_dep_cab}s <span className="text-slate-300 mx-1">/</span> <span className="text-text-main font-semibold">{item.rot_dep_int}s</span>
                    </td>
                    <td className="py-4 px-6 text-center text-xs text-text-muted">
                      {item.rot_arr_cab}s <span className="text-slate-300 mx-1">/</span> <span className="text-text-main font-semibold">{item.rot_arr_int}s</span>
                    </td>
                    <td className="py-4 px-6 text-center text-xs text-text-muted">
                      {item.taxi_dep_cab}m <span className="text-slate-300 mx-1">/</span> <span className="text-text-main font-semibold">{item.taxi_dep_int}m</span>
                    </td>
                    <td className="py-4 px-6 text-center text-xs text-text-muted">
                      {item.taxi_arr_cab}m <span className="text-slate-300 mx-1">/</span> <span className="text-text-main font-semibold">{item.taxi_arr_int}m</span>
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-sm font-bold text-gain bg-gain-light/5">
                      {gains.total.time.toFixed(1)}
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-sm font-bold text-gain bg-gain-light/5">
                      {gains.total.fuel.toFixed(1)}
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-sm font-bold text-gain bg-gain-light/5">
                      {gains.total.co2.toFixed(1)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 bg-surface-low flex items-start gap-4 text-xs text-text-muted">
          <Info size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p>Os valores (C/I) representam os cenários **Cabeceira** e **Interseção**, respectivamente.</p>
            <p>Os ganhos são calculados por voo individual baseados nos parâmetros atuais de configuração.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
