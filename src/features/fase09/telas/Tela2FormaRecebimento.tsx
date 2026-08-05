// Tela2FormaRecebimento.tsx
// Tela 2 — Forma de Recebimento (Eixo 09)

import React, { useState } from 'react';
import { CreditCard, ArrowRight, Info, Percent, HelpCircle } from 'lucide-react';
import type { FormaRecebimentoId, Fase09Assumptions } from '../eixo09.types';

interface Tela2Props {
  premissas: Fase09Assumptions;
  initialFormaRecebimento?: FormaRecebimentoId | null;
  onAvancar: (dados: {
    formaRecebimento: FormaRecebimentoId;
    novasPremissas: Partial<Fase09Assumptions>;
  }) => void;
}

const OPCOES_FORMA: { id: FormaRecebimentoId; label: string; descricao: string }[] = [
  {
    id: 'antecipado',
    label: 'Receber tudo agora (Antecipado)',
    descricao: 'Você recebe o valor total da venda no início do contrato, antecipando as parcelas junto ao banco.',
  },
  {
    id: 'parcelado_sem_antecipar',
    label: 'Receber aos poucos (Parcelado sem antecipar)',
    descricao: 'Você recebe mês a mês conforme o paciente paga a parcela no cartão, sem pagar taxa de antecipação.',
  },
  {
    id: 'recorrencia',
    label: 'Recorrência (cartão ou PIX)',
    descricao: 'Cobranças automáticas que se repetem todo mês sem comprometer o limite total do cartão do paciente.',
  },
];

export default function Tela2FormaRecebimento({
  premissas,
  initialFormaRecebimento,
  onAvancar,
}: Tela2Props) {
  const [selecionado, setSelecionado] = useState<FormaRecebimentoId>(
    initialFormaRecebimento ?? 'antecipado'
  );

  // Premissas temporárias (impostos, taxa cartão, taxa antecipação)
  const precisaColetarPremissas =
    premissas.impostosPercentual === null ||
    premissas.taxaCartaoPercentual === null ||
    premissas.taxaAntecipacaoPercentual === null;

  const [impostos, setImpostos] = useState<number>(premissas.impostosPercentual ?? 6);
  const [taxaCartao, setTaxaCartao] = useState<number>(premissas.taxaCartaoPercentual ?? 3);
  const [taxaAntecipacao, setTaxaAntecipacao] = useState<number>(premissas.taxaAntecipacaoPercentual ?? 4);

  const [erro, setErro] = useState<string | null>(null);

  function handleAvancar() {
    setErro(null);
    if (!selecionado) {
      setErro('Por favor, selecione uma forma de recebimento.');
      return;
    }

    if (precisaColetarPremissas) {
      if (impostos < 0 || taxaCartao < 0 || taxaAntecipacao < 0) {
        setErro('As taxas não podem ser valores negativos.');
        return;
      }
    }

    onAvancar({
      formaRecebimento: selecionado,
      novasPremissas: precisaColetarPremissas
        ? {
            impostosPercentual: impostos,
            taxaCartaoPercentual: taxaCartao,
            taxaAntecipacaoPercentual: taxaAntecipacao,
          }
        : {},
    });
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8" id="tela2_forma_recebimento">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
          <CreditCard className="h-3.5 w-3.5 text-indigo-400" />
          <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase font-label">
            Eixo 09 · Metas & Simulação · Tela 2
          </span>
        </div>

        <h1 className="text-xl font-bold text-white leading-snug">
          Como você prefere receber o dinheiro das suas vendas?
        </h1>
      </div>

      {/* Explicação Didática */}
      <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 text-sm text-slate-300 leading-relaxed">
        <p>
          Quando um paciente parcela o pagamento no cartão, existe uma pergunta importante: você quer o dinheiro todo de uma vez, ou prefere receber um pouquinho por mês, junto com a parcela dele?
        </p>
        <p className="text-xs text-slate-400 bg-black/30 p-3 rounded-xl border border-white/5">
          <strong>Exemplo:</strong> seu paciente fechou um plano de R$ 1.200,00 em 6 vezes no cartão. Você pode:
          <br />• Pedir ao banco pra te dar os R$ 1.200,00 inteiros agora mesmo — mas o banco cobra uma taxa por isso (antecipação).
          <br />• Ou esperar e receber R$ 200,00 por mês durante os 6 meses — sem pagar essa taxa, mas o dinheiro chega mais devagar.
          <br />• Ou cobranças que se repetem todo mês (recorrência no cartão ou PIX). Essa forma sempre entra inteira, sem taxa de banco.
        </p>
      </div>

      {/* Opções (Choice Cards) */}
      <div className="space-y-3">
        {OPCOES_FORMA.map((opcao) => {
          const isSelected = selecionado === opcao.id;
          return (
            <button
              key={opcao.id}
              type="button"
              id={`forma_recebimento_${opcao.id}`}
              onClick={() => setSelecionado(opcao.id)}
              aria-pressed={isSelected}
              className={[
                'w-full flex items-start gap-4 px-5 py-4 rounded-xl border text-left transition-all',
                isSelected
                  ? 'bg-indigo-600/15 border-indigo-500/50 shadow-lg ring-1 ring-indigo-500/30'
                  : 'bg-white/4 border-white/10 hover:bg-white/7',
              ].join(' ')}
            >
              <div
                className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  isSelected ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/8 text-slate-500'
                }`}
              >
                <CreditCard className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <span
                  className={`text-sm font-bold block ${isSelected ? 'text-white' : 'text-slate-300'}`}
                >
                  {opcao.label}
                </span>
                <span className="text-xs text-slate-400 block leading-normal">
                  {opcao.descricao}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Aviso informativo de Recorrência */}
      {selecionado === 'recorrencia' && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 leading-relaxed">
          <Info className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
          <p>
            <em>Lembre-se:</em> cobranças no PIX dependem mais da atenção do paciente pra continuar funcionando todo mês do que cobranças no cartão. Vale acompanhar de perto.
          </p>
        </div>
      )}

      {/* Mini-Formulário de Coleta Embutida de Taxas (se necessário) */}
      {precisaColetarPremissas && (
        <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-4">
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
            <HelpCircle className="h-4 w-4 shrink-0 text-indigo-400" />
            <span>Premissas de Taxas & Impostos (Fase 08 Temporária)</span>
          </div>
          <p className="text-xs text-indigo-200/80 leading-relaxed">
            Informe suas taxas aproximadas para calcularmos o dinheiro limpo no seu bolso:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Alíquota de Imposto (%):
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  id="input_impostos"
                  value={impostos ?? ''}
                  onChange={(e) => setImpostos(Number(e.target.value))}
                  placeholder="6.0"
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white font-semibold text-sm focus:outline-none focus:border-indigo-500"
                />
                <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Taxa Cartão/Máquina (%):
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  id="input_taxa_cartao"
                  value={taxaCartao ?? ''}
                  onChange={(e) => setTaxaCartao(Number(e.target.value))}
                  placeholder="3.0"
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white font-semibold text-sm focus:outline-none focus:border-indigo-500"
                />
                <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Taxa Antecipação (%):
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  id="input_taxa_antecipacao"
                  value={taxaAntecipacao ?? ''}
                  onChange={(e) => setTaxaAntecipacao(Number(e.target.value))}
                  placeholder="4.0"
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/15 text-white font-semibold text-sm focus:outline-none focus:border-indigo-500"
                />
                <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Erro */}
      {erro && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 font-semibold">
          {erro}
        </div>
      )}

      {/* Botão Avançar */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          id="btn_tela2_avancar"
          onClick={handleAvancar}
          className="btn-primary flex items-center gap-2 px-6 py-3.5 text-sm font-bold rounded-xl"
        >
          Avançar para Escolha de Caminho
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
