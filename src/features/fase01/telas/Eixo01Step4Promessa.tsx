// Eixo01Step4Promessa.tsx
// Tela 04 do Eixo 01 — Sua Promessa (Revelação Final Editorial do Posicionamento A3).

import React from 'react';
import { Sparkles, ArrowRight, RotateCcw, Award, Target, ShieldCheck, Zap } from 'lucide-react';
import { MetodoId, PacienteMapeadoEixo01 } from '../fase01.types';
import { derivarInsightsEixo01 } from '../lib/eixo01Derivations';

interface Eixo01Step4PromessaProps {
  pacientes: PacienteMapeadoEixo01[];
  metodoSelecionado: MetodoId;
  onConcluirEixo: () => void;
  onRevisarEixo: () => void;
}

const ROTULOS_METODO: Record<MetodoId, string> = {
  rotina_real: 'um plano adaptado à rotina real',
  acompanhamento_proximo: 'acompanhamento próximo e contínuo',
  foco_comportamento: 'mudança comportamental de hábitos',
  prescricao_tecnica: 'prescrição técnica personalizada',
  escuta_sem_julgamento: 'escuta humana sem julgamentos',
};

export default function Eixo01Step4Promessa({
  pacientes,
  metodoSelecionado,
  onConcluirEixo,
  onRevisarEixo,
}: Eixo01Step4PromessaProps) {
  const insights = derivarInsightsEixo01(pacientes);
  const metodoRotulo = ROTULOS_METODO[metodoSelecionado] || 'acompanhamento personalizado';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fadeIn" id="step4_sua_promessa">
      {/* ── HERO SECTION ── */}
      <div className="text-center sm:text-left space-y-2 border-b border-white/10 pb-6">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-400 font-label">
          Etapa 04 de 04 · Sua Promessa
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          Sua Promessa de Mercado
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Este é o posicionamento estratégico que guia sua comunicação, precificação e entrega de valor.
        </p>
      </div>

      {/* ── CARTÃO REVELAÇÃO DA PROMESSA (DESTAQUE EDITORIAL) ── */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-indigo-950/90 via-purple-950/80 to-slate-950 border border-purple-500/50 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-purple-300 font-label flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-amber-400" /> Posicionamento A3 de Mercado
          </span>
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Validação Concluída
          </span>
        </div>

        <blockquote className="text-lg sm:text-2xl font-black text-white leading-relaxed font-body">
          “Eu ajudo pessoas que buscam{' '}
          <strong className="text-indigo-300 underline decoration-indigo-500 decoration-2">
            {insights.topDorRotulo}
          </strong>{' '}
          a conquistarem{' '}
          <strong className="text-emerald-400">
            {insights.topPilar}
          </strong>
          , através de um acompanhamento focado em{' '}
          <strong className="text-purple-300">
            {insights.topDiferencial}
          </strong>
          , sustentado por{' '}
          <strong className="text-amber-300 font-extrabold">
            {metodoRotulo}
          </strong>.”
        </blockquote>
      </div>

      {/* ── 4 EVIDÊNCIAS DA PROMESSA (ORIGEM DOS DADOS) ── */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 font-label">
          Evidências que Sustentam Sua Promessa
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Card 1: Dor */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-indigo-500/30 space-y-1">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
              <Award className="h-3 w-3" /> Dor Dominada
            </span>
            <div className="text-xs font-extrabold text-white">{insights.topDorRotulo}</div>
          </div>

          {/* Card 2: Valor */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30 space-y-1">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <Target className="h-3 w-3" /> Valor Percebido
            </span>
            <div className="text-xs font-extrabold text-white">{insights.topPilar}</div>
          </div>

          {/* Card 3: Diferencial */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/30 space-y-1">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
              <Zap className="h-3 w-3" /> Diferencial
            </span>
            <div className="text-xs font-extrabold text-white">{insights.topDiferencial}</div>
          </div>

          {/* Card 4: Base do Método */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 space-y-1">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Base do Método
            </span>
            <div className="text-xs font-extrabold text-white capitalize">{metodoRotulo}</div>
          </div>
        </div>
      </div>

      {/* ── AÇÕES FINAIS DE CONTINUIDADE DA JORNADA ── */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={onRevisarEixo}
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Revisar Eixo 01</span>
        </button>

        <button
          type="button"
          onClick={onConcluirEixo}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-xl shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Continuar para Eixo 02 (Captação)</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
