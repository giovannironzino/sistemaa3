// Fase02Flow.tsx
// Orquestrador do fluxo da Fase 02 — Captação.
// Máquina de estados que gerencia a navegação entre 4 telas + Tela Final.
// Persistência: clients/{uid} campo "fase02" (mesmo padrão da Fase 01).

import React, { useState, useCallback } from 'react';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

import {
  Fase02State,
  ContatoCaptacao,
  ResumoCaptacao,
} from './fase02.types';

import { calcularResumoCaptacao } from './lib/calcularResumoCaptacao';

import { ArrowLeft } from 'lucide-react';

import Tela1Data from './telas/Tela1Data';
import Tela2Formulario from './telas/Tela2Formulario';
import Tela3Painel from './telas/Tela3Painel';
import Tela4Trava from './telas/Tela4Trava';
import TelaFinalVeredito from './telas/TelaFinalVeredito';

// ---------------------------------------------------------------------------
// Tipos internos
// ---------------------------------------------------------------------------

type FlowStep =
  | { screen: 'tela1' }
  | { screen: 'tela2_criacao' }
  | { screen: 'tela2_edicao'; contatoId: string }
  | { screen: 'tela3' }
  | { screen: 'tela4' }
  | { screen: 'tela_final' };

// ---------------------------------------------------------------------------
// Helpers de data
// ---------------------------------------------------------------------------

function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function buildJanelaInicial(): string {
  const d = new Date();
  d.setDate(d.getDate() - 90);
  return toISODate(d);
}

function buildJanelaFinal(): string {
  return toISODate(new Date());
}

function buildInitialState(): Fase02State {
  return {
    janelaInicial: buildJanelaInicial(),
    janelaFinal: buildJanelaFinal(),
    dataEmRevisao: null,
    contatos: [],
    travaConfirmada: false,
    fase02Completa: false,
    atualizadoEm: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Persistência — caminho: clients/{uid} campo "fase02"
// Segue a mesma convenção da Fase 01 (campo aninhado no doc do cliente).
// ---------------------------------------------------------------------------

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
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export default function Fase02Flow({ uid, initialState }: Fase02FlowProps) {
  const [state, setStateRaw] = useState<Fase02State>(() => {
    const base = initialState ?? buildInitialState();
    // Se a janela ainda não foi definida (primeira vez), inicializa agora
    if (!base.janelaInicial || !base.janelaFinal) {
      return buildInitialState();
    }
    // Modo de edição real (A.4): se já existem contatos, a Tela 3 reabre "destravada"
    // localmente (editar/excluir liberados) até uma nova confirmação na Tela 4 —
    // isso não é persistido até o usuário de fato agir de novo.
    if (base.contatos.length > 0) {
      const dataMaisRecente = base.contatos.reduce(
        (max, c) => (c.data > max ? c.data : max),
        base.contatos[0].data
      );
      return {
        ...base,
        travaConfirmada: false,
        dataEmRevisao: base.dataEmRevisao ?? dataMaisRecente,
      };
    }
    return base;
  });

  // Modo de edição real (A.4): com contatos já existentes, reabre direto na Tela 3
  // (painel editável); sem contatos, começa do zero na Tela 1.
  const [step, setStep] = useState<FlowStep>(() => {
    const contatos = initialState?.contatos ?? [];
    if (contatos.length > 0) return { screen: 'tela3' };
    return { screen: 'tela1' };
  });

  // Resumo calculado — só preenchido após confirmação da Tela 4
  const [resumo, setResumo] = useState<ResumoCaptacao | null>(() => {
    if (initialState?.travaConfirmada && initialState?.contatos?.length) {
      return calcularResumoCaptacao(initialState.contatos);
    }
    return null;
  });

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

  // Persiste e atualiza estado local — carimba atualizadoEm a cada gravação (A.4 / A.4.1)
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

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  // TELA 1 — selecionou data, avança para Tela 2 (criação)
  function handleTela1Avancar(data: string) {
    setState((prev) => ({ ...prev, dataEmRevisao: data }));
    goToStep({ screen: 'tela2_criacao' });
  }

  // TELA 2 — salvou contato (criação)
  function handleTela2Salvar(contato: ContatoCaptacao) {
    setState((prev) => {
      const jaExiste = prev.contatos.some((c) => c.id === contato.id);
      const novosContatos = jaExiste
        ? prev.contatos.map((c) => (c.id === contato.id ? contato : c))
        : [...prev.contatos, contato];
      return { ...prev, contatos: novosContatos };
    });
    goToStep({ screen: 'tela3' });
  }

  // TELA 3 — adicionar outro na mesma data
  function handleTela3AdicionarOutro() {
    goToStep({ screen: 'tela2_criacao' });
  }

  // TELA 3 — escolher outra data (volta para Tela 1)
  function handleTela3EscolherOutraData() {
    goToStep({ screen: 'tela1' });
  }

  // TELA 3 — concluir (vai para Tela 4, bloqueado se 0 contatos)
  function handleTela3Concluir() {
    if (state.contatos.length === 0) return;
    goToStep({ screen: 'tela4' });
  }

  // TELA 3 — editar contato
  function handleTela3Editar(contato: ContatoCaptacao) {
    // Garante dataEmRevisao está alinhada com a data do contato que está sendo editado
    setState((prev) => ({ ...prev, dataEmRevisao: contato.data }));
    goToStep({ screen: 'tela2_edicao', contatoId: contato.id });
  }

  // TELA 3 — excluir contato (sem confirmação, per spec 4.3)
  function handleTela3Excluir(id: string) {
    setState((prev) => ({
      ...prev,
      contatos: prev.contatos.filter((c) => c.id !== id),
    }));
  }

  // TELA 4 — confirmar (travar e calcular)
  function handleTela4Confirmar() {
    const resumoCalculado = calcularResumoCaptacao(state.contatos);
    setResumo(resumoCalculado);
    setState((prev) => ({ ...prev, travaConfirmada: true }));
    // Persiste ResumoCaptacao separadamente para que a Fase 03 possa ler
    // totalNaoConvertidos sem recalcular — ver seção 7 da spec da Fase 03.
    persistirResumoCaptacaoFase02(uid, resumoCalculado);
    goToStep({ screen: 'tela_final' });
  }

  // TELA 4 — voltar para Tela 3 sem alterar dados (reaproveita o histórico genérico)
  function handleTela4Voltar() {
    handleVoltar();
  }

  // TELA FINAL — marcar fase02Completa
  function handleFinalComplete() {
    setState((prev) => ({ ...prev, fase02Completa: true }));
  }

  // -------------------------------------------------------------------------
  // Render — máquina de estados
  // -------------------------------------------------------------------------

  // Contato em edição (para Tela 2 em modo edição)
  const contatoEditando =
    step.screen === 'tela2_edicao'
      ? state.contatos.find((c) => c.id === (step as { screen: 'tela2_edicao'; contatoId: string }).contatoId)
      : undefined;

  return (
    <div className="w-full py-8 px-4">
      {history.length > 0 && (
        <div className="w-full max-w-4xl mx-auto mb-3">
          <button
            type="button"
            id="btn_fase02_voltar"
            onClick={handleVoltar}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar
          </button>
        </div>
      )}

      {step.screen === 'tela1' && (
        <Tela1Data
          janelaInicial={state.janelaInicial}
          janelaFinal={state.janelaFinal}
          onAvancar={handleTela1Avancar}
        />
      )}

      {(step.screen === 'tela2_criacao' || step.screen === 'tela2_edicao') &&
        state.dataEmRevisao && (
          <React.Fragment
            key={step.screen === 'tela2_edicao'
              ? `edit-${(step as { screen: 'tela2_edicao'; contatoId: string }).contatoId}`
              : `create-${state.dataEmRevisao}`}
          >
            <Tela2Formulario
              dataEmRevisao={state.dataEmRevisao}
              contatoEditando={contatoEditando}
              onSalvar={handleTela2Salvar}
            />
          </React.Fragment>
        )}

      {step.screen === 'tela3' && state.dataEmRevisao && (
        <Tela3Painel
          dataEmRevisao={state.dataEmRevisao}
          contatos={state.contatos}
          travaConfirmada={state.travaConfirmada}
          onAdicionarOutro={handleTela3AdicionarOutro}
          onEscolherOutraData={handleTela3EscolherOutraData}
          onConcluir={handleTela3Concluir}
          onEditar={handleTela3Editar}
          onExcluir={handleTela3Excluir}
        />
      )}

      {step.screen === 'tela4' && (
        <Tela4Trava
          janelaInicial={state.janelaInicial}
          janelaFinal={state.janelaFinal}
          totalContatos={state.contatos.length}
          onConfirmar={handleTela4Confirmar}
          onVoltar={handleTela4Voltar}
        />
      )}

      {step.screen === 'tela_final' && resumo && (
        <TelaFinalVeredito
          resumo={resumo}
          onComplete={handleFinalComplete}
        />
      )}

      {/* Fallback: tela_final sem resumo (carregamento de initialState com travaConfirmada) */}
      {step.screen === 'tela_final' && !resumo && (
        <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
          Carregando veredito...
        </div>
      )}
    </div>
  );
}
