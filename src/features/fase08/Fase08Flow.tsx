// Fase08Flow.tsx
// Módulo Eixo 08 — DRE Clássica Executiva, Tabela Dinâmica CRUD de Despesas Fixas & Realização de Caixa em Linguagem Simples

import React, { useState, useMemo } from 'react';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { DollarSign, PieChart, TrendingUp, CheckCircle2, ArrowRight, Sparkles, HelpCircle, Plus, Trash2, ArrowRightLeft } from 'lucide-react';
import { calculateDualCAC, calculateRealVsPortfolioRevenue } from '../../lib/metrics';
import { obterDatasA3 } from '../../lib/dateUtils';

export const OPCOES_CATEGORIA_DESPESA_FIXA = [
  { id: 'espaco', label: '🏠 Espaço, Sublocação & Instalações' },
  { id: 'tech', label: '💻 Softwares, Prontuário, IA & Tech' },
  { id: 'terceiros', label: '💼 Serviços Terceirizados & Contabilidade' },
  { id: 'conselho', label: '🛡️ Alvará, CRN & Anualidades' },
  { id: 'outro', label: '➕ Outra Despesa Fixa' },
];

export interface DespesaFixaItem {
  id: string;
  categoria: string;
  nome: string;
  valorMensal: number;
}

interface Fase08FlowProps {
  uid: string;
  initialState?: any;
  custoEquipeEixo07?: number;
  clientRecord?: any;
  onAvancarEixo09?: () => void;
}

export default function Fase08Flow({ uid, initialState, custoEquipeEixo07 = 0, clientRecord, onAvancarEixo09 }: Fase08FlowProps) {
  // Motor Central de Datas Dinâmicas
  const datas = useMemo(() => obterDatasA3(clientRecord?.createdAt || clientRecord?.atualizadoEm), [clientRecord]);

  // Extrato de Caixa
  const [faturamentoM2, setFaturamentoM2] = useState<number>(initialState?.faturamentoM2 ?? 15000);
  const [faturamentoM1, setFaturamentoM1] = useState<number>(initialState?.faturamentoM1 ?? 18000);
  const [faturamentoAtual, setFaturamentoAtual] = useState<number>(initialState?.faturamentoAtual ?? 22000);

  // Mídia & Pró-labore
  const [investimentoTrafegoMensal, setInvestimentoTrafegoMensal] = useState<number>(initialState?.investimentoTrafegoMensal ?? 1200);
  const [feeGestorAgencia, setFeeGestorAgencia] = useState<number>(initialState?.feeGestorAgencia ?? 800);
  const [proLaboreNutricionista, setProLaboreNutricionista] = useState<number>(initialState?.proLaboreNutricionista ?? 5000);
  const [impostosAliquotaPct, setImpostosAliquotaPct] = useState<number>(initialState?.impostosAliquotaPct ?? 6);
  const [taxaCartaoPct, setTaxaCartaoPct] = useState<number>(initialState?.taxaCartaoPct ?? 3.5);

  // Tabela CRUD Dinâmica de Despesas Fixas
  const [despesasFixas, setDespesasFixas] = useState<DespesaFixaItem[]>(
    initialState?.despesasFixas?.length > 0
      ? initialState.despesasFixas
      : [
          { id: 'df1', categoria: 'espaco', nome: 'Aluguel / Sublocação de Consultório', valorMensal: initialState?.aluguelEspaco ?? 2500 },
          { id: 'df2', categoria: 'espaco', nome: 'Condomínio, IPTU & Limpeza', valorMensal: 450 },
          { id: 'df3', categoria: 'espaco', nome: 'Energia Elétrica, Água & Internet', valorMensal: 320 },
          { id: 'df4', categoria: 'tech', nome: 'Prontuário Eletrônico & Agendamento', valorMensal: initialState?.softwaresTech ?? 180 },
          { id: 'df5', categoria: 'tech', nome: 'Ferramentas IA (ChatGPT / Gemini)', valorMensal: 120 },
          { id: 'df6', categoria: 'terceiros', nome: 'Honorários de Contabilidade & Emissão NF', valorMensal: 600 },
          { id: 'df7', categoria: 'conselho', nome: 'Anualidade CRN / Licenças de Alvará', valorMensal: 150 },
        ]
  );

  const [salvo, setSalvo] = useState(false);

  // Handlers CRUD de Despesas Fixas
  function handleAdicionarDespesaFixa() {
    setDespesasFixas((prev) => [
      ...prev,
      { id: `df_${Date.now()}`, categoria: 'outro', nome: 'Nova Despesa Fixa', valorMensal: 200 },
    ]);
  }

  function handleRemoverDespesaFixa(id: string) {
    setDespesasFixas((prev) => prev.filter((item) => item.id !== id));
  }

  // Soma de Despesas Fixas Estruturais
  const somaDespesasFixasEstruturais = useMemo(() => {
    return despesasFixas.reduce((acc, item) => acc + (Number(item.valorMensal) || 0), 0);
  }, [despesasFixas]);

  // Soma Total Reativa (Estrutura + Equipe Eixo 07)
  const custosFixosTotaisCalculados = useMemo(() => {
    return somaDespesasFixasEstruturais + custoEquipeEixo07;
  }, [somaDespesasFixasEstruturais, custoEquipeEixo07]);

  // Cálculos DRE
  const receitaMediaMensal = Math.round((faturamentoM2 + faturamentoM1 + faturamentoAtual) / 3);
  const impostosEstimadosMensal = Math.round(faturamentoAtual * (impostosAliquotaPct / 100));
  const taxaCartaoEstimadaMensal = Math.round(faturamentoAtual * (taxaCartaoPct / 100));
  const despesasMarketingTotais = investimentoTrafegoMensal + feeGestorAgencia;

  const ebitdaOperacional = faturamentoAtual - impostosEstimadosMensal - taxaCartaoEstimadaMensal - custosFixosTotaisCalculados - despesasMarketingTotais;
  const lucroRetidoCNPJ = ebitdaOperacional - proLaboreNutricionista;
  const margemLiquidaRealPct = faturamentoAtual > 0 ? Math.round((lucroRetidoCNPJ / faturamentoAtual) * 100) : 0;

  // Cálculo de Ponto de Equilíbrio (Breakeven) em R$
  const despesaFixaNecessariaTotal = custosFixosTotaisCalculados + despesasMarketingTotais + proLaboreNutricionista;
  const breakevenReais = despesaFixaNecessariaTotal / (1 - ((impostosAliquotaPct + taxaCartaoPct) / 100));

  // Métricas Especiais: CAC Duplo e Comparativo Caixa vs Portfólio
  const dualCac = calculateDualCAC({
    ...clientRecord,
    fase08: { investimentoTrafegoMensal },
  });

  const comparativoReceita = calculateRealVsPortfolioRevenue({
    ...clientRecord,
    fase08: { faturamentoM2, faturamentoM1, faturamentoAtual },
  });

  async function handleSalvar() {
    try {
      const data = {
        faturamentoM2,
        faturamentoM1,
        faturamentoAtual,
        receitaMediaMensal,
        investimentoTrafegoMensal,
        feeGestorAgencia,
        proLaboreNutricionista,
        impostosAliquotaPct,
        taxaCartaoPct,
        despesasFixas,
        somaDespesasFixasEstruturais,
        custoFixoTotalMensal: custosFixosTotaisCalculados,
        custosFixosTotais: custosFixosTotaisCalculados,
        custoTotalEquipe: custoEquipeEixo07,
        lucroLiquidoReal: lucroRetidoCNPJ,
        margemLiquidaRealPct,
        breakevenReais,
        cacBlocadoGeral: dualCac.cacBlocadoGeral,
        cacPagoAnuncios: dualCac.cacPagoAnuncios,
        indiceRealizacaoPct: comparativoReceita.indiceRealizacaoPct,
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
    <div className="w-full max-w-4xl mx-auto space-y-8 py-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
            Eixo 08 · DRE Clássica Executiva &amp; Engenharia Financeira A3
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white">Quanto realmente sobra de dinheiro no final do mês?</h1>
        <p className="text-sm text-slate-400">
          Gerencie cada linha das suas despesas fixas, acompanhe a entrada de caixa e veja a DRE Executiva do seu consultório em Linguagem Simples.
        </p>
      </div>

      {/* 1. Entradas Reais de Caixa (Últimos 3 Meses) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            1. Entrada Real de Dinheiro na Conta Bancária (R$):
          </h3>
          <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-bold">
            ✓ Reafirmado do Eixo 04
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Digite quanto você recebeu de fato (consultas pagas + pacotes) em cada um dos últimos 3 meses:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-slate-400">📅 {datas.mesM2}</span>
            <input
              type="number"
              value={faturamentoM2}
              onChange={(e) => setFaturamentoM2(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-bold text-sm focus:border-emerald-500"
            />
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-slate-400">📅 {datas.mesM1}</span>
            <input
              type="number"
              value={faturamentoM1}
              onChange={(e) => setFaturamentoM1(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-bold text-sm focus:border-emerald-500"
            />
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-slate-400">📅 {datas.mesM0}</span>
            <input
              type="number"
              value={faturamentoAtual}
              onChange={(e) => setFaturamentoAtual(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-bold text-sm focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Card Comparativo: Receita do Portfólio vs Entrada de Caixa */}
        <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl space-y-2 text-xs">
          <div className="flex justify-between items-center text-indigo-300 font-bold">
            <span className="flex items-center gap-1.5">
              🏦 Comparativo: Entrada Real de Caixa vs Portfólio Projetado (Eixo 04)
            </span>
            <span className="bg-indigo-500/20 px-2 py-0.5 rounded text-[11px]">
              Realização: {comparativoReceita.indiceRealizacaoPct}%
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            {comparativoReceita.explicacao}
          </p>
        </div>
      </div>

      {/* 2. TABELA DINÂMICA CRUD DE DESPESAS FIXAS MENSAIS */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="h-4 w-4 text-indigo-400" />
              2. Custos e Despesas Fixas Mensais (Tabela CRUD Dinâmica):
            </h3>
            <p className="text-xs text-slate-400">
              Gerencie cada linha de custo fixo da sua estrutura. Adicione quantas linhas desejar com a categoria correspondente.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAdicionarDespesaFixa}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs font-bold text-indigo-400 hover:bg-indigo-500/20 transition-all cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" /> Adicionar Despesa Fixa
          </button>
        </div>

        {/* Tabela de Linhas Editáveis */}
        <div className="space-y-2">
          {despesasFixas.map((df, idx) => (
            <div key={df.id || idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="sm:col-span-4">
                <label className="text-[9px] text-slate-500 uppercase font-bold block sm:hidden">Categoria</label>
                <select
                  value={df.categoria}
                  onChange={(e) => {
                    const cat = e.target.value;
                    setDespesasFixas((prev) => prev.map((item, i) => (i === idx ? { ...item, categoria: cat } : item)));
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-medium"
                >
                  {OPCOES_CATEGORIA_DESPESA_FIXA.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-5">
                <label className="text-[9px] text-slate-500 uppercase font-bold block sm:hidden">Nome da Despesa</label>
                <input
                  type="text"
                  value={df.nome}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDespesasFixas((prev) => prev.map((item, i) => (i === idx ? { ...item, nome: val } : item)));
                  }}
                  placeholder="Nome do custo fixo..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-semibold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[9px] text-slate-500 uppercase font-bold block sm:hidden">Valor R$</label>
                <input
                  type="number"
                  value={df.valorMensal}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setDespesasFixas((prev) => prev.map((item, i) => (i === idx ? { ...item, valorMensal: val } : item)));
                  }}
                  placeholder="R$ 0,00"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-emerald-400 font-mono font-bold"
                />
              </div>

              <div className="sm:col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleRemoverDespesaFixa(df.id)}
                  className="p-2 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                  title="Remover despesa"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Reafirmação de Pessoas do Eixo 07 */}
        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
          <div className="flex items-center gap-2 text-purple-300 font-semibold">
            <ArrowRightLeft className="h-4 w-4 text-purple-400" />
            <span>Custo com Pessoas &amp; Equipe (Reafirmado do Eixo 07):</span>
          </div>
          <span className="text-purple-300 font-extrabold font-mono text-sm">R$ {custoEquipeEixo07.toLocaleString('pt-BR')} / mês</span>
        </div>

        {/* Soma Total de Custos Fixos (Estrutura + Pessoas) */}
        <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/30 rounded-xl flex justify-between items-center text-xs">
          <span className="text-indigo-200 font-extrabold uppercase tracking-wider">
            ⚡ Soma de Custos Fixos Totais (Estrutura + Pessoas):
          </span>
          <span className="text-white font-extrabold font-mono text-base">
            R$ {custosFixosTotaisCalculados.toLocaleString('pt-BR')} / mês
          </span>
        </div>
      </div>

      {/* 3. Mídia, Taxas & Pró-Labore Pessoal (CPF) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-teal-400" />
          3. Impostos, Taxas de Cartão, Mídia &amp; Pró-Labore Fixo (CPF):
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-slate-400">Anúncios Pagos (Meta/Google R$)</span>
            <input
              type="number"
              value={investimentoTrafegoMensal}
              onChange={(e) => setInvestimentoTrafegoMensal(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-bold text-xs focus:border-emerald-500"
            />
            <p className="text-[10px] text-slate-500">Verba colocada em anúncios</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-slate-400">Fee Gestor de Tráfego (R$)</span>
            <input
              type="number"
              value={feeGestorAgencia}
              onChange={(e) => setFeeGestorAgencia(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-emerald-500"
            />
            <p className="text-[10px] text-slate-500">Honorários do profissional</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-slate-400">Alíquota de Impostos (%)</span>
            <input
              type="number"
              value={impostosAliquotaPct}
              onChange={(e) => setImpostosAliquotaPct(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-emerald-500"
            />
            <p className="text-[10px] text-slate-500">Simples Nacional ou Carnê-Leão</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-slate-400">Pró-Labore Nutricionista (R$)</span>
            <input
              type="number"
              value={proLaboreNutricionista}
              onChange={(e) => setProLaboreNutricionista(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-emerald-400 font-extrabold text-xs focus:border-emerald-500"
            />
            <p className="text-[10px] text-slate-500">Salário mensal garantido (CPF)</p>
          </div>
        </div>
      </div>

      {/* 4. DRE CLÁSSICA EXECUTIVA COMPLETA EM LINGUAGEM SIMPLES */}
      <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 space-y-5 shadow-2xl">
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            📋 DRE Clássica Executiva do Consultório A3
          </h3>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
            Linguagem Simples Ativa ✓
          </span>
        </div>

        <div className="space-y-2 text-xs font-mono">
          <div className="flex justify-between py-1.5 border-b border-slate-800/60 text-purple-300">
            <span>1. (+) Receita Bruta Comercial (Portfólio Eixo 04):</span>
            <span className="font-extrabold">R$ {Math.round(comparativoReceita.receitaPortfolioMensal).toLocaleString('pt-BR')} / mês</span>
          </div>

          <div className="flex justify-between py-1.5 border-b border-slate-800/60 text-emerald-300">
            <span>2. (=) Entrada Real de Dinheiro no Caixa ({datas.mesM0}):</span>
            <span className="font-extrabold">R$ {faturamentoAtual.toLocaleString('pt-BR')} / mês</span>
          </div>

          <div className="flex justify-between py-1.5 border-b border-slate-800/60 text-red-300/80">
            <span>3. (-) Deduções da Receita (Impostos {impostosAliquotaPct}% + Cartão {taxaCartaoPct}%):</span>
            <span>- R$ {(impostosEstimadosMensal + taxaCartaoEstimadaMensal).toLocaleString('pt-BR')}</span>
          </div>

          <div className="flex justify-between py-1.5 border-b border-slate-800/60 text-red-300/80">
            <span>4. (-) Despesas com Equipe &amp; Pessoas (Eixo 07):</span>
            <span>- R$ {custoEquipeEixo07.toLocaleString('pt-BR')}</span>
          </div>

          <div className="flex justify-between py-1.5 border-b border-slate-800/60 text-red-300/80">
            <span>5. (-) Despesas Fixas Estruturais (Soma Tabela CRUD):</span>
            <span>- R$ {somaDespesasFixasEstruturais.toLocaleString('pt-BR')}</span>
          </div>

          <div className="flex justify-between py-1.5 border-b border-slate-800/60 text-red-300/80">
            <span>6. (-) Mídia &amp; Anúncios Pagos (Meta/Google Ads):</span>
            <span>- R$ {despesasMarketingTotais.toLocaleString('pt-BR')}</span>
          </div>

          <div className="flex justify-between py-1.5 border-b border-slate-800/60 text-teal-300 font-bold">
            <span>7. (=) Lucro Operacional da Estrutura (EBITDA):</span>
            <span>R$ {ebitdaOperacional.toLocaleString('pt-BR')}</span>
          </div>

          <div className="flex justify-between py-1.5 border-b border-slate-800/60 text-emerald-400 font-bold">
            <span>8. (-) Pró-Labore Fixo do Nutricionista (Salário CPF):</span>
            <span>- R$ {proLaboreNutricionista.toLocaleString('pt-BR')}</span>
          </div>

          <div className="flex justify-between py-2.5 pt-3 text-sm font-extrabold text-white bg-emerald-950/40 px-4 rounded-xl border border-emerald-500/30">
            <span className="text-emerald-400">🏆 (=) LUCRO LÍQUIDO RETIDO NO CNPJ:</span>
            <span className="text-emerald-300">R$ {lucroRetidoCNPJ.toLocaleString('pt-BR')} / mês ({margemLiquidaRealPct}%)</span>
          </div>
        </div>

        {/* Ponto de Equilíbrio Reativo */}
        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-center text-xs text-slate-300">
          ⚖️ <strong>Ponto de Equilíbrio:</strong> Seu consultório precisa faturar no mínimo{' '}
          <strong className="text-emerald-400 font-bold">R$ {Math.round(breakevenReais).toLocaleString('pt-BR')}</strong> por mês para cobrir todas as despesas fixas, mídia e seu pró-labore sem ter prejuízo.
        </div>
      </div>

      {/* 5. Métricas de Custo por Paciente Adquirido (CAC Duplo) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-emerald-400" />
          💰 Quanto custa atrair cada novo paciente para o seu consultório?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Custo Médio por Paciente (Geral)</span>
            <p className="text-lg font-extrabold text-emerald-400">R$ {dualCac.cacBlocadoGeral} / paciente</p>
            <p className="text-[11px] text-slate-400 leading-snug">{dualCac.explicacaoBlocado}</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Custo por Paciente vindo de Anúncios</span>
            <p className="text-lg font-extrabold text-teal-300">R$ {dualCac.cacPagoAnuncios} / paciente</p>
            <p className="text-[11px] text-slate-400 leading-snug">{dualCac.explicacaoPago}</p>
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-6">
        {salvo ? (
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" /> Dados salvos com sucesso no Firestore!
          </span>
        ) : <div />}

        <button
          type="button"
          onClick={handleSalvar}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
        >
          Salvar e Simular Metas na Mesa de Controle (Eixo 09)
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
