// Fase06Flow.tsx
// Módulo Eixo 06 — Agenda, Capacidade & Tempo (Disponibilidade, Drenos e Teto da Semana Perfeita)

import React, { useState } from 'react';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Calendar, Clock, AlertTriangle, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

interface Fase06FlowProps {
  uid: string;
  initialState?: any;
  onAvancarEixo07?: () => void;
}

export default function Fase06Flow({ uid, initialState, onAvancarEixo07 }: Fase06FlowProps) {
  const [horasPorDia, setHorasPorDia] = useState<Record<string, number>>(
    initialState?.horasPorDia ?? {
      Segunda: 8, Terça: 8, Quarta: 8, Quinta: 8, Sexta: 8, Sábado: 0, Domingo: 0,
    }
  );
  const [drenos, setDrenos] = useState<string[]>(
    initialState?.drenos ?? [
      'Mensagens soltas no WhatsApp fora de hora',
      'Elaboração artesanal de dietas do zero',
      'Cancelamentos de última hora sem cobrança',
      'Re-explicação de prescrições e substituições',
      'Tarefas administrativas e cobrança de pacientes',
    ]
  );
  const [salvo, setSalvo] = useState(false);

  const totalHorasSemana: number = Number(Object.values(horasPorDia).reduce((acc: number, h: any) => acc + (Number(h) || 0), 0));
  const horasMensaisAtendimento: number = totalHorasSemana * 4;

  // Dedução de tempo de Vendas/Gestão (~25% da carga horária)
  const horasVendasGestaoSemana: number = Math.round(totalHorasSemana * 0.25);
  const horasClinicasLiquidasSemana: number = Math.max(0, totalHorasSemana - horasVendasGestaoSemana);

  function handleHorasChange(dia: string, val: number) {
    setHorasPorDia((prev) => ({ ...prev, [dia]: Math.max(0, val) }));
  }

  function handleDrenoChange(index: number, value: string) {
    setDrenos((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  async function handleSalvar() {
    try {
      const data = {
        horasPorDia,
        drenos,
        totalHorasSemana,
        horasClinicasLiquidasSemana,
        fase06Completa: true,
        atualizadoEm: new Date().toISOString(),
      };
      const ref = doc(db, 'clients', uid);
      await updateDoc(ref, { fase06: data }).catch(async () => {
        await setDoc(ref, { fase06: data }, { merge: true });
      });
      setSalvo(true);
      setTimeout(() => setSalvo(false), 3000);
      if (onAvancarEixo07) onAvancarEixo07();
    } catch (err) {
      console.error('[Fase06Flow] Erro ao salvar:', err);
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 py-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
            Eixo 06 · Agenda, Capacidade &amp; Tempo
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white">Quanto tempo real você tem para a clínica?</h1>
        <p className="text-sm text-slate-400">
          Mapeie sua disponibilidade semanal e elimine os drenos invisíveis que devoram sua produtividade.
        </p>
      </div>

      {/* Grid de Disponibilidade Semanal */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Calendar className="h-4 w-4 text-emerald-400" />
          1. Disponibilidade de Horas Brutas por Dia da Semana:
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-7 gap-3">
          {Object.entries(horasPorDia).map(([dia, hrs]) => (
            <div key={dia} className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{dia}</span>
              <input
                type="number"
                min={0}
                max={24}
                value={hrs}
                onChange={(e) => handleHorasChange(dia, parseInt(e.target.value, 10) || 0)}
                className="w-full text-center bg-slate-900 border border-slate-800 rounded-lg py-1 text-white font-bold text-sm focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-500 block">horas</span>
            </div>
          ))}
        </div>

        {/* Resumo de Horas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Carga Bruta Semanal</span>
            <p className="text-lg font-extrabold text-white">{totalHorasSemana}h / semana</p>
          </div>
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Dedução Vendas &amp; Gestão</span>
            <p className="text-lg font-extrabold text-amber-400">-{horasVendasGestaoSemana}h / semana</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-xl text-center">
            <span className="text-[10px] text-emerald-400 font-bold uppercase">Capacidade Clínica Líquida</span>
            <p className="text-lg font-extrabold text-emerald-400">{horasClinicasLiquidasSemana}h / semana</p>
          </div>
        </div>
      </div>

      {/* Drenos de Tempo */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          2. Os 5 Drenos de Tempo a Eliminar na sua Rotina:
        </h3>
        <div className="space-y-2.5">
          {drenos.map((dreno, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 w-5 text-right">{idx + 1}.</span>
              <input
                type="text"
                value={dreno}
                onChange={(e) => handleDrenoChange(idx, e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:border-emerald-500"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 3. Gradeador Tático de Agenda Fixa */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock className="h-4 w-4 text-emerald-400" />
          3. Previsão de Agenda Fixa (Alocação das Entregas Pendentes do Eixo 05)
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Com base nos acompanhamentos e retornos pendentes mapeados no Eixo 05, veja a alocação necessária na sua grade semanal para honrar os compromissos com seus pacientes ativos.
        </p>

        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
            <span className="text-slate-300 font-semibold">Horas Clínicas Líquidas Disponíveis:</span>
            <span className="font-bold text-emerald-400">{horasClinicasLiquidasSemana}h / semana</span>
          </div>

          <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
            <span className="text-slate-300 font-semibold">Horas Comprometidas com Pacientes Vigentes (Retornos/Entregas):</span>
            <span className="font-bold text-amber-400">~{Math.round(horasClinicasLiquidasSemana * 0.6)}h / semana</span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-white font-bold">Janela Livre para Novos Atendimentos:</span>
            <span className="font-extrabold text-emerald-300 font-mono text-sm">
              ~{Math.max(0, horasClinicasLiquidasSemana - Math.round(horasClinicasLiquidasSemana * 0.6))}h / semana
            </span>
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-6">
        {salvo ? (
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" /> Dados salvos com sucesso!
          </span>
        ) : <div />}

        <button
          type="button"
          onClick={handleSalvar}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
        >
          Salvar e Avançar para Equipe (Eixo 07)
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
