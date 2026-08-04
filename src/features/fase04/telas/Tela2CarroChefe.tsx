// Tela2CarroChefe.tsx
// Tela 2 — Carro-Chefe de Faturamento.
// Só exibida se servicos.length >= 2 (B.6.3 — o Fase04Flow decide o skip).
// Especificação: seção B.4, "TELA 2".

import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { ServicoInstancia } from '../fase04.types';
import { formatBRL } from '../../../components/CurrencyInput';

interface Tela2CarroChefeProps {
  servicos: ServicoInstancia[];
  initialCarroChefeId?: string | null;
  onAvancar: (carroChefeId: string) => void;
}

export default function Tela2CarroChefe({
  servicos,
  initialCarroChefeId,
  onAvancar,
}: Tela2CarroChefeProps) {
  const [selecionado, setSelecionado] = useState<string | null>(initialCarroChefeId ?? null);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8" id="tela2_carrochefe_fase04">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
          <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">
            Eixo 04 · Serviços · Tela 2
          </span>
        </div>
        <h1 className="text-xl font-bold text-white leading-snug">
          Analisando todos os serviços cadastrados, qual é o seu "Carro-Chefe" (o que traz a maior
          parte do seu faturamento hoje)?
        </h1>
      </div>

      {/* Choice cards */}
      <div className="space-y-2">
        {servicos.map((s) => {
          const isSelected = selecionado === s.id;
          return (
            <button
              key={s.id}
              type="button"
              id={`carrochefe_${s.id}`}
              onClick={() => setSelecionado(s.id)}
              aria-pressed={isSelected}
              className={[
                'w-full text-left px-4 py-3.5 rounded-xl border text-sm transition-all',
                isSelected
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-white font-semibold'
                  : 'bg-white/4 border-white/8 text-slate-300 hover:bg-white/8 hover:border-white/15',
              ].join(' ')}
            >
              {s.nomeComercial} ({formatBRL(s.precoVenda)})
            </button>
          );
        })}
      </div>

      {/* Avançar */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          id="btn_tela2_carrochefe_avancar"
          disabled={selecionado === null}
          onClick={() => selecionado && onAvancar(selecionado)}
          className="btn-primary flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
        >
          Avançar
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
