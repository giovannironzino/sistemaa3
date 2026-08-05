export type UserRole = 'nutri' | 'consultor';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  linkedConsultorId?: string;
  status: 'active' | 'inactive';
}

export interface ClientProfile {
  clientId: string;
  clientName: string;
  clientEmail: string;
  status: 'active' | 'inactive';
  linkedConsultorId: string;
  fase: 1 | 2; // Phase 1: Planning, Phase 2: Execution
  currentStep: 'retrato' | 'call1' | 'caminho' | 'call2' | 'plano' | 'call3' | 'execucao';
  call1CompletedAt: string | null;
  call2CompletedAt: string | null;
  call3CompletedAt: string | null;
  cenarioEscolhidoId: string | null;
  createdAt: string;
}

// Block 1 Types
export interface Block1Data {
  demand: Record<string, number>; // clusterKey -> count N
  clusterPromessas: Record<string, string>; // clusterKey -> promessa selected
  keepFocus?: 'Sim' | 'Não' | ''; // Tela 3
  newTargetPublic?: string; // Tela 4
  finalTargetPublic?: string; // Público_Alvo_Final
  finalPromessa?: string; // Promessa_do_Público_Alvo_Final
  methodPilar?: string; // Tela 5
  // Legacy / optional fields for backward compatibility
  ranking?: string[];
  decidingFactor?: string;
  mainPain?: string;
  keyPromise?: string;
  philosophy?: string;
  diferencial?: string;
  successRate?: number;
  customWork?: string;
  energyFocus?: string;
  primaryTool?: string;
  commonComplaint?: string;
  stepByStep?: string;
}

// Block 2 Types (Captação)
export interface LeadRecord {
  id: string;
  date: string; // YYYY-MM-DD ou DD/MM/AAAA
  name: string; // [Nome_Pessoa]
  cluster: string; // Cluster do Eixo 1
  closed: boolean; // true = Paciente Ativo (SIM), false = Lead (NÃO)
  channel: string; // Canal de Origem
  referrerPatientName?: string; // Nome do paciente que indicou
  unknownPatientReferrer?: boolean;
  referrerPartnerName?: string; // Nome do parceiro que indicou
  unknownPartnerReferrer?: boolean;
  createdAt: string;
}

export interface Block2Data {
  leads: LeadRecord[];
  // Campos legado para compatibilidade
  channels?: string[];
  channelInquiries?: Record<string, number>;
  channelConversions?: Record<string, number>;
  marketingFrequency?: number;
  marketingDuration?: number;
  usesSchedulingApp?: 'Sim' | 'Não' | 'Não sei';
  schedulingAppName?: string;
}

// Block 3 Types (Vendas)
export interface Block3Data {
  gargaloDistribution: Record<string, number>;
  objecaoDistribution: Record<string, number>;
  atendimentoSteps: string[];
  doesFollowUp: string;
  followUpAttemptsChoice?: string;
  followUpIntervalChoice?: string;
  followUpContentChoice?: string[];
  // Campos legado para compatibilidade
  followsScript?: 'Sim' | 'Não' | 'Não sei';
  closingChannel?: 'mensagem' | 'chamada' | 'ambos';
  usesCRM?: 'Sim' | 'Não' | 'Não sei';
  crmName?: string;
  closer?: 'Eu mesmo(a)' | 'Outra pessoa da equipe';
  closerName?: string;
  followUpDays?: number;
  followUpAttempts?: number;
  averageClosingTime?: number | null;
  averageClosingTimeNotKnown?: boolean;
  lostReasons?: string[];
}

// Block 4 Types (Serviços & Modelagem — Eixo 04)
export interface ServiceData {
  id: string;
  name: string;
  // Tela 1.1
  formatoComercial: 'Consulta Pontual / Avulsa' | 'Programa de Acompanhamento' | 'Atendimento 100% Assíncrono / Sem Vídeo' | 'Comunidade / Grupo de Aceleração' | 'Mentoria / High-Ticket Multidisciplinar' | '';
  // Tela 1.2
  price: number;
  formasPagamento: string[];
  parcelamentoMaximo: string;
  // Tela 1.3
  modalidade: 'Presencial' | 'Online' | 'Híbrido' | '';
  duracaoContrato: 'Pontual (1 dia)' | '30 dias' | '90 dias (Trimestral)' | '180 dias (Semestral)' | '360 dias (Anual)' | '';
  activePatients: number;
  vendasUltimos90Dias: number;
  // Legacy compatibility
  type?: 'consulta' | 'pacote' | 'plano';
  format?: 'Presencial' | 'Online' | 'Híbrido';
  paymentMethods?: string[];
  installments?: Record<string, number>;
  targetAudience?: string[];
  customTargetAudience?: string;
  deliveryTime?: 'Durante' | 'Depois' | 'Depende';
  includesConsultation?: 'Com consulta' | 'Sem consulta';
}

export interface Block4Data {
  services: ServiceData[];
  quantidadeFormatos: string; // Tela de Abertura
  carroChefeId: string;       // Tela 2
  estrategiaRenovacao: string; // Tela 3
}

// Block 5 Types (Entrega & Rotina — Eixo 05)
export interface ItemState {
  included: 'Sim' | 'Não' | 'Não sei';
  responsible: 'Eu mesmo(a)' | 'Equipe' | '';
  duration: number; // minutes
  times?: number;
  everyDays?: number;
  avgAdjustments?: number;
  frequencyType?: 'Fixa' | 'Em fases';
  frequencyValue?: string;
  supportTypes?: string[];
  supportCustom?: 'Personalizado' | 'Padrão';
  supportCount?: number;
  supportPrepTime?: number;
  supportPrepTimeNotKnown?: boolean;
}

export interface CustomDelivery {
  id: string;
  name: string;
  type: 'único' | 'sob demanda' | 'recorrente';
  responsible: 'Eu mesmo(a)' | 'Equipe';
  duration: number;
  cadence: string;
}

export interface Block5Data {
  // Tela 1 — Entregáveis
  entregaveis: string[];
  // Tela 2 — Frequência de Atualização
  frequenciaEntrega: string;
  // Tela 3 — Nível de Customização
  nivelCustomizacao: string;
  // Tela 4 — Produção
  responsavelProducao: string;
  tempoProducao: string;
  // Tela 5 — Envio
  responsavelEnvio: string;
  prazoEnvio: string;
  // Tela 6 — SLA Suporte
  slaResposta: string;
  // Tela 7 — CS / Geladeira
  estrategiaInatividade: string;
  // Tela 8 — Encantamento
  elementosEncantamento: string[];
  // Legacy fields for compatibility
  kitBoasVindas?: ItemState;
  consultaInicial?: ItemState;
  avaliacaoFisica?: ItemState;
  revisaoExames?: ItemState;
  ajustePlano?: ItemState;
  materiaisApoio?: ItemState;
  consultaAcompanhamento?: ItemState;
  relatorioEvolucao?: ItemState;
  checkIn?: ItemState;
  contatoProativo?: ItemState;
  mudancaSuplementacao?: ItemState;
  planoAlimentarInicial?: ItemState;
  terminationProcess?: 'Sim' | 'Mais ou menos' | 'Não';
  customDeliveries?: CustomDelivery[];
}

// Block 6 Types (Agenda, Capacidade & Tempo — Eixo 06)
export interface CommitmentBlock {
  enabled: boolean;
  name?: string;      // Para tipos personalizados
  minutos: number;
  vezesSemana: number;
  sabado?: boolean;   // Só para Descanso Total
  domingo?: boolean;
}

export interface Block6Data {
  // Tela 1 — Disponibilidade semanal em horas
  horasPorDia: Record<string, number>; // { 'Segunda': 8, 'Terça': 8, ... }
  // Tela 2 — 5 drenos a eliminar
  drenos: string[]; // 5 itens de texto livre
  // Tela 3 — Blocos pessoais inegóaciáveis
  blocosPessoais: {
    treino: CommitmentBlock;
    familia: CommitmentBlock;
    estudo: CommitmentBlock;
    descanso: CommitmentBlock;
    outro: CommitmentBlock;
  };
  // Tela 4 — Blocos de gestão
  blocosGestao: {
    checkins: CommitmentBlock;
    reuniaoEquipe: CommitmentBlock;
    gravacaoConteudo: CommitmentBlock;
    producaoMidia: CommitmentBlock;
    analiseFinanceira: CommitmentBlock;
    outro: CommitmentBlock;
  };
  // Tela 5 — Blocos de vendas
  blocosVendas: {
    socialSelling: CommitmentBlock;
    relacionamentoParceiros: CommitmentBlock;
    reativacaoPacientes: CommitmentBlock;
    followUpLeads: CommitmentBlock;
    outro: CommitmentBlock;
  };
  // Tela 6 — Daily
  daily: 'Sim' | 'Não' | '';
  // Legacy fields
  daysOpen?: string[];
  shifts?: Record<string, string[]>;
  times?: Record<string, { start: string; end: string }>;
  hasRecurringCommitments?: 'Sim' | 'Não';
  commitments?: Commitment[];
}

export interface Commitment {
  id: string;
  name: string;
  day: string;
  startTime: string;
  endTime: string;
}

// Block 7 Types
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  cost: number;
}

// Block 7 Types (Equipe & Delegação — Eixo 07)
export interface Block7Data {
  possuiEquipe: 'Sim' | 'Não' | '';
  // Caminho A (Solo)
  a1Sobrecarga: string;
  a2Gargalo: string;
  a3Prontidao: string;
  // Caminho B (Gestor)
  b1Departamentos: {
    recepcao: { enabled: boolean; custoMensal: number };
    entregaTecnica: { enabled: boolean; custoMensal: number };
    sucessoCliente: { enabled: boolean; custoMensal: number };
    comercial: { enabled: boolean; custoMensal: number };
    marketing: { enabled: boolean; custoMensal: number };
  };
  b2Processos: string;
  b3Auditoria: string;
  b4Incentivos: string[];
  
  // Legacy
  members?: TeamMember[];
}

// Block 8 Types
export interface FixedCostItem {
  status: 'Sim' | 'Não' | 'Não sei';
  type: 'Valor Exato' | 'Faixa' | 'Não sei';
  value: number;
}

export interface Block8Data {
  // Tela 1 — Gestão Contábil
  gestaoCaixa?: 'Mistura Total (CPF / Amador)' | 'Conta PJ Separada (Sem Pró-Labore Fixo)' | 'Gestão Empresarial (Pró-Labore Fixo + Caixa PJ)' | '';

  // Tela 2 — Entrada Real de Caixa nos Últimos 3 Meses
  faturamentoM2: number;
  faturamentoM1: number;
  faturamentoAtual: number;

  // Tela 3.1 — Estrutura Física & Instalações
  possuiEstruturaFisica?: 'Sim' | 'Não' | '';
  estruturaFisica?: {
    aluguel: number;
    condominioIptu: number;
    energiaAgua: number;
    internetTelefone: number;
    limpezaManutencao: number;
    outroNome: string;
    outroValor: number;
  };

  // Tela 3.2 — Tecnologia, Softwares & Assinaturas
  possuiTecnologia?: 'Sim' | 'Não' | '';
  tecnologiaSoftwares?: Record<string, number>;
  outroTech1Nome?: string;
  outroTech1Valor?: number;
  outroTech2Nome?: string;
  outroTech2Valor?: number;

  // Tela 3.3 — Serviços Profissionais Fixos
  possuiServicosProfissionais?: 'Sim' | 'Não' | '';
  servicosProfissionais?: {
    contabilidade: number;
    juridico: number;
    taxasAlvaraCrn: number;
    outroNome: string;
    outroValor: number;
  };

  // Tela 4.1 — Regime de Tributação
  regimeTributario?: string;
  aliquotaImpostoOutro?: number;

  // Tela 4.2 — Taxas dos Meios de Pagamento
  tipoTaxaMeiosPagamento?: 'Sei a taxa exata dos meus Meios de Pagamento' | 'Não tenho esse dado exato' | '';
  taxaMeiosPagamento?: number;

  // Tela 4.3 — Adiantamento de Recebíveis
  antecipaCartao?: 'NÃO antecipo' | 'SIM, antecipo minhas vendas' | '';
  tipoTaxaAntecipacao?: 'Sei a taxa exata' | 'Não tenho esse dado exato' | '';
  taxaAntecipacao?: number;

  // Tela 4.4 — Comissionamento de Vendas
  pagaComissao?: 'Sim' | 'Não' | '';
  tipoComissao?: 'Porcentagem' | 'Valor Fixo' | '';
  comissaoPorcentagem?: number;
  comissaoFixaReais?: number;

  // Tela 5 — Custos Variáveis de Entrega por Paciente
  possuiKitsMimos?: 'Sim' | 'Não' | '';
  custoKitsMimos?: number;
  custoFretePaciente?: number;

  possuiRemuneracaoTecnica?: 'Sim' | 'Não' | '';
  custoRemuneracaoTecnica?: number;

  // Tela 6 — Investimentos em Mídia, Anúncios e Eventos
  tipoInvestimentoTrafego?: 'Valor médio mensal investido' | 'Tive gasto, mas não sei quanto foi' | 'Não invisto em tráfego pago' | '';
  investimentoTrafegoMensal?: number;

  tipoInvestimentoEventos?: 'SIM' | 'Tive gasto, mas não sei quanto foi' | 'NÃO tive gastos com eventos' | '';
  gastosEventos?: {
    locacaoEspaco: number;
    alimentacaoBrindes: number;
    fotografoVideomaker: number;
  };

  // Tela 7.1 — Histórico de 12 Meses
  possuiHistorico12Meses?: 'Sim' | 'Não' | '';
  historico12Meses?: Record<string, number>;

  // Tela 7.2 — Fundo de Reserva
  fundoReservaStatus?: string;

  // Legacy fields for backward compatibility
  fixedCosts?: Record<string, FixedCostItem>;
  loanStatus?: 'Sim' | 'Não' | 'Não sei';
  loanInstallment?: number;
  debtStatus?: 'Sim' | 'Não' | 'Não sei';
  debtValue?: number;
}

// Block 9 Types (Eixo 09 — Metas, Número Mágico e Mesa de Controle Viva)
export interface Block9Data {
  // Passo 0
  numeroMagico?: number;
  tetoSemanaPerfeita?: number;
  passo0Concluido?: boolean;

  // Controle 1 — Reajuste do Preço Médio (Novos Pacientes)
  reajusteNovosPct?: number; // 0 a 100%

  // Controle 2 — Reajuste de Pacientes Antigos & Trava Churn
  reajusteAntigosPct?: number; // 0 a 50%
  taxaPerdaPct?: number; // 0 a 30% (default 15%)

  // Controle 3 — Volume de Novas Vendas
  novosPacientesSimulados?: number;
  travaPrecoControle3?: boolean;
  precoRealProdutoControle3?: number;

  // Controle 4 — Retenção e Planos Longos (LTV)
  migracaoPlanosLongosPct?: number; // 0 a 80%
  travaPrecoControle4?: boolean;
  precoRealProdutoControle4?: number;
  duracaoDiasControle4?: number; // 180 ou 360

  // Controle 5 — Produtos de Transição (Down-sell e Cross-sell)
  adesaoDownsellPct?: number; // 0 a 100%
  adesaoCrosssellPct?: number; // 0 a 100%

  // Legacy compatibility
  faturamento90?: number;
  faturamentoM1?: number;
  faturamentoM2?: number;
  faturamentoM3?: number;
  pacientesAtivos?: number;
  horasLivres?: number;
}

// All Blocks container
export interface ClientBlocks {
  b1: Block1Data;
  b2: Block2Data;
  b3: Block3Data;
  b4: Block4Data;
  b5: Block5Data;
  b6: Block6Data;
  b7: Block7Data;
  b8: Block8Data;
  b9: Block9Data;
}

// Simulation Scenario (Block 4/Caminho)
export interface Scenario {
  id: string;
  name: string;
  isReal: boolean; // Is it the actual real scenario calculated from Retrato?
  faturamentoMeta: number;
  services: {
    serviceId: string;
    name: string;
    price: number;
    activePatients: number;
    durationDays?: number;
  }[];
  // calculated metrics
  pontoEquilibrio: number;
  capacidadeMinutosDisponivel: number;
  capacidadeMinutosNecessaria: number;
  capacidadePercentual: number;
  distanciaMeta: number;
  createdAt: string;
}

// Action for 12 weeks plan
export interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
  originBlock: string; // which block triggered this (e.g. "Captação", "Vendas", "Serviços", "Financeiro", etc.)
}

export interface WeekPlan {
  weekIndex: number; // 0 to 11 (Week 1 to 12)
  actions: ActionItem[];
  published: boolean;
}

export interface MonthlyRitual {
  id: string; // e.g. "mês-1"
  monthName: string;
  faturamentoReal: number;
  pacientesAtivosReal: number;
  faturamentoMeta: number;
  pacientesAtivosMeta: number;
  completedAt: string;
}

// Full client record in Firestore
export type QuestionType =
  | 'Texto curto'
  | 'Área de texto'
  | 'Escolha única'
  | 'Múltipla escolha'
  | 'Slider (0–10)'
  | 'Moeda (R$)'
  | 'Tags'
  | 'Ranking'
  | 'Moeda Multi'
  | 'Número Multi'
  | 'Número com Não sei'
  | 'Canais'
  | 'Entregas'
  | 'Agenda'
  | 'Repetidor Serviços'
  | 'Repetidor Compromissos'
  | 'Contador Numérico Multi'
  | 'Escolha única por Público';

export interface QuestionSchema {
  id: string | number;
  text: string;
  type: QuestionType;
  options: string[];
  key?: string; // Mapeamento com chave do bloco
}

export interface EixoSchema {
  id: number;
  label: string;
  questions: QuestionSchema[];
}

export interface CallAgendaItem {
  id: string;
  text: string;
  done: boolean;
}

export interface CallRecord {
  id: string;
  title: string;
  date: string;
  transcript: string;
  agenda: CallAgendaItem[];
}

export interface ActivityLog {
  id: string;
  text: string;
  date: string;
}

export interface ClientRecord {
  profile: ClientProfile;
  blocks: ClientBlocks;
  comments: Record<string, string>; // questionKey -> comment
  scenarios: Record<string, Scenario>;
  weekPlans: Record<string, WeekPlan>; // weekIndex string key -> WeekPlan
  monthlyRituals: MonthlyRitual[];
  calls?: Record<string, CallRecord>;
  activityLog?: ActivityLog[];
}

// ---------------------------------------------------------------------------
// Fase 01 — Promessa & Método (re-export from feature module)
// ---------------------------------------------------------------------------
export type {
  ClusterId as Fase01ClusterId,
  VolumePorCluster,
  PromessaPorCluster,
  Fase01State,
  MetodoId,
} from './features/fase01/fase01.types';

// ---------------------------------------------------------------------------
// Fase 03 — Vendas (re-export from feature module)
// ---------------------------------------------------------------------------
export type {
  MomentoPerdaId as Fase03MomentoPerdaId,
  JustificativaId as Fase03JustificativaId,
  EtapaAtendimentoId as Fase03EtapaAtendimentoId,
  ConteudoRecontatoId as Fase03ConteudoRecontatoId,
  AtitudeFollowUp as Fase03AtitudeFollowUp,
  QuantidadeTentativas as Fase03QuantidadeTentativas,
  IntervaloPrimeiroRecontato as Fase03IntervaloPrimeiroRecontato,
  DistribuicaoGargalo,
  DistribuicaoObjecao,
  Fase03State,
  ResumoComercial,
} from './features/fase03/fase03.types';

// ---------------------------------------------------------------------------
// Fase 09 — Metas & Simulação (re-export from feature module)
// ---------------------------------------------------------------------------
export type {
  FormaRecebimentoId,
  TipoApoioId,
  EscolhaCaminhoId,
  PresetDistribuicaoId,
  Fase09Assumptions,
  DistribuicaoServico,
  OfertaEcossistema,
  SimuladorState,
  ResultadoSimulado,
  ResumoSimulacaoEixo09,
} from './features/fase09/eixo09.types';
