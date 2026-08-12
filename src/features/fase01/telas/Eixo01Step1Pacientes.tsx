import React, { useState, useMemo } from 'react';
import { UserPlus, Trash2, Edit3, ArrowRight, Check, Sparkles, DollarSign, Calendar, AlertCircle, Upload, ShoppingBag, RotateCcw, CheckSquare, Square } from 'lucide-react';
import { PacienteMapeadoEixo01, ClusterId, FATORES_PRIORITARIOS_POR_DOR } from '../fase01.types';
import { CLUSTERS, getLabelById } from '../data/bancoDePromessas';
import { obterDatasA3 } from '../../../lib/dateUtils';
import CestaDeDadosModal from '../../../components/CestaDeDadosModal';
import BoxMatchDeDados from '../../../components/BoxMatchDeDados';
import type { ResultadoProcessamentoCesta, ItemCestaExtraido } from '../../../lib/geminiImportService';

interface Eixo01Step1PacientesProps {
  pacientes: PacienteMapeadoEixo01[];
  onSalvarPaciente: (paciente: PacienteMapeadoEixo01) => void;
  onImportarEmLote: (pacientes: PacienteMapeadoEixo01[]) => void;
  onExcluirPaciente: (id: string) => void;
  onExcluirEmLote: (ids: string[]) => void;
  onRestaurarPacientes: (pacientes: PacienteMapeadoEixo01[]) => void;
  onAvancarParaPadroes: () => void;
}

type MesKey = 'mesM2' | 'mesM1' | 'mesM0';

export default function Eixo01Step1Pacientes({
  pacientes,
  onSalvarPaciente,
  onImportarEmLote,
  onExcluirPaciente,
  onExcluirEmLote,
  onRestaurarPacientes,
  onAvancarParaPadroes,
}: Eixo01Step1PacientesProps) {
  const datas = useMemo(() => obterDatasA3(null), []);
  const [pacienteEmEdicaoId, setPacienteEmEdicaoId] = useState<string | null>(null);

  // Seleção em Lote & Undo State
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [ultimosDeletados, setUltimosDeletados] = useState<PacienteMapeadoEixo01[] | null>(null);

  // Cesta de Dados State (Modal Amplo Contextual)
  const [cestaModalOpen, setCestaModalOpen] = useState(false);
  const [itensMatchPendentes, setItensMatchPendentes] = useState<ItemCestaExtraido[]>([]);
  const [feedbackImportacao, setFeedbackImportacao] = useState<string | null>(null);

  // Form State
  const [nome, setNome] = useState('');
  const [ticketPago, setTicketPago] = useState<string>('');
  const [dorId, setDorId] = useState<ClusterId>('estetica_emagrecimento');
  const [pilarForte, setPilarForte] = useState<string>('');
  const [elementoDiferencial, setElementoDiferencial] = useState<string>('');
  const [mesAtendimento, setMesAtendimento] = useState<MesKey>('mesM0');
  const [erroValidacao, setErroValidacao] = useState<string | null>(null);

  const opcoesFatores = FATORES_PRIORITARIOS_POR_DOR[dorId]?.opcoes ?? [];

  // Ajusta seleções de pilar e diferencial quando a dor muda
  const handleSelecionarDor = (novaDor: ClusterId) => {
    setDorId(novaDor);
    const novasOpcoes = FATORES_PRIORITARIOS_POR_DOR[novaDor]?.opcoes ?? [];
    setPilarForte(novasOpcoes[0] || '');
    setElementoDiferencial(novasOpcoes[1] || novasOpcoes[0] || '');
  };

  const handleSubmeterForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setErroValidacao('Por favor, informe o nome do paciente.');
      return;
    }
    setErroValidacao(null);

    const valTicket = Number(ticketPago) > 0 ? Number(ticketPago) : undefined;
    const pilarFinal = pilarForte || opcoesFatores[0] || 'Liberdade & Praticidade';
    const diferencialFinal = elementoDiferencial || opcoesFatores[1] || 'Transformação Visual';

    const pacienteSalvar: PacienteMapeadoEixo01 = {
      id: pacienteEmEdicaoId || `pac_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      nome: nome.trim(),
      dorId,
      pilarForte: pilarFinal,
      elementoDiferencial: diferencialFinal,
      ticketPagoEstimado: valTicket,
      mesAtendimento,
      createdAt: new Date().toISOString(),
    };

    onSalvarPaciente(pacienteSalvar);

    // Reset Form
    setPacienteEmEdicaoId(null);
    setNome('');
    setTicketPago('');
    setPilarForte(opcoesFatores[0] || '');
    setElementoDiferencial(opcoesFatores[1] || opcoesFatores[0] || '');
  };

  const handleEditar = (p: PacienteMapeadoEixo01) => {
    setPacienteEmEdicaoId(p.id);
    setNome(p.nome);
    setTicketPago(p.ticketPagoEstimado ? String(p.ticketPagoEstimado) : '');
    setDorId(p.dorId);
    setPilarForte(p.pilarForte);
    setElementoDiferencial(p.elementoDiferencial);
    setMesAtendimento(p.mesAtendimento || 'mesM0');
  };

  const handleCancelarEdicao = () => {
    setPacienteEmEdicaoId(null);
    setNome('');
    setTicketPago('');
    setPilarForte('');
    setElementoDiferencial('');
  };

  const handleToggleSelecionarTodos = () => {
    if (selecionados.length === pacientes.length) {
      setSelecionados([]);
    } else {
      setSelecionados(pacientes.map((p) => p.id));
    }
  };

  const handleToggleSelecionarUm = (id: string) => {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExcluirUmComUndo = (p: PacienteMapeadoEixo01) => {
    setUltimosDeletados([p]);
    onExcluirPaciente(p.id);
    setSelecionados((prev) => prev.filter((id) => id !== p.id));
  };

  const handleExcluirSelecionadosComUndo = () => {
    if (selecionados.length === 0) return;
    const aDeletar = pacientes.filter((p) => selecionados.includes(p.id));
    setUltimosDeletados(aDeletar);
    onExcluirEmLote(selecionados);
    setSelecionados([]);
  };

  const handleDesfazerExclusao = () => {
    if (!ultimosDeletados || ultimosDeletados.length === 0) return;
    onRestaurarPacientes(ultimosDeletados);
    setFeedbackImportacao(`✓ ${ultimosDeletados.length} paciente(s) restaurado(s) à amostra.`);
    setUltimosDeletados(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fadeIn" id="step1_seus_pacientes">
      {/* ── TOAST DE UNDO / DESFAZER EXCLUSÃO ── */}
      {ultimosDeletados && ultimosDeletados.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-indigo-500/50 text-white text-xs font-bold shadow-2xl flex items-center justify-between animate-fadeIn">
          <span className="flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-amber-400" />
            {ultimosDeletados.length === 1
              ? `Paciente "${ultimosDeletados[0].nome}" foi excluído.`
              : `${ultimosDeletados.length} pacientes foram excluídos da amostra.`}
          </span>
          <button
            type="button"
            onClick={handleDesfazerExclusao}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow cursor-pointer flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Desfazer Exclusão</span>
          </button>
        </div>
      )}

      {/* ── FEEDBACK DE IMPORTAÇÃO ── */}
      {feedbackImportacao && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-lg flex items-center justify-between animate-fadeIn">
          <span>{feedbackImportacao}</span>
          <button type="button" onClick={() => setFeedbackImportacao(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* ── BOX DE MATCH DE DADOS A3 (PENDENTES) ── */}
      {itensMatchPendentes.length > 0 && (
        <BoxMatchDeDados
          tituloEixo="Eixo 01 · Promessa &amp; Atendimentos"
          itens={itensMatchPendentes}
          onIgnorar={() => setItensMatchPendentes([])}
          onConfirmarItem={(item) => {
            const novoPac: PacienteMapeadoEixo01 = {
              id: `pac_match_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              nome: item.nome,
              dorId: (item.dorId as ClusterId) || 'estetica_emagrecimento',
              pilarForte: 'Liberdade & Praticidade',
              elementoDiferencial: 'Transformação Visual',
              ticketPagoEstimado: item.valor || 450,
              mesAtendimento: item.mesAtendimento || 'mesM0',
              createdAt: new Date().toISOString(),
            };
            onSalvarPaciente(novoPac);
            setItensMatchPendentes((prev) => prev.filter((i) => i.id !== item.id));
          }}
          onConfirmarTodos={(confirmados) => {
            const novosPacs: PacienteMapeadoEixo01[] = confirmados.map((item, idx) => ({
              id: `pac_match_all_${Date.now()}_${idx}`,
              nome: item.nome,
              dorId: (item.dorId as ClusterId) || 'estetica_emagrecimento',
              pilarForte: 'Liberdade & Praticidade',
              elementoDiferencial: 'Transformação Visual',
              ticketPagoEstimado: item.valor || 450,
              mesAtendimento: item.mesAtendimento || 'mesM0',
              createdAt: new Date().toISOString(),
            }));
            onImportarEmLote(novosPacs);
            setItensMatchPendentes([]);
          }}
        />
      )}

      {/* ── HERO SECTION ── */}
      <div className="text-center sm:text-left space-y-2 border-b border-white/10 pb-6">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-400 font-label">
          Etapa 01 de 04 · Seus Pacientes
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          Vamos descobrir por que seus pacientes escolhem você
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Mapeie pacientes reais dos últimos meses para revelarmos o padrão que sustenta seu método.
        </p>
      </div>

      {/* ── WORKSPACE FORMULÁRIO ── */}
      <form onSubmit={handleSubmeterForm} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-indigo-400" />
            {pacienteEmEdicaoId ? 'Editar Paciente Mapeado' : 'Mapear novo paciente'}
          </h3>

          <div className="flex items-center gap-3">
            {pacienteEmEdicaoId && (
              <button
                type="button"
                onClick={handleCancelarEdicao}
                className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
              >
                Cancelar Edição
              </button>
            )}

            {/* BOTÃO SECUNDÁRIO OUTLINE PARA IMPORTAR DA CESTA DE DADOS */}
            <button
              type="button"
              onClick={() => setCestaModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 hover:bg-indigo-500/20 text-indigo-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="Já possui planilhas, PDFs ou dados colados? Importe via Cesta de Coleta A3"
            >
              <ShoppingBag className="h-3.5 w-3.5 text-indigo-400" />
              <span>Importar da Cesta de Dados</span>
            </button>
          </div>
        </div>

        {erroValidacao && (
          <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{erroValidacao}</span>
          </div>
        )}

        {/* Campos Básicos: Nome & Ticket */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs font-bold text-slate-300 block">Nome do paciente *</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Ana Maria Silva"
              className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-sm focus:outline-none focus:border-indigo-400 font-semibold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 block">Ticket Pago (R$)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-mono font-bold">R$</span>
              <input
                type="number"
                min="0"
                value={ticketPago}
                onChange={(e) => setTicketPago(e.target.value)}
                placeholder="450"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-indigo-400 font-bold"
              />
            </div>
          </div>
        </div>

        {/* ── GRUPO 1: Qual é a dor principal? (Chips da Dor/Nicho) ── */}
        <div className="space-y-2 pt-2 border-t border-white/5">
          <label className="text-xs font-bold text-indigo-300 block">
            1. Qual é a dor principal que o trouxe até você?
          </label>
          <div className="flex flex-wrap gap-2">
            {CLUSTERS.map((c) => {
              const selected = dorId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelecionarDor(c.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5 ${
                    selected
                      ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {selected && <Check className="h-3.5 w-3.5 text-white" />}
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── GRUPO 2: O que ele mais valoriza? (Chips do Pilar Forte) ── */}
        <div className="space-y-2 pt-2 border-t border-white/5">
          <label className="text-xs font-bold text-emerald-300 block">
            2. O que ele mais valoriza no seu trabalho? (Pilar Forte)
          </label>
          <div className="flex flex-wrap gap-2">
            {opcoesFatores.map((op, idx) => {
              const selected = pilarForte === op || (!pilarForte && idx === 0);
              return (
                <button
                  key={op}
                  type="button"
                  onClick={() => setPilarForte(op)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5 ${
                    selected
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/30'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {selected && <Check className="h-3.5 w-3.5 text-white" />}
                  {op}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── GRUPO 3: O que ele percebe como diferente? (Chips do Diferencial) ── */}
        <div className="space-y-2 pt-2 border-t border-white/5">
          <label className="text-xs font-bold text-purple-300 block">
            3. O que ele percebe como diferente na sua entrega? (Diferencial)
          </label>
          <div className="flex flex-wrap gap-2">
            {opcoesFatores.map((op, idx) => {
              const selected = elementoDiferencial === op || (!elementoDiferencial && idx === 1);
              return (
                <button
                  key={op}
                  type="button"
                  onClick={() => setElementoDiferencial(op)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5 ${
                    selected
                      ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/30'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {selected && <Check className="h-3.5 w-3.5 text-white" />}
                  {op}
                </button>
              );
            })}
          </div>
        </div>

        {/* Botão de Submissão */}
        <div className="pt-3 border-t border-white/10 flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-xl shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            {pacienteEmEdicaoId ? 'Salvar Alterações' : 'Adicionar Paciente'}
          </button>
        </div>
      </form>

      {/* ── LISTA COMPACTA DE PACIENTES MAPEADOS ── */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-2">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              📋 Pacientes Mapeados
              <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono font-bold">
                {pacientes.length}
              </span>
            </h3>

            {pacientes.length > 0 && (
              <button
                type="button"
                onClick={handleToggleSelecionarTodos}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer font-semibold ml-2"
              >
                {selecionados.length === pacientes.length ? (
                  <CheckSquare className="h-4 w-4 text-indigo-400" />
                ) : (
                  <Square className="h-4 w-4 text-slate-500" />
                )}
                <span>{selecionados.length === pacientes.length ? 'Desmarcar todos' : 'Selecionar todos'}</span>
              </button>
            )}
          </div>

          {selecionados.length > 0 && (
            <button
              type="button"
              onClick={handleExcluirSelecionadosComUndo}
              className="px-3 py-1.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Excluir selecionados ({selecionados.length})</span>
            </button>
          )}
        </div>

        {pacientes.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-300">
              Nenhum paciente adicionado à amostra ainda.
            </p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Preencha o formulário acima com 3 ou mais pacientes recentes para o A3 identificar os padrões do seu consultório.
            </p>
          </div>
        ) : (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl divide-y divide-white/5">
            {pacientes.map((p) => {
              const isChecked = selecionados.includes(p.id);
              return (
                <div
                  key={p.id}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                    isChecked ? 'bg-indigo-950/30' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleSelecionarUm(p.id)}
                      className="text-slate-400 hover:text-white cursor-pointer shrink-0"
                    >
                      {isChecked ? (
                        <CheckSquare className="h-4 w-4 text-indigo-400" />
                      ) : (
                        <Square className="h-4 w-4 text-slate-600" />
                      )}
                    </button>

                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white font-body">{p.nome}</span>
                        {p.ticketPagoEstimado && (
                          <span className="text-xs font-mono font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            R$ {p.ticketPagoEstimado}
                          </span>
                        )}
                        {(p.id.includes('cesta') || p.id.includes('match')) && (
                          <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                            Importado da Cesta
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 flex-wrap">
                        <span className="text-indigo-300 font-semibold">{getLabelById(p.dorId)}</span>
                        <span>•</span>
                        <span className="text-slate-300">{p.pilarForte}</span>
                        <span>•</span>
                        <span className="text-purple-300">{p.elementoDiferencial}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 justify-end shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEditar(p)}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
                      title="Editar paciente"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExcluirUmComUndo(p)}
                      className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:text-red-300 transition-all cursor-pointer"
                      title="Excluir paciente"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── INSIGHT MÍNIMO & CTA SEGUNDA TELA ── */}
      {pacientes.length >= 1 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/80 border border-indigo-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">
                {pacientes.length} {pacientes.length === 1 ? 'paciente analisado' : 'pacientes analisados'} · já encontramos sinais de um padrão!
              </span>
              <span className="text-[11px] text-slate-400">
                Avance para visualizar os 3 grandes pilares que regem seu atendimento.
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onAvancarParaPadroes}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-xl shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            <span>Ver padrões encontrados</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── OVERLAY MODAL: CESTA DE DADOS A3 ── */}
      {cestaModalOpen && (
        <CestaDeDadosModal
          onProcessado={(resultado) => {
            // Processamento concluído no modal
          }}
          onConfirmarImportacao={(itensValidados) => {
            const novosPacs: PacienteMapeadoEixo01[] = itensValidados
              .filter((item) => item.nome && item.nome.trim().length > 0)
              .map((item, idx) => ({
                id: `pac_cesta_${Date.now()}_${idx}`,
                nome: item.nome.trim(),
                dorId: (item.dorId as ClusterId) || 'estetica_emagrecimento',
                pilarForte: 'Liberdade & Praticidade',
                elementoDiferencial: 'Transformação Visual',
                ticketPagoEstimado: item.valor || 450,
                mesAtendimento: item.mesAtendimento || 'mesM0',
                createdAt: new Date().toISOString(),
              }));

            if (novosPacs.length > 0) {
              onImportarEmLote(novosPacs);
              setFeedbackImportacao(`✓ ${novosPacs.length} pacientes importados da Cesta de Dados com sucesso!`);
            }
            setCestaModalOpen(false);
          }}
          onFechar={() => setCestaModalOpen(false)}
        />
      )}
    </div>
  );
}
