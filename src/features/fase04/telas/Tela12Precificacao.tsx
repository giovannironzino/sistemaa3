// Tela12Precificacao.tsx
// Tela 1.2 — Precificação e Condições Comerciais.
// Especificação: seção B.4, "TELAS 1.1, 1.2, 1.3".

import React, { useState } from 'react';
import { ArrowRight, CheckSquare, Square } from 'lucide-react';
import type { FormaPagamentoId, ParcelamentoId } from '../fase04.types';
import { FORMAS_PAGAMENTO, PARCELAMENTOS } from '../data/listasFase04';
import CurrencyInput from '../../../components/CurrencyInput';

interface Tela12PrecificacaoProps {
  nomeComercial: string;
  initialPreco?: number;
  initialFormasPagamento?: FormaPagamentoId[];
  initialParcelamento?: ParcelamentoId | null;
  onAvancar: (
    precoVenda: number,
    formasPagamento: FormaPagamentoId[],
    parcelamentoMaximo: ParcelamentoId
  ) => void;
}

export default function Tela12Precificacao({
  nomeComercial,
  initialPreco,
  initialFormasPagamento,
  initialParcelamento,
  onAvancar,
}: Tela12PrecificacaoProps) {
  const [preco, setPreco] = useState<number>(initialPreco ?? 0);
  const [formasSelecionadas, setFormasSelecionadas] = useState<Set<FormaPagamentoId>>(
    () => new Set(initialFormasPagamento ?? [])
  );
  const [parcelamento, setParcelamento] = useState<ParcelamentoId | null>(
    initialParcelamento ?? null
  );

  function toggleForma(id: FormaPagamentoId) {
    setFormasSelecionadas((prev) => {
      const novo = new Set(prev);
      if (novo.has(id)) {
        novo.delete(id);
      } else {
        novo.add(id);
      }
      return novo;
    });
  }

  const podeAvancar = preco > 0 && formasSelecionadas.size >= 1 && parcelamento !== null;

  function handleAvancar() {
    if (!podeAvancar || parcelamento === null) return;
    const formasOrdenadas = FORMAS_PAGAMENTO.filter((f) => formasSelecionadas.has(f.id)).map(
      (f) => f.id
    );
    onAvancar(preco, formasOrdenadas, parcelamento);
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8" id="tela12_precificacao_fase04">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
          <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">
            Eixo 04 · Serviços · Tela 1.2
          </span>
        </div>
        <h1 className="text-xl font-bold text-white leading-snug">
          Quais são os valores e condições de pagamento do(a) {nomeComercial}?
        </h1>
      </div>

      {/* Campo 1 — Preço de Venda */}
      <CurrencyInput
        id="input_preco_venda"
        label="Preço de Venda (R$)"
        value={preco}
        onChange={setPreco}
      />

      {/* Campo 2 — Formas de Pagamento Aceitas */}
      <div className="space-y-3">
        <span className="block text-xs font-semibold text-slate-300">
          Formas de Pagamento Aceitas
        </span>
        <div className="space-y-2">
          {FORMAS_PAGAMENTO.map((item) => {
            const marcado = formasSelecionadas.has(item.id);
            return (
              <button
                key={item.id}
                type="button"
                id={`forma_pagamento_${item.id}`}
                onClick={() => toggleForma(item.id)}
                aria-pressed={marcado}
                className={[
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all',
                  marcado
                    ? 'bg-cyan-500/15 border-cyan-500/40'
                    : 'bg-white/4 border-white/8 hover:bg-white/8',
                ].join(' ')}
              >
                {marcado ? (
                  <CheckSquare className="h-4 w-4 text-cyan-400 shrink-0" />
                ) : (
                  <Square className="h-4 w-4 text-slate-500 shrink-0" />
                )}
                <span
                  className={`text-sm leading-snug ${marcado ? 'text-white font-medium' : 'text-slate-300'}`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
        {formasSelecionadas.size === 0 && (
          <p className="text-xs text-amber-400 px-1">Selecione ao menos 1 forma de pagamento.</p>
        )}
      </div>

      {/* Campo 3 — Parcelamento Máximo Sem Juros */}
      <div className="space-y-3">
        <span className="block text-xs font-semibold text-slate-300">
          Parcelamento Máximo Sem Juros
        </span>
        <div className="grid grid-cols-4 gap-2">
          {PARCELAMENTOS.map((item) => {
            const isSelected = parcelamento === item.id;
            return (
              <button
                key={item.id}
                type="button"
                id={`parcelamento_${item.id}`}
                onClick={() => setParcelamento(item.id)}
                aria-pressed={isSelected}
                className={[
                  'text-center px-2 py-2.5 rounded-xl border text-xs font-semibold transition-all',
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-white'
                    : 'bg-white/4 border-white/8 text-slate-300 hover:bg-white/8',
                ].join(' ')}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Avançar */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          id="btn_tela12_avancar"
          disabled={!podeAvancar}
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
