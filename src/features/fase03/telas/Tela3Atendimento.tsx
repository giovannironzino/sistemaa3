// Tela3Atendimento.tsx
// Tela 3 — Mapeamento do Processo de Atendimento.
// Exibida sempre, independente de semNaoConvertidos.
// Checkboxes de múltipla escolha, 8 itens, zero seleções mínimas.
// Especificação: seção 4, "TELA 3".

import React, { useState } from 'react';
import { ArrowRight, CheckSquare, Square } from 'lucide-react';
import type { EtapaAtendimentoId } from '../fase03.types';
import { ETAPAS_ATENDIMENTO } from '../data/listas';

interface Tela3AtendimentoProps {
  initialEtapas: EtapaAtendimentoId[];
  onAvancar: (etapasMarcadas: EtapaAtendimentoId[]) => void;
}

export default function Tela3Atendimento({
  initialEtapas,
  onAvancar,
}: Tela3AtendimentoProps) {
  const [selecionadas, setSelecionadas] = useState<Set<EtapaAtendimentoId>>(
    () => new Set(initialEtapas)
  );

  function toggle(id: EtapaAtendimentoId) {
    setSelecionadas((prev) => {
      const novo = new Set(prev);
      if (novo.has(id)) {
        novo.delete(id);
      } else {
        novo.add(id);
      }
      return novo;
    });
  }

  function handleAvancar() {
    // Preserva a ordem canônica da tabela 2.3
    const etapasOrdenadas = ETAPAS_ATENDIMENTO.filter((e) => selecionadas.has(e.id)).map(
      (e) => e.id
    );
    onAvancar(etapasOrdenadas);
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8" id="tela3_atendimento_fase03">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
          <span className="text-[10px] font-bold tracking-widest text-violet-400 uppercase">
            Eixo 03 · Vendas · Tela 3
          </span>
        </div>
        <h1 className="text-xl font-bold text-white leading-snug">
          Mapeamento do Processo de Atendimento
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Quais destas etapas fazem parte do seu atendimento quando alguém te chama no WhatsApp ou
          Direct? <span className="text-slate-300 font-semibold">(Marque todas as que você realiza)</span>
        </p>
      </div>

      {/* Contador de selecionadas */}
      <div className="text-xs text-slate-500 font-medium">
        <span className={`font-bold ${selecionadas.size > 0 ? 'text-violet-400' : 'text-slate-500'}`}>
          {selecionadas.size}
        </span>{' '}
        de 8 etapas selecionadas
      </div>

      {/* Checkboxes */}
      <div className="space-y-2">
        {ETAPAS_ATENDIMENTO.map((item) => {
          const marcado = selecionadas.has(item.id);
          return (
            <button
              key={item.id}
              type="button"
              id={`etapa_${item.id}`}
              onClick={() => toggle(item.id)}
              aria-pressed={marcado}
              className={[
                'w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all',
                marcado
                  ? 'bg-violet-500/15 border-violet-500/40'
                  : 'bg-white/4 border-white/8 hover:bg-white/8 hover:border-white/15',
              ].join(' ')}
            >
              {marcado ? (
                <CheckSquare className="h-5 w-5 text-violet-400 shrink-0" />
              ) : (
                <Square className="h-5 w-5 text-slate-500 shrink-0" />
              )}
              <span
                className={`text-sm font-medium leading-snug ${
                  marcado ? 'text-white' : 'text-slate-300'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Nota: zero seleções é permitido (caso de borda 6.6) */}
      {selecionadas.size === 0 && (
        <p className="text-xs text-slate-600 px-1" id="nota_zero_etapas">
          Nenhuma seleção obrigatória — se nenhuma dessas etapas faz parte do seu processo atual, pode avançar sem marcar.
        </p>
      )}

      {/* Avançar — sempre habilitado (zero seleções é permitido) */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          id="btn_tela3_atendimento_avancar"
          onClick={handleAvancar}
          className="btn-primary flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl"
        >
          Avançar
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
