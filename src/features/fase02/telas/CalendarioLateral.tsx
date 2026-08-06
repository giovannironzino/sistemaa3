// CalendarioLateral.tsx
// Aside de navegação por data — últimos 3 meses, visível nas telas Lista/Formulário/Reconciliação.

import React from 'react';
import { buildCalendarMonths } from '../lib/calendario';
import { C } from '../ui/tokens';

interface CalendarioLateralProps {
  datasComCadastro: Set<string>;
  selectedDate: string;
  onSelectDate: (iso: string) => void;
}

export default function CalendarioLateral({ datasComCadastro, selectedDate, onSelectDate }: CalendarioLateralProps) {
  const months = buildCalendarMonths(datasComCadastro, selectedDate);

  return (
    <div
      className="w-[288px] shrink-0"
      style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14, padding: 20 }}
    >
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Calendário de Captação</div>
      <div style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.5, marginBottom: 16 }}>
        Clique numa data para cadastrar os leads que chegaram naquele dia.
      </div>

      {months.map((month) => (
        <div key={month.label} style={{ marginBottom: 18 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '.04em',
              color: '#7d84f0',
              marginBottom: 8,
              textTransform: 'capitalize',
            }}
          >
            {month.label}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 4 }}>
            {month.dow.map((d, idx) => (
              <div key={idx} style={{ fontSize: 9, textAlign: 'center', color: C.textMuted, fontWeight: 600 }}>
                {d}
              </div>
            ))}
          </div>
          {month.weeks.map((week, wIdx) => (
            <div key={wIdx} style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 4 }}>
              {week.map((cell, cIdx) => {
                if (cell.blank) return <div key={cIdx} />;
                let bg = 'transparent';
                let border = '1px solid transparent';
                let color = cell.isFuture ? '#3a4050' : '#c3c7d4';
                if (cell.isSelected) {
                  bg = C.accent;
                  color = '#fff';
                } else if (cell.isToday) {
                  border = `1px solid ${C.accent}`;
                }
                return (
                  <div
                    key={cIdx}
                    onClick={() => !cell.isFuture && cell.iso && onSelectDate(cell.iso)}
                    style={{
                      position: 'relative',
                      height: 30,
                      borderRadius: 7,
                      background: bg,
                      border,
                      color,
                      cursor: cell.isFuture ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11.5,
                      fontWeight: cell.isToday || cell.isSelected ? 700 : 500,
                    }}
                  >
                    {cell.day}
                    {cell.hasEntries && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 3,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          background: C.success,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ))}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          fontSize: 11,
          color: C.textMuted2,
          borderTop: '1px solid rgba(255,255,255,.06)',
          paddingTop: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', border: `2px solid ${C.accent}` }} />
          Hoje
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.success }} />
          Já tem cadastro
        </div>
      </div>
    </div>
  );
}
