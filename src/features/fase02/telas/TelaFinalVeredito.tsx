// TelaFinalVeredito.tsx
// Tela Final — Veredito de Captação com os 6 blocos de insight calculados
// a partir de ResumoCaptacao.

import React, { useEffect } from 'react';
import {
  TrendingUp,
  BarChart2,
  Percent,
  Award,
  Users,
  Handshake,
  CheckCircle2,
  Info,
  Trophy,
} from 'lucide-react';
import {
  ResumoCaptacao,
  CanalOrigemId,
  RankingNome,
} from '../fase02.types';
import { getLabelCanalById } from '../data/canaisOrigem';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatPct(n: number): string {
  return `${n.toFixed(1)}%`;
}

// ---------------------------------------------------------------------------
// Subcomponentes de bloco
// ---------------------------------------------------------------------------

function SectionHeader({
  icon: Icon,
  title,
  color = 'emerald',
}: {
  icon: React.ElementType;
  title: string;
  color?: 'emerald' | 'indigo' | 'amber' | 'rose' | 'sky' | 'violet';
}) {
  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
    indigo:  'text-indigo-400  bg-indigo-500/10  border-indigo-500/25',
    amber:   'text-amber-400   bg-amber-500/10   border-amber-500/25',
    rose:    'text-rose-400    bg-rose-500/10    border-rose-500/25',
    sky:     'text-sky-400     bg-sky-500/10     border-sky-500/25',
    violet:  'text-violet-400  bg-violet-500/10  border-violet-500/25',
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

interface TelaFinalVereditoProps {
  resumo: ResumoCaptacao;
  onComplete: () => void;
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export default function TelaFinalVeredito({ resumo, onComplete }: TelaFinalVereditoProps) {
  // Marcar fase como completa ao montar a tela
  useEffect(() => {
    onComplete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8" id="tela_final_veredito_captacao">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
            Eixo 02 · Captação · Veredito Final
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white leading-snug">
          Veredito de Captação
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Análise completa dos seus {resumo.totalContatos} contatos dos últimos 90 dias.
        </p>
      </div>

      {/* ── BLOCO 1: FUNIL ── */}
      <div className="space-y-3" id="bloco_funil">
        <SectionHeader icon={TrendingUp} title="1. Funil de Captação" color="emerald" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              label: 'Total de contatos',
              value: resumo.totalContatos,
              color: 'text-white',
              bg: 'bg-white/5 border-white/10',
            },
            {
              label: 'Convertidos (pacientes)',
              value: resumo.totalConvertidos,
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/8 border-emerald-500/20',
            },
            {
              label: 'Não convertidos (leads)',
              value: resumo.totalNaoConvertidos,
              color: 'text-rose-400',
              bg: 'bg-rose-500/8 border-rose-500/20',
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`flex flex-col items-center justify-center px-4 py-5 rounded-xl border ${item.bg}`}
            >
              <span className={`text-3xl font-black ${item.color}`}>{item.value}</span>
              <span className="text-xs text-slate-400 mt-1 text-center">{item.label}</span>
            </div>
          ))}
        </div>
        <div className="bg-white/4 border border-white/8 rounded-xl px-5 py-4 flex items-center justify-between">
          <span className="text-sm text-slate-400">Taxa de conversão geral</span>
          <span className="text-xl font-black text-emerald-400">
            {formatPct(resumo.taxaConversaoGeral)}
          </span>
        </div>
      </div>

      {/* ── BLOCO 2: ORIGEM (RANKING POR VOLUME) ── */}
      <div className="space-y-3" id="bloco_origem">
        <SectionHeader icon={BarChart2} title="2. Ranking de Origem por Volume" color="indigo" />
        <div className="space-y-2">
          {resumo.rankingCanaisPorVolume.map((r, idx) => {
            const maxVol = resumo.rankingCanaisPorVolume[0]?.totalContatos || 1;
            const pct = maxVol > 0 ? (r.totalContatos / maxVol) * 100 : 0;
            return (
              <div
                key={r.canalOrigem}
                id={`rank_vol_${r.canalOrigem}`}
                className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-bold text-slate-500 tabular-nums w-5 shrink-0">
                      #{idx + 1}
                    </span>
                    <span className="text-xs text-slate-300 truncate">
                      {getLabelCanalById(r.canalOrigem)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-slate-400">
                      <span className="text-emerald-400 font-bold">{r.totalConvertidos}</span>
                      {' / '}
                      <span className="text-white font-bold">{r.totalContatos}</span>
                    </span>
                  </div>
                </div>
                {/* Barra de progresso */}
                <div className="h-1.5 w-full bg-white/8 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-slate-600 px-1">
          Formato: convertidos / total. Barra proporcional ao maior volume.
        </p>
      </div>

      {/* ── BLOCO 3: TAXA DE CONVERSÃO (REGRA DOS 10 LEADS) ── */}
      <div className="space-y-3" id="bloco_taxa_conversao">
        <SectionHeader icon={Percent} title="3. Taxa de Conversão por Canal (Regra dos 10 Leads)" color="sky" />
        <div className="space-y-2">
          {resumo.taxaConversaoPorCanal.map((t) => (
            <div
              key={t.canalOrigem}
              id={`taxa_${t.canalOrigem}`}
              className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 flex items-center justify-between gap-4"
            >
              <span className="text-xs text-slate-300 truncate min-w-0">
                {getLabelCanalById(t.canalOrigem)}
              </span>
              <div className="shrink-0 text-right">
                {t.taxaConversao !== null ? (
                  <span className="text-sm font-black text-sky-400">
                    {formatPct(t.taxaConversao)}
                  </span>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5 text-slate-500" />
                    <span className="text-[11px] text-slate-500 font-medium">
                      Dado insuficiente para calcular taxa (menos de 10 contatos neste canal)
                    </span>
                  </div>
                )}
                <p className="text-[10px] text-slate-600 mt-0.5">{t.totalContatos} contato{t.totalContatos !== 1 ? 's' : ''}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BLOCO 4: CANAIS CAMPEÕES ── */}
      <div className="space-y-3" id="bloco_canais_campeoes">
        <SectionHeader icon={Trophy} title="4. Canais Campeões em Conversão" color="amber" />
        {resumo.canaisCampeoes.length === 0 ? (
          <div className="bg-white/4 border border-white/8 rounded-xl px-4 py-6 text-center">
            <p className="text-sm text-slate-500">
              Nenhum canal converteu pacientes ainda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {resumo.canaisCampeoes.map((canalId, idx) => {
              const dadosCanal = resumo.rankingCanaisPorVolume.find(
                (r) => r.canalOrigem === canalId
              );
              const medalhas = ['🥇', '🥈', '🥉'];
              return (
                <div
                  key={canalId}
                  id={`campiao_${canalId}`}
                  className="bg-amber-500/8 border border-amber-500/20 rounded-xl px-4 py-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl">{medalhas[idx] ?? '🏅'}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">
                        {getLabelCanalById(canalId)}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {dadosCanal?.totalConvertidos ?? 0} conversões de{' '}
                        {dadosCanal?.totalContatos ?? 0} contatos
                      </p>
                    </div>
                  </div>
                  <span className="text-xl font-black text-amber-400 shrink-0">
                    {dadosCanal?.totalConvertidos ?? 0}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── BLOCO 5: TOP INDICADORES ── */}
      <div className="space-y-3" id="bloco_top_indicadores">
        <SectionHeader icon={Users} title="5. Top Indicadores (Boca a Boca)" color="violet" />
        {resumo.topIndicadores.length === 0 ? (
          <div className="bg-white/4 border border-white/8 rounded-xl px-4 py-6 text-center">
            <p className="text-sm text-slate-500">
              Nenhum indicador identificado por nome neste período.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {resumo.topIndicadores.map((r: RankingNome, idx) => (
              <div
                key={r.nome}
                id={`indicador_${idx}`}
                className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[10px] font-bold text-slate-500 tabular-nums w-5 shrink-0">
                    #{idx + 1}
                  </span>
                  <span className="text-sm font-semibold text-white truncate">{r.nome}</span>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-violet-400">{r.totalContatos} indicado{r.totalContatos !== 1 ? 's' : ''}</p>
                  <p className="text-[10px] text-slate-500">{r.totalConvertidos} convertido{r.totalConvertidos !== 1 ? 's' : ''}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── BLOCO 6: TOP PARCEIROS ── */}
      <div className="space-y-3" id="bloco_top_parceiros">
        <SectionHeader icon={Handshake} title="6. Top Parceiros (Parcerias Estratégicas)" color="rose" />
        {resumo.topParceiros.length === 0 ? (
          <div className="bg-white/4 border border-white/8 rounded-xl px-4 py-6 text-center">
            <p className="text-sm text-slate-500">
              Nenhum parceiro identificado por nome neste período.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {resumo.topParceiros.map((r: RankingNome, idx) => (
              <div
                key={r.nome}
                id={`parceiro_${idx}`}
                className="bg-white/4 border border-white/8 rounded-xl px-4 py-3 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[10px] font-bold text-slate-500 tabular-nums w-5 shrink-0">
                    #{idx + 1}
                  </span>
                  <span className="text-sm font-semibold text-white truncate">{r.nome}</span>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-rose-400">{r.totalContatos} indicado{r.totalContatos !== 1 ? 's' : ''}</p>
                  <p className="text-[10px] text-slate-500">{r.totalConvertidos} convertido{r.totalConvertidos !== 1 ? 's' : ''}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rodapé informativo */}
      <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-xl px-5 py-4 flex items-start gap-3">
        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-bold text-emerald-300">Fase 02 — Captação concluída!</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Os dados de canais campeões e taxas de conversão serão utilizados pelos eixos
            futuros (Agenda, Financeiro e Metas) para montar sua modelagem estratégica completa.
          </p>
        </div>
      </div>
    </div>
  );
}
