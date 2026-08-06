// TelaReconciliacao.tsx
// Pergunta opcional de prontuário + "ficou faltando cadastrar alguém?" + Continuar.

import React from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { ContatoCaptacao } from '../fase02.types';
import { formatDateBR } from '../lib/contatoUtils';
import { C, badgeStyle, toggleBtnStyle, gradientAccent } from '../ui/tokens';

interface TelaReconciliacaoProps {
  prontuarioCount: string;
  onSetProntuarioCount: (v: string) => void;
  reconcileAnswer: '' | 'sim' | 'nao';
  onSetReconcileAnswer: (v: 'sim' | 'nao') => void;
  reconcileContacts: ContatoCaptacao[];
  onExcluir: (id: string) => void;
  onStartAddForgotten: () => void;
  onContinuar: () => void;
  onVoltar: () => void;
}

export default function TelaReconciliacao({
  prontuarioCount,
  onSetProntuarioCount,
  reconcileAnswer,
  onSetReconcileAnswer,
  reconcileContacts,
  onExcluir,
  onStartAddForgotten,
  onContinuar,
  onVoltar,
}: TelaReconciliacaoProps) {
  return (
    <div>
      <div
        onClick={onVoltar}
        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: C.textSecondary, cursor: 'pointer', marginBottom: 18, width: 'fit-content' }}
      >
        <ArrowLeft size={14} /> Voltar
      </div>
      <div style={{ display: 'inline-flex', padding: '5px 12px', borderRadius: 20, border: '1px solid rgba(109,94,248,.4)', color: C.accentText, fontSize: 11, fontWeight: 700, letterSpacing: '.04em', marginBottom: 16 }}>
        EIXO 02 · CAPTAÇÃO — RECONCILIAÇÃO
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.35, marginBottom: 14 }}>
        Você usa algum sistema de prontuário ou plano alimentar (ex: WebDiet)? Se sim, quantos pacientes novos ele mostra nos últimos 90 dias?
      </div>
      <div style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.6, marginBottom: 20 }}>
        Opcional — deixe em branco se não usa ou não sabe.
      </div>
      <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 12, padding: 20, marginBottom: 22 }}>
        <input
          type="number"
          min={0}
          value={prontuarioCount}
          onChange={(e) => onSetProntuarioCount(e.target.value)}
          placeholder="Deixe em branco se não usa ou não sabe"
          style={{ width: '100%', boxSizing: 'border-box', background: C.input, border: `1px solid ${C.inputBorder}`, borderRadius: 10, padding: '13px 14px', color: C.textPrimary, fontSize: 14, fontFamily: 'inherit' }}
        />
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 12, padding: 20, marginBottom: 22 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Ficou faltando cadastrar alguém que você lembrou agora?</div>
        <div className="grid grid-cols-2" style={{ gap: 10 }}>
          <div onClick={() => onSetReconcileAnswer('sim')} style={toggleBtnStyle(reconcileAnswer === 'sim')}>Sim</div>
          <div onClick={() => onSetReconcileAnswer('nao')} style={toggleBtnStyle(reconcileAnswer === 'nao')}>Não</div>
        </div>

        {reconcileAnswer === 'sim' && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,.06)' }}>
            {reconcileContacts.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                {reconcileContacts.map((rc) => (
                  <div key={rc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.input, border: `1px solid ${C.inputBorder}`, borderRadius: 8, padding: '10px 12px' }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{rc.nomeContato}</span>
                      <span style={{ fontSize: 11, color: C.textMuted2, marginLeft: 8 }}>{formatDateBR(rc.data)}</span>
                    </div>
                    <div
                      onClick={() => onExcluir(rc.id)}
                      style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${C.inputBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.textSecondary }}
                    >
                      <Trash2 size={12} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div
              onClick={onStartAddForgotten}
              style={{ background: C.input, border: `1px solid ${C.inputBorder}`, borderRadius: 10, padding: '13px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'center' }}
            >
              <span style={{ color: C.accentText }}>+</span> Cadastrar pessoa que ficou faltando
            </div>
          </div>
        )}
      </div>

      <div
        onClick={onContinuar}
        style={{ background: gradientAccent, borderRadius: 12, padding: '16px 18px', fontSize: 14, fontWeight: 700, cursor: 'pointer', textAlign: 'center', color: '#fff', maxWidth: 220 }}
      >
        Continuar
      </div>
    </div>
  );
}
