import React from 'react';
import { Check, ChevronRight } from 'lucide-react';

export interface AxisNavItem {
  id: string;
  title: string;
  subtitle?: string;
  anchorQuestion: string;
}

interface SectionNavProps {
  axes: AxisNavItem[];
  activeAxisIndex: number;
  completedAxes: boolean[];
  onSelectAxis: (index: number) => void;
}

export const SectionNav: React.FC<SectionNavProps> = ({
  axes,
  activeAxisIndex,
  completedAxes,
  onSelectAxis,
}) => {
  const totalCompleted = completedAxes.filter(Boolean).length;
  const progressPercentage = Math.round((totalCompleted / axes.length) * 100);

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 bg-[#090d16] border border-white/10 p-4 space-y-4 font-body">
      {/* Header da Trilha de Progresso */}
      <div className="border-b border-white/10 pb-3">
        <span className="font-label text-xs uppercase tracking-wider text-slate-400 block mb-1">
          Trilha Diagnóstica
        </span>
        <div className="flex items-baseline justify-between">
          <span className="font-label text-sm text-white">Progresso Global</span>
          <span className="font-label text-xs text-indigo-400 font-mono tabular-num">
            {totalCompleted}/{axes.length} ({progressPercentage}%)
          </span>
        </div>
        
        {/* Barra de Progresso Sóbria */}
        <div className="w-full bg-white/5 h-1.5 mt-2 border border-white/10">
          <div
            className="bg-indigo-500 h-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Lista Vertical dos 7 Eixos */}
      <nav className="space-y-1">
        {axes.map((axis, index) => {
          const isActive = index === activeAxisIndex;
          const isCompleted = completedAxes[index];

          return (
            <button
              key={axis.id}
              type="button"
              onClick={() => onSelectAxis(index)}
              className={`w-full text-left p-3 transition-all flex items-start justify-between border ${
                isActive
                  ? 'bg-indigo-600/15 border-indigo-500/50 text-white'
                  : isCompleted
                  ? 'bg-white/[0.02] border-white/5 text-slate-300 hover:bg-white/[0.05]'
                  : 'bg-transparent border-transparent text-slate-400 hover:bg-white/[0.03] hover:text-slate-200'
              }`}
            >
              <div className="space-y-0.5 pr-2">
                <div className="flex items-center gap-2">
                  <span className="font-label text-[10px] text-slate-400 uppercase tracking-widest">
                    EIXO {index + 1}
                  </span>
                  {isCompleted && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-label text-slate-300 bg-white/10 px-1.5 py-0.2">
                      <Check className="w-3 h-3 text-indigo-400" /> OK
                    </span>
                  )}
                </div>
                <h4 className="font-label text-xs leading-snug line-clamp-1">
                  {axis.title}
                </h4>
              </div>

              <ChevronRight
                className={`w-4 h-4 flex-shrink-0 mt-1 transition-transform ${
                  isActive ? 'text-indigo-400 translate-x-0.5' : 'text-slate-600'
                }`}
              />
            </button>
          );
        })}
      </nav>

      {/* Rodapé Metodológico Compacto */}
      <div className="pt-3 border-t border-white/10 text-[10px] font-label text-slate-400 uppercase tracking-wider space-y-1">
        <p>Modelo Estratégico A3</p>
        <p className="text-slate-400 font-mono">Venedik/Diagnostic 2.0</p>
      </div>
    </aside>
  );
};

export default SectionNav;
