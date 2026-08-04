// jornada.types.ts
// Contrato de dados da Jornada do A3 — 9 fases sequenciais.
// Caminho Firestore: clients/{uid}.jornada

export type FaseJornadaId =
  | 'fase01_promessa_metodo'
  | 'fase02_captacao'
  | 'fase03_vendas'
  | 'fase04_servicos'
  | 'fase05_entrega_rotina'
  | 'fase06_agenda'
  | 'fase07_equipe'
  | 'fase08_financeiro'
  | 'fase09_metas_simulacao';

export type StatusFase = 'concluida' | 'em_andamento' | 'bloqueada' | 'nao_implementada';

export interface EtapaJornada {
  id: FaseJornadaId;
  ordem: number;       // 1 a 9, conforme seção 2 da especificação
  nome: string;        // ex: "Promessa & Método"
  subtitulo: string;   // ex: "O que eu faço e por quê (a raiz de tudo)"
  status: StatusFase;
}

export interface JornadaState {
  faseAtualId: FaseJornadaId;         // qual fase está ativa/em foco agora
  fasesConcluidas: FaseJornadaId[];   // ids das fases já finalizadas
}
