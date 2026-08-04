import React, { useState, useEffect } from 'react';
import { ClientRecord, CallRecord, MonthlyRitual } from '../types';
import { updateClientProfile, saveClientCalls, saveMonthlyRituals } from '../lib/db';

interface GestaoClienteProps {
  clientRecord: ClientRecord;
  onBack: () => void;
  isConsultant: boolean;
}

export default function GestaoCliente({ clientRecord, onBack, isConsultant }: GestaoClienteProps) {
  const { profile, blocks, monthlyRituals, calls: initialCalls, activityLog: initialLog } = clientRecord;

  const [activeTab, setActiveTab] = useState<'visao' | 'rituais' | 'calls'>('visao');

  const journeySteps = [
    { key: 'retrato', label: '1. O Retrato', dateLabel: 'Diagnóstico' },
    { key: 'call1', label: '2. Call 1', dateLabel: 'Alinhamento' },
    { key: 'caminho', label: '3. O Caminho', dateLabel: 'Simulação' },
    { key: 'call2', label: '4. Call 2', dateLabel: 'Escolha' },
    { key: 'plano', label: '5. O Plano', dateLabel: '12 Semanas' },
    { key: 'call3', label: '6. Call 3', dateLabel: 'Entrega' },
    { key: 'execucao', label: '7. Execução', dateLabel: 'Fase 2' }
  ];

  const getStepIndex = (step: string) => journeySteps.findIndex((s) => s.key === step);
  const currentStepIdx = getStepIndex(profile?.currentStep || 'retrato');

  // Calls state
  const [calls, setCalls] = useState<Record<string, CallRecord>>(() => {
    if (initialCalls && Object.keys(initialCalls).length > 0) return initialCalls;
    return {
      c1: {
        id: 'c1',
        title: 'Call 1 · Alinhamento Diagnóstico',
        date: new Date().toLocaleDateString('pt-BR'),
        transcript: '',
        agenda: [
          { id: '1', text: 'Validar posicionamento e promessa central do método', done: true },
          { id: '2', text: 'Debater gargalos de captação e canais de vendas atuais', done: false },
          { id: '3', text: 'Analisar tempo de entrega clínica por paciente', done: false }
        ]
      }
    };
  });
  const [activeCallId, setActiveCallId] = useState<string>('c1');

  // Monthly Rituals state
  const [rituals, setRituals] = useState<MonthlyRitual[]>(() => {
    if (monthlyRituals && monthlyRituals.length > 0) return monthlyRituals;
    return [
      {
        id: 'm1',
        monthName: 'Mês 1',
        faturamentoReal: blocks?.b8?.faturamentoAtual || 0,
        pacientesAtivosReal: 15,
        faturamentoMeta: blocks?.b9?.faturamentoM1 || 20000,
        pacientesAtivosMeta: 25,
        completedAt: ''
      },
      {
        id: 'm2',
        monthName: 'Mês 2',
        faturamentoReal: 0,
        pacientesAtivosReal: 0,
        faturamentoMeta: blocks?.b9?.faturamentoM2 || 25000,
        pacientesAtivosMeta: 35,
        completedAt: ''
      },
      {
        id: 'm3',
        monthName: 'Mês 3',
        faturamentoReal: 0,
        pacientesAtivosReal: 0,
        faturamentoMeta: blocks?.b9?.faturamentoM3 || 30000,
        pacientesAtivosMeta: 45,
        completedAt: ''
      }
    ];
  });

  const getInitials = (name: string) => {
    if (!name) return 'CL';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const handleAdvanceStep = async () => {
    const stepsOrder: ('retrato' | 'call1' | 'caminho' | 'call2' | 'plano' | 'call3' | 'execucao')[] = [
      'retrato', 'call1', 'caminho', 'call2', 'plano', 'call3', 'execucao'
    ];
    const idx = getStepIndex(profile.currentStep);
    if (idx >= 0 && idx < stepsOrder.length - 1) {
      await updateClientProfile(profile.clientId, { currentStep: stepsOrder[idx + 1] });
    }
  };

  const handleUpdateRitual = async (ritualId: string, field: 'faturamentoReal' | 'pacientesAtivosReal', val: number) => {
    const updated = rituals.map((r) => (r.id === ritualId ? { ...r, [field]: val } : r));
    setRituals(updated);
    await saveMonthlyRituals(profile.clientId, updated);
  };

  const activeCall = calls[activeCallId] || Object.values(calls)[0];

  return (
    <div className="relative min-h-screen bg-[#05070a] text-slate-200 p-6 sm:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back Button */}
        <div>
          <button
            type="button"
            onClick={onBack}
            className="text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
          >
            ← Voltar ao painel
          </button>
        </div>

        {/* Client Header Card */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-extrabold text-lg flex items-center justify-center">
              {getInitials(profile?.clientName || 'Cliente')}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-50 tracking-tight">
                {profile?.clientName}
              </h1>
              <div className="text-xs text-slate-400 mt-0.5">
                {profile?.clientEmail} · Cadastrado em {new Date(profile?.createdAt || Date.now()).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>

          {isConsultant && (
            <div className="flex gap-3">
              <button type="button" className="btn-ghost px-4 py-2.5 text-xs">
                Agendar Call
              </button>
              <button type="button" onClick={handleAdvanceStep} className="btn-primary px-5 py-2.5 text-xs">
                Liberar próxima etapa →
              </button>
            </div>
          )}
        </div>

        {/* Timeline Journey Stepper */}
        <div className="card-glass p-6 overflow-x-auto flex items-center justify-between gap-2">
          {journeySteps.map((js, idx) => {
            const isCompleted = idx < currentStepIdx;
            const isCurrent = idx === currentStepIdx;

            return (
              <div key={js.key} className="flex items-center flex-1 min-w-[100px]">
                <div className="flex flex-col items-center gap-2 flex-shrink-0 mx-auto">
                  <div
                    className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                      isCurrent
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50'
                        : isCompleted
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                        : 'bg-white/5 border border-white/10 text-slate-500'
                    }`}
                  >
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                  <div className="text-center">
                    <div className={`text-[11px] font-semibold ${isCurrent ? 'text-white' : 'text-slate-400'}`}>
                      {js.label}
                    </div>
                    <div className="text-[9px] text-slate-600">{js.dateLabel}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-2">
          {[
            { id: 'visao', label: 'Visão Geral' },
            { id: 'rituais', label: 'Rituais Mensais' },
            { id: 'calls', label: 'Calls de Alinhamento' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`pill-option ${activeTab === tab.id ? 'pill-option-selected' : ''} px-4 py-2 text-xs`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Visão Geral */}
        {activeTab === 'visao' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card-glass p-5">
                <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-2">Faturamento Atual</div>
                <div className="text-2xl font-extrabold text-slate-50">
                  R$ {(blocks?.b8?.faturamentoAtual || 0).toLocaleString('pt-BR')}
                </div>
              </div>
              <div className="card-glass p-5">
                <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-2">Capacidade Agenda</div>
                <div className="text-2xl font-extrabold text-amber-400">82%</div>
              </div>
              <div className="card-glass p-5">
                <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-2">Meta 90 Dias</div>
                <div className="text-2xl font-extrabold text-slate-50">
                  R$ {(blocks?.b9?.faturamento90 || 0).toLocaleString('pt-BR')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Rituais Mensais */}
        {activeTab === 'rituais' && (
          <div className="space-y-4 max-w-3xl">
            {rituals.map((r) => {
              const isMetaAchieved = r.faturamentoReal >= r.faturamentoMeta && r.faturamentoMeta > 0;
              return (
                <div key={r.id} className="card-glass p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base text-white">{r.monthName}</span>
                    <span className={isMetaAchieved ? 'status-success text-xs px-3 py-1 font-bold' : 'status-warning text-xs px-3 py-1 font-bold'}>
                      {isMetaAchieved ? 'Meta Atingida' : 'Em Acompanhamento'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-slate-400">Faturamento Real</span>
                        <span className="text-slate-500">Meta: R$ {r.faturamentoMeta.toLocaleString('pt-BR')}</span>
                      </div>
                      <input
                        type="number"
                        value={r.faturamentoReal || ''}
                        onChange={(e) => handleUpdateRitual(r.id, 'faturamentoReal', Number(e.target.value))}
                        disabled={!isConsultant}
                        className="input-highlight text-xl"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-slate-400">Pacientes Ativos</span>
                        <span className="text-slate-500">Meta: {r.pacientesAtivosMeta}</span>
                      </div>
                      <input
                        type="number"
                        value={r.pacientesAtivosReal || ''}
                        onChange={(e) => handleUpdateRitual(r.id, 'pacientesAtivosReal', Number(e.target.value))}
                        disabled={!isConsultant}
                        className="input-highlight text-xl"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: Calls */}
        {activeTab === 'calls' && activeCall && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-glass p-5 space-y-3">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                Transcrição Completa da Call
              </div>
              <textarea
                value={activeCall.transcript || ''}
                onChange={(e) => {
                  const updatedCall = { ...activeCall, transcript: e.target.value };
                  const updatedCalls = { ...calls, [activeCallId]: updatedCall };
                  setCalls(updatedCalls);
                  saveClientCalls(profile.clientId, updatedCalls);
                }}
                rows={14}
                placeholder="Cole ou digite a transcrição desta call..."
                className="input-utility w-full p-4 text-xs leading-relaxed"
              />
            </div>

            <div className="card-glass p-5 space-y-3">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                Pauta Estratégica
              </div>
              <div className="space-y-2">
                {activeCall.agenda?.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg text-xs">
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => {
                        const updatedAgenda = activeCall.agenda.map((ag) =>
                          ag.id === item.id ? { ...ag, done: !ag.done } : ag
                        );
                        const updatedCall = { ...activeCall, agenda: updatedAgenda };
                        const updatedCalls = { ...calls, [activeCallId]: updatedCall };
                        setCalls(updatedCalls);
                        saveClientCalls(profile.clientId, updatedCalls);
                      }}
                      className="accent-indigo-500 cursor-pointer"
                    />
                    <span className={item.done ? 'line-through text-slate-500' : 'text-slate-200'}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
