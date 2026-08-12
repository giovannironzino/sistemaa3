// Tela06CentralMapeamento.tsx
// Tela de Mapeamento Vivo de Pacientes — Master-Detail com Passo 0 (Software CRM),
// 3 Blocos Colapsáveis Mensais e Espelho da Promessa Reativo em Tempo Real.

import React, { useState, useMemo } from 'react';
import { UserPlus, Trash2, Edit3, ArrowRight, CheckCircle2, UserCheck, DollarSign, Calendar, ChevronDown, ChevronUp, Sparkles, Building2, Laptop } from 'lucide-react';
import { PacienteMapeadoEixo01, ClusterId, FATORES_PRIORITARIOS_POR_DOR } from '../fase01.types';
import EspelhoPromessaReativo from '../components/EspelhoPromessaReativo';
import { obterDatasA3 } from '../../../lib/dateUtils';

const OPCOES_SOFTWARE_CRM = [
  'WebDiet',
  'Welts',
  'Nutritrack',
  'PersonalDiet',
  'WebNutri',
  'Planilhas Excel / Google',
  'Outro Software / Anotações em Papel',
];

interface Tela06CentralMapeamentoProps {
  pacientesIniciais: PacienteMapeadoEixo01[];
  nomeConsultorioInicial?: string;
  softwareCrmInicial?: string;
  totalPacientesAtivosInicial?: number;
  onAvancar: (pacientes: PacienteMapeadoEixo01[], extra?: { nomeConsultorio?: string; softwareCrmUtilizado?: string; totalPacientesAtivosVigentes?: number }) => void;
}

type MesKey = 'mesM2' | 'mesM1' | 'mesM0';

import CestaDeDadosDrawer from '../../../components/CestaDeDadosDrawer';
import TelaConfirmacaoCesta from '../../../components/TelaConfirmacaoCesta';
import { alagarDadosDaCestaNoSistema } from '../../../lib/alagamentoRelatorioService';
import type { ResultadoProcessamentoCesta, ItemCestaExtraido } from '../../../lib/geminiImportService';

export default function Tela06CentralMapeamento({
  pacientesIniciais,
  nomeConsultorioInicial = '',
  softwareCrmInicial = 'WebDiet',
  totalPacientesAtivosInicial,
  onAvancar,
}: Tela06CentralMapeamentoProps) {
  const datas = useMemo(() => obterDatasA3(null), []);
  const [pacientes, setPacientes] = useState<PacienteMapeadoEixo01[]>(pacientesIniciais);
  const [pacienteEmEdicaoId, setPacienteEmEdicaoId] = useState<string | null>(null);

  // Passo 0 State
  const [nomeConsultorio, setNomeConsultorio] = useState(nomeConsultorioInicial);
  const [softwareCrm, setSoftwareCrm] = useState(softwareCrmInicial);
  const [totalAtivosCustom, setTotalAtivosCustom] = useState<number | ''>(
    totalPacientesAtivosInicial ?? (pacientesIniciais.length > 0 ? pacientesIniciais.length : 30)
  );

  // Cesta de Dados State (Atalho opcional)
  const [cestaDrawerOpen, setCestaDrawerOpen] = useState(false);
  const [confirmacaoCestaOpen, setConfirmacaoCestaOpen] = useState(false);
  const [resultadoCesta, setResultadoCesta] = useState<ResultadoProcessamentoCesta | null>(null);

  // Mês ativo no formulário
  const [mesForm, setMesForm] = useState<MesKey>('mesM0');

  // Estado dos blocos colapsáveis por mês
  const [openMeses, setOpenMeses] = useState<Record<MesKey, boolean>>({
    mesM0: true,
    mesM1: true,
    mesM2: true,
  });

  // Form State
  const [nome, setNome] = useState('');
  const [dorId, setDorId] = useState<ClusterId>('estetica_emagrecimento');
  const [pilarForte, setPilarForte] = useState<string>('');
  const [elementoDiferencial, setElementoDiferencial] = useState<string>('');
  const [ticketPagoEstimado, setTicketPagoEstimado] = useState<string>('');

  const opcoesFatores = FATORES_PRIORITARIOS_POR_DOR[dorId]?.opcoes ?? [];

  const mesesInfo: { key: MesKey; label: string }[] = [
    { key: 'mesM2', label: datas.mesM2 },
    { key: 'mesM1', label: datas.mesM1 },
    { key: 'mesM0', label: datas.mesM0 },
  ];

  function toggleMes(key: MesKey) {
    setOpenMeses((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleStartAddNoMes(key: MesKey) {
    setMesForm(key);
    setPacienteEmEdicaoId(null);
    setNome('');
    setPilarForte('');
    setElementoDiferencial('');
    setTicketPagoEstimado('');
    setOpenMeses((prev) => ({ ...prev, [key]: true }));
  }

  function handleSalvarPaciente(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return;

    const valTicket = ticketPagoEstimado ? parseFloat(ticketPagoEstimado.replace(',', '.')) : undefined;

    if (pacienteEmEdicaoId) {
      setPacientes((prev) =>
        prev.map((p) =>
          p.id === pacienteEmEdicaoId
            ? {
                ...p,
                nome: nome.trim(),
                dorId,
                pilarForte: pilarForte || opcoesFatores[0],
                elementoDiferencial: elementoDiferencial || (opcoesFatores[1] ?? opcoesFatores[0]),
                ticketPagoEstimado: valTicket,
                mesAtendimento: mesForm,
              }
            : p
        )
      );
      setPacienteEmEdicaoId(null);
    } else {
      const novoPaciente: PacienteMapeadoEixo01 = {
        id: `pac_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        nome: nome.trim(),
        dorId,
        pilarForte: pilarForte || opcoesFatores[0],
        elementoDiferencial: elementoDiferencial || (opcoesFatores[1] ?? opcoesFatores[0]),
        ticketPagoEstimado: valTicket,
        mesAtendimento: mesForm,
        createdAt: new Date().toISOString(),
      };
      setPacientes((prev) => [...prev, novoPaciente]);
    }

    // Reset Form
    setNome('');
    setPilarForte('');
    setElementoDiferencial('');
    setTicketPagoEstimado('');
  }

  function handleEditarPaciente(p: PacienteMapeadoEixo01) {
    setPacienteEmEdicaoId(p.id);
    setNome(p.nome);
    setDorId(p.dorId);
    setPilarForte(p.pilarForte);
    setElementoDiferencial(p.elementoDiferencial);
    setTicketPagoEstimado(p.ticketPagoEstimado ? String(p.ticketPagoEstimado) : '');
    setMesForm(p.mesAtendimento || 'mesM0');
  }

  function handleRemoverPaciente(id: string) {
    setPacientes((prev) => prev.filter((p) => p.id !== id));
    if (pacienteEmEdicaoId === id) {
      setPacienteEmEdicaoId(null);
      setNome('');
      setPilarForte('');
      setElementoDiferencial('');
      setTicketPagoEstimado('');
    }
  }

  function handleCancelarEdicao() {
    setPacienteEmEdicaoId(null);
    setNome('');
    setPilarForte('');
    setElementoDiferencial('');
    setTicketPagoEstimado('');
  }

  const totalAtivosCalculado = Number(totalAtivosCustom) || Math.max(pacientes.length, 1);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8" id="tela_central_mapeamento">
      {/* ── PASSO 0: Meu Cadastro & Setup do Software de Prontuário ── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400">
                Passo 0 · Setup Inicial da Clínica &amp; Software
              </span>
              <h2 className="text-lg font-bold text-white leading-tight">
                Qual software você usa para organizar seus pacientes?
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCestaDrawerOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/15 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/25 text-xs font-bold transition-all cursor-pointer shadow-lg shadow-indigo-500/10"
          >
            <Sparkles className="h-4 w-4" /> 🌾 Atalho: Importar com Cesta de Dados (Opcional)
          </button>
        </div>

        {/* Banner Orientador em Linguagem Simples */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3 text-xs leading-relaxed">
          <Sparkles className="h-4 w-4 text-emerald-400 mt-0.5 flex-none" />
          <div className="text-slate-300">
            <strong className="text-white font-semibold">Dica A3 para facilitar o seu trabalho:</strong> Abra o seu software de prontuário (ex: <strong className="text-emerald-400">{softwareCrm}</strong>) ao lado na tela, na aba de relatórios de atendimentos de <strong className="text-white">{datas.intervaloTrimestreRecente}</strong>. Ter essa lista aberta vai facilitar o preenchimento sem precisar adivinhar nada!
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-indigo-400" />
              Nome da Clínica / Consultório:
            </label>
            <input
              type="text"
              placeholder="Ex: Consultório Nutrição Viva"
              value={nomeConsultorio}
              onChange={(e) => setNomeConsultorio(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Laptop className="h-3.5 w-3.5 text-indigo-400" />
              Software de Prontuário / CRM:
            </label>
            <select
              value={softwareCrm}
              onChange={(e) => setSoftwareCrm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-indigo-300 font-semibold focus:border-indigo-500 focus:outline-none"
            >
              {OPCOES_SOFTWARE_CRM.map((sw) => (
                <option key={sw} value={sw}>{sw}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
              Total de Pacientes Ativos Hoje:
            </label>
            <input
              type="number"
              min="1"
              value={totalAtivosCustom}
              onChange={(e) => setTotalAtivosCustom(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
              placeholder="Ex: 45"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-emerald-400 font-bold font-mono focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Header Central de Mapeamento */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <Calendar className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
            Eixo 01 · Promessa &amp; Atendimentos ({datas.intervaloTrimestreRecente})
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white leading-snug">
          Mapeamento Vivo dos Pacientes por Mês
        </h1>
        <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
          Cadastre ou revise os pacientes atendidos em cada um dos últimos 3 meses.
          O total de <strong className="text-emerald-400">{totalAtivosCalculado} pacientes ativos</strong> vigentes no seu consultório será preservado para todos os eixos seguintes.
        </p>
      </div>

      {/* Grid Principal: Formulário + 3 Blocos Mensais + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Coluna Esquerda / Central (Formulário e 3 Blocos Mensais) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card de Formulário com Seleção de Mês */}
          <form
            onSubmit={handleSalvarPaciente}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-emerald-400" />
                {pacienteEmEdicaoId ? 'Editar Paciente' : 'Cadastrar Paciente Mapeado'}
              </h3>
              {pacienteEmEdicaoId && (
                <button
                  type="button"
                  onClick={handleCancelarEdicao}
                  className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                >
                  Cancelar edição
                </button>
              )}
            </div>

            {/* Chips de Seleção do Mês de Atendimento */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Selecione o Mês do Atendimento:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {mesesInfo.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMesForm(key)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer text-center ${
                      mesForm === key
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Campos Nome + Ticket */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Nome do Paciente:</label>
                <input
                  type="text"
                  placeholder="Ex: Ana Silva, Carlos Eduardo..."
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-emerald-400" />
                  Ticket (R$) <span className="text-[10px] text-slate-500 font-normal">(opcional)</span>
                </label>
                <input
                  type="number"
                  placeholder="Ex: 350"
                  value={ticketPagoEstimado}
                  onChange={(e) => setTicketPagoEstimado(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Seleção da Dor Principal */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                1. Qual foi a Dor Principal que o paciente buscou?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(Object.keys(FATORES_PRIORITARIOS_POR_DOR) as ClusterId[]).map((cId) => {
                  const info = FATORES_PRIORITARIOS_POR_DOR[cId];
                  const active = dorId === cId;
                  return (
                    <button
                      key={cId}
                      type="button"
                      onClick={() => {
                        setDorId(cId);
                        setPilarForte('');
                        setElementoDiferencial('');
                      }}
                      className={`text-left text-xs p-3 rounded-xl border transition-all cursor-pointer ${
                        active
                          ? 'bg-emerald-500/15 border-emerald-500/50 text-white font-semibold shadow-lg shadow-emerald-500/5'
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {info.rotulo}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pilar Forte 🥇 */}
            <div className="space-y-2 border-t border-slate-800/80 pt-4">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span>🥇 O que este paciente mais prioriza na consulta?</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {opcoesFatores.map((opcao) => {
                  const active = (pilarForte || opcoesFatores[0]) === opcao;
                  return (
                    <button
                      key={opcao}
                      type="button"
                      onClick={() => setPilarForte(opcao)}
                      className={`text-xs px-3.5 py-2 rounded-xl border transition-all cursor-pointer ${
                        active
                          ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {opcao}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Elemento Diferencial 🥈 */}
            <div className="space-y-2 border-t border-slate-800/80 pt-4">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span>🥈 O que também é decisivo para ele?</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {opcoesFatores.map((opcao) => {
                  const active = (elementoDiferencial || (opcoesFatores[1] ?? opcoesFatores[0])) === opcao;
                  return (
                    <button
                      key={opcao}
                      type="button"
                      onClick={() => setElementoDiferencial(opcao)}
                      className={`text-xs px-3.5 py-2 rounded-xl border transition-all cursor-pointer ${
                        active
                          ? 'bg-teal-500/20 border-teal-400 text-teal-300 font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {opcao}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                {pacienteEmEdicaoId ? 'Salvar Alterações' : 'Confirmar e Mapear Paciente'}
              </button>
            </div>
          </form>

          {/* ── 3 BLOCOS COLAPSÁVEIS MENSAIS ── */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-emerald-400" />
              Pacientes Mapeados por Mês ({pacientes.length} cadastrados no período)
            </h3>

            {mesesInfo.map(({ key, label }) => {
              const pacientesDoMes = pacientes.filter(
                (p) => (p.mesAtendimento || 'mesM0') === key
              );
              const isOpen = openMeses[key];
              const ticketMedioMes = pacientesDoMes.length > 0
                ? Math.round(pacientesDoMes.reduce((acc, p) => acc + (p.ticketPagoEstimado || 0), 0) / pacientesDoMes.length)
                : 0;

              return (
                <div key={key} className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                  {/* Cabeçalho do Bloco Mensal */}
                  <div className="p-4 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => toggleMes(key)}
                      className="flex items-center gap-3 text-left cursor-pointer"
                    >
                      {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                      <div>
                        <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">{label}</span>
                        <span className="text-[11px] text-slate-400 ml-3">
                          <strong className="text-white">{pacientesDoMes.length}</strong> paciente(s)
                          {ticketMedioMes > 0 && <span className="text-emerald-300 font-semibold ml-2">· Ticket Médio: R$ {ticketMedioMes}</span>}
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStartAddNoMes(key)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer"
                    >
                      <UserPlus className="h-3.5 w-3.5" /> + Adicionar neste mês
                    </button>
                  </div>

                  {/* Conteúdo do Bloco (Lista de Pacientes) */}
                  {isOpen && (
                    <div className="p-4 space-y-2.5">
                      {pacientesDoMes.length === 0 ? (
                        <p className="text-xs text-slate-500 italic text-center py-3">
                          Nenhum paciente cadastrado em {label}. Use o botão acima para adicionar.
                        </p>
                      ) : (
                        pacientesDoMes.map((p) => {
                          const dorRotulo = FATORES_PRIORITARIOS_POR_DOR[p.dorId]?.rotulo ?? p.dorId;
                          return (
                            <div
                              key={p.id}
                              className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 flex items-center justify-between gap-4 transition-all"
                            >
                              <div className="space-y-1">
                                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                                  🟢 {p.nome}
                                  {p.ticketPagoEstimado && (
                                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                      R$ {p.ticketPagoEstimado}
                                    </span>
                                  )}
                                </h4>
                                <p className="text-[11px] text-slate-400">
                                  {dorRotulo.split('/')[0]} · <span className="text-emerald-400 font-medium">{p.pilarForte}</span>
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleEditarPaciente(p)}
                                  className="p-1.5 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                  title="Editar paciente"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoverPaciente(p.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-400 bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                  title="Remover paciente"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Coluna Direita / Espelho da Promessa (Sticky Live Preview) */}
        <div className="lg:col-span-5">
          <EspelhoPromessaReativo pacientes={pacientes} />
        </div>
      </div>

      {/* Botão de Avanço */}
      <div className="flex justify-end border-t border-slate-800 pt-6">
        <button
          type="button"
          onClick={() => onAvancar(pacientes, { nomeConsultorio, softwareCrmUtilizado: softwareCrm, totalPacientesAtivosVigentes: totalAtivosCalculado })}
          disabled={pacientes.length === 0}
          className={`flex items-center gap-2 px-8 py-3.5 text-sm font-bold rounded-xl transition-all ${
            pacientes.length > 0
              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-xl shadow-emerald-500/20 cursor-pointer'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          Avançar para a Escolha do Método
        </button>
      </div>

      {/* Modal / Drawer da Cesta de Dados (Atalho Opcional) */}
      {cestaDrawerOpen && (
        <CestaDeDadosDrawer
          onFechar={() => setCestaDrawerOpen(false)}
          onProcessado={(resultado) => {
            setCestaDrawerOpen(false);
            setResultadoCesta(resultado);
            setConfirmacaoCestaOpen(true);
          }}
        />
      )}

      {/* Tela de Validação Humana Item por Item */}
      {confirmacaoCestaOpen && resultadoCesta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <TelaConfirmacaoCesta
            itensIniciais={resultadoCesta.itens}
            softwareDetectado={resultadoCesta.softwareDetectado}
            totalAtivosDetectados={resultadoCesta.totalPacientesAtivosDetectados}
            onCancelar={() => setConfirmacaoCestaOpen(false)}
            onConfirmar={async (itensValidados) => {
              setConfirmacaoCestaOpen(false);
              // Converte itens validados da Cesta em pacientes do Eixo 01
              const novosPacientesCesta: PacienteMapeadoEixo01[] = itensValidados
                .filter((i) => i.tipo === 'paciente')
                .map((i, idx) => ({
                  id: `pac_cesta_${Date.now()}_${idx}`,
                  nome: i.nome,
                  dorId: (i.dorId as ClusterId) || 'estetica_emagrecimento',
                  pilarForte: 'Liberdade & Praticidade',
                  elementoDiferencial: 'Transformação Visual',
                  ticketPagoEstimado: i.valor || 450,
                  mesAtendimento: i.mesAtendimento || 'mesM0',
                  createdAt: new Date().toISOString(),
                }));

              if (novosPacientesCesta.length > 0) {
                setPacientes((prev) => [...prev, ...novosPacientesCesta]);
              }
              if (resultadoCesta.totalPacientesAtivosDetectados) {
                setTotalAtivosCustom(resultadoCesta.totalPacientesAtivosDetectados);
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
