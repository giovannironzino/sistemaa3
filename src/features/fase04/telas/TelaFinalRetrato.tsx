// TelaFinalRetrato.tsx
// Tela Final — O Retrato de Serviços & Oferta.
// Especificação: seção B.4, "TELA FINAL".

import React, { useEffect } from 'react';
import { CheckCircle2, LayoutGrid, CreditCard, RefreshCw } from 'lucide-react';
import type { ResumoServicos } from '../fase04.types';
import { getLabelFormatoComercial, getLabelFormaPagamento } from '../data/listasFase04';
import { formatBRL } from '../../../components/CurrencyInput';

type ColorKey = 'cyan' | 'indigo' | 'violet' | 'sky';

function SectionHeader({
  icon: Icon,
  title,
  color = 'cyan',
}: {
  icon: React.ElementType;
  title: string;
  color?: ColorKey;
}) {
  const colorMap: Record<ColorKey, string> = {
    cyan:   'text-cyan-400   bg-cyan-500/10   border-cyan-500/25',
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/25',
    violet: 'text-violet-400 bg-violet-500/10 border-violet-500/25',
    sky:    'text-sky-400    bg-sky-500/10    border-sky-500/25',
  };
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${colorMap[color]}`}>
      <Icon className="h-4 w-4 shrink-0" />
      <span className="text-sm font-bold">{title}</span>
    </div>
  );
}

interface TelaFinalRetratoProps {
  resumo: ResumoServicos;
  onComplete: () => void;
}

export default function TelaFinalRetrato({ resumo, onComplete }: TelaFinalRetratoProps) {
  useEffect(() => {
    onComplete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formasLabels = resumo.formasPagamentoAceitasUniao
    .map((id) => getLabelFormaPagamento(id))
    .join(', ');

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8" id="tela_final_retrato_servicos">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
          <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
          <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">
            Eixo 04 · Serviços · Retrato de Serviços & Oferta
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white leading-snug">O Retrato de Serviços & Oferta</h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Análise da sua arquitetura de oferta com base nos serviços cadastrados nesta etapa.
        </p>
      </div>

      {/* BLOCO 1 — Arquitetura do Portfólio */}
      <div className="space-y-3" id="bloco1_arquitetura_portfolio">
        <SectionHeader icon={LayoutGrid} title="1. Arquitetura do Portfólio" color="cyan" />
        <div className="bg-white/4 border border-white/10 rounded-xl px-5 py-4">
          <p className="text-sm text-slate-200 leading-relaxed">
            Você possui{' '}
            <span className="text-white font-bold">{resumo.totalServicos}</span>{' '}
            {resumo.totalServicos === 1 ? 'serviço' : 'serviços'} em sua esteira. O seu carro-chefe
            é o <span className="text-cyan-300 font-bold">{resumo.carroChefeNome}</span> (
            {formatBRL(resumo.carroChefePreco)}), com{' '}
            <span className="text-white font-bold">{resumo.totalPacientesAtivos}</span> pacientes
            ativos vigentes.
          </p>
        </div>
      </div>

      {/* BLOCO 2 — Modelo de Vendas */}
      <div className="space-y-3" id="bloco2_modelo_vendas">
        <SectionHeader icon={CreditCard} title="2. Modelo de Vendas" color="indigo" />
        <div className="bg-white/4 border border-white/10 rounded-xl px-5 py-4">
          <p className="text-sm text-slate-200 leading-relaxed">
            Sua oferta opera no formato{' '}
            <span className="text-indigo-300 font-bold">
              {getLabelFormatoComercial(resumo.formatoDominante)}
            </span>
            , com cobrança realizada via{' '}
            <span className="text-white font-semibold">{formasLabels}</span>.
          </p>
        </div>
      </div>

      {/* BLOCO 3 — Mecanismo de Continuidade (LTV) */}
      <div className="space-y-3" id="bloco3_mecanismo_continuidade">
        <SectionHeader
          icon={RefreshCw}
          title="3. Mecanismo de Continuidade (LTV)"
          color={resumo.possuiMecanismoDeRetencao ? 'violet' : 'sky'}
        />
        <div
          className={`rounded-xl px-5 py-4 border ${
            resumo.possuiMecanismoDeRetencao
              ? 'bg-violet-500/8 border-violet-500/20'
              : 'bg-white/4 border-white/10'
          }`}
        >
          {resumo.possuiMecanismoDeRetencao ? (
            <p className="text-sm text-slate-200 leading-relaxed">
              Você possui um{' '}
              <span className="text-violet-300 font-semibold">
                mecanismo ativo de retenção
              </span>{' '}
              ao final do contrato, aumentando o valor do tempo de vida (LTV) do paciente.
            </p>
          ) : (
            <p className="text-sm text-slate-200 leading-relaxed">
              Atualmente, seu negócio opera no modelo{' '}
              <span className="text-sky-300 font-semibold">"venda e encerra"</span>, exigindo que
              novos clientes sejam conquistados do zero todos os meses.
            </p>
          )}
        </div>
        <div className="bg-white/4 border border-white/10 rounded-xl px-5 py-4 flex items-center justify-between">
          <span className="text-sm text-slate-400">Taxa de renovação atual</span>
          <span className="text-xl font-black text-cyan-400" id="valor_taxa_renovacao_atual_resumo">
            {resumo.taxaRenovacaoAtual}%
          </span>
        </div>
      </div>

      {/* Rodapé */}
      <div className="bg-cyan-500/8 border border-cyan-500/20 rounded-xl px-5 py-4 flex items-start gap-3">
        <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-bold text-cyan-300">Fase 04 — Serviços concluída!</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Os dados da sua arquitetura de oferta (carro-chefe, ticket médio, vendas mensais e
            mecanismo de continuidade) serão utilizados pelos eixos futuros (Agenda, Financeiro e
            Metas) para compor sua modelagem estratégica completa.
          </p>
        </div>
      </div>
    </div>
  );
}
