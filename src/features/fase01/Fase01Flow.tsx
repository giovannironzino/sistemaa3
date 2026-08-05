// Fase01Flow.tsx
// Orquestrador do fluxo da Fase 01 — Promessa & Método (O Retrato e a Direção).
// Máquina de estados que gerencia a navegação entre as 6 telas.
// Persiste Fase01State no Firestore em: clients/{uid}/fase01 (campo aninhado no doc do cliente).

import React, { useState, useCallback } from 'react';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

import {
  Fase01State,
  VolumePorCluster,
  PromessaPorCluster,
  ClusterId,
  MetodoId,
} from './fase01.types';
import { CLUSTERS } from './data/bancoDePromessas';

import { ArrowLeft } from 'lucide-react';

import Tela1Volume from './telas/Tela1Volume';
import Tela2Promessa from './telas/Tela2Promessa';
import Tela3Confirmacao from './telas/Tela3Confirmacao';
import Tela4Redirecionamento from './telas/Tela4Redirecionamento';
import Tela5Metodo from './telas/Tela5Metodo';
import TelaFinalResumo from './telas/TelaFinalResumo';

// ---------------------------------------------------------------------------
// Tipos internos de estado da máquina de estados
// ---------------------------------------------------------------------------

type FlowStep =
  | { screen: 'tela1' }
  | { screen: 'tela2'; clusterIndex: number }         // index em clustersQualificados
  | { screen: 'tela3' }
  | { screen: 'tela4' }
  | { screen: 'tela2_para_tela4'; clusterId: ClusterId } // Tela 2 reaproveitada após Tela 4
  | { screen: 'tela5' }
  | { screen: 'tela_final' };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function calcularClustersQualificados(volumes: VolumePorCluster[]): ClusterId[] {
  // Filtra >= 1 pessoa, ordena do maior para o menor volume.
  // Empate: preserva a ordem original da tabela da seção 2 (ordem de CLUSTERS).
  const clusterOrder = CLUSTERS.map((c) => c.id);
  return volumes
    .filter((v) => v.quantidadePessoas >= 1)
    .sort((a, b) => {
      if (b.quantidadePessoas !== a.quantidadePessoas) {
        return b.quantidadePessoas - a.quantidadePessoas;
      }
      // Empate: menor índice na tabela = posição mais alta
      return clusterOrder.indexOf(a.clusterId) - clusterOrder.indexOf(b.clusterId);
    })
    .map((v) => v.clusterId);
}

function buildInitialState(): Fase01State {
  return {
    volumes: CLUSTERS.map((c) => ({ clusterId: c.id as ClusterId, quantidadePessoas: 0 })),
    clustersQualificados: [],
    promessas: [],
    publicoAlvoFinal: null,
    metodoSelecionado: null,
    fluxoSemDados: false,
    fase01Completa: false,
    atualizadoEm: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Persistência — caminho: clients/{uid} campo "fase01"
// O projeto usa a coleção "clients" com documentos por uid.
// Não existe coleção separada "usuarios" ou "fases" — usamos o doc do cliente.
// ---------------------------------------------------------------------------

async function persistirFase01(uid: string, state: Fase01State): Promise<void> {
  try {
    const clientDocRef = doc(db, 'clients', uid);
    const snap = await getDoc(clientDocRef);
    if (snap.exists()) {
      await updateDoc(clientDocRef, { fase01: state });
    } else {
      // Caso o doc ainda não exista (improvável dado o fluxo de auth, mas robusto)
      await setDoc(clientDocRef, { fase01: state }, { merge: true });
    }
  } catch (err) {
    console.error('[Fase01Flow] Erro ao persistir Fase01State:', err);
  }
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Fase01FlowProps {
  uid: string;
  initialState?: Fase01State | null;
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export default function Fase01Flow({ uid, initialState }: Fase01FlowProps) {
  const [state, setStateRaw] = useState<Fase01State>(
    () => initialState ?? buildInitialState()
  );
  // Se o eixo já foi concluído, abre direto no resumo (Tela Final). O usuário
  // pode entrar em modo de edição a qualquer momento pelo botão "Revisar" da
  // Tela Final, que reabre a Tela 1 com os valores antigos já preenchidos.
  const [step, setStep] = useState<FlowStep>(() =>
    initialState?.fase01Completa ? { screen: 'tela_final' } : { screen: 'tela1' }
  );

  // Histórico de telas visitadas nesta sessão — permite o botão "Voltar" sem
  // precisar mapear manualmente qual é a tela anterior de cada uma (o fluxo
  // tem ramificações: Tela 3 "Não" e Tela 4 podem levar por caminhos diferentes).
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

  // Persiste e atualiza o estado local — carimba atualizadoEm a cada gravação (A.4 / A.4.1)
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

  // -------------------------------------------------------------------------
  // Handlers de cada tela
  // -------------------------------------------------------------------------

  // TELA 1 — "Avançar"
  function handleTela1Avancar(volumes: VolumePorCluster[]) {
    const qualificados = calcularClustersQualificados(volumes);
    const fluxoSemDados = qualificados.length === 0;

    // Caso 6.5: recalcula clustersQualificados e descarta promessas de clusters que saíram
    setState((prev) => {
      const promessasValidas = prev.promessas.filter((p) =>
        qualificados.includes(p.clusterId)
      );
      return {
        ...prev,
        volumes,
        clustersQualificados: qualificados,
        fluxoSemDados,
        promessas: promessasValidas,
        // Reseta campos downstream ao mudar dados da Tela 1
        publicoAlvoFinal: null,
        metodoSelecionado: null,
        fase01Completa: false,
      };
    });

    if (fluxoSemDados) {
      goToStep({ screen: 'tela4' });
    } else {
      goToStep({ screen: 'tela2', clusterIndex: 0 });
    }
  }

  // TELA 2 — Resposta de promessa (em loop pelos clusters qualificados)
  function handleTela2Responder(entrada: PromessaPorCluster, clusterIndex: number) {
    setState((prev) => {
      const semEsteCluster = prev.promessas.filter((p) => p.clusterId !== entrada.clusterId);
      return {
        ...prev,
        promessas: [...semEsteCluster, entrada],
      };
    });

    // Usa state atual (capturado via closure) — clustersQualificados não muda durante o loop da Tela 2
    const nextIndex = clusterIndex + 1;
    if (nextIndex < state.clustersQualificados.length) {
      goToStep({ screen: 'tela2', clusterIndex: nextIndex });
    } else {
      goToStep({ screen: 'tela3' });
    }
  }

  // TELA 3 — "Sim" (mantém foco)
  function handleTela3Sim() {
    setState((prev) => ({ ...prev, publicoAlvoFinal: prev.clustersQualificados[0] }));
    goToStep({ screen: 'tela5' });
  }

  // TELA 3 — "Não" (muda foco)
  function handleTela3Nao() {
    goToStep({ screen: 'tela4' });
  }

  // TELA 4 — Escolha de novo foco
  function handleTela4Escolher(clusterId: ClusterId) {
    setState((prev) => ({ ...prev, publicoAlvoFinal: clusterId }));

    // Verifica se já existe promessa para esse cluster
    const jaTemPromessa = state.promessas.some((p) => p.clusterId === clusterId);
    if (jaTemPromessa) {
      goToStep({ screen: 'tela5' });
    } else {
      goToStep({ screen: 'tela2_para_tela4', clusterId });
    }
  }

  // TELA 2 reaproveitada para Tela 4 — Resposta de promessa do cluster escolhido
  function handleTela2ParaTela4Responder(entrada: PromessaPorCluster) {
    setState((prev) => {
      const semEsteCluster = prev.promessas.filter((p) => p.clusterId !== entrada.clusterId);
      return {
        ...prev,
        promessas: [...semEsteCluster, entrada],
      };
    });
    goToStep({ screen: 'tela5' });
  }

  // TELA 5 — Escolha de método
  function handleTela5Escolher(metodoId: MetodoId) {
    setState((prev) => ({ ...prev, metodoSelecionado: metodoId }));
    goToStep({ screen: 'tela_final' });
  }

  // TELA FINAL — ao ser exibida com sucesso
  function handleFinalComplete() {
    setState((prev) => ({ ...prev, fase01Completa: true }));
  }

  // TELA FINAL — botão "Revisar": entra em modo de edição a partir da Tela 1
  function handleRevisar() {
    setHistory([]);
    setStep({ screen: 'tela1' });
  }

  // -------------------------------------------------------------------------
  // Helpers para recuperar dados do estado
  // -------------------------------------------------------------------------

  function getVolumeDoCluster(clusterId: ClusterId): number {
    return state.volumes.find((v) => v.clusterId === clusterId)?.quantidadePessoas ?? 0;
  }

  function getPromessaDoPublico(): string {
    if (!state.publicoAlvoFinal) return '';
    return (
      state.promessas.find((p) => p.clusterId === state.publicoAlvoFinal)?.promessaSelecionada ??
      ''
    );
  }

  // -------------------------------------------------------------------------
  // Render — máquina de estados
  // -------------------------------------------------------------------------

  // Validação de caso de borda 6.6: garante que a Tela Final só renderiza com dados completos.
  if (step.screen === 'tela_final') {
    if (!state.publicoAlvoFinal || !state.metodoSelecionado || !getPromessaDoPublico()) {
      // Erro de fluxo — retorna ao início (não deveria acontecer em operação normal)
      console.error('[Fase01Flow] Dados insuficientes para renderizar TelaFinalResumo. Reiniciando fluxo.');
      setStep({ screen: 'tela1' });
      setHistory([]);
      return null;
    }
  }

  // Labels de progresso para Tela 2 em loop
  function getTelaLabel(clusterIndex: number): string {
    const total = state.clustersQualificados.length;
    return `Tela 2 de ${Math.max(total, 1)} (${clusterIndex + 1}/${total})`;
  }

  return (
    <div className="w-full py-8 px-4">
      {history.length > 0 && (
        <div className="w-full max-w-2xl mx-auto mb-3">
          <button
            type="button"
            id="btn_fase01_voltar"
            onClick={handleVoltar}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar
          </button>
        </div>
      )}

      {step.screen === 'tela1' && (
        <Tela1Volume
          initialVolumes={state.volumes}
          onAvancar={handleTela1Avancar}
        />
      )}

      {step.screen === 'tela2' && step.clusterIndex !== undefined && (() => {
        const clusterIndex = (step as { screen: 'tela2'; clusterIndex: number }).clusterIndex;
        const clusterId = state.clustersQualificados[clusterIndex];
        if (!clusterId) return null;
        return (
          <React.Fragment key={`tela2-${clusterId}`}>
            <Tela2Promessa
              clusterId={clusterId}
              quantidadePessoas={getVolumeDoCluster(clusterId)}
              telaLabel={getTelaLabel(clusterIndex)}
              onResponder={(entrada) => handleTela2Responder(entrada, clusterIndex)}
            />
          </React.Fragment>
        );
      })()}

      {step.screen === 'tela3' && (
        <Tela3Confirmacao
          clustersQualificados={state.clustersQualificados}
          onSim={handleTela3Sim}
          onNao={handleTela3Nao}
        />
      )}

      {step.screen === 'tela4' && (
        <Tela4Redirecionamento onEscolher={handleTela4Escolher} />
      )}

      {step.screen === 'tela2_para_tela4' && (() => {
        const clusterId = (step as { screen: 'tela2_para_tela4'; clusterId: ClusterId }).clusterId;
        return (
          <React.Fragment key={`tela2-tela4-${clusterId}`}>
            <Tela2Promessa
              clusterId={clusterId}
              quantidadePessoas={getVolumeDoCluster(clusterId)}
              telaLabel="Tela 2 de 6 (Promessa do novo foco)"
              onResponder={handleTela2ParaTela4Responder}
            />
          </React.Fragment>
        );
      })()}

      {step.screen === 'tela5' && state.publicoAlvoFinal && (
        <Tela5Metodo
          publicoAlvoFinal={state.publicoAlvoFinal}
          promessaSelecionada={getPromessaDoPublico()}
          onEscolher={handleTela5Escolher}
        />
      )}

      {step.screen === 'tela_final' &&
        state.publicoAlvoFinal &&
        state.metodoSelecionado &&
        getPromessaDoPublico() && (
          <TelaFinalResumo
            publicoAlvoFinal={state.publicoAlvoFinal}
            promessaSelecionada={getPromessaDoPublico()}
            metodoSelecionado={state.metodoSelecionado}
            onComplete={handleFinalComplete}
            onRevisar={handleRevisar}
          />
        )}
    </div>
  );
}
