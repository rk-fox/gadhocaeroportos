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

export function BarRow({ label, highlight, fill1, fill2, onMouseEnter, onMouseLeave, isActive }: any) {
  return (
    <div 
      className={`space-y-2 cursor-pointer transition-all p-2 rounded-lg ${isActive ? 'bg-surface-low border border-slate-200 shadow-sm' : 'hover:bg-slate-50'}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex justify-between text-xs font-semibold text-text-muted">
        <span>{label}</span>
        <span className="text-gain font-bold">{highlight}</span>
      </div>
      <div className="h-4 bg-surface-low rounded-full overflow-hidden flex shadow-inner">
        <div 
          className="h-full bg-sidebar transition-all duration-700 ease-out relative group-hover:brightness-110" 
          style={{ width: `${fill1}%` }}
        >
          {/* Tooltip or subtle highlight could go here */}
        </div>
        {fill2 > 0 && (
          <div 
            className="h-full bg-gain-light border-l border-white/20 transition-all duration-700 ease-out" 
            style={{ width: `${fill2}%` }}
          ></div>
        )}
      </div>
    </div>
  );
}

export function MetricRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
      <span className="text-xs text-text-muted">{label}</span>
      <span className="text-sm font-bold text-text-main">{value}</span>
    </div>
  );
}

export function Tooltip({ children, content, ...props }: { children: React.ReactNode, content: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="group relative inline-block" {...props}>
      {children}
      <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-[100] pointer-events-none">
        <div className="bg-slate-900 text-white text-[10px] font-bold rounded-lg px-4 py-2 whitespace-nowrap shadow-xl border border-white/10 relative">
          {content}
          <div className="absolute top-full border-t-[6px] border-t-slate-900 left-1/2 -translate-x-1/2 border-x-[6px] border-x-transparent"></div>
        </div>
      </div>
    </div>
  );
}
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-display font-black text-text-main tracking-tight uppercase">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
