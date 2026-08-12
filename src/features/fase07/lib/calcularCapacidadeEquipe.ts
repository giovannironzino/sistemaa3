// calcularCapacidadeEquipe.ts
// Motor de cálculo de capacidade de suporte da equipe e ROI da folha em Linguagem Simples.

export interface MembroEquipeCadastrado {
  id: string;
  nome: string;
  papelId: string;
  nomePapel: string;
  horasSemanais: number;
  custoMensal: number;
}

export interface ResultadoCapacidadeEquipe {
  totalMembros: number;
  totalHorasSemanaisEquipe: number;
  totalCustoMensalFolha: number;
  capacidadePacientesSuportados: number;
  percentualUsoCapacidadeAtual: number;
}

export function calcularCapacidadeEquipe(
  membros: MembroEquipeCadastrado[],
  pacientesAtivosContagem: number = 38
): ResultadoCapacidadeEquipe {
  const totalMembros = membros.length;
  const totalHorasSemanaisEquipe = membros.reduce((acc, m) => acc + (Number(m.horasSemanais) || 0), 0);
  const totalCustoMensalFolha = membros.reduce((acc, m) => acc + (Number(m.custoMensal) || 0), 0);

  // Média: Cada 1 hora semanal de equipe dá suporte operacional para 1.25 pacientes ativos por mês
  const capacidadePacientesSuportados = Math.max(
    pacientesAtivosContagem,
    Math.floor(totalHorasSemanaisEquipe * 1.25)
  );

  const percentualUsoCapacidadeAtual = capacidadePacientesSuportados > 0
    ? Math.min(100, Math.round((pacientesAtivosContagem / capacidadePacientesSuportados) * 100))
    : 100;

  return {
    totalMembros,
    totalHorasSemanaisEquipe,
    totalCustoMensalFolha,
    capacidadePacientesSuportados,
    percentualUsoCapacidadeAtual,
  };
}
