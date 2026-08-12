// calcularDreExecutiva.ts
// Motor de Cálculo da DRE Executiva, Diagnóstico Fiscal (CPF vs CNPJ) e Break-even Point para o Eixo 08.

export interface DespesaFixaItem {
  id: string;
  categoria: 'software' | 'equipe' | 'estrutura' | 'imposto' | 'marketing' | 'outros';
  descricao: string;
  valorMensal: number;
  origemAutomatico?: string; // Ex: 'Eixo 07 (Folha)', 'Eixo 01 & 06 (Software)'
}

export interface ResultadoDreExecutiva {
  faturamentoBrutoMensal: number;
  impostosETaxasMensais: number;
  margemContribuicaoMensal: number;
  despesasFixasTotaisMensais: number;
  despesasEquipeFolhaMensal: number;
  despesasSoftwareMensal: number;
  despesasEstruturaMensal: number;
  lucroLiquidoMensal: number;
  margemEbitdaPercentual: number;
  pontoEquilibrioPacientesAtivos: number; // N_breakeven
  pontoEquilibrioFaturamentoMensal: number;
  pacientesAcimaBreakEven: number;
  // Comparativo Fiscal
  impostoCpfCarnêLeaoMensal: number;
  impostoCnpjSimplesMensal: number;
  economiaAnualCnpj: number;
}

export function calcularDreExecutiva(
  despesasFixas: DespesaFixaItem[],
  faturamentoBrutoInput: number = 22500,
  pacientesAtivosContagem: number = 38,
  ticketMedioInput: number = 450
): ResultadoDreExecutiva {
  const faturamentoBrutoMensal = Math.max(0, faturamentoBrutoInput);
  const ticketMedio = Math.max(1, ticketMedioInput);

  // Categorização de Despesas Fixas
  let despesasEquipeFolhaMensal = 0;
  let despesasSoftwareMensal = 0;
  let despesasEstruturaMensal = 0;

  despesasFixas.forEach((d) => {
    if (d.categoria === 'equipe') despesasEquipeFolhaMensal += d.valorMensal;
    else if (d.categoria === 'software') despesasSoftwareMensal += d.valorMensal;
    else despesasEstruturaMensal += d.valorMensal;
  });

  const despesasFixasTotaisMensais = Math.max(0, despesasEquipeFolhaMensal + despesasSoftwareMensal + despesasEstruturaMensal);

  // Impostos e Taxas (CNPJ Simples Nacional Anexo III ~6%)
  const impostoCnpjSimplesMensal = Number((faturamentoBrutoMensal * 0.06).toFixed(2));
  const taxasCartaoMensal = Number((faturamentoBrutoMensal * 0.035).toFixed(2)); // ~3.5% taxas de gateway
  const impostosETaxasMensais = Number((impostoCnpjSimplesMensal + taxasCartaoMensal).toFixed(2));

  // Margem de Contribuição e Lucro Líquido
  const margemContribuicaoMensal = Number((faturamentoBrutoMensal - impostosETaxasMensais).toFixed(2));
  const lucroLiquidoMensal = Number((margemContribuicaoMensal - despesasFixasTotaisMensais).toFixed(2));
  const margemEbitdaPercentual = faturamentoBrutoMensal > 0
    ? Number(((lucroLiquidoMensal / faturamentoBrutoMensal) * 100).toFixed(1))
    : 0;

  // Break-even Point (Ponto de Equilíbrio)
  const pontoEquilibrioFaturamentoMensal = Number((despesasFixasTotaisMensais / 0.905).toFixed(2)); // considerando ~9.5% custos variáveis
  const pontoEquilibrioPacientesAtivos = Math.ceil(pontoEquilibrioFaturamentoMensal / ticketMedio);
  const pacientesAcimaBreakEven = Math.max(0, pacientesAtivosContagem - pontoEquilibrioPacientesAtivos);

  // Comparativo Fiscal CPF vs CNPJ
  // CPF Carnê-Leão alíquota efetiva ~22% vs CNPJ Simples Nacional ~6%
  const impostoCpfCarnêLeaoMensal = Number((faturamentoBrutoMensal * 0.22).toFixed(2));
  const economiaMensalCnpj = Math.max(0, impostoCpfCarnêLeaoMensal - impostoCnpjSimplesMensal);
  const economiaAnualCnpj = Number((economiaMensalCnpj * 12).toFixed(2));

  return {
    faturamentoBrutoMensal,
    impostosETaxasMensais,
    margemContribuicaoMensal,
    despesasFixasTotaisMensais,
    despesasEquipeFolhaMensal,
    despesasSoftwareMensal,
    despesasEstruturaMensal,
    lucroLiquidoMensal,
    margemEbitdaPercentual,
    pontoEquilibrioPacientesAtivos,
    pontoEquilibrioFaturamentoMensal,
    pacientesAcimaBreakEven,
    impostoCpfCarnêLeaoMensal,
    impostoCnpjSimplesMensal,
    economiaAnualCnpj,
  };
}
