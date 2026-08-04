// Tela4FollowUp.tsx
// Tela 4 — Comportamento diante da Parada de Resposta.
// Choice card com 2 opções: sem_recontato → Tela Final; recontato_ativo → Tela 4.1.
// Especificação: seção 4, "TELA 4".

import React, { useState } from 'react';
import { ArrowRight, BellOff, BellRing } from 'lucide-react';
import type { AtitudeFollowUp } from '../fase03.types';

interface Tela4FollowUpProps {
  initialAtitude: AtitudeFollowUp | null;
  onEscolher: (atitude: AtitudeFollowUp) => void;
}

interface OpcaoCard {
  id: AtitudeFollowUp;
  titulo: string;
  descricao: string;
  icon: React.ElementType;
  cor: string;
  corBorda: string;
  corIcone: string;
}

const OPCOES: OpcaoCard[] = [
  {
    id: 'sem_recontato',
    titulo: 'Não envio mais nenhuma mensagem',
    descricao: 'Quando a pessoa para de responder, aguardo ela retornar espontaneamente.',
    icon: BellOff,
    cor: 'bg-slate-500/10',
    corBorda: 'border-slate-500/30',
    corIcone: 'text-slate-400',
  },
  {
    id: 'recontato_ativo',
    titulo: 'Realizo acompanhamento / recontato ativo',
    descricao: 'Envio novas mensagens para tentar reativar a conversa e fechar a consulta.',
    icon: BellRing,
    cor: 'bg-violet-500/10',
    corBorda: 'border-violet-500/30',
    corIcone: 'text-violet-400',
  },
];

export default function Tela4FollowUp({
  initialAtitude,
  onEscolher,
}: Tela4FollowUpProps) {
  const [selecionado, setSelecionado] = useState<AtitudeFollowUp | null>(initialAtitude);

  function handleSelecionar(id: AtitudeFollowUp) {
    setSelecionado(id);
    // Não avança automaticamente — aguarda clique no botão Avançar
    // para permitir reconsideração (consistência com os outros choice cards da spec)
  }

  function handleAvancar() {
    if (!selecionado) return;
    onEscolher(selecionado);
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8" id="tela4_followup_fase03">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
          <span className="text-[10px] font-bold tracking-widest text-violet-400 uppercase">
            Eixo 03 · Vendas · Tela 4
          </span>
        </div>
        <h1 className="text-xl font-bold text-white leading-snug">
          Comportamento diante da Parada de Resposta
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Quando uma pessoa para de te responder na conversa de vendas, qual é a sua atitude padrão?
        </p>
      </div>

      {/* Choice cards */}
      <div className="space-y-3">
        {OPCOES.map((opcao) => {
          const Icon = opcao.icon;
          const isSelected = selecionado === opcao.id;
          return (
            <button
              key={opcao.id}
              type="button"
              id={`followup_opcao_${opcao.id}`}
              onClick={() => handleSelecionar(opcao.id)}
              aria-pressed={isSelected}
              className={[
                'w-full flex items-start gap-4 px-5 py-5 rounded-xl border text-left transition-all hover:scale-[1.01] active:scale-[0.99]',
                isSelected
                  ? `${opcao.cor} ${opcao.corBorda} shadow-lg`
                  : 'bg-white/4 border-white/10 hover:bg-white/7',
              ].join(' ')}
            >
              <div
                className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isSelected ? opcao.cor : 'bg-white/8'
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${isSelected ? opcao.corIcone : 'text-slate-500'}`}
                />
              </div>
              <div className="space-y-1 flex-1">
                <p
                  className={`text-sm font-bold leading-snug ${
                    isSelected ? 'text-white' : 'text-slate-200'
                  }`}
                >
                  {opcao.titulo}
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">{opcao.descricao}</p>
              </div>
              {isSelected && (
                <div className="shrink-0 h-5 w-5 rounded-full bg-violet-500/30 border border-violet-400 flex items-center justify-center mt-0.5">
                  <div className="h-2 w-2 rounded-full bg-violet-400" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Instrução de seleção */}
      {selecionado === null && (
        <p className="text-xs text-slate-600 px-1" id="nota_tela4_selecionar">
          Selecione uma das opções acima para continuar.
        </p>
      )}

      {/* Botão de avanço */}
      {selecionado !== null && (
        <div className="flex justify-end">
          <button
            type="button"
            id="btn_tela4_followup_avancar"
            onClick={handleAvancar}
            className="btn-primary flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl"
          >
            Avançar
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
