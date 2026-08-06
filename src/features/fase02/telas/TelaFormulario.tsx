// TelaFormulario.tsx
// Formulário de cadastro/edição de contato — chips clicáveis para objetivo e canal.

import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ContatoCaptacao, CanalOrigemId, StatusFechamento } from '../fase02.types';
import type { ClusterId } from '../../fase01/fase01.types';
import { CLUSTERS } from '../../fase01/data/bancoDePromessas';
import { CANAIS_ORIGEM } from '../data/canaisOrigem';
import { criarContato, formatDateBR } from '../lib/contatoUtils';
import { C, badgeStyle, chipStyle, toggleBtnStyle, primaryBtnStyle, inputStyle } from '../ui/tokens';

interface TelaFormularioProps {
  selectedDate: string;
  contatoEditando?: ContatoCaptacao;
  onSalvar: (contato: ContatoCaptacao) => void;
  onVoltar: () => void;
  /** Reconciliação com sistema de prontuário: oculta o passo de Status (travado em 'sim')
   *  e marca origemRegistro='reconciliacao_prontuario' — ver contatoUtils.criarContato. */
  modoReconciliacao?: boolean;
}

interface FormState {
  nomeContato: string;
  objetivoPrincipal: ClusterId | '';
  canalOrigem: CanalOrigemId | '';
  statusFechamento: StatusFechamento | '';
  sabeQuemIndicou: boolean | null;
  nomeIndicador: string;
  sabeQualParceiro: boolean | null;
  nomeParceiro: string;
}

function buildInitialForm(contato?: ContatoCaptacao): FormState {
  if (!contato) {
    return {
      nomeContato: '',
      objetivoPrincipal: '',
      canalOrigem: '',
      statusFechamento: '',
      sabeQuemIndicou: null,
      nomeIndicador: '',
      sabeQualParceiro: null,
      nomeParceiro: '',
    };
  }
  return {
    nomeContato: contato.nomeContato,
    objetivoPrincipal: contato.objetivoPrincipal,
    canalOrigem: contato.canalOrigem,
    statusFechamento: contato.statusFechamento,
    sabeQuemIndicou: contato.sabeQuemIndicou ?? null,
    nomeIndicador: contato.nomeIndicador ?? '',
    sabeQualParceiro: contato.sabeQualParceiro ?? null,
    nomeParceiro: contato.nomeParceiro ?? '',
  };
}

export default function TelaFormulario({ selectedDate, contatoEditando, onSalvar, onVoltar, modoReconciliacao = false }: TelaFormularioProps) {
  const [form, setForm] = useState<FormState>(() => buildInitialForm(contatoEditando));

  useEffect(() => {
    setForm(buildInitialForm(contatoEditando));
  }, [contatoEditando?.id]);

  function isValid(): boolean {
    if (!form.nomeContato.trim()) return false;
    if (!form.objetivoPrincipal) return false;
    if (!form.canalOrigem) return false;
    if (!modoReconciliacao && !form.statusFechamento) return false;
    if (form.canalOrigem === 'indicacao_boca_a_boca' && form.sabeQuemIndicou === true && !form.nomeIndicador.trim()) return false;
    return true;
  }

  function handleCanalChange(canalId: CanalOrigemId) {
    setForm((prev) => ({
      ...prev,
      canalOrigem: canalId,
      sabeQuemIndicou: null,
      nomeIndicador: '',
      sabeQualParceiro: null,
      nomeParceiro: '',
    }));
  }

  function handleSalvar() {
    if (!isValid()) return;
    const contato = criarContato({
      data: selectedDate,
      nomeContato: form.nomeContato,
      objetivoPrincipal: form.objetivoPrincipal as ClusterId,
      canalOrigem: form.canalOrigem as CanalOrigemId,
      statusFechamento: modoReconciliacao ? 'sim' : (form.statusFechamento as StatusFechamento),
      sabeQuemIndicou: form.sabeQuemIndicou === true,
      nomeIndicador: form.nomeIndicador,
      origemRegistro: modoReconciliacao ? 'reconciliacao_prontuario' : 'revisao_whatsapp',
      idExistente: contatoEditando?.id,
      criadoEmExistente: contatoEditando?.criadoEm,
    });
    onSalvar(contato);
  }

  const isIndicacao = form.canalOrigem === 'indicacao_boca_a_boca';

  return (
    <div>
      <div
        onClick={onVoltar}
        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: C.textSecondary, cursor: 'pointer', marginBottom: 18, width: 'fit-content' }}
      >
        <ArrowLeft size={14} /> Voltar
      </div>
      <div style={badgeStyle}>{modoReconciliacao ? 'EIXO 02 · RECONCILIAÇÃO COM PRONTUÁRIO' : 'EIXO 02 · CAPTAÇÃO'}</div>
      <div style={{ fontSize: 22, fontWeight: 800, marginTop: 16, marginBottom: 22 }}>
        {modoReconciliacao ? (
          'Cadastrando paciente que o prontuário mostra mas a revisão de WhatsApp não capturou'
        ) : (
          <>Cadastrando contato do dia <span style={{ color: C.accentText }}>{formatDateBR(selectedDate)}</span></>
        )}
      </div>

      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>1. Nome do Contato</div>
        <input
          value={form.nomeContato}
          onChange={(e) => setForm((prev) => ({ ...prev, nomeContato: e.target.value }))}
          placeholder="Ex: Maria Clara, Dr. João..."
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>2. Objetivo Principal</div>
        <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 8 }}>
          {CLUSTERS.map((cluster) => (
            <div
              key={cluster.id}
              onClick={() => setForm((prev) => ({ ...prev, objetivoPrincipal: cluster.id }))}
              style={chipStyle(form.objetivoPrincipal === cluster.id)}
            >
              {cluster.label}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>3. Canal de Origem</div>
        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 8 }}>
          {CANAIS_ORIGEM.map((canal) => (
            <div key={canal.id} onClick={() => handleCanalChange(canal.id)} style={chipStyle(form.canalOrigem === canal.id)}>
              {canal.label}
            </div>
          ))}
        </div>

        {isIndicacao && (
          <div style={{ marginTop: 10, padding: 14, borderLeft: `2px solid ${C.accent}`, background: 'rgba(109,94,248,.08)', borderRadius: '0 8px 8px 0' }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: '#c3c7d4' }}>Você sabe quem indicou?</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <div
                onClick={() => setForm((prev) => ({ ...prev, sabeQuemIndicou: true }))}
                style={toggleBtnStyle(form.sabeQuemIndicou === true)}
              >
                Sim
              </div>
              <div
                onClick={() => setForm((prev) => ({ ...prev, sabeQuemIndicou: false, nomeIndicador: '' }))}
                style={toggleBtnStyle(form.sabeQuemIndicou === false)}
              >
                Não sei quem indicou
              </div>
            </div>
            {form.sabeQuemIndicou === true && (
              <input
                value={form.nomeIndicador}
                onChange={(e) => setForm((prev) => ({ ...prev, nomeIndicador: e.target.value }))}
                placeholder="Nome de quem indicou"
                style={{ ...inputStyle, padding: '10px 12px', fontSize: 13, borderRadius: 8 }}
              />
            )}
          </div>
        )}
      </div>

      {!modoReconciliacao && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>4. Status de Fechamento</div>
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 10 }}>
            <div
              onClick={() => setForm((prev) => ({ ...prev, statusFechamento: 'sim' }))}
              style={toggleBtnStyle(form.statusFechamento === 'sim')}
            >
              Sim (virou paciente ativo)
            </div>
            <div
              onClick={() => setForm((prev) => ({ ...prev, statusFechamento: 'nao' }))}
              style={toggleBtnStyle(form.statusFechamento === 'nao')}
            >
              Não (ficou apenas como lead)
            </div>
          </div>
        </div>
      )}

      <div id="btn_salvar_contato" onClick={() => isValid() && handleSalvar()} style={primaryBtnStyle(isValid())}>
        ✓ Salvar Contato
      </div>
    </div>
  );
}
