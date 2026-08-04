// listas.ts
// Listas fechadas da Fase 03 — ordem e nomes fixos conforme seção 2 da especificação.

import type {
  MomentoPerdaId,
  JustificativaId,
  EtapaAtendimentoId,
  ConteudoRecontatoId,
  QuantidadeTentativas,
  IntervaloPrimeiroRecontato,
} from '../fase03.types';

// ---------------------------------------------------------------------------
// 2.1 Momentos de Perda (Tela 1)
// ---------------------------------------------------------------------------

export interface ItemMomentosPerda {
  id: MomentoPerdaId;
  label: string;
}

export const MOMENTOS_PERDA: ItemMomentosPerda[] = [
  { id: 'preco_inicial',            label: 'Logo no início (apresentação de preço)' },
  { id: 'apos_explicacao_servico',  label: 'Após a explicação do serviço' },
  { id: 'tentativa_agendamento',    label: 'Na tentativa de agendamento' },
  { id: 'no_show',                  label: 'No-show (não comparecimento)' },
  { id: 'nao_identificado',         label: 'Nenhuma das anteriores / não sei identificar' },
];

// ---------------------------------------------------------------------------
// 2.2 Justificativas de Não Fechamento (Tela 2)
// ---------------------------------------------------------------------------

export interface ItemJustificativa {
  id: JustificativaId;
  label: string;
}

export const JUSTIFICATIVAS: ItemJustificativa[] = [
  { id: 'financeiro',          label: 'Financeiro ("achei caro" / fora do orçamento)' },
  { id: 'decisao_externa',     label: 'Decisão externa (precisa falar com esposo(a)/família)' },
  { id: 'falta_tempo',         label: 'Falta de tempo' },
  { id: 'formato_entrega',     label: 'Formato da entrega (frequência distante ou modelo inacessível)' },
  { id: 'sem_justificativa',   label: 'Sem justificativa (vácuo / ghosting)' },
  { id: 'outra_justificativa', label: 'Nenhuma das anteriores (justificativa diferente)' },
];

// ---------------------------------------------------------------------------
// 2.3 Etapas do Atendimento (Tela 3 — multiseleção)
// ---------------------------------------------------------------------------

export interface ItemEtapaAtendimento {
  id: EtapaAtendimentoId;
  label: string;
}

export const ETAPAS_ATENDIMENTO: ItemEtapaAtendimento[] = [
  { id: 'boas_vindas_personalizadas', label: 'Boas-vindas personalizadas' },
  { id: 'investigacao_necessidades',  label: 'Investigação de necessidades' },
  { id: 'envio_audios',               label: 'Envio de áudios' },
  { id: 'apresentacao_metodo',        label: 'Apresentação do método' },
  { id: 'envio_material_pdf',         label: 'Envio de material em PDF / tabela' },
  { id: 'ancoragem_valor',            label: 'Ancoragem de valor (planos trimestral/semestral)' },
  { id: 'chamada_para_acao',          label: 'Chamada clara para ação (CTA)' },
  { id: 'atendimento_delegado',       label: 'Atendimento delegado (secretária/equipe comercial)' },
];

// ---------------------------------------------------------------------------
// 2.4 Conteúdo do Recontato (Tela 4.1, item 3 — multiseleção)
// ---------------------------------------------------------------------------

export interface ItemConteudoRecontato {
  id: ConteudoRecontatoId;
  label: string;
}

export const CONTEUDOS_RECONTATO: ItemConteudoRecontato[] = [
  { id: 'pergunta_duvida_valor',         label: 'Pergunto se ficou alguma dúvida sobre valor/método' },
  { id: 'envio_conteudo_util',           label: 'Envio um conteúdo útil relacionado à dor dela' },
  { id: 'nova_opcao_horario_pagamento',  label: 'Apresento nova opção de horário ou pagamento' },
  { id: 'pergunta_checagem_simples',     label: 'Pergunta simples de checagem ("ainda faz sentido?")' },
];

// ---------------------------------------------------------------------------
// Opções de Quantidade de Tentativas (Tela 4.1 item 1)
// ---------------------------------------------------------------------------

export interface ItemQuantidadeTentativas {
  id: QuantidadeTentativas;
  label: string;
}

export const QUANTIDADES_TENTATIVAS: ItemQuantidadeTentativas[] = [
  { id: '1',          label: '1 vez' },
  { id: '2',          label: '2 vezes' },
  { id: '3',          label: '3 vezes' },
  { id: '4_ou_mais',  label: '4 vezes ou mais' },
];

// ---------------------------------------------------------------------------
// Opções de Intervalo do Primeiro Recontato (Tela 4.1 item 2)
// ---------------------------------------------------------------------------

export interface ItemIntervaloPrimeiroRecontato {
  id: IntervaloPrimeiroRecontato;
  label: string;
}

export const INTERVALOS_RECONTATO: ItemIntervaloPrimeiroRecontato[] = [
  { id: 'mesmo_dia',           label: 'No mesmo dia' },
  { id: 'dia_seguinte',        label: 'No dia seguinte (24h)' },
  { id: 'dois_a_tres_dias',    label: '2 a 3 dias depois' },
  { id: 'uma_semana_ou_mais',  label: '1 semana ou mais depois' },
];

// ---------------------------------------------------------------------------
// Helpers de lookup por id
// ---------------------------------------------------------------------------

export function getLabelMomentosPerda(id: MomentoPerdaId): string {
  return MOMENTOS_PERDA.find((m) => m.id === id)?.label ?? id;
}

export function getLabelJustificativa(id: JustificativaId): string {
  return JUSTIFICATIVAS.find((j) => j.id === id)?.label ?? id;
}

export function getLabelQuantidadeTentativas(id: QuantidadeTentativas): string {
  return QUANTIDADES_TENTATIVAS.find((q) => q.id === id)?.label ?? id;
}

export function getLabelIntervaloPrimeiroRecontato(id: IntervaloPrimeiroRecontato): string {
  return INTERVALOS_RECONTATO.find((i) => i.id === id)?.label ?? id;
}
