// Tela06CentralMapeamento.tsx
// Tela de Mapeamento Vivo de Pacientes — Master-Detail com Espelho da Promessa Reativo em Tempo Real.

import React, { useState, useMemo } from 'react';
import { UserPlus, Trash2, Edit3, ArrowRight, CheckCircle2, UserCheck, DollarSign, Calendar } from 'lucide-react';
import { PacienteMapeadoEixo01, ClusterId, FATORES_PRIORITARIOS_POR_DOR } from '../fase01.types';
import EspelhoPromessaReativo from '../components/EspelhoPromessaReativo';
import { obterDatasA3 } from '../../../lib/dateUtils';

interface Tela06CentralMapeamentoProps {
  pacientesIniciais: PacienteMapeadoEixo01[];
  onAvancar: (pacientes: PacienteMapeadoEixo01[]) => void;
}

export default function Tela06CentralMapeamento({
  pacientesIniciais,
  onAvancar,
}: Tela06CentralMapeamentoProps) {
  const datas = useMemo(() => obterDatasA3(null), []);
  const [pacientes, setPacientes] = useState<PacienteMapeadoEixo01[]>(pacientesIniciais);
  const [pacienteEmEdicaoId, setPacienteEmEdicaoId] = useState<string | null>(null);

  // Form State
  const [nome, setNome] = useState('');
  const [dorId, setDorId] = useState<ClusterId>('estetica_emagrecimento');
  const [pilarForte, setPilarForte] = useState<string>('');
  const [elementoDiferencial, setElementoDiferencial] = useState<string>('');
  const [ticketPagoEstimado, setTicketPagoEstimado] = useState<string>('');

  const opcoesFatores = FATORES_PRIORITARIOS_POR_DOR[dorId]?.opcoes ?? [];

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

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8" id="tela_central_mapeamento">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <Calendar className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
            Eixo 01 · Fase 01 · Mapeamento Vivo de Pacientes ({datas.intervaloTrimestreRecente})
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white leading-snug">
          Central de Mapeamento dos Atendimentos ({datas.intervaloTrimestreRecente})
        </h1>
        <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
          Cadastre ou revise os pacientes atendidos entre <strong className="text-emerald-400 font-semibold">{datas.intervaloTrimestreRecente}</strong>. Selecione a principal dor, os fatores de atendimento e o ticket médio (opcional) para ver a sua <strong>Promessa Única</strong> se consolidar ao vivo em Linguagem Simples.
        </p>
      </div>

      {/* Grid Principal: Master-Detail + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Coluna Esquerda / Central (Ação & Formulário) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card de Formulário (Chips) */}
          <form
            onSubmit={handleSalvarPaciente}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-emerald-400" />
                {pacienteEmEdicaoId ? 'Editar Paciente' : 'Adicionar Novo Paciente'}
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

            {/* Campos Nome + Ticket (Lado a Lado) */}
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

          {/* Lista de Pacientes Mapeados */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-emerald-400" />
              Pacientes Cadastrados ({pacientes.length})
            </h3>

            {pacientes.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-sm text-slate-400">
                Nenhum paciente cadastrado ainda. Preencha o formulário acima para adicionar o primeiro.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                {pacientes.map((p) => {
                  const dorRotulo = FATORES_PRIORITARIOS_POR_DOR[p.dorId]?.rotulo ?? p.dorId;
                  return (
                    <div
                      key={p.id}
                      className="bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex items-center justify-between gap-4 transition-all"
                    >
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          🟢 {p.nome}
                          {p.ticketPagoEstimado && (
                            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              R$ {p.ticketPagoEstimado}
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-slate-400">
                          {dorRotulo.split('/')[0]} · <span className="text-emerald-400 font-medium">{p.pilarForte}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditarPaciente(p)}
                          className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Editar paciente"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoverPaciente(p.id)}
                          className="p-2 text-slate-400 hover:text-red-400 bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Remover paciente"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
          onClick={() => onAvancar(pacientes)}
          disabled={pacientes.length === 0}
          className={`flex items-center gap-2 px-8 py-3.5 text-sm font-bold rounded-xl transition-all ${
            pacientes.length > 0
              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-xl shadow-emerald-500/20 cursor-pointer'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          Avançar para a Escolha do Método
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
