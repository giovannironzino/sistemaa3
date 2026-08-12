// JornadaA3Shell.tsx
// Shell de navegação da Jornada do A3 — 9 fases sequenciais com Modo Livre Desbloqueado por Padrão e Painel de Resumo Unificado.

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { CheckCircle2, Lock, Unlock, LayoutDashboard, Sparkles } from 'lucide-react';

import { FaseJornadaId, JornadaState, EtapaJornada } from './jornada.types';
import Fase01Flow from '../fase01/Fase01Flow';
import Fase02Flow from '../fase02/Fase02Flow';
import Fase03Flow from '../fase03/Fase03Flow';
import Fase04Flow from '../fase04/Fase04Flow';
import Fase05Flow from '../fase05/Fase05Flow';
import Fase06Flow from '../fase06/Fase06Flow';
import Fase07Flow from '../fase07/Fase07Flow';
import Fase08Flow from '../fase08/Fase08Flow';
import Fase09Flow from '../fase09/Fase09Flow';
import CrmBridgeFlow from '../crmBridge/CrmBridgeFlow';
import ResumoUnificadoA3 from './ResumoUnificadoA3';
import type { ContatoCaptacao } from '../fase02/fase02.types';

async function salvarContatoFaltanteNoFase02(uid: string, contato: ContatoCaptacao): Promise<void> {
  try {
    const clientDocRef = doc(db, 'clients', uid);
    const snap = await getDoc(clientDocRef);
    const fase02Atual = snap.exists() ? snap.data()?.fase02 : null;
    const contatosAtuais: ContatoCaptacao[] = fase02Atual?.contatos ?? [];
    const novosContatos = [...contatosAtuais, contato];
    if (snap.exists() && fase02Atual) {
      await updateDoc(clientDocRef, {
        'fase02.contatos': novosContatos,
        'fase02.atualizadoEm': new Date().toISOString(),
      });
    } else {
      await setDoc(
        clientDocRef,
        { fase02: { contatos: novosContatos, atualizadoEm: new Date().toISOString() } },
        { merge: true }
      );
    }
  } catch (err) {
    console.error('[JornadaA3Shell] Erro ao salvar contato faltante (Ponte CRM):', err);
  }
}

const ETAPAS_DEFINIDAS: Omit<EtapaJornada, 'status'>[] = [
  { id: 'fase01_promessa_metodo', ordem: 1, nome: 'Promessa & Método', subtitulo: 'O que eu faço e por quê (a raiz de tudo)' },
  { id: 'fase02_captacao',        ordem: 2, nome: 'Captação',           subtitulo: 'Como as pessoas me encontram' },
  { id: 'fase03_vendas',          ordem: 3, nome: 'Vendas',             subtitulo: 'Como eu fecho com quem me encontrou' },
  { id: 'fase04_servicos',        ordem: 4, nome: 'Serviços',           subtitulo: 'O que exatamente eu vendo (produtos, preços, pacotes)' },
  { id: 'fase05_entrega_rotina',  ordem: 5, nome: 'Entrega & Rotina',   subtitulo: 'Como eu executo o que vendi, dia a dia' },
  { id: 'fase06_agenda',          ordem: 6, nome: 'Agenda',             subtitulo: 'Quanto tempo eu tenho pra fazer tudo isso' },
  { id: 'fase07_equipe',          ordem: 7, nome: 'Equipe',             subtitulo: 'Quem me ajuda' },
  { id: 'fase08_financeiro',      ordem: 8, nome: 'Financeiro',         subtitulo: 'O resultado de tudo (o veredito, não o ponto de partida)' },
  { id: 'fase09_metas_simulacao', ordem: 9, nome: 'Metas & Simulação',  subtitulo: 'Onde quero chegar e como simular o caminho' },
];

async function carregarJornadaState(uid: string, fase01Completa: boolean): Promise<JornadaState> {
  const clientDocRef = doc(db, 'clients', uid);
  const snap = await getDoc(clientDocRef);

  if (snap.exists()) {
    const data = snap.data();
    if (data.jornada) return data.jornada as JornadaState;
  }

  let jornadaInicial: JornadaState;
  if (fase01Completa) {
    jornadaInicial = { faseAtualId: 'fase02_captacao', fasesConcluidas: ['fase01_promessa_metodo'] };
  } else {
    jornadaInicial = { faseAtualId: 'fase01_promessa_metodo', fasesConcluidas: [] };
  }

  if (snap.exists()) {
    await updateDoc(clientDocRef, { jornada: jornadaInicial });
  } else {
    await setDoc(clientDocRef, { jornada: jornadaInicial }, { merge: true });
  }
  return jornadaInicial;
}

async function persistirJornadaState(uid: string, state: JornadaState): Promise<void> {
  try {
    const clientDocRef = doc(db, 'clients', uid);
    const snap = await getDoc(clientDocRef);
    if (snap.exists()) {
      await updateDoc(clientDocRef, { jornada: state });
    } else {
      await setDoc(clientDocRef, { jornada: state }, { merge: true });
    }
  } catch (err) {
    console.error('[JornadaA3Shell] Erro ao persistir JornadaState:', err);
  }
}

function calcularEtapas(jornadaState: JornadaState, modoLivre: boolean): EtapaJornada[] {
  return ETAPAS_DEFINIDAS.map((etapa): EtapaJornada => {
    if (modoLivre) return { ...etapa, status: 'concluida' };
    if (jornadaState.fasesConcluidas.includes(etapa.id)) return { ...etapa, status: 'concluida' };
    if (etapa.id === jornadaState.faseAtualId) return { ...etapa, status: 'em_andamento' };
    return { ...etapa, status: 'bloqueada' };
  });
}

interface JornadaA3ShellProps {
  uid: string;
  clientRecord: any;
}

export default function JornadaA3Shell({ uid, clientRecord }: JornadaA3ShellProps) {
  const [jornadaState, setJornadaStateRaw] = useState<JornadaState | null>(null);
  const [faseFocada, setFaseFocada] = useState<string | null>(null);
  const [modoLivre, setModoLivre] = useState(true); // ATIVADO POR PADRÃO CONFORME SOLICITADO
  const [mostrarResumoUnificado, setMostrarResumoUnificado] = useState(false);
  const [mostrarCrmBridge, setMostrarCrmBridge] = useState(false);
  const [menuEixosAberto, setMenuEixosAberto] = useState(false);
  const [loading, setLoading] = useState(true);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const etapaAtivaRef = useRef<HTMLButtonElement | null>(null);

  const fase01Completa: boolean = !!(clientRecord?.fase01?.fase01Completa);
  const fase02Completa: boolean = !!(clientRecord?.fase02?.fase02Completa);
  const fase03Completa: boolean = !!(clientRecord?.fase03?.fase03Completa);
  const fase04Completa: boolean = !!(clientRecord?.fase04?.fase04Completa);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const state = await carregarJornadaState(uid, fase01Completa);
      if (!cancelled) {
        setJornadaStateRaw(state);
        setFaseFocada(state.faseAtualId);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [uid]);

  const etapas = jornadaState ? calcularEtapas(jornadaState, modoLivre) : [];

  const handleClickEtapa = useCallback(
    (etapa: EtapaJornada) => {
      setMostrarResumoUnificado(false);
      setMostrarCrmBridge(false);
      setFaseFocada(etapa.id);
      setMenuEixosAberto(false);
    },
    []
  );

  const handleClickCrmBridge = useCallback(() => {
    setMostrarResumoUnificado(false);
    setMostrarCrmBridge(true);
  }, []);

  const handleClickResumoUnificado = useCallback(() => {
    setMostrarCrmBridge(false);
    setMostrarResumoUnificado(true);
  }, []);

  if (loading || !jornadaState) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
        Carregando sua jornada...
      </div>
    );
  }

  const etapaFocada = etapas.find((e) => e.id === faseFocada) ?? etapas[0];
  const isEixo01Ativo = faseFocada === 'fase01_promessa_metodo' && !mostrarResumoUnificado && !mostrarCrmBridge;

  return (
    <div className="space-y-6">
      {/* BARRA DE PROGRESSO HORIZONTAL — LINHA DO TEMPO (Exibida normalmente nos Eixos 02 a 09 ou quando menu secundário estiver aberto) */}
      {(!isEixo01Ativo || menuEixosAberto) && (
        <div
          className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl px-4 pt-3 pb-4 space-y-3 animate-fadeIn"
          id="jornada_barra_progresso"
        >
        {/* Título e Toggle Modo Livre */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 font-label">
              A Jornada do A3
            </span>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Sua modelagem estratégica — 9 fases sequenciais
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle Modo Livre / Desbloqueado */}
            <button
              type="button"
              onClick={() => setModoLivre(!modoLivre)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                modoLivre
                  ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400'
                  : 'bg-slate-800 border border-slate-700 text-slate-400'
              }`}
              title={modoLivre ? 'Modo Livre Ativo: Todas as 9 fases estão liberadas para navegação' : 'Modo Sequencial: Fases são liberadas após conclusão'}
            >
              {modoLivre ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
              {modoLivre ? 'Modo Livre (Desbloqueado)' : 'Modo Sequencial'}
            </button>

            {/* Nó Resumo Unificado */}
            <button
              type="button"
              onClick={handleClickResumoUnificado}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                mostrarResumoUnificado
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20'
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Resumo Unificado A3
            </button>
          </div>
        </div>

        {/* Lista horizontal com scroll-x */}
        <div
          ref={scrollContainerRef}
          className="flex items-start gap-0 overflow-x-auto pb-1"
          style={{ scrollbarWidth: 'thin' }}
          role="list"
        >
          {etapas.map((etapa, idx) => {
            const isAtiva = !mostrarResumoUnificado && !mostrarCrmBridge && etapa.id === faseFocada;
            const isLast = idx === etapas.length - 1;
            const clicavel = modoLivre || etapa.status === 'em_andamento' || etapa.status === 'concluida';

            return (
              <React.Fragment key={etapa.id}>
                <div className="flex items-center shrink-0">
                  <button
                    ref={isAtiva ? (el) => { (etapaAtivaRef as any).current = el; } : undefined}
                    type="button"
                    role="listitem"
                    id={`etapa_${etapa.id}`}
                    disabled={!clicavel}
                    onClick={() => handleClickEtapa(etapa)}
                    title={`${etapa.nome} — ${etapa.subtitulo}`}
                    className={[
                      'flex flex-col items-center gap-1.5 px-2 py-2 rounded-xl transition-all min-w-[64px] max-w-[80px]',
                      clicavel ? 'cursor-pointer' : 'cursor-not-allowed opacity-50',
                      isAtiva
                        ? 'bg-indigo-600/20 border border-indigo-500/35'
                        : clicavel
                        ? 'hover:bg-white/5'
                        : 'opacity-40',
                    ].join(' ')}
                  >
                    <div
                      className={[
                        'h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                        isAtiva
                          ? 'bg-indigo-500 text-white ring-4 ring-indigo-500/20'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
                      ].join(' ')}
                    >
                      {etapa.ordem}
                    </div>

                    <span
                      className={[
                        'text-[10px] font-semibold text-center leading-tight line-clamp-1',
                        isAtiva ? 'text-white font-bold' : 'text-slate-400',
                      ].join(' ')}
                    >
                      {etapa.nome}
                    </span>
                  </button>

                  {!isLast && (
                    <div className="h-px w-4 shrink-0 mx-0.5 bg-white/10" aria-hidden="true" />
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
      )}

      {/* CONTEÚDO DA FASE EM FOCO */}
      <div id="jornada_conteudo_fase">
        {mostrarResumoUnificado ? (
          <ResumoUnificadoA3
            clientRecord={clientRecord}
            onNavegarFase={(faseId) => {
              setMostrarResumoUnificado(false);
              setMostrarCrmBridge(false);
              setFaseFocada(faseId);
            }}
          />
        ) : faseFocada === 'fase01_promessa_metodo' ? (
          <Fase01Flow
            uid={uid}
            initialState={clientRecord?.fase01 ?? null}
            onAvancarFase02={() => setFaseFocada('fase02_captacao')}
            onToggleMenuEixos={() => setMenuEixosAberto((prev) => !prev)}
            menuEixosAberto={menuEixosAberto}
          />
        ) : faseFocada === 'fase02_captacao' ? (
          <Fase02Flow
            key="fase02"
            uid={uid}
            initialState={clientRecord?.fase02 ?? null}
            onAvancarCrm={() => setFaseFocada('fase03_vendas')}
          />
        ) : faseFocada === 'fase03_vendas' ? (
          <Fase03Flow
            uid={uid}
            initialState={clientRecord?.fase03 ?? null}
            clientRecord={clientRecord}
          />
        ) : faseFocada === 'fase04_servicos' ? (
          <Fase04Flow
            uid={uid}
            initialState={clientRecord?.fase04 ?? null}
          />
        ) : faseFocada === 'fase05_entrega_rotina' ? (
          <Fase05Flow
            uid={uid}
            initialState={clientRecord?.fase05 ?? null}
            onAvancarEixo06={() => setFaseFocada('fase06_agenda')}
          />
        ) : faseFocada === 'fase06_agenda' ? (
          <Fase06Flow
            uid={uid}
            initialState={clientRecord?.fase06 ?? null}
            pacientesEixo01List={clientRecord?.fase01?.pacientes ?? []}
            servicosEixo04={clientRecord?.fase04?.servicos ?? []}
            onAvancarEixo07={() => setFaseFocada('fase07_equipe')}
          />
        ) : faseFocada === 'fase07_equipe' ? (
          <Fase07Flow
            uid={uid}
            initialState={clientRecord?.fase07 ?? null}
            pacientesAtivosContagem={clientRecord?.fase01?.totalPacientesAtivos ?? 38}
            microAcoesDelegadasEixo06={clientRecord?.fase06?.microAcoesDelegadas ?? []}
            onAvancarEixo08={() => setFaseFocada('fase08_financeiro')}
          />
        ) : faseFocada === 'fase08_financeiro' ? (
          <Fase08Flow
            uid={uid}
            initialState={clientRecord?.fase08 ?? null}
            pacientesEixo01Count={clientRecord?.fase01?.totalPacientesAtivos ?? 38}
            pacientesEixo01List={clientRecord?.fase01?.pacientes ?? []}
            custoEquipeEixo07={clientRecord?.fase07?.custoTotalEquipe ?? 0}
            servicosEixo04={clientRecord?.fase04?.servicos ?? []}
            clientRecord={clientRecord}
            onAvancarEixo09={() => setFaseFocada('fase09_metas_simulacao')}
          />
        ) : faseFocada === 'fase09_metas_simulacao' ? (
          <Fase09Flow uid={uid} clientRecord={clientRecord} />
        ) : null}
      </div>
    </div>
  );
}
