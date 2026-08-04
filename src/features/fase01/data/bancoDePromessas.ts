// bancoDePromessas.ts
// Fonte única de dados para os 6 clusters e suas opções de promessa.

import { ClusterId } from '../fase01.types';

export interface ClusterDef {
  id: ClusterId;
  label: string;
  promessas: string[];
}

export const CLUSTERS: ClusterDef[] = [
  {
    id: 'estetica_emagrecimento',
    label: 'Perda de peso e mudança no corpo',
    promessas: [
      'Perda de gordura rápida e resultado visível nas primeiras semanas',
      'Emagrecimento definitivo, focado em acabar com o efeito sanfona',
      'Definição muscular com foco na estética do corpo e redução de medidas',
      'Reeducação do metabolismo para queimar gordura sem passar fome',
    ],
  },
  {
    id: 'saude_clinica',
    label: 'Saúde e doenças',
    promessas: [
      'Normalização e melhora rápida nos exames de sangue alterados',
      'Controle de doenças e sintomas (diabetes, hipertensão, dores, refluxo)',
      'Recuperação da energia diária, disposição e fim do cansaço constante',
      'Redução da dependência de medicamentos contínuos através da alimentação',
    ],
  },
  {
    id: 'comportamento_alimentar',
    label: 'Comer sem culpa',
    promessas: [
      'Fim do ciclo de ansiedade, compulsão e culpa ao comer',
      'Libertação de dietas restritivas e da contagem obsessiva de calorias',
      'Autonomia e paz para comer de tudo em qualquer ambiente sem medo',
      'Reconstrução da relação com a comida e com o próprio corpo',
    ],
  },
  {
    id: 'esporte_performance',
    label: 'Esporte e desempenho físico',
    promessas: [
      'Ganho acelerado de massa magra (hipertrofia) e definição',
      'Aumento de força, carga e rendimento máximo nos treinos',
      'Ajuste de composição corporal (perda de gordura preservando massa)',
      'Recuperação física rápida e prevenção de fadiga e lesões',
    ],
  },
  {
    id: 'fases_da_vida',
    label: 'Fases da vida',
    promessas: [
      'Alívio e controle de sintomas hormonais (calorões, TPM, retenção)',
      'Nutrição segura e suporte completo para o desenvolvimento (gestação/infância)',
      'Manutenção da saúde, massa magra e vitalidade no envelhecimento',
      'Adequação de nutrientes para cada fase biológica sem complicação',
    ],
  },
  {
    id: 'restricoes_estilo_vida',
    label: 'Restrições alimentares',
    promessas: [
      'Transição alimentar segura e sem risco de carências nutricionais',
      'Eliminação de desconfortos digestivos provocados por sensibilidades',
      'Praticidade e variedade para comer bem dentro e fora de casa',
      'Adequação completa do estilo de vida sem abrir mão do prazer de comer',
    ],
  },
];

export function getClusterById(id: ClusterId): ClusterDef | undefined {
  return CLUSTERS.find((c) => c.id === id);
}

export function getLabelById(id: ClusterId): string {
  return getClusterById(id)?.label ?? id;
}
