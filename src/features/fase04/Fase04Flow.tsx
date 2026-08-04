// Fase04Flow.tsx
// Orquestrador do fluxo da Fase 04 — Serviços & Modelagem (Arquitetura da Oferta).
// Máquina de estados que gerencia a navegação entre as telas.
//
// Persistência: clients/{uid} campo "fase04" (mesmo padrão das fases anteriores).
// Não depende de nenhuma outra fase (B.0).

import React, { useState, useCallback } from 'react';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

import type {
  Fase04State,
  ServicoInstancia,
  ResumoServicos,
  QuantosFormatosDeclarado,
  FormatoComercialId,
  FormaPagamentoId,
  ParcelamentoId,
  ModalidadeId,
  DuracaoContratoId,
  MecanismoContinuidadeId,
} from './fase04.types';

import { calcularResumoServicos } from './lib/calcularResumoServicos';
import { ArrowLeft } from 'lucide-react';

import TelaAbertura from './telas/TelaAbertura';
import Tela11IdentificacaoFormato from './telas/Tela11IdentificacaoFormato';
import Tela12Precificacao from './telas/Tela12Precificacao';
import Tela13DuracaoCarteira from './telas/Tela13DuracaoCarteira';
import TelaDecisaoLoop from './telas/TelaDecisaoLoop';
import Tela2CarroChefe from './telas/Tela2CarroChefe';
import Tela3Continuidade from './telas/Tela3Continuidade';
import TelaFinalRetrato from './telas/TelaFinalRetrato';

// ---------------------------------------------------------------------------
// Tipos internos da máquina de estados
// ---------------------------------------------------------------------------

type FlowStep =
  | { screen: 'abertura' }
  | { screen: 'tela11' }
  | { screen: 'tela12' }
  | { screen: 'tela13' }
  | { screen: 'decisao_loop'; nomeCadastrado: string }
  | { screen: 'tela2_carrochefe' }
  | { screen: 'tela3_continuidade' }
  | { screen: 'tela_final' };

// Rascunho do serviço em cadastro, acumulado ao longo das Telas 1.1 → 1.2 → 1.3
interface ServicoDraft {
  nomeComercial?: string;
  formatoComercial?: FormatoComercialId;
  precoVenda?: number;
  formasPagamento?: FormaPagamentoId[];
  parcelamentoMaximo?: ParcelamentoId;
}

// ---------------------------------------------------------------------------
// Persistência — caminho: clients/{uid} campo "fase04"
// Segue a mesma convenção das fases anteriores.
// ---------------------------------------------------------------------------

function buildInitialState(): Fase04State {
  return {
    quantosFormatosDeclarado: null,
    servicos: [],
    carroChefeId: null,
    mecanismoContinuidade: null,
    fase04Completa: false,
    atualizadoEm: new Date().toISOString(),
  };
}

async function persistirFase04(uid: string, state: Fase04State): Promise<void> {
  try {
    const clientDocRef = doc(db, 'clients', uid);
    const snap = await getDoc(clientDocRef);
    if (snap.exists()) {
      await updateDoc(clientDocRef, { fase04: state });
    } else {
      await setDoc(clientDocRef, { fase04: state }, { merge: true });
    }
  } catch (err) {
    console.error('[Fase04Flow] Erro ao persistir Fase04State:', err);
  }
}

/**
 * Persiste ResumoServicos como subcampo de fase04 no doc do cliente.
 * Segue a mesma convenção de persistirResumoCaptacaoFase02 / persistirResumoComercialFase03,
 * permitindo que eixos futuros (Agenda, Financeiro, Metas) leiam
 * clients/{uid}.fase04.ResumoServicos diretamente.
 */
async function persistirResumoServicosFase04(uid: string, resumo: ResumoServicos): Promise<void> {
  try {
    const clientDocRef = doc(db, 'clients', uid);
    const snap = await getDoc(clientDocRef);
    if (snap.exists()) {
      await updateDoc(clientDocRef, { 'fase04.ResumoServicos': resumo });
    } else {
      await setDoc(clientDocRef, { fase04: { ResumoServicos: resumo } }, { merge: true });
    }
  } catch (err) {
    console.error('[Fase04Flow] Erro ao persistir ResumoServicos:', err);
  }
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Fase04FlowProps {
  uid: string;
  initialState?: Fase04State | null;
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export default function Fase04Flow({ uid, initialState }: Fase04FlowProps) {
  const [state, setStateRaw] = useState<Fase04State>(() => initialState ?? buildInitialState());

  // Modo de edição real (A.4): mesmo com fase04Completa === true, o fluxo sempre
  // reabre na Tela de Abertura. Serviços já cadastrados não são editáveis/excluíveis
  // nesta versão (B.6.5) — reabrir permite adicionar mais serviços e refazer as
  // escolhas de carro-chefe / continuidade.
  const [step, setStep] = useState<FlowStep>({ screen: 'abertura' });

  // Rascunho do serviço em cadastro (não persistido até a Tela 1.3 concluir)
  const [draft, setDraft] = useState<ServicoDraft | null>(null);

  // Persiste e atualiza o estado local — carimba atualizadoEm a cada gravação (A.4 / A.4.1)
  const setState = useCallback(
    (updater: (prev: Fase04State) => Fase04State) => {
      setStateRaw((prev) => {
        const next = { ...updater(prev), atualizadoEm: new Date().toISOString() };
        persistirFase04(uid, next);
        return next;
      });
    },
    [uid]
  );

  // ─── Botão "Voltar" — mapeamento explícito (não pilha de histórico) ──────
  // servicos é uma lista "append-only": um item commitado na Tela 1.3 não é
  // editável nesta versão (B.6.5). Por isso nunca voltamos para dentro de um
  // cadastro já commitado — o alvo de cada tela é calculado, não empilhado.
  function getVoltarTarget(): FlowStep | null {
    const ultimoServico = state.servicos[state.servicos.length - 1];
    switch (step.screen) {
      case 'tela11':
        return state.servicos.length === 0
          ? { screen: 'abertura' }
          : { screen: 'decisao_loop', nomeCadastrado: ultimoServico.nomeComercial };
      case 'tela12':
        return { screen: 'tela11' };
      case 'tela13':
        return { screen: 'tela12' };
      case 'tela2_carrochefe':
        return { screen: 'decisao_loop', nomeCadastrado: ultimoServico.nomeComercial };
      case 'tela3_continuidade':
        return state.servicos.length >= 2
          ? { screen: 'tela2_carrochefe' }
          : { screen: 'decisao_loop', nomeCadastrado: ultimoServico.nomeComercial };
      case 'tela_final':
        return { screen: 'tela3_continuidade' };
      default:
        // 'abertura' e 'decisao_loop': sem volta — decisao_loop já representa
        // um serviço commitado (B.6.5); abertura é a primeira tela da fase.
        return null;
    }
  }

  function handleVoltar() {
    const alvo = getVoltarTarget();
    if (alvo) setStep(alvo);
  }

  // ─── Handlers ────────────────────────────────────────────────────────────

  // TELA DE ABERTURA → salva quantosFormatosDeclarado, vai para Tela 1.1
  function handleAberturaAvancar(quantos: QuantosFormatosDeclarado) {
    setState((prev) => ({ ...prev, quantosFormatosDeclarado: quantos }));
    setDraft(null);
    setStep({ screen: 'tela11' });
  }

  // TELA 1.1 → guarda nome + formato no rascunho, vai para Tela 1.2
  function handleTela11Avancar(nomeComercial: string, formatoComercial: FormatoComercialId) {
    setDraft({ nomeComercial, formatoComercial });
    setStep({ screen: 'tela12' });
  }

  // TELA 1.2 → guarda preço + pagamento no rascunho, vai para Tela 1.3
  function handleTela12Avancar(
    precoVenda: number,
    formasPagamento: FormaPagamentoId[],
    parcelamentoMaximo: ParcelamentoId
  ) {
    setDraft((prev) => ({ ...prev, precoVenda, formasPagamento, parcelamentoMaximo }));
    setStep({ screen: 'tela13' });
  }

  // TELA 1.3 → conclui o rascunho, gera id/criadoEm/atualizadoEm, adiciona a servicos
  function handleTela13Avancar(
    modalidade: ModalidadeId,
    duracaoContrato: DuracaoContratoId,
    pacientesAtivosVigentes: number,
    vendasRealizadas90Dias: number
  ) {
    if (
      !draft ||
      !draft.nomeComercial ||
      !draft.formatoComercial ||
      draft.precoVenda === undefined ||
      !draft.formasPagamento ||
      !draft.parcelamentoMaximo
    ) {
      return; // não deveria acontecer no fluxo normal
    }

    const agora = new Date().toISOString();
    const novoServico: ServicoInstancia = {
      id: crypto.randomUUID(),
      nomeComercial: draft.nomeComercial,
      formatoComercial: draft.formatoComercial,
      precoVenda: draft.precoVenda,
      formasPagamento: draft.formasPagamento,
      parcelamentoMaximo: draft.parcelamentoMaximo,
      modalidade,
      duracaoContrato,
      pacientesAtivosVigentes,
      vendasRealizadas90Dias,
      criadoEm: agora,
      atualizadoEm: agora,
    };

    setState((prev) => ({ ...prev, servicos: [...prev.servicos, novoServico] }));
    setDraft(null);
    setStep({ screen: 'decisao_loop', nomeCadastrado: novoServico.nomeComercial });
  }

  // TELA DE DECISÃO DO LOOP — cadastrar outro
  function handleDecisaoLoopNovo() {
    setStep({ screen: 'tela11' });
  }

  // TELA DE DECISÃO DO LOOP — concluir (B.6.2 / B.6.3)
  function handleDecisaoLoopConcluir() {
    if (state.servicos.length === 0) return; // trava de segurança (B.6.2)
    if (state.servicos.length === 1) {
      // B.6.3: exatamente 1 serviço — pula a Tela 2, carroChefeId automático
      const unico = state.servicos[0];
      setState((prev) => ({ ...prev, carroChefeId: unico.id }));
      setStep({ screen: 'tela3_continuidade' });
    } else {
      setStep({ screen: 'tela2_carrochefe' });
    }
  }

  // TELA 2 — Carro-Chefe
  function handleTela2Avancar(carroChefeId: string) {
    setState((prev) => ({ ...prev, carroChefeId }));
    setStep({ screen: 'tela3_continuidade' });
  }

  // TELA 3 — Continuidade
  function handleTela3Avancar(mecanismo: MecanismoContinuidadeId) {
    setState((prev) => ({ ...prev, mecanismoContinuidade: mecanismo }));
    setStep({ screen: 'tela_final' });
  }

  // TELA FINAL → marca fase04Completa e persiste ResumoServicos para eixos futuros
  function handleFinalComplete(resumo: ResumoServicos) {
    persistirResumoServicosFase04(uid, resumo);
    setState((prev) => ({ ...prev, fase04Completa: true }));
  }

  // ─── ResumoServicos (calculado sob demanda na tela final) ────────────────
  const resumo: ResumoServicos | null =
    state.servicos.length > 0 && state.carroChefeId && state.mecanismoContinuidade
      ? calcularResumoServicos(state)
      : null;

  const numeroServicoAtual = state.servicos.length + 1;
  const voltarTarget = getVoltarTarget();

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="w-full py-8 px-4">
      {voltarTarget && (
        <div className="w-full max-w-2xl mx-auto mb-3">
          <button
            type="button"
            id="btn_fase04_voltar"
            onClick={handleVoltar}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar
          </button>
        </div>
      )}

      {/* Tela de Abertura */}
      {step.screen === 'abertura' && (
        <TelaAbertura
          initialQuantos={state.quantosFormatosDeclarado}
          onAvancar={handleAberturaAvancar}
        />
      )}

      {/* Tela 1.1 — Identificação e Formato */}
      {step.screen === 'tela11' && (
        <Tela11IdentificacaoFormato
          numeroServico={numeroServicoAtual}
          initialNome={draft?.nomeComercial}
          initialFormato={draft?.formatoComercial}
          onAvancar={handleTela11Avancar}
        />
      )}

      {/* Tela 1.2 — Precificação e Condições Comerciais */}
      {step.screen === 'tela12' && draft?.nomeComercial && (
        <Tela12Precificacao
          nomeComercial={draft.nomeComercial}
          initialPreco={draft.precoVenda}
          initialFormasPagamento={draft.formasPagamento}
          initialParcelamento={draft.parcelamentoMaximo}
          onAvancar={handleTela12Avancar}
        />
      )}

      {/* Tela 1.3 — Duração, Modalidade e Carteira */}
      {step.screen === 'tela13' && draft?.nomeComercial && (
        <Tela13DuracaoCarteira
          nomeComercial={draft.nomeComercial}
          onAvancar={handleTela13Avancar}
        />
      )}

      {/* Tela de Decisão do Loop */}
      {step.screen === 'decisao_loop' && (
        <TelaDecisaoLoop
          nomeComercialCadastrado={step.nomeCadastrado}
          totalServicos={state.servicos.length}
          onNovoServico={handleDecisaoLoopNovo}
          onConcluir={handleDecisaoLoopConcluir}
        />
      )}

      {/* Tela 2 — Carro-Chefe (só quando >= 2 serviços — B.6.3) */}
      {step.screen === 'tela2_carrochefe' && (
        <Tela2CarroChefe
          servicos={state.servicos}
          initialCarroChefeId={state.carroChefeId}
          onAvancar={handleTela2Avancar}
        />
      )}

      {/* Tela 3 — Continuidade */}
      {step.screen === 'tela3_continuidade' && (
        <Tela3Continuidade
          initialMecanismo={state.mecanismoContinuidade}
          onAvancar={handleTela3Avancar}
        />
      )}

      {/* Tela Final — O Retrato de Serviços & Oferta */}
      {step.screen === 'tela_final' && resumo && (
        <TelaFinalRetrato resumo={resumo} onComplete={() => handleFinalComplete(resumo)} />
      )}
    </div>
  );
}
