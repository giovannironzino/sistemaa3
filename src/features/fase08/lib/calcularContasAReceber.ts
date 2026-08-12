// calcularContasAReceber.ts
// Motor de Cálculo de Contas a Receber, Previsibilidade de Caixa (90 Dias) e Antecipação de Recebíveis.

export type FormaPagamentoPaciente = 'pix_avista' | 'cartao_parcelado' | 'boleto_recorrente';

export interface ConfigPagamentoPaciente {
  forma: FormaPagamentoPaciente;
  parcelas: number;
  antecipado?: boolean;
}

export interface PacienteContasAReceber {
  id: string;
  nomePaciente: string;
  servicoContratado: string;
  valorTotalContrato: number;
  formaPagamento: FormaPagamentoPaciente;
  numeroParcelas: number; // 1 a 12
  valorParcelaMensal: number;
  antecipado: boolean;
  custoTaxaAntecipacao: number;
  recebimentoM0Liquido: number; // Entradas no Caixa Mês Atual
  recebimentoM1: number; // Mês que vem
  recebimentoM2: number; // Daqui a 60 dias
  recebimentoM3: number; // Daqui a 90 dias
}

export interface ResultadoPrevisibilidadeCaixa {
  pacientesContasAReceber: PacienteContasAReceber[];
  totalRecebimentosGarantidosM1: number;
  totalRecebimentosGarantidosM2: number;
  totalRecebimentosGarantidosM3: number;
  totalAVistaPix: number;
  totalCartaoParcelado: number;
  totalCartaoAntecipado: number;
  totalCustosAntecipacao: number;
  totalBoletoRecorrente: number;
  percentualCaixaGarantidoProximos90Dias: number;
}

export function calcularContasAReceber(
  pacientesEixo01: Array<{ id: string; nome: string; ticketPagoEstimado?: number }>,
  formasPagamentoOverride: Record<string, ConfigPagamentoPaciente> = {},
  taxaAntecipacaoPadraoPercentual: number = 3.5
): ResultadoPrevisibilidadeCaixa {
  const listaBase = pacientesEixo01.length > 0
    ? pacientesEixo01
    : [
        { id: 'pac_demo_1', nome: 'Heloísa Batista Santos', ticketPagoEstimado: 1500 },
        { id: 'pac_demo_2', nome: 'Rebeca Vieira Luzia', ticketPagoEstimado: 1800 },
        { id: 'pac_demo_3', nome: 'Emanuel Araújo Esmidre', ticketPagoEstimado: 450 },
        { id: 'pac_demo_4', nome: 'Lucas Batista Sousa', ticketPagoEstimado: 2400 },
      ];

  let totalAVista = 0;
  let totalCartao = 0;
  let totalCartaoAntecipado = 0;
  let totalCustosAntecipacao = 0;
  let totalBoleto = 0;
  let totalM1 = 0;
  let totalM2 = 0;
  let totalM3 = 0;

  const pacientesContasAReceber: PacienteContasAReceber[] = listaBase.map((p, idx) => {
    const override = formasPagamentoOverride[p.id];
    const formaDefault: FormaPagamentoPaciente = idx % 3 === 0 ? 'cartao_parcelado' : idx % 3 === 1 ? 'pix_avista' : 'boleto_recorrente';
    const parcelasDefault = formaDefault === 'cartao_parcelado' ? 3 : 1;

    const forma = override?.forma || formaDefault;
    const parcelas = Math.max(1, override?.parcelas || parcelasDefault);
    const antecipado = forma === 'cartao_parcelado' ? (override?.antecipado ?? false) : false;

    const valorContrato = p.ticketPagoEstimado || (idx % 2 === 0 ? 1500 : 1800);
    const valorParcelaMensal = Number((valorContrato / parcelas).toFixed(2));

    let m0 = 0;
    let m1 = 0;
    let m2 = 0;
    let m3 = 0;
    let custoTaxaAntecipacao = 0;

    if (forma === 'pix_avista') {
      totalAVista += valorContrato;
      m0 = valorContrato;
      m1 = 0;
      m2 = 0;
      m3 = 0;
    } else if (forma === 'cartao_parcelado') {
      if (antecipado) {
        // Se antecipar no banco: cai tudo em M0 menos a taxa de antecipação (ex: 3.5%)
        custoTaxaAntecipacao = Number((valorContrato * (taxaAntecipacaoPadraoPercentual / 100)).toFixed(2));
        m0 = Number((valorContrato - custoTaxaAntecipacao).toFixed(2));
        m1 = 0; // zerado pois já foi adiantado
        m2 = 0;
        m3 = 0;

        totalCartaoAntecipado += valorContrato;
        totalCustosAntecipacao += custoTaxaAntecipacao;
      } else {
        // Parcelado normal
        totalCartao += valorContrato;
        m0 = valorParcelaMensal;
        m1 = parcelas >= 2 ? valorParcelaMensal : 0;
        m2 = parcelas >= 3 ? valorParcelaMensal : 0;
        m3 = parcelas >= 4 ? valorParcelaMensal : 0;
      }
    } else {
      totalBoleto += valorContrato;
      m0 = valorParcelaMensal;
      m1 = valorParcelaMensal;
      m2 = valorParcelaMensal;
      m3 = valorParcelaMensal;
    }

    totalM1 += m1;
    totalM2 += m2;
    totalM3 += m3;

    return {
      id: p.id,
      nomePaciente: p.nome,
      servicoContratado: valorContrato >= 1500 ? 'Programa Trimestral Premium' : 'Consulta Avulsa + Acompanhamento',
      valorTotalContrato: valorContrato,
      formaPagamento: forma,
      numeroParcelas: parcelas,
      valorParcelaMensal,
      antecipado,
      custoTaxaAntecipacao,
      recebimentoM0Liquido: m0,
      recebimentoM1: Number(m1.toFixed(2)),
      recebimentoM2: Number(m2.toFixed(2)),
      recebimentoM3: Number(m3.toFixed(2)),
    };
  });

  const totalGeralGarantido90Dias = totalM1 + totalM2 + totalM3;
  const faturamentoTotalContratos = pacientesContasAReceber.reduce((acc, p) => acc + p.valorTotalContrato, 0);
  const percentualCaixaGarantidoProximos90Dias = faturamentoTotalContratos > 0
    ? Math.min(100, Math.round((totalGeralGarantido90Dias / faturamentoTotalContratos) * 100))
    : 0;

  return {
    pacientesContasAReceber,
    totalRecebimentosGarantidosM1: Number(totalM1.toFixed(2)),
    totalRecebimentosGarantidosM2: Number(totalM2.toFixed(2)),
    totalRecebimentosGarantidosM3: Number(totalM3.toFixed(2)),
    totalAVistaPix: Number(totalAVista.toFixed(2)),
    totalCartaoParcelado: Number(totalCartao.toFixed(2)),
    totalCartaoAntecipado: Number(totalCartaoAntecipado.toFixed(2)),
    totalCustosAntecipacao: Number(totalCustosAntecipacao.toFixed(2)),
    totalBoletoRecorrente: Number(totalBoleto.toFixed(2)),
    percentualCaixaGarantidoProximos90Dias,
  };
}
