// fase04.types.ts
// Contrato de dados da Fase 04 — Serviços & Modelagem (Arquitetura da Oferta).
// Nomes de campos travados conforme especificação seção B.3.

export type FormatoComercialId =
  | 'consulta_avulsa'
  | 'programa_acompanhamento'
  | 'assincrono_sem_video'
  | 'comunidade_grupo'
  | 'mentoria_high_ticket';

export type FormaPagamentoId =
  | 'pix_dinheiro'
  | 'cartao_credito_vista'
  | 'cartao_parcelado'
  | 'recorrencia_assinatura'
  | 'boleto_crediario';

export type ParcelamentoId = 'avista' | '2x' | '3x' | '4x' | '6x' | '10x' | '12x';

export type ModalidadeId = 'presencial' | 'online' | 'hibrido';

export type DuracaoContratoId =
  | 'pontual_1dia'
  | 'dias_30'
  | 'dias_90'
  | 'dias_180'
  | 'dias_360';

export type MecanismoContinuidadeId =
  | 'encerramento_alta'
  | 'volta_avulsa'
  | 'oferta_ativa_renovacao'
  | 'cobranca_recorrente_automatica';

export type QuantosFormatosDeclarado = 'um_formato' | 'dois_a_tres' | 'quatro_ou_mais';

export interface ServicoInstancia {
  id: string;                              // uuid gerado no cliente
  nomeComercial: string;                    // texto livre, obrigatório
  formatoComercial: FormatoComercialId;
  precoVenda: number;                       // em reais, >= 0
  formasPagamento: FormaPagamentoId[];      // multiseleção, mínimo 1
  parcelamentoMaximo: ParcelamentoId;
  modalidade: ModalidadeId;
  duracaoContrato: DuracaoContratoId;
  pacientesAtivosVigentes: number;          // inteiro, >= 0
  vendasRealizadas90Dias: number;           // inteiro, >= 0
  criadoEm: string;                         // timestamp ISO
  atualizadoEm: string;                     // timestamp ISO
}

export interface Fase04State {
  quantosFormatosDeclarado: QuantosFormatosDeclarado | null; // ver B.6.1 — puramente informativo
  servicos: ServicoInstancia[];
  carroChefeId: string | null;              // id de um item de `servicos`
  mecanismoContinuidade: MecanismoContinuidadeId | null;
  fase04Completa: boolean;
  atualizadoEm: string;                     // timestamp ISO da última gravação desta fase (A.4 / A.4.1)

  // NOVO CAMPO — Emenda de Integração Fase 04 → Eixo 09
  taxaRenovacaoAtual: number | null;         // 0 a 100, percentual, null até ser respondido na Tela 3.1
}

// Consumido por eixos futuros (Agenda, Financeiro, Metas) — nomes travados, não alterar
export interface ResumoServicos {
  totalServicos: number;
  carroChefeId: string;
  carroChefeNome: string;
  carroChefePreco: number;
  totalPacientesAtivos: number;             // soma de pacientesAtivosVigentes de todos os serviços — equivalente a "Total_Pacientes_Ativos"
  ticketMedioPonderado: number;             // ver fórmula B.5 — equivalente a "Ticket_Medio_Atual"
  vendasMensaisMedia: number;               // ver fórmula B.5 — equivalente a "Vendas_Mensais_Média"
  formatoDominante: FormatoComercialId;     // formato do carro-chefe
  formasPagamentoAceitasUniao: FormaPagamentoId[]; // união de todas as formas de pagamento de todos os serviços, sem duplicar
  possuiMecanismoDeRetencao: boolean;       // true se mecanismoContinuidade !== 'encerramento_alta'
  mecanismoContinuidade: MecanismoContinuidadeId;

  // NOVO CAMPO — Emenda de Integração Fase 04 → Eixo 09
  taxaRenovacaoAtual: number;                // equivalente a "Taxa_Renovacao_Atual_%" do Eixo 09 — copiado direto de Fase04State.taxaRenovacaoAtual
}
