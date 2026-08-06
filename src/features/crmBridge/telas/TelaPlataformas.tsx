// TelaPlataformas.tsx
// CRM · Plataformas — seleção múltipla da(s) plataforma(s) usada(s) para organizar pacientes.

import React from 'react';
import { CrmPlatformId, CRM_PLATFORMS } from '../crmBridge.types';
import { C, badgeStyle, toggleBtnStyle, primaryBtnStyle } from '../../fase02/ui/tokens';

interface TelaPlataformasProps {
  platforms: CrmPlatformId[];
  onTogglePlatform: (p: CrmPlatformId) => void;
  onContinuar: () => void;
}

export default function TelaPlataformas({ platforms, onTogglePlatform, onContinuar }: TelaPlataformasProps) {
  const enabled = platforms.length > 0;
  return (
    <div>
      <div style={badgeStyle}>CRM · PONTE CAPTAÇÃO → VENDAS</div>
      <div style={{ fontSize: 24, fontWeight: 800, marginTop: 16, marginBottom: 10 }}>
        Qual plataforma você usa para organizar seus pacientes?
      </div>
      <div style={{ fontSize: 13, color: C.textSecondary, marginBottom: 20 }}>
        Você pode selecionar mais de uma opção.
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 10, marginBottom: 22 }}>
        {CRM_PLATFORMS.map((p) => (
          <div key={p} onClick={() => onTogglePlatform(p)} style={toggleBtnStyle(platforms.includes(p))}>
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
