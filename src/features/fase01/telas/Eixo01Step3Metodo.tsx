// Eixo01Step3Metodo.tsx
// Tela 03 do Eixo 01 — Seu Método (Seleção Visual dos Pilares Sustentadores).

import React, { useState } from 'react';
import { CheckCircle2, ArrowRight, ShieldCheck, HeartHandshake, Compass, Activity, Ear } from 'lucide-react';
import { MetodoId, PacienteMapeadoEixo01 } from '../fase01.types';
import { derivarInsightsEixo01 } from '../lib/eixo01Derivations';

interface Eixo01Step3MetodoProps {
  pacientes: PacienteMapeadoEixo01[];
  metodoSelecionadoInicial?: MetodoId | null;
  onConfirmarMetodo: (metodoId: MetodoId) => void;
}

interface MetodoCardOption {
  id: MetodoId;
  titulo: string;
  descricao: string;
  icone: React.ReactNode;
}

const OPCOES_METODO: MetodoCardOption[] = [
  {
    id: 'rotina_real',
    titulo: 'Encaixar na rotina real',
    descricao: 'Integra o plano à rotina do paciente de forma prática e sustentável.',
    icone: <Compass className="h-5 w-5 text-indigo-400" />,
  },
  {
    id: 'acompanhamento_proximo',
    titulo: 'Acompanhar de perto',
    descricao: 'Presença constante para ajustar, orientar e evoluir com o paciente.',
    icone: <Activity className="h-5 w-5 text-emerald-400" />,
  },
  {
    id: 'foco_comportamento',
    titulo: 'Focar no comportamento',
    descricao: 'Trabalha hábitos e decisões diárias que geram resultados consistentes.',
    icone: <ShieldCheck className="h-5 w-5 text-purple-400" />,
  },
  {
    id: 'prescricao_tecnica',
    titulo: 'Prescrição técnica precisa',
    descricao: 'Protocolos e estratégias baseados em ciência e personalização.',
    icone: <HeartHandshake className="h-5 w-5 text-teal-400" />,
  },
  {
    id: 'escuta_sem_julgamento',
    titulo: 'Escuta sem julgar',
    descricao: 'Ambiente seguro que acolhe, motiva e fortalece a jornada.',
    icone: <Ear className="h-5 w-5 text-amber-400" />,
  },
];

export default function Eixo01Step3Metodo({
  pacientes,
  metodoSelecionadoInicial,
  onConfirmarMetodo,
}: Eixo01Step3MetodoProps) {
  const insights = derivarInsightsEixo01(pacientes);
  const [selecionado, setSelecionado] = useState<MetodoId>(
    metodoSelecionadoInicial || 'rotina_real'
  );

  const handleSubmeter = () => {
    onConfirmarMetodo(selecionado);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fadeIn" id="step3_seu_metodo">
      {/* ── HERO SECTION ── */}
      <div className="text-center sm:text-left space-y-3 border-b border-white/10 pb-6">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-400 font-label">
          Etapa 03 de 04 · Seu Método
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          O que sustenta essa transformação no dia a dia?
        </h1>

        {/* Resumo Discreto das Descobertas */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-semibold bg-white/5 border border-white/10 px-3 py-1 rounded-full text-slate-300">
            Dor predominante: <strong className="text-indigo-400">{insights.topDorRotulo}</strong>
          </span>
          <span className="text-[11px] font-semibold bg-white/5 border border-white/10 px-3 py-1 rounded-full text-slate-300">
            Valor percebido: <strong className="text-emerald-400">{insights.topPilar}</strong>
          </span>
          <span className="text-[11px] font-semibold bg-white/5 border border-white/10 px-3 py-1 rounded-full text-slate-300">
            Diferencial: <strong className="text-purple-300">{insights.topDiferencial}</strong>
          </span>
        </div>
      </div>

      {/* ── SELEÇÃO VISUAL EM GRANDES CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {OPCOES_METODO.map((opcao) => {
          const isSelected = selecionado === opcao.id;
          return (
            <button
              key={opcao.id}
              type="button"
              onClick={() => setSelecionado(opcao.id)}
              className={`p-6 rounded-3xl text-left transition-all border cursor-pointer relative flex flex-col justify-between space-y-4 ${
                isSelected
                  ? 'bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border-indigo-500 ring-2 ring-indigo-500/30 shadow-2xl scale-[1.01]'
                  : 'bg-slate-900/70 border-white/10 hover:border-white/20 hover:bg-white/5'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  {opcao.icone}
                </div>

                <div className={`h-6 w-6 rounded-full border flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-400 text-white'
                    : 'border-white/20 bg-black/40'
                }`}>
                  {isSelected && <CheckCircle2 className="h-4 w-4" />}
                </div>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-white">{opcao.titulo}</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {opcao.descricao}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── BOTÃO DE CONTINUAR ── */}
      <div className="pt-4 border-t border-white/10 flex justify-end">
        <button
          type="button"
          onClick={handleSubmeter}
          className="px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-xl shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-2"
        >
          <span>Continuar</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
