// Eixo01HeaderCompacto.tsx
// Cabeçalho compacto de alta clareza para o Eixo 01 — Progressive Disclosure.

import React from 'react';
import { Sparkles, HelpCircle, Layers, ChevronDown } from 'lucide-react';

interface Eixo01HeaderCompactoProps {
  currentStepIndex: number; // 0..3 (Etapas do Eixo 01)
  totalSteps?: number;
  onToggleMenuEixos?: () => void;
  menuEixosAberto?: boolean;
}

export default function Eixo01HeaderCompacto({
  currentStepIndex,
  totalSteps = 4,
  onToggleMenuEixos,
  menuEixosAberto = false,
}: Eixo01HeaderCompactoProps) {
  const etapasLabels = ['Seus pacientes', 'Padrões detectados', 'Seu método', 'Sua promessa'];

  return (
    <div className="w-full bg-[#090d16]/90 border border-white/10 rounded-2xl p-4 shadow-xl space-y-3" id="eixo01_header_compacto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Lado Esquerdo: Identidade & Etapa do Eixo */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-indigo-600 border border-indigo-500 text-white flex items-center justify-center font-label text-xs font-bold shadow-lg shadow-indigo-600/30">
            A3
          </div>
          <div>
            <span className="text-[11px] font-bold tracking-widest text-indigo-400 uppercase font-label flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Eixo 01 de 9 · Promessa &amp; Método
            </span>
            <h2 className="text-sm font-bold text-white mt-0.5">
              0{currentStepIndex + 1} · {etapasLabels[currentStepIndex] || 'Modelagem Estratégica'}
            </h2>
          </div>
        </div>

        {/* Lado Direito: Indicador Visual de Pontos & Alternador Secundário */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          {/* Indicador em Pontos (Dots Progress) */}
          <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full border border-white/10" title={`Etapa ${currentStepIndex + 1} de ${totalSteps}`}>
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <span
                key={idx}
                className={`h-2.5 rounded-full transition-all ${
                  idx === currentStepIndex
                    ? 'w-6 bg-indigo-500 shadow-sm shadow-indigo-500/50'
                    : idx < currentStepIndex
                    ? 'w-2.5 bg-emerald-400'
                    : 'w-2.5 bg-slate-700'
                }`}
              />
            ))}
          </div>

          {/* Botão Secundário para Mudar de Eixo (Sem poluir a tela) */}
          {onToggleMenuEixos && (
            <button
              type="button"
              onClick={onToggleMenuEixos}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                menuEixosAberto
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Layers className="h-3.5 w-3.5 text-indigo-400" />
              <span>Navegar nos 9 Eixos</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${menuEixosAberto ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
