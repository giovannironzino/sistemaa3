// Fase07Flow.tsx
// Módulo Eixo 07 — Equipe & Delegação (Estrutura Humana, Sobrecarga e Custo de Pessoas)

import React, { useState } from 'react';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Users, UserPlus, Trash2, CheckCircle2, ArrowRight, Sparkles, ShieldAlert } from 'lucide-react';

interface MembroEquipe {
  id: string;
  nome: string;
  funcao: string;
  custoMensal: number;
}

interface Fase07FlowProps {
  uid: string;
  initialState?: any;
  onAvancarEixo08?: () => void;
}

export default function Fase07Flow({ uid, initialState, onAvancarEixo08 }: Fase07FlowProps) {
  const [possuiEquipe, setPossuiEquipe] = useState<'Sim' | 'Não'>(initialState?.possuiEquipe ?? 'Sim');
  const [membros, setMembros] = useState<MembroEquipe[]>(
    initialState?.membros ?? [
      { id: 'm1', nome: 'Mariana Costa', funcao: 'Recepção / Agendamento', custoMensal: 2200 },
      { id: 'm2', nome: 'Dra. Camila', funcao: 'Nutricionista Assistente', custoMensal: 3500 },
    ]
  );
  const [nomeNovo, setNomeNovo] = useState('');
  const [funcaoNova, setFuncaoNova] = useState('');
  const [custoNovo, setCustoNovo] = useState('');
  const [salvo, setSalvo] = useState(false);

  const custoTotalEquipe = possuiEquipe === 'Sim' ? membros.reduce((acc, m) => acc + (m.custoMensal || 0), 0) : 0;

  function handleAdicionarMembro(e: React.FormEvent) {
    e.preventDefault();
    if (!nomeNovo.trim()) return;
    const novo: MembroEquipe = {
      id: `m_${Date.now()}`,
      nome: nomeNovo.trim(),
      funcao: funcaoNova.trim() || 'Apoio Geral',
      custoMensal: parseFloat(custoNovo) || 0,
    };
    setMembros((prev) => [...prev, novo]);
    setNomeNovo('');
    setFuncaoNova('');
    setCustoNovo('');
  }

  function handleRemoverMembro(id: string) {
    setMembros((prev) => prev.filter((m) => m.id !== id));
  }

  async function handleSalvar() {
    try {
      const data = {
        possuiEquipe,
        membros,
        custoTotalEquipe,
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
    <div className="w-full max-w-4xl mx-auto space-y-8 py-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
            Eixo 07 · Equipe &amp; Delegação
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white">Quem faz parte da sua equipe de apoio hoje?</h1>
        <p className="text-sm text-slate-400">
          Mapeie a estrutura de pessoas atual da clínica. O subtotal de custos com equipe será importado automaticamente no Eixo 08.
        </p>
      </div>

      {/* Rota Solo vs Gestor */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Users className="h-4 w-4 text-emerald-400" />
          1. Você atende 100% solo ou possui equipe de apoio?
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPossuiEquipe('Não')}
            className={`p-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              possuiEquipe === 'Não'
                ? 'bg-emerald-500/15 border-emerald-500/50 text-white'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            👤 Atendimento 100% Solo (Sem Equipe)
          </button>
          <button
            type="button"
            onClick={() => setPossuiEquipe('Sim')}
            className={`p-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              possuiEquipe === 'Sim'
                ? 'bg-emerald-500/15 border-emerald-500/50 text-white'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            👥 Possuo Equipe (Secretária, Assistentes, etc.)
          </button>
        </div>
      </div>

      {/* Seção Cadastro de Equipe */}
      {possuiEquipe === 'Sim' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-emerald-400" />
            2. Cadastre os membros da sua equipe e custos mensais:
          </h3>

          <form onSubmit={handleAdicionarMembro} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <input
              type="text"
              placeholder="Nome da pessoa"
              value={nomeNovo}
              onChange={(e) => setNomeNovo(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500"
              required
            />
            <input
              type="text"
              placeholder="Função (Ex: Recepção, Comercial)"
              value={funcaoNova}
              onChange={(e) => setFuncaoNova(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500"
            />
            <input
              type="number"
              placeholder="Custo Mensal (R$)"
              value={custoNovo}
              onChange={(e) => setCustoNovo(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500"
            />
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2 px-4 rounded-lg transition-all"
            >
              + Adicionar
            </button>
          </form>

          {/* Lista de Membros */}
          <div className="space-y-2">
            {membros.map((m) => (
              <div key={m.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">{m.nome}</h4>
                  <p className="text-[11px] text-slate-400">{m.funcao}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-emerald-400">R$ {m.custoMensal.toLocaleString('pt-BR')} / mês</span>
                  <button
                    type="button"
                    onClick={() => handleRemoverMembro(m.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 bg-slate-900 rounded-lg"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Custo Total de Pessoas:</span>
            <span className="text-emerald-400 font-extrabold text-sm">R$ {custoTotalEquipe.toLocaleString('pt-BR')} / mês</span>
          </div>
        </div>
      )}

      {/* Alerta explicativo */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-start gap-3 text-xs text-slate-400">
        <ShieldAlert className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Nota de Arquitetura:</strong> Este eixo apura a estrutura presente. A viabilidade financeira para contratar novas pessoas será simulada no <strong>Eixo 09 (Mesa de Controle)</strong> após apuração da Margem Real no Eixo 08.
        </p>
      </div>

      {/* Botões de Ação */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-6">
        {salvo ? (
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" /> Dados salvos com sucesso!
          </span>
        ) : <div />}

        <button
          type="button"
          onClick={handleSalvar}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
        >
          Salvar e Avançar para Financeiro (Eixo 08)
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
