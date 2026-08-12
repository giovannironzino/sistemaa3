// SimuladorCardsFlow.tsx
// Mesa de Controle Viva — Orquestrador interativo dos 6 Cards do Eixo 09.

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  Users,
  ArrowUpRight,
  RefreshCw,
  ShoppingBag,
  UserCheck,
  Bookmark,
  Star,
  Plus,
  Minus,
  Check,
  HelpCircle,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

import type {
  SimuladorState,
  ResultadoSimulado,
  ResumoSimulacaoEixo09,
  Fase09Assumptions,
  OfertaEcossistema,
  PresetDistribuicaoId,
  DistribuicaoServico,
} from '../eixo09.types';

import type { ContextoFasesAnteriores, ServicoSimplificado } from '../lib/obterContextoFasesAnteriores';
import { calcularResultadoSimulacao } from '../lib/calcularResultadoSimulacao';
import {
  guardarSimulacaoFase09,
  listarSimulacoesGuardadas,
  alternarFavoritaSimulacao,
} from '../lib/eixo09Service';
import { obterDatasA3 } from '../../../lib/dateUtils';

interface SimuladorCardsFlowProps {
  uid: string;
  contexto: ContextoFasesAnteriores;
  initialState: SimuladorState;
  onSalvarPremissas: (premissas: Fase09Assumptions) => void;
}

export default function SimuladorCardsFlow({
  uid,
  contexto,
  initialState,
  onSalvarPremissas,
}: SimuladorCardsFlowProps) {
  const [state, setState] = useState<SimuladorState>(initialState);
  const datas = useMemo(() => obterDatasA3(null), []);
  const [simulacoesGuardadas, setSimulacoesGuardadas] = useState<ResumoSimulacaoEixo09[]>([]);
  const [modalGuardarAberto, setModalGuardarAberto] = useState(false);
  const [nomeCustomSimulacao, setNomeCustomSimulacao] = useState('');
  const [feedbackMensagem, setFeedbackMensagem] = useState<string | null>(null);
  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);

  // Recarrega simulações salvas ao abrir o componente
  React.useEffect(() => {
    (async () => {
      const lista = await listarSimulacoesGuardadas(uid);
      setSimulacoesGuardadas(lista);
    })();
  }, [uid]);

  // Atualizador de premissas com persistência
  const updatePremissas = (novasPremissas: Partial<Fase09Assumptions>) => {
    setState((prev) => {
      const nextPremissas = { ...prev.premissas, ...novasPremissas, atualizadoEm: new Date().toISOString() };
      onSalvarPremissas(nextPremissas);
      return { ...prev, premissas: nextPremissas };
    });
  };

  // Cálculo ao vivo do ResultadoSimulado
  const resultado: ResultadoSimulado = useMemo(() => {
    return calcularResultadoSimulacao(state, contexto);
  }, [state, contexto]);

  // Variaveis de População
  const baseAtivosAtual = contexto.baseAtivosAtual;
  const servicosComPacientesAtivos = contexto.servicos.filter((s) => s.pacientesAtivosVigentes > 0);

  // Pacientes saindo (Card 2)
  const baseAntigosRestante = state.card2Ativo && baseAtivosAtual > 0
    ? Math.floor(baseAtivosAtual * (1 - (state.taxaSaidaEsperadaPercentual || 0) / 100))
    : baseAtivosAtual;
  const baseSaindo = baseAtivosAtual - baseAntigosRestante;

  // Handlers para Card 1 Presets
  const handleAplicarPresetCard1 = (preset: PresetDistribuicaoId) => {
    const totalNovos = state.novosPacientesQuantidade;
    if (contexto.servicos.length === 0 || totalNovos === 0) {
      setState((prev) => ({
        ...prev,
        novosPacientesPreset: preset,
        novosPacientesDistribuicao: [],
      }));
      return;
    }

    let dist: DistribuicaoServico[] = [];
    if (preset === 'foco_carro_chefe') {
      const carroChefe = contexto.servicos[0]; // primeiro serviço
      const countCarroChefe = Math.ceil(totalNovos * 0.8);
      const restante = Math.max(0, totalNovos - countCarroChefe);

      dist.push({ servicoId: carroChefe.id, quantidade: countCarroChefe });
      if (contexto.servicos.length > 1 && restante > 0) {
        dist.push({ servicoId: contexto.servicos[1].id, quantidade: restante });
      }
    } else if (preset === 'equilibrado') {
      const perService = Math.floor(totalNovos / contexto.servicos.length);
      let sobrou = totalNovos - perService * contexto.servicos.length;
      dist = contexto.servicos.map((s, idx) => ({
        servicoId: s.id,
        quantidade: perService + (idx === 0 ? sobrou : 0),
      }));
    } else {
      dist = contexto.servicos.map((s) => ({ servicoId: s.id, quantidade: 0 }));
    }

    setState((prev) => ({
      ...prev,
      novosPacientesPreset: preset,
      novosPacientesDistribuicao: dist,
    }));
  };

  // Guardar Simulação
  const handleConfirmarGuardar = async () => {
    const resumoSalvo = await guardarSimulacaoFase09(
      uid,
      nomeCustomSimulacao,
      state,
      resultado
    );
    setModalGuardarAberto(false);
    setNomeCustomSimulacao('');
    setSimulacoesGuardadas((prev) => [resumoSalvo, ...prev]);
    setFeedbackMensagem(`Simulação "${resumoSalvo.nomeExibicao}" guardada com sucesso!`);
    setTimeout(() => setFeedbackMensagem(null), 4000);
  };

  // Favoritar
  const handleToggleFavorita = async (simId: string, atualFav: boolean) => {
    const res = await alternarFavoritaSimulacao(uid, simId, atualFav, simulacoesGuardadas);
    if (res.sucesso) {
      setSimulacoesGuardadas((prev) =>
        prev.map((s) => (s.id === simId ? { ...s, favorita: !atualFav } : s))
      );
    } else if (res.mensagem) {
      alert(res.mensagem);
    }
  };

  // 1-Click Presets de Cenários Rápidos
  const handleAplicarCenarioConservador = () => {
    setState((prev) => ({
      ...prev,
      card1Ativo: true,
      novosPacientesQuantidade: 4,
      card2Ativo: false,
      card3Ativo: false,
      card5ApoioComercialAtivo: true,
      card5MelhoraConversaoPercentual: 15,
      card6Ativo: true,
      quantidadeResgatar: Math.max(5, Math.floor((contexto.totalPacientesInativos || 10) * 0.3)),
      taxaSucessoPercentual: 20,
    }));
    setFeedbackMensagem('🟢 Cenário Conservador Aplicado: Foco em melhorar a conversão do WhatsApp e resgatar pacientes inativos com R$ 0 em anúncios!');
    setTimeout(() => setFeedbackMensagem(null), 5000);
  };

  const handleAplicarCenarioModerado = () => {
    setState((prev) => ({
      ...prev,
      card1Ativo: true,
      novosPacientesQuantidade: 6,
      card2Ativo: true,
      reajusteValorReais: 50,
      taxaSaidaEsperadaPercentual: 5,
      card3Ativo: true,
      quantidadeMigrar: Math.max(2, Math.floor(contexto.baseAtivosAtual * 0.2)),
      card5ApoioComercialAtivo: false,
      card6Ativo: true,
      quantidadeResgatar: Math.max(3, Math.floor((contexto.totalPacientesInativos || 10) * 0.2)),
      taxaSucessoPercentual: 15,
    }));
    setFeedbackMensagem('🔵 Cenário Moderado Aplicado: Ajuste moderado no preço do acompanhamento e migração de 20% da base para planos longos!');
    setTimeout(() => setFeedbackMensagem(null), 5000);
  };

  const handleAplicarCenarioArrojado = () => {
    setState((prev) => ({
      ...prev,
      card1Ativo: true,
      novosPacientesQuantidade: 10,
      card2Ativo: true,
      reajusteValorReais: 100,
      taxaSaidaEsperadaPercentual: 10,
      card3Ativo: true,
      quantidadeMigrar: Math.max(5, Math.floor(contexto.baseAtivosAtual * 0.35)),
      card5ApoioOperacionalAtivo: true,
      card5CustoOperacionalReais: 1800,
      card5HorasAbsorvidasOperacional: 30,
      card6Ativo: true,
      quantidadeResgatar: Math.max(8, Math.floor((contexto.totalPacientesInativos || 10) * 0.4)),
      taxaSucessoPercentual: 25,
    }));
    setFeedbackMensagem('🚀 Cenário Arrojado Aplicado: Aceleração com apoio de equipe assistente, foco em produto High-Ticket e escala comercial!');
    setTimeout(() => setFeedbackMensagem(null), 5000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8" id="mesa_controle_viva">
      {/* ---------------------------------------------------------------- */}
      {/* ATALHOS DE CENÁRIOS PRONTOS COM 1 CLIQUE                         */}
      {/* ---------------------------------------------------------------- */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 font-label flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Cenários Prontos com 1 Clique
          </span>
          <span className="text-[10px] text-slate-500">Escolha um atalho para preencher os controles automaticamente</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={handleAplicarCenarioConservador}
            className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-left hover:bg-emerald-500/20 transition-all cursor-pointer space-y-1"
          >
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              🟢 Conservador
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Melhora conversão do WhatsApp e resgata pacientes sumidos com R$ 0 em anúncios.
            </p>
          </button>

          <button
            type="button"
            onClick={handleAplicarCenarioModerado}
            className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-left hover:bg-blue-500/20 transition-all cursor-pointer space-y-1"
          >
            <div className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
              🔵 Moderado
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Reajuste suave de R$ 50 no valor da consulta e migração de 20% da base para planos longos.
            </p>
          </button>

          <button
            type="button"
            onClick={handleAplicarCenarioArrojado}
            className="p-3.5 rounded-xl border border-purple-500/30 bg-purple-500/10 text-left hover:bg-purple-500/20 transition-all cursor-pointer space-y-1"
          >
            <div className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
              🚀 Arrojado
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Contrata assistente para liberar 15h de agenda e acelera a venda do produto High-Ticket.
            </p>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* DASHBOARD DE RESULTADO AO VIVO (PAINEL SUPERIOR)                  */}
      {/* ---------------------------------------------------------------- */}
      <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-xl sticky top-4 z-30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 uppercase tracking-wider font-label">
              <Sparkles className="h-3 w-3" /> Mesa de Controle Viva
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              Resultado em Tempo Real
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn_abrir_historico"
              onClick={() => setModalHistoricoAberto(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Bookmark className="h-3.5 w-3.5 text-indigo-400" />
              Guardadas ({simulacoesGuardadas.length})
            </button>

            <button
              type="button"
              id="btn_guardar_simulacao"
              onClick={() => setModalGuardarAberto(true)}
              className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl"
            >
              <Bookmark className="h-3.5 w-3.5" />
              Guardar esta simulação
            </button>
          </div>
        </div>

        {/* Feedback Temporário */}
        {feedbackMensagem && (
          <div className="mb-4 px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-300 flex items-center justify-between animate-fade-in">
            <span>{feedbackMensagem}</span>
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          </div>
        )}

        {/* 2 Indicadores Principais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Indicador 1: Lucro Limpo */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              resultado.bateuNumeroMagico
                ? 'bg-emerald-500/10 border-emerald-500/40'
                : 'bg-red-500/10 border-red-500/30'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300 font-label">Lucro Líquido Simulado</span>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  resultado.bateuNumeroMagico
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {resultado.bateuNumeroMagico ? 'Meta Atingida ✓' : 'Abaixo da Meta'}
              </span>
            </div>
            <div className="text-2xl font-black text-white font-mono">
              R$ {resultado.lucroLiquidoSimulado.toLocaleString('pt-BR')}
              <span className="text-xs font-normal text-slate-400 ml-1">/mês</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>Meta (Número Mágico):</span>
              <span className="font-bold text-slate-200">
                R$ {state.numeroMagico.toLocaleString('pt-BR')}
              </span>
            </div>
          </div>

          {/* Indicador 2: Carga Horária */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              resultado.respeitouTetoSemanaPerfeita
                ? 'bg-emerald-500/10 border-emerald-500/40'
                : 'bg-red-500/10 border-red-500/30'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300 font-label">Carga Horária Semanal</span>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  resultado.respeitouTetoSemanaPerfeita
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {resultado.respeitouTetoSemanaPerfeita ? 'Dentro do Teto ✓' : 'Excede Teto'}
              </span>
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {resultado.cargaHorariaSemanalExigida}
              <span className="text-xs font-normal text-slate-400 ml-1">horas / semana</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>Teto da Semana Perfeita:</span>
              <span className="font-bold text-slate-200">{state.tetoSemanaPerfeita} hrs/sem</span>
            </div>
          </div>
        </div>

        {/* Métricas Auxiliares */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-white/10 text-xs">
          <div>
            <span className="text-slate-500 block">Vendas Brutas</span>
            <span className="font-bold text-slate-200 font-mono">
              R$ {resultado.receitaSimuladaMensal.toLocaleString('pt-BR')}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Leads Necessários</span>
            <span className="font-bold text-indigo-300 font-mono">
              {resultado.leadsNecessariosMes} / mês
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Total Pacientes</span>
            <span className="font-bold text-slate-200 font-mono">
              {resultado.totalPacientesSimulados}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Custos Entrega + Fixos</span>
            <span className="font-bold text-slate-400 font-mono">
              R$ {(resultado.custoEntregaTotalReais + contexto.custosFixosTotais).toLocaleString('pt-BR')}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 italic mt-3 text-center">
          "Esse é o ritmo mensal que, se mantido, sustenta sua meta ao longo dos seus próximos 90 dias."
        </p>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* OS 6 CARDS DO SIMULADOR                                          */}
      {/* ---------------------------------------------------------------- */}

      {/* ================================================================ */}
      {/* CARD 1 — Novos Pacientes (Sempre visível)                         */}
      {/* ================================================================ */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5" id="card1_novos_pacientes">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-indigo-400" />
                Atendimento de Novos Pacientes
              </h3>
              <p className="text-xs text-slate-400">
                Simule trazer novos pacientes para o seu consultório.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id="toggle_card1"
              checked={state.card1Ativo}
              onChange={(e) => setState((prev) => ({ ...prev, card1Ativo: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {state.card1Ativo && (
          <div className="space-y-4 pt-2 border-t border-white/5">
            {/* Quantidade Novos Pacientes */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-black/30 border border-white/5">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  Quantos novos pacientes você quer fechar este mês?
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Custo de entrega + tempo técnico calculado via premissa.
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  id="btn_card1_minus"
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      novosPacientesQuantidade: Math.max(0, prev.novosPacientesQuantidade - 1),
                    }))
                  }
                  className="h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-xl font-bold text-white font-mono min-w-[32px] text-center">
                  {state.novosPacientesQuantidade}
                </span>
                <button
                  type="button"
                  id="btn_card1_plus"
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      novosPacientesQuantidade: prev.novosPacientesQuantidade + 1,
                    }))
                  }
                  className="h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Histórico real de leads do Eixo 02 — só aparece se existirem dados */}
            {contexto.leadsMensaisMedia > 0 && (
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-start gap-3 text-xs">
                <TrendingUp className="h-4 w-4 text-emerald-400 mt-0.5 flex-none" />
                <div>
                  <span className="text-slate-200 font-semibold block">
                    Seu histórico real (Eixo 02): cerca de{' '}
                    <strong className="text-emerald-400">{Math.round(contexto.leadsMensaisMedia)} pessoas</strong>{' '}
                    entraram em contato com você por mês nos últimos 3 meses.
                  </span>
                  {resultado.leadsNecessariosMes > 0 && (
                    <span className={`mt-1 block font-semibold ${
                      resultado.leadsNecessariosMes <= contexto.leadsMensaisMedia
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}>
                      {resultado.leadsNecessariosMes <= contexto.leadsMensaisMedia
                        ? `✓ Sua meta de ${state.novosPacientesQuantidade} novos pacientes cabe no fluxo atual de contatos.`
                        : `⚠ Sua meta exige ${resultado.leadsNecessariosMes} contatos/mês — ${resultado.leadsNecessariosMes - Math.round(contexto.leadsMensaisMedia)} a mais do que o seu histórico. Considere aumentar a captação.`
                      }
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Presets de Distribuição */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300">
                Como distribuir esses pacientes entre os seus serviços?
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'foco_carro_chefe', label: 'Foco no Carro-Chefe (80%)' },
                  { id: 'equilibrado', label: 'Equilibrado' },
                  { id: 'personalizado', label: 'Personalizado' },
                ].map((preset) => {
                  const isSelected = state.novosPacientesPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      id={`preset_${preset.id}`}
                      onClick={() => handleAplicarPresetCard1(preset.id as PresetDistribuicaoId)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        isSelected
                          ? 'bg-indigo-500/20 border-indigo-500 text-white'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Customização se preset == 'personalizado' */}
            {state.novosPacientesPreset === 'personalizado' && contexto.servicos.length > 0 && (
              <div className="space-y-2 p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="text-xs font-semibold text-slate-300 block">
                  Defina a quantidade de pacientes por serviço:
                </span>
                {contexto.servicos.map((srv) => {
                  const distAtual = state.novosPacientesDistribuicao.find((d) => d.servicoId === srv.id);
                  const qtd = distAtual ? distAtual.quantidade : 0;
                  return (
                    <div key={srv.id} className="flex items-center justify-between text-xs py-1">
                      <span className="text-slate-300">{srv.nomeComercial} (R$ {srv.precoVenda})</span>
                      <input
                        type="number"
                        min="0"
                        value={qtd}
                        onChange={(e) => {
                          const v = Math.max(0, Number(e.target.value));
                          setState((prev) => {
                            const newDist = [...prev.novosPacientesDistribuicao];
                            const idx = newDist.findIndex((d) => d.servicoId === srv.id);
                            if (idx >= 0) newDist[idx].quantidade = v;
                            else newDist.push({ servicoId: srv.id, quantidade: v });
                            const sumNew = newDist.reduce((a, b) => a + b.quantidade, 0);
                            return {
                              ...prev,
                              novosPacientesQuantidade: sumNew,
                              novosPacientesDistribuicao: newDist,
                            };
                          });
                        }}
                        className="w-16 px-2 py-1 rounded bg-black border border-white/10 text-white font-mono text-center font-bold"
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tradução ao vivo */}
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 leading-relaxed">
              💡 <strong>Tradução ao vivo:</strong> Trazer {state.novosPacientesQuantidade} novos pacientes exige cerca de{' '}
              <strong>
                {((state.novosPacientesQuantidade * (state.premissas.minutosPacienteNovo ?? 90)) / 60).toFixed(1)} horas
              </strong>{' '}
              no mês e necessita de cerca de <strong>{resultado.leadsNecessariosMes} leads</strong> qualificados.
            </div>
          </div>
        )}
      </div>

      {/* ================================================================ */}
      {/* CARD 1B — Indicação Orgânica (Depende de Base_Ativos_Atual > 0)    */}
      {/* ================================================================ */}
      {baseAtivosAtual > 0 && (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5" id="card1b_indicacao">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                1B
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="h-4 w-4 text-indigo-400" />
                  Indicação Orgânica da Base Atual
                </h3>
                <p className="text-xs text-slate-400">
                  Pacientes satisfeitos costumam indicar novos clientes sem custo de captação.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="toggle_card1b"
                checked={state.card1BAtivo}
                onChange={(e) => setState((prev) => ({ ...prev, card1BAtivo: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {state.card1BAtivo && (
            <div className="space-y-4 pt-2 border-t border-white/5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-black/30 border border-white/5">
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">
                    Quantas indicações você estima receber este mês?
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Pacientes indicados não consomem leads no funil de captação.
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    id="btn_card1b_minus"
                    onClick={() =>
                      setState((prev) => ({
                        ...prev,
                        indicacaoQuantidade: Math.max(0, prev.indicacaoQuantidade - 1),
                      }))
                    }
                    className="h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-xl font-bold text-white font-mono min-w-[32px] text-center">
                    {state.indicacaoQuantidade}
                  </span>
                  <button
                    type="button"
                    id="btn_card1b_plus"
                    onClick={() =>
                      setState((prev) => ({
                        ...prev,
                        indicacaoQuantidade: prev.indicacaoQuantidade + 1,
                      }))
                    }
                    className="h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                🌱 <strong>Consequência:</strong> Se {state.indicacaoQuantidade} pessoas indicarem 1 paciente novo cada, isso soma renda limpa no seu bolso sem precisar de nenhum lead pago novo para isso.
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* CARD 2 — Reajuste da Base (Depende de Base_Ativos_Atual > 0)      */}
      {/* ================================================================ */}
      {baseAtivosAtual > 0 && (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5" id="card2_reajuste_base">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-indigo-400" />
                  Reajuste de Quem Já É Paciente
                </h3>
                <p className="text-xs text-slate-400">
                  Simule o impacto de reajustar o preço da sua mensalidade/ticket para a base atual ({baseAtivosAtual} ativos).
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="toggle_card2"
                checked={state.card2Ativo}
                onChange={(e) => setState((prev) => ({ ...prev, card2Ativo: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {state.card2Ativo && (
            <div className="space-y-4 pt-2 border-t border-white/5">
              {/* Valor do Reajuste em Reais */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-black/30 border border-white/5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">
                    Aumento por paciente (R$):
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
                    <input
                      type="number"
                      id="input_reajuste_reais"
                      value={state.reajusteValorReais || ''}
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          reajusteValorReais: Math.max(0, Number(e.target.value)),
                        }))
                      }
                      placeholder="50"
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white font-bold text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Comparação ao Vivo */}
                <div className="flex flex-col justify-center text-xs text-slate-300 bg-white/5 p-3 rounded-lg border border-white/5">
                  <span>
                    Ticket Atual: <strong>R$ {Math.round(contexto.ticketMedioAtual)}</strong>
                  </span>
                  <span>
                    Preço Novo:{' '}
                    <strong className="text-emerald-400">
                      R$ {Math.round(contexto.ticketMedioAtual + state.reajusteValorReais)}
                    </strong>
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    Aumento de{' '}
                    {contexto.ticketMedioAtual > 0
                      ? ((state.reajusteValorReais / contexto.ticketMedioAtual) * 100).toFixed(1)
                      : 0}
                    %
                  </span>
                </div>
              </div>

              {/* Slider de Taxa de Saída Esperada */}
              <div className="space-y-2 p-4 rounded-xl bg-black/30 border border-white/5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-200">Taxa de Saída Esperada (Churn)</span>
                  <span className="font-bold text-indigo-400 font-mono">
                    {state.taxaSaidaEsperadaPercentual}% ({baseSaindo} pacientes saindo)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  id="slider_taxa_saida"
                  value={state.taxaSaidaEsperadaPercentual}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      taxaSaidaEsperadaPercentual: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-indigo-500 bg-slate-700 h-2 rounded-lg cursor-pointer"
                />
              </div>

              {/* Premissa embutida: Comunidade Ativa */}
              {state.premissas.temComunidadeAtiva === null ? (
                <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs space-y-2">
                  <p className="font-semibold text-indigo-300 flex items-center gap-1.5">
                    <HelpCircle className="h-3.5 w-3.5" /> Você tem uma comunidade ativa com seus pacientes (grupo de WhatsApp, etc.)?
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => updatePremissas({ temComunidadeAtiva: true })}
                      className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs"
                    >
                      Sim
                    </button>
                    <button
                      type="button"
                      onClick={() => updatePremissas({ temComunidadeAtiva: false })}
                      className="px-4 py-1.5 rounded-lg bg-white/10 text-slate-300 font-bold text-xs"
                    >
                      Não
                    </button>
                  </div>
                </div>
              ) : state.premissas.temComunidadeAtiva ? (
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
                  💬 <em>Nota:</em> Pacientes com comunidade ativa costumam sair menos — leve isso em conta ao escolher sua taxa de saída esperada.
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* CARD 3 — Migração de Planos (Depende de serviço com ativos > 0)    */}
      {/* ================================================================ */}
      {servicosComPacientesAtivos.length > 0 && (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5" id="card3_migracao_planos">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4 text-indigo-400" />
                  Migração de Planos (Troca de Estabilidade)
                </h3>
                <p className="text-xs text-slate-400">
                  Migre pacientes da sua base atual para planos mais longos.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="toggle_card3"
                checked={state.card3Ativo}
                onChange={(e) => setState((prev) => ({ ...prev, card3Ativo: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {state.card3Ativo && (
            <div className="space-y-4 pt-2 border-t border-white/5">
              {/* Seleção do Plano Origem e Destino */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Plano Origem (com pacientes ativos):
                  </label>
                  <select
                    id="select_plano_origem"
                    value={state.planoOrigemServicoId || ''}
                    onChange={(e) => {
                      const id = e.target.value;
                      const srv = servicosComPacientesAtivos.find((s) => s.id === id);
                      const maxPossible = srv ? srv.pacientesAtivosVigentes : 0;
                      setState((prev) => ({
                        ...prev,
                        planoOrigemServicoId: id,
                        quantidadeMigrar: Math.min(prev.quantidadeMigrar, maxPossible),
                      }));
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Selecione um plano de origem...</option>
                    {servicosComPacientesAtivos.map((srv) => (
                      <option key={srv.id} value={srv.id}>
                        {srv.nomeComercial} ({srv.pacientesAtivosVigentes} ativos - R$ {srv.precoVenda})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Plano Destino (maior duração / premium):
                  </label>
                  <select
                    id="select_plano_destino"
                    value={state.planoDestinoServicoId || ''}
                    onChange={(e) =>
                      setState((prev) => ({ ...prev, planoDestinoServicoId: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Selecione o plano destino...</option>
                    {contexto.servicos.map((srv) => (
                      <option key={srv.id} value={srv.id}>
                        {srv.nomeComercial} (R$ {srv.precoVenda})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quantidade a Migrar (Limitado ao máximo do plano origem) */}
              {state.planoOrigemServicoId && (
                <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2">
                  {(() => {
                    const srvOrigem = servicosComPacientesAtivos.find(
                      (s) => s.id === state.planoOrigemServicoId
                    );
                    const maxCount = srvOrigem ? srvOrigem.pacientesAtivosVigentes : 0;

                    return (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-200">
                          Quantos pacientes de <strong>{srvOrigem?.nomeComercial}</strong> você quer migrar? (máx {maxCount}):
                        </span>
                        <input
                          type="number"
                          min="0"
                          max={maxCount}
                          id="input_quantidade_migrar"
                          value={state.quantidadeMigrar || ''}
                          onChange={(e) => {
                            const val = Math.max(0, Math.min(maxCount, Number(e.target.value)));
                            setState((prev) => ({ ...prev, quantidadeMigrar: val }));
                          }}
                          className="w-20 px-3 py-1.5 rounded bg-black border border-white/15 text-white font-mono font-bold text-center"
                        />
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Resultado ao vivo */}
              {state.planoDestinoServicoId && state.quantidadeMigrar > 0 && (
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
                  ✨ <strong>Troca de Estabilidade:</strong> Migrar {state.quantidadeMigrar} pacientes pro plano destino garante entrada recorrente no seu caixa com maior previsibilidade contratual.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* CARD 4A — Funil de Manutenção                                    */}
      {/* ================================================================ */}
      {((state.card2Ativo && baseSaindo > 0) || baseAtivosAtual > 0) && (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5" id="card4a_funil_manutencao">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                4A
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-indigo-400" />
                  Funil de Manutenção (Retenção Downsell)
                </h3>
                <p className="text-xs text-slate-400">
                  Um paciente que continua com você, mesmo pagando menos, é melhor do que um paciente que vai embora.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t border-white/5">
            {/* Linha 1: Manutenção pra quem sai do Card 2 */}
            {state.card2Ativo && baseSaindo > 0 && (
              <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      id="toggle_card4a_linha1"
                      checked={state.card4ALinha1Ativa}
                      onChange={(e) =>
                        setState((prev) => ({ ...prev, card4ALinha1Ativa: e.target.checked }))
                      }
                      className="rounded border-white/20 text-indigo-600 focus:ring-indigo-500 bg-black/50"
                    />
                    Oferecer plano de manutenção para quem iria cancelar ({baseSaindo} pessoas)
                  </label>
                </div>

                {state.card4ALinha1Ativa && (
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Taxa de Aceitação Esperada:</span>
                      <span className="font-bold text-indigo-400 font-mono">
                        {state.card4ALinha1TaxaAceitacaoPercentual}% (
                        {Math.ceil(baseSaindo * (state.card4ALinha1TaxaAceitacaoPercentual / 100))} pessoas)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      id="slider_card4a_linha1"
                      value={state.card4ALinha1TaxaAceitacaoPercentual}
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          card4ALinha1TaxaAceitacaoPercentual: Number(e.target.value),
                        }))
                      }
                      className="w-full accent-indigo-500 bg-slate-700 h-2 rounded-lg cursor-pointer"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Linha 2: Manutenção pra quem está de alta */}
            <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    id="toggle_card4a_linha2"
                    checked={state.card4ALinha2Ativa}
                    onChange={(e) =>
                      setState((prev) => ({ ...prev, card4ALinha2Ativa: e.target.checked }))
                    }
                    className="rounded border-white/20 text-indigo-600 focus:ring-indigo-500 bg-black/50"
                  />
                  Oferecer plano de manutenção para quem dá alta
                </label>
              </div>

              {state.card4ALinha2Ativa && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">Quantos pacientes você espera dar alta este mês?</span>
                    <input
                      type="number"
                      min="0"
                      id="input_alta_quantidade"
                      value={state.card4ALinha2PacientesDeAltaQuantidade || ''}
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          card4ALinha2PacientesDeAltaQuantidade: Math.max(0, Number(e.target.value)),
                        }))
                      }
                      placeholder="5"
                      className="w-20 px-3 py-1 rounded bg-black border border-white/15 text-white font-mono font-bold text-center"
                    />
                  </div>

                  {state.card4ALinha2PacientesDeAltaQuantidade > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Taxa de Aceitação da Alta:</span>
                        <span className="font-bold text-indigo-400 font-mono">
                          {state.card4ALinha2TaxaAceitacaoPercentual}% (
                          {Math.ceil(
                            state.card4ALinha2PacientesDeAltaQuantidade *
                              (state.card4ALinha2TaxaAceitacaoPercentual / 100)
                          )}{' '}
                          pessoas)
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        id="slider_card4a_linha2"
                        value={state.card4ALinha2TaxaAceitacaoPercentual}
                        onChange={(e) =>
                          setState((prev) => ({
                            ...prev,
                            card4ALinha2TaxaAceitacaoPercentual: Number(e.target.value),
                          }))
                        }
                        className="w-full accent-indigo-500 bg-slate-700 h-2 rounded-lg cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* CARD 4B — Produtos de Ecossistema (Depende de Base_Ativos_Atual > 0) */}
      {/* ================================================================ */}
      {baseAtivosAtual > 0 && (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5" id="card4b_ecossistema">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                4B
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-indigo-400" />
                  Produtos de Ecossistema (Cross-sell)
                </h3>
                <p className="text-xs text-slate-400">
                  Um paciente satisfeito muitas vezes topa comprar algo mais, além do acompanhamento principal.
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="toggle_card4b"
                checked={state.card4BAtivo}
                onChange={(e) => setState((prev) => ({ ...prev, card4BAtivo: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {state.card4BAtivo && (
            <div className="space-y-3 pt-2 border-t border-white/5">
              {state.card4BOfertas.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  Nenhum produto secundário cadastrado. Adicione um item de ecossistema abaixo.
                </div>
              ) : (
                state.card4BOfertas.map((oferta, idx) => (
                  <div
                    key={oferta.servicoId || idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-black/30 border border-white/5"
                  >
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {oferta.nomeExibicao}
                      </span>
                      <span className="text-[11px] text-slate-400 block font-mono">
                        Preço: R$ {oferta.precoUnitario}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-300">Estimativa de compradores:</span>
                      <input
                        type="number"
                        min="0"
                        id={`oferta_qtd_${idx}`}
                        value={oferta.quantidadeEstimada || ''}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value));
                          setState((prev) => {
                            const newOfertas = [...prev.card4BOfertas];
                            newOfertas[idx].quantidadeEstimada = val;
                            return { ...prev, card4BOfertas: newOfertas };
                          });
                        }}
                        className="w-16 px-2 py-1 rounded bg-black border border-white/15 text-white font-mono font-bold text-center text-xs"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* CARD 5 — Equipe de Apoio (3 escolhas agrupadas)                 */}
      {/* ================================================================ */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5" id="card5_equipe_apoio">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
            5
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-indigo-400" />
              Equipe de Apoio (Operacional, Comercial, Gestão)
            </h3>
            <p className="text-xs text-slate-400">
              Contratar ajuda para absorver rotina, impulsionar vendas ou gerenciar processos.
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-2 border-t border-white/5">
          {/* Opção A: Apoio Operacional */}
          <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-3">
            <label className="flex items-center gap-2.5 text-xs font-bold text-white cursor-pointer">
              <input
                type="checkbox"
                id="toggle_card5_operacional"
                checked={state.card5ApoioOperacionalAtivo}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, card5ApoioOperacionalAtivo: e.target.checked }))
                }
                className="rounded border-white/20 text-indigo-600 focus:ring-indigo-500 bg-black/50"
              />
              Apoio Operacional (Suporte / Produção)
            </label>

            {state.card5ApoioOperacionalAtivo && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">Horas Absorvidas/mês:</span>
                  <input
                    type="number"
                    min="0"
                    id="input_card5_horas_operacional"
                    value={state.card5HorasAbsorvidasOperacional || ''}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        card5HorasAbsorvidasOperacional: Math.max(0, Number(e.target.value)),
                      }))
                    }
                    className="w-full px-3 py-1.5 rounded bg-black border border-white/15 text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Custo Mensal (R$):</span>
                  <input
                    type="number"
                    min="0"
                    id="input_card5_custo_operacional"
                    value={state.card5CustoOperacionalReais || ''}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        card5CustoOperacionalReais: Math.max(0, Number(e.target.value)),
                      }))
                    }
                    className="w-full px-3 py-1.5 rounded bg-black border border-white/15 text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Gestão da Equipe (hrs/mês):</span>
                  <input
                    type="number"
                    min="0"
                    id="input_card5_horas_gestao_equipe"
                    value={state.card5HorasGestaoDaEquipe || ''}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        card5HorasGestaoDaEquipe: Math.max(0, Number(e.target.value)),
                      }))
                    }
                    className="w-full px-3 py-1.5 rounded bg-black border border-white/15 text-white font-mono font-bold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Opção B: Apoio Comercial */}
          <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-3">
            <label className="flex items-center gap-2.5 text-xs font-bold text-white cursor-pointer">
              <input
                type="checkbox"
                id="toggle_card5_comercial"
                checked={state.card5ApoioComercialAtivo}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, card5ApoioComercialAtivo: e.target.checked }))
                }
                className="rounded border-white/20 text-indigo-600 focus:ring-indigo-500 bg-black/50"
              />
              Apoio Comercial (Vendas / Closer)
            </label>

            {state.card5ApoioComercialAtivo && (
              <div className="space-y-3 pt-2 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block mb-1">Melhora na Conversão (%):</span>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      id="input_card5_melhora_conversao"
                      value={state.card5MelhoraConversaoPercentual || ''}
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          card5MelhoraConversaoPercentual: Math.max(0, Number(e.target.value)),
                        }))
                      }
                      placeholder="10"
                      className="w-full px-3 py-1.5 rounded bg-black border border-white/15 text-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-1">Custo Comercial (R$):</span>
                    <input
                      type="number"
                      min="0"
                      id="input_card5_custo_comercial"
                      value={state.card5CustoComercialReais || ''}
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          card5CustoComercialReais: Math.max(0, Number(e.target.value)),
                        }))
                      }
                      className="w-full px-3 py-1.5 rounded bg-black border border-white/15 text-white font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                  🎯 <strong>Impacto Comercial:</strong> Com a conversão subindo para{' '}
                  {(contexto.taxaConversaoGeral + state.card5MelhoraConversaoPercentual).toFixed(1)}%, você precisa de menos contatos mensais para bater a meta de novos pacientes no Card 1.
                </div>

                {/* Canais campeões do Eixo 02 — só exibe se existirem */}
                {contexto.canaisCampeoes.length > 0 && (
                  <div className="p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/20 text-xs space-y-1">
                    <span className="text-emerald-400 font-bold block">🏆 Seus Canais Campeões (Eixo 02 · Captação):</span>
                    <p className="text-slate-400">
                      Esses são os canais que mais converteram contatos em pacientes reais no seu histórico.
                      Priorize-os antes de investir em canais novos.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {contexto.canaisCampeoes.map((canal, i) => (
                        <span key={canal} className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold text-[10px]">
                          {i + 1}° {canal.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Opção C: Apoio de Gestão */}
          <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-3">
            <label className="flex items-center gap-2.5 text-xs font-bold text-white cursor-pointer">
              <input
                type="checkbox"
                id="toggle_card5_gestao"
                checked={state.card5ApoioGestaoAtivo}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, card5ApoioGestaoAtivo: e.target.checked }))
                }
                className="rounded border-white/20 text-indigo-600 focus:ring-indigo-500 bg-black/50"
              />
              Apoio de Gestão / Administrativo
            </label>

            {state.card5ApoioGestaoAtivo && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">Horas Libertas de Gestão (hrs/mês):</span>
                  <input
                    type="number"
                    min="0"
                    id="input_card5_horas_gestao_propria"
                    value={state.card5HorasAbsorvidasGestaoPropria || ''}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        card5HorasAbsorvidasGestaoPropria: Math.max(0, Number(e.target.value)),
                      }))
                    }
                    className="w-full px-3 py-1.5 rounded bg-black border border-white/15 text-white font-mono font-bold"
                  />
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Custo de Gestão (R$):</span>
                  <input
                    type="number"
                    min="0"
                    id="input_card5_custo_gestao"
                    value={state.card5CustoGestaoReais || ''}
                    onChange={(e) =>
                      setState((prev) => ({
                        ...prev,
                        card5CustoGestaoReais: Math.max(0, Number(e.target.value)),
                      }))
                    }
                    className="w-full px-3 py-1.5 rounded bg-black border border-white/15 text-white font-mono font-bold"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* CARD 6 — Resgate de Inativos                                     */}
      {/* ================================================================ */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5" id="card6_resgate_inativos">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
              6
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-indigo-400" />
                Resgate de Pacientes Inativos
              </h3>
              <p className="text-xs text-slate-400">
                Resgatar antigos pacientes que já conhecem e confiam no seu trabalho.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id="toggle_card6"
              checked={state.card6Ativo}
              onChange={(e) => setState((prev) => ({ ...prev, card6Ativo: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {/* Premissa embutida se totalPacientesInativos == null */}
        {state.premissas.totalPacientesInativos === null ? (
          <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs space-y-2">
            <p className="font-semibold text-indigo-300">
              Quantos pacientes já foram seus e não são mais ativos hoje, no total?
            </p>
            <div className="flex gap-3 items-center">
              <input
                type="number"
                min="0"
                id="input_total_inativos_premissa"
                placeholder="20"
                onBlur={(e) => {
                  const val = Math.max(0, Number(e.target.value));
                  updatePremissas({ totalPacientesInativos: val });
                }}
                className="w-24 px-3 py-1.5 rounded bg-black border border-white/15 text-white font-mono font-bold"
              />
              <span className="text-slate-400">pacientes inativos no total</span>
            </div>
          </div>
        ) : state.premissas.totalPacientesInativos > 0 && state.card6Ativo ? (
          <div className="space-y-4 pt-2 border-t border-white/5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-black/30 border border-white/5">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  Quantos inativos abordar (máx {state.premissas.totalPacientesInativos}):
                </span>
                <input
                  type="number"
                  min="0"
                  max={state.premissas.totalPacientesInativos}
                  id="input_quantidade_resgatar"
                  value={state.quantidadeResgatar || ''}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      quantidadeResgatar: Math.min(
                        prev.premissas.totalPacientesInativos || 0,
                        Math.max(0, Number(e.target.value))
                      ),
                    }))
                  }
                  className="w-full px-3 py-1.5 rounded bg-black border border-white/15 text-white font-mono font-bold text-sm mt-1"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Taxa de Sucesso Esperada:</span>
                  <span className="font-bold text-indigo-400 font-mono">
                    {state.taxaSucessoPercentual}% (
                    {Math.ceil(state.quantidadeResgatar * (state.taxaSucessoPercentual / 100))} resgatados)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  id="slider_taxa_sucesso_resgate"
                  value={state.taxaSucessoPercentual}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      taxaSucessoPercentual: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-indigo-500 bg-slate-700 h-2 rounded-lg cursor-pointer mt-2"
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* VEREDITO DO SIMULADOR — PLANO DE AÇÃO TÁTICO DE 90 DIAS          */}
      {/* ---------------------------------------------------------------- */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950/60 border border-indigo-500/40 rounded-2xl p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
            <CheckCircle2 className="h-5 w-5" />
            <span>📋 Veredito Executivo: Ritmo Operacional Semanal ({datas.intervaloProximos90Dias})</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            {resultado.bateuNumeroMagico ? 'Meta Viável ✓' : 'Necessita Ajuste em Alavanca'}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Para alcançar os <strong>R$ {resultado.lucroLiquidoSimulado.toLocaleString('pt-BR')}/mês</strong> de lucro líquido sem exceder o seu teto de <strong>{state.tetoSemanaPerfeita}h/semana</strong>, mantenha este ritmo tático no dia a dia:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">1. Meta Semanal de Vendas</span>
            <p className="text-base font-extrabold text-white">
              {Math.ceil(resultado.totalPacientesSimulados / 4)} novos contratos
            </p>
            <p className="text-[11px] text-slate-400">por semana</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">2. Meta no WhatsApp</span>
            <p className="text-base font-extrabold text-indigo-300">
              {Math.ceil(resultado.leadsNecessariosMes / 4)} interessados
            </p>
            <p className="text-[11px] text-slate-400">por semana (~{Math.ceil(resultado.leadsNecessariosMes / 20)}/dia útil)</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">3. Investimento Semanal</span>
            <p className="text-base font-extrabold text-teal-300">
              R$ {Math.round((contexto.custosFixosTotais > 0 ? contexto.custosFixosTotais : 1200) / 4)}
            </p>
            <p className="text-[11px] text-slate-400">por semana em mídia/anúncios</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">4. Teto de Atendimento</span>
            <p className="text-base font-extrabold text-emerald-400">
              {resultado.cargaHorariaSemanalExigida} horas
            </p>
            <p className="text-[11px] text-slate-400">máximo de consultas/semana</p>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* MODAL GUARDAR SIMULAÇÃO                                          */}
      {/* ---------------------------------------------------------------- */}
      {modalGuardarAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-white/15 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-indigo-400" /> Guardar esta Simulação
              </h3>
              <button
                type="button"
                onClick={() => setModalGuardarAberto(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Nome para esta simulação (opcional):
              </label>
              <input
                type="text"
                id="input_nome_simulacao"
                value={nomeCustomSimulacao}
                onChange={(e) => setNomeCustomSimulacao(e.target.value)}
                placeholder="Ex: Cenário Conservador 2026"
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-400">
                Se deixar em branco, usaremos automaticamente a data e hora atual.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalGuardarAberto(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                id="btn_confirmar_guardar_simulacao"
                onClick={handleConfirmarGuardar}
                className="btn-primary px-5 py-2 text-xs font-bold rounded-xl"
              >
                Guardar Agora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* MODAL HISTÓRICO DE SIMULAÇÕES                                    */}
      {/* ---------------------------------------------------------------- */}
      {modalHistoricoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-white/15 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between shrink-0">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-indigo-400" /> Simulações Guardadas ({simulacoesGuardadas.length})
              </h3>
              <button
                type="button"
                onClick={() => setModalHistoricoAberto(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 pr-1 flex-1">
              {simulacoesGuardadas.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  Nenhuma simulação guardada ainda. Guarde um cenário para revisão futura!
                </div>
              ) : (
                simulacoesGuardadas.map((sim) => (
                  <div
                    key={sim.id}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-4 hover:border-white/20 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{sim.nomeExibicao}</span>
                        {sim.favorita && (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                            ★ Favorita
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-3">
                        <span>Lucro: <strong className="text-emerald-400">R$ {sim.resultado.lucroLiquidoSimulado.toLocaleString('pt-BR')}</strong></span>
                        <span>Carga: <strong className="text-slate-200">{sim.resultado.cargaHorariaSemanalExigida} hrs/sem</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleFavorita(sim.id, sim.favorita)}
                        className={`p-2 rounded-lg border text-xs font-bold transition-all ${
                          sim.favorita
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-amber-300'
                        }`}
                        title={sim.favorita ? 'Remover dos favoritos' : 'Marcar como favorita (máx 3)'}
                      >
                        <Star className="h-4 w-4 fill-current" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setState(sim.estado);
                          setModalHistoricoAberto(false);
                          setFeedbackMensagem(`Cenário "${sim.nomeExibicao}" carregado no simulador!`);
                          setTimeout(() => setFeedbackMensagem(null), 3000);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/30 text-indigo-200 text-xs font-bold"
                      >
                        Carregar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end shrink-0 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setModalHistoricoAberto(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
