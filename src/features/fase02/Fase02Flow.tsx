// Fase02Flow.tsx
// Orquestrador do fluxo da Fase 02 — Captação (redesign).
// Máquina de estados: Lista (calendário + cadastro do dia, com checkbox de revisão de
// 90 dias) → Reconciliação (pergunta opcional de prontuário + "ficou faltando alguém?")
// → [loop de reconciliação com prontuário, se houver diferença] → Veredito.
// Persistência: clients/{uid} campo "fase02" (mesmo padrão da Fase 01/versão anterior).

import React, { useState, useCallback } from 'react';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

import { Fase02State, ContatoCaptacao, ResumoCaptacao } from './fase02.types';
import { calcularResumoCaptacao } from './lib/calcularResumoCaptacao';
import { isoHoje, addDays } from './lib/calendario';

import CalendarioLateral from './telas/CalendarioLateral';
import TelaLista from './telas/TelaLista';
import TelaFormulario from './telas/TelaFormulario';
import TelaReconciliacao from './telas/TelaReconciliacao';
import TelaVeredito from './telas/TelaVeredito';

// ---------------------------------------------------------------------------
// Tipos internos
// ---------------------------------------------------------------------------

type Screen = 'list' | 'form' | 'reconcile' | 'reconcile_diff' | 'reconcile_loop' | 'veredito';
type FormReturnScreen = 'list' | 'reconcile';

// ---------------------------------------------------------------------------
// Helpers de estado inicial / persistência
// ---------------------------------------------------------------------------

function buildInitialState(): Fase02State {
  const hoje = isoHoje();
  return {
    janelaInicial: addDays(hoje, -90),
    janelaFinal: hoje,
    dataEmRevisao: hoje,
    contatos: [],
    travaConfirmada: false,
    fase02Completa: false,
    atualizadoEm: new Date().toISOString(),
    totalPacientesSistemaProntuario: null,
    reconciliacaoPendenteQuantidade: 0,
    reconcileAnswer: '',
  };
}

async function persistirFase02(uid: string, state: Fase02State): Promise<void> {
  try {
    const clientDocRef = doc(db, 'clients', uid);
    const snap = await getDoc(clientDocRef);
    if (snap.exists()) {
      await updateDoc(clientDocRef, { fase02: state });
    } else {
      await setDoc(clientDocRef, { fase02: state }, { merge: true });
    }
  } catch (err) {
    console.error('[Fase02Flow] Erro ao persistir Fase02State:', err);
  }
}

/**
 * Persiste ResumoCaptacao como subcampo de fase02 no doc do cliente.
 * Isso permite que a Fase 03 leia totalNaoConvertidos diretamente do Firestore
 * (clients/{uid}.fase02.ResumoCaptacao.totalNaoConvertidos) sem precisar
 * recalcular a partir do array de contatos — conforme regra de integração seção 7.
 */
async function persistirResumoCaptacaoFase02(uid: string, resumo: ResumoCaptacao): Promise<void> {
  try {
    const clientDocRef = doc(db, 'clients', uid);
    const snap = await getDoc(clientDocRef);
    if (snap.exists()) {
      await updateDoc(clientDocRef, { 'fase02.ResumoCaptacao': resumo });
    } else {
      await setDoc(clientDocRef, { fase02: { ResumoCaptacao: resumo } }, { merge: true });
    }
  } catch (err) {
    console.error('[Fase02Flow] Erro ao persistir ResumoCaptacao:', err);
  }
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Fase02FlowProps {
  uid: string;
  initialState?: Fase02State | null;
  onAvancarCrm?: () => void;
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export default function Fase02Flow({ uid, initialState, onAvancarCrm }: Fase02FlowProps) {
  const [state, setStateRaw] = useState<Fase02State>(() => {
    const base = initialState ?? buildInitialState();
    if (!base.janelaInicial || !base.janelaFinal) return buildInitialState();
    return {
      ...base,
      dataEmRevisao: base.dataEmRevisao ?? isoHoje(),
      totalPacientesSistemaProntuario: base.totalPacientesSistemaProntuario ?? null,
      reconciliacaoPendenteQuantidade: base.reconciliacaoPendenteQuantidade ?? 0,
      reconcileAnswer: base.reconcileAnswer ?? '',
    };
  });

  // Se o eixo já foi concluído, abre direto no veredito (Tela Final). O usuário
  // pode entrar em modo de edição a qualquer momento pelo botão "Revisar Captação",
  // que reabre a Lista (painel editável). Retoma o loop de reconciliação com
  // prontuário em andamento (caso de borda: nutricionista saiu no meio do cadastro
  // das pessoas faltantes) exatamente de onde parou.
  const [screen, setScreen] = useState<Screen>(() => {
    if (initialState?.fase02Completa) return 'veredito';
    if (initialState && !initialState.travaConfirmada && (initialState.reconciliacaoPendenteQuantidade ?? 0) > 0) {
      const jaReconciliados = (initialState.contatos ?? []).filter(
        (c) => c.origemRegistro === 'reconciliacao_prontuario'
      ).length;
      if (jaReconciliados < (initialState.reconciliacaoPendenteQuantidade ?? 0)) {
        return 'reconcile_loop';
      }
    }
    return 'list';
  });
  const [loopIndex, setLoopIndex] = useState<number>(() => {
    if (initialState && !initialState.travaConfirmada && (initialState.reconciliacaoPendenteQuantidade ?? 0) > 0) {
      return (initialState.contatos ?? []).filter((c) => c.origemRegistro === 'reconciliacao_prontuario').length;
    }
    return 0;
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formReturnScreen, setFormReturnScreen] = useState<FormReturnScreen>('list');

  const [resumo, setResumo] = useState<ResumoCaptacao | null>(() => {
    if ((initialState?.travaConfirmada || initialState?.fase02Completa) && initialState?.contatos?.length) {
      return calcularResumoCaptacao(initialState.contatos);
    }
    return null;
  });

  const setState = useCallback(
    (updater: (prev: Fase02State) => Fase02State) => {
      setStateRaw((prev) => {
        const next = { ...updater(prev), atualizadoEm: new Date().toISOString() };
        persistirFase02(uid, next);
        return next;
      });
    },
    [uid]
  );

  const selectedDate = state.dataEmRevisao ?? isoHoje();

  // -------------------------------------------------------------------------
  // Handlers — Lista / Formulário
  // -------------------------------------------------------------------------

  function selectDate(iso: string) {
    setState((prev) => ({ ...prev, dataEmRevisao: iso }));
    setScreen('list');
  }

  function startAdd(returnScreen: FormReturnScreen) {
    setEditingId(null);
    setFormReturnScreen(returnScreen);
    setScreen('form');
  }

  function startEdit(contato: ContatoCaptacao) {
    setState((prev) => ({ ...prev, dataEmRevisao: contato.data }));
    setEditingId(contato.id);
    setFormReturnScreen('list');
    setScreen('form');
  }

  function excluirContato(id: string) {
    setState((prev) => ({ ...prev, contatos: prev.contatos.filter((c) => c.id !== id) }));
  }

  function salvarContato(contato: ContatoCaptacao) {
    setState((prev) => {
      const jaExiste = prev.contatos.some((c) => c.id === contato.id);
      const contatoFinal = formReturnScreen === 'reconcile' && !jaExiste ? { ...contato, reconcileAdd: true } : contato;
      const contatos = jaExiste
        ? prev.contatos.map((c) => (c.id === contato.id ? contatoFinal : c))
        : [...prev.contatos, contatoFinal];
      return { ...prev, contatos };
    });
    setEditingId(null);
    setScreen(formReturnScreen);
  }

  function goConcluir() {
    if (state.contatos.length === 0 || !state.travaConfirmada) return;
    setScreen('reconcile');
  }

  // -------------------------------------------------------------------------
  // Handlers — Reconciliação (prontuário + "ficou faltando alguém")
  // -------------------------------------------------------------------------

  function finalizarVeredito(contatosFinal: ContatoCaptacao[]) {
    const resumoCalculado = calcularResumoCaptacao(contatosFinal);
    setResumo(resumoCalculado);
    persistirResumoCaptacaoFase02(uid, resumoCalculado);
    setScreen('veredito');
  }

  // Reconciliação · Continuar — recebe o valor opcional do sistema de prontuário
  // (null = deixou em branco). Se houver diferença em relação aos convertidos já
  // cadastrados, inicia o loop guiado de cadastro pessoa a pessoa antes do veredito.
  function reconcileContinuar(prontuarioValor: number | null) {
    const totalConvertidos = state.contatos.filter((c) => c.statusFechamento === 'sim').length;
    if (prontuarioValor === null) {
      setState((prev) => ({ ...prev, totalPacientesSistemaProntuario: null, reconciliacaoPendenteQuantidade: 0 }));
      finalizarVeredito(state.contatos);
      return;
    }
    const diferenca = Math.max(0, prontuarioValor - totalConvertidos);
    setState((prev) => ({
      ...prev,
      totalPacientesSistemaProntuario: prontuarioValor,
      reconciliacaoPendenteQuantidade: diferenca,
    }));
    if (diferenca === 0) {
      finalizarVeredito(state.contatos);
      return;
    }
    setScreen('reconcile_diff');
  }

  function iniciarLoopReconciliacao() {
    setLoopIndex(0);
    setScreen('reconcile_loop');
  }

  // Loop de reconciliação com prontuário — salvou uma pessoa (index atual do loop)
  function salvarPessoaLoopReconciliacao(contato: ContatoCaptacao) {
    const contatosFinal = [...state.contatos, contato];
    const proximoIndex = loopIndex + 1;
    setState((prev) => ({ ...prev, contatos: contatosFinal }));
    if (proximoIndex < state.reconciliacaoPendenteQuantidade) {
      setLoopIndex(proximoIndex);
      return;
    }
    finalizarVeredito(contatosFinal);
  }

  function handleFinalComplete() {
    if (!state.fase02Completa) {
      setState((prev) => ({ ...prev, fase02Completa: true, travaConfirmada: true }));
    }
  }

  // Veredito · "Revisar Captação" — volta para a Lista em modo de edição
  function handleRevisar() {
    setScreen('list');
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  const contatoEditando = editingId ? state.contatos.find((c) => c.id === editingId) : undefined;
  const contactsForDate = state.contatos
    .filter((c) => c.data === selectedDate)
    .sort((a, b) => (a.criadoEm < b.criadoEm ? 1 : -1));
  const datasComCadastro = new Set<string>(state.contatos.map((c) => c.data));
  const rangeEnd = isoHoje();
  const rangeStart = addDays(rangeEnd, -89);
  const reconcileContacts = state.contatos.filter((c) => c.reconcileAdd).sort((a, b) => (a.criadoEm < b.criadoEm ? 1 : -1));
  const totalConvertidosAtual = state.contatos.filter((c) => c.statusFechamento === 'sim').length;

  const showCalendar = screen === 'list' || screen === 'form' || screen === 'reconcile';

  return (
    <div className="w-full" style={{ minHeight: '100%' }}>
      <div className="flex items-start gap-6 flex-col md:flex-row">
        {showCalendar && (
          <CalendarioLateral datasComCadastro={datasComCadastro} selectedDate={selectedDate} onSelectDate={selectDate} />
        )}

        <div className="flex-1 min-w-0" style={{ maxWidth: 820 }}>
          {screen === 'list' && (
            <TelaLista
              selectedDate={selectedDate}
              contactsForDate={contactsForDate}
              totalGeral={state.contatos.length}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              confirmChecked={state.travaConfirmada}
              onToggleConfirm={() => setState((prev) => ({ ...prev, travaConfirmada: !prev.travaConfirmada }))}
              onStartAdd={() => startAdd('list')}
              onEditar={startEdit}
              onExcluir={excluirContato}
              onConcluir={goConcluir}
            />
          )}

          {screen === 'form' && (
            <TelaFormulario
              selectedDate={selectedDate}
              contatoEditando={contatoEditando}
              onSalvar={salvarContato}
              onVoltar={() => setScreen(formReturnScreen)}
            />
          )}

          {screen === 'reconcile' && (
            <TelaReconciliacao
              prontuarioCount={state.totalPacientesSistemaProntuario === null ? '' : String(state.totalPacientesSistemaProntuario)}
              onSetProntuarioCount={(v) =>
                setState((prev) => ({ ...prev, totalPacientesSistemaProntuario: v === '' ? null : Number(v) }))
              }
              reconcileAnswer={state.reconcileAnswer ?? ''}
              onSetReconcileAnswer={(v) => setState((prev) => ({ ...prev, reconcileAnswer: v }))}
              reconcileContacts={reconcileContacts}
              onExcluir={excluirContato}
              onStartAddForgotten={() => startAdd('reconcile')}
              onContinuar={() =>
                reconcileContinuar(
                  state.totalPacientesSistemaProntuario === null ? null : state.totalPacientesSistemaProntuario
                )
              }
              onVoltar={() => setScreen('list')}
            />
          )}

          {screen === 'reconcile_diff' && (
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.4, marginBottom: 22 }}>
                Você achou <span style={{ color: '#4ade80' }}>{totalConvertidosAtual}</span> pacientes revisando o
                WhatsApp, mas seu sistema mostra{' '}
                <span style={{ color: '#38bdf8' }}>{state.totalPacientesSistemaProntuario}</span> pacientes novos no
                período. Isso quer dizer que{' '}
                <span style={{ color: '#a596ff', fontWeight: 700 }}>
                  {state.reconciliacaoPendenteQuantidade}{' '}
                  {state.reconciliacaoPendenteQuantidade === 1 ? 'pessoa veio' : 'pessoas vieram'}
                </span>{' '}
                por um caminho que essa revisão não capturou. Vamos cadastrar rapidamente essas pessoas também, uma
                por uma.
              </div>
              <div
                onClick={iniciarLoopReconciliacao}
                style={{ background: 'linear-gradient(135deg,#6d5ef8,#4f3fd6)', borderRadius: 12, padding: '16px 18px', fontSize: 14, fontWeight: 700, cursor: 'pointer', textAlign: 'center', color: '#fff' }}
              >
                Cadastrar as {state.reconciliacaoPendenteQuantidade}{' '}
                {state.reconciliacaoPendenteQuantidade === 1 ? 'pessoa' : 'pessoas'} que faltam
              </div>
            </div>
          )}

          {screen === 'reconcile_loop' && (
            <React.Fragment key={`reconciliacao-${loopIndex}`}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.04em', color: '#38bdf8', textTransform: 'uppercase', marginBottom: 12 }}>
                Reconciliação de prontuário: pessoa {loopIndex + 1} de {state.reconciliacaoPendenteQuantidade}
              </div>
              <TelaFormulario
                selectedDate={state.janelaFinal}
                onSalvar={salvarPessoaLoopReconciliacao}
                onVoltar={() => setScreen('reconcile')}
                modoReconciliacao
              />
            </React.Fragment>
          )}

          {screen === 'veredito' && (
            <TelaVeredito
              resumo={resumo}
              onComplete={handleFinalComplete}
              onPreencherEixo={() => setScreen('list')}
              onAvancarCrm={() => (onAvancarCrm ? onAvancarCrm() : undefined)}
              onRevisar={handleRevisar}
            />
          )}
        </div>
      </div>
    </div>
  );
}
