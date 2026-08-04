// Tela3Continuidade.tsx
// Tela 3 — Estratégia de Fim de Contrato e Renovação.
// Especificação: seção B.4, "TELA 3".

import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { MecanismoContinuidadeId } from '../fase04.types';
import { MECANISMOS_CONTINUIDADE } from '../data/listasFase04';

interface Tela3ContinuidadeProps {
  initialMecanismo?: MecanismoContinuidadeId | null;
  onAvancar: (mecanismo: MecanismoContinuidadeId) => void;
}

export default function Tela3Continuidade({
  initialMecanismo,
  onAvancar,
}: Tela3ContinuidadeProps) {
  const [selecionado, setSelecionado] = useState<MecanismoContinuidadeId | null>(
    initialMecanismo ?? null
  );

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8" id="tela3_continuidade_fase04">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
          <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">
            Eixo 04 · Serviços · Tela 3
          </span>
        </div>
        <h1 className="text-xl font-bold text-white leading-snug">
          Quando o contrato do seu paciente chega ao fim, qual é a conduta padrão do seu negócio?
        </h1>
      </div>

      {/* Choice cards */}
      <div className="space-y-2">
        {MECANISMOS_CONTINUIDADE.map((item) => {
          const isSelected = selecionado === item.id;
          return (
            <button
              key={item.id}
              type="button"
              id={`continuidade_${item.id}`}
              onClick={() => setSelecionado(item.id)}
              aria-pressed={isSelected}
              className={[
                'w-full text-left px-4 py-3.5 rounded-xl border text-sm transition-all',
                isSelected
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-white font-semibold'
                  : 'bg-white/4 border-white/8 text-slate-300 hover:bg-white/8 hover:border-white/15',
              ].join(' ')}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Avançar */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          id="btn_tela3_continuidade_avancar"
          disabled={selecionado === null}
          onClick={() => selecionado && onAvancar(selecionado)}
          className="btn-primary flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
        >
          Ver o retrato de serviços
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
