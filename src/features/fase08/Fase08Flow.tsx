// Fase08Flow.tsx
// Redesenho Mestre do Eixo 08 — Financeiro, Caixa Real & DRE em LINGUAGEM SIMPLES.
// 100% Analítico e Neutro (Sem Simuladores nem Dicas — Simulação Exclusiva do Eixo 09).
// Incorpora: DRE Clássica Executiva A3, Tabela CRUD Livre de Custos Fixos, Insumos por Consulta, Pró-Labore, Histórico dos 12 Meses e Precificação Unit Economics.

import React, { useState, useMemo } from 'react';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { DollarSign, Plus, Trash2, CheckCircle2, ArrowRight, Sparkles, Layers, Scale, Calculator, Tag, Calendar, ChevronDown, ChevronUp, Wallet, Receipt } from 'lucide-react';
import { calcularDreExecutiva, DespesaFixaItem, FaturamentoMensalHistorico } from './lib/calcularDreExecutiva';
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
  const [insumosPorConsultaInput, setInsumosPorConsultaInput] = useState<number>(initialState?.insumoPorConsulta ?? 15);
  const [proLaboreInput, setProLaboreInput] = useState<number>(initialState?.proLaborePessoal ?? 5000);

  // Toggle do Histórico dos 12 Meses
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
      { id: 'd2', categoria: 'software', descricao: 'WebDiet / Softwares de Prontuário & CRM', valorMensal: 350, origemAutomatico: 'Eixo 01 & 06' },
      { id: 'd3', categoria: 'estrutura', descricao: 'Aluguel de Consultório & Condomínio', valorMensal: 2500 },
      { id: 'd4', categoria: 'estrutura', descricao: 'Contabilidade Mensal & CRN', valorMensal: 600 },
    ];
  });

  // Form de Adição de Nova Linha Livre de Custo Fixo
  const [descricaoNova, setDescricaoNova] = useState('');
  const [valorNovo, setValorNovo] = useState('');
  const [categoriaNova, setCategoriaNova] = useState<DespesaFixaItem['categoria']>('estrutura');
  const [salvo, setSalvo] = useState(false);

  // Motores de Cálculo
  const dre = useMemo(() => {
    return calcularDreExecutiva(
      despesas,
      faturamentoInput,
      pacientesEixo01Count,
      450,
      insumosPorConsultaInput,
      proLaboreInput,
      historico12MesesState
    );
  }, [despesas, faturamentoInput, pacientesEixo01Count, insumosPorConsultaInput, proLaboreInput, historico12MesesState]);

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
        <h1 className="text-2xl font-bold text-white">Saúde Financeira, DRE Clássica &amp; Caixa Real</h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          Mapeie as entradas reais do seu caixa, despesas fixas da estrutura, tributação e a DRE Executiva completa do seu consultório.
        </p>
      </div>

      {/* ── SEÇÃO 1: RECEITA BRUTA COMERCIAL & ENTRADAS REAIS NO CAIXA ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              1. Receita Bruta Comercial &amp; Entradas Reais no Caixa Depositado
            </h2>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 font-mono">
            Caixa Creditado Estimado: R$ {dre.entradasReaisCaixa.toLocaleString('pt-BR')} / mês
          </span>
        </div>

        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-white block">Faturamento Comercial Bruto Vendido (R$)</span>
            <p className="text-[11px] text-slate-400">
              Soma total das vendas de serviços e programas contratados no mês.
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
      </div>

      {/* ── SEÇÃO 2: MAPEAMENTO OPCIONAL DE FATURAMENTO DOS ÚLTIMOS 12 MESES ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div
          onClick={() => setExibirHistorico12Meses(!exibirHistorico12Meses)}
          className="flex items-center justify-between cursor-pointer border-b border-slate-800 pb-3"
        >
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-400" />
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                2. Mapeamento Opcional dos Últimos 12 Meses (Histórico Cronológico)
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

      {/* ── SEÇÃO 3: IMPOSTOS, TAXAS, INSUMOS POR CONSULTA & PRÓ-LABORE PESSOAL ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Receipt className="h-4 w-4 text-emerald-400" />
          3. Impostos, Taxas, Insumos por Consulta &amp; Pró-Labore Pessoal
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-white block">Insumos Diretos por Consulta (R$/atendimento)</span>
            <p className="text-[11px] text-slate-400">Materiais descartáveis, luvas, mimos e brindes de consulta.</p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">R$</span>
              <input
                type="number"
                min={0}
                value={insumosPorConsultaInput}
                onChange={(e) => setInsumosPorConsultaInput(parseFloat(e.target.value) || 0)}
                className="w-28 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-amber-400 font-bold text-right focus:border-emerald-500"
              />
              <span className="text-xs text-slate-400">por atendimento</span>
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
      </div>

      {/* ── SEÇÃO 4: DESPESAS FIXAS MENSAIS (TABELA CRUD DE ADIÇÃO LIVRE) ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="h-4 w-4 text-emerald-400" />
          4. Despesas Fixas Mensais da Estrutura (Adição Livre de Linhas)
        </h2>

        {/* Form para Nova Linha Livre */}
        <form onSubmit={handleAdicionarDespesa} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Descrição do Custo Fixo:</label>
              <input
                type="text"
                value={descricaoNova}
                onChange={(e) => setDescricaoNova(e.target.value)}
                placeholder="Ex: Aluguel do Consultório"
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
              <Plus className="h-3.5 w-3.5" /> Adicionar Linha de Custo Fixo
            </button>
          </div>
        </form>

        {/* Tabela de Custos Fixos */}
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

      {/* ── SEÇÃO 5: 📋 DRE CLÁSSICA EXECUTIVA DO CONSULTÓRIO A3 ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-emerald-400" />
          5. 📋 DRE Clássica Executiva do Consultório A3
        </h2>
        <p className="text-xs text-slate-400">
          Demonstrativo financeiro clássico completo, alinhado aos padrões executivos de consultório.
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

      {/* ── SEÇÃO 6: ANÁLISE COMPLETA DE PRECIFICAÇÃO & MARGEM REAL POR SERVIÇO ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-1">
            <Tag className="h-3 w-3 text-indigo-400" />
            <span className="text-[10px] font-bold text-indigo-400 uppercase">Unit Economics · Raio-X de Precificação</span>
          </div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            6. Análise de Precificação &amp; Margem Real por Serviço
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Cruza o preço de tabela do Eixo 04 com o tempo técnico do Eixo 06 e custos fixos para identificar se cada produto gera <strong>Lucro Real</strong> ou <strong>Prejuízo Oculto</strong>.
          </p>
        </div>

        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="text-slate-300 font-semibold">Custo da Hora Clínica do Seu Consultório:</span>
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
