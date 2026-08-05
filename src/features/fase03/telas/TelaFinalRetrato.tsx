// TelaFinalRetrato.tsx
// Tela Final — O Retrato Comercial.
// Apresentação visual e factual do ResumoComercial.
// Sem estimativas monetárias. 4 blocos conforme especificação.
// Especificação: seção 4, "TELA FINAL".

import React, { useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  MessageSquareX,
  ClipboardList,
  RefreshCw,
  Trophy,
  RotateCcw,
} from 'lucide-react';
import type { Fase03State, ResumoComercial } from '../fase03.types';
import {
  getLabelMomentosPerda,
  getLabelJustificativa,
  getLabelQuantidadeTentativas,
  getLabelIntervaloPrimeiroRecontato,
} from '../data/listas';

// ---------------------------------------------------------------------------
// Subcomponente: cabeçalho de bloco
// ---------------------------------------------------------------------------

type ColorKey = 'emerald' | 'rose' | 'amber' | 'violet' | 'sky' | 'indigo';

function SectionHeader({
  icon: Icon,
  title,
  color = 'violet',
}: {
  icon: React.ElementType;
  title: string;
  color?: ColorKey;
}) {
  const colorMap: Record<ColorKey, string> = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
    rose:    'text-rose-400    bg-rose-500/10    border-rose-500/25',
    amber:   'text-amber-400   bg-amber-500/10   border-amber-500/25',
    violet:  'text-violet-400  bg-violet-500/10  border-violet-500/25',
    sky:     'text-sky-400     bg-sky-500/10     border-sky-500/25',
    indigo:  'text-indigo-400  bg-indigo-500/10  border-indigo-500/25',
  };
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${colorMap[color]}`}>
      <Icon className="h-4 w-4 shrink-0" />
      <span className="text-sm font-bold">{title}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface TelaFinalRetratoProps {
  state: Fase03State;
  resumo: ResumoComercial;
  onComplete: () => void;
  onRevisar: () => void; // botão "Revisar Vendas" — entra em modo de edição
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export default function TelaFinalRetrato({ state, resumo, onComplete, onRevisar }: TelaFinalRetratoProps) {
  // Marca fase como completa ao montar
  useEffect(() => {
    onComplete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    semNaoConvertidos,
    totalNaoConvertidosRef,
    quantidadeTentativas,
    intervaloPrimeiroRecontato,
  } = state;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8" id="tela_final_retrato_comercial">
      {/* ── CABEÇALHO ── */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
          <CheckCircle2 className="h-3.5 w-3.5 text-violet-400" />
          <span className="text-[10px] font-bold tracking-widest text-violet-400 uppercase">
            Eixo 03 · Vendas · Retrato Comercial
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white leading-snug">O Retrato Comercial</h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Análise do seu processo de vendas e atendimento com base nas respostas desta etapa.
        </p>
      </div>

      {/* ── BLOCO 1 — Ponto Crítico de Perda ── */}
      <div className="space-y-3" id="bloco1_ponto_critico">
        <SectionHeader
          icon={semNaoConvertidos ? Trophy : AlertTriangle}
          title="1. Ponto Crítico de Perda"
          color={semNaoConvertidos ? 'emerald' : 'rose'}
        />
        <div
          className={`rounded-xl px-5 py-4 border ${
            semNaoConvertidos
              ? 'bg-emerald-500/8 border-emerald-500/20'
              : 'bg-white/4 border-white/10'
          }`}
        >
          {semNaoConvertidos ? (
            <p className="text-sm text-slate-200 leading-relaxed">
              Nos últimos 90 dias, você não teve nenhuma pessoa que procurou e não fechou.{' '}
              <span className="text-emerald-300 font-semibold">
                Seu atendimento está convertendo tudo que chega.
              </span>
            </p>
          ) : (
            <p className="text-sm text-slate-200 leading-relaxed">
              Das{' '}
              <span className="text-white font-bold">{totalNaoConvertidosRef}</span>{' '}
              pessoas que não fecharam nos últimos 90 dias, o seu maior gargalo concentrou-se na
              etapa de{' '}
              <span className="text-rose-300 font-bold">
                {resumo.gargaloCampeao ? getLabelMomentosPerda(resumo.gargaloCampeao) : '—'}
              </span>
              , representando{' '}
              <span className="text-white font-bold">{resumo.nGargalo}</span>{' '}
              {resumo.nGargalo === 1 ? 'contato perdido' : 'contatos perdidos'} ali.
            </p>
          )}
        </div>
      </div>

      {/* ── BLOCO 2 — Barreira Principal (omitido se semNaoConvertidos) ── */}
      {!semNaoConvertidos && (
        <div className="space-y-3" id="bloco2_barreira_principal">
          <SectionHeader
            icon={MessageSquareX}
            title="2. Barreira Principal"
            color="amber"
          />
          <div className="bg-white/4 border border-white/10 rounded-xl px-5 py-4">
            <p className="text-sm text-slate-200 leading-relaxed">
              A principal justificativa enfrentada no seu atendimento foi{' '}
              <span className="text-amber-300 font-bold">
                {resumo.objecaoCampea ? getLabelJustificativa(resumo.objecaoCampea) : '—'}
              </span>
              , relatada em{' '}
              <span className="text-white font-bold">{resumo.nObjecao}</span>{' '}
              {resumo.nObjecao === 1 ? 'das conversas.' : 'das conversas.'}
            </p>
          </div>
        </div>
      )}

      {/* ── BLOCO 3 — Maturidade do Atendimento (sempre exibido) ── */}
      <div className="space-y-3" id="bloco3_maturidade_atendimento">
        <SectionHeader icon={ClipboardList} title="3. Maturidade do Atendimento" color="indigo" />
        <div className="bg-white/4 border border-white/10 rounded-xl px-5 py-4 space-y-4">
          <p className="text-sm text-slate-200 leading-relaxed">
            O seu processo de atendimento atual cobre{' '}
            <span className="text-indigo-300 font-bold text-lg">{resumo.nEtapasMarcadas}</span>{' '}
            de{' '}
            <span className="text-white font-bold">8</span>{' '}
            etapas recomendadas de conversão.
          </p>
          {/* Barra visual de progresso */}
          <div className="space-y-1.5">
            <div className="h-2 w-full bg-white/8 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                style={{ width: `${(resumo.nEtapasMarcadas / 8) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-600">
              {resumo.nEtapasMarcadas}/8 etapas ({Math.round((resumo.nEtapasMarcadas / 8) * 100)}%)
            </p>
          </div>
        </div>
      </div>

      {/* ── BLOCO 4 — Estratégia de Acompanhamento (sempre exibido) ── */}
      <div className="space-y-3" id="bloco4_estrategia_acompanhamento">
        <SectionHeader
          icon={RefreshCw}
          title="4. Estratégia de Acompanhamento"
          color={resumo.possuiFollowUpAtivo ? 'violet' : 'sky'}
        />
        <div
          className={`rounded-xl px-5 py-4 border ${
            resumo.possuiFollowUpAtivo
              ? 'bg-violet-500/8 border-violet-500/20'
              : 'bg-white/4 border-white/10'
          }`}
        >
          {resumo.possuiFollowUpAtivo ? (
            <p className="text-sm text-slate-200 leading-relaxed">
              Você possui um fluxo ativo com até{' '}
              <span className="text-violet-300 font-bold">
                {quantidadeTentativas ? getLabelQuantidadeTentativas(quantidadeTentativas) : '—'}
              </span>{' '}
              de recontato, iniciando{' '}
              <span className="text-violet-300 font-bold">
                {intervaloPrimeiroRecontato
                  ? getLabelIntervaloPrimeiroRecontato(intervaloPrimeiroRecontato)
                  : '—'}
              </span>{' '}
              após o vácuo.
            </p>
          ) : (
            <p className="text-sm text-slate-200 leading-relaxed">
              Atualmente, você não realiza mensagens de recontato ativo, deixando a iniciativa do
              retorno{' '}
              <span className="text-sky-300 font-semibold">100% com o cliente.</span>
            </p>
          )}
        </div>
      </div>

      {/* ── Rodapé ── */}
      <div className="bg-violet-500/8 border border-violet-500/20 rounded-xl px-5 py-4 flex items-start gap-3">
        <CheckCircle2 className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-bold text-violet-300">Fase 03 — Vendas concluída!</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Os dados do seu processo comercial (gargalo, objeções, maturidade do atendimento e
            estratégia de acompanhamento) serão utilizados pelos eixos futuros para compor sua
            modelagem estratégica completa.
          </p>
        </div>
      </div>

      {/* Revisar */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          id="btn_tela_final_revisar_fase03"
          onClick={onRevisar}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 hover:text-white transition-all"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Revisar Vendas
        </button>
      </div>
    </div>
  );
}
