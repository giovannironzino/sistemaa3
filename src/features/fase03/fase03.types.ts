// fase03.types.ts
// Contrato de dados da Fase 03 — Vendas (Como Você Atende e Fecha).
// Nomes de campos travados conforme especificação seção 3.

export type MomentoPerdaId =
  | 'preco_inicial'
  | 'apos_explicacao_servico'
  | 'tentativa_agendamento'
  | 'no_show'
  | 'nao_identificado';

export type JustificativaId =
  | 'financeiro'
  | 'decisao_externa'
  | 'falta_tempo'
  | 'formato_entrega'
  | 'sem_justificativa'
  | 'outra_justificativa';

export type EtapaAtendimentoId =
  | 'boas_vindas_personalizadas'
  | 'investigacao_necessidades'
  | 'envio_audios'
  | 'apresentacao_metodo'
  | 'envio_material_pdf'
  | 'ancoragem_valor'
  | 'chamada_para_acao'
  | 'atendimento_delegado';

export type ConteudoRecontatoId =
  | 'pergunta_duvida_valor'
  | 'envio_conteudo_util'
  | 'nova_opcao_horario_pagamento'
  | 'pergunta_checagem_simples';

export type AtitudeFollowUp = 'sem_recontato' | 'recontato_ativo';

export type QuantidadeTentativas = '1' | '2' | '3' | '4_ou_mais';

export type IntervaloPrimeiroRecontato =
  | 'mesmo_dia'
  | 'dia_seguinte'
  | 'dois_a_tres_dias'
  | 'uma_semana_ou_mais';

export interface DistribuicaoGargalo {
  preco_inicial: number;
  apos_explicacao_servico: number;
  tentativa_agendamento: number;
  no_show: number;
  nao_identificado: number;
}

export interface DistribuicaoObjecao {
  financeiro: number;
  decisao_externa: number;
  falta_tempo: number;
  formato_entrega: number;
  sem_justificativa: number;
  outra_justificativa: number;
}

export interface Fase03State {
  totalNaoConvertidosRef: number;                 // copiado de ResumoCaptacao.totalNaoConvertidos no início da fase, somente leitura
  semNaoConvertidos: boolean;                      // true se totalNaoConvertidosRef === 0
  distribuicaoGargalo: DistribuicaoGargalo | null; // null se semNaoConvertidos === true
  distribuicaoObjecao: DistribuicaoObjecao | null; // null se semNaoConvertidos === true
  etapasMarcadas: EtapaAtendimentoId[];
  atitudeFollowUp: AtitudeFollowUp | null;
  quantidadeTentativas: QuantidadeTentativas | null;            // preenchido somente se atitudeFollowUp === 'recontato_ativo'
  intervaloPrimeiroRecontato: IntervaloPrimeiroRecontato | null; // idem
  conteudoRecontato: ConteudoRecontatoId[];                     // idem
  fase03Completa: boolean;
  atualizadoEm: string;                                         // timestamp ISO da última gravação desta fase (A.4 / A.4.1)
}

// Consumido por eixos futuros (nomes travados)
export interface ResumoComercial {
  gargaloCampeao: MomentoPerdaId | null;   // null se semNaoConvertidos === true
  nGargalo: number;
  objecaoCampea: JustificativaId | null;   // null se semNaoConvertidos === true
  nObjecao: number;
  nEtapasMarcadas: number;                 // 0 a 8
  possuiFollowUpAtivo: boolean;
}
