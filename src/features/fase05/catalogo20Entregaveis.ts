// catalogo20Entregaveis.ts
// Catálogo Estruturado dos 20 Entregáveis Clínicos e Ritos de Retenção/CS para o Eixo 05.
// Suporta vínculo com produtos do Eixo 04, executores, frequência e perguntas SIM/NÃO.

export type ExecutorEntregavel = 'expert' | 'equipe' | 'sistema';

export interface EntregavelClinicoItem {
  id: string;
  titulo: string;
  descricao: string;
  categoria: 'acompanhamento' | 'onboarding' | 'comunidade' | 'suporte' | 'relatorios' | 'renovacao';
  frequenciaPadraoMensal: number; // Ex: 4x por mês
  duracaoMinutosPadrao: number; // Ex: 15 minutos
  executorDefault: ExecutorEntregavel;
  custoInsumoFisicoPadrao: number; // Ex: R$ 5,00 (mimos/relatório impresso)
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
  {
    id: 'entreg_01_checkin',
    titulo: '1. Check-ins Estruturados Periódicos (Semanais/Quinzenais)',
    descricao: 'Formulários ou questionários onde o paciente relata peso, fotos e progresso para gerar prestação de contas.',
    categoria: 'acompanhamento',
    frequenciaPadraoMensal: 2,
    duracaoMinutosPadrao: 15,
    executorDefault: 'expert',
    custoInsumoFisicoPadrao: 0,
  },
  {
    id: 'entreg_02_biofeedback',
    titulo: '2. Monitoramento Constante de Biomarcadores (Biofeedback)',
    descricao: 'Avaliação detalhada de sono, apetite, estresse e digestão para verificar resposta ao plano.',
    categoria: 'acompanhamento',
    frequenciaPadraoMensal: 2,
    duracaoMinutosPadrao: 10,
    executorDefault: 'expert',
    custoInsumoFisicoPadrao: 0,
  },
  {
    id: 'entreg_03_cardapio_flexivel',
    titulo: '3. Cardápios Flexíveis pelo Método de Equivalentes',
    descricao: 'Substituição da dieta rígida por opções intercambiáveis com o mesmo valor nutricional.',
    categoria: 'acompanhamento',
    frequenciaPadraoMensal: 1,
    duracaoMinutosPadrao: 30,
    executorDefault: 'expert',
    custoInsumoFisicoPadrao: 0,
  },
  {
    id: 'entreg_04_suporte_whatsapp',
    titulo: '4. Suporte Diário Ativo via WhatsApp / Chat Integrado',
    descricao: 'Resolução rápida de dúvidas operacionais em horário comercial para apoio contínuo.',
    categoria: 'suporte',
    frequenciaPadraoMensal: 4,
    duracaoMinutosPadrao: 10,
    executorDefault: 'equipe',
    custoInsumoFisicoPadrao: 0,
  },
  {
    id: 'entreg_05_onboarding',
    titulo: '5. Onboarding Detalhado & Boas-Vindas Estruturadas',
    descricao: 'Envio de orientações, playbooks e regras de contato logo após a contratação.',
    categoria: 'onboarding',
    frequenciaPadraoMensal: 1,
    duracaoMinutosPadrao: 15,
    executorDefault: 'equipe',
    custoInsumoFisicoPadrao: 2,
  },
  {
    id: 'entreg_06_app_digital',
    titulo: '6. Entrega de Cardápio Digital via App Próprio (WebDiet, etc.)',
    descricao: 'Disponibilização da dieta em aplicativo para facilitador de compras e consultas.',
    categoria: 'onboarding',
    frequenciaPadraoMensal: 1,
    duracaoMinutosPadrao: 10,
    executorDefault: 'sistema',
    custoInsumoFisicoPadrao: 0,
  },
  {
    id: 'entreg_07_ajustes_rapidos',
    titulo: '7. Ajustes e Atualizações de Planos em Tempo Recorde (< 24h)',
    descricao: 'Alterações rápidas na dieta em caso de desconforto ou imprevistos de rotina.',
    categoria: 'suporte',
    frequenciaPadraoMensal: 1,
    duracaoMinutosPadrao: 15,
    executorDefault: 'equipe',
    custoInsumoFisicoPadrao: 0,
  },
  {
    id: 'entreg_08_tracker_habitos',
    titulo: '8. Rastreamento Diário de Hábitos Básicos',
    descricao: 'Metas explícitas de água, passos, horas de descanso e treinos semanais no acompanhamento.',
    categoria: 'acompanhamento',
    frequenciaPadraoMensal: 4,
    duracaoMinutosPadrao: 5,
    executorDefault: 'sistema',
    custoInsumoFisicoPadrao: 0,
  },
  {
    id: 'entreg_09_triagem_cientifica',
    titulo: '9. Questionários de Triagem Validados Cientificamente',
    descricao: 'Aplicação de ferramentas como a Escala de Sono de Pittsburg e rastreamento de sintomas.',
    categoria: 'acompanhamento',
    frequenciaPadraoMensal: 1,
    duracaoMinutosPadrao: 15,
    executorDefault: 'expert',
    custoInsumoFisicoPadrao: 0,
  },
  {
    id: 'entreg_10_comunidade_tribo',
    titulo: '10. Comunidades Ativas e Grupos de Apoio no WhatsApp (Efeito Tribo)',
    descricao: 'Espaço coletivo onde pacientes compartilham pratos, treinos e se apoiam mutuamente.',
    categoria: 'comunidade',
    frequenciaPadraoMensal: 4,
    duracaoMinutosPadrao: 20,
    executorDefault: 'equipe',
    custoInsumoFisicoPadrao: 0,
  },
  {
    id: 'entreg_11_desafios_21dias',
    titulo: '11. Desafios Internos de Curto Prazo (21 Dias)',
    descricao: 'Campanhas coletivas voltadas para constância de hábitos simples na comunidade.',
    categoria: 'comunidade',
    frequenciaPadraoMensal: 1,
    duracaoMinutosPadrao: 30,
    executorDefault: 'equipe',
    custoInsumoFisicoPadrao: 0,
  },
  {
    id: 'entreg_12_busca_ativa',
    titulo: '12. Busca Ativa de Pacientes Sumidos',
    descricao: 'Abordagem intencional e acolhedora quando o paciente atrasa o check-in ou para de responder.',
    categoria: 'suporte',
    frequenciaPadraoMensal: 1,
    duracaoMinutosPadrao: 10,
    executorDefault: 'equipe',
    custoInsumoFisicoPadrao: 0,
  },
  {
    id: 'entreg_13_pesquisa_nps',
    titulo: '13. Aplicação Periódica e Estratégica do NPS (Net Promoter Score)',
    descricao: 'Pesquisas rápidas de satisfação para mapear oportunidades de melhoria no serviço.',
    categoria: 'relatorios',
    frequenciaPadraoMensal: 1,
    duracaoMinutosPadrao: 5,
    executorDefault: 'sistema',
    custoInsumoFisicoPadrao: 0,
  },
  {
    id: 'entreg_14_exames_bioquimicos',
    titulo: '14. Análise de Exames Laboratoriais e Bioquímicos',
    descricao: 'Cruzamento detalhado de exames de sangue e saúde em consulta para individualização.',
    categoria: 'acompanhamento',
    frequenciaPadraoMensal: 1,
    duracaoMinutosPadrao: 25,
    executorDefault: 'expert',
    custoInsumoFisicoPadrao: 0,
  },
  {
    id: 'entreg_15_suporte_nutrianjos',
    titulo: '15. Suporte Conduzido por Equipe Técnica Dedicada (Nutrianjos)',
    descricao: 'Presença de estagiários ou nutricionistas assistentes para agilizar as respostas diárias.',
    categoria: 'suporte',
    frequenciaPadraoMensal: 4,
    duracaoMinutosPadrao: 15,
    executorDefault: 'equipe',
    custoInsumoFisicoPadrao: 0,
  },
  {
    id: 'entreg_16_dossie_evolucao',
    titulo: '16. Relatórios ou Dossiês Mensais de Evolução Qualitativa',
    descricao: 'Entrega ao paciente de um compilado visual detalhado de avanços de saúde (sono, disposição, fotos).',
    categoria: 'relatorios',
    frequenciaPadraoMensal: 1,
    duracaoMinutosPadrao: 20,
    executorDefault: 'equipe',
    custoInsumoFisicoPadrao: 5,
  },
  {
    id: 'entreg_17_materiais_educativos',
    titulo: '17. Disponibilização de Materiais Educativos Complementares',
    descricao: 'E-books de receitas, listas de mercado personalizadas e guias de marcas confiáveis.',
    categoria: 'onboarding',
    frequenciaPadraoMensal: 1,
    duracaoMinutosPadrao: 5,
    executorDefault: 'sistema',
    custoInsumoFisicoPadrao: 2,
  },
  {
    id: 'entreg_18_ajuste_rotina_real',
    titulo: '18. Ajuste Personalizado à Rotina Real e Individualização Técnica',
    descricao: 'Foco na dinâmica familiar e preferências individuais, rejeitando restrições severas.',
    categoria: 'acompanhamento',
    frequenciaPadraoMensal: 1,
    duracaoMinutosPadrao: 20,
    executorDefault: 'expert',
    custoInsumoFisicoPadrao: 0,
  },
  {
    id: 'entreg_19_brand_voice',
    titulo: '19. Playbooks de Voz de Marca Unificada (Brand Voice)',
    descricao: 'Alinhamento com o time técnico para garantir o mesmo padrão de acolhimento em todos os contatos.',
    categoria: 'onboarding',
    frequenciaPadraoMensal: 1,
    duracaoMinutosPadrao: 10,
    executorDefault: 'equipe',
    custoInsumoFisicoPadrao: 0,
  },
  {
    id: 'entreg_20_renovacao_consultiva',
    titulo: '20. Ritos de Renovação Consultiva de Contrato',
    descricao: 'Contatos estruturados ao fim do contrato para redefinir objetivos e dar continuidade ao acompanhamento.',
    categoria: 'renovacao',
    frequenciaPadraoMensal: 1,
    duracaoMinutosPadrao: 30,
    executorDefault: 'expert',
    custoInsumoFisicoPadrao: 0,
  },
];

export const CATALOGO_RITOS_RETENCAO_CS: RitoRetencaoItem[] = [
  {
    id: 'rito_busca_ativa',
    titulo: 'Rito da Busca Ativa (Mensagem Acolhedora pós-5 Dias)',
    subtitulo: 'Sua equipe contata ativamente o paciente quando ele fica 5 dias sem responder ou enviar check-in?',
    perguntaSimNao: 'Você pratica o Rito da Busca Ativa?',
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
