// TelaAbertura.tsx
// Tela de Abertura — Maturidade do Portfólio.
// Especificação: seção B.4, "TELA DE ABERTURA".

import React, { useState } from 'react';
import { ArrowRight, Layers } from 'lucide-react';
import type { QuantosFormatosDeclarado } from '../fase04.types';

interface TelaAberturaProps {
  initialQuantos?: QuantosFormatosDeclarado | null;
  onAvancar: (quantos: QuantosFormatosDeclarado) => void;
}

const OPCOES: { id: QuantosFormatosDeclarado; label: string }[] = [
  { id: 'um_formato', label: '1 único formato' },
  { id: 'dois_a_tres', label: '2 a 3 formatos' },
  { id: 'quatro_ou_mais', label: '4 ou mais formatos' },
];

export default function TelaAbertura({ initialQuantos, onAvancar }: TelaAberturaProps) {
  const [selecionado, setSelecionado] = useState<QuantosFormatosDeclarado | null>(
    initialQuantos ?? null
  );

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8" id="tela_abertura_fase04">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
          <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">
            Eixo 04 · Serviços · Abertura
          </span>
        </div>
        <h1 className="text-xl font-bold text-white leading-snug">
          Quantos formatos de atendimento ou serviços diferentes você oferece hoje no seu
          consultório?
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Considere consultas avulsas, programas de acompanhamento, grupos em comunidade,
          mentorias ou consultorias assíncronas.
        </p>
      </div>

      {/* Choice cards */}
      <div className="space-y-3">
        {OPCOES.map((opcao) => {
          const isSelected = selecionado === opcao.id;
          return (
            <button
              key={opcao.id}
              type="button"
              id={`quantos_formatos_${opcao.id}`}
              onClick={() => setSelecionado(opcao.id)}
              aria-pressed={isSelected}
              className={[
                'w-full flex items-center gap-4 px-5 py-4 rounded-xl border text-left transition-all',
                isSelected
                  ? 'bg-cyan-500/15 border-cyan-500/40 shadow-lg'
                  : 'bg-white/4 border-white/10 hover:bg-white/7',
              ].join(' ')}
            >
              <div
                className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isSelected ? 'bg-cyan-500/20' : 'bg-white/8'
                }`}
              >
                <Layers className={`h-4 w-4 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
              </div>
              <span
                className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}
              >
                {opcao.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Avançar */}
      {selecionado !== null && (
        <div className="flex justify-end pt-2">
          <button
            type="button"
            id="btn_abertura_fase04_avancar"
            onClick={() => onAvancar(selecionado)}
            className="btn-primary flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl"
          >
            Começar a cadastrar meus serviços
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
