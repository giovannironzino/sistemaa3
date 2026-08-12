import { ClientBlocks, Scenario, FixedCostItem, ServiceData } from '../types';

// Convert HH:MM to minutes from midnight
function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hrs, mins] = timeStr.split(':').map(Number);
  return (hrs || 0) * 60 + (mins || 0);
}

// Calculate total available minutes per week
export function calculateAvailableMinutes(b6: ClientBlocks['b6']): {
  availableMin: number;
  commitmentsMin: number;
  netAvailableMin: number;
} {
  let totalMin = 0;

  // 1. Calculate time from days and shifts open
  b6.daysOpen?.forEach((day) => {
    const dayShifts = b6.shifts?.[day] || [];
    dayShifts.forEach((shift) => {
      const timeRange = b6.times?.[`${day}_${shift}`];
      if (timeRange && timeRange.start && timeRange.end) {
        const startMin = parseTimeToMinutes(timeRange.start);
        const endMin = parseTimeToMinutes(timeRange.end);
        if (endMin > startMin) {
          totalMin += (endMin - startMin);
        }
      }
    });
  });

  // 2. Subtract recurring commitments
  let commitmentsMin = 0;
  if (b6.hasRecurringCommitments === 'Sim' && b6.commitments) {
    b6.commitments.forEach((c) => {
      if (c.startTime && c.endTime) {
        const startMin = parseTimeToMinutes(c.startTime);
        const endMin = parseTimeToMinutes(c.endTime);
        if (endMin > startMin) {
          commitmentsMin += (endMin - startMin);
        }
      }
    });
  }

  const netAvailableMin = Math.max(0, totalMin - commitmentsMin);

  return {
    availableMin: totalMin,
    commitmentsMin,
    netAvailableMin,
  };
}

// Calculate fixed costs
export function calculateTotalFixedCosts(
  b8: ClientBlocks['b8'],
  b7: ClientBlocks['b7']
): {
  itemsCost: number;
  teamCost: number;
  loanCost: number;
  totalCost: number;
} {
  // Sum team costs
  const teamCost = b7.members?.reduce((acc, m) => acc + (m.cost || 0), 0) || 0;

  // Sum active fixed costs
  let itemsCost = 0;
  if (b8.fixedCosts) {
    Object.values(b8.fixedCosts).forEach((costItem: any) => {
      if (costItem && costItem.status === 'Sim') {
        itemsCost += (costItem.value || 0);
      }
    });
  }

  // Add loans
  const loanCost = b8.loanStatus === 'Sim' ? (b8.loanInstallment || 0) : 0;

  const totalCost = teamCost + itemsCost + loanCost;

  return {
    itemsCost,
    teamCost,
    loanCost,
    totalCost,
  };
}

// Calculate the average weekly minutes required for a single client in Block 5
export function calculateSingleClientWeeklyMinutes(
  b5: ClientBlocks['b5'],
  serviceDurationDays: number = 90 // Default to 90 days for amortization
): number {
  let totalWeeklyMin = 0;
  const weeksInDuration = Math.max(1, serviceDurationDays / 7);

  // Helper to amortize single/unique events over the service duration
  const amortize = (min: number) => min / weeksInDuration;

  // 1. Kit boas-vindas (Single)
  if (b5.kitBoasVindas?.included === 'Sim') {
    totalWeeklyMin += amortize(b5.kitBoasVindas.duration || 0);
  }

  // 2. Consulta inicial (Single)
  if (b5.consultaInicial?.included === 'Sim') {
    totalWeeklyMin += amortize(b5.consultaInicial.duration || 0);
  }

  // 3. Avaliação física (Repeated: times occurrences every everyDays days)
  if (b5.avaliacaoFisica?.included === 'Sim') {
    const times = b5.avaliacaoFisica.times || 0;
    const everyDays = b5.avaliacaoFisica.everyDays || 30;
    const totalMin = (b5.avaliacaoFisica.duration || 0) * times;
    // frequency in weeks
    const frequencyInWeeks = Math.max(1, everyDays / 7);
    totalWeeklyMin += totalMin / frequencyInWeeks;
  }

  // 4. Revisão de exames (Repeated: times occurrences every everyDays days)
  if (b5.revisaoExames?.included === 'Sim' && b5.avaliacaoFisica?.included === 'Sim') {
    const times = b5.revisaoExames.times || 0;
    const everyDays = b5.revisaoExames.everyDays || 30;
    const totalMin = (b5.revisaoExames.duration || 0) * times;
    const frequencyInWeeks = Math.max(1, everyDays / 7);
    totalWeeklyMin += totalMin / frequencyInWeeks;
  }

  // 5. Ajuste do plano (Occurs avgAdjustments times over entire period)
  if (b5.ajustePlano?.included === 'Sim') {
    const adjustments = b5.ajustePlano.avgAdjustments || 0;
    const totalMin = (b5.ajustePlano.duration || 0) * adjustments;
    totalWeeklyMin += amortize(totalMin);
  }

  // 6. Materiais de apoio (Occurs supportCount times, takes supportPrepTime)
  if (b5.materiaisApoio?.included === 'Sim') {
    const count = b5.materiaisApoio.supportCount || 0;
    const prepTime = b5.materiaisApoio.supportPrepTime || 0;
    const duration = b5.materiaisApoio.duration || 0;
    const totalMin = (prepTime + duration) * count;
    totalWeeklyMin += amortize(totalMin);
  }

  // 7. Consulta de acompanhamento
  if (b5.consultaAcompanhamento?.included === 'Sim') {
    const duration = b5.consultaAcompanhamento.duration || 0;
    if (b5.consultaAcompanhamento.frequencyType === 'Fixa') {
      // assume weekly frequency if not specified, let's treat the value as weeks, e.g., "A cada 2 semanas"
      // let's parse the string frequencyValue to get days/weeks. E.g. "A cada 15 dias" => frequency is 15 days
      const valStr = b5.consultaAcompanhamento.frequencyValue || '';
      const days = valStr.includes('dia') ? (parseInt(valStr) || 15) : (parseInt(valStr) * 7 || 14);
      totalWeeklyMin += duration / (days / 7);
    } else {
      totalWeeklyMin += amortize(duration * 3); // arbitrary amortization for phases
    }
  }

  // 8. Relatório de evolução
  if (b5.relatorioEvolucao?.included === 'Sim') {
    const times = b5.relatorioEvolucao.times || 0;
    const everyDays = b5.relatorioEvolucao.everyDays || 30;
    const totalMin = (b5.relatorioEvolucao.duration || 0) * times;
    const frequencyInWeeks = Math.max(1, everyDays / 7);
    totalWeeklyMin += totalMin / frequencyInWeeks;
  }

  // 9. Check-in
  if (b5.checkIn?.included === 'Sim') {
    const duration = b5.checkIn.duration || 0;
    const valStr = b5.checkIn.frequencyValue || '';
    const days = valStr.includes('dia') ? (parseInt(valStr) || 7) : (parseInt(valStr) * 7 || 7);
    totalWeeklyMin += duration / (days / 7);
  }

  // 10. Contato proativo
  if (b5.contatoProativo?.included === 'Sim') {
    const duration = b5.contatoProativo.duration || 0;
    const valStr = b5.contatoProativo.frequencyValue || '';
    const days = valStr.includes('dia') ? (parseInt(valStr) || 7) : (parseInt(valStr) * 7 || 7);
    totalWeeklyMin += duration / (days / 7);
  }

  // 11. Mudança de suplementação
  if (b5.mudancaSuplementacao?.included === 'Sim') {
    const adjustments = b5.mudancaSuplementacao.avgAdjustments || 0;
    const totalMin = (b5.mudancaSuplementacao.duration || 0) * adjustments;
    totalWeeklyMin += amortize(totalMin);
  }

  // 12. Plano alimentar inicial (Always included, unique)
  if (b5.planoAlimentarInicial) {
    totalWeeklyMin += amortize(b5.planoAlimentarInicial.duration || 0);
  }

  // Add custom deliveries
  if (b5.customDeliveries) {
    b5.customDeliveries.forEach((cd) => {
      const cdDuration = cd.duration || 0;
      let cadenceWeeks = 1;
      if (cd.type === 'único') {
        totalWeeklyMin += amortize(cdDuration);
      } else if (cd.type === 'sob demanda') {
        totalWeeklyMin += amortize(cdDuration * 2); // assume 2 times
      } else { // recorrente
        const val = parseInt(cd.cadence) || 1;
        cadenceWeeks = cd.cadence.includes('dia') ? val / 7 : val;
        totalWeeklyMin += cdDuration / cadenceWeeks;
      }
    });
  }

  return totalWeeklyMin;
}

// Calculate metrics for a scenario
export function calculateScenarioMetrics(
  scenarioServices: { serviceId: string; name: string; price: number; activePatients: number; durationDays?: number }[],
  b5: ClientBlocks['b5'],
  b6: ClientBlocks['b6'],
  b7: ClientBlocks['b7'],
  b8: ClientBlocks['b8'],
  faturamentoMeta: number
): Omit<Scenario, 'id' | 'name' | 'isReal' | 'createdAt'> {
  // 1. Calculate Monthly Revenue of Scenario
  let monthlyFaturamento = 0;
  let totalWeeklyMinRequired = 0;

  scenarioServices.forEach((s) => {
    const durationDays = s.durationDays || 90;
    // Calculate monthly faturamento contribution:
    // If a service package costs R$ 900 and lasts 90 days, the monthly equivalent per active patient is R$ 300.
    const monthlyEquivalentPrice = s.price / (durationDays / 30);
    monthlyFaturamento += monthlyEquivalentPrice * (s.activePatients || 0);

    // Calculate weekly time for this service
    const singleClientWeeklyMin = calculateSingleClientWeeklyMinutes(b5, durationDays);
    totalWeeklyMinRequired += singleClientWeeklyMin * (s.activePatients || 0);
  });

  // 2. Fixed Costs
  const { totalCost: fixedCosts } = calculateTotalFixedCosts(b8, b7);

  // 3. Break-even (Ponto de Equilíbrio faturamento)
  const pontoEquilibrio = fixedCosts;

  // 4. Capacity (Agenda)
  const { netAvailableMin } = calculateAvailableMinutes(b6);

  const capacidadePercentual = netAvailableMin > 0 ? (totalWeeklyMinRequired / netAvailableMin) * 100 : 0;

  // 5. Distance to Meta
  const distanciaMeta = faturamentoMeta - monthlyFaturamento;

  return {
    faturamentoMeta,
    services: scenarioServices,
    pontoEquilibrio,
    capacidadeMinutosDisponivel: netAvailableMin,
    capacidadeMinutosNecessaria: totalWeeklyMinRequired,
    capacidadePercentual,
    distanciaMeta,
  };
}

// Subtotal Helper for Block 4 (Services)
export function calculateServicesSubtotal(services: ServiceData[] = []) {
  let totalMonthlyRevenue = 0;
  let totalActivePatients = 0;

  services.forEach(s => {
    const durationDays = s.durationDays || 90;
    const monthlyPrice = (s.price || 0) / (durationDays / 30);
    const active = s.activePatients || 0;
    totalMonthlyRevenue += monthlyPrice * active;
    totalActivePatients += active;
  });

  return {
    totalMonthlyRevenue,
    totalActivePatients,
    serviceCount: services.length
  };
}

// Subtotal Helper for Block 7 (Team)
export function calculateTeamSubtotal(members: { cost: number }[] = []) {
  const totalTeamCost = members.reduce((acc, m) => acc + (m.cost || 0), 0);
  return {
    totalTeamCost,
    memberCount: members.length
  };
}

// ================================================================
// EIXO 08 — CÁLCULOS E PROCESSAMENTO FINANCEIRO
// ================================================================
export interface Block8Metrics {
  receitaMediaMensal: number;
  subtotalEstruturaFisica: number;
  subtotalTecnologia: number;
  subtotalServicosProfissionais: number;
  custoFolhaEquipe: number;
  subtotalTrafego: number;
  subtotalEventos: number;
  custoFixoTotalMensal: number;
  aliquotaImposto: number;
  taxaMeiosPagamento: number;
  taxaAntecipacao: number;
  comissaoPorcentagem: number;
  aliquotaVariavelDireta: number;
  comissaoFixaReais: number;
  subtotalKitsFrete: number;
  subtotalProducaoDieta: number;
  custoEntregaPacienteTotal: number;
  deducaoVariavelTotalMensal: number;
  lucroLiquidoReal: number;
  margemLiquidaReal: number;
  horasMensaisEixo06: number;
  reaisPorHora: number;
  custoFuncionamentoHora: number;
  vendasMensaisMediaEixo04: number;
  ticketMedioEixo04: number;
  breakevenVendas: number;
  margemSegurancaVendasPct: number;
  multiplicadorSobrevivencia: number;
  temHistorico12M: boolean;
  mesMaiorNome?: string;
  mesMaiorValor?: number;
  mesMenorNome?: string;
  mesMenorValor?: number;
  media12M?: number;
  amplitudeSazonalPct?: number;
}

export function calculateBlock8Metrics(blocks: ClientBlocks): Block8Metrics {
  const b8 = (blocks.b8 || {}) as any;
  const b7 = (blocks.b7 || {}) as any;
  const b6 = (blocks.b6 || {}) as any;
  const b4 = (blocks.b4 || {}) as any;

  // 1. Receita Média Mensal (3M)
  const m2 = Number(b8.faturamentoM2) || 0;
  const m1 = Number(b8.faturamentoM1) || 0;
  const m0 = Number(b8.faturamentoAtual) || 0;
  let receitaMediaMensal = (m2 + m1 + m0) / 3;

  // Fallback se não preencheu os 3M mas preencheu Eixo 04
  if (receitaMediaMensal === 0 && b4.services && b4.services.length > 0) {
    const sub = calculateServicesSubtotal(b4.services);
    receitaMediaMensal = sub.totalMonthlyRevenue;
  }

  // 2. Custos Fixos Desdobrados
  // 3.1 Estrutura Física
  let subtotalEstruturaFisica = 0;
  if (b8.possuiEstruturaFisica === 'Sim' && b8.estruturaFisica) {
    const ef = b8.estruturaFisica;
    subtotalEstruturaFisica = (Number(ef.aluguel) || 0) +
      (Number(ef.condominioIptu) || 0) +
      (Number(ef.energiaAgua) || 0) +
      (Number(ef.internetTelefone) || 0) +
      (Number(ef.limpezaManutencao) || 0) +
      (Number(ef.outroValor) || 0);
  }

  // 3.2 Tecnologia & Softwares
  let subtotalTecnologia = 0;
  if (b8.possuiTecnologia === 'Sim') {
    if (b8.tecnologiaSoftwares) {
      Object.values(b8.tecnologiaSoftwares).forEach((v: any) => {
        subtotalTecnologia += Number(v) || 0;
      });
    }
    subtotalTecnologia += (Number(b8.outroTech1Valor) || 0) + (Number(b8.outroTech2Valor) || 0);
  }

  // 3.3 Serviços Profissionais
  let subtotalServicosProfissionais = 0;
  if (b8.possuiServicosProfissionais === 'Sim' && b8.servicosProfissionais) {
    const sp = b8.servicosProfissionais;
    subtotalServicosProfissionais = (Number(sp.contabilidade) || 0) +
      (Number(sp.juridico) || 0) +
      (Number(sp.taxasAlvaraCrn) || 0) +
      (Number(sp.outroValor) || 0);
  }

  // Folha de Pagamento Eixo 07
  let custoFolhaEquipe = 0;
  if (b7.possuiEquipe === 'Sim' && b7.b1Departamentos) {
    Object.values(b7.b1Departamentos).forEach((dept: any) => {
      if (dept && dept.enabled) {
        custoFolhaEquipe += Number(dept.custoMensal) || 0;
      }
    });
  } else if (b7.members && b7.members.length > 0) {
    custoFolhaEquipe = b7.members.reduce((acc: number, m: any) => acc + (Number(m.cost) || 0), 0);
  }

  // Mídia / Tráfego
  let subtotalTrafego = 0;
  if (b8.tipoInvestimentoTrafego === 'Valor médio mensal investido') {
    subtotalTrafego = Number(b8.investimentoTrafegoMensal) || 0;
  }

  // Eventos
  let subtotalEventos = 0;
  if (b8.tipoInvestimentoEventos === 'SIM' && b8.gastosEventos) {
    const ge = b8.gastosEventos;
    subtotalEventos = (Number(ge.locacaoEspaco) || 0) +
      (Number(ge.alimentacaoBrindes) || 0) +
      (Number(ge.fotografoVideomaker) || 0);
  }

  // Legacy fixedCosts sum if non-zero
  let legacyCosts = 0;
  if (b8.fixedCosts) {
    Object.values(b8.fixedCosts).forEach((ci: any) => {
      if (ci && ci.status === 'Sim') legacyCosts += Number(ci.value) || 0;
    });
  }
  if (b8.loanStatus === 'Sim') legacyCosts += Number(b8.loanInstallment) || 0;

  const custoFixoTotalMensal = (subtotalEstruturaFisica + subtotalTecnologia + subtotalServicosProfissionais + custoFolhaEquipe + subtotalTrafego + subtotalEventos) || legacyCosts;

  // 3. Custos Variáveis por Venda
  // 4.1 Impostos
  let aliquotaImposto = 0;
  const reg = b8.regimeTributario || '';
  if (reg.includes('Anexo III')) aliquotaImposto = 6.0;
  else if (reg.includes('Anexo V')) aliquotaImposto = 15.5;
  else if (reg.includes('Lucro Presumido')) aliquotaImposto = 15.0;
  else if (reg.includes('Pessoa Física')) aliquotaImposto = 27.5;
  else if (reg.includes('Outro')) aliquotaImposto = Number(b8.aliquotaImpostoOutro) || 0;
  else aliquotaImposto = 0;

  // 4.2 Meios de Pagamento
  let taxaMeiosPagamento = 3.8;
  if (b8.tipoTaxaMeiosPagamento === 'Sei a taxa exata dos meus Meios de Pagamento') {
    taxaMeiosPagamento = Number(b8.taxaMeiosPagamento) || 0;
  } else if (b8.tipoTaxaMeiosPagamento === 'Não tenho esse dado exato') {
    taxaMeiosPagamento = 3.8;
  }

  // 4.3 Antecipação
  let taxaAntecipacao = 0;
  if (b8.antecipaCartao === 'SIM, antecipo minhas vendas') {
    if (b8.tipoTaxaAntecipacao === 'Sei a taxa exata') {
      taxaAntecipacao = Number(b8.taxaAntecipacao) || 0;
    } else {
      taxaAntecipacao = 5.5;
    }
  }

  // 4.4 Comissão %
  let comissaoPorcentagem = 0;
  let comissaoFixaReais = 0;
  if (b8.pagaComissao === 'Sim') {
    if (b8.tipoComissao === 'Porcentagem') {
      comissaoPorcentagem = Number(b8.comissaoPorcentagem) || 0;
    } else if (b8.tipoComissao === 'Valor Fixo') {
      comissaoFixaReais = Number(b8.comissaoFixaReais) || 0;
    }
  }

  const aliquotaVariavelDireta = aliquotaImposto + taxaMeiosPagamento + taxaAntecipacao + comissaoPorcentagem;

  // 5. Custos Variáveis de Entrega por Paciente
  let subtotalKitsFrete = 0;
  if (b8.possuiKitsMimos === 'Sim') {
    subtotalKitsFrete = (Number(b8.custoKitsMimos) || 0) + (Number(b8.custoFretePaciente) || 0);
  }

  let subtotalProducaoDieta = 0;
  if (b8.possuiRemuneracaoTecnica === 'Sim') {
    subtotalProducaoDieta = Number(b8.custoRemuneracaoTecnica) || 0;
  }

  const custoEntregaPacienteTotal = subtotalKitsFrete + subtotalProducaoDieta;

  // Vendas mensais média de Eixo 04
  let totalPacientesAtivos = 0;
  let totalMonthlyRevFromServices = 0;
  if (b4.services && b4.services.length > 0) {
    b4.services.forEach((s: any) => {
      totalPacientesAtivos += Number(s.activePatients) || 0;
      const durDays = Number(s.duracaoContrato ? (s.duracaoContrato.includes('360') ? 360 : s.duracaoContrato.includes('180') ? 180 : s.duracaoContrato.includes('90') ? 90 : s.duracaoContrato.includes('30') ? 30 : 1) : 90);
      const monthlyEquiv = (Number(s.price) || 0) / (durDays / 30);
      totalMonthlyRevFromServices += monthlyEquiv * (Number(s.activePatients) || 0);
    });
  }

  const vendasMensaisMediaEixo04 = totalPacientesAtivos > 0 ? totalPacientesAtivos : 10;
  const ticketMedioEixo04 = totalPacientesAtivos > 0 ? (totalMonthlyRevFromServices / totalPacientesAtivos) : 300;

  // Dedução Variável Total Mensal
  const deducaoVariavelTotalMensal = (receitaMediaMensal * (aliquotaVariavelDireta / 100)) +
    (comissaoFixaReais * vendasMensaisMediaEixo04) +
    (custoEntregaPacienteTotal * vendasMensaisMediaEixo04);

  // 6. Lucro Líquido Real & Margem Líquida Real
  const lucroLiquidoReal = receitaMediaMensal - (custoFixoTotalMensal + deducaoVariavelTotalMensal);
  const margemLiquidaReal = receitaMediaMensal > 0 ? (lucroLiquidoReal / receitaMediaMensal) * 100 : 0;

  // 7. Métricas de Horas (Eixo 06)
  let horasMensaisEixo06 = 160;
  if (b6.horasPorDia) {
    const totalHorasSemana: number = Number(Object.values(b6.horasPorDia).reduce((acc: number, h: any) => acc + (Number(h) || 0), 0));
    if (totalHorasSemana > 0) horasMensaisEixo06 = totalHorasSemana * 4;
  }

  const reaisPorHora = lucroLiquidoReal / Math.max(1, horasMensaisEixo06);
  const custoFuncionamentoHora = custoFixoTotalMensal / Math.max(1, horasMensaisEixo06);

  // 8. Breakeven (Ponto de Equilíbrio em Vendas)
  const contribucaoUnit = ticketMedioEixo04 * (1 - (aliquotaVariavelDireta / 100)) - comissaoFixaReais - custoEntregaPacienteTotal;
  const breakevenVendas = contribucaoUnit > 0 ? Math.ceil(custoFixoTotalMensal / contribucaoUnit) : 0;
  const margemSegurancaVendasPct = breakevenVendas > 0 ? Math.round(((vendasMensaisMediaEixo04 - breakevenVendas) / breakevenVendas) * 100) : 0;

  // 9. Multiplicador de Sobrevivência
  const multiplicadorSobrevivencia = custoFixoTotalMensal > 0 ? (lucroLiquidoReal / custoFixoTotalMensal) : 0;

  // 10. Sazonalidade 12M
  const temHistorico12M = b8.possuiHistorico12Meses === 'Sim' && b8.historico12Meses && Object.keys(b8.historico12Meses).length > 0;
  let mesMaiorNome = '';
  let mesMaiorValor = 0;
  let mesMenorNome = '';
  let mesMenorValor = Infinity;
  let media12M = 0;
  let amplitudeSazonalPct = 0;

  if (temHistorico12M) {
    const values = Object.entries(b8.historico12Meses as Record<string, number>);
    let sum = 0;
    values.forEach(([key, val]) => {
      const numVal = Number(val) || 0;
      sum += numVal;
      if (numVal > mesMaiorValor) {
        mesMaiorValor = numVal;
        mesMaiorNome = key;
      }
      if (numVal < mesMenorValor) {
        mesMenorValor = numVal;
        mesMenorNome = key;
      }
    });
    if (mesMenorValor === Infinity) mesMenorValor = 0;
    media12M = values.length > 0 ? sum / values.length : 0;
    amplitudeSazonalPct = mesMaiorValor > 0 ? Math.round(((mesMaiorValor - mesMenorValor) / mesMaiorValor) * 100) : 0;
  }

  return {
    receitaMediaMensal,
    subtotalEstruturaFisica,
    subtotalTecnologia,
    subtotalServicosProfissionais,
    custoFolhaEquipe,
    subtotalTrafego,
    subtotalEventos,
    custoFixoTotalMensal,
    aliquotaImposto,
    taxaMeiosPagamento,
    taxaAntecipacao,
    comissaoPorcentagem,
    aliquotaVariavelDireta,
    comissaoFixaReais,
    subtotalKitsFrete,
    subtotalProducaoDieta,
    custoEntregaPacienteTotal,
    deducaoVariavelTotalMensal,
    lucroLiquidoReal,
    margemLiquidaReal,
    horasMensaisEixo06,
    reaisPorHora,
    custoFuncionamentoHora,
    vendasMensaisMediaEixo04,
    ticketMedioEixo04,
    breakevenVendas,
    margemSegurancaVendasPct,
    multiplicadorSobrevivencia,
    temHistorico12M,
    mesMaiorNome,
    mesMaiorValor,
    mesMenorNome,
    mesMenorValor,
    media12M,
    amplitudeSazonalPct
  };
}

export interface Block9Metrics {
  ticketMedioAtual: number;
  baseAtivosAtual: number;
  minutosPacienteNovo: number;
  minutosPacienteAtivo: number;
  custosFixosTotais: number;
  deducaoVariavelPct: number;
  custoEntregaUnitario: number;
  lucroLiquidoRealAtual: number;
  horasTrabalhadasAtualSemanal: number;
  reaisPorHoraAtual: number;

  ticketPlanoLongo: number;
  ticketManutencao: number;
  ticketDesafio: number;

  novoTicketNovos: number;
  novoTicketAntigos: number;

  baseSaindo: number;
  baseAntigosRestante: number;
  baseMigradaPlanosLongos: number;
  baseAntigosPadrao: number;

  novosPacientesSimulados: number;
  pacientesDownsell: number;
  pacientesCrosssell: number;

  receitaNovos: number;
  receitaAntigosPadrao: number;
  receitaPlanosLongos: number;
  receitaDownsell: number;
  receitaCrosssell: number;
  receitaTotalSimulada: number;

  deducoesVariaveisPct: number;
  custosEntregaTotais: number;
  deducoesTotais: number;
  lucroLiquidoRealSimulado: number;

  horasAtendimentoNovos: number;
  horasAtendimentoAntigos: number;
  horasMensaisTotais: number;
  cargaHorariaSemanalExigida: number;
  reaisPorHoraSimulado: number;

  numeroMagico: number;
  tetoSemanaPerfeita: number;
  lucroAtingido: boolean;
  horasNoLimite: boolean;
  metaTotalAtingida: boolean;
  gapLucroR$: number;

  mesesContrato: number;
  receitaAntecipadaCaixa: number;
}

export function calculateBlock9Metrics(blocks: ClientBlocks): Block9Metrics {
  const b9 = (blocks.b9 || {}) as any;
  const b4 = (blocks.b4 || {}) as any;
  const b5 = (blocks.b5 || {}) as any;
  const b6 = (blocks.b6 || {}) as any;
  const b8Metrics = calculateBlock8Metrics(blocks);

  // 1. Rescued Baseline metrics
  const services: any[] = b4.services || [];
  const { totalMonthlyRevenue, totalActivePatients } = calculateServicesSubtotal(services);
  
  const ticketMedioAtual = totalActivePatients > 0 ? (totalMonthlyRevenue / totalActivePatients) : (b8Metrics.ticketMedioEixo04 || 1500);
  const baseAtivosAtual = totalActivePatients > 0 ? totalActivePatients : (b8Metrics.vendasMensaisMediaEixo04 * 3 || 15);

  const minutosPacienteNovo = b5.planoAlimentarInicial?.duration || b5.consultaAcompanhamento?.duration || 120;
  const minutosPacienteAtivo = b5.checkIn?.duration || b5.contatoProativo?.duration || 30;

  const custosFixosTotais = b8Metrics.custoFixoTotalMensal || 0;
  const deducaoVariavelPct = b8Metrics.aliquotaVariavelDireta || 0;
  const custoEntregaUnitario = b8Metrics.custoEntregaPacienteTotal || 0;
  const lucroLiquidoRealAtual = b8Metrics.lucroLiquidoReal || 0;
  const horasTrabalhadasAtualSemanal = b8Metrics.horasMensaisEixo06 > 0 ? Math.round(b8Metrics.horasMensaisEixo06 / 4.33) : 30;
  const reaisPorHoraAtual = b8Metrics.reaisPorHora || 0;

  // 2. Default inputs for Passo 0 if not defined
  const numeroMagico = b9.numeroMagico && b9.numeroMagico > 0 ? b9.numeroMagico : (lucroLiquidoRealAtual > 0 ? Math.round(lucroLiquidoRealAtual * 1.5) : 15000);
  const tetoSemanaPerfeita = b9.tetoSemanaPerfeita && b9.tetoSemanaPerfeita > 0 ? b9.tetoSemanaPerfeita : horasTrabalhadasAtualSemanal;

  // 3. New Products Tickets (0.85, 0.40, 0.25 fixed multipliers)
  const ticketPlanoLongo = b9.travaPrecoControle4 && b9.precoRealProdutoControle4 && b9.precoRealProdutoControle4 > 0
    ? b9.precoRealProdutoControle4
    : ticketMedioAtual * 0.85;

  const ticketManutencao = ticketMedioAtual * 0.40;
  const ticketDesafio = ticketMedioAtual * 0.25;

  // 4. Simulated Prices for Controle 1 & Controle 2
  const reajusteNovosPct = b9.reajusteNovosPct || 0;
  const reajusteAntigosPct = b9.reajusteAntigosPct || 0;

  const novoTicketNovos = b9.travaPrecoControle3 && b9.precoRealProdutoControle3 && b9.precoRealProdutoControle3 > 0
    ? b9.precoRealProdutoControle3
    : ticketMedioAtual * (1 + reajusteNovosPct / 100);

  const novoTicketAntigos = ticketMedioAtual * (1 + reajusteAntigosPct / 100);

  // 5. Population Breakdown (Pós-churn)
  const taxaPerdaPct = b9.taxaPerdaPct !== undefined ? b9.taxaPerdaPct : 15;
  const baseSaindo = Math.round(baseAtivosAtual * (taxaPerdaPct / 100));
  const baseAntigosRestante = Math.max(0, baseAtivosAtual - baseSaindo);

  const migracaoPlanosLongosPct = b9.migracaoPlanosLongosPct || 0;
  const baseMigradaPlanosLongos = Math.round(baseAntigosRestante * (migracaoPlanosLongosPct / 100));
  const baseAntigosPadrao = Math.max(0, baseAntigosRestante - baseMigradaPlanosLongos);

  const novosPacientesSimulados = b9.novosPacientesSimulados !== undefined
    ? b9.novosPacientesSimulados
    : Math.max(1, Math.round(b8Metrics.vendasMensaisMediaEixo04 || (baseAtivosAtual / 3)));

  const adesaoDownsellPct = b9.adesaoDownsellPct || 0;
  const pacientesDownsell = taxaPerdaPct === 0 ? 0 : Math.round(baseSaindo * (adesaoDownsellPct / 100));

  const adesaoCrosssellPct = b9.adesaoCrosssellPct || 0;
  const pacientesCrosssell = Math.round(baseAtivosAtual * (adesaoCrosssellPct / 100));

  // 6. Revenue Aggregation
  const receitaNovos = novosPacientesSimulados * novoTicketNovos;
  const receitaAntigosPadrao = baseAntigosPadrao * novoTicketAntigos;
  const receitaPlanosLongos = baseMigradaPlanosLongos * ticketPlanoLongo;
  const receitaDownsell = pacientesDownsell * ticketManutencao;
  const receitaCrosssell = pacientesCrosssell * ticketDesafio;

  const receitaTotalSimulada = receitaNovos + receitaAntigosPadrao + receitaPlanosLongos + receitaDownsell + receitaCrosssell;

  // 7. Deductions & Net Profit (DRE)
  const deducoesVariaveisPct = receitaTotalSimulada * (deducaoVariavelPct / 100);
  const custosEntregaTotais = (novosPacientesSimulados + baseAntigosRestante + pacientesDownsell + pacientesCrosssell) * custoEntregaUnitario;
  const deducoesTotais = deducoesVariaveisPct + custosEntregaTotais;

  const lucroLiquidoRealSimulado = receitaTotalSimulada - deducoesTotais - custosFixosTotais;

  // 8. Hours & Capacity (4.33 weeks/month)
  const horasAtendimentoNovos = (novosPacientesSimulados * minutosPacienteNovo) / 60;
  const horasAtendimentoAntigos = (baseAntigosRestante * minutosPacienteAtivo) / 60;
  const horasMensaisTotais = horasAtendimentoNovos + horasAtendimentoAntigos;
  const cargaHorariaSemanalExigida = Math.round((horasMensaisTotais / 4.33) * 10) / 10;

  const reaisPorHoraSimulado = cargaHorariaSemanalExigida > 0 ? Math.round(lucroLiquidoRealSimulado / (cargaHorariaSemanalExigida * 4.33)) : 0;

  // 9. Status & Gap
  const gapLucroR$ = Math.max(0, numeroMagico - lucroLiquidoRealSimulado);
  const lucroAtingido = lucroLiquidoRealSimulado >= numeroMagico;
  const horasNoLimite = cargaHorariaSemanalExigida <= tetoSemanaPerfeita;
  const metaTotalAtingida = lucroAtingido && horasNoLimite;

  // 10. Liquidity (Mês 1)
  const mesesContrato = b9.travaPrecoControle4 && b9.duracaoDiasControle4 ? Math.round(b9.duracaoDiasControle4 / 30) : 6;
  const receitaAntecipadaCaixa = baseMigradaPlanosLongos * ticketPlanoLongo * mesesContrato;

  return {
    ticketMedioAtual,
    baseAtivosAtual,
    minutosPacienteNovo,
    minutosPacienteAtivo,
    custosFixosTotais,
    deducaoVariavelPct,
    custoEntregaUnitario,
    lucroLiquidoRealAtual,
    horasTrabalhadasAtualSemanal,
    reaisPorHoraAtual,
    ticketPlanoLongo,
    ticketManutencao,
    ticketDesafio,
    novoTicketNovos,
    novoTicketAntigos,
    baseSaindo,
    baseAntigosRestante,
    baseMigradaPlanosLongos,
    baseAntigosPadrao,
    novosPacientesSimulados,
    pacientesDownsell,
    pacientesCrosssell,
    receitaNovos,
    receitaAntigosPadrao,
    receitaPlanosLongos,
    receitaDownsell,
    receitaCrosssell,
    receitaTotalSimulada,
    deducoesVariaveisPct,
    custosEntregaTotais,
    deducoesTotais,
    lucroLiquidoRealSimulado,
    horasAtendimentoNovos,
    horasAtendimentoAntigos,
    horasMensaisTotais,
    cargaHorariaSemanalExigida,
    reaisPorHoraSimulado,
    numeroMagico,
    tetoSemanaPerfeita,
    lucroAtingido,
    horasNoLimite,
    metaTotalAtingida,
    gapLucroR$,
    mesesContrato,
    receitaAntecipadaCaixa
  };
}

/**
 * Calcula o CAC Blocado (Geral) e o CAC Pago (Específico de Anúncios)
 * com explicações em linguagem simples para o usuário.
 */
export function calculateDualCAC(clientRecord: any) {
  const investimentoTrafego = clientRecord?.fase08?.investimentoTrafegoMensal ?? 0;
  const contatos = clientRecord?.fase02?.contatos ?? [];
  const convertidos = contatos.filter((c: any) => c.statusFechamento === 'sim');
  const totalConvertidos = Math.max(1, convertidos.length);

  const convertidosTrafego = convertidos.filter((c: any) => c.canalOrigem === 'trafego_pago').length;
  const totalConvertidosTrafego = Math.max(1, convertidosTrafego);

  const cacBlocadoGeral = Math.round(investimentoTrafego / totalConvertidos);
  const cacPagoAnuncios = Math.round(investimentoTrafego / totalConvertidosTrafego);

  return {
    investimentoTrafego,
    totalConvertidos: convertidos.length,
    convertidosTrafego,
    cacBlocadoGeral,
    cacPagoAnuncios,
    explicacaoBlocado: `💰 Em média, custou R$ ${cacBlocadoGeral} para atrair cada um dos seus ${convertidos.length} pacientes (considerando todos os canais).`,
    explicacaoPago: `🎯 Considerando apenas os anúncios pagos, custou R$ ${cacPagoAnuncios} para trazer cada um dos ${convertidosTrafego} pacientes vindos de tráfego pago.`,
  };
}

/**
 * Compara a Receita Comercial Projetada do Portfólio (Eixo 04)
 * com a Entrada Real de Caixa nos últimos 3 meses (Eixo 08).
 */
export function calculateRealVsPortfolioRevenue(clientRecord: any) {
  const services: ServiceData[] = clientRecord?.fase04?.services ?? [];
  const receitaPortfolioMensal = Math.round(
    services.reduce((acc, s) => {
      const preco = s.price || 0;
      const vendas90Dias = s.vendasUltimos90Dias || 0;
      return acc + (preco * vendas90Dias) / 3;
    }, 0)
  );

  const faturamentoM2 = clientRecord?.fase08?.faturamentoM2 ?? 0;
  const faturamentoM1 = clientRecord?.fase08?.faturamentoM1 ?? 0;
  const faturamentoAtual = clientRecord?.fase08?.faturamentoAtual ?? 0;
  const receitaCaixaMensal = Math.round((faturamentoM2 + faturamentoM1 + faturamentoAtual) / 3);

  const indiceRealizacaoPct = receitaPortfolioMensal > 0
    ? Math.round((receitaCaixaMensal / receitaPortfolioMensal) * 100)
    : 100;

  return {
    receitaPortfolioMensal,
    receitaCaixaMensal,
    indiceRealizacaoPct,
    explicacao: `🏦 Seu consultório recebe no caixa R$ ${receitaCaixaMensal.toLocaleString('pt-BR')} por mês, o que representa ${indiceRealizacaoPct}% do faturamento projetado no seu portfólio de produtos (R$ ${receitaPortfolioMensal.toLocaleString('pt-BR')}).`,
  };
}

/**
 * Engenharia Financeira A3 (+50% a +100% de precisão)
 * Calcula DRE Real de Caixa, Breakeven em R$ e Pacientes, Margem de Contribuição por Produto e Pró-Labore
 * tudo com explicações nativas em LINGUAGEM SIMPLES para o usuário final.
 */
export function calculateAdvancedFinancialMetrics(clientRecord: any) {
  const f8 = clientRecord?.fase08 || {};
  const f4 = clientRecord?.fase04 || {};
  const f6 = clientRecord?.fase06 || {};
  const f7 = clientRecord?.fase07 || {};

  // 1. Custos Fixos Discriminados
  const aluguelEspaco = Number(f8.aluguelEspaco || 0);
  const softwaresTech = Number(f8.softwaresTech || 0);
  const terceirizadosContabilidade = Number(f8.terceirizadosContabilidade || 0);
  const licencasAnualidades = Number(f8.licencasAnualidades || 0);
  const custoTotalEquipe = Number(f7.custoTotalEquipe || f8.custoTotalEquipe || 0);
  const investimentoTrafegoMensal = Number(f8.investimentoTrafegoMensal || 0);
  const feeGestorAgencia = Number(f8.feeGestorAgencia || 0);

  const opexFixoTotal = aluguelEspaco + softwaresTech + terceirizadosContabilidade + licencasAnualidades + custoTotalEquipe;
  const marketingTotal = investimentoTrafegoMensal + feeGestorAgencia;

  // 2. Pro-Labore vs Reserva
  const proLaboreNutricionista = Number(f8.proLaboreNutricionista || 5000);
  const reservaConsultorioCNPJ = Number(f8.reservaConsultorioCNPJ || 1000);

  // 3. Impostos e Cartão
  const impostosAliquotaPct = Number(f8.impostosAliquotaPct || 6);
  const taxaCartaoPct = Number(f8.taxaCartaoPct || 3.5);
  const taxaAntecipacaoPct = Number(f8.taxaAntecipacaoPct || 2.0);
  const deducoesVariaveisTotalPct = (impostosAliquotaPct + taxaCartaoPct + taxaAntecipacaoPct) / 100;

  // 4. Insumos Por Consulta
  const insumoConsultaUnitario = Number(f8.insumoConsultaUnitario || 30);

  // 5. Portfólio de Serviços do Eixo 04
  const services: ServiceData[] = f4.services || [];
  const servicosComMargem = services.map((s: any) => {
    const preco = Number(s.price || s.precoVenda || 0);
    const impostoR$ = preco * (impostosAliquotaPct / 100);
    const taxaCartaoR$ = preco * ((taxaCartaoPct + taxaAntecipacaoPct) / 100);
    const custoVariavelDireto = insumoConsultaUnitario + impostoR$ + taxaCartaoR$;
    const margemContribuiSimplesR$ = Math.max(0, preco - custoVariavelDireto);
    const margemContribuiPct = preco > 0 ? Math.round((margemContribuiSimplesR$ / preco) * 100) : 0;

    return {
      id: s.id,
      nomeComercial: s.name || s.nomeComercial || 'Serviço',
      precoVenda: preco,
      custoVariavelDireto,
      margemContribuiSimplesR$,
      margemContribuiPct,
      explicacaoSimples: `💡 De cada R$ ${preco} cobrado na "${s.name || s.nomeComercial || 'consulta'}", sobram R$ ${Math.round(margemContribuiSimplesR$)} limpos (${margemContribuiPct}%) para o consultório após pagar impostos, maquininha e materiais.`,
    };
  });

  // Ticket Médio Ponderado
  const ticketMedioPortfólio = servicosComMargem.length > 0
    ? Math.round(servicosComMargem.reduce((acc, s) => acc + s.precoVenda, 0) / servicosComMargem.length)
    : 450;

  // 6. Cálculo do Ponto de Equilíbrio (Breakeven Real)
  const despesaFixaNecessaria = opexFixoTotal + marketingTotal + proLaboreNutricionista + reservaConsultorioCNPJ;
  const margemMediaPct = servicosComMargem.length > 0
    ? servicosComMargem.reduce((acc, s) => acc + s.margemContribuiPct, 0) / servicosComMargem.length / 100
    : 0.75;

  const breakevenFaturamentoReais = Math.round(despesaFixaNecessaria / (margemMediaPct > 0 ? margemMediaPct : 0.75));
  const breakevenPacientesMes = Math.ceil(breakevenFaturamentoReais / (ticketMedioPortfólio > 0 ? ticketMedioPortfólio : 450));

  // 7. Custo da Hora Clínica Parada (Eixo 06)
  const horasMesClinica = Number(f6.totalHorasSemana || 40) * 4.33;
  const custoHoraClinicaFixo = horasMesClinica > 0 ? Math.round(opexFixoTotal / horasMesClinica) : 0;

  return {
    opexFixoTotal,
    marketingTotal,
    proLaboreNutricionista,
    reservaConsultorioCNPJ,
    despesaFixaNecessaria,
    breakevenFaturamentoReais,
    breakevenPacientesMes,
    custoHoraClinicaFixo,
    servicosComMargem,
    explicacoesLinguagemSimples: {
      breakeven: `⚖️ Ponto de Equilíbrio: Seu consultório precisa faturar no mínimo R$ ${breakevenFaturamentoReais.toLocaleString('pt-BR')} por mês (aprox. ${breakevenPacientesMes} contratos) apenas para cobrir todas as despesas, pagar seu pró-labore de R$ ${proLaboreNutricionista.toLocaleString('pt-BR')} e não ficar no prejuízo.`,
      proLaboreVsLucro: `👔 Separação Pessoal vs Empresa: R$ ${proLaboreNutricionista.toLocaleString('pt-BR')} é o seu salário mensal garantido como profissional (CPF), enquanto R$ ${reservaConsultorioCNPJ.toLocaleString('pt-BR')} é guardado no caixa do consultório (CNPJ) para segurança.`,
      custoHora: `⏱️ Custo da Hora de Consultório: Manter sua sala ou estrutura aberta custa R$ ${custoHoraClinicaFixo} por hora de atendimento.`,
    },
  };
}




