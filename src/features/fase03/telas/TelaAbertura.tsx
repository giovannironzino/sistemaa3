// TelaAbertura.tsx
// Tela de Abertura (Transição) — Fase 03 · Vendas.
// Lê totalNaoConvertidosRef e exibe o texto correto (normal ou semNaoConvertidos).
// Especificação: seção 4, "TELA DE ABERTURA".

import React from 'react';
import { ArrowRight, ShieldAlert } from 'lucide-react';

interface TelaAberturaProps {
  totalNaoConvertidosRef: number;
  semNaoConvertidos: boolean;
  onAvancar: () => void;
  /** true quando Fase 02 não foi concluída — exibe mensagem de bloqueio */
  bloqueado: boolean;
}

export default function TelaAbertura({
  totalNaoConvertidosRef,
  semNaoConvertidos,
  onAvancar,
  bloqueado,
}: TelaAberturaProps) {
  // Caso de bloqueio: Fase 02 não concluída (regra 0.7)
  if (bloqueado) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-8" id="tela_abertura_fase03_bloqueado">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20">
            <span className="text-[10px] font-bold tracking-widest text-rose-400 uppercase">
              Eixo 03 · Vendas · Bloqueado
            </span>
          </div>
          <h1 className="text-xl font-bold text-white leading-snug">
            Fase bloqueada
          </h1>
        </div>

        <div className="bg-rose-500/10 border border-rose-500/25 rounded-xl px-5 py-5 flex items-start gap-4">
          <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-rose-300">
              Termine a Fase 02 (Captação) antes de continuar.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              A Fase 03 depende dos dados de captação calculados na etapa anterior. Conclua a Fase 02 para liberar o acesso.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Texto varia conforme semNaoConvertidos
  const textoIntroducao = semNaoConvertidos
    ? 'Na etapa anterior, todas as pessoas que te procuraram fecharam consulta com você. Isso é ótimo! Agora, vamos entender como funciona o seu atendimento hoje, pra manter esse resultado.'
    : `Na etapa anterior, vimos que ${totalNaoConvertidosRef} pessoas te procuraram, mas não fecharam consulta com você. Agora, vamos mapear exatamente em qual momento essas conversas pararam e como funciona o seu atendimento hoje.`;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8" id="tela_abertura_fase03">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
          <span className="text-[10px] font-bold tracking-widest text-violet-400 uppercase">
            Eixo 03 · Vendas · Abertura
          </span>
        </div>
        <h1 className="text-xl font-bold text-white leading-snug">
          {semNaoConvertidos
            ? 'Seu atendimento está convertendo tudo!'
            : 'Vamos mapear seu processo comercial'}
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          {textoIntroducao}
        </p>
      </div>

      {/* Indicador visual do resultado da Fase 02 */}
      {semNaoConvertidos ? (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-5 py-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
            <span className="text-xl">🏆</span>
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-300">100% de conversão</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Todos os contatos dos últimos 90 dias foram convertidos em pacientes.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
            <span className="text-lg font-black text-rose-400">{totalNaoConvertidosRef}</span>
          </div>
          <div>
            <p className="text-sm font-bold text-white">
              {totalNaoConvertidosRef} {totalNaoConvertidosRef === 1 ? 'pessoa não fechou' : 'pessoas não fecharam'}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Vamos entender onde as conversas travaram e por quê.
            </p>
          </div>
        </div>
      )}

      {/* Avançar */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          id="btn_abertura_fase03_avancar"
          onClick={onAvancar}
          className="btn-primary flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl"
        >
          Começar o mapeamento
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
