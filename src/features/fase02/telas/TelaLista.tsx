// TelaLista.tsx
// Lista de contatos do dia selecionado + checkbox de revisão de 90 dias + concluir.

import React from 'react';
import { Pencil, Trash2, Check } from 'lucide-react';
import { ContatoCaptacao } from '../fase02.types';
import { getLabelCanalById } from '../data/canaisOrigem';
import { getLabelById as getLabelClusterById } from '../../fase01/data/bancoDePromessas';
import { formatDateBR } from '../lib/contatoUtils';
import { C, badgeStyle, primaryBtnStyle } from '../ui/tokens';

interface TelaListaProps {
  selectedDate: string;
  contactsForDate: ContatoCaptacao[];
  totalGeral: number;
  rangeStart: string;
  rangeEnd: string;
  confirmChecked: boolean;
  onToggleConfirm: () => void;
  onStartAdd: () => void;
  onEditar: (contato: ContatoCaptacao) => void;
  onExcluir: (id: string) => void;
  onConcluir: () => void;
}

export default function TelaLista({
  selectedDate,
  contactsForDate,
  totalGeral,
  rangeStart,
  rangeEnd,
  confirmChecked,
  onToggleConfirm,
  onStartAdd,
  onEditar,
  onExcluir,
  onConcluir,
}: TelaListaProps) {
  const selectedDateFmt = formatDateBR(selectedDate);
  const concluirEnabled = totalGeral > 0 && confirmChecked;
  const concluirHint =
    totalGeral === 0
      ? 'Cadastre pelo menos 1 pessoa antes de concluir.'
      : !confirmChecked
      ? 'Confirme a revisão acima para continuar.'
      : '';

  return (
    <div>
      <div style={badgeStyle}>EIXO 02 · CAPTAÇÃO</div>
      <div style={{ fontSize: 26, fontWeight: 800, marginTop: 16, marginBottom: 6 }}>
        Pessoas cadastradas no dia <span style={{ color: C.accentText }}>{selectedDateFmt}</span>
      </div>
      <div style={{ fontSize: 13, color: C.textSecondary, marginBottom: 22 }}>
        {contactsForDate.length} contato(s) nesta data · {totalGeral} no total dos últimos 3 meses.
      </div>

      {contactsForDate.length === 0 ? (
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.cardBorder}`,
            borderRadius: 12,
            padding: 40,
            textAlign: 'center',
            color: C.textMuted2,
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          Nenhum contato cadastrado ainda neste dia.
          <br />
          Clique em "+ Cadastrar pessoa" abaixo para adicionar o primeiro contato.
        </div>
      ) : (
        <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
          <div
            className="hidden md:grid"
            style={{ gridTemplateColumns: '1.6fr 1.3fr 1.6fr .7fr .6fr', gap: 10, padding: '12px 18px', fontSize: 10, fontWeight: 700, letterSpacing: '.05em', color: C.textMuted, borderBottom: '1px solid rgba(255,255,255,.06)' }}
          >
            <div>NOME</div>
            <div>OBJETIVO</div>
            <div>CANAL</div>
            <div>FECHOU?</div>
            <div>AÇÕES</div>
          </div>
          {contactsForDate.map((c) => (
            <div
              key={c.id}
              id={`contato_row_${c.id}`}
              className="grid md:grid-cols-[1.6fr_1.3fr_1.6fr_.7fr_.6fr] grid-cols-1"
              style={{ gap: 10, padding: '14px 18px', fontSize: 13, alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,.04)' }}
            >
              <div style={{ fontWeight: 600 }}>{c.nomeContato}</div>
              <div style={{ color: '#c3c7d4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {getLabelClusterById(c.objetivoPrincipal)}
              </div>
              <div style={{ color: '#c3c7d4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {getLabelCanalById(c.canalOrigem)}
              </div>
              <div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 6,
                    background: c.statusFechamento === 'sim' ? 'rgba(34,197,94,.15)' : 'rgba(255,255,255,.06)',
                    color: c.statusFechamento === 'sim' ? C.successSoft : C.textSecondary,
                  }}
                >
                  {c.statusFechamento === 'sim' ? 'Sim' : 'Não'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  id={`btn_editar_${c.id}`}
                  onClick={() => onEditar(c)}
                  style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${C.inputBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.textSecondary }}
                >
                  <Pencil size={13} />
                </button>
                <button
                  type="button"
                  id={`btn_excluir_${c.id}`}
                  onClick={() => onExcluir(c.id)}
                  style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${C.inputBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.textSecondary }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        onClick={onStartAdd}
        id="btn_cadastrar_pessoa_dia"
        style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 12, padding: '16px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}
      >
        <span style={{ color: C.accentText }}>+</span> Cadastrar pessoa no dia {selectedDateFmt}
      </div>

      <div
        onClick={onToggleConfirm}
        id="checkbox_confirmar_revisao"
        style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 12, padding: '16px 18px', marginBottom: 14, cursor: 'pointer' }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: 5,
            border: confirmChecked ? 'none' : '1px solid #3a4155',
            background: confirmChecked ? C.accent : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            flex: 'none',
            marginTop: 1,
          }}
        >
          {confirmChecked && <Check size={11} strokeWidth={3} />}
        </div>
        <div style={{ fontSize: 12.5, color: '#c3c7d4', lineHeight: 1.5 }}>
          Confirmo que revisei WhatsApp/agenda e cadastrei todas as pessoas que me procuraram entre{' '}
          <b>{formatDateBR(rangeStart)}</b> e <b>{formatDateBR(rangeEnd)}</b>.
        </div>
      </div>

      <div id="btn_concluir_veredito" onClick={() => concluirEnabled && onConcluir()} style={primaryBtnStyle(concluirEnabled)}>
        ✓ Concluir e Gerar Veredito de Captação
      </div>
      {concluirHint && <div style={{ fontSize: 12, color: C.alert, marginTop: 10 }}>{concluirHint}</div>}
    </div>
  );
}
