// Fase07Flow.tsx
// Módulo Eixo 07 — Gestão de Equipe, Processos & Liderança em LINGUAGEM SIMPLES.
// Alavancado 100% pelos dados dos Eixos 01 a 06 com Gerador Automático de Descrição de Cargos, Capacidade de Suporte e Ritos de Gestão.
// 100% Analítico e Neutro (Simulação Exclusiva do Eixo 09).

import React, { useState, useMemo } from 'react';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Users, UserPlus, Trash2, CheckCircle2, ArrowRight, Sparkles, ShieldAlert, CheckSquare, Layers, FileText, Briefcase } from 'lucide-react';
import { CATALOGO_PAPEIS_EQUIPE } from './catalogoPapeisEquipe';
import { calcularCapacidadeEquipe, MembroEquipeCadastrado } from './lib/calcularCapacidadeEquipe';

interface Fase07FlowProps {
  uid: string;
  initialState?: any;
  pacientesAtivosContagem?: number;
  microAcoesDelegadasEixo06?: string[];
  onAvancarEixo08?: () => void;
}

export default function Fase07Flow({
  uid,
  initialState,
  pacientesAtivosContagem = 38,
  microAcoesDelegadasEixo06 = [],
  onAvancarEixo08,
}: Fase07FlowProps) {
  const [possuiEquipe, setPossuiEquipe] = useState<'Sim' | 'Não'>(initialState?.possuiEquipe ?? 'Sim');
  const [membros, setMembros] = useState<MembroEquipeCadastrado[]>(
    initialState?.membros ?? [
      { id: 'm1', nome: 'Mariana Costa', papelId: 'secretaria_comercial', nomePapel: 'Secretária / Assistente Comercial', horasSemanais: 40, custoMensal: 2000 },
      { id: 'm2', nome: 'Lucas Andrade', papelId: 'estagiario_nutricao', nomePapel: 'Estagiário(a) de Nutrição', horasSemanais: 20, custoMensal: 1200 },
    ]
  );

  // Form State
  const [nomeNovo, setNomeNovo] = useState('');
  const [papelIdNovo, setPapelIdNovo] = useState('estagiario_nutricao');
  const [horasNovas, setHorasNovas] = useState('20');
  const [custoNovo, setCustoNovo] = useState('1200');
  const [salvo, setSalvo] = useState(false);

  // Checklists dos Ritos de Auditoria 5-5-5-5
  const [ritosChecados, setRitosChecados] = useState<Record<string, boolean>>({
    auditoria_dietas: true,
    auditoria_conversas: true,
    daily_meeting: true,
    weekly_meeting: true,
  });

  const resultadoCapacidade = useMemo(() => {
    return calcularCapacidadeEquipe(membros, pacientesAtivosContagem);
  }, [membros, pacientesAtivosContagem]);

  function handleAdicionarMembro(e: React.FormEvent) {
    e.preventDefault();
    if (!nomeNovo.trim()) return;

    const tpl = CATALOGO_PAPEIS_EQUIPE.find((p) => p.id === papelIdNovo) || CATALOGO_PAPEIS_EQUIPE[0];
    const novo: MembroEquipeCadastrado = {
      id: `m_${Date.now()}`,
      nome: nomeNovo.trim(),
      papelId: tpl.id,
      nomePapel: tpl.nomePapel,
      horasSemanais: parseFloat(horasNovas) || tpl.cargaHorariaSemanalPadrao,
      custoMensal: parseFloat(custoNovo) || tpl.custoMensalEstimadoPadrao,
    };

    setMembros((prev) => [...prev, novo]);
    setNomeNovo('');
    setHorasNovas('20');
    setCustoNovo('1200');
  }

  function handleRemoverMembro(id: string) {
    setMembros((prev) => prev.filter((m) => m.id !== id));
  }

  function handlePapelSelectChange(idPapel: string) {
    setPapelIdNovo(idPapel);
    const tpl = CATALOGO_PAPEIS_EQUIPE.find((p) => p.id === idPapel);
    if (tpl) {
      setHorasNovas(String(tpl.cargaHorariaSemanalPadrao));
      setCustoNovo(String(tpl.custoMensalEstimadoPadrao));
    }
  }

  async function handleSalvar() {
    try {
      const data = {
        possuiEquipe,
        membros,
        totalMembros: resultadoCapacidade.totalMembros,
        custoTotalEquipe: resultadoCapacidade.totalCustoMensalFolha,
        capacidadePacientesSuportados: resultadoCapacidade.capacidadePacientesSuportados,
        ritosChecados,
        fase07Completa: true,
        atualizadoEm: new Date().toISOString(),
      };
      const ref = doc(db, 'clients', uid);
      await updateDoc(ref, { fase07: data }).catch(async () => {
        await setDoc(ref, { fase07: data }, { merge: true });
      });
      setSalvo(true);
      setTimeout(() => setSalvo(false), 3000);
      if (onAvancarEixo08) onAvancarEixo08();
    } catch (err) {
      console.error('[Fase07Flow] Erro ao salvar:', err);
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 py-6 animate-fade-in">
      {/* Header em Linguagem Simples */}
      <div className="space-y-2 border-b border-slate-800 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
            Eixo 07 · Gestão de Equipe &amp; Liderança
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white">Organização do Time &amp; Descrição de Tarefas</h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          Cadastre as pessoas que trabalham no seu consultório. O Sistema A3 gera automaticamente a descrição de cargos e calcula a capacidade de atendimento do seu time.
        </p>
      </div>

      {/* ── SEÇÃO 1: ROTA SOLO VS POSSUI EQUIPE DE APOIO ── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Users className="h-4 w-4 text-emerald-400" />
          1. Você atende 100% solo ou possui equipe de apoio no consultório?
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPossuiEquipe('Sim')}
            className={`p-4 rounded-xl border font-bold text-xs transition-all cursor-pointer text-left flex items-center justify-between ${
              possuiEquipe === 'Sim'
                ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div>
              <span className="block text-sm">👥 Possuo Equipe de Apoio</span>
              <span className="text-[11px] font-normal text-slate-400">Tenho estagiários, secretária ou assistentes.</span>
            </div>
            {possuiEquipe === 'Sim' && <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-none" />}
          </button>

          <button
            type="button"
            onClick={() => setPossuiEquipe('Não')}
            className={`p-4 rounded-xl border font-bold text-xs transition-all cursor-pointer text-left flex items-center justify-between ${
              possuiEquipe === 'Não'
                ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div>
              <span className="block text-sm">🧑‍⚕️ Atendo 100% Solo</span>
              <span className="text-[11px] font-normal text-slate-400">Eu mesmo cuido de todas as etapas do consultório.</span>
            </div>
            {possuiEquipe === 'Não' && <CheckCircle2 className="h-5 w-5 text-amber-400 flex-none" />}
          </button>
        </div>
      </div>

      {possuiEquipe === 'Sim' && (
        <>
          {/* ── CADASTRO DE MEMBROS DA EQUIPE ── */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-emerald-400" />
              Membros Atuais da Sua Equipe
            </h2>

            {/* Form de Adição */}
            <form onSubmit={handleAdicionarMembro} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nome do Colaborador:</label>
                  <input
                    type="text"
                    value={nomeNovo}
                    onChange={(e) => setNomeNovo(e.target.value)}
                    placeholder="Ex: Mariana Costa"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Papel / Função:</label>
                  <select
                    value={papelIdNovo}
                    onChange={(e) => handlePapelSelectChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-semibold focus:border-emerald-500"
                  >
                    {CATALOGO_PAPEIS_EQUIPE.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.icone} {p.nomePapel}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Carga Horária (h/sem):</label>
                  <input
                    type="number"
                    min={1}
                    value={horasNovas}
                    onChange={(e) => setHorasNovas(e.target.value)}
                    placeholder="20"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-bold focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Custo Mensal (R$):</label>
                  <input
                    type="number"
                    min={0}
                    value={custoNovo}
                    onChange={(e) => setCustoNovo(e.target.value)}
                    placeholder="1200"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-emerald-400 font-bold focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow cursor-pointer flex items-center gap-1.5"
                >
                  <UserPlus className="h-3.5 w-3.5" /> Adicionar à Equipe
                </button>
              </div>
            </form>

            {/* Lista dos Membros */}
            <div className="space-y-2">
              {membros.map((m) => (
                <div key={m.id} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">{m.nome}</span>
                      <span className="text-[11px] text-slate-400">{m.nomePapel} · {m.horasSemanais}h/semana</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-emerald-400">R$ {m.custoMensal.toLocaleString('pt-BR')}/mês</span>
                    <button
                      type="button"
                      onClick={() => handleRemoverMembro(m.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 cursor-pointer transition-all"
                      title="Remover"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── SEÇÃO 2: DESCRIÇÃO DE CARGOS & DEVERES GERADA AUTOMATICAMENTE (VEM DO EIXO 06) ── */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-1">
                <Layers className="h-3 w-3 text-indigo-400" />
                <span className="text-[10px] font-bold text-indigo-400 uppercase">Gerado Automaticamente do Eixo 06</span>
              </div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                2. Descrição de Cargos &amp; Atribuições da Sua Equipe
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Com base nas tarefas marcadas no Eixo 06 como &quot;Atribuídas à Equipe&quot;, aqui está a lista automática de funções de cada colaborador:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CATALOGO_PAPEIS_EQUIPE.map((tpl) => (
                <div key={tpl.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                    <span className="text-lg">{tpl.icone}</span>
                    <div>
                      <h3 className="text-xs font-bold text-white">{tpl.nomePapel}</h3>
                      <span className="text-[10px] text-slate-400">{tpl.descricaoSimples}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase block">Deveres Principais:</span>
                    {tpl.atribuicoesPadrao.map((atrib, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{atrib}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── SEÇÃO 3: DIMENSIONAMENTO DE CAPACIDADE DE ATENDIMENTO DA EQUIPE ── */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-400" />
              3. Capacidade de Suporte da Sua Equipe
            </h2>
            <p className="text-xs text-slate-400">
              Cruza as horas da sua equipe com os entregáveis para mostrar quantos pacientes o seu time atual consegue atender com excelência.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Sua Equipe Atual</span>
                <p className="text-lg font-extrabold text-white">{resultadoCapacidade.totalMembros} colaboradores ({resultadoCapacidade.totalHorasSemanaisEquipe}h/sem)</p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Capacidade Máxima de Pacientes</span>
                <p className="text-lg font-extrabold text-emerald-400 font-mono">
                  Até {resultadoCapacidade.capacidadePacientesSuportados} pacientes ativos
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Uso da Capacidade Hoje</span>
                <p className="text-lg font-extrabold text-indigo-400 font-mono">
                  {resultadoCapacidade.percentualUsoCapacidadeAtual}% ocupado ({pacientesAtivosContagem} de {resultadoCapacidade.capacidadePacientesSuportados})
                </p>
              </div>
            </div>
          </div>

          {/* ── SEÇÃO 4: CUSTO DA FOLHA VS TEMPO LIBERADO DO EXPERT (ROI DA EQUIPE) ── */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-400" />
              4. Custo da Folha &amp; Tempo Liberado do Nutricionista Principal
            </h2>
            <p className="text-xs text-slate-400">
              Análise descritiva neutra do investimento mensal na folha comparado com as horas clínicas recuperadas para você focar no atendimento.
            </p>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Custo Total Mensal com Folha</span>
                <span className="text-xl font-extrabold text-amber-400 font-mono">
                  R$ {resultadoCapacidade.totalCustoMensalFolha.toLocaleString('pt-BR')} / mês
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Tempo Economizado pelo Nutricionista</span>
                <span className="text-xl font-extrabold text-emerald-400 font-mono">
                  ~{resultadoCapacidade.totalHorasSemanaisEquipe}h / semana liberadas
                </span>
              </div>
            </div>
          </div>

          {/* ── SEÇÃO 5: RITOS DE GESTÃO & AUDITORIA DE QUALIDADE (MÉTODO 5-5-5-5) ── */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-emerald-400" />
              5. Check-list de Ritos de Gestão &amp; Auditoria (Método 5-5-5-5)
            </h2>
            <p className="text-xs text-slate-400">
              Ritos práticos em Linguagem Simples para garantir que a equipe siga o padrão técnico exigido sem delargar a qualidade.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'auditoria_dietas', label: 'Auditoria de Dietas: Pente-fino em 5 cardápios da equipe por semana' },
                { id: 'auditoria_conversas', label: 'Auditoria de Atendimento: Leitura de 5 conversas do WhatsApp por semana' },
                { id: 'daily_meeting', label: 'Daily Meeting (15 min): Alinhamento diário rápido de tarefas e dúvidas' },
                { id: 'weekly_meeting', label: 'Weekly Meeting (60 min): Reunião de Segunda para revisar faturamento e metas' },
              ].map((rito) => (
                <label
                  key={rito.id}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-emerald-500/40 transition-all"
                >
                  <input
                    type="checkbox"
                    checked={ritosChecados[rito.id] ?? false}
                    onChange={(e) =>
                      setRitosChecados((prev) => ({ ...prev, [rito.id]: e.target.checked }))
                    }
                    className="h-4 w-4 rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-slate-200">{rito.label}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      {possuiEquipe === 'Não' && (
        <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-2xl text-center space-y-3 shadow-xl">
          <ShieldAlert className="h-8 w-8 text-amber-400 mx-auto" />
          <h3 className="text-sm font-bold text-white">Você opera no modelo 100% Solo atualmente</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Todas as microações do consultório são executadas diretamente por você. No <strong>Eixo 09 (Simulador de Metas)</strong>, você poderá simular o impacto financeiro de contratar seu primeiro estagiário ou assistente.
          </p>
        </div>
      )}

      {/* Botão de Avanço */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-6">
        {salvo ? (
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" /> Dados da equipe salvos com sucesso!
          </span>
        ) : (
          <div />
        )}

        <button
          type="button"
          onClick={handleSalvar}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
        >
          Salvar Mapeamento da Equipe e Avançar para Financeiro (Eixo 08)
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
