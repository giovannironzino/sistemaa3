// Fase06Flow.tsx
// Módulo Eixo 06 — Agenda, Capacidade & Tempo (Disponibilidade Cronológica, Catálogo de 5 Drenos e Gradeador Tático)

import React, { useState } from 'react';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Calendar, Clock, AlertTriangle, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

export const DIAS_SEMANA_ORDENADOS = [
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
  'Domingo',
] as const;

export const CATALOGO_DRENOS_TEMPO = [
  'Montagem Manual e Centralizada de Cardápios (Digitação de Dietas)',
  'Suporte Operacional Centralizado e Sem Triagem (WhatsApp Livre)',
  'Burocracia de Onboarding, Agendamentos e Cobranças de Forma Solta',
  'Produção Diária e Desorganizada de Conteúdo',
  'Interrupções Constantes e o clássico "Tem um minutinho?"',
  'Anotações Manuais e Redação de Prontuários Durante a Consulta',
  'Condução Integral de Avaliações Físicas e Triagens Longas',
  '"Centralismo do Faz-Tudo" (Falta de Delegação Geral)',
  'Atendimento Online Sem Limites de Horário (Suporte 24h)',
  'Dependência de Vender Consultas Avulsas (Zerar o Caixa Todo Mês)',
  'Outros',
] as const;

interface Fase06FlowProps {
  uid: string;
  initialState?: any;
  onAvancarEixo07?: () => void;
}

export default function Fase06Flow({ uid, initialState, onAvancarEixo07 }: Fase06FlowProps) {
  // 1. Disponibilidade por dia na ordem cronológica estrita da semana
  const [horasPorDia, setHorasPorDia] = useState<Record<string, number>>(() => {
    const init = initialState?.horasPorDia || {};
    return {
      Segunda: init.Segunda ?? 8,
      Terça: init.Terça ?? 8,
      Quarta: init.Quarta ?? 8,
      Quinta: init.Quinta ?? 8,
      Sexta: init.Sexta ?? 8,
      Sábado: init.Sábado ?? 0,
      Domingo: init.Domingo ?? 0,
    };
  });

  // 2. Os 5 Drenos de Tempo selecionados da lista padronizada
  const [drenosSelecionados, setDrenosSelecionados] = useState<string[]>(() => {
    if (Array.isArray(initialState?.drenos) && initialState.drenos.length === 5) {
      return initialState.drenos;
    }
    return [
      'Montagem Manual e Centralizada de Cardápios (Digitação de Dietas)',
      'Suporte Operacional Centralizado e Sem Triagem (WhatsApp Livre)',
      'Burocracia de Onboarding, Agendamentos e Cobranças de Forma Solta',
      'Interrupções Constantes e o clássico "Tem um minutinho?"',
      'Outros',
    ];
  });

  // Texto livre para quando o usuário seleciona 'Outros'
  const [drenoOutrosTexto, setDrenoOutrosTexto] = useState<string>(
    initialState?.drenoOutrosTexto ?? 'Mensagens soltas e dúvidas operacionais fora do horário de consulta'
  );

  const [salvo, setSalvo] = useState(false);

  // Cálculos de Carga Horária
  const totalHorasSemana: number = Number(
    DIAS_SEMANA_ORDENADOS.reduce((acc, dia) => acc + (Number(horasPorDia[dia]) || 0), 0)
  );

  // Dedução de tempo de Vendas/Gestão (~25% da carga horária)
  const horasVendasGestaoSemana: number = Math.round(totalHorasSemana * 0.25);
  const horasClinicasLiquidasSemana: number = Math.max(0, totalHorasSemana - horasVendasGestaoSemana);

  function handleHorasChange(dia: string, val: number) {
    setHorasPorDia((prev) => ({ ...prev, [dia]: Math.max(0, val) }));
  }

  function handleDrenoSelect(index: number, opcao: string) {
    setDrenosSelecionados((prev) => {
      const next = [...prev];
      next[index] = opcao;
      return next;
    });
  }

  async function handleSalvar() {
    try {
      const data = {
        horasPorDia,
        drenos: drenosSelecionados,
        drenoOutrosTexto,
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
    <div className="w-full max-w-4xl mx-auto space-y-8 py-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-2 border-b border-slate-800 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
            Eixo 06 · Agenda, Capacidade &amp; Tempo
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white">Quanto tempo real você tem para a clínica?</h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          Mapeie sua disponibilidade semanal cronológica e selecione os 5 drenos invisíveis que devoram sua produtividade.
        </p>
      </div>

      {/* 1. GRID CRONOLÓGICO DE DISPONIBILIDADE SEMANAL */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Calendar className="h-4 w-4 text-emerald-400" />
          1. Disponibilidade de Horas Brutas por Dia da Semana (Ordem Cronológica):
        </h3>
        <p className="text-xs text-slate-400">
          Informe quantas horas brutas por dia você dedica à sua prática clínica de Segunda a Domingo.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-7 gap-3">
          {DIAS_SEMANA_ORDENADOS.map((dia) => (
            <div key={dia} className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center space-y-1.5 hover:border-emerald-500/40 transition-all">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">{dia}</span>
              <input
                type="number"
                min={0}
                max={24}
                value={horasPorDia[dia] ?? 0}
                onChange={(e) => handleHorasChange(dia, parseInt(e.target.value, 10) || 0)}
                className="w-full text-center bg-slate-900 border border-slate-800 rounded-lg py-1.5 text-white font-bold text-sm focus:border-emerald-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 block">horas/dia</span>
            </div>
          ))}
        </div>

        {/* Resumo de Horas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Carga Bruta Semanal</span>
            <p className="text-lg font-extrabold text-white">{totalHorasSemana}h / semana</p>
          </div>
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-center space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Dedução Vendas &amp; Gestão (25%)</span>
            <p className="text-lg font-extrabold text-amber-400">-{horasVendasGestaoSemana}h / semana</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-xl text-center space-y-0.5">
            <span className="text-[10px] text-emerald-400 font-bold uppercase">Capacidade Clínica Líquida</span>
            <p className="text-lg font-extrabold text-emerald-400">{horasClinicasLiquidasSemana}h / semana</p>
          </div>
        </div>
      </div>

      {/* 2. OS 5 DRENOS DE TEMPO SELECIONÁVEIS */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            2. Os 05 Drenos de Tempo a Eliminar na sua Rotina:
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Selecione até 5 maiores gargalos da lista padronizada abaixo. Se selecionar &quot;Outros&quot;, digite a sua rotina específica.
          </p>
        </div>

        <div className="space-y-3.5">
          {Array.from({ length: 5 }).map((_, idx) => {
            const drenoAtual = drenosSelecionados[idx] || CATALOGO_DRENOS_TEMPO[idx] || 'Outros';
            const isOutros = drenoAtual === 'Outros';

            return (
              <div key={idx} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <select
                    value={drenoAtual}
                    onChange={(e) => handleDrenoSelect(idx, e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:border-emerald-500 focus:outline-none"
                  >
                    {CATALOGO_DRENOS_TEMPO.map((opcao) => (
                      <option key={opcao} value={opcao}>
                        {opcao}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Campo de Texto Livre se for 'Outros' */}
                {isOutros && (
                  <div className="pl-9">
                    <label className="text-[10px] font-bold text-amber-400 uppercase block mb-1">
                      Descreva o seu Dreno de Tempo Específico:
                    </label>
                    <input
                      type="text"
                      value={drenoOutrosTexto}
                      onChange={(e) => setDrenoOutrosTexto(e.target.value)}
                      placeholder="Ex: Mensagens soltas no WhatsApp fora de hora..."
                      className="w-full bg-slate-900 border border-amber-500/40 rounded-xl px-3 py-2 text-xs text-white font-medium focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. GRADEADOR TÁTICO DE AGENDA FIXA */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
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
        ) : (
          <div />
        )}

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
