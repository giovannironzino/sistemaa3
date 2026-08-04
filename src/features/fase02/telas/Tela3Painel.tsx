// Tela3Painel.tsx
// Tela 3 — Painel de Controle e Visão Parcial.
// Lista todos os contatos cadastrados com ações de editar e excluir.
// Três botões de ação: adicionar outro, mudar data, concluir.

import React from 'react';
import { Plus, CalendarDays, CheckSquare, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { ContatoCaptacao } from '../fase02.types';
import { getLabelCanalById } from '../data/canaisOrigem';
import { getLabelById as getLabelClusterById } from '../../fase01/data/bancoDePromessas';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateBR(isoDate: string): string {
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Tela3PainelProps {
  dataEmRevisao: string;
  contatos: ContatoCaptacao[];
  travaConfirmada: boolean;     // se true, ocultar editar/excluir (seção 6.2)
  onAdicionarOutro: () => void;
  onEscolherOutraData: () => void;
  onConcluir: () => void;
  onEditar: (contato: ContatoCaptacao) => void;
  onExcluir: (id: string) => void;
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export default function Tela3Painel({
  dataEmRevisao,
  contatos,
  travaConfirmada,
  onAdicionarOutro,
  onEscolherOutraData,
  onConcluir,
  onEditar,
  onExcluir,
}: Tela3PainelProps) {
  const podeConluir = contatos.length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8" id="tela3_painel_captacao">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
            Eixo 02 · Captação · Tela 3
          </span>
        </div>
        <h1 className="text-xl font-bold text-white leading-snug">
          Pessoas cadastradas até agora:
        </h1>
        <p className="text-sm text-slate-400">
          <span className="text-white font-semibold">{contatos.length}</span>{' '}
          {contatos.length === 1 ? 'contato cadastrado' : 'contatos cadastrados'} no total.
        </p>
      </div>

      {/* Lista de contatos */}
      {contatos.length === 0 ? (
        <div className="bg-white/3 border border-white/8 rounded-xl px-5 py-10 text-center space-y-2">
          <p className="text-sm text-slate-500">Nenhum contato cadastrado ainda.</p>
          <p className="text-xs text-slate-600">
            Clique em "+ Cadastrar" abaixo para adicionar o primeiro contato.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Cabeçalho da tabela — apenas em telas maiores */}
          <div className="hidden md:grid grid-cols-[1fr_1fr_1fr_80px_100px] gap-3 px-4 py-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Data / Nome</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Objetivo</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Canal</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Fechou?</span>
            {!travaConfirmada && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Ações</span>
            )}
          </div>

          {contatos.map((c) => (
            <div
              key={c.id}
              id={`contato_row_${c.id}`}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 hover:border-white/20 transition-colors"
            >
              {/* Layout desktop */}
              <div className={`hidden md:grid gap-3 items-center ${travaConfirmada ? 'grid-cols-[1fr_1fr_1fr_80px]' : 'grid-cols-[1fr_1fr_1fr_80px_100px]'}`}>
                <div>
                  <p className="text-[10px] text-slate-500 font-mono">{formatDateBR(c.data)}</p>
                  <p className="text-sm font-semibold text-white truncate">{c.nomeContato}</p>
                </div>
                <p className="text-xs text-slate-400 truncate">{getLabelClusterById(c.objetivoPrincipal)}</p>
                <p className="text-xs text-slate-400 truncate">{getLabelCanalById(c.canalOrigem)}</p>
                <span
                  className={[
                    'inline-flex items-center justify-center px-2 py-1 rounded-full text-[10px] font-bold',
                    c.statusFechamento === 'sim'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
                  ].join(' ')}
                >
                  {c.statusFechamento === 'sim' ? 'Sim' : 'Não'}
                </span>
                {!travaConfirmada && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      id={`btn_editar_${c.id}`}
                      onClick={() => onEditar(c)}
                      title="Editar contato"
                      className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/40 transition-all"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      id={`btn_excluir_${c.id}`}
                      onClick={() => onExcluir(c.id)}
                      title="Excluir contato"
                      className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Layout mobile */}
              <div className="md:hidden space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[10px] text-slate-500 font-mono">{formatDateBR(c.data)}</p>
                    <p className="text-sm font-semibold text-white">{c.nomeContato}</p>
                  </div>
                  <span
                    className={[
                      'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0',
                      c.statusFechamento === 'sim'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
                    ].join(' ')}
                  >
                    {c.statusFechamento === 'sim' ? 'Fechou' : 'Lead'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{getLabelClusterById(c.objetivoPrincipal)}</p>
                <p className="text-xs text-slate-500">{getLabelCanalById(c.canalOrigem)}</p>
                {!travaConfirmada && (
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      id={`btn_editar_mobile_${c.id}`}
                      onClick={() => onEditar(c)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-indigo-400 text-xs transition-all"
                    >
                      <Pencil className="h-3 w-3" /> Editar
                    </button>
                    <button
                      type="button"
                      id={`btn_excluir_mobile_${c.id}`}
                      onClick={() => onExcluir(c.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-rose-400 text-xs transition-all"
                    >
                      <Trash2 className="h-3 w-3" /> Excluir
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Botões de ação — apenas se a trava não foi confirmada */}
      {!travaConfirmada && (
        <div className="space-y-3 pt-2">
          <button
            type="button"
            id="btn_tela3_adicionar_outro"
            onClick={onAdicionarOutro}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/8 hover:border-emerald-500/30 hover:text-emerald-400 text-sm font-semibold transition-all"
          >
            <Plus className="h-4 w-4" />
            + Cadastrar outra pessoa no dia {formatDateBR(dataEmRevisao)}
          </button>

          <button
            type="button"
            id="btn_tela3_outra_data"
            onClick={onEscolherOutraData}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/8 hover:border-indigo-500/30 hover:text-indigo-400 text-sm font-semibold transition-all"
          >
            <CalendarDays className="h-4 w-4" />
            📅 Escolher outra data para conferir
          </button>

          <div className="space-y-1.5">
            <button
              type="button"
              id="btn_tela3_concluir"
              disabled={!podeConluir}
              onClick={onConcluir}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl btn-primary text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
            >
              <CheckSquare className="h-4 w-4" />
              ✅ Concluir e Gerar Veredito de Captação
            </button>
            {!podeConluir && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-amber-400">
                <AlertCircle className="h-3.5 w-3.5" />
                Cadastre pelo menos 1 pessoa antes de concluir.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
