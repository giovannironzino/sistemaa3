import React, { useState, useEffect } from 'react';
import { ClientBlocks, WeekPlan, ActionItem } from '../types';
import { saveWeekPlan, updateClientProfile } from '../lib/db';
import { Plus, Trash2, Check, Send, AlertCircle, ArrowLeft } from 'lucide-react';

interface PlanoSemanasProps {
  clientId: string;
  clientName: string;
  blocks: ClientBlocks;
  initialWeekPlans: Record<string, WeekPlan> | null;
  onBack: () => void;
  onPublishComplete?: () => void;
  isConsultant: boolean; // consultant can edit, client can only view
}

export default function PlanoSemanas({
  clientId,
  clientName,
  blocks,
  initialWeekPlans,
  onBack,
  onPublishComplete,
  isConsultant
}: PlanoSemanasProps) {
  const [activeWeek, setActiveWeek] = useState<number>(0);
  const [weekPlans, setWeekPlans] = useState<Record<string, WeekPlan>>({});
  const [newActionText, setNewActionText] = useState('');
  const [newActionBlock, setNewActionBlock] = useState('Captação');

  useEffect(() => {
    // Seed empty plans for all 12 weeks if not already present
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
  }, [initialWeekPlans]);

  const handleAddAction = () => {
    if (!newActionText.trim()) return;

    const currentPlan = weekPlans[activeWeek];
    const newAction: ActionItem = {
      id: Math.random().toString(36).substring(2, 9),
      text: newActionText,
      completed: false,
      originBlock: newActionBlock
    };

    const updatedPlan: WeekPlan = {
      ...currentPlan,
      actions: [...currentPlan.actions, newAction]
    };

    setWeekPlans({
      ...weekPlans,
      [activeWeek]: updatedPlan
    });

    setNewActionText('');
  };

  const handleRemoveAction = (actionId: string) => {
    const currentPlan = weekPlans[activeWeek];
    const updatedPlan: WeekPlan = {
      ...currentPlan,
      actions: currentPlan.actions.filter(a => a.id !== actionId)
    };

    setWeekPlans({
      ...weekPlans,
      [activeWeek]: updatedPlan
    });
  };

  const handleSaveWeekDraft = async () => {
    try {
      const plan = weekPlans[activeWeek];
      await saveWeekPlan(clientId, activeWeek, plan);
      alert('Rascunho da semana salvo com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar rascunho.');
    }
  };

  const handlePublishWeek = async () => {
    try {
      const plan = weekPlans[activeWeek];
      const publishedPlan: WeekPlan = {
        ...plan,
        published: true
      };

      // Save to state
      setWeekPlans({
        ...weekPlans,
        [activeWeek]: publishedPlan
      });

      // Save to Firebase
      await saveWeekPlan(clientId, activeWeek, publishedPlan);

      // If this is the final week, or the first published week, let's unlock execution
      // Or we can let them publish and update profile step
      await updateClientProfile(clientId, { currentStep: 'execucao', fase: 2 });

      alert(`Semana ${activeWeek + 1} publicada com sucesso! O cliente já pode visualizar e marcar as ações.`);
      if (onPublishComplete) onPublishComplete();
    } catch (err) {
      console.error(err);
      alert('Erro ao publicar semana.');
    }
  };

  const originBlocksList = ['Promessa & Método', 'Captação', 'Vendas', 'Serviços', 'Entrega & Rotina', 'Agenda', 'Equipe', 'Financeiro', 'Meta'];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 font-sans" id="plano_semanas_root">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 border border-slate-200 bg-white text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-50 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 font-display">
              Plano de 12 Semanas
            </h1>
            <p className="text-sm text-slate-500">
              {isConsultant ? `Montando plano de ação para: ${clientName}` : 'Seu cronograma de metas e acompanhamento'}
            </p>
          </div>
        </div>

        {isConsultant && (
          <div className="flex gap-2">
            <button
              id="btn_save_week_draft"
              type="button"
              onClick={handleSaveWeekDraft}
              className="py-2.5 px-4 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Salvar Rascunho
            </button>
            <button
              id="btn_publish_week_plan"
              type="button"
              onClick={handlePublishWeek}
              className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Send className="h-4 w-4" />
              Publicar Semana {activeWeek + 1}
            </button>
          </div>
        )}
      </div>

      {/* Week Selector index list */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6" id="weeks_tabs_scroller">
        {Array.from({ length: 12 }).map((_, idx) => {
          const plan = weekPlans[idx];
          const isPublished = plan?.published;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveWeek(idx)}
              className={`px-3 py-2 border rounded-xl text-xs font-semibold transition-all flex-shrink-0 flex items-center gap-1.5 ${
                activeWeek === idx
                  ? 'border-indigo-600 bg-indigo-50/20 text-indigo-900 font-bold'
                  : 'border-slate-200 bg-white text-slate-500 hover:text-slate-700'
              }`}
            >
              Semana {idx + 1}
              {isPublished && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" title="Publicado" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main card box of the active week */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-xs font-extrabold text-indigo-700 uppercase tracking-widest">
            Semana {activeWeek + 1} — {weekPlans[activeWeek]?.published ? 'Publicado' : 'Rascunho'}
          </span>
          {!weekPlans[activeWeek]?.published && (
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" />
              O cliente não consegue visualizar ações em modo Rascunho.
            </span>
          )}
        </div>

        {/* Add actions form (Consultant only) */}
        {isConsultant && (
          <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-4" id="add_action_form_box">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Nova Ação Estratégica:</span>
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                value={newActionText}
                onChange={(e) => setNewActionText(e.target.value)}
                placeholder="Ex: Entrar em contato com os 5 pacientes inativos para renegociar..."
                className="flex-1 p-2.5 border border-slate-200 rounded-lg text-sm bg-white"
              />
              <div className="flex gap-2">
                <select
                  value={newActionBlock}
                  onChange={(e) => setNewActionBlock(e.target.value)}
                  className="p-2.5 border border-slate-200 rounded-lg text-xs bg-white font-medium text-slate-700"
                >
                  {originBlocksList.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <button
                  id="btn_add_action_item"
                  type="button"
                  onClick={handleAddAction}
                  className="py-2.5 px-4 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Actions Checklist list */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Checklist de Ações para esta Semana:</span>

          {(!weekPlans[activeWeek]?.actions || weekPlans[activeWeek].actions.length === 0) ? (
            <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-sm">
              Sem ações estratégicas cadastradas para esta semana ainda.
            </div>
          ) : (
            <div className="space-y-2">
              {weekPlans[activeWeek].actions.map((act) => (
                <div
                  key={act.id}
                  className="p-3.5 bg-slate-50/50 border border-slate-200 rounded-xl flex items-center justify-between gap-4 text-xs font-medium"
                >
                  <div className="flex-1 flex gap-3 items-start">
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider whitespace-nowrap mt-0.5">
                      {act.originBlock}
                    </span>
                    <p className="text-sm text-slate-800 pt-0.5">{act.text}</p>
                  </div>

                  {isConsultant && (
                    <button
                      type="button"
                      onClick={() => handleRemoveAction(act.id)}
                      className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-red-50 transition-colors"
                      title="Excluir Ação"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
