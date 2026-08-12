// Eixo01Step2Padroes.tsx
// Tela 02 do Eixo 01 — Padrões Detectados (Leitura Pura das Descobertas do A3).

import React from 'react';
import { Sparkles, ArrowRight, RotateCcw, Award, Target, Zap } from 'lucide-react';
import { PacienteMapeadoEixo01 } from '../fase01.types';
import { derivarInsightsEixo01 } from '../lib/eixo01Derivations';

interface Eixo01Step2PadroesProps {
  pacientes: PacienteMapeadoEixo01[];
  onContinuarParaMetodo: () => void;
  onRevisarAmostra: () => void;
}

export default function Eixo01Step2Padroes({
  pacientes,
  onContinuarParaMetodo,
  onRevisarAmostra,
}: Eixo01Step2PadroesProps) {
  const insights = derivarInsightsEixo01(pacientes);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fadeIn" id="step2_padroes_detectados">
      {/* ── HERO SECTION ── */}
      <div className="text-center sm:text-left space-y-2 border-b border-white/10 pb-6">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-cyan-400 font-label">
          Etapa 02 de 04 · Padrões Detectados
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          Há um padrão claro nos seus atendimentos
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Analisamos seus pacientes e identificamos o que se repete na sua entrega de valor.
        </p>
      </div>

      {/* ── 3 GRANDES DESCOBERTAS DO A3 ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Descoberta 01 */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-indigo-500/30 space-y-3 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-400 font-label flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5" /> Descoberta 01
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">O que mais traz pacientes até você</span>
            <h3 className="text-lg font-black text-white mt-1 leading-snug">{insights.topDorRotulo}</h3>
          </div>
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Relevância na amostra:</span>
            <span className="text-xs font-mono font-extrabold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">
              {insights.topDorPct}% da amostra
            </span>
          </div>
        </div>

        {/* Descoberta 02 */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-emerald-500/30 space-y-3 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 font-label flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5" /> Descoberta 02
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">O que eles mais valorizam</span>
            <h3 className="text-lg font-black text-white mt-1 leading-snug">{insights.topPilar}</h3>
          </div>
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Relevância na amostra:</span>
            <span className="text-xs font-mono font-extrabold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
              {insights.topPilarPct}% da amostra
            </span>
          </div>
        </div>

        {/* Descoberta 03 */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-purple-500/30 space-y-3 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-400 font-label flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" /> Descoberta 03
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">O que percebem como diferente</span>
            <h3 className="text-lg font-black text-white mt-1 leading-snug">{insights.topDiferencial}</h3>
          </div>
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Relevância na amostra:</span>
            <span className="text-xs font-mono font-extrabold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">
              {insights.topDiferencialPct}% da amostra
            </span>
          </div>
        </div>
      </div>

      {/* ── SÍNTESE ESTRATÉGICA EDITORIAL ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/40 shadow-2xl space-y-4">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-400 font-label flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-amber-400" /> Síntese Estratégica do A3
        </span>
        <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-body">
          Seus pacientes chegam até você principalmente em busca de <strong className="text-white underline decoration-indigo-500 decoration-2">{insights.topDorRotulo}</strong>.
        </p>
        <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-body">
          Eles valorizam, acima de tudo, a <strong className="text-emerald-400">{insights.topPilar}</strong> que encontram no seu acompanhamento.
        </p>
        <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-body">
          E percebem como grande diferencial a <strong className="text-purple-300">{insights.topDiferencial}</strong> conquistada através do seu trabalho.
        </p>
      </div>

      {/* ── CONFIRMAÇÃO & AÇÕES ── */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 space-y-4 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white">Isso representa bem seu trabalho?</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Se estiver correto, podemos avançar para definir a estrutura do seu Método.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onRevisarAmostra}
            className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Quero revisar a amostra</span>
          </button>

          <button
            type="button"
            onClick={onContinuarParaMetodo}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-xl shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Sim, continuar</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
