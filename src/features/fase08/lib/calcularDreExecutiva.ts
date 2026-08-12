// calcularDreExecutiva.ts
// Motor de Cálculo Completo da DRE Clássica Executiva A3, Histórico dos 12 Meses, Break-even e Diagnóstico Fiscal.

export interface DespesaFixaItem {
  id: string;
  categoria: 'software' | 'equipe' | 'estrutura' | 'imposto' | 'marketing' | 'outros';
  descricao: string;
  valorMensal: number;
  origemAutomatico?: string; // Ex: 'Eixo 07 (Folha)', 'Eixo 01 & 06'
}

export interface FaturamentoMensalHistorico {
  mesLabel: string; // Ex: 'Jul/25'
  valor: number;
}

export interface ResultadoDreExecutiva {
  faturamentoBrutoMensal: number;
  entradasReaisCaixa: number;
  impostosETaxasMensais: number;
  insumosDiretosConsultasMensal: number;
  margemContribuicaoMensal: number;
  despesasFixasTotaisMensais: number;
  despesasEquipeFolhaMensal: number;
  despesasSoftwareMensal: number;
  despesasEstruturaMensal: number;
  ebitdaOperacionalMensal: number;
  proLaborePessoalMensal: number;
  lucroLiquidoMensal: number;
  margemEbitdaPercentual: number;
  pontoEquilibrioPacientesAtivos: number; // N_breakeven
  pontoEquilibrioFaturamentoMensal: number;
  pacientesAcimaBreakEven: number;
  // Comparativo Fiscal
  impostoCpfCarnêLeaoMensal: number;
  impostoCnpjSimplesMensal: number;
  economiaAnualCnpj: number;
  // Histórico 12 Meses
  historico12Meses: FaturamentoMensalHistorico[];
  mediaFaturamento12Meses: number;
  mesPicoHistorico: string;
  mesValeHistorico: string;
}

export function calcularDreExecutiva(
  despesasFixas: DespesaFixaItem[],
  faturamentoBrutoInput: number = 22500,
  pacientesAtivosContagem: number = 38,
  ticketMedioInput: number = 450,
  insumoPorConsultaInput: number = 15,
  proLaboreInput: number = 5000,
  historicoInput: FaturamentoMensalHistorico[] = []
): ResultadoDreExecutiva {
  const faturamentoBrutoMensal = Math.max(0, faturamentoBrutoInput);
  const entradasReaisCaixa = Math.max(0, faturamentoBrutoMensal * 0.96); // ~96% das vendas convertidas em caixa imediato
  const ticketMedio = Math.max(1, ticketMedioInput);

  // Categorização das Despesas Fixas (Tabela CRUD)
  let despesasEquipeFolhaMensal = 0;
  let despesasSoftwareMensal = 0;
  let despesasEstruturaMensal = 0;

  despesasFixas.forEach((d) => {
    if (d.categoria === 'equipe') despesasEquipeFolhaMensal += d.valorMensal;
    else if (d.categoria === 'software') despesasSoftwareMensal += d.valorMensal;
    else despesasEstruturaMensal += d.valorMensal;
  });

  const despesasFixasTotaisMensais = Math.max(0, despesasEquipeFolhaMensal + despesasSoftwareMensal + despesasEstruturaMensal);

  // Impostos (~6% Simples) & Taxas de Cartão (~3.5%)
  const impostoCnpjSimplesMensal = Number((faturamentoBrutoMensal * 0.06).toFixed(2));
  const taxasCartaoMensal = Number((faturamentoBrutoMensal * 0.035).toFixed(2));
  const impostosETaxasMensais = Number((impostoCnpjSimplesMensal + taxasCartaoMensal).toFixed(2));

  // Insumos Diretos por Consulta (ex: R$ 15/consulta * quantidade de consultas)
  const estimativaConsultasMensais = Math.round(pacientesAtivosContagem * 1.5);
  const insumosDiretosConsultasMensal = Number((insumoPorConsultaInput * estimativaConsultasMensais).toFixed(2));

  // Margem de Contribuição
  const margemContribuicaoMensal = Number(
    (faturamentoBrutoMensal - impostosETaxasMensais - insumosDiretosConsultasMensal).toFixed(2)
  );

  // EBITDA Operacional (Antes do Pró-Labore)
  const ebitdaOperacionalMensal = Number((margemContribuicaoMensal - despesasFixasTotaisMensais).toFixed(2));

  // Pró-Labore Pessoal & Lucro Líquido Retido no Caixa
  const proLaborePessoalMensal = Math.max(0, proLaboreInput);
  const lucroLiquidoMensal = Number((ebitdaOperacionalMensal - proLaborePessoalMensal).toFixed(2));
  const margemEbitdaPercentual = faturamentoBrutoMensal > 0
    ? Number(((ebitdaOperacionalMensal / faturamentoBrutoMensal) * 100).toFixed(1))
    : 0;

  // Break-even Point (Ponto de Equilíbrio)
  const pontoEquilibrioFaturamentoMensal = Number(
    ((despesasFixasTotaisMensais + proLaborePessoalMensal) / 0.905).toFixed(2)
  );
  const pontoEquilibrioPacientesAtivos = Math.ceil(pontoEquilibrioFaturamentoMensal / ticketMedio);
  const pacientesAcimaBreakEven = Math.max(0, pacientesAtivosContagem - pontoEquilibrioPacientesAtivos);

  // Comparativo Fiscal CPF vs CNPJ
  const impostoCpfCarnêLeaoMensal = Number((faturamentoBrutoMensal * 0.22).toFixed(2));
  const economiaMensalCnpj = Math.max(0, impostoCpfCarnêLeaoMensal - impostoCnpjSimplesMensal);
  const economiaAnualCnpj = Number((economiaMensalCnpj * 12).toFixed(2));

  // Histórico dos 12 Meses (M-12 a M-1)
  const historico12Meses = historicoInput.length === 12 ? historicoInput : geradoHistorico12MesesDefault(faturamentoBrutoMensal);
  const somaHistorico = historico12Meses.reduce((acc, h) => acc + h.valor, 0);
  const mediaFaturamento12Meses = Number((somaHistorico / 12).toFixed(2));

  let mesPico = historico12Meses[0]?.mesLabel || 'N/A';
  let mesVale = historico12Meses[0]?.mesLabel || 'N/A';
  let maxV = -1;
  let minV = Infinity;

  historico12Meses.forEach((h) => {
    if (h.valor > maxV) {
      maxV = h.valor;
      mesPico = h.mesLabel;
    }
    if (h.valor < minV) {
      minV = h.valor;
      mesVale = h.mesLabel;
    }
  });

  return {
    faturamentoBrutoMensal,
    entradasReaisCaixa,
    impostosETaxasMensais,
    insumosDiretosConsultasMensal,
    margemContribuicaoMensal,
    despesasFixasTotaisMensais,
    despesasEquipeFolhaMensal,
    despesasSoftwareMensal,
    despesasEstruturaMensal,
    ebitdaOperacionalMensal,
    proLaborePessoalMensal,
    lucroLiquidoMensal,
    margemEbitdaPercentual,
    pontoEquilibrioPacientesAtivos,
    pontoEquilibrioFaturamentoMensal,
    pacientesAcimaBreakEven,
    impostoCpfCarnêLeaoMensal,
    impostoCnpjSimplesMensal,
    economiaAnualCnpj,
    historico12Meses,
    mediaFaturamento12Meses,
    mesPicoHistorico: mesPico,
    mesValeHistorico: mesVale,
  };
}

function geradoHistorico12MesesDefault(baseAtual: number): FaturamentoMensalHistorico[] {
  const meses = ['Jul/25', 'Ago/25', 'Set/25', 'Out/25', 'Nov/25', 'Dez/25', 'Jan/26', 'Fev/26', 'Mar/26', 'Abr/26', 'Mai/26', 'Jun/26'];
  const fatores = [0.85, 0.90, 0.95, 1.0, 1.05, 0.80, 0.90, 0.95, 1.0, 1.05, 1.10, 1.0];
  return meses.map((mes, idx) => ({
    mesLabel: mes,
    valor: Math.round(baseAtual * fatores[idx]),
  }));
}
