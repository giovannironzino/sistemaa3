// TelaConfirmacaoCesta.tsx
// Tela de Validação Item por Item (Pessoa por Pessoa, Serviço por Serviço, Item por Item).
// Respeita a Regra de Ouro: "O Usuário é o Detentor Original da Informação".

import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, HelpCircle, Trash2, ArrowRight, Sparkles, Check } from 'lucide-react';
import type { ItemCestaExtraido } from '../lib/geminiImportService';

interface TelaConfirmacaoCestaProps {
  itensIniciais: ItemCestaExtraido[];
  softwareDetectado?: string;
  totalAtivosDetectados?: number;
  ocultarHeader?: boolean;
  onConfirmar: (itensValidados: ItemCestaExtraido[]) => void;
  onCancelar: () => void;
}

export default function TelaConfirmacaoCesta({
  itensIniciais,
  softwareDetectado = 'WebDiet / WhatsApp',
  totalAtivosDetectados = 35,
  ocultarHeader = false,
  onConfirmar,
  onCancelar,
}: TelaConfirmacaoCestaProps) {
  const [itens, setItens] = useState<ItemCestaExtraido[]>(itensIniciais);

  function handleUpdateItem(id: string, updates: Partial<ItemCestaExtraido>) {
    setItens((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...updates, statusIntegridade: 'ok' } : item
      )
    );
  }

  function handleRemoverItem(id: string) {
    setItens((prev) => prev.filter((item) => item.id !== id));
  }

  const itensOk = itens.filter((i) => i.statusIntegridade === 'ok').length;
  const itensDuvida = itens.filter((i) => i.statusIntegridade === 'duvida').length;
  const itensPendente = itens.filter((i) => i.statusIntegridade === 'pendente').length;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 py-2 animate-fade-in">
      {/* Header (Opcional) */}
      {!ocultarHeader && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/40 rounded-2xl p-6 space-y-3 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                O Grande Colhedor A3 · Validação Humana Item por Item
              </span>
              <h1 className="text-xl font-bold text-white leading-tight">
                Revisão &amp; Confirmação da Cesta de Dados
              </h1>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            💡 Encontramos <strong className="text-emerald-400">{itens.length} registros</strong> a partir dos relatórios/prints do <strong className="text-white">{softwareDetectado}</strong>.
            Confira cada item abaixo e preencha as dúvidas destacadas em amarelo ou vermelho. <strong>O usuário é o detentor original da informação!</strong>
          </p>

          {/* Indicadores de Integridade */}
          <div className="flex items-center gap-3 pt-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
              🟢 {itensOk} Identificados com Precisão
            </span>
            {itensDuvida > 0 && (
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold">
                🟡 {itensDuvida} Com Dúvida
              </span>
            )}
            {itensPendente > 0 && (
              <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-bold">
                🔴 {itensPendente} Pendentes de Nome
              </span>
            )}
          </div>
        </div>
      )}

      {/* Indicador de Resumo Limpo quando ocultarHeader for True */}
      {ocultarHeader && (
        <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-slate-200 font-medium">
            Encontramos <strong className="text-emerald-400">{itens.length} pacientes válidos</strong> no relatório do <strong className="text-white">{softwareDetectado}</strong>.
          </span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold shrink-0">
            ✓ 100% Sanitizado
          </span>
        </div>
      )}

      {/* Lista de Itens para Validação Pessoa por Pessoa */}
      <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
        {itens.map((item, idx) => {
          const isOk = item.statusIntegridade === 'ok';
          const isDuvida = item.statusIntegridade === 'duvida';

          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                isOk
                  ? 'bg-slate-900/80 border-slate-800'
                  : 'bg-amber-500/8 border-amber-500/30 shadow-lg shadow-amber-500/5'
              }`}
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-500">#{idx + 1}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isOk ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {isOk ? '🟢 Confirmado' : '🟡 Revisão Recomendada'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({item.origemColhedor === 'colhedor01_prontuario' ? 'Prontuário' : 'WhatsApp/Direct'})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoverItem(item.id)}
                  className="text-xs text-slate-500 hover:text-red-400 p-1 cursor-pointer"
                  title="Remover este item da Cesta"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Campos Editáveis Enxutos: Nome + Valor Pago */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Nome do Paciente:
                  </label>
                  <input
                    type="text"
                    value={item.nome}
                    onChange={(e) => handleUpdateItem(item.id, { nome: e.target.value })}
                    placeholder="Digite o nome correto..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Ticket Pago (R$):
                  </label>
                  <input
                    type="number"
                    value={item.valor || ''}
                    onChange={(e) => handleUpdateItem(item.id, { valor: parseFloat(e.target.value) || 0 })}
                    placeholder="Ex: 450"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-400 font-bold font-mono focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer de Ação */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-5">
        <button
          type="button"
          onClick={onCancelar}
          className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
        >
          Cancelar e Voltar
        </button>

        <button
          type="button"
          onClick={() => onConfirmar(itens)}
          disabled={itens.length === 0}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm px-8 py-3.5 rounded-xl transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
        >
          <Check className="h-4 w-4" />
          Confirmar e Alagar Todos os Eixos do Sistema A3 ({itens.length} itens)
        </button>
      </div>
    </div>
  );
}
