// Tela3Confirmacao.tsx
// Tela 3 — Confirmação de Foco
// Exibida somente se fluxoSemDados === false.
// Variação de texto: 1 cluster qualificado vs 2+ clusters qualificados.

import React from 'react';
import { ClusterId } from '../fase01.types';
import { getLabelById } from '../data/bancoDePromessas';
import { Check, RefreshCw } from 'lucide-react';

interface Tela3ConfirmacaoProps {
  clustersQualificados: ClusterId[];
  onSim: () => void;   // publicoAlvoFinal = clustersQualificados[0] → ir para Tela 5
  onNao: () => void;   // ir para Tela 4
}

export default function Tela3Confirmacao({
  clustersQualificados,
  onSim,
  onNao,
}: Tela3ConfirmacaoProps) {
  const principal = clustersQualificados[0];
  const secundario = clustersQualificados[1] ?? null;

  const labelPrincipal = getLabelById(principal);
  const labelSecundario = secundario ? getLabelById(secundario) : null;

  const texto =
    secundario
      ? `Olhando pro que você me contou, hoje o seu foco maior é ${labelPrincipal}, e o segundo maior é ${labelSecundario}. Você quer continuar com esse mesmo foco nos próximos 90 dias?`
      : `Olhando pro que você me contou, hoje o seu foco é ${labelPrincipal}. Você quer continuar com esse foco nos próximos 90 dias?`;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8" id="tela3_confirmacao">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
          <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">
            Eixo 01 · Fase 01 · Tela 3 de 6
          </span>
        </div>
        <h1 className="text-xl font-bold text-white leading-snug">{texto}</h1>
      </div>

      {/* Foco destacado */}
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-5 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
            Foco Principal
          </span>
        </div>
        <p className="text-base font-bold text-indigo-200">{labelPrincipal}</p>
        {labelSecundario && (
          <>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Segundo Maior
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-300">{labelSecundario}</p>
          </>
        )}
      </div>

      {/* Opções */}
      <div className="space-y-3">
        <button
          type="button"
          id="btn_tela3_sim"
          onClick={onSim}
          className="w-full text-left rounded-xl px-5 py-4 border bg-white/4 border-white/10 text-slate-300 hover:bg-emerald-500/10 hover:border-emerald-500/40 hover:text-white transition-all cursor-pointer flex items-center gap-3 group"
        >
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/20 transition-all">
            <Check className="h-4 w-4 text-emerald-400" />
          </div>
          <span className="text-sm font-semibold leading-snug">
            Sim, quero continuar com esse foco.
          </span>
        </button>

        <button
          type="button"
          id="btn_tela3_nao"
          onClick={onNao}
          className="w-full text-left rounded-xl px-5 py-4 border bg-white/4 border-white/10 text-slate-300 hover:bg-amber-500/10 hover:border-amber-500/40 hover:text-white transition-all cursor-pointer flex items-center gap-3 group"
        >
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/20 transition-all">
            <RefreshCw className="h-4 w-4 text-amber-400" />
          </div>
          <span className="text-sm font-semibold leading-snug">
            Não, quero mudar meu foco nos próximos 90 dias.
          </span>
        </button>
      </div>
    </div>
  );
}
