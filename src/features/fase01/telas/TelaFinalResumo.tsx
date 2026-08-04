// TelaFinalResumo.tsx
// Tela Final — Resumo
// Exibe a frase montada com publicoAlvoFinal, promessaSelecionada e metodoSelecionado.
// Ao ser renderizada com sucesso, chama onComplete() que define fase01Completa = true.

import React, { useEffect } from 'react';
import { ClusterId, MetodoId } from '../fase01.types';
import { getLabelById } from '../data/bancoDePromessas';
import { Sparkles } from 'lucide-react';

const METODO_LABELS: Record<MetodoId, string> = {
  rotina_real: 'encaixar na rotina real',
  acompanhamento_proximo: 'acompanhar de perto',
  foco_comportamento: 'focar no comportamento',
  prescricao_tecnica: 'prescrição técnica precisa',
  escuta_sem_julgamento: 'escutar sem julgar',
};

interface TelaFinalResumoProps {
  publicoAlvoFinal: ClusterId;
  promessaSelecionada: string;
  metodoSelecionado: MetodoId;
  onComplete: () => void; // chamado ao montar — define fase01Completa = true
}

export default function TelaFinalResumo({
  publicoAlvoFinal,
  promessaSelecionada,
  metodoSelecionado,
  onComplete,
}: TelaFinalResumoProps) {
  const labelPublico = getLabelById(publicoAlvoFinal);
  const labelMetodo = METODO_LABELS[metodoSelecionado];

  // Ao exibir esta tela com sucesso, definir fase01Completa = true
  useEffect(() => {
    onComplete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8" id="tela_final_resumo">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <Sparkles className="h-3 w-3 text-emerald-400" />
          <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
            Eixo 01 · Fase 01 · Concluído
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white leading-snug">
          Sua promessa e método estão definidos.
        </h1>
      </div>

      {/* Frase de Resumo */}
      <div
        id="tela_final_frase_resumo"
        className="bg-gradient-to-br from-indigo-900/40 to-indigo-800/10 border border-indigo-500/30 rounded-2xl p-6 space-y-2"
      >
        <p className="text-base font-semibold text-slate-200 leading-relaxed">
          Nos próximos 90 dias, sua prioridade é atender quem busca{' '}
          <span className="text-indigo-300 font-bold">{labelPublico}</span>. Você promete entregar{' '}
          <span className="text-indigo-300 font-bold">{promessaSelecionada}</span>, usando como
          base <span className="text-indigo-300 font-bold">{labelMetodo}</span>.
        </p>
      </div>

      {/* Detalhes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Público-alvo
          </span>
          <p className="text-sm font-bold text-white">{labelPublico}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Promessa
          </span>
          <p className="text-sm font-bold text-white">{promessaSelecionada}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Método
          </span>
          <p className="text-sm font-bold text-white capitalize">{labelMetodo}</p>
        </div>
      </div>
    </div>
  );
}
