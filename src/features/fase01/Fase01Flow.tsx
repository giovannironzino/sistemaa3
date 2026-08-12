// Fase01Flow.tsx
// Orquestrador do fluxo da Fase 01 — Promessa & Método (A Experiência Viva de Mapeamento).
// Máquina de estados que gerencia a navegação entre a Central de Mapeamento, a escolha do Método e a Revelação Final.

import React, { useState, useCallback } from 'react';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

import {
  Fase01State,
  VolumePorCluster,
  ClusterId,
  MetodoId,
  PacienteMapeadoEixo01,
} from './fase01.types';
import { CLUSTERS } from './data/bancoDePromessas';

import { ArrowLeft } from 'lucide-react';

import Tela06CentralMapeamento from './telas/Tela06CentralMapeamento';
import Tela5Metodo from './telas/Tela5Metodo';
import TelaFinalResumo from './telas/TelaFinalResumo';

type FlowStep =
  | { screen: 'tela_mapeamento' }
  | { screen: 'tela5' }
  | { screen: 'tela_final' };

function buildInitialState(): Fase01State {
  return {
    volumes: CLUSTERS.map((c) => ({ clusterId: c.id as ClusterId, quantidadePessoas: 0 })),
    clustersQualificados: [],
    promessas: [],
    publicoAlvoFinal: null,
    metodoSelecionado: null,
    pacientesMapeados: [],
    fluxoSemDados: false,
    fase01Completa: false,
    atualizadoEm: new Date().toISOString(),
  };
}

async function persistirFase01(uid: string, state: Fase01State): Promise<void> {
  try {
    const clientDocRef = doc(db, 'clients', uid);
    const snap = await getDoc(clientDocRef);
    if (snap.exists()) {
      await updateDoc(clientDocRef, { fase01: state });
    } else {
      await setDoc(clientDocRef, { fase01: state }, { merge: true });
    }
  } catch (err) {
    console.error('[Fase01Flow] Erro ao persistir Fase01State:', err);
  }
}

interface Fase01FlowProps {
  uid: string;
  initialState?: Fase01State | null;
}

export default function Fase01Flow({ uid, initialState }: Fase01FlowProps) {
  const [state, setStateRaw] = useState<Fase01State>(
    () => initialState ?? buildInitialState()
  );
  const [step, setStep] = useState<FlowStep>(() =>
    initialState?.fase01Completa ? { screen: 'tela_final' } : { screen: 'tela_mapeamento' }
  );

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

  const setState = useCallback(
    (updater: (prev: Fase01State) => Fase01State) => {
      setStateRaw((prev) => {
        const next = { ...updater(prev), atualizadoEm: new Date().toISOString() };
        persistirFase01(uid, next);
        return next;
      });
    },
    [uid]
  );

  // Handlers
  function handleMapeamentoAvancar(pacientes: PacienteMapeadoEixo01[]) {
    // Apuração dos volumes por cluster e dor mais frequente
    const contagem: Record<string, number> = {};
    pacientes.forEach((p) => {
      contagem[p.dorId] = (contagem[p.dorId] || 0) + 1;
    });

    const volumes: VolumePorCluster[] = CLUSTERS.map((c) => ({
      clusterId: c.id as ClusterId,
      quantidadePessoas: contagem[c.id] || 0,
    }));

    const qualificados = Object.keys(contagem).sort(
      (a, b) => contagem[b] - contagem[a]
    ) as ClusterId[];

    const publicoAlvoFinal = qualificados[0] || 'estetica_emagrecimento';

    setState((prev) => ({
      ...prev,
      pacientesMapeados: pacientes,
      volumes,
      clustersQualificados: qualificados,
      publicoAlvoFinal,
    }));

    goToStep({ screen: 'tela5' });
  }

  function handleTela5Escolher(metodoId: MetodoId) {
    setState((prev) => ({ ...prev, metodoSelecionado: metodoId }));
    goToStep({ screen: 'tela_final' });
  }

  function handleFinalComplete() {
    setState((prev) => ({ ...prev, fase01Completa: true }));
  }

  function handleRevisar() {
    setHistory([]);
    setStep({ screen: 'tela_mapeamento' });
  }

  return (
    <div className="w-full py-8 px-4">
      {history.length > 0 && (
        <div className="w-full max-w-6xl mx-auto mb-4">
          <button
            type="button"
            onClick={handleVoltar}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar
          </button>
        </div>
      )}

      {step.screen === 'tela_mapeamento' && (
        <Tela06CentralMapeamento
          pacientesIniciais={state.pacientesMapeados ?? []}
          onAvancar={handleMapeamentoAvancar}
        />
      )}

      {step.screen === 'tela5' && state.publicoAlvoFinal && (
        <Tela5Metodo
          publicoAlvoFinal={state.publicoAlvoFinal}
          promessaSelecionada="Emagrecimento com Saúde e Consistência"
          onEscolher={handleTela5Escolher}
        />
      )}

      {step.screen === 'tela_final' &&
        state.publicoAlvoFinal &&
        state.metodoSelecionado && (
          <TelaFinalResumo
            publicoAlvoFinal={state.publicoAlvoFinal}
            promessaSelecionada="Emagrecimento com Saúde e Consistência"
            metodoSelecionado={state.metodoSelecionado}
            pacientesMapeados={state.pacientesMapeados}
            onComplete={handleFinalComplete}
            onRevisar={handleRevisar}
          />
        )}
    </div>
  );
}
