// TelaPlataformaPrincipal.tsx
// CRM · Plataforma Principal — só aparece quando múltiplas plataformas foram marcadas.

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { CrmPlatformId } from '../crmBridge.types';
import { C, badgeStyle, toggleBtnStyle, primaryBtnStyle } from '../../fase02/ui/tokens';

interface TelaPlataformaPrincipalProps {
  platforms: CrmPlatformId[];
  primaryPlatform: CrmPlatformId | '';
  onSelectPrimary: (p: CrmPlatformId) => void;
  onContinuar: () => void;
  onVoltar: () => void;
}

export default function TelaPlataformaPrincipal({
  platforms,
  primaryPlatform,
  onSelectPrimary,
  onContinuar,
  onVoltar,
}: TelaPlataformaPrincipalProps) {
  const enabled = !!primaryPlatform;
  return (
    <div>
      <div
        onClick={onVoltar}
        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: C.textSecondary, cursor: 'pointer', marginBottom: 18, width: 'fit-content' }}
      >
        <ArrowLeft size={14} /> Voltar
      </div>
      <div style={badgeStyle}>CRM · PONTE CAPTAÇÃO → VENDAS</div>
      <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.35, marginTop: 16, marginBottom: 20 }}>
        Qual plataforma você tem <span style={{ color: C.alert }}>CERTEZA</span> que todos os pacientes estão cadastrados?
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 10, marginBottom: 22 }}>
        {platforms.map((p) => (
          <div key={p} onClick={() => onSelectPrimary(p)} style={toggleBtnStyle(primaryPlatform === p)}>
            {p}
          </div>
        ))}
      </div>
      <div onClick={() => enabled && onContinuar()} style={primaryBtnStyle(enabled)}>
        Continuar
      </div>
    </div>
  );
}
