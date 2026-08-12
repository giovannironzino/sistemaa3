// GavetaAplicarMetas.tsx
// Gaveta Interativa de Aplicação e Retroalimentação de Metas em Linguagem Simples

import React, { useState } from 'react';
import { X, Rocket, CheckCircle2, ArrowRight, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import type { SimuladorState, ResultadoSimulado } from '../eixo09.types';
import type { ContextoFasesAnteriores } from '../lib/obterContextoFasesAnteriores';
import { aplicarMetasSimuladasNoSistema, OpcoesAplicacaoMetas, OPCOES_APLICACAO_PADRAO } from '../lib/retroalimentarSistemaService';

interface GavetaAplicarMetasProps {
  isOpen: boolean;
  onClose: () => void;
  uid: string;
  state: SimuladorState;
  resultado: ResultadoSimulado;
  contexto: ContextoFasesAnteriores;
  onSucesso: (mensagem: string) => void;
}

export default function GavetaAplicarMetas({
  isOpen,
  onClose,
  uid,
  state,
  resultado,
  contexto,
  onSucesso,
}: GavetaAplicarMetasProps) {
  const [opcoes, setOpcoes] = useState<OpcoesAplicacaoMetas>(OPCOES_APLICACAO_PADRAO);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  function toggleOpcao(key: keyof OpcoesAplicacaoMetas) {
    setOpcoes((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleConfirmar() {
    setLoading(true);
    const res = await aplicarMetasSimuladasNoSistema(uid, state, resultado, contexto, opcoes);
    setLoading(false);
    if (res.sucesso) {
      onSucesso(res.mensagem);
      onClose();
    } else {
      alert(res.mensagem);
    }
  }

  const formatBrl = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border-l border-white/10 h-full flex flex-col justify-between shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-950/60 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Rocket className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Transformar Simulação em Metas Reais
              </h2>
              <p className="text-xs text-slate-400">
                Linguagem Simples · Atualização Automática nos 8 Eixos
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6 flex-grow">
          {/* Summary Box */}
          <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-3">
            <div className="flex items-center justify-between text-xs text-indigo-300 font-bold uppercase tracking-wider">
              <span>Resumo do Seu Novo Alvo A3</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {resultado.classificacaoExequibilidade} ({resultado.scoreExequibilidadeA3}%)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-xs text-slate-400 block">Sobra Líquida Desejada:</span>
                <span className="text-base font-extrabold text-emerald-400">
                  {formatBrl(resultado.lucroLiquidoSimulado)} / mês
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Carga Horária Exigida:</span>
                <span className="text-base font-extrabold text-indigo-300">
                  {resultado.cargaHorariaSemanalExigida}h / semana
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-300 border-t border-indigo-500/20 pt-2 leading-relaxed">
              💡 {resultado.explicacaoSimplesExequibilidade}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Escolha quais partes do sistema você quer atualizar agora:
            </h3>

            {/* Toggle 1: Eixo 02 */}
            <div
              onClick={() => toggleOpcao('atualizarMetaLeadsEixo02')}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                opcoes.atualizarMetaLeadsEixo02
                  ? 'bg-slate-800/80 border-indigo-500/50 text-white'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <input
                type="checkbox"
                checked={opcoes.atualizarMetaLeadsEixo02}
                onChange={() => {}}
                className="mt-1 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="flex-grow space-y-1">
                <span className="text-sm font-bold block">
                  📢 Eixo 02 (Captação): Nova Meta de Contatos
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Define o objetivo comercial de buscar pelo menos{' '}
                  <strong className="text-indigo-300">{resultado.leadsNecessariosMes} contatos/mês</strong>{' '}
                  para garantir suas vendas.
                </p>
              </div>
            </div>

            {/* Toggle 2: Eixo 04 */}
            <div
              onClick={() => toggleOpcao('atualizarPrecosEixo04')}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                opcoes.atualizarPrecosEixo04
                  ? 'bg-slate-800/80 border-indigo-500/50 text-white'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <input
                type="checkbox"
                checked={opcoes.atualizarPrecosEixo04}
                onChange={() => {}}
                className="mt-1 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="flex-grow space-y-1">
                <span className="text-sm font-bold block">
                  🏷️ Eixo 04 (Serviços): Atualizar Tabela de Preços
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {state.card2Ativo && state.reajusteValorReais > 0
                    ? `Aplica o reajuste de +${formatBrl(state.reajusteValorReais)} no valor de referência dos seus programas de acompanhamento.`
                    : 'Mantém a tabela de preços atual sincronizada com o simulador.'}
                </p>
              </div>
            </div>

            {/* Toggle 3: Eixo 06 */}
            <div
              onClick={() => toggleOpcao('atualizarAgendaEixo06')}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                opcoes.atualizarAgendaEixo06
                  ? 'bg-slate-800/80 border-indigo-500/50 text-white'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <input
                type="checkbox"
                checked={opcoes.atualizarAgendaEixo06}
                onChange={() => {}}
                className="mt-1 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="flex-grow space-y-1">
                <span className="text-sm font-bold block">
                  ⏰ Eixo 06 (Agenda): Ajustar Teto de Horas Livres
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Fixa seu limite semanal de trabalho em{' '}
                  <strong className="text-indigo-300">{state.tetoSemanaPerfeita}h / semana</strong> para evitar exaustão.
                </p>
              </div>
            </div>

            {/* Toggle 4: Eixo 07 */}
            <div
              onClick={() => toggleOpcao('atualizarEquipeEixo07')}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                opcoes.atualizarEquipeEixo07
                  ? 'bg-slate-800/80 border-indigo-500/50 text-white'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <input
                type="checkbox"
                checked={opcoes.atualizarEquipeEixo07}
                onChange={() => {}}
                className="mt-1 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="flex-grow space-y-1">
                <span className="text-sm font-bold block">
                  👥 Eixo 07 (Equipe): Roadmap de Contratação
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Registra as novas contratações planejadas no quadro de funções do consultório.
                </p>
              </div>
            </div>

            {/* Toggle 5: Eixo 08 */}
            <div
              onClick={() => toggleOpcao('atualizarDreEixo08')}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                opcoes.atualizarDreEixo08
                  ? 'bg-slate-800/80 border-indigo-500/50 text-white'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <input
                type="checkbox"
                checked={opcoes.atualizarDreEixo08}
                onChange={() => {}}
                className="mt-1 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="flex-grow space-y-1">
                <span className="text-sm font-bold block">
                  📊 Eixo 08 (Financeiro): DRE Executiva Alvo
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Fixa a meta de receita mensal de{' '}
                  <strong className="text-emerald-400">{formatBrl(resultado.receitaSimuladaMensal)}</strong> na sua DRE orçada.
                </p>
              </div>
            </div>

            {/* Toggle 6: Fase 2 */}
            <div
              onClick={() => toggleOpcao('gerarChecklistFase2')}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                opcoes.gerarChecklistFase2
                  ? 'bg-slate-800/80 border-emerald-500/50 text-white'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <input
                type="checkbox"
                checked={opcoes.gerarChecklistFase2}
                onChange={() => {}}
                className="mt-1 rounded border-slate-700 text-emerald-600 focus:ring-emerald-500"
              />
              <div className="flex-grow space-y-1">
                <span className="text-sm font-bold block text-emerald-400">
                  ✅ Fase 2 (Execução): Checklists e Metas Semanais
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cria as metas práticas no seu painel semanal para acompanhar sua evolução no dia a dia.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-slate-950/80 sticky bottom-0 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white text-xs font-semibold hover:bg-white/5 transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleConfirmar}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>Atualizando sistema...</span>
            ) : (
              <>
                <Rocket className="h-4 w-4" />
                Desdobrar Metas no Sistema
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
