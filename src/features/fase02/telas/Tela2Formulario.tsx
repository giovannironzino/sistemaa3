// Tela2Formulario.tsx
// Tela 2 — Formulário unificado para cadastrar/editar um ContatoCaptacao.
// Todos os campos ficam na mesma tela. Subcampos de indicação e parceria
// aparecem inline quando o canal correspondente é selecionado.

import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { ContatoCaptacao, CanalOrigemId, StatusFechamento } from '../fase02.types';
import type { ClusterId } from '../../fase01/fase01.types';
import { CLUSTERS } from '../../fase01/data/bancoDePromessas';
import { CANAIS_ORIGEM } from '../data/canaisOrigem';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateBR(isoDate: string): string {
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}

function gerarUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Tela2FormularioProps {
  dataEmRevisao: string;                 // ISO YYYY-MM-DD
  contatoEditando?: ContatoCaptacao;     // undefined = criação, definido = edição
  onSalvar: (contato: ContatoCaptacao) => void;
}

// ---------------------------------------------------------------------------
// Estado local do formulário
// ---------------------------------------------------------------------------

interface FormState {
  nomeContato: string;
  objetivoPrincipal: ClusterId | '';
  statusFechamento: StatusFechamento | '';
  canalOrigem: CanalOrigemId | '';
  // Subcampo indicação
  sabeQuemIndicou: boolean | null;
  nomeIndicador: string;
  // Subcampo parceria
  sabeQualParceiro: boolean | null;
  nomeParceiro: string;
}

function buildInitialForm(contato?: ContatoCaptacao): FormState {
  if (!contato) {
    return {
      nomeContato: '',
      objetivoPrincipal: '',
      statusFechamento: '',
      canalOrigem: '',
      sabeQuemIndicou: null,
      nomeIndicador: '',
      sabeQualParceiro: null,
      nomeParceiro: '',
    };
  }
  return {
    nomeContato: contato.nomeContato,
    objetivoPrincipal: contato.objetivoPrincipal,
    statusFechamento: contato.statusFechamento,
    canalOrigem: contato.canalOrigem,
    sabeQuemIndicou: contato.sabeQuemIndicou ?? null,
    nomeIndicador: contato.nomeIndicador ?? '',
    sabeQualParceiro: contato.sabeQualParceiro ?? null,
    nomeParceiro: contato.nomeParceiro ?? '',
  };
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export default function Tela2Formulario({
  dataEmRevisao,
  contatoEditando,
  onSalvar,
}: Tela2FormularioProps) {
  const [form, setForm] = useState<FormState>(() => buildInitialForm(contatoEditando));

  // Resetar formulário quando mudar de edição para criação
  useEffect(() => {
    setForm(buildInitialForm(contatoEditando));
  }, [contatoEditando?.id]);

  // -------------------------------------------------------------------------
  // Validação
  // -------------------------------------------------------------------------

  function isFormValido(): boolean {
    if (!form.nomeContato.trim()) return false;
    if (!form.objetivoPrincipal) return false;
    if (!form.statusFechamento) return false;
    if (!form.canalOrigem) return false;

    if (form.canalOrigem === 'indicacao_boca_a_boca') {
      if (form.sabeQuemIndicou === null) return false;
      if (form.sabeQuemIndicou === true && !form.nomeIndicador.trim()) return false;
    }
    if (form.canalOrigem === 'parcerias_medicas') {
      if (form.sabeQualParceiro === null) return false;
      if (form.sabeQualParceiro === true && !form.nomeParceiro.trim()) return false;
    }
    return true;
  }

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  function handleCanalChange(canalId: CanalOrigemId) {
    setForm((prev) => ({
      ...prev,
      canalOrigem: canalId,
      // Limpar subcampos ao trocar de canal
      sabeQuemIndicou: null,
      nomeIndicador: '',
      sabeQualParceiro: null,
      nomeParceiro: '',
    }));
  }

  function handleSabeIndicouChange(sabe: boolean) {
    setForm((prev) => ({
      ...prev,
      sabeQuemIndicou: sabe,
      nomeIndicador: '', // Limpar texto ao trocar (6.6)
    }));
  }

  function handleSabeParceiroChange(sabe: boolean) {
    setForm((prev) => ({
      ...prev,
      sabeQualParceiro: sabe,
      nomeParceiro: '', // Limpar texto ao trocar (6.6)
    }));
  }

  function handleSalvar() {
    if (!isFormValido()) return;

    const agora = new Date().toISOString();
    const contato: ContatoCaptacao = {
      id: contatoEditando?.id ?? gerarUUID(),
      data: dataEmRevisao,
      nomeContato: form.nomeContato.trim(),
      objetivoPrincipal: form.objetivoPrincipal as ClusterId,
      statusFechamento: form.statusFechamento as StatusFechamento,
      canalOrigem: form.canalOrigem as CanalOrigemId,
      criadoEm: contatoEditando?.criadoEm ?? agora,
      atualizadoEm: agora,
    };

    // Subcampo indicação
    if (form.canalOrigem === 'indicacao_boca_a_boca') {
      contato.sabeQuemIndicou = form.sabeQuemIndicou === true;
      if (form.sabeQuemIndicou === true) {
        contato.nomeIndicador = form.nomeIndicador.trim();
      }
    }

    // Subcampo parceria
    if (form.canalOrigem === 'parcerias_medicas') {
      contato.sabeQualParceiro = form.sabeQualParceiro === true;
      if (form.sabeQualParceiro === true) {
        contato.nomeParceiro = form.nomeParceiro.trim();
      }
    }

    onSalvar(contato);
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  const modoEdicao = !!contatoEditando;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8" id="tela2_formulario_captacao">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
            Eixo 02 · Captação · {modoEdicao ? 'Editando Contato' : 'Tela 2'}
          </span>
        </div>
        <h1 className="text-xl font-bold text-white leading-snug">
          Cadastrando contato do dia{' '}
          <span className="text-emerald-400">{formatDateBR(dataEmRevisao)}</span>:
        </h1>
      </div>

      {/* Campo 1: Nome do Contato */}
      <div className="space-y-3">
        <label htmlFor="input_nome_contato" className="block text-sm font-bold text-slate-200">
          1. Nome do Contato
        </label>
        <input
          id="input_nome_contato"
          type="text"
          placeholder="Ex: Maria Clara, Dr. João..."
          value={form.nomeContato}
          onChange={(e) => setForm((prev) => ({ ...prev, nomeContato: e.target.value }))}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:border-emerald-500 transition-colors"
        />
      </div>

      {/* Campo 2: Objetivo Principal */}
      <div className="space-y-3">
        <p className="text-sm font-bold text-slate-200">2. Objetivo Principal</p>
        <div className="grid grid-cols-1 gap-2">
          {CLUSTERS.map((cluster) => {
            const selecionado = form.objetivoPrincipal === cluster.id;
            return (
              <button
                key={cluster.id}
                type="button"
                id={`btn_objetivo_${cluster.id}`}
                onClick={() =>
                  setForm((prev) => ({ ...prev, objetivoPrincipal: cluster.id }))
                }
                className={[
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all',
                  selecionado
                    ? 'bg-emerald-500/20 border border-emerald-500/60 text-emerald-300'
                    : 'bg-white/4 border border-white/10 text-slate-300 hover:bg-white/8 hover:border-white/20',
                ].join(' ')}
              >
                <div
                  className={[
                    'h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center',
                    selecionado ? 'border-emerald-400 bg-emerald-500' : 'border-slate-600',
                  ].join(' ')}
                >
                  {selecionado && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                </div>
                {cluster.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Campo 3: Status de Fechamento */}
      <div className="space-y-3">
        <p className="text-sm font-bold text-slate-200">3. Status de Fechamento</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {(
            [
              { id: 'sim', label: 'Sim (virou paciente ativo)' },
              { id: 'nao', label: 'Não (ficou apenas como lead)' },
            ] as { id: StatusFechamento; label: string }[]
          ).map((opt) => {
            const selecionado = form.statusFechamento === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                id={`btn_fechamento_${opt.id}`}
                onClick={() =>
                  setForm((prev) => ({ ...prev, statusFechamento: opt.id }))
                }
                className={[
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all',
                  selecionado
                    ? opt.id === 'sim'
                      ? 'bg-emerald-500/20 border border-emerald-500/60 text-emerald-300'
                      : 'bg-rose-500/15 border border-rose-500/40 text-rose-300'
                    : 'bg-white/4 border border-white/10 text-slate-300 hover:bg-white/8 hover:border-white/20',
                ].join(' ')}
              >
                <div
                  className={[
                    'h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center',
                    selecionado
                      ? opt.id === 'sim'
                        ? 'border-emerald-400 bg-emerald-500'
                        : 'border-rose-400 bg-rose-500'
                      : 'border-slate-600',
                  ].join(' ')}
                >
                  {selecionado && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                </div>
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Campo 4: Canal de Origem */}
      <div className="space-y-3">
        <p className="text-sm font-bold text-slate-200">4. Canal de Origem</p>
        <div className="grid grid-cols-1 gap-2">
          {CANAIS_ORIGEM.map((canal) => {
            const selecionado = form.canalOrigem === canal.id;
            return (
              <div key={canal.id}>
                <button
                  type="button"
                  id={`btn_canal_${canal.id}`}
                  onClick={() => handleCanalChange(canal.id)}
                  className={[
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all',
                    selecionado
                      ? 'bg-indigo-500/20 border border-indigo-500/60 text-indigo-300'
                      : 'bg-white/4 border border-white/10 text-slate-300 hover:bg-white/8 hover:border-white/20',
                  ].join(' ')}
                >
                  <div
                    className={[
                      'h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center',
                      selecionado ? 'border-indigo-400 bg-indigo-500' : 'border-slate-600',
                    ].join(' ')}
                  >
                    {selecionado && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                  </div>
                  {canal.label}
                </button>

                {/* Subcampo: Indicação */}
                {selecionado && canal.id === 'indicacao_boca_a_boca' && (
                  <div
                    className="mt-2 ml-4 pl-4 border-l-2 border-indigo-500/30 space-y-3"
                    id="subcampo_indicacao"
                  >
                    <p className="text-xs font-semibold text-slate-400">
                      Você sabe quem indicou?
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        type="button"
                        id="btn_sabe_indicou_sim"
                        onClick={() => handleSabeIndicouChange(true)}
                        className={[
                          'px-3 py-2 rounded-lg text-xs font-semibold transition-all',
                          form.sabeQuemIndicou === true
                            ? 'bg-indigo-500/25 border border-indigo-500/60 text-indigo-300'
                            : 'bg-white/5 border border-white/15 text-slate-400 hover:text-white',
                        ].join(' ')}
                      >
                        Sim
                      </button>
                      <button
                        type="button"
                        id="btn_sabe_indicou_nao"
                        onClick={() => handleSabeIndicouChange(false)}
                        className={[
                          'px-3 py-2 rounded-lg text-xs font-semibold transition-all',
                          form.sabeQuemIndicou === false
                            ? 'bg-slate-500/25 border border-slate-500/60 text-slate-300'
                            : 'bg-white/5 border border-white/15 text-slate-400 hover:text-white',
                        ].join(' ')}
                      >
                        Não sei quem indicou
                      </button>
                    </div>
                    {form.sabeQuemIndicou === true && (
                      <input
                        id="input_nome_indicador"
                        type="text"
                        placeholder="Nome de quem indicou..."
                        value={form.nomeIndicador}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, nomeIndicador: e.target.value }))
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs placeholder:text-slate-600 focus:border-indigo-500 transition-colors"
                      />
                    )}
                  </div>
                )}

                {/* Subcampo: Parceria */}
                {selecionado && canal.id === 'parcerias_medicas' && (
                  <div
                    className="mt-2 ml-4 pl-4 border-l-2 border-indigo-500/30 space-y-3"
                    id="subcampo_parceria"
                  >
                    <p className="text-xs font-semibold text-slate-400">
                      Você sabe qual foi o parceiro?
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        type="button"
                        id="btn_sabe_parceiro_sim"
                        onClick={() => handleSabeParceiroChange(true)}
                        className={[
                          'px-3 py-2 rounded-lg text-xs font-semibold transition-all',
                          form.sabeQualParceiro === true
                            ? 'bg-indigo-500/25 border border-indigo-500/60 text-indigo-300'
                            : 'bg-white/5 border border-white/15 text-slate-400 hover:text-white',
                        ].join(' ')}
                      >
                        Sim
                      </button>
                      <button
                        type="button"
                        id="btn_sabe_parceiro_nao"
                        onClick={() => handleSabeParceiroChange(false)}
                        className={[
                          'px-3 py-2 rounded-lg text-xs font-semibold transition-all',
                          form.sabeQualParceiro === false
                            ? 'bg-slate-500/25 border border-slate-500/60 text-slate-300'
                            : 'bg-white/5 border border-white/15 text-slate-400 hover:text-white',
                        ].join(' ')}
                      >
                        Não sei qual parceiro
                      </button>
                    </div>
                    {form.sabeQualParceiro === true && (
                      <input
                        id="input_nome_parceiro"
                        type="text"
                        placeholder="Nome do parceiro (ex: Dra. Ana, Clínica X)..."
                        value={form.nomeParceiro}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, nomeParceiro: e.target.value }))
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs placeholder:text-slate-600 focus:border-indigo-500 transition-colors"
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Botão Salvar */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          id="btn_tela2_salvar"
          disabled={!isFormValido()}
          onClick={handleSalvar}
          className="btn-primary flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
        >
          <Check className="h-4 w-4" />
          {modoEdicao ? 'Salvar Edição' : 'Salvar Contato'}
        </button>
      </div>
    </div>
  );
}
