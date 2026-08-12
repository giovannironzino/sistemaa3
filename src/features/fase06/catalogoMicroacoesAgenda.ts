// catalogoMicroacoesAgenda.ts
// Catálogo dos 06 Domínios Táticos de Tempo do Eixo 06 — Agenda, Capacidade & Tempo.
// Decompõe a rotina do nutricionista em 35+ microações fundamentais com durações em MINUTOS.

export interface MicroAcaoAgenda {
  id: string;
  dominioId: 'tecnico' | 'comercial' | 'gestao' | 'marketing' | 'financeiro' | 'autocuidado';
  titulo: string;
  descricao: string;
  frequenciaPadrao: 'diario' | 'semanal' | 'quinzenal' | 'mensal';
  ocorrenciasPorSemanaPadrao: number;
  duracaoMinutosPadrao: number;
  eixoOrigem?: string; // Ex: 'Eixo 01', 'Eixo 04', 'Eixo 05'
}

export interface DominioTaticoTempo {
  id: 'tecnico' | 'comercial' | 'gestao' | 'marketing' | 'financeiro' | 'autocuidado';
  titulo: string;
  icone: string;
  corHex: string;
  descricao: string;
  microAcoes: MicroAcaoAgenda[];
}

export const DOMINIOS_TATICOS_AGENDA: DominioTaticoTempo[] = [
  {
    id: 'tecnico',
    titulo: 'Atendimento Clínico & Suporte Técnico',
    icone: '🩺',
    corHex: '#10b981', // emerald
    descricao: 'Consultas presenciais e online, anamnese, prescrição, cardápios e acompanhamentos.',
    microAcoes: [
      {
        id: 'tec_consultas_presenciais',
        dominioId: 'tecnico',
        titulo: 'Consultas presenciais individuais',
        descricao: 'Atendimento olho no olho e acolhimento presencial em consultório.',
        frequenciaPadrao: 'semanal',
        ocorrenciasPorSemanaPadrao: 10,
        duracaoMinutosPadrao: 60,
        eixoOrigem: 'Eixo 01 / Eixo 04',
      },
      {
        id: 'tec_teleconsultas',
        dominioId: 'tecnico',
        titulo: 'Teleconsultas / Consultas online',
        descricao: 'Atendimentos e retornos por videoconferência com pacientes.',
        frequenciaPadrao: 'semanal',
        ocorrenciasPorSemanaPadrao: 5,
        duracaoMinutosPadrao: 50,
        eixoOrigem: 'Eixo 04',
      },
      {
        id: 'tec_anamnese_escuta',
        dominioId: 'tecnico',
        titulo: 'Anamnese detalhada e escuta ativa',
        descricao: 'Investigação comportamental e histórico clínico durante as consultas.',
        frequenciaPadrao: 'semanal',
        ocorrenciasPorSemanaPadrao: 8,
        duracaoMinutosPadrao: 20,
        eixoOrigem: 'Eixo 01',
      },
      {
        id: 'tec_avaliacao_fisica',
        dominioId: 'tecnico',
        titulo: 'Avaliação física presencial (antropometria)',
        descricao: 'Medição de perímetros, dobras cutâneas e bioimpedância.',
        frequenciaPadrao: 'semanal',
        ocorrenciasPorSemanaPadrao: 8,
        duracaoMinutosPadrao: 15,
      },
      {
        id: 'tec_montagem_dietas',
        dominioId: 'tecnico',
        titulo: 'Cálculo de macronutrientes e montagem de cardápios',
        descricao: 'Elaboração técnica e personalizada das dietas nos softwares de prontuário.',
        frequenciaPadrao: 'semanal',
        ocorrenciasPorSemanaPadrao: 10,
        duracaoMinutosPadrao: 45,
        eixoOrigem: 'Eixo 01 / Eixo 05',
      },
      {
        id: 'tec_reajuste_cardapios',
        dominioId: 'tecnico',
        titulo: 'Reajuste / Atualização periódica de cardápios',
        descricao: 'Modificações e substituições no plano alimentar.',
        frequenciaPadrao: 'semanal',
        ocorrenciasPorSemanaPadrao: 5,
        duracaoMinutosPadrao: 30,
        eixoOrigem: 'Eixo 05',
      },
      {
        id: 'tec_suporte_whatsapp',
        dominioId: 'tecnico',
        titulo: 'Suporte de WhatsApp / Chat diário',
        descricao: 'Resposta a dúvidas pontuais de pacientes ao longo do dia.',
        frequenciaPadrao: 'diario',
        ocorrenciasPorSemanaPadrao: 5,
        duracaoMinutosPadrao: 45,
        eixoOrigem: 'Eixo 05',
      },
      {
        id: 'tec_ritos_checkin',
        dominioId: 'tecnico',
        titulo: 'Ritos de Check-in quinzenal ou semanal',
        descricao: 'Avaliação estruturada de hábitos, peso e evolução.',
        frequenciaPadrao: 'semanal',
        ocorrenciasPorSemanaPadrao: 12,
        duracaoMinutosPadrao: 15,
        eixoOrigem: 'Eixo 05',
      },
      {
        id: 'tec_triagem_exames',
        dominioId: 'tecnico',
        titulo: 'Análise e triagem de exames laboratoriais',
        descricao: 'Avaliação aprofundada de biomarcadores bioquímicos.',
        frequenciaPadrao: 'semanal',
        ocorrenciasPorSemanaPadrao: 4,
        duracaoMinutosPadrao: 20,
      },
      {
        id: 'tec_onboarding',
        dominioId: 'tecnico',
        titulo: 'Onboarding de novos pacientes',
        descricao: 'Boas-vindas, liberação do app de dieta e envio de materiais iniciais.',
        frequenciaPadrao: 'semanal',
        ocorrenciasPorSemanaPadrao: 3,
        duracaoMinutosPadrao: 20,
        eixoOrigem: 'Eixo 05',
      },
    ],
  },
  {
    id: 'comercial',
    titulo: 'Vendas, Comercial & Atração (Gestão de Leads)',
    icone: '🎯',
    corHex: '#6366f1', // indigo
    descricao: 'Social selling, chamadas de vendas, follow-up no CRM e renovações.',
    microAcoes: [
      {
        id: 'com_social_selling',
        dominioId: 'comercial',
        titulo: 'Social Selling diário (Direct/Enquetes)',
        descricao: 'Resposta a directs do Instagram e interação com leads aquecidos.',
        frequenciaPadrao: 'diario',
        ocorrenciasPorSemanaPadrao: 5,
        duracaoMinutosPadrao: 30,
        eixoOrigem: 'Eixo 02',
      },
      {
        id: 'com_calls_vendas',
        dominioId: 'comercial',
        titulo: 'Ligações e chamadas comerciais (Calls de Vendas - 15 min)',
        descricao: 'Conversas estratégicas de fechamento de programas de acompanhamento.',
        frequenciaPadrao: 'semanal',
        ocorrenciasPorSemanaPadrao: 6,
        duracaoMinutosPadrao: 20,
        eixoOrigem: 'Eixo 03',
      },
      {
        id: 'com_followup_crm',
        dominioId: 'comercial',
        titulo: 'Follow-up comercial no CRM',
        descricao: 'Contato com potenciais pacientes que demonstraram interesse anterior.',
        frequenciaPadrao: 'semanal',
        ocorrenciasPorSemanaPadrao: 3,
        duracaoMinutosPadrao: 30,
        eixoOrigem: 'Eixo 03',
      },
      {
        id: 'com_ritos_renovacao',
        dominioId: 'comercial',
        titulo: 'Ritos de renovação de contratos / planos',
        descricao: 'Conversas comerciais no último mês do plano para renovar o período.',
        frequenciaPadrao: 'semanal',
        ocorrenciasPorSemanaPadrao: 3,
        duracaoMinutosPadrao: 25,
        eixoOrigem: 'Eixo 03 / Eixo 04',
      },
      {
        id: 'com_warm_outbound',
        dominioId: 'comercial',
        titulo: 'Warm Outbound (Reativação de ex-pacientes)',
        descricao: 'Resgate de prontuários desativados apresentando novas ofertas.',
        frequenciaPadrao: 'semanal',
        ocorrenciasPorSemanaPadrao: 2,
        duracaoMinutosPadrao: 40,
        eixoOrigem: 'Eixo 02',
      },
    ],
  },
  {
    id: 'gestao',
    titulo: 'Gestão de Equipe & Processos Corporativos',
    icone: '👥',
    corHex: '#f59e0b', // amber
    descricao: 'Reuniões de alinhamento, auditoria de qualidade, playbooks e treinamentos.',
    microAcoes: [
      {
        id: 'ges_daily_meeting',
        dominioId: 'gestao',
        titulo: 'Reunião de Alinhamento Diário (Daily Meeting)',
        descricao: 'Encontro rápido de 15 minutos com o time operacional.',
        frequenciaPadrao: 'diario',
        ocorrenciasPorSemanaPadrao: 5,
        duracaoMinutosPadrao: 15,
      },
      {
        id: 'ges_weekly_meeting',
        dominioId: 'gestao',
        titulo: 'Reunião Semanal de Gestão (Weekly Meeting de Segunda)',
        descricao: 'Revisão de faturamento, churn, conversão e metas da semana.',
        frequenciaPadrao: 'semanal',
        ocorrenciasPorSemanaPadrao: 1,
        duracaoMinutosPadrao: 60,
      },
      {
        id: 'ges_auditoria_5555',
        dominioId: 'gestao',
        titulo: 'Auditoria de qualidade diária (Método "5-5-5-5")',
        descricao: 'Amostragem de conversas de vendas, dietas e atendimentos do time.',
        frequenciaPadrao: 'semanal',
        ocorrenciasPorSemanaPadrao: 3,
        duracaoMinutosPadrao: 30,
      },
      {
        id: 'ges_casos_clinicos',
        dominioId: 'gestao',
        titulo: 'Revisão de casos clínicos complexos com a equipe',
        descricao: 'Discussão de condutas técnicas com estagiários ou nutricionistas juniores.',
        frequenciaPadrao: 'semanal',
        ocorrenciasPorSemanaPadrao: 1,
        duracaoMinutosPadrao: 45,
      },
    ],
  },
  {
    id: 'marketing',
    titulo: 'Marketing, Conteúdo & Comunidade',
    icone: '📢',
    corHex: '#ec4899', // pink
    descricao: 'Gravação em lote, Stories, comunidade de pacientes, desafios e eventos.',
    microAcoes: [
      {
        id: 'mkt_gravacao_lote',
        dominioId: 'marketing',
        titulo: 'Gravação em lote (Batching) de conteúdo',
        descricao: 'Reserva de bloco semanal para gravação sequencial de vídeos curtos.',
        frequenciaPadrao: 'semanal',
        ocorrenciasPorSemanaPadrao: 1,
        duracaoMinutosPadrao: 90,
      },
      {
        id: 'mkt_stories_diarios',
        dominioId: 'marketing',
        titulo: 'Interação de Stories diários',
        descricao: 'Publicação da rotina de treino, alimentação e estilo de vida.',
        frequenciaPadrao: 'diario',
        ocorrenciasPorSemanaPadrao: 5,
        duracaoMinutosPadrao: 20,
      },
      {
        id: 'mkt_moderacao_comunidade',
        dominioId: 'marketing',
        titulo: 'Moderação de Grupos de Comunidade (WhatsApp)',
        descricao: 'Orientações diárias e fomento de interações entre pacientes.',
        frequenciaPadrao: 'diario',
        ocorrenciasPorSemanaPadrao: 5,
        duracaoMinutosPadrao: 15,
      },
      {
        id: 'mkt_desafios_eventos',
        dominioId: 'marketing',
        titulo: 'Organização de Desafios Rápidos & Eventos',
        descricao: 'Acompanhamento de grupos de tiro curto e palestras de comunidade.',
        frequenciaPadrao: 'mensal',
        ocorrenciasPorSemanaPadrao: 1,
        duracaoMinutosPadrao: 60,
      },
    ],
  },
  {
    id: 'financeiro',
    titulo: 'Administração, Finanças & Tecnologia',
    icone: '💰',
    corHex: '#3b82f6', // blue
    descricao: 'Controle de caixa, faturamento, notas fiscais, contabilidade e software.',
    microAcoes: [
      {
        id: 'fin_controle_caixa',
        dominioId: 'financeiro',
        titulo: 'Controle financeiro e conciliação de caixa',
        descricao: 'Análise de fluxo de faturamento pessoal (CPF) vs. empresarial (CNPJ).',
        frequenciaPadrao: 'semanal',
        ocorrenciasPorSemanaPadrao: 1,
        duracaoMinutosPadrao: 45,
        eixoOrigem: 'Eixo 08',
      },
      {
        id: 'fin_burocracia_notas',
        dominioId: 'financeiro',
        titulo: 'Burocracia geral (Notas fiscais, boletos e contabilidade)',
        descricao: 'Emissão de notas fiscais, envio de boletos e acerto contábil.',
        frequenciaPadrao: 'semanal',
        ocorrenciasPorSemanaPadrao: 1,
        duracaoMinutosPadrao: 40,
        eixoOrigem: 'Eixo 08',
      },
      {
        id: 'fin_config_softwares',
        dominioId: 'financeiro',
        titulo: 'Configuração de softwares de nutrição e CRM',
        descricao: 'Manutenção do WebDiet, Notion e aplicativos integrados.',
        frequenciaPadrao: 'semanal',
        ocorrenciasPorSemanaPadrao: 1,
        duracaoMinutosPadrao: 30,
        eixoOrigem: 'Eixo 01',
      },
    ],
  },
  {
    id: 'autocuidado',
    titulo: 'Desenvolvimento Pessoal & Autocuidado',
    icone: '🧠',
    corHex: '#8b5cf6', // purple
    descricao: 'Estudo diário focado, leitura científica, treino/cardio e networking.',
    microAcoes: [
      {
        id: 'aut_estudo_focado',
        dominioId: 'autocuidado',
        titulo: 'Bloco de Estudo diário focado',
        descricao: 'Leitura de novos artigos científicos, livros de negócios e mentorias.',
        frequenciaPadrao: 'diario',
        ocorrenciasPorSemanaPadrao: 5,
        duracaoMinutosPadrao: 45,
      },
      {
        id: 'aut_networking',
        dominioId: 'autocuidado',
        titulo: 'Networking ativo & Visitas de parcerias',
        descricao: 'Visitas locais a academias e boxes para buscar novos parceiros.',
        frequenciaPadrao: 'semanal',
        ocorrenciasPorSemanaPadrao: 1,
        duracaoMinutosPadrao: 60,
      },
      {
        id: 'aut_autocuidado_treino',
        dominioId: 'autocuidado',
        titulo: 'Rituais de autocuidado pessoal (Treino/Cardio)',
        descricao: 'Bloqueio obrigatório de horários na agenda para treino e saúde.',
        frequenciaPadrao: 'diario',
        ocorrenciasPorSemanaPadrao: 5,
        duracaoMinutosPadrao: 60,
      },
    ],
  },
];
