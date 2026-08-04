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
}

export interface PromessaPorCluster {
  clusterId: ClusterId;
  promessaSelecionada: string; // texto exato de uma das 4 opções da seção 4
}

export interface Fase01State {
  volumes: VolumePorCluster[];           // sempre 6 itens (um por cluster), preenchidos na Tela 1
  clustersQualificados: ClusterId[];     // subconjunto com quantidadePessoas >= 1, ordenado do maior para o menor volume
  promessas: PromessaPorCluster[];       // uma entrada por cluster que passou pela Tela 2 (inclusive quando reaproveitada pela Tela 4)
  publicoAlvoFinal: ClusterId | null;    // definido na Tela 3 ("Sim") ou na Tela 4
  metodoSelecionado: MetodoId | null;    // definido na Tela 5
  fluxoSemDados: boolean;                // true se os 6 volumes vierem como 0 (ver seção 6.1)
  fase01Completa: boolean;               // true somente após a Tela Final ser exibida com sucesso
  atualizadoEm: string;                  // timestamp ISO da última gravação desta fase (A.4 / A.4.1)
}

export type MetodoId =
  | 'rotina_real'
  | 'acompanhamento_proximo'
  | 'foco_comportamento'
  | 'prescricao_tecnica'
  | 'escuta_sem_julgamento';
