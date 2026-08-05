// calcularResumoServicos.ts
// Calcula o ResumoServicos a partir do Fase04State conforme fórmulas da seção B.5.
// Pressupõe estado válido: servicos.length >= 1 e carroChefeId apontando para um item existente
// (garantido pelo fluxo — B.6.2 bloqueia concluir cadastro com 0 serviços).

import type { Fase04State, ResumoServicos, FormaPagamentoId } from '../fase04.types';
import { FORMAS_PAGAMENTO } from '../data/listasFase04';

export function calcularResumoServicos(state: Fase04State): ResumoServicos {
  const { servicos, carroChefeId, mecanismoContinuidade, taxaRenovacaoAtual } = state;

  const totalServicos = servicos.length;
  const carroChefe = servicos.find((s) => s.id === carroChefeId)!;

  const totalPacientesAtivos = servicos.reduce((acc, s) => acc + s.pacientesAtivosVigentes, 0);

  // Ticket médio: ponderado pela base de pacientes ativos, com fallback para média simples
  const ticketMedioPonderado =
    totalPacientesAtivos > 0
      ? servicos.reduce((acc, s) => acc + s.precoVenda * s.pacientesAtivosVigentes, 0) / totalPacientesAtivos
      : servicos.reduce((acc, s) => acc + s.precoVenda, 0) / totalServicos;

  // Vendas mensais média: 90 dias ≈ 3 meses
  const vendasMensaisMedia =
    servicos.reduce((acc, s) => acc + s.vendasRealizadas90Dias, 0) / 3;

  // União (sem duplicatas) das formas de pagamento de todos os serviços,
  // preservando a ordem canônica da tabela B.2.2
  const formasPresentes = new Set<FormaPagamentoId>();
  for (const s of servicos) {
    for (const forma of s.formasPagamento) {
      formasPresentes.add(forma);
    }
  }
  const formasPagamentoAceitasUniao: FormaPagamentoId[] = FORMAS_PAGAMENTO
    .map((f) => f.id)
    .filter((id) => formasPresentes.has(id));

  return {
    totalServicos,
    carroChefeId: carroChefe.id,
    carroChefeNome: carroChefe.nomeComercial,
    carroChefePreco: carroChefe.precoVenda,
    totalPacientesAtivos,
    ticketMedioPonderado,
    vendasMensaisMedia,
    formatoDominante: carroChefe.formatoComercial,
    formasPagamentoAceitasUniao,
    possuiMecanismoDeRetencao: mecanismoContinuidade !== 'encerramento_alta',
    mecanismoContinuidade: mecanismoContinuidade!,
    taxaRenovacaoAtual: taxaRenovacaoAtual!,
  };
}
