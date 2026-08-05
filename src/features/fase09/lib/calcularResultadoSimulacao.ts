// calcularResultadoSimulacao.ts
// Implementação exata das fórmulas matemáticas do Eixo 09 conforme Seção 6 da especificação.

import type { SimuladorState, ResultadoSimulado } from '../eixo09.types';
import type { ContextoFasesAnteriores } from './obterContextoFasesAnteriores';

export function calcularResultadoSimulacao(
  state: SimuladorState,
  contexto: ContextoFasesAnteriores
): ResultadoSimulado {
  const minutosPacienteNovo = state.premissas.minutosPacienteNovo ?? 90;
  const minutosPacienteAtivo = state.premissas.minutosPacienteAtivo ?? 45;

  // 1. Card 1 + Card 1B combinados
  const novosViaLeads = state.card1Ativo ? Math.max(0, state.novosPacientesQuantidade) : 0;
  const novosViaIndicacao = (state.card1Ativo && state.card1BAtivo) ? Math.max(0, state.indicacaoQuantidade) : 0;
  const novosPacientesTotal = novosViaLeads + novosViaIndicacao;

  const taxaConversaoBase = contexto.taxaConversaoGeral > 0 ? contexto.taxaConversaoGeral : 20;
  const melhoraComercial = state.card5ApoioComercialAtivo ? (state.card5MelhoraConversaoPercentual || 0) : 0;
  const taxaConversaoEfetiva = Math.max(0.1, taxaConversaoBase + melhoraComercial);

  // Leads necessários: divisão apenas pelos novos via leads (indicação não consome lead)
  const leadsNecessariosMes = novosViaLeads > 0
    ? Math.ceil(novosViaLeads / (taxaConversaoEfetiva / 100))
    : 0;

  let receitaBloco1 = 0;
  if (state.card1Ativo && novosPacientesTotal > 0) {
    if (state.novosPacientesDistribuicao && state.novosPacientesDistribuicao.length > 0) {
      const somaDistribuicao = state.novosPacientesDistribuicao.reduce((a, b) => a + (b.quantidade || 0), 0);
      if (somaDistribuicao > 0) {
        for (const dist of state.novosPacientesDistribuicao) {
          const srv = contexto.servicos.find((s) => s.id === dist.servicoId);
          const preco = srv ? srv.precoVenda : contexto.ticketMedioAtual;
          receitaBloco1 += (dist.quantidade || 0) * preco;
        }
      } else {
        receitaBloco1 = novosPacientesTotal * contexto.ticketMedioAtual;
      }
    } else {
      receitaBloco1 = novosPacientesTotal * contexto.ticketMedioAtual;
    }
  }

  const horasBloco1 = state.card1Ativo ? (novosPacientesTotal * minutosPacienteNovo) / 60 : 0;

  // 2. Card 2 (Reajuste da Base)
  let receitaBloco2 = 0;
  let horasBloco2 = 0;
  let baseAntigosRestante = 0;
  let baseSaindo = 0;

  if (contexto.baseAtivosAtual > 0) {
    if (state.card2Ativo) {
      const taxaSaida = Math.min(100, Math.max(0, state.taxaSaidaEsperadaPercentual || 0)) / 100;
      baseAntigosRestante = Math.floor(contexto.baseAtivosAtual * (1 - taxaSaida));
      baseSaindo = contexto.baseAtivosAtual - baseAntigosRestante;
      const precoNovo = contexto.ticketMedioAtual + (state.reajusteValorReais || 0);
      receitaBloco2 = baseAntigosRestante * precoNovo;
      horasBloco2 = (baseAntigosRestante * minutosPacienteAtivo) / 60;
    } else {
      baseAntigosRestante = contexto.baseAtivosAtual;
      baseSaindo = 0;
      receitaBloco2 = contexto.baseAtivosAtual * contexto.ticketMedioAtual;
      horasBloco2 = (contexto.baseAtivosAtual * minutosPacienteAtivo) / 60;
    }
  }

  // 3. Card 3 (Migração de Planos)
  let receitaBloco3 = 0;
  if (state.card3Ativo && state.planoDestinoServicoId && state.quantidadeMigrar > 0) {
    const srvDestino = contexto.servicos.find((s) => s.id === state.planoDestinoServicoId);
    const precoDestino = srvDestino ? srvDestino.precoVenda : contexto.ticketMedioAtual;
    receitaBloco3 = state.quantidadeMigrar * precoDestino;
  }
  // horasBloco3 = 0

  // 4. Card 4A (Funil de Manutenção)
  let pacientesManutencaoLinha1 = 0;
  let pacientesManutencaoLinha2 = 0;

  if (state.card4ALinha1Ativa && baseSaindo > 0) {
    const taxaAceite1 = Math.min(100, Math.max(0, state.card4ALinha1TaxaAceitacaoPercentual || 0)) / 100;
    pacientesManutencaoLinha1 = Math.ceil(baseSaindo * taxaAceite1);
  }

  if (state.card4ALinha2Ativa && state.card4ALinha2PacientesDeAltaQuantidade > 0) {
    const taxaAceite2 = Math.min(100, Math.max(0, state.card4ALinha2TaxaAceitacaoPercentual || 0)) / 100;
    pacientesManutencaoLinha2 = Math.ceil(state.card4ALinha2PacientesDeAltaQuantidade * taxaAceite2);
  }

  const totalManutencao = pacientesManutencaoLinha1 + pacientesManutencaoLinha2;
  const receitaBloco4A = totalManutencao * (contexto.ticketMedioAtual * 0.40);
  const horasBloco4A = (totalManutencao * (minutosPacienteAtivo * 0.5)) / 60;

  // 5. Card 4B (Produtos de Ecossistema)
  let receitaBloco4B = 0;
  let horasBloco4B = 0;
  if (state.card4BAtivo && state.card4BOfertas && state.card4BOfertas.length > 0) {
    for (const oferta of state.card4BOfertas) {
      if (oferta.quantidadeEstimada > 0) {
        receitaBloco4B += oferta.quantidadeEstimada * oferta.precoUnitario;
        horasBloco4B += (oferta.quantidadeEstimada * minutosPacienteAtivo * 0.3) / 60;
      }
    }
  }

  // 6. Card 5 (Equipe de Apoio)
  let custosEquipeApoio = 0;
  if (state.card5ApoioOperacionalAtivo) custosEquipeApoio += state.card5CustoOperacionalReais || 0;
  if (state.card5ApoioComercialAtivo) custosEquipeApoio += state.card5CustoComercialReais || 0;
  if (state.card5ApoioGestaoAtivo) custosEquipeApoio += state.card5CustoGestaoReais || 0;

  const horasAbsorvidasEquipe = state.card5ApoioOperacionalAtivo ? (state.card5HorasAbsorvidasOperacional || 0) : 0;
  const horasConsumidasGestaoEquipe = (state.card5ApoioOperacionalAtivo || state.card5ApoioComercialAtivo)
    ? (state.card5HorasGestaoDaEquipe || 0)
    : 0;

  // 7. Card 6 (Resgate de Inativos)
  let receitaBloco6 = 0;
  let horasBloco6 = 0;
  let pacientesResgatados = 0;

  if (state.card6Ativo && state.quantidadeResgatar > 0) {
    const taxaSucesso = Math.min(100, Math.max(0, state.taxaSucessoPercentual || 0)) / 100;
    pacientesResgatados = Math.ceil(state.quantidadeResgatar * taxaSucesso);
    receitaBloco6 = pacientesResgatados * contexto.ticketMedioAtual;
    horasBloco6 = (pacientesResgatados * minutosPacienteNovo) / 60;
  }

  // Agregação final
  const receitaSimuladaMensal = Math.floor(
    receitaBloco1 + receitaBloco2 + receitaBloco3 + receitaBloco4A + receitaBloco4B + receitaBloco6
  );

  const horasBrutasMensais = horasBloco1 + horasBloco2 + horasBloco4A + horasBloco4B + horasBloco6;
  const horasSimuladasMensais = Math.max(
    0,
    horasBrutasMensais - horasAbsorvidasEquipe + horasConsumidasGestaoEquipe
  );

  const cargaHorariaSemanalExigida = Number((horasSimuladasMensais / 4.33).toFixed(1));

  const totalPacientesSimulados =
    (state.card1Ativo ? novosPacientesTotal : 0) +
    baseAntigosRestante +
    totalManutencao +
    pacientesResgatados;

  const impostos = state.premissas.impostosPercentual ?? 0;
  const taxaCartao = state.premissas.taxaCartaoPercentual ?? 0;
  const taxaAntecipacao = state.formaRecebimento === 'antecipado' ? (state.premissas.taxaAntecipacaoPercentual ?? 0) : 0;

  const deducaoPercentualSobreVenda = impostos + taxaCartao + taxaAntecipacao;

  const custoEntregaTotalReais = Math.floor(contexto.custoEntregaUnitario * totalPacientesSimulados);

  const receitaAposDeducoes = receitaSimuladaMensal * (1 - deducaoPercentualSobreVenda / 100);
  const lucroLiquidoSimulado = Math.floor(
    receitaAposDeducoes - contexto.custosFixosTotais - custosEquipeApoio - custoEntregaTotalReais
  );

  const bateuNumeroMagico = lucroLiquidoSimulado >= state.numeroMagico;
  const respeitouTetoSemanaPerfeita = cargaHorariaSemanalExigida <= state.tetoSemanaPerfeita;

  return {
    receitaSimuladaMensal,
    horasSimuladasMensais,
    cargaHorariaSemanalExigida,
    leadsNecessariosMes,
    totalPacientesSimulados,
    custoEntregaTotalReais,
    lucroLiquidoSimulado,
    bateuNumeroMagico,
    respeitouTetoSemanaPerfeita,
  };
}
