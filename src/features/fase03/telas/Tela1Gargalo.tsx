// Tela1Gargalo.tsx
// Tela 1 — Gargalo do Processo Comercial.
// Só exibida se semNaoConvertidos === false.
// 5 campos numéricos (±), soma deve ser exatamente totalNaoConvertidosRef.
// Especificação: seção 4, "TELA 1".

import React, { useState, useMemo } from 'react';
import { Minus, Plus, ArrowRight, AlertCircle } from 'lucide-react';
import type { DistribuicaoGargalo, MomentoPerdaId } from '../fase03.types';
import { MOMENTOS_PERDA } from '../data/listas';

interface Tela1GargaloProps {
  totalNaoConvertidosRef: number;
  initialDistribuicao?: DistribuicaoGargalo | null;
  onAvancar: (distribuicao: DistribuicaoGargalo) => void;
}

function buildInitial(init?: DistribuicaoGargalo | null): DistribuicaoGargalo {
  return {
    preco_inicial:           init?.preco_inicial           ?? 0,
    apos_explicacao_servico: init?.apos_explicacao_servico ?? 0,
    tentativa_agendamento:   init?.tentativa_agendamento   ?? 0,
    no_show:                 init?.no_show                 ?? 0,
    nao_identificado:        init?.nao_identificado        ?? 0,
  };
}

export default function Tela1Gargalo({
  totalNaoConvertidosRef,
  initialDistribuicao,
  onAvancar,
}: Tela1GargaloProps) {
  const [valores, setValores] = useState<DistribuicaoGargalo>(() =>
    buildInitial(initialDistribuicao)
  );

  const soma = useMemo(
    () => (Object.values(valores) as number[]).reduce((acc, v) => acc + v, 0),
    [valores]
  );

  const diferenca = totalNaoConvertidosRef - soma;
  const somaBate = soma === totalNaoConvertidosRef;

  function alterar(id: MomentoPerdaId, delta: number) {
    setValores((prev) => {
      const novoValor = Math.max(0, (prev[id] ?? 0) + delta);
      return { ...prev, [id]: novoValor };
    });
  }

  function handleAvancar() {
    if (!somaBate) return;
    onAvancar(valores);
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8" id="tela1_gargalo_fase03">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
          <span className="text-[10px] font-bold tracking-widest text-violet-400 uppercase">
            Eixo 03 · Vendas · Tela 1
          </span>
        </div>
        <h1 className="text-xl font-bold text-white leading-snug">
          Gargalo do Processo Comercial
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Das <span className="text-white font-bold">{totalNaoConvertidosRef}</span> pessoas que não fecharam,
          quantas pararam de te responder em cada um destes momentos?
        </p>
      </div>

      {/* Campos contadores */}
      <div className="space-y-3">
        {MOMENTOS_PERDA.map((item) => {
          const val = valores[item.id];
          return (
            <div
              key={item.id}
              id={`gargalo_${item.id}`}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 flex items-center justify-between gap-4"
            >
              <span className="text-sm text-slate-300 flex-1 leading-snug">{item.label}</span>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  id={`btn_gargalo_${item.id}_dec`}
                  onClick={() => alterar(item.id, -1)}
                  disabled={val <= 0}
                  aria-label={`Diminuir ${item.label}`}
                  className="h-8 w-8 rounded-lg bg-white/8 border border-white/12 flex items-center justify-center text-slate-300 hover:bg-white/15 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span
                  className={`text-lg font-black tabular-nums w-8 text-center ${val > 0 ? 'text-violet-300' : 'text-slate-500'}`}
                  id={`val_gargalo_${item.id}`}
                >
                  {val}
                </span>
                <button
                  type="button"
                  id={`btn_gargalo_${item.id}_inc`}
                  onClick={() => alterar(item.id, 1)}
                  aria-label={`Aumentar ${item.label}`}
                  className="h-8 w-8 rounded-lg bg-white/8 border border-white/12 flex items-center justify-center text-slate-300 hover:bg-white/15 hover:text-white transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feedback de soma em tempo real */}
      <div
        id="soma_gargalo_feedback"
        className={`rounded-xl px-4 py-3 flex items-center gap-3 text-sm font-semibold transition-all ${
          somaBate
            ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-300'
            : 'bg-amber-500/10 border border-amber-500/25 text-amber-300'
        }`}
      >
        {!somaBate && <AlertCircle className="h-4 w-4 shrink-0" />}
        <span>
          {somaBate
            ? `✓ Total distribuído: ${soma} de ${totalNaoConvertidosRef}`
            : diferenca > 0
            ? `Faltam ${diferenca} para completar (distribuído: ${soma} / total: ${totalNaoConvertidosRef})`
            : `Você distribuiu ${Math.abs(diferenca)} a mais do que o total (distribuído: ${soma} / total: ${totalNaoConvertidosRef})`}
        </span>
      </div>

      {/* Avançar */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          id="btn_tela1_gargalo_avancar"
          disabled={!somaBate}
          onClick={handleAvancar}
          className="btn-primary flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
        >
          Avançar
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
