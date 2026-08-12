// ResumoUnificadoA3.tsx
// Central do Resumo Unificado A3 — Painel Executivo Consolidado dos 9 Eixos.

import React from 'react';
import { Sparkles, Award, TrendingUp, Target, Package, Clock, Users, DollarSign, Activity, RefreshCw } from 'lucide-react';
import { getLabelById } from '../fase01/data/bancoDePromessas';

interface ResumoUnificadoA3Props {
  clientRecord: any;
  onNavegarFase: (faseId: string) => void;
}

export default function ResumoUnificadoA3({ clientRecord, onNavegarFase }: ResumoUnificadoA3Props) {
  const fase01 = clientRecord?.fase01;
  const fase02 = clientRecord?.fase02;
  const fase03 = clientRecord?.fase03;
  const fase04 = clientRecord?.fase04;
  const fase05 = clientRecord?.fase05;
  const fase06 = clientRecord?.fase06;
  const fase07 = clientRecord?.fase07;
  const fase08 = clientRecord?.fase08;
  const fase09 = clientRecord?.fase09;

  const publicoRotulo = fase01?.publicoAlvoFinal ? getLabelById(fase01.publicoAlvoFinal) : 'Posicionamento Não Definido';
  const totalPacientesMapeados = fase01?.pacientesMapeados?.length ?? 0;
  const totalContatos = fase02?.contatos?.length ?? 0;
  const totalConvertidos = fase02?.contatos?.filter((c: any) => c.statusFechamento === 'sim')?.length ?? 0;
  const taxaConversao = totalContatos > 0 ? Math.round((totalConvertidos / totalContatos) * 100) : 0;

  const receitaMedia = fase08?.receitaMediaMensal ?? 0;
  const margemReal = fase08?.margemLiquidaRealPct ?? 0;
  const breakeven = fase08?.breakevenReais ?? 0;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 py-6" id="resumo_unificado_a3">
      {/* Header */}
      <div className="space-y-3 text-center sm:text-left border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">
            Sistema A3 · Painel Executivo Consolidado
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Resumo Unificado da Modelagem da Clínica</h1>
        <p className="text-sm text-slate-400 max-w-3xl">
          Visualização em tempo real do diagnóstico integrado de todos os 9 Eixos da Jornada do A3.
        </p>
      </div>

      {/* Grid de 9 Cards Executivos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Eixo 01 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 relative">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5" /> Eixo 01 · Promessa
            </span>
            <button type="button" onClick={() => onNavegarFase('fase01_promessa_metodo')} className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer">
              Editar ➔
            </button>
          </div>
          <h4 className="text-sm font-bold text-white leading-snug">{publicoRotulo}</h4>
          <p className="text-xs text-slate-400">{totalPacientesMapeados} pacientes mapeados na amostragem viva.</p>
        </div>

        {/* Eixo 02 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 relative">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" /> Eixo 02 · Captação
            </span>
            <button type="button" onClick={() => onNavegarFase('fase02_captacao')} className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer">
              Editar ➔
            </button>
          </div>
          <h4 className="text-sm font-bold text-emerald-400">{taxaConversao}% de Conversão Geral</h4>
          <p className="text-xs text-slate-400">{totalConvertidos} pacientes convertidos de {totalContatos} contatos.</p>
        </div>

        {/* Eixo 03 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 relative">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5" /> Eixo 03 · Vendas
            </span>
            <button type="button" onClick={() => onNavegarFase('fase03_vendas')} className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer">
              Editar ➔
            </button>
          </div>
          <h4 className="text-sm font-bold text-white">Funil Comercial Auditado</h4>
          <p className="text-xs text-slate-400">{fase03?.slaPrimeiroAtendimentoComercial ? `SLA: ${fase03.slaPrimeiroAtendimentoComercial}` : 'Gargalos e objeções catalogados.'}</p>
        </div>

        {/* Eixo 04 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 relative">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5" /> Eixo 04 · Serviços
            </span>
            <button type="button" onClick={() => onNavegarFase('fase04_servicos')} className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer">
              Editar ➔
            </button>
          </div>
          <h4 className="text-sm font-bold text-white">{fase04?.services?.length ?? 0} Serviços Modelados</h4>
          <p className="text-xs text-slate-400">Produtos, formatos e recorrências configurados.</p>
        </div>

        {/* Eixo 05 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 relative">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Eixo 05 · Entrega &amp; SLA
            </span>
            <button type="button" onClick={() => onNavegarFase('fase05_entrega_rotina')} className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer">
              Editar ➔
            </button>
          </div>
          <h4 className="text-sm font-bold text-white">{fase05?.slaResposta ?? 'SLA Definido'}</h4>
          <p className="text-xs text-slate-400">{fase05?.entregaveis?.length ?? 0} entregáveis clínicos cadastrados.</p>
        </div>

        {/* Eixo 06 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 relative">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Eixo 06 · Agenda
            </span>
            <button type="button" onClick={() => onNavegarFase('fase06_agenda')} className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer">
              Editar ➔
            </button>
          </div>
          <h4 className="text-sm font-bold text-white">{fase06?.horasClinicasLiquidasSemana ?? 30}h / sem Líquidas</h4>
          <p className="text-xs text-slate-400">{fase06?.totalHorasSemana ?? 40}h brutas semanais mapeadas.</p>
        </div>

        {/* Eixo 07 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 relative">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" /> Eixo 07 · Equipe
            </span>
            <button type="button" onClick={() => onNavegarFase('fase07_equipe')} className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer">
              Editar ➔
            </button>
          </div>
          <h4 className="text-sm font-bold text-white">R$ {(fase07?.custoTotalEquipe ?? 0).toLocaleString('pt-BR')} / mês</h4>
          <p className="text-xs text-slate-400">{fase07?.membros?.length ?? 0} pessoas na equipe de apoio.</p>
        </div>

        {/* Eixo 08 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 relative">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" /> Eixo 08 · Financeiro
            </span>
            <button type="button" onClick={() => onNavegarFase('fase08_financeiro')} className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer">
              Editar ➔
            </button>
          </div>
          <h4 className="text-sm font-bold text-emerald-400">Margem: {margemReal}%</h4>
          <p className="text-xs text-slate-400">Receita Média: R$ {receitaMedia.toLocaleString('pt-BR')} | Breakeven: R$ {Math.round(breakeven).toLocaleString('pt-BR')}</p>
        </div>

        {/* Eixo 09 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 relative">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5" /> Eixo 09 · Simulação
            </span>
            <button type="button" onClick={() => onNavegarFase('fase09_metas_simulacao')} className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer">
              Editar ➔
            </button>
          </div>
          <h4 className="text-sm font-bold text-white">Mesa de Controle Viva</h4>
          <p className="text-xs text-slate-400">Simulador de 5 alavancas de crescimento para 90 dias.</p>
        </div>
      </div>
    </div>
  );
}
