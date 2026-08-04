import { ClientBlocks, ItemState } from '../types';

export interface DemandaCluster {
  key: string;
  name: string;
  description: string;
  promessas: string[];
}

export const DEMANDA_CLUSTERS: DemandaCluster[] = [
  {
    key: 'estetica',
    name: 'Estética & Emagrecimento',
    description: 'Perda de peso, queima de gordura, definição muscular ou mudança no corpo.',
    promessas: [
      'Perda de gordura rápida e resultado visível nas primeiras semanas',
      'Emagrecimento definitivo, focado em acabar com o efeito sanfona',
      'Definição muscular com foco na estética do corpo e redução de medidas',
      'Reeducação do metabolismo para queimar gordura sem passar fome'
    ]
  },
  {
    key: 'saude',
    name: 'Saúde Clínica & Metabolismo',
    description: 'Controle de exames alterados, tratamento de doenças, dores ou indicação médica.',
    promessas: [
      'Normalização e melhora rápida nos exames de sangue alterados',
      'Controle de doenças e sintomas (diabetes, hipertensão, dores, refluxo)',
      'Recuperação da energia diária, disposição e fim do cansaço constante',
      'Redução da dependência de medicamentos contínuos através da alimentação'
    ]
  },
  {
    key: 'comportamento',
    name: 'Comportamento & Relação com a Comida',
    description: 'Ansiedade alimentar, compulsão, efeito sanfona ou fim da culpa ao comer.',
    promessas: [
      'Fim do ciclo de ansiedade, compulsão e culpa ao comer',
      'Libertação de dietas restritivas e da contagem obsessiva de calorias',
      'Autonomia e paz para comer de tudo em qualquer ambiente sem medo',
      'Reconstrução da relação com a comida e com o próprio corpo'
    ]
  },
  {
    key: 'esporte',
    name: 'Esporte & Performance',
    description: 'Ganho de massa magra, aumento de força, rendimento físico e nutrição esportiva.',
    promessas: [
      'Ganho acelerado de massa magra (hipertrofia) e definição',
      'Aumento de força, carga e rendimento máximo nos treinos',
      'Ajuste de composição corporal (perda de gordura preservando massa)',
      'Recuperação física rápida e prevenção de fadiga e lesões'
    ]
  },
  {
    key: 'fasesVida',
    name: 'Fases Específicas da Vida',
    description: 'Gestação, tentativa de engravidar, menopausa, saúde da mulher, idosos ou infância.',
    promessas: [
      'Alívio e controle de sintomas hormonais (calorões, TPM, retenção)',
      'Nutrição segura e suporte completo para o desenvolvimento (gestação/infância)',
      'Manutenção da saúde, massa magra e vitalidade no envelhecimento',
      'Adequação de nutrientes para cada fase biológica sem complicação'
    ]
  },
  {
    key: 'restricoes',
    name: 'Restrições & Estilo de Vida',
    description: 'Vegetarianismo, veganismo, alergias, intolerâncias alimentares ou dietas específicas.',
    promessas: [
      'Transição alimentar segura e sem risco de carências nutricionais',
      'Eliminação de desconfortos digestivos provocados por sensibilidades',
      'Praticidade e variedade para comer bem dentro e fora de casa',
      'Adequação completa do estilo de vida sem abrir mão do prazer de comer'
    ]
  }
];

export const CAPTACAO_CHANNELS = [
  'Indicação e Boca a Boca (Pacientes Atuais)',
  'Instagram e Marketing de Conteúdo (Orgânico)',
  'Social Selling (Vendas via Direct e WhatsApp)',
  'Reativação de Pacientes Antigos',
  'Desafios e Grupos de Emagrecimento',
  'Tráfego Pago / Anúncios Patrocinados',
  'Parcerias Estratégicas e Indicações Médicas',
  'Eventos Presenciais ou Online',
  'Plataformas de Busca e Vídeos Curtos (TikTok e Google)'
] as const;

export const GARGALO_STEPS = [
  'Logo no início (Apresentação de Preço): Perguntaram o preço logo de cara, você passou o valor e a pessoa sumiu.',
  'Após a explicação do serviço: Você explicou como funciona o acompanhamento, mas a pessoa parou de responder.',
  'Na tentativa de agendamento: A conversa fluiu bem, mas na hora de escolher a data/horário a pessoa não avançou.',
  'No-Show (Não comparecimento): Agendou a consulta, mas desmarcou em cima da hora ou não apareceu.',
  'Nenhuma das anteriores / Não sei identificar: A conversa parou por outro motivo ou não me recordo do momento exato.'
] as const;

export const OBJACAO_ITEMS = [
  'Financeiro: "Achei caro" ou "Está fora do meu orçamento agora".',
  'Decisão Externa: "Preciso falar com meu esposo(a) / família antes".',
  'Falta de Tempo: "Estou numa rotina muito corrida agora".',
  'Formato da Entrega: Achou a frequência das consultas muito distante ou o modelo inacessível.',
  'Sem Justificativa (Vácuo / Ghosting): A pessoa simplesmente parou de responder sem dar nenhum motivo.',
  'Nenhuma das anteriores: A pessoa apresentou uma justificativa diferente destas.'
] as const;

export const ATENDIMENTO_STEPS = [
  'Boas-vindas personalizadas: Cumprimento o cliente pelo nome e me apresento.',
  'Investigação de necessidades: Faço perguntas para entender o objetivo/dor antes de falar do meu serviço.',
  'Envio de áudios: Mando áudios explicativos para criar conexão e proximidade.',
  'Apresentação do Método: Explico como funciona a minha entrega e diferenciais antes de passar o preço.',
  'Envio de Material em PDF / Tabela: Envio uma apresentação visual ou tabela de preços pronta.',
  'Ancoragem de Valor: Apresento opções de planos (ex: trimestral/semestral) além da consulta avulsa.',
  'Chamada Clara para Ação (CTA): Finalizo a mensagem com uma pergunta direta convidando para agendar.',
  'Atendimento Delegado: O primeiro contato é feito inteiramente por secretária ou equipe comercial.'
] as const;

export const FOLLOWUP_ATTEMPTS_OPTIONS = [
  '1 vez',
  '2 vezes',
  '3 vezes',
  '4 vezes ou mais'
] as const;

export const FOLLOWUP_INTERVAL_OPTIONS = [
  'No mesmo dia (algumas horas depois)',
  'No dia seguinte (24h)',
  '2 a 3 dias depois',
  '1 semana ou mais depois'
] as const;

export const FOLLOWUP_CONTENT_OPTIONS = [
  'Pergunto se a pessoa ficou com alguma dúvida sobre o valor/método.',
  'Envio um conteúdo útil (ex: post, vídeo ou artigo) relacionado à dor dela.',
  'Apresento uma nova opção de horário ou facilidade de pagamento.',
  'Faço uma pergunta simples de checagem (ex: "Ainda faz sentido para você?").'
] as const;

export const BLOCK1_OPTIONS = DEMANDA_CLUSTERS.map(c => ({
  id: c.key,
  category: c.name,
  text: c.description
}));

// ================================================================
// EIXO 04 — SERVIÇOS & MODELAGEM
// ================================================================
export const FORMATO_COMERCIAL_OPTIONS = [
  'Consulta Pontual / Avulsa',
  'Programa de Acompanhamento',
  'Atendimento 100% Assíncrono / Sem Vídeo',
  'Comunidade / Grupo de Aceleração',
  'Mentoria / High-Ticket Multidisciplinar'
] as const;

export const FORMA_PAGAMENTO_OPTIONS = [
  'Pix / Dinheiro',
  'Cartão de Crédito à Vista',
  'Cartão Parcelado',
  'Recorrência / Assinatura (Cobrança mensal automática no cartão sem comprometer o limite)',
  'Boleto / Crediário'
] as const;

export const PARCELAMENTO_OPTIONS = [
  'À vista', '2x', '3x', '4x', '6x', '10x', '12x'
] as const;

export const MODALIDADE_OPTIONS = [
  '100% Presencial', '100% Online', 'Híbrido'
] as const;

export const DURACAO_CONTRATO_OPTIONS = [
  'Pontual (1 dia)', '30 dias', '90 dias (Trimestral)', '180 dias (Semestral)', '360 dias (Anual)'
] as const;

export const ESTRATEGIA_RENOVACAO_OPTIONS = [
  'Encerramento / Alta: Não há oferta ativa de renovação; a relação se encerra.',
  'Volta para Consulta Avulsa: O cliente agenda novas consultas pontuais apenas quando sente necessidade.',
  'Oferta Ativa de Renovação / Manutenção: Apresento um plano de continuidade com formato e valor diferenciados.',
  'Cobrança Recorrente Automática: O paciente está em uma assinatura mensal contínua que renova sozinha.'
] as const;

// ================================================================
// EIXO 05 — ENTREGA & ROTINA
// ================================================================
export const ENTREGAVEIS_OPTIONS = [
  'Consultas de avaliação / retornos presenciais ou online',
  'Plano alimentar individualizado / Cardápios',
  'Prescrição de Suplementos / Fitoterápicos / Manipulados',
  'Relatórios Visuais / Dossiês de Evolução em IA (Métricas tabuladas e gráficos de evolução)',
  'Lâminas, E-books e Guias Práticos (Guias de compras, receitas, listas de substitutos)',
  'Análise e solicitação de exames laboratoriais',
  'Suporte tira-dúvidas contínuo no WhatsApp / Aplicativo',
  'Check-ins e formulários periódicos de rotina (Checagens semanais/quinzenais)'
] as const;

export const FREQUENCIA_ENTREGA_OPTIONS = [
  'Entrega Pontual / Única: O plano alimentar e orientações são entregues 1 única vez no início e duram até o fim.',
  'Ajustes Recorrentes por Período: O plano é atualizado ciclicamente (ex: a cada 15 dias ou 30 dias).',
  'Ajustes Dinâmicos em Tempo Real: Fazemos pequenos ajustes imediatos na rotina de acordo com o feedback do paciente.'
] as const;

export const NIVEL_CUSTOMIZACAO_OPTIONS = [
  '100% Personalizado / Artesanal: Tudo (dietas, materiais e áudios) é feito do zero e exclusivo para cada paciente.',
  '100% Padrão / Escalável: O conteúdo e dietas foram criados uma única vez e distribuídos igualmente para o grupo/base.',
  'Modelo Híbrido / Semi-Personalizado: A dieta/prescrição é individual, mas materiais de apoio, lâminas e guias são padrões do consultório.'
] as const;

export const RESPONSAVEL_PRODUCAO_OPTIONS = [
  'Eu mesmo(a) (Nutricionista Principal)',
  'Equipe Técnica (Nutricionistas Assistentes / Estagiárias / PhDs)',
  'Apoio de Inteligência Artificial + Revisão da equipe'
] as const;

export const TEMPO_PRODUCAO_OPTIONS = [
  'Menos de 20 minutos por paciente',
  '20 a 45 minutos por paciente',
  '45 a 90 minutos por paciente',
  'Mais de 2 horas por paciente'
] as const;

export const RESPONSAVEL_ENVIO_OPTIONS = [
  'Eu mesmo(a) (Nutricionista Principal)',
  'Minha equipe de Suporte / Secretária / CS',
  'Envio automático pelo Sistema / Prontuário Eletrônico'
] as const;

export const PRAZO_ENVIO_OPTIONS = [
  'Na hora (Entregue durante a própria consulta)',
  'Em até 24 horas',
  'Em até 48 horas',
  'Entre 3 e 7 dias úteis'
] as const;

export const SLA_RESPOSTA_OPTIONS = [
  'Resposta Ultra-Rápida (Até 2 horas): Regra inegociável de agilidade no atendimento diário.',
  'Atendimento por Blocos/Turnos: O suporte é respondido em horários fixos (ex: meio-dia e final da tarde).',
  'Em até 24 horas úteis: Dúvidas são respondidas no próximo dia útil.',
  'Sem tempo padronizado: Respondo apenas quando encontro tempo livre na agenda entre as consultas.'
] as const;

export const ESTRATEGIA_INATIVIDADE_OPTIONS = [
  'Resgate Ativo via CRM / Equipe ("Nutrianjos"): Mapeamos a inatividade e fazemos até 3 ou 4 contatos ativos para trazer a pessoa de volta.',
  'Mensagem esporádica de checagem: Envio uma mensagem simples perguntando "está tudo bem por aí?".',
  'Aguardamos o paciente chamar: Não monitoramos a inatividade; a iniciativa de contato fica 100% com o paciente.'
] as const;

export const ELEMENTOS_ENCANTAMENTO_OPTIONS = [
  'Envio de Mimos / Kits Físicos: Entrega de canecas, balanças, marmiteiras, mimos ou chocolates na casa do paciente.',
  'Acolhimento Relacional Extensivo: Escuta ativa aprofundada com foco comportamental e emocional durante as sessões.',
  'Eventos Presenciais e Experiências em Tribo: Organização de encontros em parques, festas, corridas, jantares ou premiações de alunos.',
  'Comunidades Ativas de Alunos: Grupos abertos (WhatsApp/Telegram) focados na interação diária entre os próprios clientes.',
  'Desafios e Gamificação Interna: Competições saudáveis periódicas com prêmios e metas exclusivas para pacientes.',
  'Descontos em Parcerias Locais: Mapeamento de descontos e parcerias com restaurantes, lojas e serviços da região do cliente.'
] as const;

export const FIXED_COST_ITEMS = [
  // Espaço Físico (8.4 - 8.12)
  { id: 'aluguel', category: 'Espaço Físico', label: 'Aluguel' },
  { id: 'condominio', category: 'Espaço Físico', label: 'Condomínio' },
  { id: 'iptu', category: 'Espaço Físico', label: 'IPTU' },
  { id: 'energia', category: 'Espaço Físico', label: 'Energia' },
  { id: 'agua', category: 'Espaço Físico', label: 'Água' },
  { id: 'internet', category: 'Espaço Físico', label: 'Internet/Telefone' },
  { id: 'seguroEspaco', category: 'Espaço Físico', label: 'Seguro do espaço' },
  { id: 'limpeza', category: 'Espaço Físico', label: 'Limpeza' },
  { id: 'lixoHospitalar', category: 'Espaço Físico', label: 'Lixo Hospitalar' },

  // Pessoas & Equipe (8.13 - 8.19)
  // Note: Subtotal of Equipe is imported automatically from Bloco 7, but let's list others
  { id: 'proLabore', category: 'Pessoas & Equipe', label: 'Pró-labore' },
  { id: 'salariosCLT', category: 'Pessoas & Equipe', label: 'Salários CLT adicionais' },
  { id: 'encargosSociais', category: 'Pessoas & Equipe', label: 'Encargos sociais' },
  { id: 'beneficios', category: 'Pessoas & Equipe', label: 'Benefícios' },
  { id: 'contador', category: 'Pessoas & Equipe', label: 'Contador' },
  { id: 'juridicoTi', category: 'Pessoas & Equipe', label: 'Jurídico/TI' },

  // Dia a Dia (8.20 - 8.24)
  { id: 'softwaresProntuario', category: 'Dia a Dia', label: 'Softwares/Prontuário' },
  { id: 'materiaisConsultorio', category: 'Dia a Dia', label: 'Materiais de Consultório' },
  { id: 'materiaisEscritorio', category: 'Dia a Dia', label: 'Materiais de Escritório' },
  { id: 'copaRecepcao', category: 'Dia a Dia', label: 'Copa/Recepção' },
  { id: 'manutencaoEquipamentos', category: 'Dia a Dia', label: 'Manutenção de Equipamentos' },

  // Divulgação (8.25 - 8.27)
  { id: 'anunciosPagos', category: 'Divulgação', label: 'Anúncios pagos (Tráfego)' },
  { id: 'agenciaDesigner', category: 'Divulgação', label: 'Agência/Designer' },
  { id: 'materiaisImpressos', category: 'Divulgação', label: 'Materiais impressos' },

  // Impostos/Documentação (8.28 - 8.32)
  { id: 'impostoFaturamento', category: 'Impostos/Documentação', label: 'Imposto sobre faturamento' },
  { id: 'crn', category: 'Impostos/Documentação', label: 'CRN' },
  { id: 'alvaras', category: 'Impostos/Documentação', label: 'Alvarás' },
  { id: 'certificadoDigital', category: 'Impostos/Documentação', label: 'Certificado Digital' },
  { id: 'taxasBancarias', category: 'Impostos/Documentação', label: 'Taxas bancárias' },

  // Estudos/Reservas (8.33 - 8.35)
  { id: 'cursos', category: 'Estudos/Reservas', label: 'Cursos' },
  { id: 'reservaEquipamentos', category: 'Estudos/Reservas', label: 'Reserva de equipamentos' },
  { id: 'reservaEmergencia', category: 'Estudos/Reservas', label: 'Reserva de emergência' },
];

export const ROUTINE_ITEMS = [
  { id: 'kitBoasVindas', label: 'Kit de boas-vindas' },
  { id: 'consultaInicial', label: 'Consulta inicial' },
  { id: 'avaliacaoFisica', label: 'Avaliação física', extra: 'times_days' },
  { id: 'revisaoExames', label: 'Revisão de exames', extra: 'times_days', condition: 'avaliacaoFisica' },
  { id: 'ajustePlano', label: 'Ajuste do plano', extra: 'adjustments' },
  { id: 'materiaisApoio', label: 'Materiais de apoio', extra: 'materials' },
  { id: 'consultaAcompanhamento', label: 'Consulta de acompanhamento', extra: 'frequency' },
  { id: 'relatorioEvolucao', label: 'Relatório de evolução', extra: 'times_days' },
  { id: 'checkIn', label: 'Check-in', extra: 'frequency' },
  { id: 'contatoProativo', label: 'Contato proativo', extra: 'frequency' },
  { id: 'mudancaSuplementacao', label: 'Mudança de suplementação', extra: 'adjustments' },
];

const initialItemState = (included: 'Sim' | 'Não' | 'Não sei'): ItemState => ({
  included,
  responsible: '',
  duration: 0,
});

export const getInitialBlocks = (): ClientBlocks => ({
  b1: {
    demand: {
      estetica: 0,
      saude: 0,
      comportamento: 0,
      esporte: 0,
      fasesVida: 0,
      restricoes: 0,
    },
    clusterPromessas: {},
    keepFocus: '',
    newTargetPublic: '',
    finalTargetPublic: '',
    finalPromessa: '',
    methodPilar: '',
  },
  b2: {
    leads: [],
    channels: [],
    channelInquiries: {},
    channelConversions: {},
    marketingFrequency: 0,
    marketingDuration: 0,
    usesSchedulingApp: 'Não sei',
    schedulingAppName: '',
  },
  b3: {
    gargaloDistribution: {},
    objecaoDistribution: {},
    atendimentoSteps: [],
    doesFollowUp: '',
    followUpAttemptsChoice: '',
    followUpIntervalChoice: '',
    followUpContentChoice: [],
    followsScript: 'Não sei',
    closingChannel: 'mensagem',
    usesCRM: 'Não sei',
    crmName: '',
    closer: 'Eu mesmo(a)',
    closerName: '',
    followUpDays: 0,
    followUpAttempts: 0,
    averageClosingTime: null,
    averageClosingTimeNotKnown: true,
    lostReasons: [],
  },
  b4: {
    services: [],
    quantidadeFormatos: '',
    carroChefeId: '',
    estrategiaRenovacao: '',
  },
  b5: {
    entregaveis: [],
    frequenciaEntrega: '',
    nivelCustomizacao: '',
    responsavelProducao: '',
    tempoProducao: '',
    responsavelEnvio: '',
    prazoEnvio: '',
    slaResposta: '',
    estrategiaInatividade: '',
    elementosEncantamento: [],
  },
  b6: {
    horasPorDia: {
      'Segunda': 0, 'Terça': 0, 'Quarta': 0,
      'Quinta': 0, 'Sexta': 0, 'Sábado': 0, 'Domingo': 0
    },
    drenos: ['', '', '', '', ''],
    blocosPessoais: {
      treino:   { enabled: false, minutos: 60, vezesSemana: 3 },
      familia:  { enabled: false, minutos: 60, vezesSemana: 5 },
      estudo:   { enabled: false, minutos: 30, vezesSemana: 3 },
      descanso: { enabled: false, minutos: 0,  vezesSemana: 0, sabado: false, domingo: false },
      outro:    { enabled: false, name: '', minutos: 30, vezesSemana: 1 },
    },
    blocosGestao: {
      checkins:         { enabled: false, minutos: 30, vezesSemana: 5 },
      reuniaoEquipe:    { enabled: false, minutos: 60, vezesSemana: 1 },
      gravacaoConteudo: { enabled: false, minutos: 120, vezesSemana: 1 },
      producaoMidia:    { enabled: false, minutos: 60, vezesSemana: 2 },
      analiseFinanceira:{ enabled: false, minutos: 60, vezesSemana: 1 },
      outro:            { enabled: false, name: '', minutos: 30, vezesSemana: 1 },
    },
    blocosVendas: {
      socialSelling:            { enabled: false, minutos: 30, vezesSemana: 5 },
      relacionamentoParceiros:  { enabled: false, minutos: 60, vezesSemana: 1 },
      reativacaoPacientes:      { enabled: false, minutos: 30, vezesSemana: 2 },
      followUpLeads:            { enabled: false, minutos: 20, vezesSemana: 5 },
      outro:                    { enabled: false, name: '', minutos: 30, vezesSemana: 1 },
    },
    daily: '',
  },
  b7: {
    possuiEquipe: '',
    a1Sobrecarga: '',
    a2Gargalo: '',
    a3Prontidao: '',
    b1Departamentos: {
      recepcao: { enabled: false, custoMensal: 0 },
      entregaTecnica: { enabled: false, custoMensal: 0 },
      sucessoCliente: { enabled: false, custoMensal: 0 },
      comercial: { enabled: false, custoMensal: 0 },
      marketing: { enabled: false, custoMensal: 0 },
    },
    b2Processos: '',
    b3Auditoria: '',
    b4Incentivos: [],
    members: [],
  },
  b8: {
    gestaoCaixa: '',
    faturamentoM2: 0,
    faturamentoM1: 0,
    faturamentoAtual: 0,
    possuiEstruturaFisica: '',
    estruturaFisica: {
      aluguel: 0,
      condominioIptu: 0,
      energiaAgua: 0,
      internetTelefone: 0,
      limpezaManutencao: 0,
      outroNome: '',
      outroValor: 0
    },
    possuiTecnologia: '',
    tecnologiaSoftwares: {},
    outroTech1Nome: '',
    outroTech1Valor: 0,
    outroTech2Nome: '',
    outroTech2Valor: 0,
    possuiServicosProfissionais: '',
    servicosProfissionais: {
      contabilidade: 0,
      juridico: 0,
      taxasAlvaraCrn: 0,
      outroNome: '',
      outroValor: 0
    },
    regimeTributario: '',
    aliquotaImpostoOutro: 0,
    tipoTaxaMeiosPagamento: '',
    taxaMeiosPagamento: 3.8,
    antecipaCartao: '',
    tipoTaxaAntecipacao: '',
    taxaAntecipacao: 0,
    pagaComissao: '',
    tipoComissao: '',
    comissaoPorcentagem: 0,
    comissaoFixaReais: 0,
    possuiKitsMimos: '',
    custoKitsMimos: 0,
    custoFretePaciente: 0,
    possuiRemuneracaoTecnica: '',
    custoRemuneracaoTecnica: 0,
    tipoInvestimentoTrafego: '',
    investimentoTrafegoMensal: 0,
    tipoInvestimentoEventos: '',
    gastosEventos: {
      locacaoEspaco: 0,
      alimentacaoBrindes: 0,
      fotografoVideomaker: 0
    },
    possuiHistorico12Meses: '',
    historico12Meses: {},
    fundoReservaStatus: '',
    fixedCosts: FIXED_COST_ITEMS.reduce((acc, item) => {
      acc[item.id] = { status: 'Não sei', type: 'Não sei', value: 0 };
      return acc;
    }, {} as Record<string, { status: 'Sim' | 'Não' | 'Não sei'; type: 'Valor Exato' | 'Faixa' | 'Não sei'; value: number }>),
    loanStatus: 'Não sei',
    loanInstallment: 0,
    debtStatus: 'Não sei',
    debtValue: 0,
  },
  b9: {
    numeroMagico: 0,
    tetoSemanaPerfeita: 0,
    passo0Concluido: false,
    reajusteNovosPct: 0,
    reajusteAntigosPct: 0,
    taxaPerdaPct: 15,
    novosPacientesSimulados: 0,
    travaPrecoControle3: false,
    precoRealProdutoControle3: 0,
    migracaoPlanosLongosPct: 0,
    travaPrecoControle4: false,
    precoRealProdutoControle4: 0,
    duracaoDiasControle4: 180,
    adesaoDownsellPct: 0,
    adesaoCrosssellPct: 0,
    faturamento90: 0,
    faturamentoM1: 0,
    faturamentoM2: 0,
    faturamentoM3: 0,
    pacientesAtivos: 0,
    horasLivres: 0,
  },
});

import { EixoSchema } from '../types';

export const DEFAULT_EIXOS_SCHEMA: EixoSchema[] = [
  {
    id: 0,
    label: 'Promessa & Método',
    questions: [
      {
        id: 1,
        key: 'demand',
        text: 'Entre [DATA_INICIAL] e [DATA_HOJE], quantas pessoas te procuraram interessadas em cada um destes objetivos?',
        type: 'Contador Numérico Multi',
        options: DEMANDA_CLUSTERS.map(c => c.name)
      },
      {
        id: 2,
        key: 'clusterPromessas',
        text: 'Para cada público atendido, qual é a principal transformação que você promete entregar?',
        type: 'Escolha única por Público',
        options: []
      },
      {
        id: 3,
        key: 'keepFocus',
        text: 'Analisando o seu histórico recente, você quer continuar focando nesse mesmo público nos próximos 90 dias?',
        type: 'Escolha única',
        options: ['Sim, quero manter esse foco.', 'Não, quero mudar o meu público prioritário nos próximos 90 dias.']
      },
      {
        id: 4,
        key: 'newTargetPublic',
        text: 'Para qual público você deseja direcionar o seu posicionamento nos próximos 90 dias?',
        type: 'Escolha única',
        options: DEMANDA_CLUSTERS.map(c => c.name)
      },
      {
        id: 5,
        key: 'methodPilar',
        text: 'Para entregar essa transformação, qual é o pilar central do seu método no dia a dia?',
        type: 'Escolha única',
        options: [
          'Adaptação à rotina real: Plano flexível e fácil de manter no dia a dia.',
          'Acompanhamento próximo: Suporte diário fora da consulta para garantir adesão.',
          'Foco no comportamento: Mudança de mentalidade e relação com a comida antes do prato.',
          'Prescrição técnica precisa: Estratégia nutricional avançada e cálculo exato.',
          'Escuta sem julgamentos: Atendimento acolhedor, humano e empático.'
        ]
      }
    ]
  },

  {
    id: 1,
    label: 'Captação',
    questions: [
      {
        id: 7,
        key: 'selectedDate',
        text: 'Qual data você vai conferir agora no seu WhatsApp ou agenda?',
        type: 'Texto curto',
        options: []
      },
      {
        id: 8,
        key: 'leadName',
        text: 'Digite o nome de uma pessoa que te procurou no dia [DATA_SELECIONADA]:',
        type: 'Texto curto',
        options: []
      },
      {
        id: 9,
        key: 'leadCluster',
        text: 'Qual foi o objetivo principal que [Nome_Pessoa] buscou ao te procurar no dia [DATA_SELECIONADA]?',
        type: 'Escolha única',
        options: DEMANDA_CLUSTERS.map(c => c.name)
      },
      {
        id: 10,
        key: 'leadClosed',
        text: '[Nome_Pessoa] fechou acompanhamento com você?',
        type: 'Escolha única',
        options: ['SIM (Paciente Ativo)', 'NÃO (Lead / Não Convertido)']
      },
      {
        id: 11,
        key: 'leadChannel',
        text: 'Como [Nome_Pessoa] te encontrou ou chegou até você?',
        type: 'Escolha única',
        options: [...CAPTACAO_CHANNELS]
      }
    ]
  },
  {
    id: 2,
    label: 'Vendas',
    questions: [
      {
        id: 12,
        key: 'gargaloDistribution',
        text: 'Das [TOTAL_NAO_CONVERTIDOS] pessoas que não fecharam, quantas pararam de te responder em cada um destes momentos?',
        type: 'Número Multi',
        options: [...GARGALO_STEPS]
      },
      {
        id: 13,
        key: 'objecaoDistribution',
        text: 'Pensando ainda nestas pessoas, quantas apresentaram cada uma destas justificativas para não fechar?',
        type: 'Número Multi',
        options: [...OBJACAO_ITEMS]
      },
      {
        id: 14,
        key: 'atendimentoSteps',
        text: 'Quais destas etapas fazem parte do seu atendimento quando alguém te chama no WhatsApp ou Direct?',
        type: 'Múltipla escolha',
        options: [...ATENDIMENTO_STEPS]
      },
      {
        id: 15,
        key: 'doesFollowUp',
        text: 'Quando uma pessoa para de te responder na conversa de vendas, qual é a sua atitude padrão?',
        type: 'Escolha única',
        options: [
          'Não envio mais nenhuma mensagem: Aguardo o cliente voltar a entrar em contato por conta própria.',
          'Realizo acompanhamento / recontato ativo: Envio novas mensagens para tentar retomar a conversa.'
        ]
      },
      {
        id: 16,
        text: 'Quais os motivos mais comuns para o cliente não fechar?',
        type: 'Múltipla escolha',
        options: [
          'Preço achado alto',
          'Falta de horário na agenda',
          'Formato (online/presencial)',
          'Decisão adiada',
          'Concorrência'
        ]
      }
    ]
  },
  {
    id: 3,
    label: 'Serviços',
    questions: [
      {
        id: 18,
        key: 'services',
        text: 'Cadastre os serviços e planos que você oferece hoje na sua prática clínica.',
        type: 'Repetidor Serviços',
        options: []
      }
    ]
  },
  {
    id: 4,
    label: 'Entrega & Rotina',
    questions: [
      {
        id: 19,
        key: 'deliveries',
        text: 'Para cada entrega clínica da sua rotina, ela está incluída? Se sim, qual a duração em minutos?',
        type: 'Entregas',
        options: []
      }
    ]
  },
  {
    id: 5,
    label: 'Agenda',
    questions: [
      {
        id: 20,
        key: 'schedule',
        text: 'Quais dias da semana e turnos o seu consultório está aberto para atendimento?',
        type: 'Agenda',
        options: []
      },
      {
        id: 21,
        key: 'commitments',
        text: 'Você possui compromissos fixos que travam sua agenda (aulas, pós-graduação, família)?',
        type: 'Repetidor Compromissos',
        options: []
      }
    ]
  },
  {
    id: 6,
    label: 'Equipe',
    questions: [
      {
        id: 22,
        key: 'members',
        text: 'Cadastre os membros da sua equipe de apoio e seus custos mensais.',
        type: 'Moeda (R$)',
        options: []
      }
    ]
  },
  {
    id: 7,
    label: 'Financeiro',
    questions: [
      {
        id: 23,
        key: 'faturamentoHistory',
        text: 'Qual foi seu faturamento bruto nos últimos meses (M-2, M-1, M-0)?',
        type: 'Moeda Multi',
        options: ['Faturamento M-2', 'Faturamento M-1', 'Faturamento Atual']
      },
      {
        id: 24,
        key: 'loanStatus',
        text: 'Possui empréstimos ou dívidas ativas?',
        type: 'Escolha única',
        options: ['Sim', 'Não', 'Não sei']
      }
    ]
  },
  {
    id: 8,
    label: 'Meta & Futuro',
    questions: [
      {
        id: 25,
        key: 'faturamento90',
        text: 'Qual a sua meta de faturamento mensal para os próximos 90 dias?',
        type: 'Moeda (R$)',
        options: []
      },
      {
        id: 26,
        key: 'pacientesAtivosMeta',
        text: 'Quantos pacientes ativos você deseja atender simultaneamente?',
        type: 'Texto curto',
        options: []
      },
      {
        id: 27,
        key: 'horasLivresMeta',
        text: 'Quantas horas livres por semana você quer ter garantidas na sua rotina?',
        type: 'Texto curto',
        options: []
      }
    ]
  }
];

// ================================================================
// EIXO 08 — FINANCEIRO, MARGEM & ROI
// ================================================================
export const EIXO8_TECH_SOFTWARES = [
  // A) Softwares Nutricionais
  { category: 'Softwares Nutricionais & Gestão', key: 'webdiet', name: 'WebDiet' },
  { category: 'Softwares Nutricionais & Gestão', key: 'welts', name: 'Welts' },
  { category: 'Softwares Nutricionais & Gestão', key: 'webnutri', name: 'WebNutri' },
  // B) CRM, Processos & Comunicação
  { category: 'CRM, Processos & Comunicação', key: 'clickup', name: 'ClickUp' },
  { category: 'CRM, Processos & Comunicação', key: 'notion', name: 'Notion' },
  { category: 'CRM, Processos & Comunicação', key: 'trello', name: 'Trello' },
  { category: 'CRM, Processos & Comunicação', key: 'pipefy', name: 'Pipefy' },
  { category: 'CRM, Processos & Comunicação', key: 'slack', name: 'Slack' },
  { category: 'CRM, Processos & Comunicação', key: 'google_workspace', name: 'Google Workspace / Google Agenda / Drive' },
  { category: 'CRM, Processos & Comunicação', key: 'zoom_meet', name: 'Zoom / Google Meet (Planos Pagos)' },
  // C) IA, Design & Edição
  { category: 'Inteligência Artificial, Design & Mídia', key: 'chatgpt', name: 'ChatGPT (GPT Plus / Team)' },
  { category: 'Inteligência Artificial, Design & Mídia', key: 'claude', name: 'Claude ("Claudinho")' },
  { category: 'Inteligência Artificial, Design & Mídia', key: 'gama', name: 'Gama App' },
  { category: 'Inteligência Artificial, Design & Mídia', key: 'capcut', name: 'CapCut Pro' },
  { category: 'Inteligência Artificial, Design & Mídia', key: 'captions', name: 'Captions' },
  { category: 'Inteligência Artificial, Design & Mídia', key: 'canva', name: 'Canva Pro' },
  { category: 'Inteligência Artificial, Design & Mídia', key: 'tldv', name: 'TLDV (Transcrição em IA de Reuniões)' },
  { category: 'Inteligência Artificial, Design & Mídia', key: 'adobe', name: 'Pacote Adobe (Photoshop / CorelDRAW)' },
  // D) Automação de Marketing & WhatsApp
  { category: 'Automação de Marketing & WhatsApp', key: 'manychat', name: 'Manychat' },
  { category: 'Automação de Marketing & WhatsApp', key: 'whatsapp_disparo', name: 'Ferramentas de Disparo em Massa no WhatsApp' }
] as const;

export const REGIME_TRIBUTARIO_OPTIONS = [
  'Não faço recolhimento de imposto no momento',
  'Simples Nacional — Anexo III',
  'Simples Nacional — Anexo V',
  'Lucro Presumido',
  'Pessoa Física / Carnê-Leão (Tabela Progressiva IRPF)',
  'Outro / Alíquota Específica'
] as const;



