import React, { useState, useEffect } from 'react';
import { EixoSchema, QuestionSchema } from '../types';
import { streamQuestionsSchema, saveQuestionsSchema } from '../lib/db';
import { DEFAULT_EIXOS_SCHEMA } from '../lib/initialData';

export default function EditorDePerguntas() {
  const [eixos, setEixos] = useState<EixoSchema[]>(DEFAULT_EIXOS_SCHEMA);
  const [activeEixoIdx, setActiveEixoIdx] = useState<number>(0);
  const [optionDrafts, setOptionDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<boolean>(false);

  const typeOptions = [
    'Texto curto',
    'Área de texto',
    'Escolha única',
    'Múltipla escolha',
    'Slider (0–10)',
    'Moeda (R$)',
    'Tags',
    'Ranking'
  ];

  useEffect(() => {
    const unsubscribe = streamQuestionsSchema((schema) => {
      if (schema && schema.length > 0) setEixos(schema);
    });
    return () => unsubscribe();
  }, []);

  const activeEixo = eixos[activeEixoIdx] || eixos[0];

  const handleSaveSchema = async (updatedEixos: EixoSchema[]) => {
    setEixos(updatedEixos);
    setSaving(true);
    try {
      await saveQuestionsSchema(updatedEixos);
    } catch (e) {
      console.error('Erro ao salvar schema de perguntas:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleQuestionTextChange = (qId: string, text: string) => {
    const updatedEixos = eixos.map((e, idx) => {
      if (idx !== activeEixoIdx) return e;
      const updatedQuestions = e.questions.map((q) => (q.id === qId ? { ...q, question: text } : q));
      return { ...e, questions: updatedQuestions };
    });
    handleSaveSchema(updatedEixos);
  };

  const handleAddQuestion = () => {
    const newQuestion: QuestionSchema = {
      id: `q_${Date.now()}`,
      question: 'Nova Pergunta Diagnóstica',
      type: 'choice',
      options: ['Opção 1', 'Opção 2']
    };
    const updatedEixos = eixos.map((e, idx) => {
      if (idx !== activeEixoIdx) return e;
      return { ...e, questions: [...e.questions, newQuestion] };
    });
    handleSaveSchema(updatedEixos);
  };

  const handleRemoveQuestion = (qId: string) => {
    const updatedEixos = eixos.map((e, idx) => {
      if (idx !== activeEixoIdx) return e;
      return { ...e, questions: e.questions.filter((q) => q.id !== qId) };
    });
    handleSaveSchema(updatedEixos);
  };

  const handleMoveQuestion = (qId: string, dir: number) => {
    const questions = [...activeEixo.questions];
    const idx = questions.findIndex((q) => q.id === qId);
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= questions.length) return;
    [questions[idx], questions[targetIdx]] = [questions[targetIdx], questions[idx]];

    const updatedEixos = eixos.map((e, eIdx) => {
      if (eIdx !== activeEixoIdx) return e;
      return { ...e, questions };
    });
    handleSaveSchema(updatedEixos);
  };

  const handleAddOption = (qId: string) => {
    const val = (optionDrafts[qId] || '').trim();
    if (!val) return;
    const updatedEixos = eixos.map((e, idx) => {
      if (idx !== activeEixoIdx) return e;
      const updatedQuestions = e.questions.map((q) => {
        if (q.id !== qId) return q;
        const currentOpts = q.options || [];
        return { ...q, options: [...currentOpts, val] };
      });
      return { ...e, questions: updatedQuestions };
    });
    setOptionDrafts((prev) => ({ ...prev, [qId]: '' }));
    handleSaveSchema(updatedEixos);
  };

  const handleRemoveOption = (qId: string, optVal: string) => {
    const updatedEixos = eixos.map((e, idx) => {
      if (idx !== activeEixoIdx) return e;
      const updatedQuestions = e.questions.map((q) => {
        if (q.id !== qId) return q;
        return { ...q, options: (q.options || []).filter((o) => o !== optVal) };
      });
      return { ...e, questions: updatedQuestions };
    });
    handleSaveSchema(updatedEixos);
  };

  return (
    <div className="relative flex min-h-[calc(100vh-140px)] bg-[#05070a] text-slate-200 font-sans border border-white/10 rounded-xl overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-[-140px] left-[200px] w-[560px] h-[560px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />

      {/* Left Sidebar (280px) */}
      <div className="relative z-10 w-[280px] flex-shrink-0 border-r border-white/10 flex flex-col bg-[#090d16]">
        <div className="p-5 border-b border-white/10 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[7px] bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center font-extrabold text-xs text-white">
            A3
          </div>
          <div className="font-bold text-sm text-slate-50">Editor de Perguntas</div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {eixos.map((ex, idx) => {
            const isSelected = idx === activeEixoIdx;
            return (
              <button
                key={ex.id}
                type="button"
                onClick={() => setActiveEixoIdx(idx)}
                className={`w-full text-left p-3 rounded-xl flex items-center gap-3 border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-500/15 border-indigo-500/50 text-white'
                    : 'bg-transparent border-transparent text-slate-300 hover:bg-white/5'
                }`}
              >
                <div className="font-mono text-xs font-bold text-indigo-400">E0{idx + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-100 truncate">{ex.label}</div>
                  <div className="text-[10px] text-slate-500">{ex.questions.length} perguntas</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Panel */}
      <div className="relative z-10 flex-1 overflow-y-auto p-8 max-w-4xl space-y-6">
        <div>
          <div className="text-[11px] font-semibold tracking-widest uppercase text-slate-500 mb-1">
            EIXO 0{activeEixoIdx + 1}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-50 tracking-tight">
            {activeEixo.label}
          </h1>
        </div>

        <div className="space-y-4">
          {activeEixo.questions.map((q, qIdx) => (
            <div key={q.id} className="card-glass p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex flex-col gap-1 flex-shrink-0 pt-1">
                  <button
                    type="button"
                    onClick={() => handleMoveQuestion(q.id, -1)}
                    disabled={qIdx === 0}
                    className="w-6 h-5 rounded border border-white/15 text-slate-400 text-xs hover:bg-white/10 disabled:opacity-30 cursor-pointer"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveQuestion(q.id, 1)}
                    disabled={qIdx === activeEixo.questions.length - 1}
                    className="w-6 h-5 rounded border border-white/15 text-slate-400 text-xs hover:bg-white/10 disabled:opacity-30 cursor-pointer"
                  >
                    ↓
                  </button>
                </div>

                <textarea
                  value={q.question}
                  onChange={(e) => handleQuestionTextChange(q.id, e.target.value)}
                  rows={2}
                  className="flex-1 input-utility p-3 text-xs leading-relaxed font-semibold text-slate-100"
                />

                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(q.id)}
                  className="text-slate-500 hover:text-rose-400 text-lg font-bold p-1 cursor-pointer"
                  title="Remover pergunta"
                >
                  ×
                </button>
              </div>

              {/* Options list for choices */}
              <div className="pl-9 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">Opções de Resposta:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(q.options || []).map((opt) => (
                    <span
                      key={opt}
                      className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs px-3 py-1 rounded-full font-semibold"
                    >
                      {opt}
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(q.id, opt)}
                        className="text-indigo-400 hover:text-white font-bold cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 max-w-sm pt-1">
                  <input
                    type="text"
                    value={optionDrafts[q.id] || ''}
                    onChange={(e) => setOptionDrafts((prev) => ({ ...prev, [q.id]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddOption(q.id);
                    }}
                    placeholder="Digite uma opção e aperte Enter..."
                    className="input-utility flex-1 px-3 py-1.5 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddOption(q.id)}
                    className="btn-ghost px-3 py-1.5 text-xs"
                  >
                    + Adicionar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddQuestion}
          className="btn-ghost w-full py-3.5 text-xs uppercase tracking-wider font-bold"
        >
          + Adicionar pergunta a este eixo
        </button>
      </div>
    </div>
  );
}
