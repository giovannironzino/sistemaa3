// Tela4Redirecionamento.tsx
// Tela 4 — Escolha de Novo Foco
// Exibida: (a) resposta "Não" na Tela 3, ou (b) fluxoSemDados === true.
// Sempre exibe todos os 6 clusters.

import React, { useState } from 'react';
import { ClusterId } from '../fase01.types';
import { CLUSTERS } from '../data/bancoDePromessas';
import { ArrowRight } from 'lucide-react';

interface Tela4RedirecionamentoProps {
  onEscolher: (clusterId: ClusterId) => void;
}

export default function Tela4Redirecionamento({ onEscolher }: Tela4RedirecionamentoProps) {
  const [selecionado, setSelecionado] = useState<ClusterId | null>(null);

  function handleConfirmar() {
    if (!selecionado) return;
    onEscolher(selecionado);
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8" id="tela4_redirecionamento">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
          <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">
            Eixo 01 · Fase 01 · Tela 4 de 6
          </span>
        </div>
        <h1 className="text-xl font-bold text-white leading-snug">
          Para qual desses grupos você quer direcionar o seu foco nos próximos 90 dias?
        </h1>
      </div>

      {/* Choice Cards — sempre todos os 6 clusters */}
      <div className="space-y-3">
        {CLUSTERS.map((cluster) => {
          const isSelected = selecionado === cluster.id;
          return (
            <button
              key={cluster.id}
              type="button"
              id={`tela4_cluster_${cluster.id}`}
              onClick={() => setSelecionado(cluster.id)}
              className={`w-full text-left rounded-xl px-5 py-4 border transition-all cursor-pointer flex items-center gap-3 group ${
                isSelected
                  ? 'bg-indigo-500/15 border-indigo-500 text-indigo-100'
                  : 'bg-white/4 border-white/10 text-slate-300 hover:bg-white/8 hover:border-indigo-500/40 hover:text-white'
              }`}
            >
              <div
                className={`flex-shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-500'
                    : 'border-white/20 group-hover:border-indigo-500/50'
                }`}
              >
                {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
              </div>
              <span className="text-sm font-semibold leading-snug">{cluster.label}</span>
            </button>
          );
        })}
      </div>

      {/* Confirmar */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          id="btn_tela4_confirmar"
          disabled={!selecionado}
          onClick={handleConfirmar}
          className="btn-primary flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Confirmar foco
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
