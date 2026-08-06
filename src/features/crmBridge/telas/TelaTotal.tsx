// TelaTotal.tsx
// CRM · Total — um único número de pacientes que a plataforma mostra nos últimos 90 dias.

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { C, badgeStyle, primaryBtnStyle, inputStyle } from '../../fase02/ui/tokens';

interface TelaTotalProps {
  primaryPlatform: string;
  totalCount: string;
  onSetTotalCount: (v: string) => void;
  onContinuar: () => void;
  onVoltar: () => void;
}

export default function TelaTotal({ primaryPlatform, totalCount, onSetTotalCount, onContinuar, onVoltar }: TelaTotalProps) {
  const enabled = totalCount !== '';
  return (
    <div>
      <div
        onClick={onVoltar}
        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: C.textSecondary, cursor: 'pointer', marginBottom: 18, width: 'fit-content' }}
      >
        <ArrowLeft size={14} /> Voltar
      </div>
      <div style={badgeStyle}>CRM · PONTE CAPTAÇÃO → VENDAS</div>
      <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.35, marginTop: 16, marginBottom: 22 }}>
        No total, quantos pacientes {primaryPlatform} mostra cadastrados nos últimos 90 dias?
      </div>
      <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 12, padding: 20, marginBottom: 22 }}>
        <input
          type="number"
          value={totalCount}
          onChange={(e) => onSetTotalCount(e.target.value)}
          placeholder="Ex: 24"
          style={inputStyle}
        />
      </div>
      <div onClick={() => enabled && onContinuar()} style={primaryBtnStyle(enabled)}>
        Confirmar
      </div>
    </div>
  );
}
