// TelaLista.tsx
// Painel Principal do Eixo 02 — Captação (Seleção de Canais Ativos + 3 Boxes Mensais em Colunas).
// Veredito é exibido em TELA EXCLUSIVA após clicar em "Concluir e Gerar Veredito".

import React, { useState, useMemo } from 'react';
import { Plus, Sparkles, TrendingUp, Calendar, Pencil, Trash2, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { ContatoCaptacao, CanalOrigemId } from '../fase02.types';
import { CANAIS_ORIGEM, getLabelCanalById } from '../data/canaisOrigem';
import { getLabelById as getLabelClusterById } from '../../fase01/data/bancoDePromessas';
import { C } from '../ui/tokens';
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

  // PASSO 1 — Selecionar quais canais o usuário utiliza
  const [canaisSelecionados, setCanaisSelecionados] = useState<Set<CanalOrigemId>>(() => {
    const usados = new Set<CanalOrigemId>(allContacts.map((c) => c.canalOrigem));
    return usados.size > 0 ? usados : new Set<CanalOrigemId>();
  });
  const [passoAtual, setPassoAtual] = useState<'selecionarCanais' | 'preencherDados'>(
    allContacts.length > 0 ? 'preencherDados' : 'selecionarCanais'
  );
  const [semHistorico, setSemHistorico] = useState(false);
  const [modoPreenchimento, setModoPreenchimento] = useState<'volume' | 'nominal'>('volume');

  // Volumes por canal por mês (mesM2, mesM1, mesM0)
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

  function handleContinuarParaPreenchimento() {
    if (canaisSelecionados.size === 0) return;
    setPassoAtual('preencherDados');
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
        const totalMeses = (volumesMensais[id].mes0.total + volumesMensais[id].mes1.total + volumesMensais[id].mes2.total);
        const convMeses = (volumesMensais[id].mes0.convertidos + volumesMensais[id].mes1.convertidos + volumesMensais[id].mes2.convertidos);
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

  // ─── PASSO 1: Seletor de Canais Ativos ─────────────────────────────────────
  if (passoAtual === 'selecionarCanais') {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-8 py-4">
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            <Calendar className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">
              Eixo 02 · Captação ({datas.intervaloTrimestreRecente})
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white leading-snug">
            Quais canais você usa para atrair pacientes?
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Selecione apenas os canais que realmente existem no seu consultório hoje.
            O preenchimento vai aparecer <strong className="text-white">somente para os canais que você marcar</strong>.
          </p>
        </div>

        {/* Card: Perfil sem histórico */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Diversidade de Dados</span>
              <p className="text-[11px] text-slate-400">
                {semHistorico ? 'Modo Projeção Orientada A3 ativo.' : 'Não acompanha a origem dos seus leads? Sem problemas!'}
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
            {/* Grid de Canais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CANAIS_ORIGEM.filter((c) => c.id !== 'nao_rastreado').map((canal) => {
                const ativo = canaisSelecionados.has(canal.id);
                return (
                  <button
                    key={canal.id}
                    type="button"
                    onClick={() => toggleCanal(canal.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl text-left border transition-all cursor-pointer ${
                      ativo
                        ? 'bg-indigo-500/15 border-indigo-500/50 text-white shadow-lg shadow-indigo-500/10'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    <div className={`h-5 w-5 rounded-md flex items-center justify-center flex-none border ${
                      ativo ? 'bg-indigo-500 border-indigo-400' : 'bg-slate-800 border-slate-700'
                    }`}>
                      {ativo && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                    </div>
                    <span className="text-xs font-semibold leading-snug">{canal.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-slate-500">
                {canaisSelecionados.size} canal(is) selecionado(s)
              </p>
              <button
                type="button"
                onClick={handleContinuarParaPreenchimento}
                disabled={canaisSelecionados.size === 0}
                className={`px-6 py-3 rounded-xl text-xs font-bold transition-all ${
                  canaisSelecionados.size > 0
                    ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/20 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Continuar com {canaisSelecionados.size} canal(is) selecionado(s) →
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

  // ─── PASSO 2: Preenchimento por Boxes Mensais (3 colunas) ──────────────────
  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 py-4">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
          <Calendar className="h-3.5 w-3.5 text-indigo-400" />
          <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">
            Eixo 02 · Captação ({datas.intervaloTrimestreRecente})
          </span>
        </div>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white leading-snug">
              Entrada de Leads por Canal e por Mês
            </h1>
            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
              Preencha quantas pessoas chegaram e quantas fecharam em cada canal, mês a mês.
              A <strong className="text-slate-200">data exata do dia é opcional</strong> — você pode informar só o total mensal.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPassoAtual('selecionarCanais')}
            className="text-xs text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-600 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
          >
            ← Alterar canais selecionados
          </button>
        </div>
      </div>

      {/* Tabs: Modo Volume vs Modo Nominal */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setModoPreenchimento('volume')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            modoPreenchimento === 'volume'
              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <TrendingUp className="h-4 w-4" /> ⚡ Modo Rápido (Volume por Mês)
        </button>
        <button
          type="button"
          onClick={() => setModoPreenchimento('nominal')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            modoPreenchimento === 'nominal'
              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Plus className="h-4 w-4" /> 📝 Modo Detalhado (Lista Nominal)
        </button>
      </div>

      {/* ── MODO RÁPIDO: 3 Boxes Mensais em Colunas ── */}
      {modoPreenchimento === 'volume' && (
        <div className="space-y-6">
          {/* Colunas dos 3 meses */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {meses.map(({ key, label }) => (
              <div key={key} className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
                {/* Cabeçalho do Box do Mês */}
                <div className="bg-slate-950 border-b border-slate-800 p-4 text-center">
                  <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">{label}</span>
                </div>

                {/* Linhas por Canal Ativo */}
                <div className="flex-1 divide-y divide-slate-800/60">
                  {canaisAtivos.length === 0 && (
                    <p className="text-center text-xs text-slate-500 p-4">Nenhum canal selecionado.</p>
                  )}
                  {canaisAtivos.map((canal) => {
                    const val = volumesMensais[canal.id]?.[key] || { total: 0, convertidos: 0 };
                    return (
                      <div key={canal.id} className="p-3 space-y-2">
                        <p className="text-[10px] font-bold text-slate-300 leading-snug">{canal.label}</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[8px] text-slate-500 uppercase font-bold block mb-1">Contatos</label>
                            <input
                              type="number"
                              min="0"
                              value={val.total || ''}
                              onChange={(e) => handleVolumeChange(canal.id, key, 'total', parseInt(e.target.value, 10) || 0)}
                              placeholder="0"
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white font-mono font-bold text-center"
                            />
                          </div>
                          <div>
                            <label className="text-[8px] text-emerald-500 uppercase font-bold block mb-1">Fecharam</label>
                            <input
                              type="number"
                              min="0"
                              max={val.total}
                              value={val.convertidos || ''}
                              onChange={(e) => handleVolumeChange(canal.id, key, 'convertidos', parseInt(e.target.value, 10) || 0)}
                              placeholder="0"
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-emerald-400 font-mono font-bold text-center"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer do box do mês */}
                <div className="p-3 bg-slate-950 border-t border-slate-800 text-center">
                  {(() => {
                    const totMes = canaisAtivos.reduce((acc, c) => acc + (volumesMensais[c.id]?.[key]?.total || 0), 0);
                    const convMes = canaisAtivos.reduce((acc, c) => acc + (volumesMensais[c.id]?.[key]?.convertidos || 0), 0);
                    return (
                      <div className="flex items-center justify-center gap-4">
                        <span className="text-[10px] text-slate-400"><span className="text-white font-bold">{totMes}</span> contatos</span>
                        <span className="text-[10px] text-slate-400"><span className="text-emerald-400 font-bold">{convMes}</span> fecharam</span>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MODO NOMINAL: Lista contínua de contatos ── */}
      {modoPreenchimento === 'nominal' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">
              {allContacts.length} contato(s) cadastrado(s) nominalmente em {datas.intervaloTrimestreRecente}
            </span>
            <button
              type="button"
              onClick={onStartAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Cadastrar Novo Contato
            </button>
          </div>

          <div className="space-y-4">
            {[
              { anoMes: (() => { const d = new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; })(), label: datas.mesM2 },
              { anoMes: (() => { const d = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; })(), label: datas.mesM1 },
              { anoMes: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`, label: datas.mesM0 }
            ].map(({ anoMes, label }) => {
              const contatosMes = allContacts.filter((c) => c.data.substring(0, 7) === anoMes);
              const convertidos = contatosMes.filter((c) => c.statusFechamento === 'sim').length;
              const total = contatosMes.length;
              const taxa = total > 0 ? (convertidos / total * 100).toFixed(0) + '%' : '0%';

              return (
                <GrupoMes
                  key={anoMes}
                  anoMes={anoMes}
                  label={label}
                  contatos={contatosMes}
                  total={total}
                  taxa={taxa}
                  onEditar={onEditar}
                  onExcluir={onExcluir}
                  onStartAdd={onStartAdd}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* ── Barra de Conclusão ── */}
      <div className="sticky bottom-0 bg-slate-950/90 backdrop-blur border-t border-slate-800 p-4 mt-4 -mx-4 sm:-mx-8 flex items-center justify-between gap-4 flex-wrap rounded-t-2xl">
        <div className="text-xs text-slate-400">
          Total no período:{' '}
          <strong className="text-white text-sm">{totalGeralVolume}</strong> contato(s) registrado(s) em{' '}
          <strong className="text-emerald-400">{datas.intervaloTrimestreRecente}</strong>
        </div>

        <button
          type="button"
          onClick={handleConcluir}
          disabled={totalGeralVolume === 0}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
            totalGeralVolume > 0
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white shadow-lg shadow-indigo-500/25 cursor-pointer'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Check className="h-4 w-4" /> Concluir e Gerar Veredito de Captação
        </button>
      </div>
    </div>
  );
}

function GrupoMes({ anoMes, label, contatos, total, taxa, onEditar, onExcluir, onStartAdd }: any) {
  const [aberto, setAberto] = useState(total > 0);

  const getCorCanal = (canal: string) => {
    switch (canal) {
      case 'indicacao_boca_a_boca': return 'bg-emerald-500/20 text-emerald-300';
      case 'instagram_organico': return 'bg-purple-500/20 text-purple-300';
      case 'trafego_pago': return 'bg-amber-500/20 text-amber-300';
      case 'parcerias_medicas': return 'bg-sky-500/20 text-sky-300';
      case 'reativacao_antigos': return 'bg-orange-500/20 text-orange-300';
      default: return 'bg-slate-500/20 text-slate-300';
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl mb-4">
      <div
        className="flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800 cursor-pointer hover:bg-slate-900 transition-colors"
        onClick={() => setAberto(!aberto)}
      >
        <div className="flex items-center gap-3">
          {aberto ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
          <span className="text-sm font-bold text-white">{label}</span>
          <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded-full">{total} contatos</span>
          {total > 0 && <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">Conversão: {taxa}</span>}
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onStartAdd(anoMes); }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer"
        >
          <Plus className="h-3 w-3" /> Adicionar Contato
        </button>
      </div>

      {aberto && (
        <>
          {total === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              Nenhum contato registrado neste mês.
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-12 gap-2 p-3 bg-slate-900/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <div className="col-span-5">Nome do Contato</div>
                <div className="col-span-3">Canal de Origem</div>
                <div className="col-span-2">Fechou?</div>
                <div className="col-span-2 text-right">Ação</div>
              </div>
              {contatos.map((c: any) => (
                <div key={c.id} className="grid grid-cols-12 gap-2 p-3 text-xs items-center border-b border-slate-800/60 hover:bg-slate-850/50">
                  <div className="col-span-5 font-bold text-white">{c.nomeContato}</div>
                  <div className="col-span-3 flex items-center">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold truncate ${getCorCanal(c.canalOrigem)}`}>
                      {getLabelCanalById(c.canalOrigem)}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.statusFechamento === 'sim' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                      {c.statusFechamento === 'sim' ? 'Sim ✓' : 'Não'}
                    </span>
                  </div>
                  <div className="col-span-2 flex justify-end gap-2">
                    <button type="button" onClick={() => onEditar(c)} className="p-1.5 text-slate-400 hover:text-white cursor-pointer">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => onExcluir(c.id)} className="p-1.5 text-slate-400 hover:text-red-400 cursor-pointer">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
