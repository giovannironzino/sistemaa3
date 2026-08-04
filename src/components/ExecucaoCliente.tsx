import React, { useState, useEffect } from 'react';
import { ClientBlocks, WeekPlan, MonthlyRitual } from '../types';
import { saveWeekPlan, saveMonthlyRituals } from '../lib/db';
import { CheckSquare, Square, TrendingUp, DollarSign, Users, Award, Calendar, Plus } from 'lucide-react';

interface ExecucaoClienteProps {
  clientId: string;
  blocks: ClientBlocks;
  initialWeekPlans: Record<string, WeekPlan> | null;
  initialMonthlyRituals: MonthlyRitual[] | null;
  isConsultant: boolean; // if consultant, view-only checklist, view comparison logs
}

export default function ExecucaoCliente({
  clientId,
  blocks,
  initialWeekPlans,
  initialMonthlyRituals,
  isConsultant
}: ExecucaoClienteProps) {
  const [activeWeek, setActiveWeek] = useState<number>(0);
  const [weekPlans, setWeekPlans] = useState<Record<string, WeekPlan>>({});
  const [rituals, setRituals] = useState<MonthlyRitual[]>([]);

  // Ritual form states
  const [newMonthName, setNewMonthName] = useState('Mês 1');
  const [realFat, setRealFat] = useState(0);
  const [realPat, setRealPat] = useState(0);

  useEffect(() => {
    // Seed/Load week plans
    const plans: Record<string, WeekPlan> = {};
    for (let i = 0; i < 12; i++) {
      if (initialWeekPlans && initialWeekPlans[i]) {
        plans[i] = initialWeekPlans[i];
      } else {
        plans[i] = {
          weekIndex: i,
          actions: [],
          published: false
        };
      }
    }
    setWeekPlans(plans);

    // Load monthly rituals
    if (initialMonthlyRituals) {
      setRituals(initialMonthlyRituals);
    }
  }, [initialWeekPlans, initialMonthlyRituals]);

  const handleToggleAction = async (actionId: string) => {
    if (isConsultant) return; // view-only for consultant

    const currentPlan = weekPlans[activeWeek];
    const updatedActions = currentPlan.actions.map((act) => {
      if (act.id === actionId) {
        return { ...act, completed: !act.completed };
      }
      return act;
    });

    const updatedPlan: WeekPlan = {
      ...currentPlan,
      actions: updatedActions
    };

    setWeekPlans({
      ...weekPlans,
      [activeWeek]: updatedPlan
    });

    // Write directly to Firestore
    try {
      await saveWeekPlan(clientId, activeWeek, updatedPlan);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddRitual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isConsultant) return;

    // Get expected target from Block 9 based on selected month name
    let expectedFat = blocks.b9?.faturamento90 / 3 || 0;
    let expectedPat = blocks.b9?.pacientesAtivos || 0;

    if (newMonthName === 'Mês 1') {
      expectedFat = blocks.b9?.faturamentoM1 || blocks.b9?.faturamento90 / 3 || 0;
    } else if (newMonthName === 'Mês 2') {
      expectedFat = blocks.b9?.faturamentoM2 || blocks.b9?.faturamento90 * 0.6 || 0;
    } else if (newMonthName === 'Mês 3') {
      expectedFat = blocks.b9?.faturamentoM3 || blocks.b9?.faturamento90 || 0;
    }

    const newRitual: MonthlyRitual = {
      id: Math.random().toString(36).substring(2, 9),
      monthName: newMonthName,
      faturamentoReal: realFat,
      pacientesAtivosReal: realPat,
      faturamentoMeta: expectedFat,
      pacientesAtivosMeta: expectedPat,
      completedAt: new Date().toISOString()
    };

    const updatedRituals = [...rituals, newRitual];
    setRituals(updatedRituals);
    setRealFat(0);
    setRealPat(0);

    try {
      await saveMonthlyRituals(clientId, updatedRituals);
      alert('Ritual mensal registrado com sucesso!');
    } catch (err) {
      console.error(err);
    }
  };

  // Find active published weeks for selector
  const publishedWeeks = (Object.values(weekPlans) as WeekPlan[]).filter(p => p.published || isConsultant);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 font-sans" id="execucao_fase2_root">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 font-display flex items-center gap-2">
          <Award className="h-7 w-7 text-indigo-600 animate-bounce" />
          Fase 2: Acompanhamento da Execução
        </h1>
        <p className="text-sm text-slate-500">
          Acompanhe e execute suas ações semana a semana e faça o fechamento mensal (Ritual Mensal).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left columns: Weekly Checklist */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-700">
                Checklist de Execução Semanal
              </span>

              {/* Selector */}
              <select
                value={activeWeek}
                onChange={(e) => setActiveWeek(parseInt(e.target.value))}
                className="p-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 font-semibold"
                id="select_current_execution_week"
              >
                {Array.from({ length: 12 }).map((_, idx) => {
                  const isPub = weekPlans[idx]?.published;
                  if (!isPub && !isConsultant) return null;
                  return (
                    <option key={idx} value={idx}>
                      Semana {idx + 1} {!isPub && '(Rascunho)'}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Checklist items list */}
            <div className="space-y-2.5">
              {(!weekPlans[activeWeek]?.actions || weekPlans[activeWeek].actions.length === 0) ? (
                <div className="p-8 border-2 border-dashed border-slate-150 rounded-xl text-center text-slate-400 text-sm">
                  Sem ações publicadas para a Semana {activeWeek + 1} ainda.
                </div>
              ) : (
                weekPlans[activeWeek].actions.map((act) => (
                  <button
                    key={act.id}
                    type="button"
                    disabled={isConsultant}
                    onClick={() => handleToggleAction(act.id)}
                    className={`w-full p-4 border rounded-xl flex items-center justify-between gap-4 text-left transition-all ${
                      act.completed
                        ? 'border-emerald-200 bg-emerald-50/15'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex gap-3 items-start">
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider whitespace-nowrap mt-0.5">
                        {act.originBlock}
                      </span>
                      <p className={`text-sm ${act.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {act.text}
                      </p>
                    </div>

                    <div className="flex-shrink-0">
                      {act.completed ? (
                        <CheckSquare className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <Square className="h-5 w-5 text-slate-300 hover:text-slate-400" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right column: Ritual Mensal */}
        <div className="space-y-4">
          {/* Monthly ritual input box for client */}
          {!isConsultant && (
            <form onSubmit={handleAddRitual} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4" id="ritual_mensal_form_box">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-700 block border-b border-slate-100 pb-2">
                Logar Fechamento (Ritual Mensal)
              </span>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Selecione o Mês</label>
                  <select
                    value={newMonthName}
                    onChange={(e) => setNewMonthName(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded text-xs"
                  >
                    <option value="Mês 1">Mês 1 (Marco 30 Dias)</option>
                    <option value="Mês 2">Mês 2 (Marco 60 Dias)</option>
                    <option value="Mês 3">Mês 3 (Marco 90 Dias)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Faturamento Realizado (R$)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={realFat || ''}
                    onChange={(e) => setRealFat(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-slate-200 rounded text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Pacientes Ativos do Mês</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={realPat || ''}
                    onChange={(e) => setRealPat(parseInt(e.target.value) || 0)}
                    className="w-full p-2 border border-slate-200 rounded text-xs"
                  />
                </div>
              </div>

              <button
                id="btn_add_monthly_ritual"
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                Registrar Fechamento
              </button>
            </form>
          )}

          {/* Monthly achievement comparisons list */}
          <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-300 block border-b border-slate-800 pb-2">
              Histórico de Resultados vs Metas
            </span>

            {rituals.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Nenhum resultado logado ainda.</p>
            ) : (
              <div className="space-y-3">
                {rituals.map((r) => {
                  const achievePercentFat = r.faturamentoMeta > 0 ? (r.faturamentoReal / r.faturamentoMeta) * 100 : 100;
                  const achievePercentPat = r.pacientesAtivosMeta > 0 ? (r.pacientesAtivosReal / r.pacientesAtivosMeta) * 100 : 100;

                  return (
                    <div key={r.id} className="bg-slate-800 p-3 rounded-xl border border-slate-700 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-indigo-200">{r.monthName}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          Logado em {new Date(r.completedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px]">
                        {/* Faturamento Achievement */}
                        <div className="flex justify-between items-center text-slate-300">
                          <span>Faturamento Real: <b>R$ {r.faturamentoReal}</b></span>
                          <span className={`font-bold ${achievePercentFat >= 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {achievePercentFat.toFixed(0)}% da meta
                          </span>
                        </div>

                        {/* Patients Achievement */}
                        <div className="flex justify-between items-center text-slate-300">
                          <span>Pacientes Ativos: <b>{r.pacientesAtivosReal}</b></span>
                          <span className="font-bold text-slate-400">
                            {achievePercentPat.toFixed(0)}% da meta
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
