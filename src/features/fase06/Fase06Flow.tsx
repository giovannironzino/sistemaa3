// Fase06Flow.tsx
// Redesenho Completo do Eixo 06 — Agenda, Capacidade & Tempo (98% Mais Profundo).
// 100% Analítico e Neutro (Sem Simuladores nem Dicas — Simulação Exclusiva do Eixo 09).
// Incorpora: Microações em MINUTOS, Conversão Automática Minutos ➔ Horas, Mapeamento Nominal do Passivo de Tempo Futuro (Eixo 01 ➔ 04 ➔ 05 ➔ 06).

import React, { useState, useMemo } from 'react';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Calendar, Clock, AlertTriangle, CheckCircle2, ArrowRight, Sparkles, User, FileText, PackageCheck, Layers } from 'lucide-react';
import { DOMINIOS_TATICOS_AGENDA } from './catalogoMicroacoesAgenda';
import { calcularTempoFuturoComprometido } from './lib/calcularTempoFuturoComprometido';

export const DIAS_SEMANA_ORDENADOS = [
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
  'Domingo',
] as const;

interface Fase06FlowProps {
  uid: string;
  initialState?: any;
  pacientesEixo01?: Array<{ id: string; nome: string; ticketPagoEstimado?: number; mesAtendimento?: string }>;
  onAvancarEixo07?: () => void;
}

export default function Fase06Flow({ uid, initialState, pacientesEixo01 = [], onAvancarEixo07 }: Fase06FlowProps) {
  // 1. Matriz de Horas por Dia na Ordem Cronológica Estrita
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

  // 2. Microações em MINUTOS (Estado de cada microação)
  const [microAcoesEstado, setMicroAcoesEstado] = useState<
    Record<string, { realiza: boolean; duracaoMinutos: number; ocorrenciasPorSemana: number }>
  >(() => {
    const init: Record<string, { realiza: boolean; duracaoMinutos: number; ocorrenciasPorSemana: number }> = {};
    DOMINIOS_TATICOS_AGENDA.forEach((dom) => {
      dom.microAcoes.forEach((act) => {
        const salvo = initialState?.microAcoesEstado?.[act.id];
        init[act.id] = {
          realiza: salvo?.realiza ?? true,
          duracaoMinutos: salvo?.duracaoMinutos ?? act.duracaoMinutosPadrao,
          ocorrenciasPorSemana: salvo?.ocorrenciasPorSemana ?? act.ocorrenciasPorSemanaPadrao,
        };
      });
    });
    return init;
  });

  const [salvo, setSalvo] = useState(false);

  // Cálculos de Carga Horária Bruta da Semana (Soma Cronológica)
  const totalHorasSemana: number = Number(
    DIAS_SEMANA_ORDENADOS.reduce((acc, dia) => acc + (Number(horasPorDia[dia]) || 0), 0)
  );

  // Cálculo do tempo em Horas por Domínio a partir dos MINUTOS informados pelo usuário
  const horasPorDominio = useMemo(() => {
    const res: Record<string, number> = {
      tecnico: 0,
      comercial: 0,
      gestao: 0,
      marketing: 0,
      financeiro: 0,
      autocuidado: 0,
    };

    DOMINIOS_TATICOS_AGENDA.forEach((dom) => {
      let minSemanaDominio = 0;
      dom.microAcoes.forEach((act) => {
        const est = microAcoesEstado[act.id];
        if (est && est.realiza) {
          minSemanaDominio += est.duracaoMinutos * est.ocorrenciasPorSemana;
        }
      });
      res[dom.id] = Number((minSemanaDominio / 60).toFixed(1));
    });

    return res;
  }, [microAcoesEstado]);

  // Cálculo Nominal do Tempo Futuro Comprometido (Encadeamento Eixo 01 ➔ 04 ➔ 05 ➔ 06)
  const calculoPassivoFuturo = useMemo(() => {
    return calcularTempoFuturoComprometido(pacientesEixo01, horasPorDominio.tecnico || 30);
  }, [pacientesEixo01, horasPorDominio.tecnico]);

  function handleHorasChange(dia: string, val: number) {
    setHorasPorDia((prev) => ({ ...prev, [dia]: Math.max(0, val) }));
  }

  function handleMicroAcaoToggle(id: string) {
    setMicroAcoesEstado((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        realiza: !prev[id].realiza,
      },
    }));
  }

  function handleMicroAcaoMinutosChange(id: string, minutos: number) {
    setMicroAcoesEstado((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        duracaoMinutos: Math.max(0, minutos),
      },
    }));
  }

  async function handleSalvar() {
    try {
      const data = {
        horasPorDia,
        microAcoesEstado,
        horasPorDominio,
        totalHorasSemana,
        totalHorasFuturasComprometidas: calculoPassivoFuturo.totalHorasSemanaComprometidas,
        tetoFisicoPacientes: calculoPassivoFuturo.tetoFisicoPacientes,
        janelaLivreHorasSemana: calculoPassivoFuturo.janelaLivreHorasSemana,
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
    <div className="w-full max-w-5xl mx-auto space-y-8 py-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-2 border-b border-slate-800 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
            Eixo 06 · Agenda, Capacidade &amp; Tempo
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white">Mapeamento de Carga Horária &amp; Passivo Técnico de Tempo</h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          Informe o seu tempo em minutos nas microações cotidianas. O Sistema A3 calcula a conversão em horas e apresenta o rastreamento nominal do tempo futuro comprometido com sua base ativa.
        </p>
      </div>

      {/* ── SEÇÃO 1: MATRIZ DE HORAS POR DIA DA SEMANA (ORDEM CRONOLÓGICA) ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Calendar className="h-4 w-4 text-emerald-400" />
          1. Disponibilidade de Horas Brutas por Dia da Semana (Segunda a Domingo)
        </h2>
        <p className="text-xs text-slate-400">
          Informe quantas horas por dia você destina à operação da clínica de Segunda a Domingo.
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

        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300">Carga Bruta Semanal Cadastrada:</span>
          <span className="text-sm font-extrabold text-white font-mono">{totalHorasSemana}h / semana</span>
        </div>
      </div>

      {/* ── SEÇÃO 2: DECOMPOSIÇÃO NOS 06 DOMÍNIOS POR MICROAÇÕES EM MINUTOS ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-400" />
            2. Decomposição da Rotina nos 06 Domínios Táticos (Duração em MINUTOS)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Informe quanto tempo em <strong>minutos</strong> você dedica a cada microação. As tags indicam os dados resgatados automaticamente dos Eixos anteriores.
          </p>
        </div>

        <div className="space-y-6">
          {DOMINIOS_TATICOS_AGENDA.map((dom) => {
            const horasCalc = horasPorDominio[dom.id] || 0;
            return (
              <div key={dom.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-4">
                {/* Header do Domínio */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{dom.icone}</span>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">{dom.titulo}</h3>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-bold font-mono text-emerald-400">
                    Calculado: {horasCalc}h / semana
                  </span>
                </div>

                {/* Lista de Microações em Minutos */}
                <div className="space-y-3">
                  {dom.microAcoes.map((act) => {
                    const est = microAcoesEstado[act.id] || {
                      realiza: true,
                      duracaoMinutos: act.duracaoMinutosPadrao,
                      ocorrenciasPorSemana: act.ocorrenciasPorSemanaPadrao,
                    };

                    return (
                      <div
                        key={act.id}
                        className={`p-3.5 rounded-xl border transition-all space-y-2 ${
                          est.realiza
                            ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                            : 'bg-slate-950/50 border-slate-900 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={est.realiza}
                              onChange={() => handleMicroAcaoToggle(act.id)}
                              className="h-4 w-4 rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white">{act.titulo}</span>
                                {act.eixoOrigem && (
                                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                    💡 Resgatado do {act.eixoOrigem}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400">{act.descricao}</p>
                            </div>
                          </div>

                          {est.realiza && (
                            <div className="flex items-center gap-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Tempo médio:</label>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min={0}
                                  value={est.duracaoMinutos}
                                  onChange={(e) =>
                                    handleMicroAcaoMinutosChange(act.id, parseInt(e.target.value, 10) || 0)
                                  }
                                  className="w-16 bg-slate-950 border border-slate-800 rounded-lg py-1 px-2 text-center text-xs font-bold text-emerald-400 focus:border-emerald-500"
                                />
                                <span className="text-xs font-semibold text-slate-400">minutos</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SEÇÃO 3: TABELA DE PASSIVO DE TEMPO FUTURO COMPROMETIDO (NOMINAL) ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-1">
            <Layers className="h-3 w-3 text-amber-400" />
            <span className="text-[10px] font-bold text-amber-400 uppercase">Encadeamento Nominal · Eixos 01 ➔ 04 ➔ 05 ➔ 06</span>
          </div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            3. Rastreamento Nominal do Tempo Futuro Comprometido com a Base Ativa
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Cruza quem são seus pacientes ativos (Eixo 01), os serviços contratados (Eixo 04) e os entregáveis (Eixo 05) para metrificar o tempo exato comprometido na sua agenda.
          </p>
        </div>

        {/* Tabela Nominal */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950 text-[10px] uppercase font-bold text-slate-400">
                <th className="p-3">Paciente Ativo (Eixo 01)</th>
                <th className="p-3">Serviço Contratado (Eixo 04)</th>
                <th className="p-3">Entregáveis Pendentes (Eixo 05)</th>
                <th className="p-3 text-center">Tempo Futuro (Minutos)</th>
                <th className="p-3 text-right">Carga Semanal (Horas)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {calculoPassivoFuturo.pacientesDetalhados.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition-all">
                  <td className="p-3 font-bold text-white flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-indigo-400" />
                    {p.nomePaciente}
                  </td>
                  <td className="p-3 text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-emerald-400" />
                      {p.servicoContratado}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">
                    <div className="space-y-0.5">
                      {p.entregaveisPendentes.map((ent, i) => (
                        <span key={i} className="block text-[10px] text-slate-300 flex items-center gap-1">
                          <PackageCheck className="h-3 w-3 text-amber-400" />
                          {ent}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 text-center font-bold font-mono text-amber-400">
                    {p.tempoFuturoMinutosSemana} min/sem
                  </td>
                  <td className="p-3 text-right font-bold font-mono text-emerald-400">
                    {p.tempoFuturoHorasSemana}h / sem
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Resumo do Passivo Técnico */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Pacientes Ativos Mapeados</span>
            <span className="text-base font-extrabold text-white">{calculoPassivoFuturo.totalPacientesAtivos} pacientes</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Tempo Futuro Total Comprometido</span>
            <span className="text-base font-extrabold text-amber-400 font-mono">
              {calculoPassivoFuturo.totalMinutosSemanaComprometidos} min ({calculoPassivoFuturo.totalHorasSemanaComprometidas}h/sem)
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Consumo Mensal de Agenda</span>
            <span className="text-base font-extrabold text-emerald-400 font-mono">
              ~{calculoPassivoFuturo.totalHorasMesComprometidas}h / mês
            </span>
          </div>
        </div>
      </div>

      {/* ── SEÇÃO 4: GRADEADOR TÁTICO ANALÍTICO DA AGENDA (100% NEUTRO) ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock className="h-4 w-4 text-emerald-400" />
          4. Gradeador Tático da Agenda &amp; Teto Físico de Capacidade ($N_&#123;\max&#125;$)
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Consolidação analítica neutra do saldo de horas disponíveis e teto físico máximo de pacientes ativos sem extrapolar a grade.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400">Horas Clínicas Dedicadas</span>
            <p className="text-xl font-extrabold text-emerald-400 font-mono">{horasPorDominio.tecnico || 30}h / semana</p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400">Janela Livre para Novos Atendimentos</span>
            <p className="text-xl font-extrabold text-indigo-400 font-mono">
              ~{calculoPassivoFuturo.janelaLivreHorasSemana}h / semana
            </p>
          </div>

          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-1 text-center">
            <span className="text-[10px] font-bold uppercase text-emerald-400">Teto Físico de Pacientes (N max)</span>
            <p className="text-xl font-extrabold text-emerald-300 font-mono">
              {calculoPassivoFuturo.tetoFisicoPacientes} pacientes ativos
            </p>
          </div>
        </div>
      </div>

      {/* Botão de Avanço */}
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
          Salvar Mapeamento da Agenda e Avançar para Equipe (Eixo 07)
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
