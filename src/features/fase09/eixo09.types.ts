// eixo09.types.ts
// Contrato de Dados para o Eixo 09 — Metas & Simulação (Mesa de Controle Viva)

export type FormaRecebimentoId = 'antecipado' | 'parcelado_sem_antecipar' | 'recorrencia';
export type TipoApoioId = 'operacional' | 'comercial' | 'gestao';
export type EscolhaCaminhoId = 'novos' | 'base_atual' | 'mistura';
export type PresetDistribuicaoId = 'foco_carro_chefe' | 'equilibrado' | 'personalizado';

export interface Fase09Assumptions {
  // Premissas temporárias — coletadas embutidas pelo próprio Eixo 09, na primeira vez que
  // são necessárias, até que as fases de origem (05, 07, 08) existam de verdade e
  // passem a alimentar estes mesmos campos.
  minutosPacienteNovo: number | null;        // origem futura: Fase 05
  minutosPacienteAtivo: number | null;       // origem futura: Fase 05
  impostosPercentual: number | null;         // origem futura: Fase 08 (separado)
  taxaCartaoPercentual: number | null;       // origem futura: Fase 08 (separado)
  taxaAntecipacaoPercentual: number | null;  // origem futura: Fase 08 (separado)
  totalPacientesInativos: number | null;     // origem futura: Fase 04
  temComunidadeAtiva: boolean | null;        // origem futura: Fase 04 ou 05
  atualizadoEm: string;
}

export interface DistribuicaoServico {
  servicoId: string;      // referencia ServicoInstancia.id da Fase 04
  quantidade: number;
}

export interface OfertaEcossistema {
  servicoId: string;      // referencia ServicoInstancia.id da Fase 04, ou id de exemplo se não cadastrado
  nomeExibicao: string;
  precoUnitario: number;
  quantidadeEstimada: number;
}

export interface DesdobramentoCargaHoraria {
  atendimentoClinico: number;
  prescricaoPlanos: number;
  comercialWhatsapp: number;
  gestaoMarketing: number;
  estudos: number;
}

export interface MarcoMensalCrescimento {
  mes: number;
  lucroEstimado: number;
  novosPacientesAcumulados: number;
  leadsSemanaExigidos: number;
}

export interface SimuladorState {
  // Abertura
  numeroMagico: number;
  limitePreAprovado: number | null;          // null se Receita_Media_Real = 0 (sem histórico)
  tetoSemanaPerfeita: number;                // horas/semana
  prazoMeses: 1 | 3 | 6 | 12;                // Horizonte Temporal da Meta

  // Carga Horária Desdobrada (Obs 03)
  desdobramentoCargaHoraria?: DesdobramentoCargaHoraria;

  // Forma de recebimento
  formaRecebimento: FormaRecebimentoId;

  // Escolha de caminho (narrativo, não afeta cálculo)
  escolhaCaminho: EscolhaCaminhoId | null;

  // Card 1 — Novos Pacientes
  card1Ativo: boolean;
  novosPacientesQuantidade: number;
  novosPacientesPreset: PresetDistribuicaoId | null;
  novosPacientesDistribuicao: DistribuicaoServico[];

  // Card 1B — Indicação Orgânica
  card1BAtivo: boolean;
  indicacaoQuantidade: number;

  // Card 2 — Reajuste da Base
  card2Ativo: boolean;
  reajusteValorReais: number;
  taxaSaidaEsperadaPercentual: number;
  reajustePorServico?: Record<string, { reajusteValorReais: number; taxaSaidaPercentual: number }>; // elasticidade por tipo de produto do Eixo 04

  // Card 3 — Migração de Planos
  card3Ativo: boolean;
  planoOrigemServicoId: string | null;
  planoDestinoServicoId: string | null;
  quantidadeMigrar: number;

  // Card 4A — Funil de Manutenção
  card4ALinha1Ativa: boolean;                // manutenção pra quem sai (depende do Card 2)
  card4ALinha1TaxaAceitacaoPercentual: number;
  card4ALinha2Ativa: boolean;                // manutenção pra quem está de alta
  card4ALinha2PacientesDeAltaQuantidade: number;
  card4ALinha2TaxaAceitacaoPercentual: number;

  // Card 4B — Produtos de Ecossistema
  card4BAtivo: boolean;
  card4BOfertas: OfertaEcossistema[];

  // Card 5 — Equipe de Apoio
  card5ApoioOperacionalAtivo: boolean;
  card5ApoioComercialAtivo: boolean;
  card5ApoioGestaoAtivo: boolean;
  card5MelhoraConversaoPercentual: number;           // só relevante se apoio comercial ativo
  card5CustoOperacionalReais: number;
  card5CustoComercialReais: number;
  card5CustoGestaoReais: number;
  card5HorasAbsorvidasOperacional: number;
  card5HorasAbsorvidasGestaoPropria: number;         // horas de gestão que o apoio administrativo libera
  card5HorasGestaoDaEquipe: number;                  // custo de tempo pra gerenciar apoio operacional/comercial

  // Card 6 — Resgate de Inativos
  card6Ativo: boolean;
  quantidadeResgatar: number;
  taxaSucessoPercentual: number;

  // Meta Financeira (Eixo 08 Integrado)
  metaLucroLiquidoReais?: number;
  metaFaturamentoBrutoReais?: number;

  // Visualização Híbrida Sintética / Analítica
  modoExibicaoColuna1?: 'sintetico' | 'analitico';
  modoExibicaoColuna3?: 'sintetico' | 'analitico';
  itensExpandidosColuna1?: Record<string, boolean>;
  itensExpandidosColuna3?: Record<string, boolean>;

  premissas: Fase09Assumptions;
}

// Resultado calculated, nunca editado manualmente
export interface ResultadoSimulado {
  receitaSimuladaMensal: number;
  horasSimuladasMensais: number;
  cargaHorariaSemanalExigida: number;
  leadsNecessariosMes: number;
  totalPacientesSimulados: number;
  custoEntregaTotalReais: number;
  lucroLiquidoSimulado: number;
  bateuNumeroMagico: boolean;
  respeitouTetoSemanaPerfeita: boolean;
  // Novos campos de Exequibilidade & Linguagem Simples
  scoreExequibilidadeA3: number; // 0 a 100%
  classificacaoExequibilidade: 'Alta Viabilidade' | 'Esforço Moderado' | 'Desafio Elevado' | 'Risco de Exaustão';
  explicacaoSimplesExequibilidade: string;
  narrativaMaterializacaoSonho: string;
  marcosMensais: MarcoMensalCrescimento[];
}

export interface ResumoSimulacaoEixo09 {
  id: string;
  nomeExibicao: string;       // gerado automaticamente se o usuário não nomear, ex: "Simulação de 04/08 às 14:32"
  criadoEm: string;
  favorita: boolean;
  estado: SimuladorState;     // snapshot completo e imutável do momento em que foi guardada
  resultado: ResultadoSimulado;
}
