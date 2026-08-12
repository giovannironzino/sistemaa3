// retroalimentarSistemaService.ts
// Serviço de Retroalimentação Automática (Back-Propagation) do Eixo 09 para os Eixos 02 a 08 e Fase 2 de Execução.

import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import type { SimuladorState, ResultadoSimulado } from '../eixo09.types';
import type { ContextoFasesAnteriores } from './obterContextoFasesAnteriores';

export interface OpcoesAplicacaoMetas {
  atualizarMetaLeadsEixo02: boolean;
  atualizarPrecosEixo04: boolean;
  atualizarAgendaEixo06: boolean;
  atualizarEquipeEixo07: boolean;
  atualizarDreEixo08: boolean;
  gerarChecklistFase2: boolean;
}

export const OPCOES_APLICACAO_PADRAO: OpcoesAplicacaoMetas = {
  atualizarMetaLeadsEixo02: true,
  atualizarPrecosEixo04: true,
  atualizarAgendaEixo06: true,
  atualizarEquipeEixo07: true,
  atualizarDreEixo08: true,
  gerarChecklistFase2: true,
};

export async function aplicarMetasSimuladasNoSistema(
  uid: string,
  state: SimuladorState,
  resultado: ResultadoSimulado,
  contexto: ContextoFasesAnteriores,
  opcoes: OpcoesAplicacaoMetas = OPCOES_APLICACAO_PADRAO
): Promise<{ sucesso: boolean; mensagem: string }> {
  try {
    const clientRef = doc(db, 'clients', uid);
    const snap = await getDoc(clientRef);
    const data = snap.exists() ? snap.data() : {};
    const updates: Record<string, any> = {};
    const dataIso = new Date().toISOString();

    // 1. Retroalimentação no Eixo 02 (Captação)
    if (opcoes.atualizarMetaLeadsEixo02) {
      const f2Atual = data.fase02 || {};
      updates.fase02 = {
        ...f2Atual,
        metaLeadsMensaisSimulado: resultado.leadsNecessariosMes,
        metaTaxaConversaoSimulado: (f2Atual.taxaConversaoGeral || 20) + (state.card5ApoioComercialAtivo ? (state.card5MelhoraConversaoPercentual || 0) : 0),
        atualizadoEm: dataIso,
      };
    }

    // 2. Retroalimentação no Eixo 04 (Serviços)
    if (opcoes.atualizarPrecosEixo04 && state.card2Ativo && state.reajusteValorReais > 0) {
      const f4Atual = data.fase04 || {};
      const servicosAtuais = Array.isArray(f4Atual.servicos) ? f4Atual.servicos : (contexto.servicos || []);
      const servicosReajustados = servicosAtuais.map((s: any) => ({
        ...s,
        precoVendaMetaA3: (Number(s.precoVenda || s.price || 0)) + state.reajusteValorReais,
      }));
      updates.fase04 = {
        ...f4Atual,
        servicos: servicosReajustados,
        atualizadoEm: dataIso,
      };
    }

    // 3. Retroalimentação no Eixo 06 (Agenda)
    if (opcoes.atualizarAgendaEixo06) {
      const f6Atual = data.fase06 || {};
      updates.fase06 = {
        ...f6Atual,
        tetoSemanaPerfeitaMetaA3: state.tetoSemanaPerfeita,
        cargaHorariaSemanalEstimadaA3: resultado.cargaHorariaSemanalExigida,
        atualizadoEm: dataIso,
      };
    }

    // 4. Retroalimentação no Eixo 07 (Equipe)
    if (opcoes.atualizarEquipeEixo07 && (state.card5ApoioOperacionalAtivo || state.card5ApoioComercialAtivo || state.card5ApoioGestaoAtivo)) {
      const f7Atual = data.fase07 || {};
      const vagasPlanejadas: string[] = [];
      if (state.card5ApoioOperacionalAtivo) vagasPlanejadas.push('Assistente Operacional / Nutri Assistente');
      if (state.card5ApoioComercialAtivo) vagasPlanejadas.push('Secretária Comercial / Closer');
      if (state.card5ApoioGestaoAtivo) vagasPlanejadas.push('Gerente de Operações');

      updates.fase07 = {
        ...f7Atual,
        vagasPlanejadasSimuladas: vagasPlanejadas,
        custoAdicionalFolhaSimulado: (state.card5ApoioOperacionalAtivo ? state.card5CustoOperacionalReais : 0) +
                                      (state.card5ApoioComercialAtivo ? state.card5CustoComercialReais : 0) +
                                      (state.card5ApoioGestaoAtivo ? state.card5CustoGestaoReais : 0),
        atualizadoEm: dataIso,
      };
    }

    // 5. Retroalimentação no Eixo 08 (Financeiro)
    if (opcoes.atualizarDreEixo08) {
      const f8Atual = data.fase08 || {};
      updates.fase08 = {
        ...f8Atual,
        metaReceitaMensalA3: state.metaFaturamentoBrutoReais ?? resultado.receitaSimuladaMensal,
        metaLucroLiquidoMensalA3: state.metaLucroLiquidoReais ?? resultado.lucroLiquidoSimulado,
        metaNumeroMagicoA3: state.numeroMagico,
        prazoMesesMetaA3: state.prazoMeses || 1,
        narrativaMaterializacaoSonho: resultado.narrativaMaterializacaoSonho,
        atualizadoEm: dataIso,
      };
    }

    // 6. Retroalimentação na Fase 2 (Execução)
    if (opcoes.gerarChecklistFase2) {
      const weekPlansAtuais = data.weekPlans || {};
      const novosPlanosMeta = {
        ...weekPlansAtuais,
        metaGeralA3: {
          numeroMagico: state.numeroMagico,
          lucroAlvo: resultado.lucroLiquidoSimulado,
          receitaAlvo: resultado.receitaSimuladaMensal,
          leadsMetaMes: resultado.leadsNecessariosMes,
          scoreExequibilidade: resultado.scoreExequibilidadeA3,
          classificacao: resultado.classificacaoExequibilidade,
          definidaEm: dataIso,
        },
      };
      updates.weekPlans = novosPlanosMeta;
    }

    // Grava também o snapshot da simulação ativa no Eixo 09
    updates.fase09 = {
      ...(data.fase09 || {}),
      simulacaoAtiva: {
        estado: state,
        resultado,
        aplicadaEm: dataIso,
      },
      atualizadoEm: dataIso,
    };

    if (snap.exists()) {
      await updateDoc(clientRef, updates);
    } else {
      await setDoc(clientRef, updates, { merge: true });
    }

    return {
      sucesso: true,
      mensagem: `Metas A3 aplicadas com sucesso! Todos os eixos selecionados foram atualizados e sincronizados.`,
    };
  } catch (err: any) {
    console.error('[retroalimentarSistemaService] Erro ao aplicar metas:', err);
    return {
      sucesso: false,
      mensagem: `Erro ao aplicar metas no sistema: ${err?.message || 'Falha desconhecida.'}`,
    };
  }
}
