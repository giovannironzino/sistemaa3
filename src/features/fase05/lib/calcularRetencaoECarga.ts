// calcularRetencaoECarga.ts
// Motor de Cálculo de Carga Horária de Entrega Técnica e Score de Retenção Efetiva com Trava Rigorosa em 30%.
// Suporta status 'sim', 'nao_faco_quero_fazer' e 'nao'.

import { CATALOGO_20_ENTREGAVEIS, CATALOGO_RITOS_RETENCAO_CS, ExecutorEntregavel, StatusOpcaoEntregavel } from '../catalogo20Entregaveis';

export interface EstadoEntregavelItem {
  status: StatusOpcaoEntregavel;
  servicosEixo04Ids: string[];
  tipoEntrega: 'padrao' | 'personalizada';
  frequenciaMensal: number;
  duracaoMinutos: number;
  executor: ExecutorEntregavel;
}

export interface EstadoRitoRetencaoItem {
  status: StatusOpcaoEntregavel;
  servicosEixo04Ids: string[];
  frequenciaMensal: number;
  duracaoMinutos: number;
  executor: ExecutorEntregavel;
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
  let minutosTotaisPaciente = 0;
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
        const minMensal = est.frequenciaMensal * est.duracaoMinutos;
        minutosTotaisPaciente += minMensal;
      }
      pontosEstruturaBrutos += 1.5; // Cada entregável ativo adiciona 1.5% ao score bruto
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
      const minMensal = est.frequenciaMensal * est.duracaoMinutos;
      minutosTotaisPaciente += minMensal;
      pontosEstruturaBrutos += 3.0; // Ritos de CS adicionam 3.0% ao score bruto

      if (est.executor === 'equipe') tarefasEquipe++;
      if (est.executor === 'expert') tarefasExpert++;
    }
  });

  // 3. Trava Algorítmica Rigorosa em NO MÁXIMO 30% no Score de Estrutura
  const scoreEstruturaRetencaoPercentual = Number(
    Math.min(30, pontosEstruturaBrutos).toFixed(1)
  );

  // 4. Taxa de Retenção Efetiva (%): Renovação Real (Eixo 01) + Score Estrutura (máx 30%)
  const taxaRetencaoEfetivaPercentual = Number(
    Math.min(95, taxaRenovacaoHistoricaBase + scoreEstruturaRetencaoPercentual).toFixed(1)
  );

  // 5. Carga Horária Mensal Total do Consultório (horas)
  const tempoTotalEntregaHorasMensalConsultorio = Number(
    ((minutosTotaisPaciente * Math.max(1, pacientesAtivosCount)) / 60).toFixed(1)
  );

  return {
    tempoTotalEntregaMinutosMensalPorPaciente: minutosTotaisPaciente,
    tempoTotalEntregaHorasMensalConsultorio,
    scoreEstruturaRetencaoPercentual,
    taxaRetencaoEfetivaPercentual,
    custoInsumosFisicosMensalPorPaciente: custoInsumosPaciente,
    tarefasDelegadasEquipeCount: tarefasEquipe,
    tarefasExpertCount: tarefasExpert,
    itensQueroFazerCount: itensQueroFazer,
  };
}
