// listasFase04.ts
// Listas fechadas da Fase 04 — ordem e nomes fixos conforme seção B.2 da especificação.

import type {
  FormatoComercialId,
  FormaPagamentoId,
  ParcelamentoId,
  ModalidadeId,
  DuracaoContratoId,
  MecanismoContinuidadeId,
} from '../fase04.types';

// ---------------------------------------------------------------------------
// B.2.1 Formato Comercial de Entrega
// ---------------------------------------------------------------------------

export interface ItemFormatoComercial {
  id: FormatoComercialId;
  label: string;
}

export const FORMATOS_COMERCIAIS: ItemFormatoComercial[] = [
  { id: 'consulta_avulsa',           label: 'Consulta pontual / avulsa (atendimento único; preço âncora)' },
  { id: 'programa_acompanhamento',   label: 'Programa de acompanhamento (planos de 3, 6 ou 12 meses)' },
  { id: 'assincrono_sem_video',      label: 'Atendimento 100% assíncrono / sem vídeo' },
  { id: 'comunidade_grupo',          label: 'Comunidade / grupo de aceleração' },
  { id: 'mentoria_high_ticket',      label: 'Mentoria / high-ticket multidisciplinar' },
];

// ---------------------------------------------------------------------------
// B.2.2 Formas de Pagamento Aceitas (multiseleção)
// ---------------------------------------------------------------------------

export interface ItemFormaPagamento {
  id: FormaPagamentoId;
  label: string;
}

export const FORMAS_PAGAMENTO: ItemFormaPagamento[] = [
  { id: 'pix_dinheiro',          label: 'Pix / dinheiro' },
  { id: 'cartao_credito_vista',  label: 'Cartão de crédito à vista' },
  { id: 'cartao_parcelado',      label: 'Cartão parcelado' },
  { id: 'recorrencia_assinatura', label: 'Recorrência / assinatura' },
  { id: 'boleto_crediario',      label: 'Boleto / crediário' },
];

// ---------------------------------------------------------------------------
// B.2.3 Parcelamento Máximo Sem Juros
// ---------------------------------------------------------------------------

export interface ItemParcelamento {
  id: ParcelamentoId;
  label: string;
}

export const PARCELAMENTOS: ItemParcelamento[] = [
  { id: 'avista', label: 'À vista' },
  { id: '2x',     label: '2x sem juros' },
  { id: '3x',     label: '3x sem juros' },
  { id: '4x',     label: '4x sem juros' },
  { id: '6x',     label: '6x sem juros' },
  { id: '10x',    label: '10x sem juros' },
  { id: '12x',    label: '12x sem juros' },
];

// ---------------------------------------------------------------------------
// B.2.4 Modalidade de Atendimento
// ---------------------------------------------------------------------------

export interface ItemModalidade {
  id: ModalidadeId;
  label: string;
}

export const MODALIDADES: ItemModalidade[] = [
  { id: 'presencial', label: 'Presencial' },
  { id: 'online',      label: 'Online' },
  { id: 'hibrido',      label: 'Híbrido' },
];

// ---------------------------------------------------------------------------
// B.2.5 Duração / Validade do Contrato
// ---------------------------------------------------------------------------

export interface ItemDuracaoContrato {
  id: DuracaoContratoId;
  label: string;
}

export const DURACOES_CONTRATO: ItemDuracaoContrato[] = [
  { id: 'pontual_1dia', label: 'Pontual (1 dia)' },
  { id: 'dias_30',       label: '30 dias' },
  { id: 'dias_90',       label: '90 dias (trimestral)' },
  { id: 'dias_180',      label: '180 dias (semestral)' },
  { id: 'dias_360',      label: '360 dias (anual)' },
];

// ---------------------------------------------------------------------------
// B.2.6 Mecanismo de Continuidade (fim de contrato)
// ---------------------------------------------------------------------------

export interface ItemMecanismoContinuidade {
  id: MecanismoContinuidadeId;
  label: string;
}

export const MECANISMOS_CONTINUIDADE: ItemMecanismoContinuidade[] = [
  { id: 'encerramento_alta',               label: 'Encerramento / alta — sem oferta ativa de renovação' },
  { id: 'volta_avulsa',                    label: 'Volta para consulta avulsa quando sentir necessidade' },
  { id: 'oferta_ativa_renovacao',          label: 'Oferta ativa de renovação / manutenção' },
  { id: 'cobranca_recorrente_automatica',  label: 'Cobrança recorrente automática (assinatura)' },
];

// ---------------------------------------------------------------------------
// Helpers de lookup por id
// ---------------------------------------------------------------------------

export function getLabelFormatoComercial(id: FormatoComercialId): string {
  return FORMATOS_COMERCIAIS.find((f) => f.id === id)?.label ?? id;
}

export function getLabelFormaPagamento(id: FormaPagamentoId): string {
  return FORMAS_PAGAMENTO.find((f) => f.id === id)?.label ?? id;
}

export function getLabelParcelamento(id: ParcelamentoId): string {
  return PARCELAMENTOS.find((p) => p.id === id)?.label ?? id;
}

export function getLabelModalidade(id: ModalidadeId): string {
  return MODALIDADES.find((m) => m.id === id)?.label ?? id;
}

export function getLabelDuracaoContrato(id: DuracaoContratoId): string {
  return DURACOES_CONTRATO.find((d) => d.id === id)?.label ?? id;
}

export function getLabelMecanismoContinuidade(id: MecanismoContinuidadeId): string {
  return MECANISMOS_CONTINUIDADE.find((m) => m.id === id)?.label ?? id;
}
