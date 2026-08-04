// Tela4Trava.tsx
// Tela 4 — Trava de Segurança antes de gerar o veredito.

import React from 'react';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateBR(isoDate: string): string {
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Tela4TravaProps {
  janelaInicial: string;
  janelaFinal: string;
  totalContatos: number;
  onConfirmar: () => void;
  onVoltar: () => void;
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export default function Tela4Trava({
  janelaInicial,
  janelaFinal,
  totalContatos,
  onConfirmar,
  onVoltar,
}: Tela4TravaProps) {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-8" id="tela4_trava_captacao">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
          <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">
            Eixo 02 · Captação · Tela 4 — Confirmação Final
          </span>
        </div>
        <h1 className="text-xl font-bold text-white leading-snug">
          Você confirma que conferiu seu WhatsApp/agenda e cadastrou{' '}
          <span className="text-amber-400">TODAS</span> as pessoas que te procuraram entre{' '}
          <span className="text-white font-bold">{formatDateBR(janelaInicial)}</span> e{' '}
          <span className="text-white font-bold">{formatDateBR(janelaFinal)}</span>?
        </h1>
      </div>

      {/* Card de aviso */}
      <div className="bg-amber-500/8 border border-amber-500/25 rounded-xl px-5 py-5 space-y-2">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-amber-400 shrink-0" />
          <p className="text-sm font-bold text-amber-300">
            Você cadastrou{' '}
            <span className="text-white">
              {totalContatos} {totalContatos === 1 ? 'pessoa' : 'pessoas'}
            </span>{' '}
            no total.
          </p>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed pl-8">
          Garantir que nenhum contato ficou de fora é fundamental para que a sua taxa de
          conversão e o ranking de canais fiquem{' '}
          <span className="text-white font-semibold">100% corretos</span>.
        </p>
      </div>

      {/* Opções */}
      <div className="space-y-3">
        <button
          type="button"
          id="btn_tela4_confirmar"
          onClick={onConfirmar}
          className="btn-primary w-full flex items-center justify-center gap-2 px-5 py-4 text-sm font-bold rounded-xl"
        >
          <ShieldCheck className="h-4 w-4" />
          Sim, garanto que cadastrei todos os contatos dos últimos 90 dias!
        </button>

        <button
          type="button"
          id="btn_tela4_voltar"
          onClick={onVoltar}
          className="btn-ghost w-full flex items-center justify-center gap-2 px-5 py-4 text-sm font-semibold rounded-xl"
        >
          <ArrowLeft className="h-4 w-4" />
          Ainda faltam datas/pessoas para conferir.
        </button>
      </div>
    </div>
  );
}
