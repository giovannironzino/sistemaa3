// eixo01Derivations.ts
// Apuração dinâmica e pura de dados derivados dos pacientes mapeados do Eixo 01.

import { PacienteMapeadoEixo01, FATORES_PRIORITARIOS_POR_DOR, ClusterId } from '../fase01.types';
import { getLabelById } from '../data/bancoDePromessas';

export interface Eixo01Insights {
  totalMapeados: number;
  topDorId: ClusterId;
  topDorRotulo: string;
  topDorPct: number;
  topPilar: string;
  topPilarPct: number;
  topDiferencial: string;
  topDiferencialPct: number;
}

export function derivarInsightsEixo01(pacientes: PacienteMapeadoEixo01[]): Eixo01Insights {
  const totalMapeados = pacientes.length;

  if (totalMapeados === 0) {
    return {
      totalMapeados: 0,
      topDorId: 'estetica_emagrecimento',
      topDorRotulo: 'Perda de peso e mudança no corpo',
      topDorPct: 0,
      topPilar: 'Liberdade & Praticidade',
      topPilarPct: 0,
      topDiferencial: 'Transformação Visual',
      topDiferencialPct: 0,
    };
  }

  // 1. Contagem de Dor (Nicho)
  const contagemDor: Record<string, number> = {};
  pacientes.forEach((p) => {
    if (p.dorId) {
      contagemDor[p.dorId] = (contagemDor[p.dorId] || 0) + 1;
    }
  });

  let topDorId: ClusterId = 'estetica_emagrecimento';
  let maxVotosDor = 0;
  Object.entries(contagemDor).forEach(([dorId, qtd]) => {
    if (qtd > maxVotosDor) {
      maxVotosDor = qtd;
      topDorId = dorId as ClusterId;
    }
  });

  const topDorRotulo = getLabelById(topDorId);
  const topDorPct = Math.round((maxVotosDor / totalMapeados) * 100);

  // 2. Contagem do Pilar Forte (O que mais valorizam)
  const contagemPilar: Record<string, number> = {};
  pacientes.forEach((p) => {
    if (p.pilarForte) {
      contagemPilar[p.pilarForte] = (contagemPilar[p.pilarForte] || 0) + 1;
    }
  });

  let topPilar = FATORES_PRIORITARIOS_POR_DOR[topDorId]?.opcoes[0] || 'Liberdade & Praticidade';
  let maxVotosPilar = 0;
  Object.entries(contagemPilar).forEach(([pilar, qtd]) => {
    if (qtd > maxVotosPilar) {
      maxVotosPilar = qtd;
      topPilar = pilar;
    }
  });

  const topPilarPct = maxVotosPilar > 0 ? Math.round((maxVotosPilar / totalMapeados) * 100) : 0;

  // 3. Contagem do Elemento Diferencial (O que percebem como diferente)
  const contagemDiferencial: Record<string, number> = {};
  pacientes.forEach((p) => {
    if (p.elementoDiferencial) {
      contagemDiferencial[p.elementoDiferencial] = (contagemDiferencial[p.elementoDiferencial] || 0) + 1;
    }
  });

  let topDiferencial = FATORES_PRIORITARIOS_POR_DOR[topDorId]?.opcoes[1] || 'Transformação Visual';
  let maxVotosDiferencial = 0;
  Object.entries(contagemDiferencial).forEach(([dif, qtd]) => {
    if (qtd > maxVotosDiferencial) {
      maxVotosDiferencial = qtd;
      topDiferencial = dif;
    }
  });

  const topDiferencialPct = maxVotosDiferencial > 0 ? Math.round((maxVotosDiferencial / totalMapeados) * 100) : 0;

  return {
    totalMapeados,
    topDorId,
    topDorRotulo,
    topDorPct,
    topPilar,
    topPilarPct,
    topDiferencial,
    topDiferencialPct,
  };
}
