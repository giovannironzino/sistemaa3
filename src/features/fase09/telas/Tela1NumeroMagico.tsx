// Tela1NumeroMagico.tsx
// Tela 1 — Número Mágico e Limite Pré-Aprovado (Eixo 09)

import React, { useState } from 'react';
import { Target, Clock, Sparkles, ArrowRight, HelpCircle } from 'lucide-react';
import type { ContextoFasesAnteriores } from '../lib/obterContextoFasesAnteriores';
import type { Fase09Assumptions } from '../eixo09.types';

interface Tela1Props {
  contexto: ContextoFasesAnteriores;
  premissas: Fase09Assumptions;
  initialNumeroMagico?: number | null;
  initialTetoSemana?: number | null;
  onAvancar: (dados: {
    numeroMagico: number;
    tetoSemanaPerfeita: number;
    novasPremissas: Partial<Fase09Assumptions>;
  }) => void;
}

export default function Tela1NumeroMagico({
  contexto,
  premissas,
  initialNumeroMagico,
  initialTetoSemana,
  onAvancar,
}: Tela1Props) {
  const { receitaMediaReal, custosFixosTotais, limitePreAprovado, tetoSemanaPerfeitaPadrao } = contexto;

  const valorPadraoNumeroMagico = initialNumeroMagico ?? (
    limitePreAprovado && limitePreAprovado > 0
      ? limitePreAprovado
      : custosFixosTotais > 0
      ? Math.ceil(custosFixosTotais * 1.5)
      : 10000
  );

  const [numeroMagico, setNumeroMagico] = useState<number>(valorPadraoNumeroMagico);
  const [tetoSemanaPerfeita, setTetoSemanaPerfeita] = useState<number>(
    initialTetoSemana ?? tetoSemanaPerfeitaPadrao ?? 40
  );

  // Premissas temporárias (minutos paciente novo e ativo)
  const precisaColetarPremissas =
    premissas.minutosPacienteNovo === null || premissas.minutosPacienteAtivo === null;

  const [minutosNovo, setMinutosNovo] = useState<number>(
    premissas.minutosPacienteNovo ?? 90
  );
  const [minutosAtivo, setMinutosAtivo] = useState<number>(
    premissas.minutosPacienteAtivo ?? 45
  );

  const [erro, setErro] = useState<string | null>(null);

  function handleAvancar() {
    setErro(null);
    if (!numeroMagico || numeroMagico <= 0) {
      setErro('Por favor, defina um Número Mágico (meta de lucro limpo) maior que zero.');
      return;
    }
    if (!tetoSemanaPerfeita || tetoSemanaPerfeita <= 0) {
      setErro('Por favor, defina um teto de horas por semana válido.');
      return;
    }
    if (precisaColetarPremissas) {
      if (!minutosNovo || minutosNovo <= 0 || !minutosAtivo || minutosAtivo <= 0) {
        setErro('Por favor, informe os tempos de atendimento (em minutos) para pacientes novos e ativos.');
        return;
      }
    }

    onAvancar({
      numeroMagico,
      tetoSemanaPerfeita,
      novasPremissas: precisaColetarPremissas
        ? {
            minutosPacienteNovo: minutosNovo,
            minutosPacienteAtivo: minutosAtivo,
          }
        : {},
    });
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8" id="tela1_numero_magico">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase font-label">
            Eixo 09 · Metas & Simulação · Tela 1
          </span>
        </div>

        <h1 className="text-xl font-bold text-white leading-snug">
          Seu Número Mágico & Limite da Semana Perfeita
        </h1>
      </div>

      {/* Mensagem de Boas-Vindas baseada no histórico */}
      <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
        {receitaMediaReal > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400 font-label">
              Limite Pré-Aprovado Identificado
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
              Com os seus números de hoje, você já consegue tirar até{' '}
              <strong className="text-emerald-400 font-bold">
                R$ {(limitePreAprovado || 0).toLocaleString('pt-BR')}
              </strong>{' '}
              limpo por mês, sem precisar mudar muita coisa. Quer usar esse valor, ou tentar um número maior?
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-400 font-label">
              Construindo Meta do Zero
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
              Você está começando agora, então ainda não temos um retrato de faturamento pra te mostrar. Isso é normal — vamos construir sua meta a partir do zero. Só pra te dar um ponto de partida: hoje seus custos fixos declarados somam{' '}
              <strong className="text-amber-300 font-bold">
                R$ {custosFixosTotais.toLocaleString('pt-BR')}/mês
              </strong>
              . Pense num número de lucro limpo que fique confortavelmente acima disso.
            </p>
          </div>
        )}
      </div>

      {/* Inputs principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Número Mágico */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <Target className="h-4 w-4 shrink-0" />
            <span>Número Mágico (Lucro Limpo/mês)</span>
          </div>
          <p className="text-xs text-slate-400 leading-normal">
            Quanto dinheiro limpo no seu bolso por mês você quer como meta?
          </p>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
              R$
            </span>
            <input
              type="number"
              id="input_numero_magico"
              value={numeroMagico || ''}
              onChange={(e) => setNumeroMagico(Number(e.target.value))}
              placeholder="10000"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white font-bold text-lg focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Teto da Semana Perfeita */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <Clock className="h-4 w-4 shrink-0" />
            <span>Teto da Semana Perfeita</span>
          </div>
          <p className="text-xs text-slate-400 leading-normal">
            Qual a carga horária máxima semanal que você aceita trabalhar?
          </p>
          <div className="relative">
            <input
              type="number"
              id="input_teto_semana_perfeita"
              value={tetoSemanaPerfeita || ''}
              onChange={(e) => setTetoSemanaPerfeita(Number(e.target.value))}
              placeholder="40"
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white font-bold text-lg focus:outline-none focus:border-indigo-500 transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold">
              horas / sem
            </span>
          </div>
        </div>
      </div>

      {/* Mini-Formulário de Coleta Embutida (se necessário) */}
      {precisaColetarPremissas && (
        <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-4">
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
            <HelpCircle className="h-4 w-4 shrink-0 text-indigo-400" />
            <span>Premissas de Tempo de Atendimento (Fase 05 Temporária)</span>
          </div>
          <p className="text-xs text-indigo-200/80 leading-relaxed">
            Antes de simular, precisamos de 2 números rápidos: quanto tempo, em média, você gasta com um paciente novo (primeira consulta + protocolo + envio)? E com um paciente que já está em acompanhamento (check-in/retorno)?
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Minutos por Paciente Novo:
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="input_minutos_novo"
                  value={minutosNovo || ''}
                  onChange={(e) => setMinutosNovo(Number(e.target.value))}
                  placeholder="90"
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white font-semibold text-sm focus:outline-none focus:border-indigo-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  min
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Minutos por Paciente Ativo:
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="input_minutos_ativo"
                  value={minutosAtivo || ''}
                  onChange={(e) => setMinutosAtivo(Number(e.target.value))}
                  placeholder="45"
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white font-semibold text-sm focus:outline-none focus:border-indigo-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  min
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Erro */}
      {erro && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 font-semibold">
          {erro}
        </div>
      )}

      {/* Botão Avançar */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          id="btn_tela1_avancar"
          onClick={handleAvancar}
          className="btn-primary flex items-center gap-2 px-6 py-3.5 text-sm font-bold rounded-xl"
        >
          Avançar para Forma de Recebimento
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
