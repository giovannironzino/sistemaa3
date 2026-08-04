// FaseNaoImplementada.tsx
// Tela de placeholder para fases ainda não implementadas (Fases 2 a 9).
// Especificação seção 4.2: exibe texto honesto, sem botões, formulários ou dados fictícios.

import React from 'react';
import { Clock } from 'lucide-react';

interface FaseNaoImplementadaProps {
  nome: string;
  subtitulo: string;
}

export default function FaseNaoImplementada({ nome, subtitulo }: FaseNaoImplementadaProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="h-16 w-16 mx-auto bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
          <Clock className="h-7 w-7 text-slate-400" />
        </div>

        {/* Texts */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white font-display">
            {nome} ainda está sendo construída.
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Assim que estiver pronta, você vai continuar sua jornada exatamente daqui.
          </p>
          <p className="text-xs text-slate-500 italic">
            {subtitulo}
          </p>
        </div>
      </div>
    </div>
  );
}
