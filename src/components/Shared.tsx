import React from 'react';

export function KpiCard({ title, value, unit, icon, trend, trendIcon }: any) {
  return (
    <div className="bg-surface-card p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gain-light"></div>
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{title}</span>
        <span className="text-gain">{icon}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-4xl font-display font-extrabold text-text-main">
          {value} <span className="text-lg font-medium text-text-muted">{unit}</span>
        </span>
        <div className="flex items-center gap-1 mt-2 text-gain">
          {trendIcon}
          <span className="text-xs font-semibold">{trend}</span>
        </div>
      </div>
    </div>
  );
}

export function BarRow({ label, highlight, fill1, fill2 }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-semibold text-text-muted">
        <span>{label}</span>
        <span className="text-gain">{highlight}</span>
      </div>
      <div className="h-4 bg-surface-low rounded-full overflow-hidden flex">
        <div className="h-full bg-sidebar transition-all duration-500" style={{ width: `${fill1}%` }}></div>
        {fill2 > 0 && (
          <div className="h-full bg-gain-light border-l border-white/20 transition-all duration-500" style={{ width: `${fill2}%` }}></div>
        )}
      </div>
    </div>
  );
}

export function MetricRow({ label, value }: any) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-200/50 last:border-0">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="text-sm font-bold text-text-main">{value}</span>
    </div>
  );
}
