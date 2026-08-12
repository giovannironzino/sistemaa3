// Fase05Flow.tsx
// Eixo 05 — Entrega & Retenção do Paciente / Sucesso do Cliente.
// 5 Seções Analíticas e Operacionais com Linguagem Simples, Perguntas SIM/NÃO e Trava em 30%.

import React, { useState, useMemo } from 'react';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { PackageCheck, CheckCircle2, ArrowRight, Sparkles, Users, MessageSquare, ShieldAlert, HeartHandshake, Stethoscope, FileSpreadsheet, Clock, UserCheck } from 'lucide-react';
import { CATALOGO_20_ENTREGAVEIS, CATALOGO_RITOS_RETENCAO_CS, ExecutorEntregavel } from './catalogo20Entregaveis';
import { calcularRetencaoECarga, EstadoEntregavelItem, EstadoRitoRetencaoItem } from './lib/calcularRetencaoECarga';

interface Fase05FlowProps {
  uid: string;
  initialState?: any;
  pacientesEixo01Count?: number;
  servicosEixo04?: Array<{ id?: string; nome?: string; titulo?: string }>;
  onAvancarEixo06?: () => void;
}

export default function Fase05Flow({
  uid,
  initialState,
  pacientesEixo01Count = 38,
  servicosEixo04 = [],
  onAvancarEixo06,
}: Fase05FlowProps) {
  // Lista de Serviços do Eixo 04 para Vínculo
  const listaServicos = useMemo(() => {
    if (servicosEixo04.length > 0) {
      return servicosEixo04.map((s, idx) => ({
        id: s.id || `serv_${idx}`,
        nome: s.nome || s.titulo || `Serviço ${idx + 1}`,
      }));
    }
    return [
      { id: 'serv_1', nome: 'Consulta Avulsa + Retorno' },
      { id: 'serv_2', nome: 'Programa Nutricional Trimestral' },
      { id: 'serv_3', nome: 'Plano Semestral de Performance' },
    ];
  }, [servicosEixo04]);

  // Estado dos 20 Entregáveis Clínicos
  const [estadoEntregaveis, setEstadoEntregaveis] = useState<Record<string, EstadoEntregavelItem>>(() => {
    const init: Record<string, EstadoEntregavelItem> = {};
    CATALOGO_20_ENTREGAVEIS.forEach((item) => {
      const salvo = initialState?.estadoEntregaveis?.[item.id];
      init[item.id] = {
        ativo: salvo?.ativo ?? true,
        servicosEixo04Ids: salvo?.servicosEixo04Ids ?? listaServicos.map((s) => s.id),
        tipoEntrega: salvo?.tipoEntrega ?? 'personalizada',
        frequenciaMensal: salvo?.frequenciaMensal ?? item.frequenciaPadraoMensal,
        duracaoMinutos: salvo?.duracaoMinutos ?? item.duracaoMinutosPadrao,
        executor: salvo?.executor ?? item.executorDefault,
      };
    });
    return init;
  });

  // Estado dos Ritos de Retenção & CS (Perguntas SIM / NÃO)
  const [estadoRitos, setEstadoRitos] = useState<Record<string, EstadoRitoRetencaoItem>>(() => {
    const init: Record<string, EstadoRitoRetencaoItem> = {};
    CATALOGO_RITOS_RETENCAO_CS.forEach((rito) => {
      const salvo = initialState?.estadoRitos?.[rito.id];
      init[rito.id] = {
        pratica: salvo?.pratica ?? (rito.id === 'rito_busca_ativa' || rito.id === 'rito_ultima_figurinha'),
        servicosEixo04Ids: salvo?.servicosEixo04Ids ?? listaServicos.map((s) => s.id),
        frequenciaMensal: salvo?.frequenciaMensal ?? rito.frequenciaPadraoMensal,
        duracaoMinutos: salvo?.duracaoMinutos ?? rito.duracaoMinutosPadrao,
        executor: salvo?.executor ?? rito.executorDefault,
      };
    });
    return init;
  });

  // Estado da Comunidade no WhatsApp & Desafios
  const [temComunidade, setTemComunidade] = useState<boolean>(
    () => initialState?.temComunidade ?? true
  );
  const [temDesafio21, setTemDesafio21] = useState<boolean>(
    () => initialState?.temDesafio21 ?? false
  );

  // Estado da Rede Multidisciplinar
  const [enviaRelatoriosMedicos, setEnviaRelatoriosMedicos] = useState<boolean>(
    () => initialState?.enviaRelatoriosMedicos ?? true
  );
  const [registraCasosRaros, setRegistraCasosRaros] = useState<boolean>(
    () => initialState?.registraCasosRaros ?? true
  );

  const [salvo, setSalvo] = useState(false);

  // Motor de Cálculo
  const analise = useMemo(() => {
    return calcularRetencaoECarga(estadoEntregaveis, estadoRitos, pacientesEixo01Count, 55);
  }, [estadoEntregaveis, estadoRitos, pacientesEixo01Count]);

  function toggleEntregavelAtivo(id: string) {
    setEstadoEntregaveis((prev) => ({
      ...prev,
      [id]: { ...prev[id], ativo: !prev[id]?.ativo },
    }));
  }

  function handleEntregavelChange(id: string, patch: Partial<EstadoEntregavelItem>) {
    setEstadoEntregaveis((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...patch },
    }));
  }

  function handleRitoPraticaChange(id: string, pratica: boolean) {
    setEstadoRitos((prev) => ({
      ...prev,
      [id]: { ...prev[id], pratica },
    }));
  }

  function handleRitoPatchChange(id: string, patch: Partial<EstadoRitoRetencaoItem>) {
    setEstadoRitos((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...patch },
    }));
  }

  async function handleSalvarEixo05() {
    setSalvo(true);
    try {
      const docRef = doc(db, 'clientes_a3', uid);
      await setDoc(
        docRef,
        {
          fase05: {
            estadoEntregaveis,
            estadoRitos,
            temComunidade,
            temDesafio21,
            enviaRelatoriosMedicos,
            registraCasosRaros,
            analiseConsolidada: analise,
            atualizadoEm: new Date().toISOString(),
          },
        },
        { merge: true }
      );
    } catch (err) {
      console.error('Erro ao salvar Eixo 05:', err);
    }
    setTimeout(() => setSalvo(false), 2000);
    if (onAvancarEixo06) onAvancarEixo06();
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-12" id="fase05_entrega_rotina">
      {/* HEADER DA FASE 05 */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <PackageCheck className="h-4 w-4 text-emerald-400" />
          <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
            Eixo 05 · Entrega &amp; Retenção do Paciente (Sucesso do Cliente)
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white">Rotina de Acompanhamento &amp; Retenção do Paciente</h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          Mapeie os entregáveis operacionais do seu acompanhamento clínico, os ritos de Sucesso do Cliente e o tempo técnico consumido por paciente para calcular sua <strong>Taxa de Retenção Efetiva</strong> e alimentar os Eixos 06, 07, 08 e 09.
        </p>
      </div>

      {/* ── SEÇÃO 1: 📋 O CHECKLIST DOS 20 ENTREGÁVEIS CLÍNICOS POR PRODUTO ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            1. Os 20 Entregáveis da Sua Rotina Clínica (Vinculados ao Eixo 04)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Selecione quais dos 20 pontos de contato você entrega aos seus pacientes, em quais produtos eles ocorrem e quanto tempo exigem.
          </p>
        </div>

        <div className="space-y-3">
          {CATALOGO_20_ENTREGAVEIS.map((item) => {
            const est = estadoEntregaveis[item.id] || {
              ativo: true,
              servicosEixo04Ids: listaServicos.map((s) => s.id),
              tipoEntrega: 'personalizada',
              frequenciaMensal: item.frequenciaPadraoMensal,
              duracaoMinutos: item.duracaoMinutosPadrao,
              executor: item.executorDefault,
            };

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all ${
                  est.ativo
                    ? 'bg-slate-950/90 border-slate-800'
                    : 'bg-slate-950/40 border-slate-900 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <label className="flex items-start gap-3 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={est.ativo}
                      onChange={() => toggleEntregavelAtivo(item.id)}
                      className="mt-1 h-4 w-4 rounded border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">{item.titulo}</span>
                      <span className="text-[11px] text-slate-400 block leading-relaxed">{item.descricao}</span>
                    </div>
                  </label>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${
                      est.executor === 'expert'
                        ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                        : est.executor === 'equipe'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                    }`}
                  >
                    {est.executor === 'expert' ? '👤 Expert' : est.executor === 'equipe' ? '👥 Equipe' : '🤖 Sistema'}
                  </span>
                </div>

                {/* Configurações Expandidas se Ativo */}
                {est.ativo && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        Formato da Entrega:
                      </label>
                      <select
                        value={est.tipoEntrega}
                        onChange={(e) =>
                          handleEntregavelChange(item.id, {
                            tipoEntrega: e.target.value as 'padrao' | 'personalizada',
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-semibold focus:border-emerald-500"
                      >
                        <option value="personalizada">🎨 Personalizada Individual</option>
                        <option value="padrao">⚙️ Padrão / Automatizada</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        Executor Principal:
                      </label>
                      <select
                        value={est.executor}
                        onChange={(e) =>
                          handleEntregavelChange(item.id, {
                            executor: e.target.value as ExecutorEntregavel,
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-semibold focus:border-emerald-500"
                      >
                        <option value="expert">👤 Nutricionista Principal (Expert)</option>
                        <option value="equipe">👥 Equipe de Apoio (Nutrianjos/Secretária)</option>
                        <option value="sistema">🤖 Sistema / App Automático</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        Tempo por Atendimento (Minutos):
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          value={est.duracaoMinutos}
                          onChange={(e) =>
                            handleEntregavelChange(item.id, {
                              duracaoMinutos: parseInt(e.target.value, 10) || 1,
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-emerald-400 font-bold text-right focus:border-emerald-500"
                        />
                        <span className="text-[10px] text-slate-400 shrink-0">min/paciente</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SEÇÃO 2: 👥 COMUNIDADE & EFEITO TRIBO NO WHATSAPP ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Users className="h-4 w-4 text-emerald-400" />
          2. Comunidade Ativa &amp; Efeito Tribo (O Poder do Pertencimento)
        </h2>
        <p className="text-xs text-slate-400">
          Estudos clínicos mostram que o sentimento de pertencimento a um grupo atenuador de ansiedade mantém o paciente engajado e renovando o contrato mesmo quando ele atrasa o envio da dieta.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={() => setTemComunidade(!temComunidade)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              temComunidade
                ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold block">💬 Possuo Comunidade Ativa de Pacientes</span>
              {temComunidade && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              Grupo no WhatsApp/Telegram onde os pacientes compartilham pratos, treinos e incentivos.
            </span>
          </div>

          <div
            onClick={() => setTemDesafio21(!temDesafio21)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              temDesafio21
                ? 'bg-indigo-500/10 border-indigo-500/40 text-white'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold block">🏆 Realizo Desafios Internos (21 Dias)</span>
              {temDesafio21 && <CheckCircle2 className="h-4 w-4 text-indigo-400" />}
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              Campanhas periódicas de hábitos simples na comunidade para engajamento e constância.
            </span>
          </div>
        </div>
      </div>

      {/* ── SEÇÃO 3: 🕵️ RITOS DE RETENÇÃO ATIVA & CS (PERGUNTAS SIM / NÃO) ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <HeartHandshake className="h-4 w-4 text-emerald-400" />
            3. Ritos de Retenção Ativa &amp; Sucesso do Cliente (CS)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Responda <strong>SIM</strong> ou <strong>NÃO</strong> para cada rito de retenção. Caso não os pratique hoje, o sistema registrará a oportunidade silenciosamente sem travar o seu avanço.
          </p>
        </div>

        <div className="space-y-3">
          {CATALOGO_RITOS_RETENCAO_CS.map((rito) => {
            const est = estadoRitos[rito.id] || {
              pratica: false,
              servicosEixo04Ids: listaServicos.map((s) => s.id),
              frequenciaMensal: rito.frequenciaPadraoMensal,
              duracaoMinutos: rito.duracaoMinutosPadrao,
              executor: rito.executorDefault,
            };

            return (
              <div
                key={rito.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="space-y-0.5 max-w-xl">
                    <span className="text-xs font-bold text-white block">{rito.titulo}</span>
                    <span className="text-[11px] text-slate-400 block leading-relaxed">
                      {rito.subtitulo}
                    </span>
                    <span className="text-[10px] text-indigo-300 block font-semibold">
                      💡 Insight A3: {rito.insightDisruptivo}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleRitoPraticaChange(rito.id, true)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        est.pratica
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      ☑️ SIM
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRitoPraticaChange(rito.id, false)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        !est.pratica
                          ? 'bg-slate-800 text-slate-300 border border-slate-700'
                          : 'bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      ❌ NÃO
                    </button>
                  </div>
                </div>

                {/* Detalhamento Condicional se SIM */}
                {est.pratica && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        Executor do Rito:
                      </label>
                      <select
                        value={est.executor}
                        onChange={(e) =>
                          handleRitoPatchChange(rito.id, {
                            executor: e.target.value as ExecutorEntregavel,
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-semibold focus:border-emerald-500"
                      >
                        <option value="equipe">👥 Equipe de Apoio / CS Dedicado</option>
                        <option value="expert">👤 Nutricionista Principal (Expert)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        Duração Média (Minutos):
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          value={est.duracaoMinutos}
                          onChange={(e) =>
                            handleRitoPatchChange(rito.id, {
                              duracaoMinutos: parseInt(e.target.value, 10) || 1,
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-emerald-400 font-bold text-right focus:border-emerald-500"
                        />
                        <span className="text-[10px] text-slate-400 shrink-0">min/ocorrência</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SEÇÃO 4: 🩺 REDE MULTIDISCIPLINAR & TRACKER CLÍNICO ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-emerald-400" />
          4. Rede de Relacionamento Multidisciplinar &amp; Prova Social Técnica
        </h2>
        <p className="text-xs text-slate-400">
          Mapeie o relacionamento com médicos endocrinologistas, médicos do esporte, personal trainers e psicólogos parceiros (dados integrados aos Eixos 01 e 02).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={() => setEnviaRelatoriosMedicos(!enviaRelatoriosMedicos)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              enviaRelatoriosMedicos
                ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold block">📄 Relatórios de Mão Dupla para Médicos/Parceiros</span>
              {enviaRelatoriosMedicos && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              Envio de relatórios técnicos de evolução para endocrinologistas e personais para recomendação recíproca.
            </span>
          </div>

          <div
            onClick={() => setRegistraCasosRaros(!registraCasosRaros)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              registraCasosRaros
                ? 'bg-indigo-500/10 border-indigo-500/40 text-white'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold block">🎯 Tracker Clínico de Casos Raros (Conteúdo Sniper)</span>
              {registraCasosRaros && <CheckCircle2 className="h-4 w-4 text-indigo-400" />}
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              Documentação padronizada de atendimentos atípicos para gerar prova social de altíssima autoridade.
            </span>
          </div>
        </div>
      </div>

      {/* ── SEÇÃO 5: 📊 PAINEL CONSOLIDADO DE CARGA HORÁRIA & RETENÇÃO (TRAVA ≤ 30%) ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-1">
            <Clock className="h-3 w-3 text-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase">
              Consolidação Eixo 05 ➔ Eixos 06, 07, 08 &amp; 09
            </span>
          </div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            5. Painel Consolidado de Carga Horária &amp; Retenção Efetiva
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Resultados calculados 100% automaticamente sem digitações suplementares, respeitando a trava rigorosa de 30% para o Score de Estrutura.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 block text-[11px]">Tempo Técnico por Paciente:</span>
            <span className="font-mono text-emerald-400 font-bold text-lg">
              {analise.tempoTotalEntregaMinutosMensalPorPaciente} min / mês
            </span>
            <span className="text-[10px] text-slate-500 block">Exigido pelos entregáveis ativos</span>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-400 block text-[11px]">Carga Horária Mensal Total (Eixo 06):</span>
            <span className="font-mono text-indigo-400 font-bold text-lg">
              {analise.tempoTotalEntregaHorasMensalConsultorio} horas / mês
            </span>
            <span className="text-[10px] text-slate-500 block">
              Para a base de {pacientesEixo01Count} pacientes
            </span>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-emerald-500/30 space-y-1 bg-emerald-500/5">
            <span className="text-emerald-300 block text-[11px]">Score de Estrutura de Retenção:</span>
            <span className="font-mono text-emerald-300 font-bold text-lg">
              +{analise.scoreEstruturaRetencaoPercentual}%
            </span>
            <span className="text-[10px] text-emerald-400 block font-normal">
              🔒 Trava rigorosa em no máximo 30%
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div>
            <span className="text-white font-bold block">Taxa de Retenção Efetiva Estimada (Eixo 09):</span>
            <span className="text-[11px] text-slate-400">
              55% (Renovação Histórica Base Eixo 01) + {analise.scoreEstruturaRetencaoPercentual}% (Estrutura Eixo 05)
            </span>
          </div>
          <span className="font-mono text-emerald-400 font-extrabold text-xl">
            {analise.taxaRetencaoEfetivaPercentual}% de Retenção
          </span>
        </div>

        {/* BOTÃO SALVAR E AVANÇAR */}
        <div className="pt-4 flex justify-end">
          <button
            type="button"
            onClick={handleSalvarEixo05}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            {salvo ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Salvo com Sucesso!</span>
              </>
            ) : (
              <>
                <span>Salvar &amp; Avançar para o Eixo 06 (Agenda)</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
