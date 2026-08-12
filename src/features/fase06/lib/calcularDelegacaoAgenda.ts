// calcularDelegacaoAgenda.ts
// Motor de cálculo de alívio de tempo e divisão de tarefas (Equipe vs Expert) em Linguagem Simples.

import { DOMINIOS_TATICOS_AGENDA, ExecutanteMicroAcao } from '../catalogoMicroacoesAgenda';

export interface ResumoDelegacaoAgenda {
  totalMinutosSemanaExpert: number;
  totalHorasSemanaExpert: number;
  totalMinutosSemanaEquipe: number;
  totalHorasSemanaEquipe: number;
  percentualEconomiaTempo: number;
  microAcoesDelegadasContagem: number;
  microAcoesExpertContagem: number;
}

export function calcularDelegacaoAgenda(
  microAcoesEstado: Record<string, { realiza: boolean; duracaoMinutos: number; ocorrenciasPorSemana: number; executante?: ExecutanteMicroAcao }>
): ResumoDelegacaoAgenda {
  let minExpert = 0;
  let minEquipe = 0;
  let cntExpert = 0;
  let cntEquipe = 0;

  DOMINIOS_TATICOS_AGENDA.forEach((dom) => {
    dom.microAcoes.forEach((act) => {
      const est = microAcoesEstado[act.id];
      if (est && est.realiza) {
        const exec = est.executante || act.executanteDefault;
        const minTotal = est.duracaoMinutos * est.ocorrenciasPorSemana;

        if (exec === 'equipe') {
          minEquipe += minTotal;
          cntEquipe += 1;
        } else if (exec === 'compartilhado') {
          minExpert += minTotal * 0.5;
          minEquipe += minTotal * 0.5;
          cntExpert += 1;
          cntEquipe += 1;
        } else {
          minExpert += minTotal;
          cntExpert += 1;
        }
      }
    });
  });

  const totalMin = minExpert + minEquipe;
  const hExpert = Number((minExpert / 60).toFixed(1));
  const hEquipe = Number((minEquipe / 60).toFixed(1));
  const pctEconomia = totalMin > 0 ? Math.round((minEquipe / totalMin) * 100) : 0;

  return {
    totalMinutosSemanaExpert: minExpert,
    totalHorasSemanaExpert: hExpert,
    totalMinutosSemanaEquipe: minEquipe,
    totalHorasSemanaEquipe: hEquipe,
    percentualEconomiaTempo: pctEconomia,
    microAcoesDelegadasContagem: cntEquipe,
    microAcoesExpertContagem: cntExpert,
  };
}
