// BoxMatchDeDados.tsx
// Componente de Match de Dados A3 em 2 Colunas ("Box que Salta à Tela").
// Apresenta: Coluna 1 (O Que Importamos - Dado Bruto) vs Coluna 2 (O Que Achamos Que É O Match - Sugestão A3).
// Respeita a Regra Mandatória: A resposta final é sempre do usuário, individualmente item por item.

import React, { useState } from 'react';
import { Sparkles, Check, Edit2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import type { ItemCestaExtraido } from '../lib/geminiImportService';

interface BoxMatchDeDadosProps {
  tituloEixo: string;
  itens: ItemCestaExtraido[];
  onConfirmarItem: (item: ItemCestaExtraido) => void;
  onConfirmarTodos: (itensConfirmados: ItemCestaExtraido[]) => void;
  onIgnorar: () => void;
}

export default function BoxMatchDeDados({
  tituloEixo,
  itens,
  onConfirmarItem,
  onConfirmarTodos,
  onIgnorar,
}: BoxMatchDeDadosProps) {
  const [listaItens, setListaItens] = useState<ItemCestaExtraido[]>(itens);

  if (listaItens.length === 0) return null;

  function handleConfirmarSingle(item: ItemCestaExtraido) {
    onConfirmarItem(item);
    setListaItens((prev) => prev.filter((i) => i.id !== item.id));
  }

  function handleConfirmarTodosAction() {
    onConfirmarTodos(listaItens);
    setListaItens([]);
  }

  return (
    <div className="w-full bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border-2 border-indigo-500/50 rounded-2xl p-5 shadow-2xl space-y-4 animate-fade-in relative overflow-hidden">
      {/* Brilho decorativo de destaque */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header do Box que Salta à Tela */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-indigo-500/20 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
              🌾 Match de Dados A3 · {tituloEixo}
            </span>
            <h3 className="text-base font-bold text-white leading-tight">
              Revisão &amp; Confirmação Individual de Dados Importados
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onIgnorar}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
          >
            Pular Revisão
          </button>
          <button
            type="button"
            onClick={handleConfirmarTodosAction}
            className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" /> Confirmar Todos ({listaItens.length})
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">
        💡 Encontramos <strong className="text-indigo-400">{listaItens.length} registro(s)</strong> recepcionados da sua Cesta de Dados para esta etapa.
        Confira a comparação em 2 colunas abaixo e confirme item por item individualmente:
      </p>

      {/* Tabela Comparativa em 2 Colunas */}
      <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
        {listaItens.map((item, idx) => (
          <div
            key={item.id || idx}
            className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3.5 bg-slate-950/90 rounded-xl border border-slate-800 hover:border-indigo-500/40 transition-all items-center"
          >
            {/* COLUNA 1: O QUE IMPORTAMOS (Dado Bruto) */}
            <div className="md:col-span-5 space-y-1">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                COLUNA 1: O QUE IMPORTAMOS (Dado Bruto)
              </span>
              <div className="text-xs font-bold text-white truncate font-mono" title={item.nome}>
                {item.nome}
              </div>
              <span className="text-[10px] text-slate-400 font-medium block">
                Origem: {item.origemColhedor === 'colhedor01_prontuario' ? 'WebDiet / Prontuário' : 'Print de Tela / Cesta'}
              </span>
            </div>

            {/* Ícone de Seta / Match */}
            <div className="hidden md:flex md:col-span-1 justify-center items-center text-indigo-400">
              <ArrowRight className="h-4 w-4" />
            </div>

            {/* COLUNA 2: O QUE ACHAMOS QUE É O MATCH (Sugestão A3) */}
            <div className="md:col-span-4 space-y-1">
              <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block">
                COLUNA 2: SUGESTÃO DE MATCH A3
              </span>
              <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                  🟢 {item.tipo === 'paciente' ? 'Paciente Ativo' : item.tipo === 'servico' ? 'Serviço' : 'Contato Captação'}
                </span>
                {item.valor ? (
                  <span className="text-emerald-400 font-mono font-bold">R$ {item.valor}</span>
                ) : null}
              </div>
            </div>

            {/* AÇÃO INDIVIDUAL DO USUÁRIO */}
            <div className="md:col-span-2 flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => handleConfirmarSingle(item)}
                className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow cursor-pointer flex items-center justify-center gap-1"
                title="Confirmar Match deste item"
              >
                <Check className="h-3.5 w-3.5" /> Confirmar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
