// dateUtils.ts
// Motor Central de Datas Dinâmicas e Reativas para o Sistema A3
// Converte 100% dos rótulos temporais frios (M-2, M-1, M-0, 90 dias) em Nomes de Meses e Anos Reais

export interface DatasFormatadasA3 {
  mesM2: string; // ex: "Junho / 2026"
  mesM1: string; // ex: "Julho / 2026"
  mesM0: string; // ex: "Agosto / 2026 (Mês Atual)"
  mesM2Curto: string; // ex: "Jun/26"
  mesM1Curto: string; // ex: "Jul/26"
  mesM0Curto: string; // ex: "Ago/26"
  intervaloTrimestreRecente: string; // ex: "Maio / 2026 a Julho / 2026"
  intervaloProximos90Dias: string; // ex: "Agosto / 2026 a Outubro / 2026"
  anoAtual: number;
  mesAtualNome: string;
}

const NOMES_MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const NOMES_MESES_CURTOS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

/**
 * Calcula todas as datas e períodos formatados reativamente
 * com base na data do calendário (ou data de criação/atualização do cliente no Firestore).
 */
export function obterDatasA3(dataReferenciaInput?: Date | string | null): DatasFormatadasA3 {
  let refDate: Date;
  if (dataReferenciaInput) {
    refDate = new Date(dataReferenciaInput);
    if (isNaN(refDate.getTime())) refDate = new Date();
  } else {
    refDate = new Date();
  }

  // Mês M-0 (Mês Atual)
  const dM0 = new Date(refDate.getFullYear(), refDate.getMonth(), 1);
  // Mês M-1 (Mês Anterior)
  const dM1 = new Date(refDate.getFullYear(), refDate.getMonth() - 1, 1);
  // Mês M-2 (Há 2 Meses)
  const dM2 = new Date(refDate.getFullYear(), refDate.getMonth() - 2, 1);

  // Trimestre Recente (M-3 a M-1)
  const dM3 = new Date(refDate.getFullYear(), refDate.getMonth() - 3, 1);

  // Próximos 90 Dias (M-0 a M+2)
  const dPlus2 = new Date(refDate.getFullYear(), refDate.getMonth() + 2, 1);

  const formatMesAno = (d: Date) => `${NOMES_MESES[d.getMonth()]} / ${d.getFullYear()}`;
  const formatMesAnoCurto = (d: Date) => `${NOMES_MESES_CURTOS[d.getMonth()]}/${d.getFullYear().toString().slice(-2)}`;

  return {
    mesM2: formatMesAno(dM2),
    mesM1: formatMesAno(dM1),
    mesM0: `${formatMesAno(dM0)} (Mês Atual)`,
    mesM2Curto: formatMesAnoCurto(dM2),
    mesM1Curto: formatMesAnoCurto(dM1),
    mesM0Curto: formatMesAnoCurto(dM0),
    intervaloTrimestreRecente: `${NOMES_MESES[dM3.getMonth()]} / ${dM3.getFullYear()} a ${NOMES_MESES[dM1.getMonth()]} / ${dM1.getFullYear()}`,
    intervaloProximos90Dias: `${NOMES_MESES[dM0.getMonth()]} / ${dM0.getFullYear()} a ${NOMES_MESES[dPlus2.getMonth()]} / ${dPlus2.getFullYear()}`,
    anoAtual: refDate.getFullYear(),
    mesAtualNome: NOMES_MESES[refDate.getMonth()],
  };
}
