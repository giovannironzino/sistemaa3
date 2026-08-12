// Fase02Flow.tsx
// Orquestrador do fluxo da Fase 02 — Captação (Painel Único Unificado & Sem Calendário Solto).
// Suporta Modo Rápido por Volume, Modo Detalhado, Perfil de Diversidade e Veredito Reativo na mesma tela.

import React, { useState, useCallback, useMemo } from 'react';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

import { Fase02State, ContatoCaptacao, ResumoCaptacao, CanalOrigemId } from './fase02.types';
import type { ClusterId } from '../fase01/fase01.types';
import { calcularResumoCaptacao } from './lib/calcularResumoCaptacao';
import { isoHoje, addDays } from './lib/calendario';

import TelaLista from './telas/TelaLista';
import TelaFormulario from './telas/TelaFormulario';
import TelaReconciliacao from './telas/TelaReconciliacao';
import TelaVeredito from './telas/TelaVeredito';
import { calcularResumoCaptacao as calcularResumo } from './lib/calcularResumoCaptacao';

type Screen = 'list' | 'form' | 'reconcile' | 'veredito';
type FormReturnScreen = 'list' | 'reconcile';

function buildInitialState(): Fase02State {
  const hoje = isoHoje();
  return {
    janelaInicial: addDays(hoje, -90),
    janelaFinal: hoje,
    dataEmRevisao: hoje,
    contatos: [],
    travaConfirmada: true,
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

interface Fase02FlowProps {
  key?: React.Key;
  uid: string;
  initialState?: Fase02State | null;
  onAvancarCrm?: () => void;
}

export default function Fase02Flow({ uid, initialState, onAvancarCrm }: Fase02FlowProps) {
  const [state, setStateRaw] = useState<Fase02State>(() => {
    const base = initialState ?? buildInitialState();
    const contatosValidos = Array.isArray(base?.contatos) ? base.contatos : [];
    const hoje = isoHoje();
    return {
      janelaInicial: base?.janelaInicial ?? addDays(hoje, -90),
      janelaFinal: base?.janelaFinal ?? hoje,
      dataEmRevisao: base?.dataEmRevisao ?? hoje,
      contatos: contatosValidos,
      travaConfirmada: base?.travaConfirmada ?? true,
      fase02Completa: base?.fase02Completa ?? false,
      atualizadoEm: base?.atualizadoEm ?? new Date().toISOString(),
      totalPacientesSistemaProntuario: base?.totalPacientesSistemaProntuario ?? null,
      reconciliacaoPendenteQuantidade: base?.reconciliacaoPendenteQuantidade ?? 0,
      reconcileAnswer: base?.reconcileAnswer ?? '',
    };
  });

  // O painel de trabalho reabre SEMPRE direto na lista editável por padrão (nunca bloqueia no resumo estático)
  const [screen, setScreen] = useState<Screen>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formReturnScreen, setFormReturnScreen] = useState<FormReturnScreen>('list');

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
      const contatos = jaExiste
        ? prev.contatos.map((c) => (c.id === contato.id ? contato : c))
        : [...prev.contatos, contato];
      const resumoCalc = calcularResumoCaptacao(contatos);
      persistirResumoCaptacaoFase02(uid, resumoCalc);
      return { ...prev, contatos, fase02Completa: true, travaConfirmada: true };
    });
    setEditingId(null);
    setScreen(formReturnScreen);
  }

  function handleBatchSaveCanalVolume(canaisVolumes: Array<{ canalOrigem: CanalOrigemId; totalContatos: number; convertidos: number }>) {
    const novosContatos: ContatoCaptacao[] = [];
    const agora = new Date().toISOString();
    const hojeIso = isoHoje();
    canaisVolumes.forEach(({ canalOrigem, totalContatos, convertidos }) => {
      for (let i = 0; i < totalContatos; i++) {
        const isConverted = i < convertidos;
        novosContatos.push({
          id: crypto.randomUUID(),
          nomeContato: '(volume_rapido)',
          objetivoPrincipal: 'emagrecimento' as ClusterId,
          canalOrigem,
          statusFechamento: isConverted ? 'sim' : 'nao',
          data: hojeIso,
          criadoEm: agora,
          atualizadoEm: agora,
          origemRegistro: 'revisao_whatsapp',
        });
      }
    });

    setState((prev) => {
      const contatosPreservados = prev.contatos.filter(c => c.nomeContato !== '(volume_rapido)');
      const todosContatos = [...contatosPreservados, ...novosContatos];
      const resumoCalc = calcularResumoCaptacao(todosContatos);
      persistirResumoCaptacaoFase02(uid, resumoCalc);
      return { ...prev, contatos: todosContatos, fase02Completa: true, travaConfirmada: true };
    });
  }

  function goConcluir() {
    setState((prev) => {
      const contatos = prev.contatos.length > 0 ? prev.contatos : state.contatos;
      const resumoCalc = calcularResumoCaptacao(contatos);
      persistirResumoCaptacaoFase02(uid, resumoCalc);
      return { ...prev, fase02Completa: true, travaConfirmada: true };
    });
    setScreen('veredito');
  }

  const resumoParaVeredito = useMemo(
    () => (state.contatos.length > 0 ? calcularResumo(state.contatos) : null),
    [state.contatos]
  );

  const contatoEditando = editingId ? state.contatos.find((c) => c.id === editingId) : undefined;
  const contactsForDate = state.contatos.filter((c) => c.data === selectedDate);
  const rangeEnd = isoHoje();
  const rangeStart = addDays(rangeEnd, -89);

  return (
    <div className="w-full max-w-6xl mx-auto py-6">
      {screen === 'list' && (
        <TelaLista
          selectedDate={selectedDate}
          contactsForDate={contactsForDate}
          allContacts={state.contatos}
          totalGeral={state.contatos.length}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          confirmChecked={state.travaConfirmada}
          onToggleConfirm={() => setState((prev) => ({ ...prev, travaConfirmada: !prev.travaConfirmada }))}
          onStartAdd={(mes?: string) => {
            if (mes) setState((prev) => ({ ...prev, dataEmRevisao: mes + '-01' }));
            startAdd('list');
          }}
          onEditar={startEdit}
          onExcluir={excluirContato}
          onConcluir={goConcluir}
          onBatchSaveCanalVolume={handleBatchSaveCanalVolume}
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
          reconcileContacts={state.contatos.filter((c) => c.reconcileAdd)}
          onExcluir={excluirContato}
          onStartAddForgotten={() => startAdd('reconcile')}
          onContinuar={() => setScreen('list')}
          onVoltar={() => setScreen('list')}
        />
      )}

      {screen === 'veredito' && (
        <TelaVeredito
          resumo={resumoParaVeredito}
          onComplete={() => {}}
          onPreencherEixo={() => setScreen('list')}
          onAvancarCrm={() => (onAvancarCrm ? onAvancarCrm() : setScreen('list'))}
          onRevisar={() => setScreen('list')}
        />
      )}
    </div>
  );
}
