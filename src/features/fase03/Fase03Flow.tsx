// Fase03Flow.tsx
// Orquestrador do fluxo da Fase 03 — Vendas (Como Você Atende e Fecha).
// Máquina de estados que gerencia a navegação entre as telas.
//
// Persistência: clients/{uid} campo "fase03" (mesmo padrão das fases anteriores).
// Leitura de totalNaoConvertidos: clients/{uid}.fase02.ResumoCaptacao.totalNaoConvertidos
// Bloqueio: se fase02Completa === false → exibe TelaAbertura em modo bloqueado.

import React, { useState, useCallback } from 'react';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

import type {
  Fase03State,
  DistribuicaoGargalo,
  DistribuicaoObjecao,
  EtapaAtendimentoId,
  AtitudeFollowUp,
  QuantidadeTentativas,
  IntervaloPrimeiroRecontato,
  ConteudoRecontatoId,
  ResumoComercial,
} from './fase03.types';

import { calcularResumoComercial } from './lib/calcularResumoComercial';
import { ArrowLeft } from 'lucide-react';

import TelaAbertura from './telas/TelaAbertura';
import Tela1Gargalo from './telas/Tela1Gargalo';
import Tela2Objecao from './telas/Tela2Objecao';
import Tela3Atendimento from './telas/Tela3Atendimento';
import Tela4FollowUp from './telas/Tela4FollowUp';
import Tela41FollowUpDetalhe from './telas/Tela41FollowUpDetalhe';
import TelaFinalRetrato from './telas/TelaFinalRetrato';

// ---------------------------------------------------------------------------
// Tipos internos da máquina de estados
// ---------------------------------------------------------------------------

type FlowStep =
  | { screen: 'abertura' }
  | { screen: 'tela1' }
  | { screen: 'tela2' }
  | { screen: 'tela3' }
  | { screen: 'tela4' }
  | { screen: 'tela41' }
  | { screen: 'tela_final' };

// ---------------------------------------------------------------------------
// Persistência — caminho: clients/{uid} campo "fase03"
// Segue a mesma convenção das Fases 01 e 02 (campo aninhado no doc do cliente).
// ---------------------------------------------------------------------------

async function persistirFase03(uid: string, state: Fase03State): Promise<void> {
  try {
    const clientDocRef = doc(db, 'clients', uid);
    const snap = await getDoc(clientDocRef);
    if (snap.exists()) {
      await updateDoc(clientDocRef, { fase03: state });
    } else {
      await setDoc(clientDocRef, { fase03: state }, { merge: true });
    }
  } catch (err) {
    console.error('[Fase03Flow] Erro ao persistir Fase03State:', err);
  }
}

/**
 * Persiste ResumoComercial como subcampo de fase03 no doc do cliente.
 * Segue a mesma convenção de persistirResumoCaptacaoFase02 (Fase 02), permitindo
 * que eixos futuros leiam clients/{uid}.fase03.ResumoComercial diretamente.
 */
async function persistirResumoComercialFase03(uid: string, resumo: ResumoComercial): Promise<void> {
  try {
    const clientDocRef = doc(db, 'clients', uid);
    const snap = await getDoc(clientDocRef);
    if (snap.exists()) {
      await updateDoc(clientDocRef, { 'fase03.ResumoComercial': resumo });
    } else {
      await setDoc(clientDocRef, { fase03: { ResumoComercial: resumo } }, { merge: true });
    }
  } catch (err) {
    console.error('[Fase03Flow] Erro ao persistir ResumoComercial:', err);
  }
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Fase03FlowProps {
  uid: string;
  /** Estado persistido da Fase 03 (pode ser null se ainda não existe) */
  initialState?: Fase03State | null;
  /**
   * clientRecord completo — usado para ler fase02.ResumoCaptacao.totalNaoConvertidos
   * sem recalcular e sem solicitar o dado ao usuário (spec regra 0, seção 7).
   */
  clientRecord: any;
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export default function Fase03Flow({ uid, initialState, clientRecord }: Fase03FlowProps) {
  // ─── Verificação de integração cruzada (spec seção 7 e regra 0.7) ────────
  // Lê totalNaoConvertidos diretamente do ResumoCaptacao persistido da Fase 02.
  // Caminho: clients/{uid}.fase02.ResumoCaptacao.totalNaoConvertidos
  // (A Fase 02 persiste ResumoCaptacao como campo do documento da fase02 — ver TelaFinalVeredito.tsx)
  const fase02Completa: boolean = !!(clientRecord?.fase02?.fase02Completa);
  const totalNaoConvertidosFase02: number =
    clientRecord?.fase02?.ResumoCaptacao?.totalNaoConvertidos ?? null;

  // Bloqueio: Fase 02 não concluída
  const bloqueado = !fase02Completa;

  // ─── Inicialização do Fase03State ────────────────────────────────────────
  // Copia totalNaoConvertidos para totalNaoConvertidosRef UMA VEZ (cópia fixa, não reativa).
  // Se a Fase 03 já foi iniciada, usa o valor salvo (não relê da Fase 02 a cada render).

  const buildInitialFase03State = useCallback((): Fase03State => {
    if (initialState) {
      // Estado já existe — usa o valor travado na primeira vez
      return initialState;
    }
    // Primeira inicialização: copia totalNaoConvertidos da Fase 02
    const totalRef = totalNaoConvertidosFase02 ?? 0;
    return {
      totalNaoConvertidosRef: totalRef,
      semNaoConvertidos: totalRef === 0,
      distribuicaoGargalo: null,
      distribuicaoObjecao: null,
      etapasMarcadas: [],
      atitudeFollowUp: null,
      quantidadeTentativas: null,
      intervaloPrimeiroRecontato: null,
      conteudoRecontato: [],
      fase03Completa: false,
      atualizadoEm: new Date().toISOString(),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [state, setStateRaw] = useState<Fase03State>(buildInitialFase03State);

  // Se o eixo já foi concluído, abre direto no Retrato Comercial (Tela Final). O
  // usuário pode entrar em modo de edição a qualquer momento pelo botão "Revisar"
  // da Tela Final, que reabre a Tela de Abertura permitindo alterar qualquer resposta.
  const [step, setStep] = useState<FlowStep>(() =>
    initialState?.fase03Completa ? { screen: 'tela_final' } : { screen: 'abertura' }
  );

  // Histórico de telas visitadas nesta sessão — permite o botão "Voltar".
  const [history, setHistory] = useState<FlowStep[]>([]);

  function goToStep(next: FlowStep) {
    setHistory((prev) => [...prev, step]);
    setStep(next);
  }

  function handleVoltar() {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      setStep(prev[prev.length - 1]);
      return prev.slice(0, -1);
    });
  }

  // ─── Persistência centralizada — carimba atualizadoEm a cada gravação (A.4 / A.4.1) ──

  const setState = useCallback(
    (updater: (prev: Fase03State) => Fase03State) => {
      setStateRaw((prev) => {
        const next = { ...updater(prev), atualizadoEm: new Date().toISOString() };
        persistirFase03(uid, next);
        return next;
      });
    },
    [uid]
  );

  // ─── ResumoComercial (calculado sob demanda na tela final) ───────────────
  const resumo = calcularResumoComercial(state);

  // ─── Handlers ────────────────────────────────────────────────────────────

  // TELA DE ABERTURA → avança para Tela 1 ou Tela 3 (caso semNaoConvertidos)
  function handleAberturaAvancar() {
    if (state.semNaoConvertidos) {
      goToStep({ screen: 'tela3' });
    } else {
      goToStep({ screen: 'tela1' });
    }
  }

  // TELA 1 → salva distribuicaoGargalo, vai para Tela 2
  function handleTela1Avancar(distribuicao: DistribuicaoGargalo) {
    setState((prev) => ({ ...prev, distribuicaoGargalo: distribuicao }));
    goToStep({ screen: 'tela2' });
  }

  // TELA 2 → salva distribuicaoObjecao, vai para Tela 3
  function handleTela2Avancar(distribuicao: DistribuicaoObjecao) {
    setState((prev) => ({ ...prev, distribuicaoObjecao: distribuicao }));
    goToStep({ screen: 'tela3' });
  }

  // TELA 3 → salva etapasMarcadas, vai para Tela 4
  function handleTela3Avancar(etapas: EtapaAtendimentoId[]) {
    setState((prev) => ({ ...prev, etapasMarcadas: etapas }));
    goToStep({ screen: 'tela4' });
  }

  // TELA 4 → salva atitudeFollowUp
  // sem_recontato → limpa dados órfãos (caso de borda 6.5) → Tela Final
  // recontato_ativo → Tela 4.1
  function handleTela4Escolher(atitude: AtitudeFollowUp) {
    if (atitude === 'sem_recontato') {
      // Caso de borda 6.5: descartar dados de tela4.1 se existiam
      setState((prev) => ({
        ...prev,
        atitudeFollowUp: 'sem_recontato',
        quantidadeTentativas: null,
        intervaloPrimeiroRecontato: null,
        conteudoRecontato: [],
      }));
      goToStep({ screen: 'tela_final' });
    } else {
      setState((prev) => ({ ...prev, atitudeFollowUp: 'recontato_ativo' }));
      goToStep({ screen: 'tela41' });
    }
  }

  // TELA 4.1 → salva os 3 campos, vai para Tela Final
  function handleTela41Avancar(
    quantidade: QuantidadeTentativas,
    intervalo: IntervaloPrimeiroRecontato,
    conteudo: ConteudoRecontatoId[]
  ) {
    setState((prev) => ({
      ...prev,
      quantidadeTentativas: quantidade,
      intervaloPrimeiroRecontato: intervalo,
      conteudoRecontato: conteudo,
    }));
    goToStep({ screen: 'tela_final' });
  }

  // TELA FINAL → marca fase03Completa e persiste ResumoComercial para eixos futuros
  function handleFinalComplete() {
    persistirResumoComercialFase03(uid, resumo);
    setState((prev) => ({ ...prev, fase03Completa: true }));
  }

  // TELA FINAL — botão "Revisar": entra em modo de edição a partir da Tela de Abertura
  function handleRevisar() {
    setHistory([]);
    setStep({ screen: 'abertura' });
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="w-full py-8 px-4">
      {history.length > 0 && !bloqueado && (
        <div className="w-full max-w-2xl mx-auto mb-3">
          <button
            type="button"
            id="btn_fase03_voltar"
            onClick={handleVoltar}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar
          </button>
        </div>
      )}

      {/* Tela de Abertura (inclui estado de bloqueio quando Fase 02 não concluída) */}
      {step.screen === 'abertura' && (
        <TelaAbertura
          totalNaoConvertidosRef={state.totalNaoConvertidosRef}
          semNaoConvertidos={state.semNaoConvertidos}
          onAvancar={handleAberturaAvancar}
          bloqueado={bloqueado}
        />
      )}

      {/* Tela 1 — Gargalo (só se semNaoConvertidos === false) */}
      {step.screen === 'tela1' && !state.semNaoConvertidos && (
        <Tela1Gargalo
          totalNaoConvertidosRef={state.totalNaoConvertidosRef}
          initialDistribuicao={state.distribuicaoGargalo}
          onAvancar={handleTela1Avancar}
        />
      )}

      {/* Tela 2 — Objeção (só se semNaoConvertidos === false) */}
      {step.screen === 'tela2' && !state.semNaoConvertidos && (
        <Tela2Objecao
          totalNaoConvertidosRef={state.totalNaoConvertidosRef}
          initialDistribuicao={state.distribuicaoObjecao}
          onAvancar={handleTela2Avancar}
        />
      )}

      {/* Tela 3 — Atendimento (sempre exibida) */}
      {step.screen === 'tela3' && (
        <Tela3Atendimento
          initialEtapas={state.etapasMarcadas}
          onAvancar={handleTela3Avancar}
        />
      )}

      {/* Tela 4 — Atitude Follow-Up */}
      {step.screen === 'tela4' && (
        <Tela4FollowUp
          initialAtitude={state.atitudeFollowUp}
          onEscolher={handleTela4Escolher}
        />
      )}

      {/* Tela 4.1 — Detalhamento do Follow-Up */}
      {step.screen === 'tela41' && (
        <Tela41FollowUpDetalhe
          initialQuantidade={state.quantidadeTentativas}
          initialIntervalo={state.intervaloPrimeiroRecontato}
          initialConteudo={state.conteudoRecontato}
          onAvancar={handleTela41Avancar}
        />
      )}

      {/* Tela Final — O Retrato Comercial */}
      {step.screen === 'tela_final' && (
        <TelaFinalRetrato
          state={state}
          resumo={resumo}
          onComplete={handleFinalComplete}
          onRevisar={handleRevisar}
        />
      )}
    </div>
  );
}
