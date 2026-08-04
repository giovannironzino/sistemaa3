// fase02.types.ts
import type { ClusterId } from '../fase01/fase01.types';

export type CanalOrigemId =
  | 'indicacao_boca_a_boca'
  | 'instagram_organico'
  | 'social_selling'
  | 'reativacao_antigos'
  | 'desafios_grupos'
  | 'trafego_pago'
  | 'parcerias_medicas'
  | 'eventos_presenciais'
  | 'busca_video_curto';

export type StatusFechamento = 'sim' | 'nao';

export interface ContatoCaptacao {
  id: string;                          // uuid gerado no cliente
  data: string;                        // formato ISO 'YYYY-MM-DD', vindo da Tela 1
  nomeContato: string;                 // texto livre, obrigatório, mínimo 1 caractere
  objetivoPrincipal: ClusterId;
  statusFechamento: StatusFechamento;
  canalOrigem: CanalOrigemId;
  nomeIndicador?: string;              // presente somente se canalOrigem === 'indicacao_boca_a_boca' e sabeQuemIndicou === true
  sabeQuemIndicou?: boolean;           // presente somente se canalOrigem === 'indicacao_boca_a_boca'
  nomeParceiro?: string;               // presente somente se canalOrigem === 'parcerias_medicas' e sabeQualParceiro === true
  sabeQualParceiro?: boolean;          // presente somente se canalOrigem === 'parcerias_medicas'
  criadoEm: string;                    // timestamp ISO de criação
  atualizadoEm: string;                // timestamp ISO da última edição
}

export interface Fase02State {
  janelaInicial: string;               // ISO, calculado como dataDeHoje - 90 dias no início da fase, fixo durante toda a fase
  janelaFinal: string;                 // ISO, data de hoje no início da fase, fixo durante toda a fase
  dataEmRevisao: string | null;        // data selecionada na Tela 1, controla o formulário da Tela 2
  contatos: ContatoCaptacao[];         // todos os contatos cadastrados, de todas as datas
  travaConfirmada: boolean;            // true após confirmação da Tela 4
  fase02Completa: boolean;             // true após exibir a Tela Final com sucesso
  atualizadoEm: string;                // timestamp ISO da última gravação desta fase (A.4 / A.4.1)
}

// ESTE BLOCO SERÁ CONSUMIDO POR EIXOS FUTUROS — nomes travados, não alterar
export interface ResumoCaptacao {
  totalContatos: number;
  totalConvertidos: number;                        // statusFechamento === 'sim'
  totalNaoConvertidos: number;                      // statusFechamento === 'nao'
  taxaConversaoGeral: number;                       // totalConvertidos / totalContatos, em %, 1 casa decimal
  rankingCanaisPorVolume: RankingCanal[];            // todos os 9 canais, ordenados do maior pro menor volume total
  taxaConversaoPorCanal: TaxaConversaoCanal[];       // ver regra dos 10 leads, seção 6.4
  canaisCampeoes: CanalOrigemId[];                   // os 3 canais com maior totalConvertidos (não volume) — consumido pelo Eixo 06 e Eixo 09 como "Canais_Campeoes_Lista"
  topIndicadores: RankingNome[];                     // ranking de nomes em nomeIndicador, do que mais trouxe gente pro que menos trouxe
  topParceiros: RankingNome[];                       // ranking de nomes em nomeParceiro, do que mais trouxe gente pro que menos trouxe
}

export interface RankingCanal {
  canalOrigem: CanalOrigemId;
  totalContatos: number;
  totalConvertidos: number;
}

export interface TaxaConversaoCanal {
  canalOrigem: CanalOrigemId;
  taxaConversao: number | null;   // null se o canal não atingiu o mínimo de 10 leads (ver 6.4) — nesse caso não exibir %, exibir aviso de dado insuficiente
  totalContatos: number;
}

export interface RankingNome {
  nome: string;
  totalContatos: number;
  totalConvertidos: number;
}
