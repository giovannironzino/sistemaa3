// PainelPacientes.tsx
// Painel lateral direito (260px) — lista ao vivo dos contatos marcados "virou paciente"
// em Captação, visível em todas as telas do fluxo CRM.

import React from 'react';
import { ContatoCaptacao } from '../../fase02/fase02.types';
import { formatDateBR } from '../../fase02/lib/contatoUtils';
import { C } from '../../fase02/ui/tokens';

interface PainelPacientesProps {
  contatos: ContatoCaptacao[];
}

export default function PainelPacientes({ contatos }: PainelPacientesProps) {
  const ordenados = [...contatos].sort((a, b) => (a.data < b.data ? 1 : -1));

  return (
    <div
      className="w-[260px] shrink-0"
      style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14, padding: 18, position: 'sticky', top: 24 }}
    >
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Pacientes no CRM</div>
      <div style={{ fontSize: 12, color: C.textSecondary, marginBottom: 14 }}>
        {ordenados.length} marcados como "virou paciente".
      </div>
      {ordenados.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 520, overflowY: 'auto' }}>
          {ordenados.map((c) => (
            <div key={c.id} style={{ background: C.input, border: `1px solid ${C.inputBorder}`, borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>{c.nomeContato}</div>
              <div style={{ fontSize: 11, color: C.textMuted2, marginTop: 2 }}>{formatDateBR(c.data)}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>
          Nenhum paciente confirmado em Captação ainda.
        </div>
      )}
    </div>
  );
}
