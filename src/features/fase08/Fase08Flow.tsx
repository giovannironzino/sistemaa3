// Fase08Flow.tsx
// Redesenho Mestre do Eixo 08 — Financeiro, Caixa Real & DRE em LINGUAGEM SIMPLES.
// 100% Analítico e Neutro (Simulação Exclusiva do Eixo 09).
// Jornada Racional em 5 Etapas: Entradas ➔ Saídas ➔ Deduções/Impostos ➔ DRE Clássica ➔ Precificação (Unit Economics) + Bloco 12 Meses Opcional.

import React, { useState, useMemo } from 'react';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { DollarSign, Plus, Trash2, CheckCircle2, ArrowRight, Sparkles, Layers, Scale, Calculator, Tag, Calendar, ChevronDown, ChevronUp, Wallet, Receipt, CreditCard, Edit3, UserCheck, ShieldCheck } from 'lucide-react';
import { calcularDreExecutiva, DespesaFixaItem, FaturamentoMensalHistorico } from './lib/calcularDreExecutiva';
import { calcularPrecificacaoServicos } from './lib/calcularPrecificacaoServicos';
import { calcularContasAReceber, FormaPagamentoPaciente } from './lib/calcularContasAReceber';

interface Fase08FlowProps {
  uid: string;
  initialState?: any;
  pacientesEixo01Count?: number;
  pacientesEixo01List?: Array<{ id: string; nome: string; ticketPagoEstimado?: number }>;
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
  pacientesEixo01List = [],
  custoFolhaEixo07,
  custoEquipeEixo07 = 3200,
  servicosEixo04 = [],
  onAvancarEixo09,
}: Fase08FlowProps) {
  const folhaEixo07Final = custoFolhaEixo07 ?? custoEquipeEixo07;
  const [faturamentoOverride, setFaturamentoOverride] = useState<number | undefined>(initialState?.faturamentoBrutoMensal);
  const [insumosPorConsultaInput, setInsumosPorConsultaInput] = useState<number>(initialState?.insumoPorConsulta ?? 15);
  const [proLaboreInput, setProLaboreInput] = useState<number>(initialState?.proLaborePessoal ?? 5000);

  // Módulo de Contas a Receber: Formas de Pagamento por Paciente
  const [formasPagamentoOverride, setFormasPagamentoOverride] = useState<
    Record<string, { forma: FormaPagamentoPaciente; parcelas: number }>
  >(() => {
    return initialState?.formasPagamentoOverride || {};
  });

  // Toggle do Histórico dos 12 Meses Opcional
  const [exibirHistorico12Meses, setExibirHistorico12Meses] = useState<boolean>(false);
  const [historico12MesesState, setHistorico12MesesState] = useState<FaturamentoMensalHistorico[]>(() => {
    return initialState?.historico12Meses || [];
  });

  // Despesas Fixas Operacionais (Tabela CRUD Livre)
  const [despesas, setDespesas] = useState<DespesaFixaItem[]>(() => {
    if (Array.isArray(initialState?.despesas) && initialState.despesas.length > 0) {
      return initialState.despesas;
    }
    return [
      { id: 'd1', categoria: 'equipe', descricao: 'Folha de Pagamento da Equipe', valorMensal: folhaEixo07Final, origemAutomatico: 'Eixo 07 (Equipe)' },
      { id: 'd2', categoria: 'software', descricao: 'WebDiet / Softwares de Prontuário & CRM', valorMensal: 350, origemAutomatico: 'Eixos 01 & 06' },
      { id: 'd3', categoria: 'estrutura', descricao: 'Aluguel de Consultório & Condomínio', valorMensal: 2500 },
      { id: 'd4', categoria: 'estrutura', descricao: 'Contabilidade Mensal & CRN', valorMensal: 600 },
    ];
  });

  // Form de Nova Linha Livre de Despesa Fixa
  const [descricaoNova, setDescricaoNova] = useState('');
  const [valorNovo, setValorNovo] = useState('');
  const [categoriaNova, setCategoriaNova] = useState<DespesaFixaItem['categoria']>('estrutura');
  const [salvo, setSalvo] = useState(false);

  // Toggle de Edição Excepcional
  const [exibirAjusteFaturamento, setExibirAjusteFaturamento] = useState<boolean>(false);

  // Motores de Cálculo em Tempo Real
  const contasAReceber = useMemo(() => {
    return calcularContasAReceber(pacientesEixo01List, formasPagamentoOverride);
  }, [pacientesEixo01List, formasPagamentoOverride]);

  const dre = useMemo(() => {
    return calcularDreExecutiva(
      despesas,
      faturamentoOverride,
      pacientesEixo01Count,
      450,
      insumosPorConsultaInput,
      proLaboreInput,
      historico12MesesState
    );
  }, [despesas, faturamentoOverride, pacientesEixo01Count, insumosPorConsultaInput, proLaboreInput, historico12MesesState]);

  const precificacao = useMemo(() => {
    return calcularPrecificacaoServicos(servicosEixo04, dre.despesasFixasTotaisMensais, 120);
  }, [servicosEixo04, dre.despesasFixasTotaisMensais]);

  function handleFormaPagamentoChange(pacienteId: string, forma: FormaPagamentoPaciente, parcelas: number = 1) {
    setFormasPagamentoOverride((prev) => ({
      ...prev,
      [pacienteId]: { forma, parcelas },
    }));
  }

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

  function handleEditarDespesaValor(id: string, novoValor: number) {
    setDespesas((prev) =>
      prev.map((d) => (d.id === id ? { ...d, valorMensal: Math.max(0, novoValor) } : d))
    );
  }

  function handleHistoricoMesChange(idx: number, valor: number) {
    setHistorico12MesesState((prev) => {
      const copy = [...(prev.length === 12 ? prev : dre.historico12Meses)];
      copy[idx] = { ...copy[idx], valor: Math.max(0, valor) };
      return copy;
    });
  }

  async function handleSalvar() {
    try {
      const data = {
        faturamentoBrutoMensal: dre.faturamentoBrutoMensal,
        entradasReaisCaixa: dre.entradasReaisCaixa,
        insumoPorConsulta: insumosPorConsultaInput,
        proLaborePessoal: proLaboreInput,
        despesas,
        formasPagamentoOverride,
        contasAReceber: {
          totalM1: contasAReceber.totalRecebimentosGarantidosM1,
          totalM2: contasAReceber.totalRecebimentosGarantidosM2,
          totalM3: contasAReceber.totalRecebimentosGarantidosM3,
        },
        lucroLiquidoMensal: dre.lucroLiquidoMensal,
        margemEbitdaPercentual: dre.margemEbitdaPercentual,
        pontoEquilibrioPacientesAtivos: dre.pontoEquilibrioPacientesAtivos,
        economiaAnualCnpj: dre.economiaAnualCnpj,
        historico12Meses: dre.historico12Meses,
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
        <h1 className="text-2xl font-bold text-white">Saúde Financeira, DRE Executiva &amp; Caixa Real</h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          Sem formulários repetitivos: o Sistema A3 calcula seu faturamento e entradas de caixa automaticamente a partir das etapas anteriores.
        </p>
      </div>

      {/* ── ETAPA 1: 🟢 O QUE ENTRA NO CAIXA (CALCULADO AUTOMÁTICO) ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                1. O Que Entra no Caixa (Calculado Automaticamente)
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  💡 Vem dos Eixos 01 &amp; 04
                </span>
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setExibirAjusteFaturamento(!exibirAjusteFaturamento)}
            className="text-xs text-indigo-400 hover:underline cursor-pointer flex items-center gap-1 font-semibold"
          >
            <Edit3 className="h-3.5 w-3.5" />
            {exibirAjusteFaturamento ? 'Ocultar Ajuste' : '✏️ Ajustar se necessário'}
          </button>
        </div>

        {/* Cards de Faturamento & Entradas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Faturamento Comercial Vendido</span>
            <p className="text-xl font-extrabold text-white font-mono">
              R$ {dre.faturamentoBrutoMensal.toLocaleString('pt-BR')} / mês
            </p>
            <span className="text-[10px] text-slate-500 block">Soma dos contratos ativos ({pacientesEixo01Count} pacientes)</span>
          </div>

          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-emerald-400 uppercase block">Entradas Reais Depositadas no Caixa</span>
            <p className="text-xl font-extrabold text-emerald-300 font-mono">
              R$ {dre.entradasReaisCaixa.toLocaleString('pt-BR')} / mês
            </p>
            <span className="text-[10px] text-slate-400 block">Crédito efetivo estimado na conta bancária</span>
          </div>
        </div>

        {/* Campo de Ajuste Excepcional */}
        {exibirAjusteFaturamento && (
          <div className="p-4 bg-slate-950 rounded-xl border border-indigo-500/30 space-y-2 animate-fade-in">
            <span className="text-xs font-bold text-indigo-400 block">Ajuste Excepcional do Faturamento Comercial (R$)</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">R$</span>
              <input
                type="number"
                min={0}
                value={faturamentoOverride ?? dre.faturamentoBrutoMensal}
                onChange={(e) => setFaturamentoOverride(parseFloat(e.target.value) || 0)}
                className="w-40 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-emerald-400 font-bold text-right focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => setFaturamentoOverride(undefined)}
                className="text-[10px] text-slate-500 hover:text-red-400 underline ml-2"
              >
                Restaurar Cálculo Automático
              </button>
            </div>
          </div>
        )}

        {/* Previsibilidade de Caixa para 90 Dias (Contas a Receber) */}
        <div className="space-y-3 pt-2">
          <span className="text-xs font-bold text-white block uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-indigo-400" />
            Previsibilidade de Caixa Garantida para os Próximos 90 Dias
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Mês M+1 (Mês Que Vem)</span>
              <p className="text-base font-extrabold text-emerald-400 font-mono">
                R$ {contasAReceber.totalRecebimentosGarantidosM1.toLocaleString('pt-BR')}
              </p>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Mês M+2 (Daqui a 60 Dias)</span>
              <p className="text-base font-extrabold text-indigo-400 font-mono">
                R$ {contasAReceber.totalRecebimentosGarantidosM2.toLocaleString('pt-BR')}
              </p>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Mês M+3 (Daqui a 90 Dias)</span>
              <p className="text-base font-extrabold text-amber-400 font-mono">
                R$ {contasAReceber.totalRecebimentosGarantidosM3.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── ETAPA 2: 🔴 O QUE SAI DO CAIXA (DESPESAS FIXAS & FOLHA) ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="h-4 w-4 text-emerald-400" />
          2. O Que Sai do Caixa (Despesas Fixas &amp; Folha da Equipe)
        </h2>
        <p className="text-xs text-slate-400">
          A folha da equipe e softwares foram importados automaticamente. Adicione ou ajuste qualquer despesa operacional da clínica.
        </p>

        {/* Tabela CRUD */}
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
                <input
                  type="number"
                  min={0}
                  value={d.valorMensal}
                  onChange={(e) => handleEditarDespesaValor(d.id, parseFloat(e.target.value) || 0)}
                  className="w-28 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-emerald-400 font-bold text-right focus:border-emerald-500 font-mono"
                />
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

        {/* Form Adicionar Nova Despesa */}
        <form onSubmit={handleAdicionarDespesa} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nova Despesa Fixa:</label>
              <input
                type="text"
                value={descricaoNova}
                onChange={(e) => setDescricaoNova(e.target.value)}
                placeholder="Ex: Aluguel do Consultório"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Categoria:</label>
              <select
                value={categoriaNova}
                onChange={(e) => setCategoriaNova(e.target.value as DespesaFixaItem['categoria'])}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-semibold focus:border-emerald-500"
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
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-emerald-400 font-bold focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Adicionar Custo Fixo
            </button>
          </div>
        </form>
      </div>

      {/* ── ETAPA 3: 🟡 DEDUÇÕES VARIÁVEIS, IMPOSTOS & PRÓ-LABORE ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Receipt className="h-4 w-4 text-emerald-400" />
          3. Deduções Variáveis, Impostos (CPF vs CNPJ) &amp; Pró-Labore Pessoal
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-white block">Insumos Diretos por Consulta (R$/atendimento)</span>
            <p className="text-[11px] text-slate-400">Materiais descartáveis, luvas, mimos e brindes entregues.</p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">R$</span>
              <input
                type="number"
                min={0}
                value={insumosPorConsultaInput}
                onChange={(e) => setInsumosPorConsultaInput(parseFloat(e.target.value) || 0)}
                className="w-28 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-amber-400 font-bold text-right focus:border-emerald-500"
              />
              <span className="text-xs text-slate-400">por consulta</span>
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-white block">Pró-Labore Pessoal do Nutricionista (R$/mês)</span>
            <p className="text-[11px] text-slate-400">Sua retirada mensal pessoal como sócio/profissional principal.</p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">R$</span>
              <input
                type="number"
                min={0}
                value={proLaboreInput}
                onChange={(e) => setProLaboreInput(parseFloat(e.target.value) || 0)}
                className="w-32 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-emerald-400 font-extrabold text-right focus:border-emerald-500"
              />
              <span className="text-xs text-slate-400">por mês</span>
            </div>
          </div>
        </div>

        {/* Comparativo Fiscal CPF vs CNPJ */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Scale className="h-4 w-4 text-emerald-400" />
              Economia Estimada no CNPJ (Simples Nacional ~6%):
            </span>
            <span className="font-mono text-emerald-400 font-extrabold text-sm">
              R$ {dre.economiaAnualCnpj.toLocaleString('pt-BR')} / ano economizados
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Comparado aos 22% de alíquota efetiva de IRPF no Carnê-Leão (Pessoa Física).
          </p>
        </div>
      </div>

      {/* ── ETAPA 4: 📋 DRE CLÁSSICA EXECUTIVA CONSOLIDADA (A3) ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-emerald-400" />
          4. 📋 DRE Clássica Executiva Consolidada do Consultório A3
        </h2>
        <p className="text-xs text-slate-400">
          Demonstrativo financeiro clássico consolidado 100% automaticamente pelo sistema sem digitações suplementares.
        </p>

        <div className="space-y-2 text-xs font-semibold">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-200">(+) Receita Bruta Comercial Contratada:</span>
            <span className="font-mono text-emerald-400 font-bold">R$ {dre.faturamentoBrutoMensal.toLocaleString('pt-BR')}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">(-) Impostos (Simples Nacional ~6%) &amp; Taxas de Cartão (~3.5%):</span>
            <span className="font-mono text-amber-400 font-bold">-R$ {dre.impostosETaxasMensais.toLocaleString('pt-BR')}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">(-) Insumos Diretos por Consulta (Materiais/Mimos):</span>
            <span className="font-mono text-amber-400 font-bold">-R$ {dre.insumosDiretosConsultasMensal.toLocaleString('pt-BR')}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between font-bold">
            <span className="text-white flex items-center gap-1.5">(=) MARGEM DE CONTRIBUIÇÃO REAL:</span>
            <span className="font-mono text-white text-sm">R$ {dre.margemContribuicaoMensal.toLocaleString('pt-BR')}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">(-) Despesas Fixas da Estrutura (Tabela CRUD):</span>
            <span className="font-mono text-red-400 font-bold">-R$ {(dre.despesasSoftwareMensal + dre.despesasEstruturaMensal).toLocaleString('pt-BR')}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">(-) Custo da Folha da Equipe (Importado do Eixo 07):</span>
            <span className="font-mono text-red-400 font-bold">-R$ {dre.despesasEquipeFolhaMensal.toLocaleString('pt-BR')}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between font-bold">
            <span className="text-emerald-400 flex items-center gap-1.5">(=) EBITDA OPERACIONAL DA CLÍNICA:</span>
            <span className="font-mono text-emerald-400 text-sm">R$ {dre.ebitdaOperacionalMensal.toLocaleString('pt-BR')} ({dre.margemEbitdaPercentual}%)</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">(-) Pró-Labore Pessoal do Nutricionista Principal:</span>
            <span className="font-mono text-amber-400 font-bold">-R$ {dre.proLaborePessoalMensal.toLocaleString('pt-BR')}</span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-sm font-extrabold">
            <span className="text-emerald-300">(=) SOBRA LÍQUIDA REAL DO CAIXA (LUCRO RETIDO):</span>
            <span className="font-mono text-emerald-300 text-base">R$ {dre.lucroLiquidoMensal.toLocaleString('pt-BR')} / mês</span>
          </div>
        </div>
      </div>

      {/* ── ETAPA 5: 🧮 RAIO-X DE PRECIFICAÇÃO & MARGEM REAL (UNIT ECONOMICS) ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-1">
            <Tag className="h-3 w-3 text-indigo-400" />
            <span className="text-[10px] font-bold text-indigo-400 uppercase">Unit Economics · Raio-X de Precificação</span>
          </div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            5. Análise de Precificação &amp; Margem Real por Serviço
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Cruza o preço de tabela do Eixo 04 com o tempo técnico do Eixo 06 e custos fixos para identificar se cada produto gera <strong>Lucro Real</strong> ou <strong>Prejuízo Oculto</strong>.
          </p>
        </div>

        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="text-slate-300 font-semibold">Custo da Hora Técnica do Seu Consultório:</span>
          <span className="font-mono font-bold text-indigo-400">
            R$ {precificacao.custoHoraClinicaConsultorio.toLocaleString('pt-BR')} / hora técnica
          </span>
        </div>

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

      {/* ── BLOCO OPCIONAL: 📅 MAPEAMENTO DOS ÚLTIMOS 12 MESES (COLLAPSIBLE) ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div
          onClick={() => setExibirHistorico12Meses(!exibirHistorico12Meses)}
          className="flex items-center justify-between cursor-pointer border-b border-slate-800 pb-3"
        >
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-400" />
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                Mapeamento Opcional dos Últimos 12 Meses (Histórico Cronológico)
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300">Opcional</span>
              </h2>
              <p className="text-xs text-slate-400">Para quem possui os dados organizados mês a mês por data.</p>
            </div>
          </div>

          <button type="button" className="text-slate-400 hover:text-white p-1">
            {exibirHistorico12Meses ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>

        {exibirHistorico12Meses && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
              {dre.historico12Meses.map((h, idx) => (
                <div key={h.mesLabel} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">{h.mesLabel}</span>
                  <input
                    type="number"
                    min={0}
                    value={h.valor || ''}
                    onChange={(e) => handleHistoricoMesChange(idx, parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1 text-center text-xs font-bold text-white focus:border-indigo-500"
                  />
                </div>
              ))}
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Faturamento Médio 12 Meses</span>
                <span className="font-extrabold text-emerald-400 font-mono">R$ {dre.mediaFaturamento12Meses.toLocaleString('pt-BR')} / mês</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Mês de Pico (Maior Faturamento)</span>
                <span className="font-extrabold text-indigo-400">{dre.mesPicoHistorico}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Mês de Vale (Menor Faturamento)</span>
                <span className="font-extrabold text-amber-400">{dre.mesValeHistorico}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botão de Avanço */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-6">
        {salvo ? (
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" /> Dados financeiros salvos com sucesso!
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
