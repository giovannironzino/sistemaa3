// Tela31TaxaRenovacao.tsx
// Tela 3.1 — Taxa de Renovação Atual.
// Emenda de Integração Fase 04 → Eixo 09. Inserida entre a Tela 3 (Estratégia de
// Fim de Contrato) e a Tela Final. Pergunta nova — não deriva de nenhum campo existente.

import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface Tela31TaxaRenovacaoProps {
  initialTaxa?: number | null;
  onAvancar: (taxa: number) => void;
}

export default function Tela31TaxaRenovacao({
  initialTaxa,
  onAvancar,
}: Tela31TaxaRenovacaoProps) {
  const [taxa, setTaxa] = useState<number>(initialTaxa ?? 0);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8" id="tela31_taxa_renovacao_fase04">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
          <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">
            Eixo 04 · Serviços · Tela 3.1
          </span>
        </div>
        <h1 className="text-xl font-bold text-white leading-snug">
          De tudo que você já vendeu, qual porcentagem aproximada dos seus contratos costuma
          renovar ao final do período?
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Não precisa ser um número exato — uma estimativa de quantos em cada 10 pacientes
          continuam com você já ajuda.
        </p>
      </div>

      {/* Slider de Taxa de Renovação */}
      <div className="space-y-2 p-4 rounded-xl bg-black/30 border border-white/5">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-200">Taxa de Renovação Atual</span>
          <span className="font-bold text-cyan-400 font-mono" id="valor_taxa_renovacao">
            {taxa}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          id="slider_taxa_renovacao"
          value={taxa}
          onChange={(e) => setTaxa(Number(e.target.value))}
          className="w-full accent-cyan-500 bg-slate-700 h-2 rounded-lg cursor-pointer"
        />
      </div>

      {/* Avançar */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          id="btn_tela31_taxa_renovacao_avancar"
          onClick={() => onAvancar(taxa)}
          className="btn-primary flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl"
        >
          Ver o retrato de serviços
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
