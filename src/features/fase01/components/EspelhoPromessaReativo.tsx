// EspelhoPromessaReativo.tsx
// Componente de Espelho da Promessa em tempo real (Master-Detail Live Preview)
// Calcula tanto o Volume de Pessoas (%) quanto o Peso Financeiro da Demanda (%) para garantir posicionamento de alta lucratividade.

import React from 'react';
import { Sparkles, TrendingUp, Award, Target, HelpCircle, DollarSign } from 'lucide-react';
import { PacienteMapeadoEixo01, FATORES_PRIORITARIOS_POR_DOR, ClusterId } from '../fase01.types';

interface EspelhoPromessaReativoProps {
  pacientes: PacienteMapeadoEixo01[];
  metaPacientes?: number;
}

export default function EspelhoPromessaReativo({
  pacientes,
  metaPacientes = 20,
}: EspelhoPromessaReativoProps) {
  const totalMapeados = pacientes.length;
  const percentualProgresso = Math.min(Math.round((totalMapeados / metaPacientes) * 100), 100);

  // 1. Apuração da Dor Predominante por Volume e por Faturamento
  const contagemDores: Record<string, number> = {};
  const faturamentoDores: Record<string, number> = {};
  let faturamentoTotal = 0;

  pacientes.forEach((p) => {
    if (p.dorId) {
      contagemDores[p.dorId] = (contagemDores[p.dorId] || 0) + 1;
      const ticket = p.ticketPagoEstimado && p.ticketPagoEstimado > 0 ? p.ticketPagoEstimado : 0;
      faturamentoDores[p.dorId] = (faturamentoDores[p.dorId] || 0) + ticket;
      faturamentoTotal += ticket;
    }
  });

  let dorPredominanteId: ClusterId | null = null;
  let maxVotosDor = 0;
  Object.entries(contagemDores).forEach(([dorId, qtd]) => {
    if (qtd > maxVotosDor) {
      maxVotosDor = qtd;
      dorPredominanteId = dorId as ClusterId;
    }
  });

  const dorPredominanteRotulo = dorPredominanteId
    ? FATORES_PRIORITARIOS_POR_DOR[dorPredominanteId]?.rotulo ?? dorPredominanteId
    : null;

  const pctDorPredominante = totalMapeados > 0 && maxVotosDor > 0
    ? Math.round((maxVotosDor / totalMapeados) * 100)
    : 0;

  const faturamentoDorPredominante = dorPredominanteId ? faturamentoDores[dorPredominanteId] || 0 : 0;
  const pctFinanceiroDorPredominante = faturamentoTotal > 0
    ? Math.round((faturamentoDorPredominante / faturamentoTotal) * 100)
    : 0;

  // 2. Apuração do Pilar Forte (🥇 Mais Votado)
  const contagemPilarForte: Record<string, number> = {};
  pacientes.forEach((p) => {
    if (p.pilarForte) {
      contagemPilarForte[p.pilarForte] = (contagemPilarForte[p.pilarForte] || 0) + 1;
    }
  });

  let pilarForteMaisVotado: string | null = null;
  let maxVotosPilarForte = 0;
  Object.entries(contagemPilarForte).forEach(([pilar, qtd]) => {
    if (qtd > maxVotosPilarForte) {
      maxVotosPilarForte = qtd;
      pilarForteMaisVotado = pilar;
    }
  });

  const pctPilarForte = totalMapeados > 0 && maxVotosPilarForte > 0
    ? Math.round((maxVotosPilarForte / totalMapeados) * 100)
    : 0;

  // 3. Apuração do Elemento Diferencial (🥈 Mais Votado)
  const contagemDiferencial: Record<string, number> = {};
  pacientes.forEach((p) => {
    if (p.elementoDiferencial) {
      contagemDiferencial[p.elementoDiferencial] = (contagemDiferencial[p.elementoDiferencial] || 0) + 1;
    }
  });

  let diferencialMaisVotado: string | null = null;
  let maxVotosDiferencial = 0;
  Object.entries(contagemDiferencial).forEach(([dif, qtd]) => {
    if (qtd > maxVotosDiferencial) {
      maxVotosDiferencial = qtd;
      diferencialMaisVotado = dif;
    }
  });

  // 4. Detecção de Padrão (Badge Micro-Interativo)
  let padraoDetectado: string | null = null;
  if (totalMapeados >= 3 && dorPredominanteId && pilarForteMaisVotado && pctPilarForte >= 50) {
    padraoDetectado = `Padrão Detectado: ${pctPilarForte}% dos seus pacientes de ${dorPredominanteRotulo?.split('/')[0]} priorizam "${pilarForteMaisVotado}".`;
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md sticky top-6 space-y-6">
      {/* Cabeçalho do Espelho */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              O Seu Diagnóstico Atual
            </h3>
            <p className="text-xs text-slate-400">Volume vs Peso Financeiro da Demanda</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            {totalMapeados} / {metaPacientes} Pacientes
          </span>
        </div>
      </div>

      {/* Barra de Progresso Geral */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-slate-400 font-medium">
          <span>Amostra Mapeada</span>
          <span className="text-slate-200 font-bold">{percentualProgresso}%</span>
        </div>
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 ease-out"
            style={{ width: `${percentualProgresso}%` }}
          />
        </div>
      </div>

      {/* Seção 1: Indicadores de Peso Visual (Volume vs Financeiro) */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            Distribuição dos Atendimentos
          </span>
          {faturamentoTotal > 0 && (
            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <DollarSign className="h-3 w-3" /> R$ {faturamentoTotal.toLocaleString('pt-BR')}
            </span>
          )}
        </h4>

        {totalMapeados === 0 ? (
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 text-center text-xs text-slate-400">
            <HelpCircle className="h-6 w-6 text-slate-500 mx-auto mb-2 opacity-60" />
            Cadastre os primeiros pacientes ao lado para ver a distribuição tomar forma.
          </div>
        ) : (
          <div className="space-y-3.5">
            {/* Bloco Dor Predominante */}
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium truncate max-w-[200px]" title={dorPredominanteRotulo ?? ''}>
                  📌 Dor Principal: <strong className="text-white">{dorPredominanteRotulo?.split('/')[0] ?? 'Não definida'}</strong>
                </span>
                <span className="text-emerald-400 font-bold">{pctDorPredominante}% dos pacientes</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-500"
                  style={{ width: `${pctDorPredominante}%` }}
                />
              </div>

              {/* Peso Financeiro (Se houver ticket) */}
              {faturamentoTotal > 0 && (
                <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/60">
                  <span>Peso Financeiro: <strong>R$ {faturamentoDorPredominante.toLocaleString('pt-BR')}</strong></span>
                  <span className="text-teal-300 font-bold">{pctFinanceiroDorPredominante}% da receita</span>
                </div>
              )}
            </div>

            {/* Bloco Pilar Forte */}
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">
                  ⚡ Pilar Forte: <strong className="text-white">{pilarForteMaisVotado ?? 'Aguardando escolhas...'}</strong>
                </span>
                {pctPilarForte > 0 && <span className="text-emerald-400 font-bold">{pctPilarForte}%</span>}
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-400 transition-all duration-500"
                  style={{ width: `${pctPilarForte}%` }}
                />
              </div>
            </div>

            {/* Bloco Elemento Diferencial */}
            {diferencialMaisVotado && (
              <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">
                    🎯 Diferencial: <strong className="text-white">{diferencialMaisVotado}</strong>
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Seção 2: Badge Micro-Interativo (Padrão Detectado) */}
      {padraoDetectado && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-2.5 text-xs text-emerald-300">
          <Award className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">{padraoDetectado}</p>
        </div>
      )}

      {/* Seção 3: O Texto da Promessa que "Se Completa" */}
      <div className="border-t border-slate-800 pt-4 space-y-3">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5 text-emerald-400" />
          Sua Promessa Ganhando Forma
        </h4>

        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs leading-relaxed text-slate-300 relative overflow-hidden">
          {totalMapeados === 0 ? (
            <p className="italic text-slate-500">
              "Mapeie seus pacientes para ver sua promessa única tomar forma aqui..."
            </p>
          ) : totalMapeados < 3 ? (
            <p>
              "Sua promessa está inclinada para atender quem busca{' '}
              <span className="text-emerald-400 font-semibold underline decoration-emerald-500/40">
                {dorPredominanteRotulo?.split('/')[0] ?? 'sua dor principal'}
              </span>
              . Continue mapeando para consolidar os pilares..."
            </p>
          ) : (
            <p>
              "Você está descobrindo que não vende atendimento genérico. O seu forte é entregar{' '}
              <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                {pilarForteMaisVotado ?? '[Pilar Forte]'}
              </span>{' '}
              para quem busca{' '}
              <span className="text-teal-300 font-semibold">
                {dorPredominanteRotulo?.split('/')[0] ?? '[Dor Principal]'}
              </span>
              {diferencialMaisVotado && (
                <>
                  , com diferencial em{' '}
                  <span className="text-emerald-400 font-semibold">
                    {diferencialMaisVotado}
                  </span>
                </>
              )}
              ."
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
