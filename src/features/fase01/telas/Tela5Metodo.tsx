// Tela5Metodo.tsx
// Tela 5 — Método
// Choice card de escolha única, 5 opções fixas de MetodoId.

import React, { useState } from 'react';
import { ClusterId, MetodoId } from '../fase01.types';
import { getLabelById } from '../data/bancoDePromessas';
import { ArrowRight } from 'lucide-react';

interface MetodoOpcao {
  id: MetodoId;
  label: string;
}

const METODOS: MetodoOpcao[] = [
  { id: 'rotina_real', label: 'Encaixar na rotina real' },
  { id: 'acompanhamento_proximo', label: 'Acompanhar de perto' },
  { id: 'foco_comportamento', label: 'Focar no comportamento' },
  { id: 'prescricao_tecnica', label: 'Prescrição técnica precisa' },
  { id: 'escuta_sem_julgamento', label: 'Escutar sem julgar' },
];

interface Tela5MetodoProps {
  publicoAlvoFinal: ClusterId;
  promessaSelecionada: string;
  onEscolher: (metodoId: MetodoId) => void;
}

export default function Tela5Metodo({
  publicoAlvoFinal,
  promessaSelecionada,
  onEscolher,
}: Tela5MetodoProps) {
  const [selecionado, setSelecionado] = useState<MetodoId | null>(null);

  const labelPublico = getLabelById(publicoAlvoFinal);

  function handleConfirmar() {
    if (!selecionado) return;
    onEscolher(selecionado);
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8" id="tela5_metodo">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
          <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">
            Eixo 01 · Fase 01 · Tela 5 de 6
          </span>
        </div>
        <h1 className="text-xl font-bold text-white leading-snug">
          Para entregar a promessa de{' '}
          <span className="text-indigo-300">"{promessaSelecionada}"</span> para quem busca{' '}
          <span className="text-indigo-300">{labelPublico}</span>, qual é a base do seu método no
          dia a dia?
        </h1>
      </div>

      {/* Choice Cards — 5 opções fixas */}
      <div className="space-y-3">
        {METODOS.map((metodo) => {
          const isSelected = selecionado === metodo.id;
          return (
            <button
              key={metodo.id}
              type="button"
              id={`metodo_option_${metodo.id}`}
              onClick={() => setSelecionado(metodo.id)}
              className={`w-full text-left rounded-xl px-5 py-4 border transition-all cursor-pointer flex items-center gap-3 group ${
                isSelected
                  ? 'bg-indigo-500/15 border-indigo-500 text-indigo-100'
                  : 'bg-white/4 border-white/10 text-slate-300 hover:bg-white/8 hover:border-indigo-500/40 hover:text-white'
              }`}
            >
              <div
                className={`flex-shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-500'
                    : 'border-white/20 group-hover:border-indigo-500/50'
                }`}
              >
                {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
              </div>
              <span className="text-sm font-semibold leading-snug">{metodo.label}</span>
            </button>
          );
        })}
      </div>

      {/* Confirmar */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          id="btn_tela5_confirmar"
          disabled={!selecionado}
          onClick={handleConfirmar}
          className="btn-primary flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Confirmar método
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
