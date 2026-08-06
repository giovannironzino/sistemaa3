// JornadaA3Shell.tsx
// Shell de navegação da Jornada do A3 — 9 fases sequenciais.
// Barra de progresso HORIZONTAL (linha do tempo) conforme Parte A da spec.
//
// Mudanças da Parte A:
//   - Menu vertical → horizontal com overflow-x: auto (scroll-x em telas pequenas)
//   - Subtítulo exibido como title="" (tooltip nativo) — escolha mais simples, sem deps extras
//   - Etapa ativa visualmente destacada; nomes curtos inline
//   - Edição de fases concluídas: clicar em 'concluida' abre o flow em modo edição real
//   - Aviso de dado desatualizado (A.4.1): compara atualizadoEm das fases dependentes
//
// Persistência: clients/{uid}.jornada

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { CheckCircle2, Lock } from 'lucide-react';

import { FaseJornadaId, JornadaState, EtapaJornada } from './jornada.types';
import Fase01Flow from '../fase01/Fase01Flow';
import Fase02Flow from '../fase02/Fase02Flow';
import Fase03Flow from '../fase03/Fase03Flow';
import Fase04Flow from '../fase04/Fase04Flow';
import Fase09Flow from '../fase09/Fase09Flow';
import FaseNaoImplementada from './FaseNaoImplementada';
import CrmBridgeFlow from '../crmBridge/CrmBridgeFlow';
import type { ContatoCaptacao } from '../fase02/fase02.types';

// ---------------------------------------------------------------------------
// Persistência — Ponte CRM (não faz parte da máquina de 9 fases, ver crmBridge.types.ts)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Definição estática das 9 fases
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Helpers de persistência
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Cálculo de status de cada etapa
// ---------------------------------------------------------------------------

function calcularEtapas(jornadaState: JornadaState): EtapaJornada[] {
  return ETAPAS_DEFINIDAS.map((etapa): EtapaJornada => {
    if (jornadaState.fasesConcluidas.includes(etapa.id)) return { ...etapa, status: 'concluida' };
    if (etapa.id === jornadaState.faseAtualId) return { ...etapa, status: 'em_andamento' };
    return { ...etapa, status: 'bloqueada' };
  });
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface JornadaA3ShellProps {
  uid: string;
  clientRecord: any;
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export default function JornadaA3Shell({ uid, clientRecord }: JornadaA3ShellProps) {
  const [jornadaState, setJornadaStateRaw] = useState<JornadaState | null>(null);
  const [faseFocada, setFaseFocada] = useState<FaseJornadaId | null>(null);
  const [loading, setLoading] = useState(true);
  // Ponte CRM — não é uma das 9 fases; alterna o conteúdo sem tocar em jornadaState/faseFocada.
  const [mostrarCrmBridge, setMostrarCrmBridge] = useState(false);

  // Ref para a lista horizontal — usada para scroll até etapa ativa
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const etapaAtivaRef = useRef<HTMLButtonElement | null>(null);

  const fase01Completa: boolean = !!(clientRecord?.fase01?.fase01Completa);
  const fase02Completa: boolean = !!(clientRecord?.fase02?.fase02Completa);
  const fase03Completa: boolean = !!(clientRecord?.fase03?.fase03Completa);
  const fase04Completa: boolean = !!(clientRecord?.fase04?.fase04Completa);

  // Carrega JornadaState
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  // Scroll automático até a etapa ativa após carregar
  useEffect(() => {
    if (!loading && etapaAtivaRef.current && scrollContainerRef.current) {
      etapaAtivaRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [loading]);

  // Detecção de conclusão das fases em tempo real
  useEffect(() => {
    if (!jornadaState) return;
    if (!fase01Completa) return;
    if (jornadaState.fasesConcluidas.includes('fase01_promessa_metodo')) return;
    const novoState: JornadaState = {
      faseAtualId: 'fase02_captacao',
      fasesConcluidas: [...jornadaState.fasesConcluidas, 'fase01_promessa_metodo'],
    };
    setJornadaStateRaw(novoState);
    persistirJornadaState(uid, novoState);
  }, [fase01Completa, jornadaState, uid]);

  useEffect(() => {
    if (!jornadaState) return;
    if (!fase02Completa) return;
    if (jornadaState.fasesConcluidas.includes('fase02_captacao')) return;
    const novoState: JornadaState = {
      faseAtualId: 'fase03_vendas',
      fasesConcluidas: [...jornadaState.fasesConcluidas, 'fase02_captacao'],
    };
    setJornadaStateRaw(novoState);
    persistirJornadaState(uid, novoState);
  }, [fase02Completa, jornadaState, uid]);

  useEffect(() => {
    if (!jornadaState) return;
    if (!fase03Completa) return;
    if (jornadaState.fasesConcluidas.includes('fase03_vendas')) return;
    const novoState: JornadaState = {
      faseAtualId: 'fase04_servicos',
      fasesConcluidas: [...jornadaState.fasesConcluidas, 'fase03_vendas'],
    };
    setJornadaStateRaw(novoState);
    persistirJornadaState(uid, novoState);
  }, [fase03Completa, jornadaState, uid]);

  useEffect(() => {
    if (!jornadaState) return;
    if (!fase04Completa) return;
    if (jornadaState.fasesConcluidas.includes('fase04_servicos')) return;
    const novoState: JornadaState = {
      faseAtualId: 'fase05_entrega_rotina',
      fasesConcluidas: [...jornadaState.fasesConcluidas, 'fase04_servicos'],
    };
    setJornadaStateRaw(novoState);
    persistirJornadaState(uid, novoState);
  }, [fase04Completa, jornadaState, uid]);

  const etapas = jornadaState ? calcularEtapas(jornadaState) : [];

  // Clique em etapa — bloqueadas não são clicáveis
  // Concluídas e em_andamento: navega (modo edição real para concluídas — A.4)
  const handleClickEtapa = useCallback(
    (etapa: EtapaJornada) => {
      if (etapa.status === 'bloqueada') return;
      if (etapa.status === 'nao_implementada') return;
      setMostrarCrmBridge(false);
      setFaseFocada(etapa.id);
    },
    []
  );

  // Clique no nó "CRM" da trilha — só faz sentido depois que a Captação foi alcançada
  // (mesmo critério de "clicável" das etapas normais: em_andamento ou concluída).
  const etapaCaptacao = etapas.find((e) => e.id === 'fase02_captacao');
  const podeAbrirCrmBridge = etapaCaptacao?.status === 'em_andamento' || etapaCaptacao?.status === 'concluida';
  const handleClickCrmBridge = useCallback(() => {
    if (!podeAbrirCrmBridge) return;
    setMostrarCrmBridge(true);
  }, [podeAbrirCrmBridge]);

  if (loading || !jornadaState) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
        Carregando sua jornada...
      </div>
    );
  }

  const etapaFocada = etapas.find((e) => e.id === faseFocada) ?? etapas[0];

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* BARRA DE PROGRESSO HORIZONTAL — LINHA DO TEMPO                      */}
      {/* ------------------------------------------------------------------ */}
      <div
        className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl px-4 pt-3 pb-4"
        id="jornada_barra_progresso"
        aria-label="Linha do tempo da Jornada do A3"
      >
        {/* Título */}
        <div className="mb-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 font-label">
              A Jornada do A3
            </span>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Sua modelagem estratégica — 9 fases sequenciais
            </p>
          </div>
          {/* Contagem rápida */}
          <span className="text-[10px] text-slate-500 font-mono shrink-0">
            {jornadaState.fasesConcluidas.length}/9
          </span>
        </div>

        {/* Lista horizontal com scroll-x */}
        <div
          ref={scrollContainerRef}
          className="flex items-start gap-0 overflow-x-auto pb-1"
          style={{ scrollbarWidth: 'thin' }}
          role="list"
        >
          {etapas.map((etapa, idx) => {
            const isAtiva = etapa.id === faseFocada;
            const isLast = idx === etapas.length - 1;
            const clicavel = etapa.status === 'em_andamento' || etapa.status === 'concluida';

            return (
              <React.Fragment key={etapa.id}>
              <div className="flex items-center shrink-0">
                {/* Nó da etapa */}
                <button
                  ref={isAtiva ? (el) => { (etapaAtivaRef as any).current = el; } : undefined}
                  type="button"
                  role="listitem"
                  id={`etapa_${etapa.id}`}
                  disabled={!clicavel}
                  onClick={() => handleClickEtapa(etapa)}
                  title={`${etapa.nome} — ${etapa.subtitulo}`}
                  aria-current={isAtiva ? 'step' : undefined}
                  aria-label={`Fase ${etapa.ordem}: ${etapa.nome} — ${
                    etapa.status === 'concluida' ? 'concluída, clique para editar' :
                    etapa.status === 'em_andamento' ? 'em andamento' : 'bloqueada'
                  }`}
                  className={[
                    'flex flex-col items-center gap-1.5 px-2 py-2 rounded-xl transition-all min-w-[64px] max-w-[80px]',
                    clicavel ? 'cursor-pointer' : 'cursor-not-allowed',
                    isAtiva
                      ? 'bg-indigo-600/20 border border-indigo-500/35'
                      : clicavel && etapa.status === 'concluida'
                      ? 'hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20'
                      : clicavel
                      ? 'hover:bg-white/5 border border-transparent'
                      : 'border border-transparent opacity-40',
                  ].join(' ')}
                >
                  {/* Número de ordem */}
                  <span
                    className={`text-[9px] font-black tabular-nums font-label ${
                      etapa.status === 'concluida' ? 'text-emerald-400' :
                      etapa.status === 'em_andamento' ? 'text-indigo-400' :
                      'text-slate-600'
                    }`}
                  >
                    {String(etapa.ordem).padStart(2, '0')}
                  </span>

                  {/* Ícone de status */}
                  <div className="flex items-center justify-center">
                    {etapa.status === 'concluida' ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : etapa.status === 'em_andamento' ? (
                      <div
                        className={`h-5 w-5 rounded-full border-2 border-indigo-400 flex items-center justify-center ${
                          isAtiva ? 'bg-indigo-500/30' : 'bg-indigo-500/15'
                        }`}
                      >
                        <div className="h-2 w-2 rounded-full bg-indigo-400" />
                      </div>
                    ) : (
                      <Lock className="h-4 w-4 text-slate-600" />
                    )}
                  </div>

                  {/* Nome curto (sem subtítulo inline) */}
                  <span
                    className={`text-[10px] font-semibold text-center leading-tight line-clamp-2 ${
                      isAtiva ? 'text-white' :
                      etapa.status === 'concluida' ? 'text-emerald-300' :
                      etapa.status === 'em_andamento' ? 'text-indigo-300' :
                      'text-slate-600'
                    }`}
                  >
                    {etapa.nome}
                  </span>
                </button>

                {/* Conector entre etapas */}
                {!isLast && (
                  <div
                    className={`h-px w-4 shrink-0 mx-0.5 ${
                      jornadaState.fasesConcluidas.includes(etapa.id)
                        ? 'bg-emerald-500/50'
                        : etapa.id === jornadaState.faseAtualId
                        ? 'bg-indigo-500/30'
                        : 'bg-white/10'
                    }`}
                    aria-hidden="true"
                  />
                )}
              </div>

              {/* Nó extra "CRM" — Ponte Captação → Vendas, inserido entre os nós 02 e 03.
                  Não é uma das 9 fases: fica fora de `etapas`, montado manualmente aqui. */}
              {etapa.id === 'fase02_captacao' && podeAbrirCrmBridge && (
                <div className="flex items-center shrink-0">
                  <button
                    type="button"
                    id="etapa_crm_bridge"
                    onClick={handleClickCrmBridge}
                    title="CRM — Ponte Captação → Vendas"
                    aria-current={mostrarCrmBridge ? 'step' : undefined}
                    aria-label="Ponte CRM entre Captação e Vendas"
                    className={[
                      'flex flex-col items-center gap-1 px-1.5 py-1.5 rounded-lg transition-all min-w-[40px] cursor-pointer',
                      mostrarCrmBridge
                        ? 'bg-indigo-600/25 border-2 border-indigo-500'
                        : 'bg-indigo-500/10 border border-indigo-500/40 hover:bg-indigo-500/15',
                    ].join(' ')}
                  >
                    <div className="h-4 w-4 rounded-[5px] flex items-center justify-center bg-indigo-500/20 text-indigo-300">
                      <span className="text-[7px] font-black">⇄</span>
                    </div>
                    <span className="text-[8px] font-bold text-indigo-300">CRM</span>
                  </button>
                  <div className="h-px w-3 shrink-0 mx-0.5 bg-white/10" aria-hidden="true" />
                </div>
              )}
            </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* CONTEÚDO DA FASE EM FOCO                                            */}
      {/* ------------------------------------------------------------------ */}
      <div id="jornada_conteudo_fase">
        {mostrarCrmBridge ? (
          // Ponte CRM — não é uma das 9 fases, vive fora da máquina fasesConcluidas/faseAtualId
          <CrmBridgeFlow
            uid={uid}
            initialState={clientRecord?.crmBridge ?? null}
            contatosFase02={clientRecord?.fase02?.contatos ?? []}
            onSalvarContatoFaltante={(contato) => salvarContatoFaltanteNoFase02(uid, contato)}
            onVoltarCaptacao={() => {
              setMostrarCrmBridge(false);
              setFaseFocada('fase02_captacao');
            }}
          />
        ) : faseFocada === 'fase01_promessa_metodo' ? (
          // Fase 01 — modo edição: passa initialState com dados já salvos (A.4)
          <Fase01Flow uid={uid} initialState={clientRecord?.fase01 ?? null} />
        ) : faseFocada === 'fase02_captacao' ? (
          // Fase 02 — modo edição: idem
          <Fase02Flow
            uid={uid}
            initialState={clientRecord?.fase02 ?? null}
            onAvancarCrm={() => setMostrarCrmBridge(true)}
          />
        ) : faseFocada === 'fase03_vendas' ? (
          // Fase 03 — Vendas
          <Fase03Flow
            uid={uid}
            initialState={clientRecord?.fase03 ?? null}
            clientRecord={clientRecord}
          />
        ) : faseFocada === 'fase04_servicos' ? (
          // Fase 04 — Serviços & Modelagem
          <Fase04Flow
            uid={uid}
            initialState={clientRecord?.fase04 ?? null}
          />
        ) : faseFocada === 'fase09_metas_simulacao' ? (
          // Fase 09 — Metas & Simulação (Mesa de Controle Viva)
          <Fase09Flow uid={uid} clientRecord={clientRecord} />
        ) : (
          // Fases 5-8 — placeholder
          <FaseNaoImplementada
            nome={etapaFocada?.nome ?? ''}
            subtitulo={etapaFocada?.subtitulo ?? ''}
          />
        )}
      </div>
    </div>
  );
}
