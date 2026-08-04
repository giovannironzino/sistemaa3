// Tela13DuracaoCarteira.tsx
// Tela 1.3 — Duração, Modalidade e Carteira.
// Especificação: seção B.4, "TELAS 1.1, 1.2, 1.3".

import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { ModalidadeId, DuracaoContratoId } from '../fase04.types';
import { MODALIDADES, DURACOES_CONTRATO } from '../data/listasFase04';

interface Tela13DuracaoCarteiraProps {
  nomeComercial: string;
  initialModalidade?: ModalidadeId | null;
  initialDuracaoContrato?: DuracaoContratoId | null;
  initialPacientesAtivosVigentes?: number;
  initialVendasRealizadas90Dias?: number;
  onAvancar: (
    modalidade: ModalidadeId,
    duracaoContrato: DuracaoContratoId,
    pacientesAtivosVigentes: number,
    vendasRealizadas90Dias: number
  ) => void;
}

function clampInt(raw: string): number {
  const n = parseInt(raw, 10);
  if (isNaN(n) || n < 0) return 0;
  return n;
}

export default function Tela13DuracaoCarteira({
  nomeComercial,
  initialModalidade,
  initialDuracaoContrato,
  initialPacientesAtivosVigentes,
  initialVendasRealizadas90Dias,
  onAvancar,
}: Tela13DuracaoCarteiraProps) {
  const [modalidade, setModalidade] = useState<ModalidadeId | null>(initialModalidade ?? null);
  const [duracaoContrato, setDuracaoContrato] = useState<DuracaoContratoId | null>(
    initialDuracaoContrato ?? null
  );
  const [pacientesAtivosVigentes, setPacientesAtivosVigentes] = useState<number>(
    initialPacientesAtivosVigentes ?? 0
  );
  const [vendasRealizadas90Dias, setVendasRealizadas90Dias] = useState<number>(
    initialVendasRealizadas90Dias ?? 0
  );

  const podeAvancar = modalidade !== null && duracaoContrato !== null;

  function handleAvancar() {
    if (!podeAvancar || modalidade === null || duracaoContrato === null) return;
    onAvancar(modalidade, duracaoContrato, pacientesAtivosVigentes, vendasRealizadas90Dias);
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8" id="tela13_duracao_carteira_fase04">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
          <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">
            Eixo 04 · Serviços · Tela 1.3
          </span>
        </div>
        <h1 className="text-xl font-bold text-white leading-snug">
          Qual é o alcance e o volume de clientes do(a) {nomeComercial}?
        </h1>
      </div>

      {/* Campo 1 — Modalidade de Atendimento */}
      <div className="space-y-3">
        <span className="block text-xs font-semibold text-slate-300">Modalidade de Atendimento</span>
        <div className="grid grid-cols-3 gap-2">
          {MODALIDADES.map((item) => {
            const isSelected = modalidade === item.id;
            return (
              <button
                key={item.id}
                type="button"
                id={`modalidade_${item.id}`}
                onClick={() => setModalidade(item.id)}
                aria-pressed={isSelected}
                className={[
                  'text-center px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all',
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-white'
                    : 'bg-white/4 border-white/8 text-slate-300 hover:bg-white/8',
                ].join(' ')}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Campo 2 — Duração / Validade do Contrato */}
      <div className="space-y-3">
        <span className="block text-xs font-semibold text-slate-300">Duração / Validade do Contrato</span>
        <div className="space-y-2">
          {DURACOES_CONTRATO.map((item) => {
            const isSelected = duracaoContrato === item.id;
            return (
              <button
                key={item.id}
                type="button"
                id={`duracao_${item.id}`}
                onClick={() => setDuracaoContrato(item.id)}
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

      {/* Campo 3 — Pacientes Ativos Vigentes */}
      <div className="space-y-2">
        <label htmlFor="input_pacientes_ativos" className="block text-xs font-semibold text-slate-300">
          Pacientes Ativos Vigentes
        </label>
        <input
          id="input_pacientes_ativos"
          type="number"
          min={0}
          step={1}
          value={pacientesAtivosVigentes}
          onChange={(e) => setPacientesAtivosVigentes(clampInt(e.target.value))}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
        />
      </div>

      {/* Campo 4 — Vendas Realizadas nos últimos 90 dias */}
      <div className="space-y-2">
        <label htmlFor="input_vendas_90dias" className="block text-xs font-semibold text-slate-300">
          Vendas Realizadas nos últimos 90 dias
        </label>
        <input
          id="input_vendas_90dias"
          type="number"
          min={0}
          step={1}
          value={vendasRealizadas90Dias}
          onChange={(e) => setVendasRealizadas90Dias(clampInt(e.target.value))}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
        />
      </div>

      {/* Avançar */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          id="btn_tela13_avancar"
          disabled={!podeAvancar}
          onClick={handleAvancar}
          className="btn-primary flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
        >
          Cadastrar Serviço
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
