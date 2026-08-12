// calcularPrecificacaoServicos.ts
// Motor de Cálculo de Precificação & Margem Real por Serviço (Unit Economics) para o Eixo 08.
// Identifica: Lucro Real vs Prejuízo Oculto, Custo da Hora Técnica e Piso Mínimo Viável.

export interface PrecificacaoServicoItem {
  id: string;
  nomeServico: string;
  precoTabela: number;
  horasDedicadasTotal: number;
  custoHoraClinica: number;
  custoDiretoTotal: number;
  lucroLiquidoReal: number;
  margemLucroPercentual: number;
  statusMargem: 'saudavel' | 'atencao' | 'prejuizo_oculto';
  pisoMinimoRecomendado: number;
}

export interface ResultadoPrecificacaoGeral {
  serviciosDetalhados: PrecificacaoServicoItem[];
  custoHoraClinicaConsultorio: number;
  temServicoPrejuizoOculto: boolean;
  margemMediaGeralPercentual: number;
}

export function calcularPrecificacaoServicos(
  servicosEixo04: Array<{ id?: string; nome?: string; titulo?: string; preco?: number; valor?: number; duracaoHoras?: number }>,
  despesasFixasTotaisMensais: number = 6200,
  horasClinicasMensaisTotal: number = 120
): ResultadoPrecificacaoGeral {
  const custoHoraClinicaConsultorio = Number(
    (despesasFixasTotaisMensais / Math.max(1, horasClinicasMensaisTotal)).toFixed(2)
  );

  // Lista padrão de serviços se o Eixo 04 não fornecer itens
  const listaBase = servicosEixo04.length > 0
    ? servicosEixo04.map((s, idx) => ({
        id: s.id || `serv_${idx}`,
        nome: s.nome || s.titulo || `Serviço ${idx + 1}`,
        preco: s.preco || s.valor || (idx === 0 ? 350 : 1800),
        horasDedicadas: s.duracaoHoras || (idx === 0 ? 2.5 : 3.5),
      }))
    : [
        { id: 'serv_demo_1', nome: 'Consulta Avulsa + Retorno', preco: 350, horasDedicadas: 2.5 },
        { id: 'serv_demo_2', nome: 'Programa Nutricional Trimestral', preco: 1800, horasDedicadas: 4.0 },
        { id: 'serv_demo_3', nome: 'Plano Semestral de Performance', preco: 3200, horasDedicadas: 6.0 },
      ];

  let somaMargens = 0;
  let temPrejuizo = false;

  const serviciosDetalhados: PrecificacaoServicoItem[] = listaBase.map((item) => {
    const impostoTaxas = Number((item.preco * 0.10).toFixed(2)); // ~10% impostos e cartão
    const custoTempoTecnico = Number((item.horasDedicadas * custoHoraClinicaConsultorio).toFixed(2));
    const custoDiretoTotal = Number((custoTempoTecnico + impostoTaxas).toFixed(2));
    const lucroLiquidoReal = Number((item.preco - custoDiretoTotal).toFixed(2));
    const margemLucroPercentual = Number(((lucroLiquidoReal / item.preco) * 100).toFixed(1));

    let statusMargem: 'saudavel' | 'atencao' | 'prejuizo_oculto' = 'saudavel';
    if (lucroLiquidoReal < 0 || margemLucroPercentual < 5) {
      statusMargem = 'prejuizo_oculto';
      temPrejuizo = true;
    } else if (margemLucroPercentual < 35) {
      statusMargem = 'atencao';
    }

    somaMargens += margemLucroPercentual;

    // Piso mínimo recomendado para atingir 45% de margem líquida
    const pisoMinimoRecomendado = Math.ceil(custoDiretoTotal / 0.55);

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
    };
  });

  const margemMediaGeralPercentual = Number(
    (somaMargens / Math.max(1, serviciosDetalhados.length)).toFixed(1)
  );

  return {
    serviciosDetalhados,
    custoHoraClinicaConsultorio,
    temServicoPrejuizoOculto: temPrejuizo,
    margemMediaGeralPercentual,
  };
}
