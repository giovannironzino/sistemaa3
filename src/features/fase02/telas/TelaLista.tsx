// TelaLista.tsx
// Painel Principal do Eixo 02 — Captação em TELA ÚNICA FLÚIDA.
// Reúne "Quais canais você usa para atrair pacientes?" e "Entrada de Leads" na MESMA tela.
// Exibe APENAS os canais selecionados pelo usuário em tempo real.

import React, { useState, useMemo } from 'react';
import { Plus, Sparkles, TrendingUp, Calendar, Pencil, Trash2, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { ContatoCaptacao, CanalOrigemId } from '../fase02.types';
import { CANAIS_ORIGEM, getLabelCanalById } from '../data/canaisOrigem';
import { getLabelById as getLabelClusterById } from '../../fase01/data/bancoDePromessas';
import { obterDatasA3 } from '../../../lib/dateUtils';

interface TelaListaProps {
  selectedDate: string;
  contactsForDate: ContatoCaptacao[];
  allContacts: ContatoCaptacao[];
  totalGeral: number;
  rangeStart: string;
  rangeEnd: string;
  confirmChecked: boolean;
  onToggleConfirm: () => void;
  onStartAdd: (mes?: string) => void;
  onEditar: (contato: ContatoCaptacao) => void;
  onExcluir: (id: string) => void;
  onConcluir: () => void;
  onBatchSaveCanalVolume?: (canaisVolumes: Array<{ canalOrigem: CanalOrigemId; totalContatos: number; convertidos: number }>) => void;
}

interface VolumeMensal {
  total: number;
  convertidos: number;
}

type MesKey = 'mes0' | 'mes1' | 'mes2';

export default function TelaLista({
  selectedDate,
  contactsForDate,
  allContacts,
  totalGeral,
  rangeStart,
  rangeEnd,
  confirmChecked,
  onToggleConfirm,
  onStartAdd,
  onEditar,
  onExcluir,
  onConcluir,
  onBatchSaveCanalVolume,
}: TelaListaProps) {
  const datas = useMemo(() => obterDatasA3(null), []);

  // 1. Canais selecionados pelo usuário (padrão: todos ou os que contêm contatos)
  const [canaisSelecionados, setCanaisSelecionados] = useState<Set<CanalOrigemId>>(() => {
    const usados = new Set<CanalOrigemId>(allContacts.map((c) => c.canalOrigem));
    return usados.size > 0 ? usados : new Set<CanalOrigemId>(['instagram_organico', 'indicacao_boca_a_boca']);
  });

  const [semHistorico, setSemHistorico] = useState(false);
  const [modoPreenchimento, setModoPreenchimento] = useState<'volume' | 'nominal'>('volume');

  // Estado dos blocos mensais no modo nominal
  const [openMeses, setOpenMeses] = useState<Record<string, boolean>>({
    [datas.mesM0]: true,
    [datas.mesM1]: true,
    [datas.mesM2]: true,
  });

  // Volumes por canal por mês (mes2: Maio, mes1: Junho, mes0: Julho)
  const [volumesMensais, setVolumesMensais] = useState<Record<CanalOrigemId, Record<MesKey, VolumeMensal>>>(() => {
    const init: Record<string, Record<MesKey, VolumeMensal>> = {};
    CANAIS_ORIGEM.forEach((c) => {
      init[c.id] = {
        mes0: { total: 0, convertidos: 0 },
        mes1: { total: 0, convertidos: 0 },
        mes2: { total: 0, convertidos: 0 },
      };
    });
    return init as Record<CanalOrigemId, Record<MesKey, VolumeMensal>>;
  });

  // Canais ativos selecionados pelo usuário
  const canaisAtivos = CANAIS_ORIGEM.filter((c) => canaisSelecionados.has(c.id));

  const meses: { key: MesKey; label: string }[] = [
    { key: 'mes2', label: datas.mesM2 },
    { key: 'mes1', label: datas.mesM1 },
    { key: 'mes0', label: datas.mesM0 },
  ];

  function toggleCanal(id: CanalOrigemId) {
    setCanaisSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleVolumeChange(canalId: CanalOrigemId, mes: MesKey, campo: 'total' | 'convertidos', valor: number) {
    setVolumesMensais((prev) => ({
      ...prev,
      [canalId]: {
        ...prev[canalId],
        [mes]: {
          ...prev[canalId][mes],
          [campo]: valor,
        },
      },
    }));
  }

  function handleConcluir() {
    if (onBatchSaveCanalVolume && modoPreenchimento === 'volume') {
      const payload: Array<{ canalOrigem: CanalOrigemId; totalContatos: number; convertidos: number }> = [];
      canaisAtivos.forEach(({ id }) => {
        const totalMeses = volumesMensais[id].mes0.total + volumesMensais[id].mes1.total + volumesMensais[id].mes2.total;
        const convMeses = volumesMensais[id].mes0.convertidos + volumesMensais[id].mes1.convertidos + volumesMensais[id].mes2.convertidos;
        if (totalMeses > 0) {
          payload.push({ canalOrigem: id, totalContatos: totalMeses, convertidos: convMeses });
        }
      });
      onBatchSaveCanalVolume(payload);
    }
    onConcluir();
  }

  const totalGeralVolume = useMemo(() => {
    let t = 0;
    canaisAtivos.forEach(({ id }) => {
      t += volumesMensais[id].mes0.total + volumesMensais[id].mes1.total + volumesMensais[id].mes2.total;
    });
    return t + allContacts.length;
  }, [volumesMensais, canaisAtivos, allContacts]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 py-4 animate-fade-in">
      {/* ── HEADER PRINCIPAL DO EIXO 02 ── */}
      <div className="space-y-2 border-b border-slate-800 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
          <Calendar className="h-3.5 w-3.5 text-indigo-400" />
          <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">
            Eixo 02 · Captação ({datas.intervaloTrimestreRecente})
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white leading-snug">
          Canais de Captação &amp; Entrada de Leads
        </h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          Selecione os canais que você utiliza abaixo. As caixas de entrada de contatos serão atualizadas na mesma tela <strong className="text-emerald-400">exibindo apenas os canais selecionados</strong>.
        </p>
      </div>

      {/* ── CARD: PERFIL SEM HISTÓRICO ── */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Diversidade de Registro</span>
            <p className="text-[11px] text-slate-400">
              {semHistorico ? 'Modo Projeção Orientada A3 ativo.' : 'Não acompanha a origem dos seus leads ainda? Sem problemas!'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSemHistorico(!semHistorico)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            semHistorico
              ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
          }`}
        >
          {semHistorico ? '✓ Não tenho histórico (Ativo)' : '⚪ Não tenho histórico de leads ainda'}
        </button>
      </div>

      {!semHistorico && (
        <>
          {/* ── SEÇÃO 1: SELETOR DE CANAIS ATIVOS (NUMA TELA SÓ) ── */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="flex items-center justify-center h-5 w-5 rounded-full bg-indigo-500 text-[11px] font-bold text-white">1</span>
                  Quais canais você usa para atrair pacientes?
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Marque ou desmarque os canais. A lista de preenchimento abaixo se ajusta instantaneamente.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20">
                {canaisSelecionados.size} de {CANAIS_ORIGEM.length - 1} selecionados
              </span>
            </div>

            {/* Grid de Canais Selecionáveis */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {CANAIS_ORIGEM.filter((c) => c.id !== 'nao_rastreado').map((canal) => {
                const ativo = canaisSelecionados.has(canal.id);
                return (
                  <button
                    key={canal.id}
                    type="button"
                    onClick={() => toggleCanal(canal.id)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                      ativo
                        ? 'bg-indigo-500/15 border-indigo-500/50 text-white shadow-md shadow-indigo-500/10'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded-md flex items-center justify-center flex-none border ${
                        ativo ? 'bg-indigo-500 border-indigo-400' : 'bg-slate-800 border-slate-700'
                      }`}
                    >
                      {ativo && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                    </div>
                    <span className="text-xs font-semibold leading-snug">{canal.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── SEÇÃO 2: ENTRADA DE LEADS POR MÊS (EXIBE APENAS CANAIS SELECIONADOS) ── */}
          {canaisSelecionados.size === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
              <Sparkles className="h-6 w-6 text-indigo-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">Nenhum canal selecionado acima</h3>
              <p className="text-xs text-slate-400">
                Marque ao menos um canal no bloco acima para exibir as caixas de preenchimento de leads.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Alternador de Modo: Modo Rápido vs Modo Detalhado */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="flex items-center justify-center h-5 w-5 rounded-full bg-emerald-500 text-[11px] font-bold text-slate-950">2</span>
                    Entrada de Leads por Mês &amp; Canal ({datas.mesM2}, {datas.mesM1}, {datas.mesM0})
                  </h2>
                  <p className="text-xs text-slate-400">
                    Preencha os volumes ou registre pessoas individualmente. Exibindo apenas os{' '}
                    <strong className="text-emerald-400">{canaisAtivos.length} canais selecionados</strong>.
                  </p>
                </div>

                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setModoPreenchimento('volume')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      modoPreenchimento === 'volume'
                        ? 'bg-emerald-500 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ⚡ Modo Rápido (Volumes)
                  </button>
                  <button
                    type="button"
                    onClick={() => setModoPreenchimento('nominal')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      modoPreenchimento === 'nominal'
                        ? 'bg-emerald-500 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    📋 Modo Detalhado (Nome a Nome)
                  </button>
                </div>
              </div>

              {/* MODO RÁPIDO (3 COLUNAS MENSAIS COM APENAS CANAIS ATIVOS) */}
              {modoPreenchimento === 'volume' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {meses.map((m) => (
                    <div key={m.key} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-xl">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {m.label}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {canaisAtivos.reduce((acc, c) => acc + (volumesMensais[c.id][m.key].total || 0), 0)} leads
                        </span>
                      </div>

                      {/* Exibe APENAS os canais que o usuário marcou acima */}
                      <div className="space-y-3">
                        {canaisAtivos.map((canal) => {
                          const vol = volumesMensais[canal.id][m.key];
                          return (
                            <div key={canal.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                              <span className="text-xs font-semibold text-slate-200 block truncate" title={canal.label}>
                                {canal.label}
                              </span>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[9px] font-bold text-slate-400 block mb-1">Chegaram:</label>
                                  <input
                                    type="number"
                                    min={0}
                                    value={vol.total || ''}
                                    onChange={(e) =>
                                      handleVolumeChange(canal.id, m.key, 'total', Math.max(0, parseInt(e.target.value) || 0))
                                    }
                                    placeholder="0"
                                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold focus:border-emerald-500"
                                  />
                                </div>

                                <div>
                                  <label className="text-[9px] font-bold text-emerald-400 block mb-1">Viraram Pacientes:</label>
                                  <input
                                    type="number"
                                    min={0}
                                    max={vol.total}
                                    value={vol.convertidos || ''}
                                    onChange={(e) =>
                                      handleVolumeChange(canal.id, m.key, 'convertidos', Math.max(0, parseInt(e.target.value) || 0))
                                    }
                                    placeholder="0"
                                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-emerald-400 font-bold focus:border-emerald-500"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* MODO DETALHADO (3 BLOCOS COLAPSÁVEIS MENSAIS NOMINAIS) */}
              {modoPreenchimento === 'nominal' && (
                <div className="space-y-4">
                  {[
                    { key: 'mesM2', label: datas.mesM2, anoMes: datas.mesM2AnoMes },
                    { key: 'mesM1', label: datas.mesM1, anoMes: datas.mesM1AnoMes },
                    { key: 'mesM0', label: datas.mesM0, anoMes: datas.mesM0AnoMes },
                  ].map((blocoMes) => {
                    const contatosDoMes = allContacts.filter(
                      (c) => (c.data || '').substring(0, 7) === blocoMes.anoMes && canaisSelecionados.has(c.canalOrigem)
                    );
                    const convertidosMes = contatosDoMes.filter((c) => c.statusFechamento === 'sim').length;
                    const taxaMes = contatosDoMes.length > 0 ? Math.round((convertidosMes / contatosDoMes.length) * 100) : 0;
                    const isOpen = openMeses[blocoMes.label] ?? true;

                    return (
                      <div key={blocoMes.key} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                        {/* Header do Mês */}
                        <div
                          onClick={() =>
                            setOpenMeses((prev) => ({ ...prev, [blocoMes.label]: !prev[blocoMes.label] }))
                          }
                          className="p-4 bg-slate-900 hover:bg-slate-800/80 transition-all flex items-center justify-between cursor-pointer border-b border-slate-800/60"
                        >
                          <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-emerald-400" />
                            <h3 className="text-sm font-bold text-white">{blocoMes.label}</h3>
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-[11px] font-bold text-slate-300">
                              {contatosDoMes.length} contatos
                            </span>
                            {contatosDoMes.length > 0 && (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-bold border border-emerald-500/20">
                                Conversão: {taxaMes}%
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onStartAdd(blocoMes.anoMes + '-01');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Plus className="h-3.5 w-3.5" /> Adicionar neste mês
                            </button>
                            {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                          </div>
                        </div>

                        {/* Conteúdo Nominal do Mês */}
                        {isOpen && (
                          <div className="p-4 space-y-2">
                            {contatosDoMes.length === 0 ? (
                              <p className="text-xs text-slate-500 py-3 text-center">
                                Nenhum contato registrado para {blocoMes.label} nos canais selecionados.
                              </p>
                            ) : (
                              contatosDoMes.map((contato) => (
                                <div
                                  key={contato.id}
                                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="font-bold text-white">{contato.nomeContato}</span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                                      {getLabelCanalById(contato.canalOrigem)}
                                    </span>
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                        contato.statusFechamento === 'sim'
                                          ? 'bg-emerald-500/20 text-emerald-300'
                                          : 'bg-slate-800 text-slate-400'
                                      }`}
                                    >
                                      {contato.statusFechamento === 'sim' ? '✓ Virou Paciente' : 'Não Fechou'}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => onEditar(contato)}
                                      className="p-1 text-slate-400 hover:text-white cursor-pointer"
                                      title="Editar"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => onExcluir(contato.id)}
                                      className="p-1 text-slate-400 hover:text-red-400 cursor-pointer"
                                      title="Excluir"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── BOTÃO DE CONCLUSÃO DO EIXO 02 ── */}
          <div className="flex justify-end border-t border-slate-800 pt-6">
            <button
              type="button"
              onClick={handleConcluir}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm px-8 py-3.5 rounded-xl transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
            >
              Concluir Captação e Avançar para Vendas (Eixo 03) →
            </button>
          </div>
        </>
      )}

      {semHistorico && (
        <div className="text-center py-8 space-y-4">
          <p className="text-sm text-slate-300">
            O Sistema A3 vai gerar uma <strong className="text-indigo-400">Projeção Orientada A3</strong> com metas de referência para{' '}
            <strong className="text-emerald-400">{datas.intervaloProximos90Dias}</strong>.
          </p>
          <button
            type="button"
            onClick={onConcluir}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            ✓ Gerar Veredito por Projeção
          </button>
        </div>
      )}
    </div>
  );
}
