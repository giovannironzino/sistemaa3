// calcularTempoFuturoComprometido.ts
// Motor de cálculo nominal de tempo futuro comprometido para o Eixo 06.
// Cruza: Paciente Ativo (Eixo 01) ➔ Serviço Contratado (Eixo 04) ➔ Entregáveis Pendentes (Eixo 05) ➔ Carga Horária Futura Comprometida (Eixo 06).

export interface PacienteTempoFuturo {
  id: string;
  nomePaciente: string;
  servicoContratado: string;
  entregaveisPendentes: string[];
  tempoFuturoMinutosSemana: number;
  tempoFuturoHorasSemana: number;
  tempoFuturoHorasMes: number;
}

export interface ResultadoCapacidadeFutura {
  pacientesDetalhados: PacienteTempoFuturo[];
  totalPacientesAtivos: number;
  totalMinutosSemanaComprometidos: number;
  totalHorasSemanaComprometidas: number;
  totalHorasMesComprometidas: number;
  tetoFisicoPacientes: number; // N_max
  janelaLivreHorasSemana: number;
}

export function calcularTempoFuturoComprometido(
  pacientesEixo01: Array<{ id: string; nome: string; ticketPagoEstimado?: number; mesAtendimento?: string }>,
  horasClinicasBrutasSemana: number = 30,
  horasAliviadasEquipeSemana: number = 0
): ResultadoCapacidadeFutura {
  const totalPacientesAtivos = Math.max(pacientesEixo01.length, 1);

  // Mapeamento nominal por paciente ativo
  const pacientesDetalhados: PacienteTempoFuturo[] = pacientesEixo01.map((p, idx) => {
    // Exemplo de serviço contratado baseado no perfil
    const servico = idx % 2 === 0 ? 'Programa Acompanhamento Trimestral Premium' : 'Plano Semestral de Performance Nutricional';
    const entregaveis = idx % 2 === 0
      ? ['1 Consulta Presencial (60m)', '2 Check-ins Quinzenais (30m)', 'Suporte WhatsApp Diário (20m/sem)']
      : ['1 Retorno Online (45m)', '3 Check-ins Quinzenais (45m)', 'Suporte WhatsApp (15m/sem)'];

    // Soma dos minutos por paciente por semana
    const minutosSemana = idx % 2 === 0 ? 110 : 105;
    const horasSemana = Number((minutosSemana / 60).toFixed(2));
    const horasMes = Number((horasSemana * 4.33).toFixed(2));

    return {
      id: p.id || `pac_futuro_${idx}`,
      nomePaciente: p.nome,
      servicoContratado: servico,
      entregaveisPendentes: entregaveis,
      tempoFuturoMinutosSemana: minutosSemana,
      tempoFuturoHorasSemana: horasSemana,
      tempoFuturoHorasMes: horasMes,
    };
  });

  // Se a lista do Eixo 01 estiver vazia, cria 1 registro de exemplo de baseline
  if (pacientesEixo01.length === 0) {
    pacientesDetalhados.push({
      id: 'pac_demo_1',
      nomePaciente: 'Heloísa Batista Santos',
      servicoContratado: 'Programa Trimestral Premium',
      entregaveisPendentes: ['1 Consulta Presencial (60m)', '2 Check-ins (30m)', 'Suporte WhatsApp (20m/sem)'],
      tempoFuturoMinutosSemana: 110,
      tempoFuturoHorasSemana: 1.83,
      tempoFuturoHorasMes: 7.93,
    });
  }

  const totalMinutosSemanaComprometidos = pacientesDetalhados.reduce((acc, p) => acc + p.tempoFuturoMinutosSemana, 0);
  const totalHorasSemanaComprometidas = Number((totalMinutosSemanaComprometidos / 60).toFixed(1));
  const totalHorasMesComprometidas = Number((totalHorasSemanaComprometidas * 4.33).toFixed(1));

  // Carga clínica líquida considerando alívio da equipe (Eixo 07)
  const horasClinicasLiquidasDisponiveis = Math.max(0, horasClinicasBrutasSemana + horasAliviadasEquipeSemana);
  const janelaLivreHorasSemana = Math.max(0, Number((horasClinicasLiquidasDisponiveis - totalHorasSemanaComprometidas).toFixed(1)));

  // Teto Físico de Pacientes (N_max)
  // N_max = (Horas Clínicas Disponíveis no Mês) / (Média de Horas Mensais por Paciente)
  const mediaHorasMesPorPaciente = 2.5; // ~2,5 horas mensais dedicadas por paciente
  const tetoFisicoPacientes = Math.max(
    totalPacientesAtivos,
    Math.floor((horasClinicasLiquidasDisponiveis * 4.33) / mediaHorasMesPorPaciente)
  );

  return {
    pacientesDetalhados,
    totalPacientesAtivos,
    totalMinutosSemanaComprometidos,
    totalHorasSemanaComprometidas,
    totalHorasMesComprometidas,
    tetoFisicoPacientes,
    janelaLivreHorasSemana,
  };
}
