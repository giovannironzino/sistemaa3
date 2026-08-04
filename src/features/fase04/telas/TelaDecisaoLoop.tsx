// TelaDecisaoLoop.tsx
// Tela de Decisão do Loop — após cadastrar um serviço, decide se cadastra outro ou conclui.
// Especificação: seção B.4, "TELA DE DECISÃO DO LOOP".

import React from 'react';
import { Plus, CheckSquare, PartyPopper, AlertCircle } from 'lucide-react';

interface TelaDecisaoLoopProps {
  nomeComercialCadastrado: string;
  totalServicos: number;
  onNovoServico: () => void;
  onConcluir: () => void;
}

export default function TelaDecisaoLoop({
  nomeComercialCadastrado,
  totalServicos,
  onNovoServico,
  onConcluir,
}: TelaDecisaoLoopProps) {
  // B.6.2: trava de segurança — não deveria ser alcançável com 0 serviços pelo fluxo normal
  const podeConcluir = totalServicos > 0;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8" id="tela_decisao_loop_fase04">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <PartyPopper className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
            Eixo 04 · Serviços · Serviço Cadastrado
          </span>
        </div>
        <h1 className="text-xl font-bold text-white leading-snug">
          {nomeComercialCadastrado} cadastrado com sucesso! Deseja registrar mais um serviço da sua
          esteira?
        </h1>
      </div>

      {/* Botões */}
      <div className="space-y-3">
        <button
          type="button"
          id="btn_decisao_loop_novo_servico"
          onClick={onNovoServico}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/8 hover:border-cyan-500/30 hover:text-cyan-400 text-sm font-semibold transition-all"
        >
          <Plus className="h-4 w-4" />
          Cadastrar Novo Serviço
        </button>

        <div className="space-y-1.5">
          <button
            type="button"
            id="btn_decisao_loop_concluir"
            disabled={!podeConcluir}
            onClick={onConcluir}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl btn-primary text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
          >
            <CheckSquare className="h-4 w-4" />
            Concluir Cadastro de Serviços e Avançar
          </button>
          {!podeConcluir && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-amber-400">
              <AlertCircle className="h-3.5 w-3.5" />
              Cadastre pelo menos 1 serviço antes de concluir.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
