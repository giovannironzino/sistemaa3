// Fase05Flow.tsx
// Eixo 05 — Entrega & Retenção do Paciente / Sucesso do Cliente.
// Reorganizado em 6 Etapas Racionais da Jornada do Paciente com a Matriz de Quantidades por Produto do Eixo 04.

import React, { useState, useMemo } from 'react';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { PackageCheck, CheckCircle2, ArrowRight, Sparkles, Users, MessageSquare, ShieldAlert, HeartHandshake, Stethoscope, FileSpreadsheet, Clock, UserCheck, ChevronDown, ChevronUp, Calculator, Layers, Sparkle } from 'lucide-react';
import { CATALOGO_20_ENTREGAVEIS, CATALOGO_RITOS_RETENCAO_CS, ExecutorEntregavel, StatusOpcaoEntregavel } from './catalogo20Entregaveis';
import { calcularRetencaoECarga, EstadoEntregavelItem, EstadoRitoRetencaoItem, ConfigProdutoEntrega } from './lib/calcularRetencaoECarga';

interface Fase05FlowProps {
  uid: string;
  initialState?: any;
  pacientesEixo01Count?: number;
  servicosEixo04?: Array<{ id?: string; nome?: string; titulo?: string; duracaoMeses?: number }>;
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
        duracaoMeses: s.duracaoMeses || (idx === 0 ? 1 : idx === 1 ? 3 : 12),
      }));
    }
    return [
      { id: 'serv_1', nome: 'Consulta Avulsa + Retorno', duracaoMeses: 1 },
      { id: 'serv_2', nome: 'Programa Nutricional Trimestral', duracaoMeses: 3 },
      { id: 'serv_3', nome: 'Plano Semestral de Performance', duracaoMeses: 6 },
    ];
  }, [servicosEixo04]);

  // Estado dos 20 Entregáveis Clínicos
  const [estadoEntregaveis, setEstadoEntregaveis] = useState<Record<string, EstadoEntregavelItem>>(() => {
    const init: Record<string, EstadoEntregavelItem> = {};
    CATALOGO_20_ENTREGAVEIS.forEach((item) => {
      const salvo = initialState?.estadoEntregaveis?.[item.id];
      const configPorProdutoInit: Record<string, ConfigProdutoEntrega> = {};

      listaServicos.forEach((s) => {
        const salvoProd = salvo?.configPorProduto?.[s.id];
        configPorProdutoInit[s.id] = {
          ativo: salvoProd?.ativo ?? true,
          quantidadeNoContrato: salvoProd?.quantidadeNoContrato ?? (s.duracaoMeses * item.frequenciaPadraoMensal),
          duracaoMinutos: salvoProd?.duracaoMinutos ?? item.duracaoMinutosPadrao,
          mesesContrato: s.duracaoMeses,
        };
      });

      init[item.id] = {
        status: salvo?.status ?? (salvo?.ativo ? 'sim' : 'sim'),
        servicosEixo04Ids: salvo?.servicosEixo04Ids ?? listaServicos.map((s) => s.id),
        tipoEntrega: salvo?.tipoEntrega ?? 'personalizada',
        frequenciaMensal: salvo?.frequenciaMensal ?? item.frequenciaPadraoMensal,
        duracaoMinutos: salvo?.duracaoMinutos ?? item.duracaoMinutosPadrao,
        executor: salvo?.executor ?? item.executorDefault,
        configPorProduto: configPorProdutoInit,
      };
    });
    return init;
  });

  // Estado dos Ritos de Retenção & CS
  const [estadoRitos, setEstadoRitos] = useState<Record<string, EstadoRitoRetencaoItem>>(() => {
    const init: Record<string, EstadoRitoRetencaoItem> = {};
    CATALOGO_RITOS_RETENCAO_CS.forEach((rito) => {
      const salvo = initialState?.estadoRitos?.[rito.id];
      init[rito.id] = {
        status: salvo?.status ?? (salvo?.pratica ? 'sim' : 'nao'),
        servicosEixo04Ids: salvo?.servicosEixo04Ids ?? listaServicos.map((s) => s.id),
        frequenciaMensal: salvo?.frequenciaMensal ?? rito.frequenciaPadraoMensal,
        duracaoMinutos: salvo?.duracaoMinutos ?? rito.duracaoMinutosPadrao,
        executor: salvo?.executor ?? rito.executorDefault,
      };
    });
    return init;
  });

  // Comunidade & Rede Multidisciplinar
  const [temComunidade, setTemComunidade] = useState<boolean>(() => initialState?.temComunidade ?? true);
  const [temDesafio21, setTemDesafio21] = useState<boolean>(() => initialState?.temDesafio21 ?? false);
  const [enviaRelatoriosMedicos, setEnviaRelatoriosMedicos] = useState<boolean>(() => initialState?.enviaRelatoriosMedicos ?? true);
  const [registraCasosRaros, setRegistraCasosRaros] = useState<boolean>(() => initialState?.registraCasosRaros ?? true);

  const [salvo, setSalvo] = useState(false);
  const [itemExpandidoId, setItemExpandidoId] = useState<string | null>(null);

  // Motor de Cálculo
  const analise = useMemo(() => {
    return calcularRetencaoECarga(estadoEntregaveis, estadoRitos, pacientesEixo01Count, 55);
  }, [estadoEntregaveis, estadoRitos, pacientesEixo01Count]);

  function handleEntregavelStatusChange(id: string, status: StatusOpcaoEntregavel) {
    setEstadoEntregaveis((prev) => ({
      ...prev,
      [id]: { ...prev[id], status },
    }));
    if (status === 'sim' || status === 'nao_faco_quero_fazer') {
      setItemExpandidoId(id);
    } else {
      setItemExpandidoId(null);
    }
  }

  function handleEntregavelPatch(id: string, patch: Partial<EstadoEntregavelItem>) {
    setEstadoEntregaveis((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...patch },
    }));
  }

  function handleConfigProdutoChange(entregavelId: string, produtoId: string, patch: Partial<ConfigProdutoEntrega>) {
    setEstadoEntregaveis((prev) => {
      const atual = prev[entregavelId];
      const configAtual = atual?.configPorProduto?.[produtoId] || {
        ativo: true,
        quantidadeNoContrato: 1,
        duracaoMinutos: 15,
      };
      return {
        ...prev,
        [entregavelId]: {
          ...atual,
          configPorProduto: {
            ...atual.configPorProduto,
            [produtoId]: { ...configAtual, ...patch },
          },
        },
      };
    });
  }

  function handleConcluirEProximo(atualId: string) {
    const idx = CATALOGO_20_ENTREGAVEIS.findIndex((i) => i.id === atualId);
    if (idx >= 0 && idx < CATALOGO_20_ENTREGAVEIS.length - 1) {
      const proximo = CATALOGO_20_ENTREGAVEIS[idx + 1];
      setItemExpandidoId(proximo.id);
    } else {
      setItemExpandidoId(null);
    }
  }

  function handleRitoStatusChange(id: string, status: StatusOpcaoEntregavel) {
    setEstadoRitos((prev) => ({
      ...prev,
      [id]: { ...prev[id], status },
    }));
    if (status === 'sim' || status === 'nao_faco_quero_fazer') {
      setItemExpandidoId(id);
    } else {
      setItemExpandidoId(null);
    }
  }

  function handleRitoPatch(id: string, patch: Partial<EstadoRitoRetencaoItem>) {
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

  // Agrupa os 20 entregáveis por Etapa Racional
  const entregaveisPorEtapa = useMemo(() => {
    const res: Record<string, typeof CATALOGO_20_ENTREGAVEIS> = {
      '1_onboarding': [],
      '2_acompanhamento_diario': [],
      '3_comunidade': [],
      '6_renovacao_painel': [],
    };
    CATALOGO_20_ENTREGAVEIS.forEach((item) => {
      if (res[item.etapaRacional]) {
        res[item.etapaRacional].push(item);
      }
    });
    return res;
  }, []);

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
        <h1 className="text-2xl font-bold text-white">Jornada Racional de Acompanhamento &amp; Retenção</h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          Defina a quantidade de entregas diretamente dentro de cada produto do Eixo 04. Selecione <strong>SIM</strong>, <strong>NÃO FAÇO, MAS QUERO FAZER</strong> ou <strong>NÃO</strong> para visualizar a carga horária ao vivo.
        </p>
      </div>

      {/* ── ETAPA 1: 🚀 BOAS-VINDAS & ONBOARDING ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            Etapa 1: 🚀 Boas-Vindas &amp; Onboarding (A Primeira Impressão)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Mapeie o alinhamento pós-venda, envio de aplicativos e boas-vindas do paciente.
          </p>
        </div>
        <div className="space-y-3">
          {entregaveisPorEtapa['1_onboarding'].map((item) => renderCardEntregavel(item))}
        </div>
      </div>

      {/* ── ETAPA 2: 🍏 ACOMPANHAMENTO TÉCNICO DIÁRIO ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Etapa 2: 🍏 Acompanhamento Técnico Diário (A Entrega da Dieta &amp; Suporte)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Check-ins, biofeedback, cardápios flexíveis, exames e respostas rápidas no WhatsApp.
          </p>
        </div>
        <div className="space-y-3">
          {entregaveisPorEtapa['2_acompanhamento_diario'].map((item) => renderCardEntregavel(item))}
        </div>
      </div>

      {/* ── ETAPA 3: 👥 ENGAJAMENTO DA COMUNIDADE & EFEITO TRIBO ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-400" />
            Etapa 3: 👥 Engajamento da Comunidade &amp; Efeito Tribo (WhatsApp &amp; Desafios)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            O sentimento de pertencimento a um grupo mantém o paciente ativo mesmo quando atrasa a dieta.
          </p>
        </div>
        <div className="space-y-3">
          {entregaveisPorEtapa['3_comunidade'].map((item) => renderCardEntregavel(item))}
        </div>
      </div>

      {/* ── ETAPA 4: 🕵️ RITOS DE RETENÇÃO ATIVA, CS & RESGATE ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <HeartHandshake className="h-4 w-4 text-emerald-400" />
            Etapa 4: 🕵️ Ritos de Retenção Ativa &amp; Sucesso do Cliente (CS)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Busca ativa de sumidos, regra da última figurinha, resgate telefônico de cancelamentos e metas extra-nutricionais.
          </p>
        </div>

        <div className="space-y-3">
          {CATALOGO_RITOS_RETENCAO_CS.map((rito) => {
            const est = estadoRitos[rito.id] || {
              status: 'nao',
              servicosEixo04Ids: listaServicos.map((s) => s.id),
              frequenciaMensal: rito.frequenciaPadraoMensal,
              duracaoMinutos: rito.duracaoMinutosPadrao,
              executor: rito.executorDefault,
            };

            const isExpandido = itemExpandidoId === rito.id;
            const eAtivo = est.status === 'sim' || est.status === 'nao_faco_quero_fazer';

            return (
              <div
                key={rito.id}
                className={`rounded-xl border transition-all overflow-hidden ${
                  eAtivo ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-950/40 border-slate-900 opacity-70'
                }`}
              >
                <div className="p-4 flex items-start justify-between gap-3 flex-wrap">
                  <div className="space-y-0.5 max-w-xl flex-1">
                    <span className="text-xs font-bold text-white block">{rito.titulo}</span>
                    <span className="text-[11px] text-slate-400 block leading-relaxed">{rito.subtitulo}</span>
                    <span className="text-[10px] text-indigo-300 block font-semibold">💡 Insight: {rito.insightDisruptivo}</span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                    <button
                      type="button"
                      onClick={() => handleRitoStatusChange(rito.id, 'sim')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        est.status === 'sim'
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      ☑️ SIM
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRitoStatusChange(rito.id, 'nao_faco_quero_fazer')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        est.status === 'nao_faco_quero_fazer'
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-extrabold'
                          : 'bg-slate-900 border border-slate-800 text-amber-400/70 hover:text-amber-300'
                      }`}
                    >
                      💡 QUERO FAZER
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRitoStatusChange(rito.id, 'nao')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        est.status === 'nao'
                          ? 'bg-slate-800 text-slate-300 border border-slate-700'
                          : 'bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      ❌ NÃO
                    </button>

                    {eAtivo && (
                      <button
                        type="button"
                        onClick={() => setItemExpandidoId(isExpandido ? null : rito.id)}
                        className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer ml-1"
                      >
                        {isExpandido ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
                </div>

                {eAtivo && isExpandido && (
                  <div className="p-4 bg-slate-900/60 border-t border-slate-800/80 space-y-4 text-xs animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Executor do Rito:</label>
                        <select
                          value={est.executor}
                          onChange={(e) => handleRitoPatch(rito.id, { executor: e.target.value as ExecutorEntregavel })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-semibold focus:border-emerald-500"
                        >
                          <option value="equipe">👥 Equipe de Apoio / CS Dedicado</option>
                          <option value="expert">👤 Nutricionista Principal (Expert)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Duração Média (Minutos):</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            value={est.duracaoMinutos}
                            onChange={(e) => handleRitoPatch(rito.id, { duracaoMinutos: parseInt(e.target.value, 10) || 1 })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-emerald-400 font-bold text-right focus:border-emerald-500"
                          />
                          <span className="text-[10px] text-slate-400 shrink-0">min/ocorrência</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ETAPA 5: 🩺 REDE MULTIDISCIPLINAR DE SAÚDE & RECOMENDAÇÕES ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-emerald-400" />
          Etapa 5: 🩺 Rede Multidisciplinar de Saúde &amp; Recomendações (Integrado Eixos 01 &amp; 02)
        </h2>
        <p className="text-xs text-slate-400">
          Relacionamento técnico com endocrinologistas, médicos do esporte, personais e psicólogos parceiros.
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

      {/* ── ETAPA 6: 📊 RITOS DE RENOVAÇÃO & PAINEL CONSOLIDADO ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            Etapa 6: 📊 Ritos de Renovação &amp; Painel Consolidado do Eixo 05
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            NPS, Dossiê de Evolução, Renovação Consultiva e consolidação de dados para os Eixos 06, 07, 08 e 09.
          </p>
        </div>

        <div className="space-y-3">
          {entregaveisPorEtapa['6_renovacao_painel'].map((item) => renderCardEntregavel(item))}
        </div>

        {/* PAINEL CONSOLIDADO */}
        <div className="mt-6 pt-6 border-t border-slate-800 space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <Clock className="h-3 w-3 text-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase">
              Consolidação Eixo 05 ➔ Eixos 06, 07, 08 &amp; 09
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-semibold">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[11px]">Tempo Ponderado por Paciente:</span>
              <span className="font-mono text-emerald-400 font-bold text-lg">
                {analise.tempoTotalEntregaMinutosMensalPorPaciente} min / mês
              </span>
              <span className="text-[10px] text-slate-500 block">Pelo mix real de produtos</span>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[11px]">Carga Mensal Total (Eixo 06):</span>
              <span className="font-mono text-indigo-400 font-bold text-lg">
                {analise.tempoTotalEntregaHorasMensalConsultorio} horas / mês
              </span>
              <span className="text-[10px] text-slate-500 block">Base de {pacientesEixo01Count} pac</span>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[11px]">Metas de Expansão:</span>
              <span className="font-mono text-amber-400 font-bold text-lg">
                {analise.itensQueroFazerCount} itens
              </span>
              <span className="text-[10px] text-slate-500 block">Marcados "Quero Fazer"</span>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-emerald-500/30 space-y-1 bg-emerald-500/5">
              <span className="text-emerald-300 block text-[11px]">Score de Estrutura:</span>
              <span className="font-mono text-emerald-300 font-bold text-lg">
                +{analise.scoreEstruturaRetencaoPercentual}%
              </span>
              <span className="text-[10px] text-emerald-400 block font-normal">
                🔒 Trava de no máximo 30%
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
    </div>
  );

  // Helper para renderizar cada card dos 20 entregáveis com a Mini-Tabela de Produtos do Eixo 04
  function renderCardEntregavel(item: typeof CATALOGO_20_ENTREGAVEIS[0]) {
    const est = estadoEntregaveis[item.id] || {
      status: 'sim',
      servicosEixo04Ids: listaServicos.map((s) => s.id),
      tipoEntrega: 'personalizada',
      frequenciaMensal: item.frequenciaPadraoMensal,
      duracaoMinutos: item.duracaoMinutosPadrao,
      executor: item.executorDefault,
    };

    const isExpandido = itemExpandidoId === item.id;
    const eAtivo = est.status === 'sim' || est.status === 'nao_faco_quero_fazer';

    return (
      <div
        key={item.id}
        className={`rounded-xl border transition-all overflow-hidden ${
          eAtivo
            ? est.status === 'nao_faco_quero_fazer'
              ? 'bg-amber-950/20 border-amber-500/30'
              : 'bg-slate-950/90 border-slate-800'
            : 'bg-slate-950/40 border-slate-900 opacity-70'
        }`}
      >
        <div className="p-4 flex items-start justify-between gap-3 flex-wrap">
          <div className="space-y-0.5 max-w-xl flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-white block">{item.titulo}</span>
              <span
                className={`px-2 py-0.5 rounded text-[9px] font-bold border shrink-0 ${
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
            <span className="text-[11px] text-slate-400 block leading-relaxed">{item.descricao}</span>
          </div>

          {/* 3 Botões de Escolha */}
          <div className="flex items-center gap-1.5 flex-wrap shrink-0">
            <button
              type="button"
              onClick={() => handleEntregavelStatusChange(item.id, 'sim')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                est.status === 'sim'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              ☑️ SIM
            </button>

            <button
              type="button"
              onClick={() => handleEntregavelStatusChange(item.id, 'nao_faco_quero_fazer')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                est.status === 'nao_faco_quero_fazer'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-extrabold'
                  : 'bg-slate-900 border border-slate-800 text-amber-400/70 hover:text-amber-300'
              }`}
            >
              💡 QUERO FAZER
            </button>

            <button
              type="button"
              onClick={() => handleEntregavelStatusChange(item.id, 'nao')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                est.status === 'nao'
                  ? 'bg-slate-800 text-slate-300 border border-slate-700'
                  : 'bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
            >
              ❌ NÃO
            </button>

            {eAtivo && (
              <button
                type="button"
                onClick={() => setItemExpandidoId(isExpandido ? null : item.id)}
                className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer ml-1"
              >
                {isExpandido ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Bloco Expandido com a Mini-Tabela de Produtos do Eixo 04 */}
        {eAtivo && isExpandido && (
          <div className="p-4 bg-slate-900/60 border-t border-slate-800/80 space-y-4 text-xs animate-fade-in">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-indigo-400" />
                Matriz de Quantidade de Entregas por Produto do Eixo 04:
              </label>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 bg-slate-900/80">
                      <th className="p-2.5">Produto do Eixo 04</th>
                      <th className="p-2.5 text-center">Ativo?</th>
                      <th className="p-2.5 text-center">Qtd no Contrato</th>
                      <th className="p-2.5 text-center">Duração (Min)</th>
                      <th className="p-2.5 text-right">Total no Ciclo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-xs font-medium">
                    {listaServicos.map((s) => {
                      const cfg = est.configPorProduto?.[s.id] || {
                        ativo: true,
                        quantidadeNoContrato: s.duracaoMeses * item.frequenciaPadraoMensal,
                        duracaoMinutos: item.duracaoMinutosPadrao,
                      };
                      const totalMin = cfg.ativo ? cfg.quantidadeNoContrato * cfg.duracaoMinutos : 0;

                      return (
                        <tr key={s.id} className="hover:bg-slate-900/50 transition-all">
                          <td className="p-2.5 font-bold text-white flex items-center gap-2">
                            <span>🏷️ {s.nome}</span>
                            <span className="text-[10px] text-slate-400 font-normal">({s.duracaoMeses}m)</span>
                          </td>
                          <td className="p-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={cfg.ativo}
                              onChange={(e) =>
                                handleConfigProdutoChange(item.id, s.id, { ativo: e.target.checked })
                              }
                              className="h-3.5 w-3.5 rounded border-slate-700 text-indigo-500 focus:ring-0 cursor-pointer"
                            />
                          </td>
                          <td className="p-2.5 text-center">
                            <input
                              type="number"
                              min={1}
                              disabled={!cfg.ativo}
                              value={cfg.quantidadeNoContrato}
                              onChange={(e) =>
                                handleConfigProdutoChange(item.id, s.id, {
                                  quantidadeNoContrato: parseInt(e.target.value, 10) || 1,
                                })
                              }
                              className="w-16 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-emerald-400 font-bold text-center focus:border-emerald-500 disabled:opacity-40"
                            />
                          </td>
                          <td className="p-2.5 text-center">
                            <input
                              type="number"
                              min={1}
                              disabled={!cfg.ativo}
                              value={cfg.duracaoMinutos}
                              onChange={(e) =>
                                handleConfigProdutoChange(item.id, s.id, {
                                  duracaoMinutos: parseInt(e.target.value, 10) || 1,
                                })
                              }
                              className="w-16 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-amber-400 font-bold text-center focus:border-emerald-500 disabled:opacity-40"
                            />
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold">
                            {cfg.ativo ? (
                              <span className="text-emerald-400 text-xs">
                                {totalMin} min ({(totalMin / 60).toFixed(1)}h)
                              </span>
                            ) : (
                              <span className="text-slate-600 text-xs">Inativo</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Executor e Botão Concluir & Próximo */}
            <div className="flex items-center justify-between flex-wrap gap-3 pt-1 border-t border-slate-800/60">
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Executor Principal:</label>
                <select
                  value={est.executor}
                  onChange={(e) => handleEntregavelPatch(item.id, { executor: e.target.value as ExecutorEntregavel })}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white font-semibold focus:border-emerald-500"
                >
                  <option value="expert">👤 Nutricionista Principal (Expert)</option>
                  <option value="equipe">👥 Equipe de Apoio (Nutrianjos/Secretária)</option>
                  <option value="sistema">🤖 Sistema / App Automático</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => handleConcluirEProximo(item.id)}
                className="px-3.5 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-extrabold rounded-lg text-[11px] transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <span>Concluir &amp; Próximo</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
}
