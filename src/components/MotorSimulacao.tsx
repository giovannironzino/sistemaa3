import React, { useState, useEffect } from 'react';
import { ClientBlocks, Scenario, ServiceData } from '../types';
import { saveClientScenario, deleteClientScenario, updateClientProfile } from '../lib/db';
import { calculateScenarioMetrics, calculateTotalFixedCosts, calculateAvailableMinutes } from '../lib/metrics';
import { Plus, Trash2, CheckCircle2, TrendingUp, AlertTriangle, Clock, ArrowRight, ArrowLeft } from 'lucide-react';

interface MotorSimulacaoProps {
  clientId: string;
  blocks: ClientBlocks;
  initialScenarios: Record<string, Scenario> | null;
  cenarioEscolhidoId: string | null;
  onBack: () => void;
  onSelectScenario: (scenarioId: string) => void;
}

export default function MotorSimulacao({
  clientId,
  blocks,
  initialScenarios,
  cenarioEscolhidoId,
  onBack,
  onSelectScenario
}: MotorSimulacaoProps) {
  const [scenarios, setScenarios] = useState<Record<string, Scenario>>({});
  const [activeTab, setActiveTab] = useState<'compare' | 'create'>('compare');

  // Form states for creating/editing scenario
  const [scenarioName, setScenarioName] = useState('');
  const [serviceEdits, setServiceEdits] = useState<{
    serviceId: string;
    name: string;
    price: number;
    activePatients: number;
    durationDays: number;
  }[]>([]);

  // Fixed values from blocks
  const faturamentoMeta = blocks.b9?.faturamento90 || 10000;
  const currentServices = blocks.b4?.services || [];

  useEffect(() => {
    // Generate Real Scenario
    const realServices = currentServices.map((s) => ({
      serviceId: s.id,
      name: s.name,
      price: s.price || 0,
      activePatients: s.activePatients || 0,
      durationDays: s.type === 'plano' ? (s.durationDays || 90) : 90
    }));

    const realMetrics = calculateScenarioMetrics(
      realServices,
      blocks.b5,
      blocks.b6,
      blocks.b7,
      blocks.b8,
      faturamentoMeta
    );

    const realScenario: Scenario = {
      id: 'real',
      name: 'Cenário Real (Atual)',
      isReal: true,
      createdAt: new Date().toISOString(),
      ...realMetrics
    };

    const initialMap = initialScenarios ? { ...initialScenarios } : {};
    setScenarios({
      real: realScenario,
      ...initialMap
    });
  }, [initialScenarios, blocks, faturamentoMeta, currentServices]);

  // Handle service edits prefill when tab changes to 'create'
  useEffect(() => {
    if (activeTab === 'create') {
      setServiceEdits(
        currentServices.map((s) => ({
          serviceId: s.id,
          name: s.name,
          price: s.price || 0,
          activePatients: s.activePatients || 0,
          durationDays: s.type === 'plano' ? (s.durationDays || 90) : 90
        }))
      );
    }
  }, [activeTab, currentServices]);

  const handleSaveScenario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scenarioName.trim()) {
      alert('Por favor, defina um nome para o cenário.');
      return;
    }

    const calculated = calculateScenarioMetrics(
      serviceEdits,
      blocks.b5,
      blocks.b6,
      blocks.b7,
      blocks.b8,
      faturamentoMeta
    );

    const newScenario: Scenario = {
      id: Math.random().toString(36).substring(2, 9),
      name: scenarioName,
      isReal: false,
      createdAt: new Date().toISOString(),
      ...calculated
    };

    try {
      await saveClientScenario(clientId, newScenario);
      setScenarioName('');
      setActiveTab('compare');
      alert('Novo cenário salvo com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar cenário.');
    }
  };

  const handleDeleteScenario = async (id: string) => {
    if (id === 'real') return;
    if (confirm('Tem certeza que deseja excluir este cenário de simulação?')) {
      try {
        await deleteClientScenario(clientId, id);
        // Remove locally
        const updated = { ...scenarios };
        delete updated[id];
        setScenarios(updated);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSelectOfficialScenario = async (id: string) => {
    try {
      await updateClientProfile(clientId, { cenarioEscolhidoId: id, currentStep: 'plano' });
      onSelectScenario(id);
      alert(`Cenário "${scenarios[id]?.name}" definido como escolhido! O Plano de 12 Semanas está liberado.`);
    } catch (err) {
      console.error(err);
    }
  };

  const calculateFaturamentoTotalCenaro = (sc: Scenario) => {
    let tot = 0;
    sc.services.forEach((s) => {
      const dur = s.durationDays || 90;
      tot += (s.price / (dur / 30)) * (s.activePatients || 0);
    });
    return tot;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-sans" id="simulador_root">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 border border-slate-200 bg-white text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-50 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 font-display">
              Motor de Simulação de Cenários
            </h1>
            <p className="text-sm text-slate-500">
              Crie alternativas de posicionamento, volume de atendimento, preços e compare a viabilidade operacional e financeira.
            </p>
          </div>
        </div>

        <div className="flex border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white">
          <button
            id="btn_tab_compare_scenarios"
            type="button"
            onClick={() => setActiveTab('compare')}
            className={`px-4 py-2 text-xs font-semibold ${
              activeTab === 'compare' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Comparar Cenários
          </button>
          <button
            id="btn_tab_create_scenario"
            type="button"
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 text-xs font-semibold border-l border-slate-200 ${
              activeTab === 'create' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            + Novo Cenário
          </button>
        </div>
      </div>

      {activeTab === 'compare' ? (
        <div className="space-y-6" id="comparacao_cenarios_view">
          {/* Legend Banner */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-indigo-950">
              <TrendingUp className="h-5 w-5 text-indigo-600 flex-shrink-0" />
              <span>
                Para que o <b>Plano de 12 Semanas (Call 3)</b> seja liberado, você deve oficializar um cenário que sirva de mapa de modelagem para o plano alimentar e financeiro do Nutricionista.
              </span>
            </div>
            {cenarioEscolhidoId && (
              <span className="text-xs bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-full font-bold whitespace-nowrap">
                Cenário Oficializado: {scenarios[cenarioEscolhidoId]?.name || 'Definido'}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(Object.values(scenarios) as Scenario[]).map((sc) => {
              const faturamentoCenario = calculateFaturamentoTotalCenaro(sc);
              const isSelected = cenarioEscolhidoId === sc.id;
              const capExceeded = sc.capacidadePercentual > 100;

              return (
                <div
                  key={sc.id}
                  className={`bg-white border rounded-2xl p-6 shadow-xs flex flex-col justify-between transition-all relative ${
                    isSelected
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'border-slate-200'
                  }`}
                >
                  {sc.isReal && (
                    <span className="absolute top-4 right-4 text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-bold">
                      Real
                    </span>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-base font-bold text-slate-800 line-clamp-1">{sc.name}</h4>
                      <span className="text-[10px] text-slate-400 block">
                        Faturamento Estimado: <span className="font-bold text-indigo-600">R$ {faturamentoCenario.toFixed(2)}/mês</span>
                      </span>
                    </div>

                    {/* Metrics list */}
                    <div className="border-t border-b border-slate-100 py-3.5 space-y-3 text-xs">
                      {/* Distancia meta */}
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Distância p/ Meta (R$ {faturamentoMeta.toFixed(0)})</span>
                        <span className={`font-bold ${sc.distanciaMeta <= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {sc.distanciaMeta <= 0 ? 'Meta Atingida!' : `R$ ${sc.distanciaMeta.toFixed(2)}`}
                        </span>
                      </div>

                      {/* Break Even */}
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Ponto de Equilíbrio (Custo)</span>
                        <span className="font-semibold text-slate-800">R$ {sc.pontoEquilibrio.toFixed(2)}</span>
                      </div>

                      {/* Capacity */}
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Ocupação da Agenda</span>
                        <span className={`font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                          capExceeded ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          <Clock className="h-3 w-3" />
                          {sc.capacidadePercentual.toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    {/* Services values inside scenario */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Serviços do Cenário:</span>
                      <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-1">
                        {sc.services.map((s) => (
                          <div key={s.serviceId} className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <span className="font-medium text-slate-700 truncate w-1/2">{s.name}</span>
                            <div className="text-right">
                              <span className="font-bold text-slate-800 block">R$ {s.price}</span>
                              <span className="text-[10px] text-slate-400 font-semibold">{s.activePatients} pacientes</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions inside scenario */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex gap-2">
                    {!sc.isReal && (
                      <button
                        type="button"
                        onClick={() => handleDeleteScenario(sc.id)}
                        className="p-2 border border-slate-200 rounded-xl hover:border-red-300 hover:text-red-500 hover:bg-red-50/50 text-slate-400"
                        title="Excluir"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    )}

                    <button
                      id={`btn_select_scenario_${sc.id}`}
                      type="button"
                      onClick={() => handleSelectOfficialScenario(sc.id)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span>Cenário Oficial</span>
                        </>
                      ) : (
                        <span>Oficializar Cenário</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSaveScenario} className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs space-y-6" id="criar_cenario_form_box">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-display">Criar Novo Cenário de Simulação</h3>
            <p className="text-xs text-slate-500">
              Ajuste preços e o volume de pacientes de cada serviço cadastrado para simular o resultado financeiro ideal.
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">Nome do Cenário</label>
            <input
              type="text"
              required
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              placeholder="Ex: Enfoque no Acompanhamento Online com Ticket Médio de R$ 900"
              className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block border-b border-slate-100 pb-1.5">
              Ajustar Serviços no Cenário:
            </span>

            {serviceEdits.map((se, index) => (
              <div key={se.serviceId} className="bg-slate-50 p-4 border border-slate-200 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div>
                  <span className="text-xs font-bold text-indigo-700 block mb-0.5">Serviço:</span>
                  <span className="text-sm font-bold text-slate-800 truncate block">{se.name}</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Preço Total (R$)</label>
                  <input
                    type="number"
                    min="0"
                    value={se.price}
                    onChange={(e) => {
                      const updated = [...serviceEdits];
                      updated[index].price = parseFloat(e.target.value) || 0;
                      setServiceEdits(updated);
                    }}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nº Pacientes Ativos</label>
                  <input
                    type="number"
                    min="0"
                    value={se.activePatients}
                    onChange={(e) => {
                      const updated = [...serviceEdits];
                      updated[index].activePatients = parseInt(e.target.value) || 0;
                      setServiceEdits(updated);
                    }}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white font-bold"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-5 flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setActiveTab('compare')}
              className="py-2.5 px-4 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              id="btn_save_new_scenario"
              type="submit"
              className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
            >
              Salvar Cenário
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
