// catalogo20Entregaveis.ts
// Catálogo Estruturado dos 20 Entregáveis Clínicos e Ritos de Retenção/CS para o Eixo 05.
// Organizado em 6 Etapas Racionais da Jornada do Paciente com suporte ao estado 'nao_faco_quero_fazer'.

export type ExecutorEntregavel = 'expert' | 'equipe' | 'sistema';
export type StatusOpcaoEntregavel = 'sim' | 'nao_faco_quero_fazer' | 'nao';

export interface EntregavelClinicoItem {
  id: string;
  titulo: string;
  descricao: string;
  etapaRacional: '1_onboarding' | '2_acompanhamento_diario' | '3_comunidade' | '4_ritos_cs' | '5_rede_multidisciplinar' | '6_renovacao_painel';
  frequenciaPadraoMensal: number;
  duracaoMinutosPadrao: number;
  executorDefault: ExecutorEntregavel;
  custoInsumoFisicoPadrao: number;
}

export interface RitoRetencaoItem {
  id: string;
  titulo: string;
  subtitulo: string;
  perguntaSimNao: string;
  insightDisruptivo: string;
  duracaoMinutosPadrao: number;
  frequenciaPadraoMensal: number;
  executorDefault: ExecutorEntregavel;
}

export const CATALOGO_20_ENTREGAVEIS: EntregavelClinicoItem[] = [
  // ── ETAPA 1: BOAS-VINDAS & ONBOARDING (A Primeira Impressão) ──
  {
    id: 'entreg_05_onboarding',
    titulo: '1. Onboarding Detalhado & Boas-Vindas Estruturadas',
    descricao: 'Envio de orientações, playbooks e regras de contato logo após a contratação para alinhar expectativas.',
    etapaRacional: '1_onboarding',
    frequenciaPadraoMensal: 1,
    duracaoMinutosPadrao: 15,
    executorDefault: 'equipe',
    custoInsumoFisicoPadrao: 2,
  },
  {
    id: 'entreg_06_app_digital',
    titulo: '2. Entrega de Cardápio Digital via App Próprio (WebDiet, etc.)',
    descricao: 'Disponibilização da dieta em aplicativo para facilitar compras e consultas rápidas.',
    etapaRacional: '1_onboarding',
    frequenciaPadraoMensal: 1,
    duracaoMinutosPadrao: 10,
    executorDefault: 'sistema',
    custoInsumoFisicoPadrao: 0,
  },
  {
    id: 'entreg_17_materiais_educativos',
    titulo: '3. Disponibilização de Materiais Educativos Complementares',
    descricao: 'Envio de e-books de receitas, listas de mercado personalizadas e guias de marcas confiáveis.',
    etapaRacional: '1_onboarding',
    frequenciaPadraoMensal: 1,
    duracaoMinutosPadrao: 5,
    executorDefault: 'sistema',
    custoInsumoFisicoPadrao: 2,
  },
  {
    id: 'entreg_19_brand_voice',
    titulo: '4. Playbooks de Voz de Marca Unificada (Brand Voice)',
    descricao: 'Alinhamento com o time técnico para garantir que o acolhimento siga o DNA do nutricionista principal.',
    etapaRacional: '1_onboarding',
    frequenciaPadraoMensal: 1,
    duracaoMinutosPadrao: 10,
    executorDefault: 'equipe',
    custoInsumoFisicoPadrao: 0,
  },

  // ── ETAPA 2: ACOMPANHAMENTO TÉCNICO DIÁRIO (A Entrega da Dieta & Suporte) ──
  {
    id: 'entreg_01_checkin',
    titulo: '5. Check-ins Estruturados Periódicos (Semanais/Quinzenais)',
    descricao: 'Formulários ou questionários onde o paciente relata peso, fotos e progresso para gerar compromisso.',
    etapaRacional: '2_acompanhamento_diario',
    frequenciaPadraoMensal: 2,
    duracaoMinutosPadrao: 15,
    executorDefault: 'expert',
    custoInsumoFisicoPadrao: 0,
  },
  {
    id: 'entreg_02_biofeedback',
    titulo: '6. Monitoramento Constante de Biomarcadores (Biofeedback)',
    descricao: 'Avaliação detalhada de sono, apetite, estresse e digestão para verificar a resposta ao plano.',
    etapaRacional: '2_acompanhamento_diario',
    frequenciaPadraoMensal: 2,
    duracaoMinutosPadrao: 10,
    executorDefault: 'expert',
    custoInsumoFisicoPadrao: 0,
  },
  {
    id: 'entreg_03_cardapio_flexivel',
    titulo: '7. Cardápios Flexíveis pelo Método de Equivalentes',
    descricao: 'Substituição da dieta rígida por opções intercambiáveis com o mesmo valor nutricional.',
    etapaRacional: '2_acompanhamento_diario',
    frequenciaPadraoMensal: 1,
    duracaoMinutosPadrao: 30,
    executorDefault: 'expert',
    custoInsumoFisicoPadrao: 0,
  },
  {
    id: 'entreg_04_suporte_whatsapp',
    titulo: '8. Suporte Diário Ativo via WhatsApp / Chat Integrado',
    descricao: 'Resolução rápida de dúvidas operacionais em horário comercial para garantir apoio contínuo.',
    etapaRacional: '2_acompanhamento_diario',
    frequenciaPadraoMensal: 4,
    duracaoMinutosPadrao: 10,
    executorDefault: 'equipe',
    custoInsumoFisicoPadrao: 0,
  },
  {
    id: 'entreg_07_ajustes_rapidos',
    titulo: '9. Ajustes e Atualizações de Planos em Tempo Recorde (< 24h)',
    descricao: 'Alterações rápidas na dieta em caso de imprevistos ou aversões do paciente.',
    etapaRacional: '2_acompanhamento_diario',
    frequenciaPadraoMensal: 1,
    duracaoMinutosPadrao: 15,
    executorDefault: 'equipe',
    custoInsumoFisicoPadrao: 0,
  },
  {
    id: 'entreg_08_tracker_habitos',
    titulo: '10. Rastreamento Diário de Hábitos Básicos',
    descricao: 'Metas explícitas de água, passos, horas de descanso e treinos semanais incorporadas ao app.',
    etapaRacional: '2_acompanhamento_diario',
    frequenciaPadraoMensal: 4,
    duracaoMinutosPadrao: 5,
    executorDefault: 'sistema',
    custoInsumoFisicoPadrao: 0,
  },
  {
    id: 'entreg_09_triagem_cientifica',
    titulo: '11. Questionários de Triagem Validados Cientificamente',
    descricao: 'Aplicação de ferramentas como a Escala de Sono de Pittsburg e sintomas metabólicos.',
    etapaRacional: '2_acompanhamento_diario',
    frequenciaPadraoMensal: 1,
    duracaoMinutosPadrao: 15,
    executorDefault: 'expert',
    custoInsumoFisicoPadrao: 0,
  },
  {
    id: 'entreg_14_exames_bioquimicos',
    titulo: '12. Análise de Exames Laboratoriais e Bioquímicos',
    descricao: 'Cruzamento detalhado de exames de sangue e saúde em consulta para individualização.',
    etapaRacional: '2_acompanhamento_diario',
    frequenciaPadraoMensal: 1,
    duracaoMinutosPadrao: 25,
    executorDefault: 'expert',
    custoInsumoFisicoPadrao: 0,
  },
  {
    id: 'entreg_15_suporte_nutrianjos',
    titulo: '13. Suporte Conduzido por Equipe Técnica Dedicada (Nutrianjos)',
    descricao: 'Presença de estagiários ou nutricionistas assistentes para agilizar as respostas diárias.',
    etapaRacional: '2_acompanhamento_diario',
    frequenciaPadraoMensal: 4,
    duracaoMinutosPadrao: 15,
    executorDefault: 'equipe',
    custoInsumoFisicoPadrao: 0,
  },
  {
    id: 'entreg_18_ajuste_rotina_real',
    titulo: '14. Ajuste Personalizado à Rotina Real e Individualização Técnica',
    descricao: 'Foco na dinâmica familiar e preferências individuais, rejeitando restrições severas.',
    etapaRacional: '2_acompanhamento_diario',
    frequenciaPadraoMensal: 1,
    duracaoMinutosPadrao: 20,
    executorDefault: 'expert',
    custoInsumoFisicoPadrao: 0,
  },

  // ── ETAPA 3: COMUNIDADE & EFEITO TRIBO ──
  {
    id: 'entreg_10_comunidade_tribo',
    titulo: '15. Comunidades Ativas e Grupos de Apoio no WhatsApp (Efeito Tribo)',
    descricao: 'Espaço coletivo onde pacientes compartilham pratos, treinos e se apoiam mutuamente.',
    etapaRacional: '3_comunidade',
    frequenciaPadraoMensal: 4,
    duracaoMinutosPadrao: 20,
    executorDefault: 'equipe',
    custoInsumoFisicoPadrao: 0,
  },
  {
    id: 'entreg_11_desafios_21dias',
    titulo: '16. Desafios Internos de Curto Prazo (21 Dias)',
    descricao: 'Campanhas coletivas voltadas para a constância de hábitos simples na comunidade.',
    etapaRacional: '3_comunidade',
    frequenciaPadraoMensal: 1,
    duracaoMinutosPadrao: 30,
    executorDefault: 'equipe',
    custoInsumoFisicoPadrao: 0,
  },

  // ── ETAPA 6: RITOS DE RENOVAÇÃO & PAINEL CONSOLIDADO ──
  {
    id: 'entreg_13_pesquisa_nps',
    titulo: '17. Aplicação Periódica e Estratégica do NPS (Net Promoter Score)',
    descricao: 'Pesquisas rápidas de satisfação do paciente para mapear oportunidades de melhoria.',
    etapaRacional: '6_renovacao_painel',
    frequenciaPadraoMensal: 1,
    duracaoMinutosPadrao: 5,
    executorDefault: 'sistema',
    custoInsumoFisicoPadrao: 0,
  },
  {
    id: 'entreg_16_dossie_evolucao',
    titulo: '18. Relatórios ou Dossiês Mensais de Evolução Qualitativa',
    descricao: 'Entrega ao paciente de um compilado visual detalhado com avanços de saúde (sono, disposição, fotos).',
    etapaRacional: '6_renovacao_painel',
    frequenciaPadraoMensal: 1,
    duracaoMinutosPadrao: 20,
    executorDefault: 'equipe',
    custoInsumoFisicoPadrao: 5,
  },
  {
    id: 'entreg_20_renovacao_consultiva',
    titulo: '19. Ritos de Renovação Consultiva de Contrato',
    descricao: 'Contatos estruturados ao fim do contrato para redefinir objetivos e dar continuidade ao acompanhamento.',
    etapaRacional: '6_renovacao_painel',
    frequenciaPadraoMensal: 1,
    duracaoMinutosPadrao: 30,
    executorDefault: 'expert',
    custoInsumoFisicoPadrao: 0,
  },
];

export const CATALOGO_RITOS_RETENCAO_CS: RitoRetencaoItem[] = [
  {
    id: 'rito_busca_ativa',
    titulo: '20. Rito da Busca Ativa de Pacientes Sumidos (Mensagem Acolhedora pós-5 Dias)',
    subtitulo: 'Sua equipe contata ativamente o paciente quando ele fica 5 dias sem responder ou enviar check-in?',
    perguntaSimNao: 'Você pratica a Busca Ativa de Pacientes Sumidos?',
    insightDisruptivo: 'Evita a evasão silenciosa. O paciente sente-se cuidado e não esquecido.',
    duracaoMinutosPadrao: 10,
    frequenciaPadraoMensal: 2,
    executorDefault: 'equipe',
  },
  {
    id: 'rito_ultima_figurinha',
    titulo: 'Regra Inegociável da Última Figurinha no WhatsApp',
    subtitulo: 'O paciente nunca encerra a conversa. O suporte sempre responde por último com carinho/figurinha da clínica?',
    perguntaSimNao: 'Você aplica a Regra da Última Figurinha?',
    insightDisruptivo: 'Consolida um senso inquebrável de acolhimento obsessivo e atenção aos detalhes.',
    duracaoMinutosPadrao: 3,
    frequenciaPadraoMensal: 8,
    executorDefault: 'equipe',
  },
  {
    id: 'rito_cs_telefone',
    titulo: 'Atendimento de CS por Telefone para Reverter Cancelamentos (Churn)',
    subtitulo: 'Caso o paciente solicite cancelamento, um profissional de CS liga pessoalmente para realinhar expectativas?',
    perguntaSimNao: 'Você realiza o Resgate Telefônico de CS?',
    insightDisruptivo: 'Estudos de caso reais mostram reversão de até 85% dos pedidos de cancelamento em ligações de 1h.',
    duracaoMinutosPadrao: 45,
    frequenciaPadraoMensal: 1,
    executorDefault: 'equipe',
  },
  {
    id: 'rito_metas_extranutricionais',
    titulo: 'Monitoramento de Metas Extra-Nutricionais (Estilo de Vida)',
    subtitulo: 'Você acompanha metas pessoais do paciente (estudos, descanso, tempo com os filhos) no check-in?',
    perguntaSimNao: 'Você acompanha Metas Extra-Nutricionais?',
    insightDisruptivo: 'Transforma o nutricionista em um mentor de estilo de vida completo, criando vínculo inquebrável.',
    duracaoMinutosPadrao: 10,
    frequenciaPadraoMensal: 2,
    executorDefault: 'expert',
  },
];
