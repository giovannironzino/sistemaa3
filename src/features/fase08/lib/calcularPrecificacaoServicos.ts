// calcularPrecificacaoServicos.ts
// Motor de Cálculo de Precificação, Margem Real (Unit Economics) & Benchmarking da Concorrência Direta (Opcional).
// Baseado na Teoria do Empurrão (Nudge Theory) e Subsídio Cruzado de Portfólio — Sem Travas nem Imposições!

export interface PrecificacaoServicoItem {
  id: string;
  nomeServico: string;
  precoTabela: number;
  horasDedicadasTotal: number;
  custoHoraClinica: number;
  custoDiretoTotal: number;
  lucroLiquidoReal: number;
  margemLucroPercentual: number;
  statusMargem: 'saudavel' | 'atencao' | 'estrategico_subsidio';
  pisoMinimoRecomendado: number;
  // Benchmarking Opcional da Concorrência Direta
  precoConcorrenciaDireta?: number;
  indicePosicionamentoPercentual?: number; // Ex: 110% (10% acima da concorrência)
  statusPosicionamentoMercado?: 'subprecificado' | 'alinhado' | 'premium';
  alertaCientificoNeutro?: string;
}

export interface ResultadoPrecificacaoGeral {
  serviciosDetalhados: PrecificacaoServicoItem[];
  custoHoraClinicaConsultorio: number;
  temServicoAbaixoDoPiso: boolean;
  margemMediaGeralPercentual: number;
}

export function calcularPrecificacaoServicos(
  servicosEixo04: Array<{ id?: string; nome?: string; titulo?: string; preco?: number; valor?: number; duracaoHoras?: number; precoConcorrencia?: number }>,
  despesasFixasTotaisMensais: number = 6200,
  horasClinicasMensaisTotal: number = 120,
  precosConcorrenciaOverride: Record<string, number> = {}
): ResultadoPrecificacaoGeral {
  const custoHoraClinicaConsultorio = Number(
    (despesasFixasTotaisMensais / Math.max(1, horasClinicasMensaisTotal)).toFixed(2)
  );

  const listaBase = servicosEixo04.length > 0
    ? servicosEixo04.map((s, idx) => ({
        id: s.id || `serv_${idx}`,
        nome: s.nome || s.titulo || `Serviço ${idx + 1}`,
        preco: s.preco || s.valor || (idx === 0 ? 350 : 1800),
        horasDedicadas: s.duracaoHoras || (idx === 0 ? 2.5 : 3.5),
        precoConcorrencia: precosConcorrenciaOverride[s.id || `serv_${idx}`] || s.precoConcorrencia,
      }))
    : [
        { id: 'serv_demo_1', nome: 'Consulta Avulsa + Retorno', preco: 350, horasDedicadas: 2.5, precoConcorrencia: 400 },
        { id: 'serv_demo_2', nome: 'Programa Nutricional Trimestral', preco: 1800, horasDedicadas: 4.0, precoConcorrencia: 2100 },
        { id: 'serv_demo_3', nome: 'Plano Semestral de Performance', preco: 3200, horasDedicadas: 6.0, precoConcorrencia: 3500 },
      ];

  let somaMargens = 0;
  let temAbaixo = false;

  const serviciosDetalhados: PrecificacaoServicoItem[] = listaBase.map((item) => {
    const impostoTaxas = Number((item.preco * 0.10).toFixed(2)); // ~10% impostos e cartão
    const custoTempoTecnico = Number((item.horasDedicadas * custoHoraClinicaConsultorio).toFixed(2));
    const custoDiretoTotal = Number((custoTempoTecnico + impostoTaxas).toFixed(2));
    const lucroLiquidoReal = Number((item.preco - custoDiretoTotal).toFixed(2));
    const margemLucroPercentual = Number(((lucroLiquidoReal / item.preco) * 100).toFixed(1));

    // Piso Mínimo Recomendado (para 45% de margem)
    const pisoMinimoRecomendado = Math.ceil(custoDiretoTotal / 0.55);

    let statusMargem: 'saudavel' | 'atencao' | 'estrategico_subsidio' = 'saudavel';
    let alertaCientificoNeutro: string | undefined = undefined;

    if (lucroLiquidoReal < 0 || margemLucroPercentual < 10) {
      statusMargem = 'estrategico_subsidio';
      temAbaixo = true;
      alertaCientificoNeutro = `Você definiu o preço da ${item.nome} em R$ ${item.preco}. O piso ideal para cobrir custos e gerar 45% de margem seria R$ ${pisoMinimoRecomendado}. Esta é uma escolha válida se o produto for usado como atração para programas de maior valor.`;
    } else if (margemLucroPercentual < 35) {
      statusMargem = 'atencao';
    }

    somaMargens += margemLucroPercentual;

    // Benchmarking Concorrência (Opcional)
    const precoConc = item.precoConcorrencia && item.precoConcorrencia > 0 ? item.precoConcorrencia : undefined;
    let indicePosicionamentoPercentual: number | undefined = undefined;
    let statusPosicionamentoMercado: 'subprecificado' | 'alinhado' | 'premium' | undefined = undefined;

    if (precoConc) {
      indicePosicionamentoPercentual = Number(((item.preco / precoConc) * 100).toFixed(1));
      if (indicePosicionamentoPercentual < 85) {
        statusPosicionamentoMercado = 'subprecificado';
      } else if (indicePosicionamentoPercentual <= 115) {
        statusPosicionamentoMercado = 'alinhado';
      } else {
        statusPosicionamentoMercado = 'premium';
      }
    }

    return {
      id: item.id,
      nomeServico: item.nome,
      precoTabela: item.preco,
      horasDedicadasTotal: item.horasDedicadas,
      custoHoraClinica: custoHoraClinicaConsultorio,
      custoDiretoTotal,
      lucroLiquidoReal,
      margemLucroPercentual,
      statusMargem,
      pisoMinimoRecomendado,
      precoConcorrenciaDireta: precoConc,
      indicePosicionamentoPercentual,
      statusPosicionamentoMercado,
      alertaCientificoNeutro,
    };
  });

  const margemMediaGeralPercentual = Number(
    (somaMargens / Math.max(1, serviciosDetalhados.length)).toFixed(1)
  );

  return {
    serviciosDetalhados,
    custoHoraClinicaConsultorio,
    temServicoAbaixoDoPiso: temAbaixo,
    margemMediaGeralPercentual,
  };
}
