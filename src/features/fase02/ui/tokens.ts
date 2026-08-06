// tokens.ts
import type React from 'react';
// Paleta e estilos compartilhados do redesign "Eixo 02 · Captação + Ponte CRM"
// (ver Layouts/ handoff: Eixo02-Captacao.dc.html). Usado por src/features/fase02/telas
// e src/features/crmBridge/telas para manter fidelidade visual entre as duas features.
// Aplicado via style={{}} inline (mesmo padrão hand-rolled do resto do app, sem
// arquivo de tema Tailwind global — não afeta o restante do produto).

export const C = {
  bg: '#0a0e17',
  card: '#10141d',
  cardBorder: 'rgba(255,255,255,.07)',
  input: '#12161f',
  inputBorder: '#232838',
  textPrimary: '#eef0f5',
  textSecondary: '#9aa1b3',
  textMuted: '#5b6172',
  textMuted2: '#7a8194',
  accent: '#6d5ef8',
  accentDark: '#4f3fd6',
  accentText: '#a596ff',
  accentSoft: 'rgba(109,94,248,.14)',
  success: '#22c55e',
  successSoft: '#4ade80',
  successBg: 'rgba(34,197,94,.12)',
  alert: '#f5a524',
  alertBg: 'rgba(245,165,36,.08)',
  alertBorder: 'rgba(245,165,36,.3)',
  error: '#f16b6b',
  disabledBg: '#1a1f2c',
  disabledText: '#4a5065',
  track: '#1a1f2c',
} as const;

export const gradientAccent = `linear-gradient(135deg,${C.accent},${C.accentDark})`;
export const gradientBar = `linear-gradient(90deg,${C.accent},${C.accentDark})`;

export const cardStyle: React.CSSProperties = {
  background: C.card,
  border: `1px solid ${C.cardBorder}`,
  borderRadius: 12,
};

export const badgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  padding: '5px 12px',
  borderRadius: 20,
  background: C.accentSoft,
  color: C.accentText,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '.04em',
};

export function chipStyle(selected: boolean): React.CSSProperties {
  return {
    padding: '12px 14px',
    borderRadius: 9,
    fontSize: 13,
    fontWeight: selected ? 700 : 500,
    cursor: 'pointer',
    background: selected ? C.accent : C.input,
    color: selected ? '#fff' : '#c3c7d4',
    border: selected ? `1px solid ${C.accent}` : `1px solid ${C.inputBorder}`,
    lineHeight: 1.3,
  };
}

export function toggleBtnStyle(active: boolean): React.CSSProperties {
  return {
    padding: '13px 14px',
    borderRadius: 8,
    fontSize: 12.5,
    fontWeight: 600,
    cursor: 'pointer',
    textAlign: 'center',
    background: active ? C.accent : C.input,
    color: active ? '#fff' : '#c3c7d4',
    border: active ? `1px solid ${C.accent}` : `1px solid ${C.inputBorder}`,
  };
}

export function primaryBtnStyle(enabled: boolean): React.CSSProperties {
  return enabled
    ? {
        background: gradientAccent,
        color: '#fff',
        cursor: 'pointer',
        borderRadius: 12,
        padding: '16px 18px',
        fontSize: 14,
        fontWeight: 700,
        textAlign: 'center',
      }
    : {
        background: C.disabledBg,
        color: C.disabledText,
        cursor: 'not-allowed',
        borderRadius: 12,
        padding: '16px 18px',
        fontSize: 14,
        fontWeight: 700,
        textAlign: 'center',
      };
}

export const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: C.input,
  border: `1px solid ${C.inputBorder}`,
  borderRadius: 10,
  padding: '13px 14px',
  color: C.textPrimary,
  fontSize: 14,
  fontFamily: 'inherit',
};
