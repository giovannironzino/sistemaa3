// TelaFinalResumo.tsx
// Tela 07 — A Revelação Final (Assinatura Oficial de Mercado)
// Exibe a promessa consolidada e o veredito oficial com base no mapeamento dos pacientes e do método.

import React, { useEffect } from 'react';
import { ClusterId, MetodoId, PacienteMapeadoEixo01, FATORES_PRIORITARIOS_POR_DOR } from '../fase01.types';
import { getLabelById } from '../data/bancoDePromessas';
import { Sparkles, RefreshCw, Award, Target, CheckCircle2 } from 'lucide-react';

const METODO_LABELS: Record<MetodoId, string> = {
  rotina_real: 'adaptação à rotina real',
  acompanhamento_proximo: 'acompanhamento próximo e diário',
  foco_comportamento: 'foco no comportamento e mentalidade',
  prescricao_tecnica: 'prescrição técnica e cálculo preciso',
  escuta_sem_julgamento: 'escuta humana sem julgamentos',
};

interface TelaFinalResumoProps {
  publicoAlvoFinal: ClusterId;
  promessaSelecionada: string;
  metodoSelecionado: MetodoId;
  pacientesMapeados?: PacienteMapeadoEixo01[];
  onComplete: () => void;
  onRevisar: () => void;
}

export default function TelaFinalResumo({
  publicoAlvoFinal,
  promessaSelecionada,
  metodoSelecionado,
  pacientesMapeados = [],
  onComplete,
  onRevisar,
}: TelaFinalResumoProps) {
  const labelPublico = getLabelById(publicoAlvoFinal);
  const labelMetodo = METODO_LABELS[metodoSelecionado];

  // Cálculo da Dor Predominante e Pilares
  const totalMapeados = pacientesMapeados.length;
  const contagemPilarForte: Record<string, number> = {};
  const contagemDiferencial: Record<string, number> = {};

  pacientesMapeados.forEach((p) => {
    if (p.pilarForte) contagemPilarForte[p.pilarForte] = (contagemPilarForte[p.pilarForte] || 0) + 1;
    if (p.elementoDiferencial) contagemDiferencial[p.elementoDiferencial] = (contagemDiferencial[p.elementoDiferencial] || 0) + 1;
  });

  let pilarForteMaisVotado = Object.keys(contagemPilarForte).sort((a, b) => contagemPilarForte[b] - contagemPilarForte[a])[0] || 'Liberdade & Praticidade';
  let diferencialMaisVotado = Object.keys(contagemDiferencial).sort((a, b) => contagemDiferencial[b] - contagemDiferencial[a])[0] || 'Consistência Sem Efeito Sanfona';

  useEffect(() => {
    onComplete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8" id="tela_final_resumo">
      {/* Header */}
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
            Eixo 01 · Revelação Final &amp; Veredito
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-white leading-tight">
          Sua Promessa &amp; Método Revelados
        </h1>
        <p className="text-sm text-slate-400">
          Este é o retrato inconfundível do seu posicionamento, construído com base na amostra real dos seus pacientes.
        </p>
      </div>

      {/* Assinatura Oficial de Mercado (Hero Card) */}
      <div className="bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl p-7 space-y-4 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
        
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
          <Award className="h-4 w-4" />
          Sua Assinatura Oficial de Mercado
        </div>

        <blockquote className="text-lg sm:text-xl font-bold text-slate-100 leading-relaxed italic border-l-4 border-emerald-500 pl-4 py-1">
          "Eu ajudo pessoas que buscam{' '}
          <span className="text-emerald-300 not-italic font-extrabold underline decoration-emerald-500/50">
            {labelPublico}
          </span>{' '}
          a conquistarem{' '}
          <span className="text-emerald-400 not-italic font-extrabold bg-emerald-500/10 px-2 py-0.5 rounded">
            {pilarForteMaisVotado}
          </span>
          , através de um acompanhamento focado em{' '}
          <span className="text-teal-300 not-italic font-extrabold">
            {diferencialMaisVotado}
          </span>{' '}
          e com base em <span className="text-slate-200 not-italic font-bold">{labelMetodo}</span>."
        </blockquote>
      </div>

      {/* Grid de Métricas do Diagnóstico */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Target className="h-3.5 w-3.5 text-emerald-400" />
            Dor Predominante
          </span>
          <p className="text-base font-bold text-white leading-snug">{labelPublico}</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            ⚡ Pilar Forte da Entrega
          </span>
          <p className="text-base font-bold text-emerald-400 leading-snug">{pilarForteMaisVotado}</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            🎯 Elemento Diferencial
          </span>
          <p className="text-base font-bold text-teal-300 leading-snug">{diferencialMaisVotado}</p>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-between items-center border-t border-slate-800 pt-6">
        <button
          type="button"
          onClick={onRevisar}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          Revisar Pacientes &amp; Promessa
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
          <CheckCircle2 className="h-4 w-4" />
          Eixo 01 Concluído com Sucesso
        </div>
      </div>
    </div>
  );
}
