// Tela3EscolhaCaminho.tsx
// Tela 3 — Escolha de Caminho (Eixo 09)

import React, { useState } from 'react';
import { Compass, UserPlus, Users, Sparkles, ArrowRight, Lock } from 'lucide-react';
import type { EscolhaCaminhoId } from '../eixo09.types';

interface Tela3Props {
  baseAtivosAtual: number;
  initialEscolhaCaminho?: EscolhaCaminhoId | null;
  onAvancar: (escolha: EscolhaCaminhoId) => void;
}

const OPCOES_CAMINHO: {
  id: EscolhaCaminhoId;
  label: string;
  descricao: string;
  icon: any;
  requerBaseAtiva: boolean;
}[] = [
  {
    id: 'novos',
    label: 'Trazendo gente nova',
    descricao: 'Focar em atrair, converter e fechar com novos pacientes para o consultório.',
    icon: UserPlus,
    requerBaseAtiva: false,
  },
  {
    id: 'base_atual',
    label: 'Cobrando mais de quem já é meu paciente',
    descricao: 'Focar em reajustar ticket médio, migrar para planos maiores e vender ecossistema.',
    icon: Users,
    requerBaseAtiva: true,
  },
  {
    id: 'mistura',
    label: 'Misturando as duas coisas',
    descricao: 'Combinar a vinda de pacientes novos com a alavancagem da base atual.',
    icon: Sparkles,
    requerBaseAtiva: true,
  },
];

export default function Tela3EscolhaCaminho({
  baseAtivosAtual,
  initialEscolhaCaminho,
  onAvancar,
}: Tela3Props) {
  const [selecionado, setSelecionado] = useState<EscolhaCaminhoId>(
    initialEscolhaCaminho ?? 'novos'
  );

  const temBaseAtiva = baseAtivosAtual > 0;

  function handleAvancar() {
    onAvancar(selecionado);
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8" id="tela3_escolha_caminho">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
          <Compass className="h-3.5 w-3.5 text-indigo-400" />
          <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase font-label">
            Eixo 09 · Metas & Simulação · Tela 3
          </span>
        </div>

        <h1 className="text-xl font-bold text-white leading-snug">
          Como você quer buscar esse resultado?
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Escolha o caminho estratégico inicial. Esta escolha nos ajuda a guiar sua simulação no painel vivo.
        </p>
      </div>

      {/* Opções (Choice Cards) */}
      <div className="space-y-3">
        {OPCOES_CAMINHO.map((opcao) => {
          const desabilitado = opcao.requerBaseAtiva && !temBaseAtiva;
          const isSelected = selecionado === opcao.id && !desabilitado;
          const Icon = opcao.icon;

          return (
            <div key={opcao.id} className="space-y-1">
              <button
                type="button"
                id={`escolha_caminho_${opcao.id}`}
                disabled={desabilitado}
                onClick={() => !desabilitado && setSelecionado(opcao.id)}
                aria-pressed={isSelected}
                className={[
                  'w-full flex items-start gap-4 px-5 py-4 rounded-xl border text-left transition-all',
                  desabilitado
                    ? 'bg-white/2 border-white/5 opacity-50 cursor-not-allowed'
                    : isSelected
                    ? 'bg-indigo-600/15 border-indigo-500/50 shadow-lg ring-1 ring-indigo-500/30'
                    : 'bg-white/4 border-white/10 hover:bg-white/7',
                ].join(' ')}
              >
                <div
                  className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    desabilitado
                      ? 'bg-white/5 text-slate-600'
                      : isSelected
                      ? 'bg-indigo-500/20 text-indigo-400'
                      : 'bg-white/8 text-slate-500'
                  }`}
                >
                  {desabilitado ? <Lock className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <div className="space-y-1">
                  <span
                    className={`text-sm font-bold block ${
                      desabilitado ? 'text-slate-500' : isSelected ? 'text-white' : 'text-slate-300'
                    }`}
                  >
                    {opcao.label}
                  </span>
                  <span className="text-xs text-slate-400 block leading-normal">
                    {opcao.descricao}
                  </span>
                </div>
              </button>

              {desabilitado && (
                <p className="text-[11px] text-slate-500 pl-4 italic">
                  Ainda não disponível — você não tem pacientes ativos cadastrados na Fase 04.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Botão Avançar */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          id="btn_tela3_avancar"
          onClick={handleAvancar}
          className="btn-primary flex items-center gap-2 px-6 py-3.5 text-sm font-bold rounded-xl"
        >
          Entrar na Mesa de Controle Viva
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
