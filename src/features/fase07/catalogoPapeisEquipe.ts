// catalogoPapeisEquipe.ts
// Catálogo de Papéis de Equipe e Atribuições para o Eixo 07 em Linguagem Simples.

export interface PapelEquipeTemplate {
  id: string;
  nomePapel: string;
  icone: string;
  descricaoSimples: string;
  cargaHorariaSemanalPadrao: number;
  custoMensalEstimadoPadrao: number;
  atribuicoesPadrao: string[];
}

export const CATALOGO_PAPEIS_EQUIPE: PapelEquipeTemplate[] = [
  {
    id: 'estagiario_nutricao',
    nomePapel: 'Estagiário(a) de Nutrição',
    icone: '🎓',
    descricaoSimples: 'Apoio no cálculo de macronutrientes, antropometria inicial e triagem de check-ins.',
    cargaHorariaSemanalPadrao: 20,
    custoMensalEstimadoPadrao: 1200,
    atribuicoesPadrao: [
      'Elaboração inicial de cardápios e cálculo de calorias e macros',
      'Triagem presencial e avaliação física (medidas e bioimpedância)',
      'Leitura e resumo dos check-ins quinzenais dos pacientes',
    ],
  },
  {
    id: 'nutri_assistente',
    nomePapel: 'Nutricionista Assistente / Junior',
    icone: '🩺',
    descricaoSimples: 'Suporte técnico ativo, montagem de planos alimentares e atendimento a dúvidas.',
    cargaHorariaSemanalPadrao: 30,
    custoMensalEstimadoPadrao: 2500,
    atribuicoesPadrao: [
      'Montagem de planos alimentares personalizados segundo a metodologia da clínica',
      'Atendimento e esclarecimento de dúvidas técnicas dos pacientes',
      'Segunda opinião e triagem de exames laboratoriais',
    ],
  },
  {
    id: 'nutrianjo_suporte',
    nomePapel: 'Nutrianjo / Suporte de WhatsApp',
    icone: '💬',
    descricaoSimples: 'Atendimento diário no chat do WhatsApp para substituições e dúvidas rápidas.',
    cargaHorariaSemanalPadrao: 20,
    custoMensalEstimadoPadrao: 1500,
    atribuicoesPadrao: [
      'Resposta diária a dúvidas de alimentos e substituições no WhatsApp',
      'Envio de lembretes de hábito e incentivos na comunidade',
      'Acompanhamento do uso do aplicativo de dieta pelos pacientes',
    ],
  },
  {
    id: 'secretaria_comercial',
    nomePapel: 'Secretária / Assistente Comercial',
    icone: '📋',
    descricaoSimples: 'Onboarding de pacientes, agendamentos, emissão de notas e renovação de contratos.',
    cargaHorariaSemanalPadrao: 40,
    custoMensalEstimadoPadrao: 2000,
    atribuicoesPadrao: [
      'Boas-vindas (onboarding), envio de questionários e liberação de aplicativos',
      'Organização de agendamentos e confirmação de consultas',
      'Follow-up no CRM e cobranças de renovação de contratos',
      'Emissão de notas fiscais, boletos e recebimentos',
    ],
  },
];
