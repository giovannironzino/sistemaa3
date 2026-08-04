// Tela1Data.tsx
// Tela 1 — Seleção da Data para revisão de contatos.

import React, { useState } from 'react';
import { CalendarDays, ArrowRight } from 'lucide-react';

interface Tela1DataProps {
  janelaInicial: string;  // ISO date YYYY-MM-DD
  janelaFinal: string;    // ISO date YYYY-MM-DD
  onAvancar: (data: string) => void;
}

function formatDateBR(isoDate: string): string {
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}

export default function Tela1Data({ janelaInicial, janelaFinal, onAvancar }: Tela1DataProps) {
  const [dataSelecionada, setDataSelecionada] = useState<string>('');

  const handleAvancar = () => {
    if (dataSelecionada) {
      onAvancar(dataSelecionada);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8" id="tela1_data_captacao">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
            Eixo 02 · Captação · Tela 1
          </span>
        </div>
        <h1 className="text-xl font-bold text-white leading-snug">
          Qual data você vai conferir agora no seu WhatsApp ou agenda?
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Abra seu aplicativo de mensagens, vá até essa data e veja quem te procurou.
        </p>
      </div>

      {/* Janela de referência */}
      <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 flex items-center gap-4">
        <CalendarDays className="h-5 w-5 text-emerald-400 shrink-0" />
        <div>
          <p className="text-xs text-slate-400">
            Período de revisão dos últimos 90 dias
          </p>
          <p className="text-sm font-semibold text-white mt-0.5">
            {formatDateBR(janelaInicial)} → {formatDateBR(janelaFinal)}
          </p>
        </div>
      </div>

      {/* Seletor de data */}
      <div className="space-y-3">
        <label
          htmlFor="input_data_captacao"
          className="block text-sm font-semibold text-slate-300"
        >
          Selecione a data para revisar:
        </label>
        <input
          id="input_data_captacao"
          type="date"
          min={janelaInicial}
          max={janelaFinal}
          value={dataSelecionada}
          onChange={(e) => setDataSelecionada(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-medium focus:border-emerald-500 transition-colors cursor-pointer"
          style={{ colorScheme: 'dark' }}
        />
        {dataSelecionada && (
          <p className="text-xs text-emerald-400 font-medium">
            Data selecionada: {formatDateBR(dataSelecionada)}
          </p>
        )}
      </div>

      {/* Avançar */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          id="btn_tela1_data_avancar"
          disabled={!dataSelecionada}
          onClick={handleAvancar}
          className="btn-primary flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
        >
          Ver contatos dessa data
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
