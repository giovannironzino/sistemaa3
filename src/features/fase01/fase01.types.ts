// fase01.types.ts

export type ClusterId =
  | 'estetica_emagrecimento'
  | 'saude_clinica'
  | 'comportamento_alimentar'
  | 'esporte_performance'
  | 'fases_da_vida'
  | 'restricoes_estilo_vida';

export interface VolumePorCluster {
  clusterId: ClusterId;
  quantidadePessoas: number; // inteiro, >= 0
  ticketMedioEstimado?: number; // valor em R$ estimado para este cluster
}

export interface PromessaPorCluster {
  clusterId: ClusterId;
  promessaSelecionada: string;
}

export interface PacienteMapeadoEixo01 {
  id: string;
  nome: string;
  dorId: ClusterId;
  pilarForte: string; // Fator Prioritário 🥇 (Lógica interna: 80%)
  elementoDiferencial: string; // Fator Decisivo 🥈 (Lógica interna: 20%)
  ticketPagoEstimado?: number; // Valor pago ou ticket estimado
  mesAtendimento?: 'mesM2' | 'mesM1' | 'mesM0'; // mês de atendimento nos últimos 90 dias
  createdAt?: string;
}

export interface Fase01State {
  nomeConsultorio?: string;
  softwareCrmUtilizado?: string;
  totalPacientesAtivosVigentes?: number; // Total real de pacientes ativos no consultório
  volumes: VolumePorCluster[];           // 6 itens (um por cluster)
  clustersQualificados: ClusterId[];     // subconjunto com quantidadePessoas >= 1
  promessas: PromessaPorCluster[];       
  publicoAlvoFinal: ClusterId | null;    
  metodoSelecionado: MetodoId | null;    
  pacientesMapeados: PacienteMapeadoEixo01[]; // Lista de pacientes mapeados ao vivo
  fluxoSemDados: boolean;                
  fase01Completa: boolean;               
  atualizadoEm: string;                  
}

export type MetodoId =
  | 'rotina_real'
  | 'acompanhamento_proximo'
  | 'foco_comportamento'
  | 'prescricao_tecnica'
  | 'escuta_sem_julgamento';

export const FATORES_PRIORITARIOS_POR_DOR: Record<ClusterId, { rotulo: string; opcoes: string[] }> = {
  estetica_emagrecimento: {
    rotulo: 'Emagrecimento / Mudança de Corpo',
    opcoes: [
      'Liberdade & Praticidade',
      'Transformação Visual',
      'Consistência Sem Efeito Sanfona',
      'Saúde & Mobilidade'
    ]
  },
  saude_clinica: {
    rotulo: 'Exames Alterados / Tratamento de Doenças',
    opcoes: [
      'Normalização de Exames',
      'Redução de Sintomas Físicos',
      'Apoio para Reduzir Remédios',
      'Segurança para Comer'
    ]
  },
  comportamento_alimentar: {
    rotulo: 'Ansiedade / Compulsão / Relação com Comida',
    opcoes: [
      'Paz Mental & Fim da Compulsão',
      'Comer Sem Culpa',
      'Autonomia Alimentar',
      'Organização dos Horários'
    ]
  },
  esporte_performance: {
    rotulo: 'Performance Esportiva / Ganho de Massa',
    opcoes: [
      'Hipertrofia & Definição',
      'Ganho de Força e Carga',
      'Recuperação Rápida',
      'Ajuste de Composição Corporal'
    ]
  },
  fases_da_vida: {
    rotulo: 'Fases da Vida (Gestação, Menopausa, etc.)',
    opcoes: [
      'Alívio de Sintomas Hormonais',
      'Nutrição Segura & Suporte',
      'Vitalidade & Massa Magra',
      'Praticidade no Dia a Dia'
    ]
  },
  restricoes_estilo_vida: {
    rotulo: 'Restrições Alimentares / Estilo de Vida',
    opcoes: [
      'Transição Alimentar Segura',
      'Eliminação de Desconfortos',
      'Variedade & Prazer ao Comer',
      'Adequação de Estilo de Vida'
    ]
  }
};
