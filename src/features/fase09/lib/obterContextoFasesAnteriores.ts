// obterContextoFasesAnteriores.ts
// Extrai dados acumulados das fases anteriores (01 a 08) do clientRecord.

export interface ServicoSimplificado {
  id: string;
  nomeComercial: string;
  precoVenda: number;
  pacientesAtivosVigentes: number;
  formatoComercial: string;
  duracaoMeses: number;
  duracaoContratoMeses?: number;
  modalidadeAtendimento?: string;
  vendasUltimos90Dias?: number;
}

export interface ContextoFasesAnteriores {
  receitaMediaReal: number;
  custosFixosTotais: number;
  lucroLiquidoReal: number;
  limitePreAprovado: number | null;
  baseAtivosAtual: number;
  ticketMedioAtual: number;
  custoEntregaUnitario: number;
  taxaConversaoGeral: number;
  tetoSemanaPerfeitaPadrao: number;
  servicos: ServicoSimplificado[];
  pacientesMapeados?: any[];
  membrosEquipe?: any[];
  totalPacientesInativos?: number;
  // Eixo 02 — Captação
  leadsMensaisMedia: number;       // média histórica de contatos por mês (últimos 3 meses)
  canaisCampeoes: string[];        // top 3 canais por conversão real
  totalContatosCaptacao: number;   // total de contatos registrados no período
}

function parseDuracaoMeses(duracaoStr?: string): number {
  if (!duracaoStr) return 1;
  if (duracaoStr.includes('360') || duracaoStr.toLowerCase().includes('anual')) return 12;
  if (duracaoStr.includes('180') || duracaoStr.toLowerCase().includes('semestral')) return 6;
  if (duracaoStr.includes('90') || duracaoStr.toLowerCase().includes('trimestral')) return 3;
  if (duracaoStr.includes('30') || duracaoStr.toLowerCase().includes('mensal')) return 1;
  return 1;
}

export function obterContextoFasesAnteriores(clientRecord: any): ContextoFasesAnteriores {
  // --- Fase 08 (Financeiro) ---
  const b8 = clientRecord?.blocks?.b8;
  const f8 = clientRecord?.fase08;

  let receitaMediaReal = f8?.receitaMediaReal ?? 0;
  if (receitaMediaReal === 0 && b8) {
    const fM2 = Number(b8.faturamentoM2 || 0);
    const fM1 = Number(b8.faturamentoM1 || 0);
    const fAtual = Number(b8.faturamentoAtual || 0);
    if (fM2 > 0 || fM1 > 0 || fAtual > 0) {
      receitaMediaReal = (fM2 + fM1 + fAtual) / 3;
    } else if (clientRecord?.blocks?.b9?.faturamento90) {
      receitaMediaReal = Number(clientRecord.blocks.b9.faturamento90);
    }
  }

  let custosFixosTotais = f8?.custosFixosTotais ?? 0;
  if (custosFixosTotais === 0 && b8) {
    let efSum = 0;
    if (b8.estruturaFisica) {
      efSum += Number(b8.estruturaFisica.aluguel || 0);
      efSum += Number(b8.estruturaFisica.condominioIptu || 0);
      efSum += Number(b8.estruturaFisica.energiaAgua || 0);
      efSum += Number(b8.estruturaFisica.internetTelefone || 0);
      efSum += Number(b8.estruturaFisica.limpezaManutencao || 0);
      efSum += Number(b8.estruturaFisica.outroValor || 0);
    }
    let techSum = 0;
    if (b8.tecnologiaSoftwares) {
      Object.values(b8.tecnologiaSoftwares).forEach((v) => { techSum += Number(v || 0); });
    }
    techSum += Number(b8.outroTech1Valor || 0) + Number(b8.outroTech2Valor || 0);
    let profSum = 0;
    if (b8.servicosProfissionais) {
      profSum += Number(b8.servicosProfissionais.contabilidade || 0);
      profSum += Number(b8.servicosProfissionais.juridico || 0);
      profSum += Number(b8.servicosProfissionais.taxasAlvaraCrn || 0);
      profSum += Number(b8.servicosProfissionais.outroValor || 0);
    }
    custosFixosTotais = efSum + techSum + profSum;
  }

  const lucroLiquidoReal = f8?.lucroLiquidoReal ?? (receitaMediaReal - custosFixosTotais);
  const limitePreAprovado = receitaMediaReal > 0 ? Math.max(0, Math.floor(lucroLiquidoReal)) : null;

  let custoEntregaUnitario = f8?.custoEntregaUnitario ?? 0;
  if (custoEntregaUnitario === 0 && b8) {
    custoEntregaUnitario = Number(b8.custoKitsMimos || 0) + Number(b8.custoFretePaciente || 0) + Number(b8.custoRemuneracaoTecnica || 0);
  }

  // --- Fase 04 (Serviços) ---
  const f4 = clientRecord?.fase04;
  const b4Services = clientRecord?.blocks?.b4?.services;
  const servicosRaw: any[] = f4?.servicos ?? b4Services ?? [];

  const servicos: ServicoSimplificado[] = servicosRaw.map((s: any) => ({
    id: s.id || crypto.randomUUID(),
    nomeComercial: s.nomeComercial || s.name || 'Serviço',
    precoVenda: Number(s.precoVenda ?? s.price ?? 0),
    pacientesAtivosVigentes: Number(s.pacientesAtivosVigentes ?? s.activePatients ?? 0),
    formatoComercial: s.formatoComercial || s.format || '',
    duracaoMeses: parseDuracaoMeses(s.duracaoContrato),
    duracaoContratoMeses: parseDuracaoMeses(s.duracaoContrato),
    modalidadeAtendimento: s.modalidadeAtendimento || s.modality || 'Híbrido',
    vendasUltimos90Dias: Number(s.vendasUltimos90Dias ?? 0),
  }));

  const resumoServicos = f4?.ResumoServicos;
  let baseAtivosAtual = resumoServicos?.totalPacientesAtivos ?? 0;
  if (baseAtivosAtual === 0 && servicos.length > 0) {
    baseAtivosAtual = servicos.reduce((acc, s) => acc + s.pacientesAtivosVigentes, 0);
  }
  if (baseAtivosAtual === 0 && clientRecord?.blocks?.b9?.pacientesAtivos) {
    baseAtivosAtual = Number(clientRecord.blocks.b9.pacientesAtivos);
  }

  let ticketMedioAtual = resumoServicos?.ticketMedioPonderado ?? 0;
  if (ticketMedioAtual === 0 && servicos.length > 0) {
    if (baseAtivosAtual > 0) {
      const receitaBase = servicos.reduce((acc, s) => acc + s.precoVenda * s.pacientesAtivosVigentes, 0);
      ticketMedioAtual = receitaBase / baseAtivosAtual;
    } else {
      const somaPrecos = servicos.reduce((acc, s) => acc + s.precoVenda, 0);
      ticketMedioAtual = somaPrecos / servicos.length;
    }
  }

  // --- Fase 01, 02, 05, 06, 07 Extra Data ---
  const pacientesMapeados = clientRecord?.fase01?.pacientesMapeados ?? [];
  const membrosEquipe = clientRecord?.fase07?.membros ?? [];
  const totalPacientesInativos = Number(clientRecord?.fase05?.totalPacientesInativos ?? 10);

  // --- Fase 02 (Captação) ---
  const f2 = clientRecord?.fase02;
  const resumoCaptacao = f2?.ResumoCaptacao;
  const taxaConversaoGeral = resumoCaptacao?.taxaConversaoGeral ?? f2?.taxaConversaoGeral ?? 20;
  const leadsMensaisMedia = resumoCaptacao?.leadsMensaisMedia ?? 0;
  const canaisCampeoes: string[] = resumoCaptacao?.canaisCampeoes ?? [];
  const totalContatosCaptacao: number = resumoCaptacao?.totalContatos ?? 0;

  // --- Fase 06 (Agenda) ---
  const f6 = clientRecord?.fase06;
  const tetoSemanaPerfeitaPadrao = f6?.tetoSemanaPerfeita ?? clientRecord?.blocks?.b9?.horasLivres ?? 40;

  return {
    receitaMediaReal,
    custosFixosTotais,
    lucroLiquidoReal,
    limitePreAprovado,
    baseAtivosAtual,
    ticketMedioAtual,
    custoEntregaUnitario,
    taxaConversaoGeral,
    tetoSemanaPerfeitaPadrao,
    servicos,
    pacientesMapeados,
    membrosEquipe,
    totalPacientesInativos,
    leadsMensaisMedia,
    canaisCampeoes,
    totalContatosCaptacao,
  };
}

