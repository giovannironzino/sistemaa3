import React, { useState, useEffect } from 'react';
import { ClientRecord, Scenario, ActionItem, WeekPlan, EixoSchema } from '../types';
import { streamConsultantClients, updateClientProfile, saveConsultantComments, saveClientScenario, saveWeekPlan, streamQuestionsSchema } from '../lib/db';
import { DEFAULT_EIXOS_SCHEMA } from '../lib/initialData';
import GestaoCliente from './GestaoCliente';
import EditorDePerguntas from './EditorDePerguntas';

interface PainelConsultorProps {
  consultorId: string;
  consultorName: string;
}

export default function PainelConsultor({ consultorId, consultorName }: PainelConsultorProps) {
  const [clients, setClients] = useState<any[]>([]);
  const [activeClientId, setActiveClientId] = useState<string>('');
  const [clientSearch, setClientSearch] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'retrato' | 'simulacao' | 'plano' | 'gestao' | 'editor'>('retrato');

  // Retrato tab states
  const [activeEixoFilter, setActiveEixoFilter] = useState<number>(0);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  // Simulation tab states
  const [scenarios, setScenarios] = useState<Record<string, Scenario>>({});

  // Plano tab states
  const [activeWeek, setActiveWeek] = useState<number>(0);
  const [weekPlans, setWeekPlans] = useState<Record<string, WeekPlan>>({});
  const [newTaskText, setNewTaskText] = useState<string>('');
  const [newTaskOrigin, setNewTaskOrigin] = useState<string>('Captação');

  // Eixos schema
  const [eixosSchema, setEixosSchema] = useState<EixoSchema[]>(DEFAULT_EIXOS_SCHEMA);

  useEffect(() => {
    const unsubscribe = streamConsultantClients(consultorId, (list) => {
      setClients(list);
      if (list.length > 0 && !activeClientId) {
        setActiveClientId(list[0].profile?.clientId || list[0].clientId || '');
      }
    });
    return () => unsubscribe();
  }, [consultorId, activeClientId]);

  useEffect(() => {
    const unsubscribe = streamQuestionsSchema((schema) => {
      if (schema && schema.length > 0) setEixosSchema(schema);
    });
    return () => unsubscribe();
  }, []);

  const activeClientRecord: ClientRecord | null = clients.find(
    (c) => (c.profile?.clientId || c.clientId) === activeClientId
  ) || null;

  useEffect(() => {
    if (activeClientRecord) {
      setComments(activeClientRecord.comments || {});
      setScenarios(activeClientRecord.scenarios || {});
    }
  }, [activeClientRecord]);

  const filteredClients = clients.filter((c) => {
    const name = c.profile?.clientName || c.clientName || '';
    const email = c.profile?.clientEmail || c.clientEmail || '';
    const query = clientSearch.toLowerCase();
    return name.toLowerCase().includes(query) || email.toLowerCase().includes(query);
  });

  const getInitials = (name: string) => {
    if (!name) return 'CL';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const stepLabels: Record<string, string> = {
    retrato: '1. O Retrato',
    call1: '2. Call 1',
    caminho: '3. O Caminho',
    call2: '4. Call 2',
    plano: '5. O Plano',
    call3: '6. Call 3',
    execucao: '7. Execução'
  };

  const handleAdvanceStep = async () => {
    if (!activeClientRecord) return;
    const currentStep = activeClientRecord.profile.currentStep;
    const order: ('retrato' | 'call1' | 'caminho' | 'call2' | 'plano' | 'call3' | 'execucao')[] = [
      'retrato', 'call1', 'caminho', 'call2', 'plano', 'call3', 'execucao'
    ];
    const idx = order.indexOf(currentStep);
    if (idx >= 0 && idx < order.length - 1) {
      const nextStep = order[idx + 1];
      await updateClientProfile(activeClientId, { currentStep: nextStep });
    }
  };

  const handleSaveComment = async (qId: string, val: string) => {
    const updated = { ...comments, [qId]: val };
    setComments(updated);
    if (activeClientId) {
      await saveConsultantComments(activeClientId, updated);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#05070a] text-slate-200 flex overflow-hidden font-sans">
      {/* Background Radial Glow */}
      <div className="absolute top-[-140px] left-[200px] w-[560px] h-[560px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />

      {/* Left Sidebar (280px) */}
      <div className="relative z-10 w-[280px] flex-shrink-0 border-r border-white/10 flex flex-col h-screen bg-[#090d16]">
        <div className="p-5 flex items-center gap-2.5 border-b border-white/10 flex-shrink-0">
          <div className="w-7 h-7 rounded-[7px] bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center font-extrabold text-xs text-white">
            A3
          </div>
          <div className="font-bold text-sm text-slate-50 whitespace-nowrap">
            Painel do Consultor
          </div>
        </div>

        <div className="p-4 border-b border-white/5 flex-shrink-0">
          <input
            type="text"
            value={clientSearch}
            onChange={(e) => setClientSearch(e.target.value)}
            placeholder="Buscar cliente..."
            className="input-utility w-full px-3 py-2 text-xs"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {filteredClients.map((cl) => {
            const id = cl.profile?.clientId || cl.clientId;
            const name = cl.profile?.clientName || cl.clientName || 'Cliente';
            const step = cl.profile?.currentStep || 'retrato';
            const isSelected = id === activeClientId;

            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveClientId(id)}
                className={`w-full text-left p-3 rounded-xl flex items-center gap-3 border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-500/15 border-indigo-500/50 text-white'
                    : 'bg-transparent border-transparent text-slate-300 hover:bg-white/5'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {getInitials(name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-100 truncate">{name}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {stepLabels[step] || step}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content View */}
      <div className="relative z-10 flex-1 flex flex-col h-screen overflow-hidden bg-[#05070a]">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-white/10 flex-shrink-0 bg-[#090d16]">
          <div>
            <h1 className="text-xl font-extrabold text-slate-50 tracking-tight">
              {activeClientRecord?.profile?.clientName || 'Selecione um Cliente'}
            </h1>
            <div className="text-xs text-slate-400 mt-0.5">
              Etapa atual: <span className="text-indigo-400 font-semibold">{stepLabels[activeClientRecord?.profile?.currentStep || 'retrato']}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleAdvanceStep}
              className="btn-primary px-5 py-2.5 text-xs uppercase tracking-wider"
            >
              Liberar próxima etapa →
            </button>
          </div>
        </div>

        {/* Sub-tabs Navigation */}
        <div className="flex gap-2 px-8 pt-4 pb-2 border-b border-white/5 flex-shrink-0 bg-[#090d16]">
          {[
            { id: 'retrato', label: '1. O Retrato' },
            { id: 'simulacao', label: '2. Motor de Simulação' },
            { id: 'plano', label: '3. Plano de 12 Semanas' },
            { id: 'gestao', label: '4. Gestão do Cliente' },
            { id: 'editor', label: '5. Editor de Perguntas' },
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

        {/* Body Container */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'retrato' && (
            <div className="max-w-3xl space-y-6">
              {/* Axis Filter Chips */}
              <div className="flex gap-2 flex-wrap mb-6">
                {eixosSchema.map((e, idx) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => setActiveEixoFilter(idx)}
                    className={`pill-option ${activeEixoFilter === idx ? 'pill-option-selected' : ''} px-3.5 py-1.5 text-xs`}
                  >
                    E0{idx + 1} · {e.label}
                  </button>
                ))}
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {(eixosSchema[activeEixoFilter]?.questions || []).map((q) => (
                  <div key={q.id} className="card-glass p-5 space-y-3">
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                      EIXO 0{activeEixoFilter + 1} · {q.id}
                    </div>
                    <div className="text-sm font-bold text-slate-50 leading-snug">
                      {q.question}
                    </div>
                    <div className="text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3">
                      Resposta do Cliente: {activeClientRecord?.blocks?.[`b${activeEixoFilter + 1}`]?.[q.id] || 'Sem resposta registrada.'}
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpandedComments((prev) => ({ ...prev, [q.id]: !prev[q.id] }))}
                      className="text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {expandedComments[q.id] ? '− Ocultar orientação' : '+ Adicionar orientação do consultor...'}
                    </button>
                    {expandedComments[q.id] && (
                      <textarea
                        value={comments[q.id] || ''}
                        onChange={(e) => handleSaveComment(q.id, e.target.value)}
                        placeholder="Adicione uma orientação técnica para este ponto..."
                        rows={2}
                        className="input-utility w-full p-3 text-xs bg-amber-500/5 border-amber-500/20 text-amber-200 placeholder-amber-500/50"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'simulacao' && (
            <div className="max-w-4xl space-y-6">
              <h3 className="font-bold text-base text-white">Simulação de Cenários Estratégicos</h3>
              <p className="text-xs text-slate-400">Ajuste os parâmetros para projetar o faturamento e a ocupação da agenda.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  { name: 'Cenário Conservador', fat: 20000, cap: 60, breakEven: 12000 },
                  { name: 'Cenário Moderado', fat: 28000, cap: 80, breakEven: 12000, isOfficial: true },
                  { name: 'Cenário Acelerado', fat: 35000, cap: 95, breakEven: 12000 },
                ].map((sc, i) => (
                  <div key={i} className="card-glass p-5 flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">{sc.name}</span>
                      {sc.isOfficial && <span className="status-success text-[10px] px-2 py-0.5 font-bold">Oficial</span>}
                    </div>
                    <div className="space-y-2">
                      <div className="text-[10px] text-slate-400 uppercase">Faturamento Esperado</div>
                      <div className="text-xl font-extrabold text-indigo-300">R$ {sc.fat.toLocaleString('pt-BR')}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Agenda</span>
                        <span className="font-bold text-white">{sc.cap}%</span>
                      </div>
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full" style={{ width: `${sc.cap}%` }} />
                      </div>
                    </div>
                    <button type="button" className="btn-primary w-full py-2 text-xs">
                      Aprovar Cenário
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'gestao' && activeClientRecord && (
            <GestaoCliente
              clientRecord={activeClientRecord}
              onBack={() => setActiveTab('retrato')}
              isConsultant={true}
            />
          )}

          {activeTab === 'editor' && (
            <EditorDePerguntas />
          )}
        </div>
      </div>
    </div>
  );
}
