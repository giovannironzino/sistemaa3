// TelaReconciliacao.tsx
// CRM · Reconciliação — compara o total informado na plataforma com o total
// de contatos "virou paciente" em Captação; se não bater, quebra por mês e
// permite cadastrar quem faltou (grava direto na base de Captação).

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { CrmMissingDraft } from '../crmBridge.types';
import { CANAIS_ORIGEM } from '../../fase02/data/canaisOrigem';
import { CLUSTERS } from '../../fase01/data/bancoDePromessas';
import { C, badgeStyle, primaryBtnStyle } from '../../fase02/ui/tokens';

interface MonthBreakdown {
  label: string;
  count: number;
}

interface TelaReconciliacaoProps {
  primaryPlatform: string;
  platformTotal: number;
  hasPlatformValue: boolean;
  simTotal: number;
  matched: boolean;
  monthBreakdown: MonthBreakdown[];
  missingOpen: boolean;
  missingDraft: CrmMissingDraft | null;
  onToggleMissingForm: () => void;
  onCloseMissingForm: () => void;
  onUpdateMissingDraft: (patch: Partial<CrmMissingDraft>) => void;
  onSaveMissing: () => void;
  onFinalizar: () => void;
  onVoltar: () => void;
}

export default function TelaReconciliacao({
  primaryPlatform,
  platformTotal,
  hasPlatformValue,
  simTotal,
  matched,
  monthBreakdown,
  missingOpen,
  missingDraft,
  onToggleMissingForm,
  onCloseMissingForm,
  onUpdateMissingDraft,
  onSaveMissing,
  onFinalizar,
  onVoltar,
}: TelaReconciliacaoProps) {
  const canSaveMissing = !!(
    missingDraft &&
    missingDraft.name.trim() &&
    missingDraft.objetivo &&
    missingDraft.canal &&
    missingDraft.date
  );

  const selectStyle: React.CSSProperties = {
    background: '#0f131b',
    border: `1px solid ${C.inputBorder}`,
    borderRadius: 8,
    padding: '10px 12px',
    color: C.textPrimary,
    fontSize: 13,
    fontFamily: 'inherit',
  };

  return (
    <div>
      <div
        onClick={onVoltar}
        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: C.textSecondary, cursor: 'pointer', marginBottom: 18, width: 'fit-content' }}
      >
        <ArrowLeft size={14} /> Voltar
      </div>
      <div style={badgeStyle}>CRM · PONTE CAPTAÇÃO → VENDAS</div>
      <div style={{ fontSize: 24, fontWeight: 800, marginTop: 16, marginBottom: 20 }}>Os números batem?</div>

      <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 12, padding: 22, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, color: C.textMuted2, letterSpacing: '.04em', marginBottom: 6 }}>EM {primaryPlatform.toUpperCase()}</div>
          <div style={{ fontSize: 32, fontWeight: 800 }}>{hasPlatformValue ? platformTotal : '—'}</div>
        </div>
        <div style={{ fontSize: 20, color: '#3a4155' }}>vs</div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: C.textMuted2, letterSpacing: '.04em', marginBottom: 6 }}>EM CAPTAÇÃO</div>
          <div style={{ fontSize: 32, fontWeight: 800 }}>{simTotal}</div>
        </div>
      </div>

      {matched ? (
        <div style={{ background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.35)', borderRadius: 12, padding: '16px 18px', fontSize: 13, fontWeight: 700, color: C.successSoft, textAlign: 'center', marginBottom: 20 }}>
          Os números coincidem. Tudo certo.
        </div>
      ) : (
        <div style={{ background: C.alertBg, border: `1px solid ${C.alertBorder}`, borderRadius: 12, padding: '18px 20px', marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.alert, marginBottom: 10 }}>
            Os números não coincidem. Vamos localizar a diferença por mês:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {monthBreakdown.map((g) => (
              <div key={g.label} style={{ display: 'flex', justifyContent: 'space-between', background: '#12161f', border: `1px solid ${C.inputBorder}`, borderRadius: 8, padding: '10px 14px', fontSize: 12.5 }}>
                <span>{g.label}</span>
                <span style={{ color: '#c3c7d4' }}>{g.count} paciente(s)</span>
              </div>
            ))}
          </div>
          <div
            onClick={onToggleMissingForm}
            style={{ background: '#12161f', border: `1px solid ${C.inputBorder}`, borderRadius: 10, padding: '13px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'center' }}
          >
            <span style={{ color: C.accentText }}>+</span> Cadastrar pessoa que faltou no CRM
          </div>

          {missingOpen && missingDraft && (
            <div style={{ background: '#12161f', border: '1px solid #2b3245', borderRadius: 10, padding: 16, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                value={missingDraft.name}
                onChange={(e) => onUpdateMissingDraft({ name: e.target.value })}
                placeholder="Nome do contato"
                style={selectStyle}
              />
              <select
                value={missingDraft.objetivo}
                onChange={(e) => onUpdateMissingDraft({ objetivo: e.target.value })}
                style={selectStyle}
              >
                <option value="">Objetivo principal</option>
                {CLUSTERS.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
              <select
                value={missingDraft.canal}
                onChange={(e) => onUpdateMissingDraft({ canal: e.target.value })}
                style={selectStyle}
              >
                <option value="">Canal de origem</option>
                {CANAIS_ORIGEM.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
              <div>
                <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 6 }}>Data em que essa pessoa te procurou</div>
                <input
                  type="date"
                  value={missingDraft.date}
                  onChange={(e) => onUpdateMissingDraft({ date: e.target.value })}
                  style={{ ...selectStyle, colorScheme: 'dark' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div
                  onClick={() => canSaveMissing && onSaveMissing()}
                  style={{
                    ...(canSaveMissing
                      ? { background: 'linear-gradient(135deg,#6d5ef8,#4f3fd6)', color: '#fff', cursor: 'pointer' }
                      : { background: C.disabledBg, color: C.disabledText, cursor: 'not-allowed' }),
                    flex: 1,
                    borderRadius: 8,
                    padding: 11,
                    fontSize: 13,
                    fontWeight: 700,
                    textAlign: 'center',
                  }}
                >
                  Salvar e Atualizar Captação
                </div>
                <div
                  onClick={onCloseMissingForm}
                  style={{ background: C.disabledBg, borderRadius: 8, padding: '11px 14px', fontSize: 13, fontWeight: 600, textAlign: 'center', cursor: 'pointer', color: C.textSecondary }}
                >
                  Cancelar
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div onClick={() => matched && onFinalizar()} style={primaryBtnStyle(matched)}>
        Finalizar
      </div>
    </div>
  );
}
