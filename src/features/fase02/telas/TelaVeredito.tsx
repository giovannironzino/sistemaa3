// TelaVeredito.tsx
// Veredito final da Captação: resumo geral + ranking de canais por volume + diversidade de dados e datas dinâmicas.

import React, { useEffect, useMemo } from 'react';
import { Info, Trophy, Users, Handshake, RefreshCw, Calendar, Sparkles, CheckCircle2 } from 'lucide-react';
import { ResumoCaptacao, RankingNome } from '../fase02.types';
import { getLabelCanalById } from '../data/canaisOrigem';
import { C, gradientAccent, gradientBar } from '../ui/tokens';
import { obterDatasA3 } from '../../../lib/dateUtils';

interface TelaVereditoProps {
  resumo: ResumoCaptacao | null;
  onComplete: () => void;
  onPreencherEixo: () => void;
  onAvancarCrm: () => void;
  onRevisar: () => void;
}

function formatPct(n: number): string {
  return `${n.toFixed(1)}%`;
}

export default function TelaVeredito({ resumo, onComplete, onPreencherEixo, onAvancarCrm, onRevisar }: TelaVereditoProps) {
  const datas = useMemo(() => obterDatasA3(null), []);

  // PERFIL SEM HISTÓRICO / DIVERSIDADE DE DADOS: Projeção Orientada A3
  if (!resumo || resumo.totalContatos === 0) {
    return (
      <div className="space-y-6">
        <div style={{ display: 'inline-flex', padding: '5px 12px', borderRadius: 20, background: 'rgba(56,189,248,.12)', color: '#38bdf8', fontSize: 11, fontWeight: 700, letterSpacing: '.04em' }}>
          EIXO 02 · CAPTAÇÃO · PROJEÇÃO ORIENTADA A3 (DIVERSIDADE DE DADOS)
        </div>
        
        <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.35 }} className="text-white">
          Captação Orientada para o Perfil sem Histórico Prévio ({datas.intervaloTrimestreRecente})
        </div>

        <div className="p-5 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl space-y-3 text-xs">
          <div className="flex items-center gap-2 text-indigo-300 font-bold">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>Acolhimento A3: Você informou que ainda não possui histórico de registros</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Não ter dados passados é 100% normal para quem está começando ou reorganizando o consultório. O Sistema A3 formulou um <strong>Veredito por Projeção de Mercado</strong> para guiar suas metas de captação entre <strong className="text-emerald-400">{datas.intervaloProximos90Dias}</strong>:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Meta de Entrada de Leads (Estimada)</span>
            <p className="text-2xl font-extrabold text-emerald-400">12 a 20 interessados / mês</p>
            <p className="text-[11px] text-slate-400">Recomendado para cobrir a DRE do Eixo 08</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Taxa de Conversão Referência (Setor)</span>
            <p className="text-2xl font-extrabold text-teal-300">30% a 45% de fechamento</p>
            <p className="text-[11px] text-slate-400">Média de mercado em consultas particulares</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
          <div onClick={onAvancarCrm} style={{ background: gradientAccent, borderRadius: 12, padding: '16px 22px', fontSize: 14, fontWeight: 700, cursor: 'pointer', textAlign: 'center', color: '#fff' }}>
            Avançar para Vendas &amp; CRM (Eixo 03) →
          </div>
          <div onClick={onPreencherEixo} style={{ border: `1px solid ${C.inputBorder}`, borderRadius: 12, padding: '15px 22px', fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'center', color: C.textSecondary }}>
            Cadastrar Histórico Manual
          </div>
        </div>
      </div>
    );
  }

  const maxVol = resumo.rankingCanaisPorVolume[0]?.totalContatos || 1;
  const canaisComVolume = resumo.rankingCanaisPorVolume.filter((r) => r.totalContatos > 0);

  return (
    <div>
      <div style={{ display: 'inline-flex', padding: '5px 12px', borderRadius: 20, background: C.successBg, color: C.successSoft, fontSize: 11, fontWeight: 700, letterSpacing: '.04em', marginBottom: 16 }}>
        EIXO 02 · CAPTAÇÃO · VEREDITO FINAL ({datas.intervaloTrimestreRecente})
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 22 }}>De onde vem o dinheiro de fato? ({datas.intervaloTrimestreRecente})</div>

      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.04em', color: '#7d84f0', marginBottom: 10 }}>1. RESUMO GERAL</div>
      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 14, marginBottom: 28 }}>
        <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{resumo.totalContatos}</div>
          <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 4 }}>Contatos registrados entre {datas.intervaloTrimestreRecente}</div>
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{formatPct(resumo.taxaConversaoGeral)}</div>
          <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 4 }}>Taxa de fechamento (viraram pacientes)</div>
        </div>
      </div>

      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.04em', color: '#7d84f0', marginBottom: 10 }}>2. RANKING DE ORIGEM POR VOLUME</div>
      <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 12, padding: '22px 22px 8px', marginBottom: 28 }}>
        {canaisComVolume.map((r) => (
          <div key={r.canalOrigem} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyBetween: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span style={{ fontWeight: 600 }}>{getLabelCanalById(r.canalOrigem)}</span>
              <span style={{ color: C.textSecondary }}>{r.totalContatos}</span>
            </div>
            <div style={{ height: 8, background: C.track, borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.round((r.totalContatos / maxVol) * 100)}%`, background: gradientBar, borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.04em', color: '#7d84f0', marginBottom: 10 }}>3. TAXA DE CONVERSÃO POR CANAL DE ORIGEM</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
        {resumo.taxaConversaoPorCanal.map((t) => {
          const dadosCanal = resumo.rankingCanaisPorVolume.find((r) => r.canalOrigem === t.canalOrigem);
          const totalConv = dadosCanal?.totalConvertidos ?? 0;
          const totalCont = dadosCanal?.totalContatos ?? 0;
          const pctReal = totalCont > 0 ? (totalConv / totalCont) * 100 : 0;

          return (
            <div key={t.canalOrigem} style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 12, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, color: '#c3c7d4' }}>{getLabelCanalById(t.canalOrigem)}</span>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 14, fontWeight: 800, color: '#38bdf8' }}>{formatPct(pctReal)}</span>
                <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  ({totalConv}/{totalCont} fechados)
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.04em', color: '#7d84f0', marginBottom: 10 }}>4. CANAIS CAMPEÕES EM CONVERSÃO</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
        {resumo.canaisCampeoes.length === 0 ? (
          <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 12, padding: 20, textAlign: 'center', fontSize: 13, color: C.textMuted2 }}>
            Nenhum canal converteu pacientes ainda.
          </div>
        ) : (
          resumo.canaisCampeoes.map((canalId, idx) => {
            const dadosCanal = resumo.rankingCanaisPorVolume.find((r) => r.canalOrigem === canalId);
            const medalhas = ['🥇', '🥈', '🥉'];
            return (
              <div key={canalId} style={{ background: C.alertBg, border: `1px solid ${C.alertBorder}`, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{medalhas[idx] ?? <Trophy size={16} />}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{getLabelCanalById(canalId)}</div>
                    <div style={{ fontSize: 11, color: C.textMuted2, marginTop: 2 }}>
                      {dadosCanal?.totalConvertidos ?? 0} conversões de {dadosCanal?.totalContatos ?? 0} contatos
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: 18, fontWeight: 800, color: C.alert }}>{dadosCanal?.totalConvertidos ?? 0}</span>
              </div>
            );
          })
        )}
      </div>

      {[
        { titulo: '5. TOP INDICADORES (BOCA A BOCA)', dados: resumo.topIndicadores, icon: Users, vazio: 'Nenhum indicador identificado por nome neste período.' },
        { titulo: '6. TOP PARCEIROS (PARCERIAS ESTRATÉGICAS)', dados: resumo.topParceiros, icon: Handshake, vazio: 'Nenhum parceiro identificado por nome neste período.' },
      ].map((bloco) => (
        <div key={bloco.titulo} style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.04em', color: '#7d84f0', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <bloco.icon size={13} /> {bloco.titulo}
          </div>
          {bloco.dados.length === 0 ? (
            <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 12, padding: 20, textAlign: 'center', fontSize: 13, color: C.textMuted2 }}>
              {bloco.vazio}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {bloco.dados.map((r: RankingNome, idx: number) => (
                <div key={r.nome} style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 12, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: C.textMuted }}>#{idx + 1}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{r.nome}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.accentText }}>{r.totalContatos} indicado{r.totalContatos !== 1 ? 's' : ''}</div>
                    <div style={{ fontSize: 10, color: C.textMuted }}>{r.totalConvertidos} convertido{r.totalConvertidos !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
        <div onClick={onAvancarCrm} style={{ background: gradientAccent, borderRadius: 12, padding: '16px 18px', fontSize: 14, fontWeight: 700, cursor: 'pointer', textAlign: 'center', color: '#fff', maxWidth: 280 }}>
          Avançar para Vendas &amp; CRM (Eixo 03) →
        </div>
        <div
          onClick={onRevisar}
          id="btn_tela_final_revisar_fase02"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', borderRadius: 12, border: `1px solid ${C.inputBorder}`, color: C.textSecondary }}
        >
          <RefreshCw size={14} /> Revisar Captação
        </div>
      </div>
    </div>
  );
}

