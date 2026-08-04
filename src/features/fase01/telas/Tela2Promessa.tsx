// Tela2Promessa.tsx
// Tela 2 — Promessa por Cluster (em loop)
// Este componente é reaproveitado pela Tela 4 quando o cluster escolhido não tem promessa.

import React, { useState } from 'react';
import { ClusterId, PromessaPorCluster } from '../fase01.types';
import { CLUSTERS, getLabelById } from '../data/bancoDePromessas';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface Tela2PromessaProps {
  clusterId: ClusterId;
  quantidadePessoas: number; // volume do cluster (0 quando reaproveitado da Tela 4 / fluxo sem dados)
  telaLabel?: string;        // label de contexto para o pill (ex: "Tela 2 de 6")
  onResponder: (entrada: PromessaPorCluster) => void;
}

export default function Tela2Promessa({
  clusterId,
  quantidadePessoas,
  telaLabel,
  onResponder,
}: Tela2PromessaProps) {
  const [selecionada, setSelecionada] = useState<string | null>(null);

  const cluster = CLUSTERS.find((c) => c.id === clusterId);
  if (!cluster) return null;

  const label = getLabelById(clusterId);

  function handleConfirmar() {
    if (!selecionada) return;
    onResponder({ clusterId, promessaSelecionada: selecionada });
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8" id={`tela2_promessa_${clusterId}`}>
      {/* Header */}
      <div className="space-y-3">
        {telaLabel && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">
              Eixo 01 · Fase 01 · {telaLabel}
            </span>
          </div>
        )}
        <h1 className="text-xl font-bold text-white leading-snug">
          {quantidadePessoas > 0 ? (
            <>
              Nos últimos 90 dias,{' '}
              <span className="text-indigo-400">{quantidadePessoas} {quantidadePessoas === 1 ? 'pessoa' : 'pessoas'}</span> te{' '}
              {quantidadePessoas === 1 ? 'procurou' : 'procuraram'} por{' '}
              <span className="text-indigo-400">{label}</span>. Para esse grupo de pessoas, qual é
              a principal transformação que você entrega?
            </>
          ) : (
            <>
              Para o grupo de{' '}
              <span className="text-indigo-400">{label}</span>, qual é a principal transformação
              que você entrega?
            </>
          )}
        </h1>
      </div>

      {/* Choice Cards */}
      <div className="space-y-3">
        {cluster.promessas.map((promessa, idx) => {
          const isSelected = selecionada === promessa;
          return (
            <button
              key={idx}
              type="button"
              id={`promessa_option_${clusterId}_${idx}`}
              onClick={() => setSelecionada(promessa)}
              className={`w-full text-left rounded-xl px-5 py-4 border transition-all cursor-pointer flex items-start gap-3 group ${
                isSelected
                  ? 'bg-indigo-500/15 border-indigo-500 text-indigo-100'
                  : 'bg-white/4 border-white/10 text-slate-300 hover:bg-white/8 hover:border-indigo-500/40 hover:text-white'
              }`}
            >
              <div
                className={`mt-0.5 flex-shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-500'
                    : 'border-white/20 group-hover:border-indigo-500/50'
                }`}
              >
                {isSelected && (
                  <div className="h-2 w-2 rounded-full bg-white" />
                )}
              </div>
              <span className="text-sm font-semibold leading-snug">{promessa}</span>
            </button>
          );
        })}
      </div>

      {/* Confirmar */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          id={`btn_tela2_confirmar_${clusterId}`}
          disabled={!selecionada}
          onClick={handleConfirmar}
          className="btn-primary flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Confirmar
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
