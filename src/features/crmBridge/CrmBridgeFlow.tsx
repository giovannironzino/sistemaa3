// CrmBridgeFlow.tsx
// Orquestrador da Ponte CRM — Plataformas → [Plataforma Principal] → Total → Reconciliação → Final.
// Não é uma das 9 fases da Jornada: persiste em clients/{uid}.crmBridge, independente
// da máquina fasesConcluidas/faseAtualId. Os contatos continuam vivendo só em fase02.contatos —
// esta feature lê/escreve neles através das props recebidas do shell.

import React, { useState, useCallback } from 'react';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

import { CrmBridgeState, CrmPlatformId, CrmMissingDraft } from './crmBridge.types';
import { ContatoCaptacao } from '../fase02/fase02.types';
import { criarContato } from '../fase02/lib/contatoUtils';
import { monthsUltimos3, parseIso } from '../fase02/lib/calendario';

import TelaPlataformas from './telas/TelaPlataformas';
import TelaPlataformaPrincipal from './telas/TelaPlataformaPrincipal';
import TelaTotal from './telas/TelaTotal';
import TelaReconciliacao from './telas/TelaReconciliacao';
import TelaFinal from './telas/TelaFinal';
import PainelPacientes from './telas/PainelPacientes';

type Screen = 'platforms' | 'primary' | 'total' | 'reconcile' | 'final';

function buildInitialState(): CrmBridgeState {
  return {
    platforms: [],
    primaryPlatform: '',
    totalCount: '',
    crmBridgeCompleta: false,
    atualizadoEm: new Date().toISOString(),
  };
}

async function persistirCrmBridge(uid: string, state: CrmBridgeState): Promise<void> {
  try {
    const clientDocRef = doc(db, 'clients', uid);
    const snap = await getDoc(clientDocRef);
    if (snap.exists()) {
      await updateDoc(clientDocRef, { crmBridge: state });
    } else {
      await setDoc(clientDocRef, { crmBridge: state }, { merge: true });
    }
  } catch (err) {
    console.error('[CrmBridgeFlow] Erro ao persistir CrmBridgeState:', err);
  }
}

interface CrmBridgeFlowProps {
  uid: string;
  initialState?: CrmBridgeState | null;
  contatosFase02: ContatoCaptacao[];
  onSalvarContatoFaltante: (contato: ContatoCaptacao) => void;
  onVoltarCaptacao: () => void;
}

export default function CrmBridgeFlow({
  uid,
  initialState,
  contatosFase02,
  onSalvarContatoFaltante,
  onVoltarCaptacao,
}: CrmBridgeFlowProps) {
  const [state, setStateRaw] = useState<CrmBridgeState>(() => initialState ?? buildInitialState());
  const [screen, setScreen] = useState<Screen>('platforms');
  const [missingOpen, setMissingOpen] = useState(false);
  const [missingDraft, setMissingDraft] = useState<CrmMissingDraft | null>(null);

  const setState = useCallback(
    (updater: (prev: CrmBridgeState) => CrmBridgeState) => {
      setStateRaw((prev) => {
        const next = { ...updater(prev), atualizadoEm: new Date().toISOString() };
        persistirCrmBridge(uid, next);
        return next;
      });
    },
    [uid]
  );

  function togglePlatform(p: CrmPlatformId) {
    setState((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(p) ? prev.platforms.filter((x) => x !== p) : [...prev.platforms, p],
    }));
  }

  function platformsContinue() {
    if (state.platforms.length === 0) return;
    if (state.platforms.length > 1) {
      setScreen('primary');
    } else {
      setState((prev) => ({ ...prev, primaryPlatform: prev.platforms[0] }));
      setScreen('total');
    }
  }

  function primaryContinue() {
    if (!state.primaryPlatform) return;
    setScreen('total');
  }

  function totalContinue() {
    if (state.totalCount === '') return;
    setScreen('reconcile');
  }

  function toggleMissingForm() {
    if (missingOpen) {
      setMissingOpen(false);
      setMissingDraft(null);
    } else {
      setMissingOpen(true);
      setMissingDraft({ name: '', objetivo: '', canal: '', date: '' });
    }
  }

  function saveMissing() {
    if (!missingDraft || !missingDraft.name.trim() || !missingDraft.objetivo || !missingDraft.canal || !missingDraft.date) return;
    const contato = criarContato({
      data: missingDraft.date,
      nomeContato: missingDraft.name,
      objetivoPrincipal: missingDraft.objetivo as ContatoCaptacao['objetivoPrincipal'],
      canalOrigem: missingDraft.canal as ContatoCaptacao['canalOrigem'],
      statusFechamento: 'sim',
      origemCrm: true,
    });
    onSalvarContatoFaltante(contato);
    setMissingOpen(false);
    setMissingDraft(null);
  }

  function goFinal() {
    if (!matched) return;
    setState((prev) => ({ ...prev, crmBridgeCompleta: true }));
    setScreen('final');
  }

  // ---------------------------------------------------------------------------
  // Dados derivados
  // ---------------------------------------------------------------------------

  const simContacts = contatosFase02.filter((c) => c.statusFechamento === 'sim');
  const simTotal = simContacts.length;
  const hasPlatformValue = state.totalCount !== '';
  const platformTotal = parseInt(state.totalCount || '0', 10) || 0;
  const matched = hasPlatformValue && platformTotal === simTotal;

  const meses = monthsUltimos3();
  const monthBreakdown = meses.map((m) => ({
    label: m.label,
    count: simContacts.filter((c) => {
      const d = parseIso(c.data);
      return d.getMonth() === m.monthIdx && d.getFullYear() === m.year;
    }).length,
  }));
  const finalMonths = meses.map((m) => {
    const monthContacts = simContacts.filter((c) => {
      const d = parseIso(c.data);
      return d.getMonth() === m.monthIdx && d.getFullYear() === m.year;
    });
    return {
      label: m.label,
      count: monthContacts.length,
      previewNames: monthContacts.slice(0, 4).map((c) => c.nomeContato),
      extraCount: Math.max(0, monthContacts.length - 4),
    };
  });

  const showRightPanel = true;

  return (
    <div className="flex items-start gap-6 flex-col md:flex-row">
      <div className="flex-1 min-w-0" style={{ maxWidth: 820 }}>
        {screen === 'platforms' && (
          <TelaPlataformas platforms={state.platforms} onTogglePlatform={togglePlatform} onContinuar={platformsContinue} />
        )}
        {screen === 'primary' && (
          <TelaPlataformaPrincipal
            platforms={state.platforms}
            primaryPlatform={state.primaryPlatform}
            onSelectPrimary={(p) => setState((prev) => ({ ...prev, primaryPlatform: p }))}
            onContinuar={primaryContinue}
            onVoltar={() => setScreen('platforms')}
          />
        )}
        {screen === 'total' && (
          <TelaTotal
            primaryPlatform={state.primaryPlatform}
            totalCount={state.totalCount}
            onSetTotalCount={(v) => setState((prev) => ({ ...prev, totalCount: v }))}
            onContinuar={totalContinue}
            onVoltar={() => setScreen(state.platforms.length > 1 ? 'primary' : 'platforms')}
          />
        )}
        {screen === 'reconcile' && (
          <TelaReconciliacao
            primaryPlatform={state.primaryPlatform}
            platformTotal={platformTotal}
            hasPlatformValue={hasPlatformValue}
            simTotal={simTotal}
            matched={matched}
            monthBreakdown={monthBreakdown}
            missingOpen={missingOpen}
            missingDraft={missingDraft}
            onToggleMissingForm={toggleMissingForm}
            onCloseMissingForm={() => { setMissingOpen(false); setMissingDraft(null); }}
            onUpdateMissingDraft={(patch) => setMissingDraft((prev) => (prev ? { ...prev, ...patch } : prev))}
            onSaveMissing={saveMissing}
            onFinalizar={goFinal}
            onVoltar={() => setScreen('total')}
          />
        )}
        {screen === 'final' && (
          <TelaFinal
            primaryPlatform={state.primaryPlatform}
            simTotal={simTotal}
            months={finalMonths}
            onVoltarCaptacao={onVoltarCaptacao}
          />
        )}
      </div>

      {showRightPanel && <PainelPacientes contatos={simContacts} />}
    </div>
  );
}
