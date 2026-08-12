// calcularRetencaoECarga.ts
// Motor de Cálculo de Carga Horária de Entrega Técnica e Score de Retenção Efetiva com Trava Rigorosa em 30%.
// Suporta a Matriz de Quantidades e Minutos por Produto do Eixo 04!

import { CATALOGO_20_ENTREGAVEIS, CATALOGO_RITOS_RETENCAO_CS, ExecutorEntregavel, StatusOpcaoEntregavel } from '../catalogo20Entregaveis';

export interface ConfigProdutoEntrega {
  ativo: boolean;
  quantidadeNoContrato: number;
  duracaoMinutos: number;
  mesesContrato?: number; // Ex: 1 para avulsa, 3 para trimestral, 12 para anual
}

export interface EstadoEntregavelItem {
  status: StatusOpcaoEntregavel;
  servicosEixo04Ids: string[];
  tipoEntrega: 'padrao' | 'personalizada';
  frequenciaMensal: number;
  duracaoMinutos: number;
  executor: ExecutorEntregavel;
  configPorProduto?: Record<string, ConfigProdutoEntrega>;
}

export interface EstadoRitoRetencaoItem {
  status: StatusOpcaoEntregavel;
  servicosEixo04Ids: string[];
  frequenciaMensal: number;
  duracaoMinutos: number;
  executor: ExecutorEntregavel;
  configPorProduto?: Record<string, ConfigProdutoEntrega>;
}

export interface ResultadoRetencaoECarga {
  tempoTotalEntregaMinutosMensalPorPaciente: number;
  tempoTotalEntregaHorasMensalConsultorio: number;
  scoreEstruturaRetencaoPercentual: number; // Trava algorítmica rigorosa em no máximo 30%
  taxaRetencaoEfetivaPercentual: number; // Renovação Histórica Real (Eixo 01) + Score de Estrutura (máx 30%)
  custoInsumosFisicosMensalPorPaciente: number;
  tarefasDelegadasEquipeCount: number;
  tarefasExpertCount: number;
  itensQueroFazerCount: number;
}

export function calcularRetencaoECarga(
  estadoEntregaveis: Record<string, EstadoEntregavelItem>,
  estadoRitos: Record<string, EstadoRitoRetencaoItem>,
  pacientesAtivosCount: number = 38,
  taxaRenovacaoHistoricaBase: number = 55
): ResultadoRetencaoECarga {
  let minutosTotaisPacienteMensal = 0;
  let pontosEstruturaBrutos = 0;
  let custoInsumosPaciente = 0;
  let tarefasEquipe = 0;
  let tarefasExpert = 0;
  let itensQueroFazer = 0;

  // 1. Processa os 20 Entregáveis Clínicos
  CATALOGO_20_ENTREGAVEIS.forEach((item) => {
    const est = estadoEntregaveis[item.id] || {
      status: 'sim',
      servicosEixo04Ids: [],
      tipoEntrega: 'personalizada',
      frequenciaMensal: item.frequenciaPadraoMensal,
      duracaoMinutos: item.duracaoMinutosPadrao,
      executor: item.executorDefault,
    };

    const eAtivo = est.status === 'sim' || est.status === 'nao_faco_quero_fazer';
    if (est.status === 'nao_faco_quero_fazer') itensQueroFazer++;

    if (eAtivo) {
      if (est.tipoEntrega === 'personalizada') {
        if (est.configPorProduto && Object.keys(est.configPorProduto).length > 0) {
          // Calcula a média ponderada por produto cadastrado
          let somaMinutosMensais = 0;
          let qtdProdutos = 0;

          Object.values(est.configPorProduto).forEach((cfg) => {
            if (cfg.ativo) {
              const meses = Math.max(1, cfg.mesesContrato || 1);
              const minMensalProduto = (cfg.quantidadeNoContrato * cfg.duracaoMinutos) / meses;
              somaMinutosMensais += minMensalProduto;
              qtdProdutos++;
            }
          });

          minutosTotaisPacienteMensal += qtdProdutos > 0 ? somaMinutosMensais / qtdProdutos : (est.frequenciaMensal * est.duracaoMinutos);
        } else {
          minutosTotaisPacienteMensal += est.frequenciaMensal * est.duracaoMinutos;
        }
      }

      pontosEstruturaBrutos += 1.5;
      custoInsumosPaciente += item.custoInsumoFisicoPadrao;

      if (est.executor === 'equipe') tarefasEquipe++;
      if (est.executor === 'expert') tarefasExpert++;
    }
  });

  // 2. Processa os Ritos de Retenção CS
  CATALOGO_RITOS_RETENCAO_CS.forEach((rito) => {
    const est = estadoRitos[rito.id] || {
      status: 'nao',
      servicosEixo04Ids: [],
      frequenciaMensal: rito.frequenciaPadraoMensal,
      duracaoMinutos: rito.duracaoMinutosPadrao,
      executor: rito.executorDefault,
    };

    const eAtivo = est.status === 'sim' || est.status === 'nao_faco_quero_fazer';
    if (est.status === 'nao_faco_quero_fazer') itensQueroFazer++;

    if (eAtivo) {
      minutosTotaisPacienteMensal += est.frequenciaMensal * est.duracaoMinutos;
      pontosEstruturaBrutos += 3.0;

      if (est.executor === 'equipe') tarefasEquipe++;
      if (est.executor === 'expert') tarefasExpert++;
    }
  });

  // 3. Trava Algorítmica Rigorosa em NO MÁXIMO 30% no Score de Estrutura
  const scoreEstruturaRetencaoPercentual = Number(
    Math.min(30, pontosEstruturaBrutos).toFixed(1)
  );

  // 4. Taxa de Retenção Efetiva (%)
  const taxaRetencaoEfetivaPercentual = Number(
    Math.min(95, taxaRenovacaoHistoricaBase + scoreEstruturaRetencaoPercentual).toFixed(1)
  );

  // 5. Carga Horária Mensal Total do Consultório (horas)
  const tempoTotalEntregaHorasMensalConsultorio = Number(
    ((minutosTotaisPacienteMensal * Math.max(1, pacientesAtivosCount)) / 60).toFixed(1)
  );

  return {
    tempoTotalEntregaMinutosMensalPorPaciente: Math.round(minutosTotaisPacienteMensal),
    tempoTotalEntregaHorasMensalConsultorio,
    scoreEstruturaRetencaoPercentual,
    taxaRetencaoEfetivaPercentual,
    custoInsumosFisicosMensalPorPaciente: custoInsumosPaciente,
    tarefasDelegadasEquipeCount: tarefasEquipe,
    tarefasExpertCount: tarefasExpert,
    itensQueroFazerCount: itensQueroFazer,
  };
}
