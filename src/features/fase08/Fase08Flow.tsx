// Fase08Flow.tsx
// Módulo Eixo 08 — Financeiro, Caixa Real & DRE em LINGUAGEM SIMPLES.
// 100% Analítico e Neutro (Sem Simuladores nem Dicas — Simulação Exclusiva do Eixo 09).
// Incorpora: DRE Automática, Análise Completa de Precificação por Serviço, Diagnóstico Fiscal (CPF vs CNPJ) e Break-even Point.

import React, { useState, useMemo } from 'react';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { DollarSign, Plus, Trash2, CheckCircle2, ArrowRight, Sparkles, AlertTriangle, Layers, Scale, Calculator, ShieldCheck, Tag } from 'lucide-react';
import { calcularDreExecutiva, DespesaFixaItem } from './lib/calcularDreExecutiva';
import { calcularPrecificacaoServicos } from './lib/calcularPrecificacaoServicos';

interface Fase08FlowProps {
  uid: string;
  initialState?: any;
  pacientesEixo01Count?: number;
  custoFolhaEixo07?: number;
  custoEquipeEixo07?: number;
  clientRecord?: any;
  servicosEixo04?: Array<{ id?: string; nome?: string; titulo?: string; preco?: number; valor?: number; duracaoHoras?: number }>;
  onAvancarEixo09?: () => void;
}

export default function Fase08Flow({
  uid,
  initialState,
  pacientesEixo01Count = 38,
  custoFolhaEixo07,
  custoEquipeEixo07 = 3200,
  servicosEixo04 = [],
  onAvancarEixo09,
}: Fase08FlowProps) {
  const folhaEixo07Final = custoFolhaEixo07 ?? custoEquipeEixo07;
  const [faturamentoInput, setFaturamentoInput] = useState<number>(initialState?.faturamentoBrutoMensal ?? 22500);

  // Despesas Fixas Operacionais
  const [despesas, setDespesas] = useState<DespesaFixaItem[]>(() => {
    if (Array.isArray(initialState?.despesas) && initialState.despesas.length > 0) {
      return initialState.despesas;
    }
    return [
      { id: 'd1', categoria: 'equipe', descricao: 'Folha de Pagamento da Equipe', valorMensal: folhaEixo07Final, origemAutomatico: 'Eixo 07 (Equipe)' },
      { id: 'd2', categoria: 'software', descricao: 'WebDiet / Softwares de Prontuário & CRM', valorMensal: 350, origemAutomatico: 'Eixo 01 & 06' },
      { id: 'd3', categoria: 'estrutura', descricao: 'Aluguel de Consultório & Condomínio', valorMensal: 2500 },
      { id: 'd4', categoria: 'estrutura', descricao: 'Contabilidade Mensal & CRN', valorMensal: 600 },
    ];
  });

  // Formulário de Nova Despesa
  const [descricaoNova, setDescricaoNova] = useState('');
  const [valorNovo, setValorNovo] = useState('');
  const [categoriaNova, setCategoriaNova] = useState<DespesaFixaItem['categoria']>('estrutura');
  const [salvo, setSalvo] = useState(false);

  // Motores de Cálculo em Linguagem Simples
  const dre = useMemo(() => {
    return calcularDreExecutiva(despesas, faturamentoInput, pacientesEixo01Count, 450);
  }, [despesas, faturamentoInput, pacientesEixo01Count]);

  const precificacao = useMemo(() => {
    return calcularPrecificacaoServicos(servicosEixo04, dre.despesasFixasTotaisMensais, 120);
  }, [servicosEixo04, dre.despesasFixasTotaisMensais]);

  function handleAdicionarDespesa(e: React.FormEvent) {
    e.preventDefault();
    if (!descricaoNova.trim()) return;

    const nova: DespesaFixaItem = {
      id: `d_${Date.now()}`,
      categoria: categoriaNova,
      descricao: descricaoNova.trim(),
      valorMensal: parseFloat(valorNovo) || 0,
    };

    setDespesas((prev) => [...prev, nova]);
    setDescricaoNova('');
    setValorNovo('');
  }

  function handleRemoverDespesa(id: string) {
    setDespesas((prev) => prev.filter((d) => d.id !== id));
  }

  async function handleSalvar() {
    try {
      const data = {
        faturamentoBrutoMensal: dre.faturamentoBrutoMensal,
        despesas,
        lucroLiquidoMensal: dre.lucroLiquidoMensal,
        margemEbitdaPercentual: dre.margemEbitdaPercentual,
        pontoEquilibrioPacientesAtivos: dre.pontoEquilibrioPacientesAtivos,
        economiaAnualCnpj: dre.economiaAnualCnpj,
        precificacaoDiagnostico: precificacao.serviciosDetalhados,
        fase08Completa: true,
        atualizadoEm: new Date().toISOString(),
      };
      const ref = doc(db, 'clients', uid);
      await updateDoc(ref, { fase08: data }).catch(async () => {
        await setDoc(ref, { fase08: data }, { merge: true });
      });
      setSalvo(true);
      setTimeout(() => setSalvo(false), 3000);
      if (onAvancarEixo09) onAvancarEixo09();
    } catch (err) {
      console.error('[Fase08Flow] Erro ao salvar:', err);
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 py-6 animate-fade-in">
      {/* Header em Linguagem Simples */}
      <div className="space-y-2 border-b border-slate-800 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
            Eixo 08 · Financeiro, Caixa Real &amp; DRE
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white">Saúde Financeira, Caixa &amp; Precificação do Consultório</h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          Sua DRE executiva é consolidada automaticamente a partir das entradas dos serviços e da folha da equipe. Confira o lucro líquido real, o raio-x de precificação e o comparativo de impostos.
        </p>
      </div>

      {/* ── SEÇÃO 1: DRE EXECUTIVA GERADA AUTOMÁTICA (VISÃO SIMPLIFICADA) ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              1. Demonstrativo Financeiro de Caixa (DRE Simplificada)
            </h2>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 font-mono">
            Sobra Líquida: R$ {dre.lucroLiquidoMensal.toLocaleString('pt-BR')} / mês ({dre.margemEbitdaPercentual}%)
          </span>
        </div>

        {/* Card do Faturamento Bruto */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-white block">Entradas Totais de Caixa (Faturamento Mensal)</span>
            <p className="text-[11px] text-slate-400">
              Valor médio mensal recebido da sua base ativa de pacientes e novos atendimentos.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">R$</span>
            <input
              type="number"
              min={0}
              value={faturamentoInput}
              onChange={(e) => setFaturamentoInput(parseFloat(e.target.value) || 0)}
              className="w-36 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-emerald-400 font-extrabold text-right focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Linhas da DRE */}
        <div className="space-y-2.5 text-xs font-semibold">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-300">1. Faturamento Bruto Total:</span>
            <span className="font-mono text-emerald-400 font-bold">R$ {dre.faturamentoBrutoMensal.toLocaleString('pt-BR')}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">(-) Impostos (Simples Nacional ~6%) &amp; Taxas de Cartão (~3.5%):</span>
            <span className="font-mono text-amber-400 font-bold">-R$ {dre.impostosETaxasMensais.toLocaleString('pt-BR')}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-300">(=) Margem de Contribuição:</span>
            <span className="font-mono text-white font-bold">R$ {dre.margemContribuicaoMensal.toLocaleString('pt-BR')}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">
              (-) Custos Fixos Operacionais (Softwares, Estrutura &amp; <strong className="text-white">Folha do Eixo 07: R$ {dre.despesasEquipeFolhaMensal.toLocaleString('pt-BR')}</strong>):
            </span>
            <span className="font-mono text-red-400 font-bold">-R$ {dre.despesasFixasTotaisMensais.toLocaleString('pt-BR')}</span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-sm font-extrabold">
            <span className="text-emerald-400">(=) LUCRO LÍQUIDO REAL (Sua Sobra Final):</span>
            <span className="font-mono text-emerald-300 text-base">R$ {dre.lucroLiquidoMensal.toLocaleString('pt-BR')} / mês</span>
          </div>
        </div>
      </div>

      {/* ── SEÇÃO 2: ANÁLISE COMPLETA DE PRECIFICAÇÃO & MARGEM REAL POR SERVIÇO ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-1">
            <Tag className="h-3 w-3 text-indigo-400" />
            <span className="text-[10px] font-bold text-indigo-400 uppercase">Unit Economics · Raio-X de Precificação</span>
          </div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            2. Análise de Precificação &amp; Margem Real por Serviço
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Cruza o preço de tabela do Eixo 04 com o tempo técnico do Eixo 06 e custos fixos para identificar se cada produto gera <strong>Lucro Real</strong> ou <strong>Prejuízo Oculto</strong>.
          </p>
        </div>

        {/* Informação do Custo da Hora Técnica */}
        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="text-slate-300 font-semibold">Custo da Hora Clínica do Seu Consultório:</span>
          <span className="font-mono font-bold text-indigo-400">
            R$ {precificacao.custoHoraClinicaConsultorio.toLocaleString('pt-BR')} / hora técnica
          </span>
        </div>

        {/* Tabela de Produtos */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950 text-[10px] uppercase font-bold text-slate-400">
                <th className="p-3">Serviço Cadastrado (Eixo 04)</th>
                <th className="p-3">Preço de Tabela</th>
                <th className="p-3 text-center">Tempo Total (Horas)</th>
                <th className="p-3 text-center">Custo Direto Total</th>
                <th className="p-3 text-right">Lucro Real / Margem</th>
                <th className="p-3 text-right">Piso Recomendado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs font-medium">
              {precificacao.serviciosDetalhados.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-all">
                  <td className="p-3 font-bold text-white">
                    {item.nomeServico}
                    {item.statusMargem === 'prejuizo_oculto' && (
                      <span className="ml-2 px-2 py-0.5 rounded text-[9px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                        ⚠️ Prejuízo Oculto
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-emerald-400 font-mono font-bold">R$ {item.precoTabela}</td>
                  <td className="p-3 text-center text-slate-300">{item.horasDedicadasTotal}h</td>
                  <td className="p-3 text-center text-red-400 font-mono">R$ {item.custoDiretoTotal}</td>
                  <td className="p-3 text-right font-mono font-bold">
                    <span className={item.lucroLiquidoReal < 0 ? 'text-red-400' : 'text-emerald-400'}>
                      R$ {item.lucroLiquidoReal} ({item.margemLucroPercentual}%)
                    </span>
                  </td>
                  <td className="p-3 text-right text-indigo-300 font-mono font-bold">
                    R$ {item.pisoMinimoRecomendado}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SEÇÃO 3: DIAGNÓSTICO FISCAL COMPARATIVO (CPF VS CNPJ) ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Scale className="h-4 w-4 text-emerald-400" />
          3. Diagnóstico Fiscal Comparativo (Pessoa Física CPF vs CNPJ)
        </h2>
        <p className="text-xs text-slate-400">
          Comparativo transparente de impostos entre emitir recibo no CPF (Carnê-Leão) ou faturar no CNPJ (Simples Nacional Fator R).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-amber-400 block">Pessoa Física (CPF / Carnê-Leão)</span>
            <p className="text-[11px] text-slate-400">Alíquota de IRPF na tabela progressiva (até 27.5%).</p>
            <span className="text-base font-extrabold text-red-400 font-mono block">
              ~R$ {dre.impostoCpfCarnêLeaoMensal.toLocaleString('pt-BR')} / mês de imposto
            </span>
          </div>

          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2">
            <span className="text-xs font-bold text-emerald-400 block">Pessoa Jurídica (CNPJ / Simples Nacional)</span>
            <p className="text-[11px] text-slate-400">Alíquota inicial de 6% no Anexo III com Fator R de 28%.</p>
            <span className="text-base font-extrabold text-emerald-300 font-mono block">
              ~R$ {dre.impostoCnpjSimplesMensal.toLocaleString('pt-BR')} / mês de imposto
            </span>
          </div>
        </div>

        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
          <span className="text-xs text-slate-300">
            Economia Estimada com Regularização no CNPJ: <strong className="text-emerald-400 font-mono">R$ {dre.economiaAnualCnpj.toLocaleString('pt-BR')} / ano</strong> mantidos no seu caixa.
          </span>
        </div>
      </div>

      {/* ── SEÇÃO 4: PONTO DE EQUILÍBRIO REAL (BREAK-EVEN POINT) ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Calculator className="h-4 w-4 text-emerald-400" />
          4. Ponto de Equilíbrio Real (Break-even do Consultório)
        </h2>
        <p className="text-xs text-slate-400">
          Número mínimo de pacientes ativos e faturamento necessário para cobrir 100% das despesas fixas e folha da equipe.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Custos Fixos + Folha Eixo 07</span>
            <p className="text-lg font-extrabold text-white font-mono">R$ {dre.despesasFixasTotaisMensais.toLocaleString('pt-BR')} / mês</p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Pacientes para Pagar a Clínica</span>
            <p className="text-lg font-extrabold text-amber-400 font-mono">{dre.pontoEquilibrioPacientesAtivos} pacientes ativos</p>
          </div>

          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center space-y-1">
            <span className="text-[10px] font-bold text-emerald-400 uppercase">Margem de Segurança Hoje</span>
            <p className="text-lg font-extrabold text-emerald-300 font-mono">+{dre.pacientesAcimaBreakEven} pacientes acima do break-even</p>
          </div>
        </div>
      </div>

      {/* ── SEÇÃO 5: CADASTRO & EDIÇÃO DE CUSTOS FIXOS ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="h-4 w-4 text-emerald-400" />
          5. Gestão &amp; Edição de Despesas Fixas Operacionais
        </h2>

        {/* Form Adição */}
        <form onSubmit={handleAdicionarDespesa} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Descrição do Custo:</label>
              <input
                type="text"
                value={descricaoNova}
                onChange={(e) => setDescricaoNova(e.target.value)}
                placeholder="Ex: Aluguel de Sala"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Categoria:</label>
              <select
                value={categoriaNova}
                onChange={(e) => setCategoriaNova(e.target.value as DespesaFixaItem['categoria'])}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-semibold focus:border-emerald-500"
              >
                <option value="estrutura">Estrutura &amp; Aluguel</option>
                <option value="software">Software &amp; Tecnologia</option>
                <option value="equipe">Folha de Equipe</option>
                <option value="marketing">Marketing &amp; Tráfego</option>
                <option value="outros">Outros</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Valor Mensal (R$):</label>
              <input
                type="number"
                min={0}
                value={valorNovo}
                onChange={(e) => setValorNovo(e.target.value)}
                placeholder="500"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-emerald-400 font-bold focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Adicionar Custo Fixos
            </button>
          </div>
        </form>

        {/* Lista de Despesas */}
        <div className="space-y-2">
          {despesas.map((d) => (
            <div key={d.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{d.descricao}</span>
                {d.origemAutomatico && (
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    💡 {d.origemAutomatico}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-emerald-400">R$ {d.valorMensal.toLocaleString('pt-BR')}/mês</span>
                {!d.origemAutomatico && (
                  <button
                    type="button"
                    onClick={() => handleRemoverDespesa(d.id)}
                    className="p-1 text-slate-500 hover:text-red-400 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botão de Avanço */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-6">
        {salvo ? (
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" /> Dados salvos com sucesso!
          </span>
        ) : (
          <div />
        )}

        <button
          type="button"
          onClick={handleSalvar}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
        >
          Salvar Dados Financeiros e Avançar para o Simulador (Eixo 09)
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
