// Fase05Flow.tsx
// Módulo Eixo 05 — Entrega & Rotina (Entregáveis Clínicos, Customização e SLA de Suporte)

import React, { useState } from 'react';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { CheckCircle2, Clock, PackageCheck, MessageSquare, ArrowRight, Sparkles } from 'lucide-react';
import { ENTREGAVEIS_OPTIONS, NIVEL_CUSTOMIZACAO_OPTIONS, SLA_RESPOSTA_OPTIONS, ESTRATEGIA_INATIVIDADE_OPTIONS } from '../../lib/initialData';

interface Fase05FlowProps {
  uid: string;
  initialState?: any;
  onAvancarEixo06?: () => void;
}

export default function Fase05Flow({ uid, initialState, onAvancarEixo06 }: Fase05FlowProps) {
  const [entregaveis, setEntregaveis] = useState<string[]>(initialState?.entregaveis ?? [ENTREGAVEIS_OPTIONS[0], ENTREGAVEIS_OPTIONS[1]]);
  const [nivelCustomizacao, setNivelCustomizacao] = useState<string>(initialState?.nivelCustomizacao ?? NIVEL_CUSTOMIZACAO_OPTIONS[0]);
  const [slaResposta, setSlaResposta] = useState<string>(initialState?.slaResposta ?? SLA_RESPOSTA_OPTIONS[0]);
  const [estrategiaInatividade, setEstrategiaInatividade] = useState<string>(initialState?.estrategiaInatividade ?? ESTRATEGIA_INATIVIDADE_OPTIONS[0]);
  const [salvo, setSalvo] = useState(false);

  function toggleEntregavel(item: string) {
    setEntregaveis((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  }

  async function handleSalvar() {
    try {
      const data = {
        entregaveis,
        nivelCustomizacao,
        slaResposta,
        estrategiaInatividade,
        fase05Completa: true,
        atualizadoEm: new Date().toISOString(),
      };
      const ref = doc(db, 'clients', uid);
      await updateDoc(ref, { fase05: data }).catch(async () => {
        await setDoc(ref, { fase05: data }, { merge: true });
      });
      setSalvo(true);
      setTimeout(() => setSalvo(false), 3000);
      if (onAvancarEixo06) onAvancarEixo06();
    } catch (err) {
      console.error('[Fase05Flow] Erro ao salvar:', err);
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 py-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
            Eixo 05 · Entrega &amp; Rotina Clínica
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white">Como você entrega o acompanhamento no dia a dia?</h1>
        <p className="text-sm text-slate-400">
          Defina os entregáveis inclusos no seu atendimento, a política de SLA de suporte e o protocolo de encantamento do cliente.
        </p>
      </div>

      {/* 1. Entregáveis Clínicos Inclusos */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <PackageCheck className="h-4 w-4 text-emerald-400" />
          1. Quais destes entregáveis fazem parte da sua consulta/programa?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ENTREGAVEIS_OPTIONS.map((item) => {
            const active = entregaveis.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleEntregavel(item)}
                className={`text-left text-xs p-3.5 rounded-xl border transition-all cursor-pointer ${
                  active
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-white font-semibold shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {active ? '✅ ' : '⚪ '} {item}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Nível de Customização */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock className="h-4 w-4 text-emerald-400" />
          2. Qual o grau de customização da sua entrega?
        </h3>
        <div className="space-y-2.5">
          {NIVEL_CUSTOMIZACAO_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setNivelCustomizacao(opt)}
              className={`w-full text-left text-xs p-4 rounded-xl border transition-all cursor-pointer ${
                nivelCustomizacao === opt
                  ? 'bg-emerald-500/15 border-emerald-500/50 text-white font-semibold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* 3. SLA de Suporte WhatsApp */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-emerald-400" />
          3. SLA de Resposta: Qual a sua regra para tirar dúvidas no WhatsApp?
        </h3>
        <div className="space-y-2.5">
          {SLA_RESPOSTA_OPTIONS.map((sla) => (
            <button
              key={sla}
              type="button"
              onClick={() => setSlaResposta(sla)}
              className={`w-full text-left text-xs p-4 rounded-xl border transition-all cursor-pointer ${
                slaResposta === sla
                  ? 'bg-emerald-500/15 border-emerald-500/50 text-white font-semibold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              {sla}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Quadro de Status de Entregáveis por Paciente */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <PackageCheck className="h-4 w-4 text-emerald-400" />
          4. Quadro de Status das Entregas (O que já foi entregue vs O que ainda falta)
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Mapeie o progresso das entregas dos seus pacientes ativos para descobrir o seu passivo operacional pendente e calcular a sua demanda real de agenda no Eixo 06.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              🟢 O que JÁ foi entregue aos pacientes ativos:
            </span>
            <ul className="text-xs text-slate-300 space-y-1.5">
              <li className="flex items-center gap-2">✓ Consulta Inicial de Anamnese &amp; Alinhamento</li>
              <li className="flex items-center gap-2">✓ Elaboração e Envio do Plano Alimentar</li>
              <li className="flex items-center gap-2">✓ Avaliação de Exames Laboratoriais</li>
            </ul>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              ⏳ O que AINDA FALTA entregar no acompanhamento:
            </span>
            <ul className="text-xs text-slate-300 space-y-1.5">
              <li className="flex items-center gap-2">⏳ 2º Retorno de Acompanhamento Presencial / Online</li>
              <li className="flex items-center gap-2">⏳ Bioimpedância de Controle de 30 Dias</li>
              <li className="flex items-center gap-2">⏳ Checagem Intermediária de Ajustes no WhatsApp</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-6">
        {salvo ? (
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" /> Dados salvos com sucesso!
          </span>
        ) : <div />}

        <button
          type="button"
          onClick={handleSalvar}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
        >
          Salvar e Avançar para Agenda (Eixo 06)
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
