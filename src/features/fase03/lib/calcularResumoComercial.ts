// calcularResumoComercial.ts
// Calcula o ResumoComercial a partir do Fase03State conforme seção 5 da especificação.
// Regra de desempate: ordem da tabela original (primeiro na tabela vence).

import type {
  Fase03State,
  ResumoComercial,
  MomentoPerdaId,
  JustificativaId,
} from '../fase03.types';

import { MOMENTOS_PERDA, JUSTIFICATIVAS } from '../data/listas';

// ---------------------------------------------------------------------------
// Helper genérico: encontra a chave com maior valor em um registro
// respeitando a ordem de prioridade (desempate pela ordem da tabela)
// ---------------------------------------------------------------------------

function campeaoPor<K extends string>(
  distribuicao: Record<K, number>,
  ordemTabela: K[]
): { id: K; valor: number } | null {
  let campeao: K | null = null;
  let maxValor = -1;

  for (const id of ordemTabela) {
    const valor = distribuicao[id] ?? 0;
    // Usa > estrito: em empate, o primeiro da tabela (já processado) permanece
    if (valor > maxValor) {
      maxValor = valor;
      campeao = id;
    }
  }

  if (campeao === null) return null;
  return { id: campeao, valor: maxValor };
}

// ---------------------------------------------------------------------------
// Função principal
// ---------------------------------------------------------------------------

export function calcularResumoComercial(state: Fase03State): ResumoComercial {
  // Caso semNaoConvertidos: campeões ficam null
  if (state.semNaoConvertidos || state.distribuicaoGargalo === null || state.distribuicaoObjecao === null) {
    return {
      gargaloCampeao: null,
      nGargalo: 0,
      objecaoCampea: null,
      nObjecao: 0,
      nEtapasMarcadas: state.etapasMarcadas.length,
      possuiFollowUpAtivo: state.atitudeFollowUp === 'recontato_ativo',
    };
  }

  // Ordem das tabelas para desempate (seções 2.1 e 2.2)
  const ordemGargalo: MomentoPerdaId[] = MOMENTOS_PERDA.map((m) => m.id);
  const ordemObjecao: JustificativaId[] = JUSTIFICATIVAS.map((j) => j.id);

  const resultGargalo = campeaoPor<MomentoPerdaId>(
    state.distribuicaoGargalo as Record<MomentoPerdaId, number>,
    ordemGargalo
  );

  const resultObjecao = campeaoPor<JustificativaId>(
    state.distribuicaoObjecao as Record<JustificativaId, number>,
    ordemObjecao
  );

  return {
    gargaloCampeao: resultGargalo?.id ?? null,
    nGargalo: resultGargalo?.valor ?? 0,
    objecaoCampea: resultObjecao?.id ?? null,
    nObjecao: resultObjecao?.valor ?? 0,
    nEtapasMarcadas: state.etapasMarcadas.length,
    possuiFollowUpAtivo: state.atitudeFollowUp === 'recontato_ativo',
  };
}
