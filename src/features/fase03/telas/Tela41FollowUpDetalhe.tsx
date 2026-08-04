// Tela41FollowUpDetalhe.tsx
// Tela 4.1 — Investigação Detalhada do Fluxo de Acompanhamento.
// Só exibida se atitudeFollowUp === 'recontato_ativo'.
// Formulário único com 3 perguntas internas (não telas separadas).
// Especificação: seção 4, "TELA 4.1".

import React, { useState } from 'react';
import { ArrowRight, CheckSquare, Square } from 'lucide-react';
import type {
  QuantidadeTentativas,
  IntervaloPrimeiroRecontato,
  ConteudoRecontatoId,
} from '../fase03.types';
import {
  QUANTIDADES_TENTATIVAS,
  INTERVALOS_RECONTATO,
  CONTEUDOS_RECONTATO,
} from '../data/listas';

interface Tela41FollowUpDetalheProps {
  initialQuantidade: QuantidadeTentativas | null;
  initialIntervalo: IntervaloPrimeiroRecontato | null;
  initialConteudo: ConteudoRecontatoId[];
  onAvancar: (
    quantidade: QuantidadeTentativas,
    intervalo: IntervaloPrimeiroRecontato,
    conteudo: ConteudoRecontatoId[]
  ) => void;
}

export default function Tela41FollowUpDetalhe({
  initialQuantidade,
  initialIntervalo,
  initialConteudo,
  onAvancar,
}: Tela41FollowUpDetalheProps) {
  const [quantidade, setQuantidade] = useState<QuantidadeTentativas | null>(initialQuantidade);
  const [intervalo, setIntervalo] = useState<IntervaloPrimeiroRecontato | null>(initialIntervalo);
  const [conteudo, setConteudo] = useState<Set<ConteudoRecontatoId>>(
    () => new Set(initialConteudo)
  );

  const podeAvancar = quantidade !== null && intervalo !== null;

  function toggleConteudo(id: ConteudoRecontatoId) {
    setConteudo((prev) => {
      const novo = new Set(prev);
      if (novo.has(id)) {
        novo.delete(id);
      } else {
        novo.add(id);
      }
      return novo;
    });
  }

  function handleAvancar() {
    if (!podeAvancar) return;
    // Preserva a ordem canônica da tabela 2.4
    const conteudoOrdenado = CONTEUDOS_RECONTATO.filter((c) => conteudo.has(c.id)).map(
      (c) => c.id
    );
    onAvancar(quantidade, intervalo, conteudoOrdenado);
  }

  // Helper de estilo para choice cards
  function cardClass(isSelected: boolean) {
    return [
      'w-full text-left px-4 py-3 rounded-xl border text-sm transition-all',
      isSelected
        ? 'bg-violet-500/15 border-violet-500/40 text-white font-semibold'
        : 'bg-white/4 border-white/8 text-slate-300 hover:bg-white/8 hover:border-white/15',
    ].join(' ');
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8" id="tela41_followup_detalhe_fase03">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
          <span className="text-[10px] font-bold tracking-widest text-violet-400 uppercase">
            Eixo 03 · Vendas · Tela 4.1
          </span>
        </div>
        <h1 className="text-xl font-bold text-white leading-snug">
          Rotina de Recontato (Follow-up)
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Como funciona a sua rotina de recontato (follow-up)?
        </p>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* ITEM 1 — Quantidade de Tentativas                                   */}
      {/* ------------------------------------------------------------------ */}
      <div className="space-y-3" id="item1_quantidade_tentativas">
        <p className="text-sm font-bold text-slate-200">
          1. Quantas vezes você tenta o recontato antes de parar?
        </p>
        <div className="grid grid-cols-2 gap-2">
          {QUANTIDADES_TENTATIVAS.map((opcao) => (
            <button
              key={opcao.id}
              type="button"
              id={`qtd_${opcao.id}`}
              onClick={() => setQuantidade(opcao.id)}
              aria-pressed={quantidade === opcao.id}
              className={cardClass(quantidade === opcao.id)}
            >
              {opcao.label}
            </button>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* ITEM 2 — Intervalo do Primeiro Recontato                            */}
      {/* ------------------------------------------------------------------ */}
      <div className="space-y-3" id="item2_intervalo_recontato">
        <p className="text-sm font-bold text-slate-200">
          2. Quando você envia o primeiro recontato após o vácuo?
        </p>
        <div className="space-y-2">
          {INTERVALOS_RECONTATO.map((opcao) => (
            <button
              key={opcao.id}
              type="button"
              id={`intervalo_${opcao.id}`}
              onClick={() => setIntervalo(opcao.id)}
              aria-pressed={intervalo === opcao.id}
              className={cardClass(intervalo === opcao.id)}
            >
              {opcao.label}
            </button>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* ITEM 3 — Conteúdo do Recontato (multiseleção)                       */}
      {/* ------------------------------------------------------------------ */}
      <div className="space-y-3" id="item3_conteudo_recontato">
        <p className="text-sm font-bold text-slate-200">
          3. O que você costuma enviar no recontato?{' '}
          <span className="text-slate-500 font-normal">(Marque todas as que você usa)</span>
        </p>
        <div className="space-y-2">
          {CONTEUDOS_RECONTATO.map((opcao) => {
            const marcado = conteudo.has(opcao.id);
            return (
              <button
                key={opcao.id}
                type="button"
                id={`conteudo_${opcao.id}`}
                onClick={() => toggleConteudo(opcao.id)}
                aria-pressed={marcado}
                className={[
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all',
                  marcado
                    ? 'bg-violet-500/15 border-violet-500/40'
                    : 'bg-white/4 border-white/8 hover:bg-white/8',
                ].join(' ')}
              >
                {marcado ? (
                  <CheckSquare className="h-4 w-4 text-violet-400 shrink-0" />
                ) : (
                  <Square className="h-4 w-4 text-slate-500 shrink-0" />
                )}
                <span
                  className={`text-sm leading-snug ${marcado ? 'text-white font-medium' : 'text-slate-300'}`}
                >
                  {opcao.label}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-slate-600 px-1">
          Nenhuma seleção obrigatória para avançar.
        </p>
      </div>

      {/* Avançar — requer itens 1 e 2 preenchidos; item 3 é opcional */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          id="btn_tela41_avancar"
          disabled={!podeAvancar}
          onClick={handleAvancar}
          className="btn-primary flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
        >
          Ver o retrato comercial
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
