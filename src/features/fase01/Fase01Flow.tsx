// Fase01Flow.tsx
// Orquestrador do fluxo do Eixo 01 — Promessa & Método (Progressive Disclosure em 4 Etapas).

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

import Eixo01HeaderCompacto from './components/Eixo01HeaderCompacto';
import Eixo01Step1Pacientes from './telas/Eixo01Step1Pacientes';
import Eixo01Step2Padroes from './telas/Eixo01Step2Padroes';
import Eixo01Step3Metodo from './telas/Eixo01Step3Metodo';
import Eixo01Step4Promessa from './telas/Eixo01Step4Promessa';

export type Eixo01LocalStep = 'pacientes' | 'padroes' | 'metodo' | 'promessa';

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
  onAvancarFase02?: () => void;
  onToggleMenuEixos?: () => void;
  menuEixosAberto?: boolean;
}

export default function Fase01Flow({
  uid,
  initialState,
  onAvancarFase02,
  onToggleMenuEixos,
  menuEixosAberto,
}: Fase01FlowProps) {
  const [state, setStateRaw] = useState<Fase01State>(
    () => initialState ?? buildInitialState()
  );

  // Estado estritamente de UI local (não persisto no Firestore)
  const [localStep, setLocalStep] = useState<Eixo01LocalStep>(() =>
    initialState?.fase01Completa && initialState.pacientesMapeados?.length > 0
      ? 'promessa'
      : 'pacientes'
  );

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

  // Recálculo seguro de clusters e volumes preservando regra de negócio existente
  const recalcularEixo01 = (pacientes: PacienteMapeadoEixo01[]) => {
    const contagem: Record<string, number> = {};
    pacientes.forEach((p) => {
      if (p.dorId) {
        contagem[p.dorId] = (contagem[p.dorId] || 0) + 1;
      }
    });

    const volumes: VolumePorCluster[] = CLUSTERS.map((c) => ({
      clusterId: c.id as ClusterId,
      quantidadePessoas: contagem[c.id] || 0,
    }));

    const qualificados = Object.keys(contagem).sort(
      (a, b) => contagem[b] - contagem[a]
    ) as ClusterId[];

    const publicoAlvoFinal = qualificados[0] || 'estetica_emagrecimento';

    return { volumes, clustersQualificados: qualificados, publicoAlvoFinal };
  };

  const normalizarNome = (nome: string) =>
    nome.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Handlers
  const handleSalvarPaciente = (paciente: PacienteMapeadoEixo01) => {
    setState((prev) => {
      const atuais = prev.pacientesMapeados || [];
      const normNovo = normalizarNome(paciente.nome);

      const indexExistente = atuais.findIndex(
        (p) => p.id === paciente.id || normalizarNome(p.nome) === normNovo
      );

      let novosPacientes: PacienteMapeadoEixo01[];
      if (indexExistente >= 0) {
        novosPacientes = [...atuais];
        novosPacientes[indexExistente] = {
          ...novosPacientes[indexExistente],
          ...paciente,
          id: novosPacientes[indexExistente].id, // preserva ID original
        };
      } else {
        novosPacientes = [...atuais, paciente];
      }

      const recalculo = recalcularEixo01(novosPacientes);
      return {
        ...prev,
        pacientesMapeados: novosPacientes,
        ...recalculo,
      };
    });
  };

  const handleImportarPacientesEmLote = (novosPacientesImportados: PacienteMapeadoEixo01[]) => {
    setState((prev) => {
      const atuais = [...(prev.pacientesMapeados || [])];

      novosPacientesImportados.forEach((itemNovo) => {
        const normNovo = normalizarNome(itemNovo.nome);
        const idxExistente = atuais.findIndex(
          (p) => p.id === itemNovo.id || normalizarNome(p.nome) === normNovo
        );

        if (idxExistente >= 0) {
          atuais[idxExistente] = {
            ...atuais[idxExistente],
            dorId: itemNovo.dorId || atuais[idxExistente].dorId,
            ticketPagoEstimado: itemNovo.ticketPagoEstimado || atuais[idxExistente].ticketPagoEstimado,
            mesAtendimento: itemNovo.mesAtendimento || atuais[idxExistente].mesAtendimento,
          };
        } else {
          atuais.push(itemNovo);
        }
      });

      const recalculo = recalcularEixo01(atuais);
      return {
        ...prev,
        pacientesMapeados: atuais,
        ...recalculo,
      };
    });
  };

  const handleExcluirPaciente = (id: string) => {
    setState((prev) => {
      const novosPacientes = (prev.pacientesMapeados || []).filter((p) => p.id !== id);
      const recalculo = recalcularEixo01(novosPacientes);
      return {
        ...prev,
        pacientesMapeados: novosPacientes,
        ...recalculo,
      };
    });
  };

  const handleExcluirPacientesEmLote = (ids: string[]) => {
    setState((prev) => {
      const setIds = new Set(ids);
      const novosPacientes = (prev.pacientesMapeados || []).filter((p) => !setIds.has(p.id));
      const recalculo = recalcularEixo01(novosPacientes);
      return {
        ...prev,
        pacientesMapeados: novosPacientes,
        ...recalculo,
      };
    });
  };

  const handleRestaurarPacientes = (pacientesRestaurar: PacienteMapeadoEixo01[]) => {
    setState((prev) => {
      const atuais = prev.pacientesMapeados || [];
      const mapaIds = new Set(atuais.map((p) => p.id));
      const aAdicionar = pacientesRestaurar.filter((p) => !mapaIds.has(p.id));
      const novosPacientes = [...atuais, ...aAdicionar];
      const recalculo = recalcularEixo01(novosPacientes);
      return {
        ...prev,
        pacientesMapeados: novosPacientes,
        ...recalculo,
      };
    });
  };

  const handleConfirmarMetodo = (metodoId: MetodoId) => {
    setState((prev) => ({
      ...prev,
      metodoSelecionado: metodoId,
    }));
    setLocalStep('promessa');
  };

  const handleConcluirEixo = () => {
    setState((prev) => ({
      ...prev,
      fase01Completa: true,
    }));
    if (onAvancarFase02) {
      onAvancarFase02();
    }
  };

  const getStepIndex = (): number => {
    switch (localStep) {
      case 'pacientes': return 0;
      case 'padroes': return 1;
      case 'metodo': return 2;
      case 'promessa': return 3;
      default: return 0;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Cabeçalho Compacto Exclusivo do Eixo 01 */}
      <Eixo01HeaderCompacto
        currentStepIndex={getStepIndex()}
        totalSteps={4}
        onToggleMenuEixos={onToggleMenuEixos}
        menuEixosAberto={menuEixosAberto}
      />

      {/* Renderização da Etapa Ativa */}
      {localStep === 'pacientes' && (
        <Eixo01Step1Pacientes
          pacientes={state.pacientesMapeados || []}
          onSalvarPaciente={handleSalvarPaciente}
          onImportarEmLote={handleImportarPacientesEmLote}
          onExcluirPaciente={handleExcluirPaciente}
          onExcluirEmLote={handleExcluirPacientesEmLote}
          onRestaurarPacientes={handleRestaurarPacientes}
          onAvancarParaPadroes={() => setLocalStep('padroes')}
        />
      )}

      {localStep === 'padroes' && (
        <Eixo01Step2Padroes
          pacientes={state.pacientesMapeados || []}
          onContinuarParaMetodo={() => setLocalStep('metodo')}
          onRevisarAmostra={() => setLocalStep('pacientes')}
        />
      )}

      {localStep === 'metodo' && (
        <Eixo01Step3Metodo
          pacientes={state.pacientesMapeados || []}
          metodoSelecionadoInicial={state.metodoSelecionado}
          onConfirmarMetodo={handleConfirmarMetodo}
        />
      )}

      {localStep === 'promessa' && (
        <Eixo01Step4Promessa
          pacientes={state.pacientesMapeados || []}
          metodoSelecionado={state.metodoSelecionado || 'rotina_real'}
          onConcluirEixo={handleConcluirEixo}
          onRevisarEixo={() => setLocalStep('pacientes')}
        />
      )}
    </div>
  );
}

