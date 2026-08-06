// TelaFinal.tsx
// CRM · Final — resultado da reconciliação, base de pacientes por mês.

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { C } from '../../fase02/ui/tokens';

interface FinalMonth {
  label: string;
  count: number;
  previewNames: string[];
  extraCount: number;
}

interface TelaFinalProps {
  primaryPlatform: string;
  simTotal: number;
  months: FinalMonth[];
  onVoltarCaptacao: () => void;
}

export default function TelaFinal({ primaryPlatform, simTotal, months, onVoltarCaptacao }: TelaFinalProps) {
  return (
    <div style={{ maxWidth: '100%' }}>
      <div style={{ display: 'inline-flex', padding: '5px 12px', borderRadius: 20, background: C.successBg, color: C.successSoft, fontSize: 11, fontWeight: 700, letterSpacing: '.04em', marginBottom: 18 }}>
        CRM · SINCRONIZADO COM {primaryPlatform.toUpperCase()}
      </div>
      <div className="flex flex-wrap items-end justify-between gap-5" style={{ marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.2 }}>Base de pacientes reconciliada</div>
          <div style={{ fontSize: 13, color: C.textSecondary, marginTop: 6 }}>
            Captação e {primaryPlatform} batem nos últimos 3 meses.
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 40, fontWeight: 800, color: C.accentText, lineHeight: 1 }}>{simTotal}</div>
          <div style={{ fontSize: 11, color: C.textMuted2, letterSpacing: '.04em' }}>PACIENTES NO CRM</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 16 }}>
        {months.map((fm) => (
          <div key={fm.label} style={{ background: 'linear-gradient(160deg,#141826,#0f1219)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16, padding: 22 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.05em', color: '#7d84f0', marginBottom: 10 }}>{fm.label}</div>
            <div style={{ fontSize: 34, fontWeight: 800, marginBottom: 4 }}>{fm.count}</div>
            <div style={{ fontSize: 12, color: C.successSoft, marginBottom: 18 }}>Confirmados em {primaryPlatform}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {fm.previewNames.map((nm) => (
                <div key={nm} style={{ fontSize: 12.5, color: '#c3c7d4', padding: '8px 10px', background: 'rgba(255,255,255,.03)', borderRadius: 7 }}>
                  {nm}
                </div>
              ))}
            </div>
            {fm.extraCount > 0 && (
              <div style={{ fontSize: 11, color: C.textMuted2, marginTop: 8 }}>+{fm.extraCount} outros</div>
            )}
          </div>
        ))}
      </div>

      <div
        onClick={onVoltarCaptacao}
        style={{ marginTop: 28, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: C.textSecondary, cursor: 'pointer' }}
      >
        <ArrowLeft size={14} /> Voltar para Captação
      </div>
    </div>
  );
}
