// Tela11IdentificacaoFormato.tsx
// Tela 1.1 — Identificação e Formato (repetidor guiado, Serviço N).
// Especificação: seção B.4, "TELAS 1.1, 1.2, 1.3".

import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { FormatoComercialId } from '../fase04.types';
import { FORMATOS_COMERCIAIS } from '../data/listasFase04';

interface Tela11IdentificacaoFormatoProps {
  numeroServico: number;
  initialNome?: string;
  initialFormato?: FormatoComercialId | null;
  onAvancar: (nomeComercial: string, formatoComercial: FormatoComercialId) => void;
}

export default function Tela11IdentificacaoFormato({
  numeroServico,
  initialNome,
  initialFormato,
  onAvancar,
}: Tela11IdentificacaoFormatoProps) {
  const [nome, setNome] = useState(initialNome ?? '');
  const [formato, setFormato] = useState<FormatoComercialId | null>(initialFormato ?? null);

  const podeAvancar = nome.trim().length > 0 && formato !== null;

  function handleAvancar() {
    if (!podeAvancar || formato === null) return;
    onAvancar(nome.trim(), formato);
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8" id="tela11_identificacao_formato_fase04">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
          <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">
            Eixo 04 · Serviços · Tela 1.1
          </span>
        </div>
        <h1 className="text-xl font-bold text-white leading-snug">
          Qual é o nome e o formato do serviço nº {numeroServico} que você oferece?
        </h1>
      </div>

      {/* Campo 1 — Nome Comercial */}
      <div className="space-y-2">
        <label htmlFor="input_nome_comercial" className="block text-xs font-semibold text-slate-300">
          Nome Comercial do Serviço
        </label>
        <input
          id="input_nome_comercial"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Programa de Emagrecimento Trimestral"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
        />
      </div>

      {/* Campo 2 — Formato Comercial de Entrega */}
      <div className="space-y-3">
        <span className="block text-xs font-semibold text-slate-300">
          Formato Comercial de Entrega
        </span>
        <div className="space-y-2">
          {FORMATOS_COMERCIAIS.map((item) => {
            const isSelected = formato === item.id;
            return (
              <button
                key={item.id}
                type="button"
                id={`formato_${item.id}`}
                onClick={() => setFormato(item.id)}
                aria-pressed={isSelected}
                className={[
                  'w-full text-left px-4 py-3 rounded-xl border text-sm transition-all',
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-white font-semibold'
                    : 'bg-white/4 border-white/8 text-slate-300 hover:bg-white/8 hover:border-white/15',
                ].join(' ')}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Avançar */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          id="btn_tela11_avancar"
          disabled={!podeAvancar}
          onClick={handleAvancar}
          className="btn-primary flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
        >
          Avançar
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
