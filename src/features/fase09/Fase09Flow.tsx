// Fase09Flow.tsx
// Orquestrador do fluxo do Eixo 09 — Metas & Simulação (Mesa de Controle Viva & Modo Consultor Tela Única)

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Sparkles, LayoutGrid, Compass } from 'lucide-react';

import type { SimuladorState, Fase09Assumptions, FormaRecebimentoId, EscolhaCaminhoId, OfertaEcossistema } from './eixo09.types';
import { obterContextoFasesAnteriores, ContextoFasesAnteriores } from './lib/obterContextoFasesAnteriores';
import { carregarPremissasFase09, salvarPremissasFase09, ASSUMPTIONS_DEFAULT } from './lib/eixo09Service';

import Tela1NumeroMagico from './telas/Tela1NumeroMagico';
import Tela2FormaRecebimento from './telas/Tela2FormaRecebimento';
import Tela3EscolhaCaminho from './telas/Tela3EscolhaCaminho';
import SimuladorCardsFlow from './telas/SimuladorCardsFlow';
import FormularioMestreConsultor from './telas/FormularioMestreConsultor';

type FlowStepScreen = 'tela1' | 'tela2' | 'tela3' | 'simulador';
type ModoExibicao = 'mestre_consultor' | 'guiado';

interface Fase09FlowProps {
  uid: string;
  clientRecord: any;
}

export default function Fase09Flow({ uid, clientRecord }: Fase09FlowProps) {
  const [loading, setLoading] = useState(true);
  const [modoExibicao, setModoExibicao] = useState<ModoExibicao>('mestre_consultor'); // PADRÃO TELA ÚNICA
  const [step, setStep] = useState<FlowStepScreen>('simulador');
  const [contexto, setContexto] = useState<ContextoFasesAnteriores>(() =>
    obterContextoFasesAnteriores(clientRecord)
  );

  const [premissas, setPremissas] = useState<Fase09Assumptions>(ASSUMPTIONS_DEFAULT);

  // Estado local do simulador
  const [simuladorState, setSimuladorState] = useState<SimuladorState>(() => ({
    numeroMagico: contexto.limitePreAprovado ?? 10000,
    limitePreAprovado: contexto.limitePreAprovado,
    tetoSemanaPerfeita: contexto.tetoSemanaPerfeitaPadrao,
    formaRecebimento: 'antecipado',
    escolhaCaminho: null,

    card1Ativo: true,
    novosPacientesQuantidade: 5,
    novosPacientesPreset: 'foco_carro_chefe',
    novosPacientesDistribuicao: [],

    card1BAtivo: false,
    indicacaoQuantidade: 0,

    card2Ativo: false,
    reajusteValorReais: 50,
    taxaSaidaEsperadaPercentual: 0,

    card3Ativo: false,
    planoOrigemServicoId: null,
    planoDestinoServicoId: null,
    quantidadeMigrar: 0,

    card4ALinha1Ativa: false,
    card4ALinha1TaxaAceitacaoPercentual: 0,
    card4ALinha2Ativa: false,
    card4ALinha2PacientesDeAltaQuantidade: 0,
    card4ALinha2TaxaAceitacaoPercentual: 0,

    card4BAtivo: false,
    card4BOfertas: contexto.servicos
      .filter((s) => !s.formatoComercial.includes('Programa de Acompanhamento'))
      .map((s) => ({
        servicoId: s.id,
        nomeExibicao: s.nomeComercial,
        precoUnitario: s.precoVenda,
        quantidadeEstimada: 0,
      })),

    card5ApoioOperacionalAtivo: false,
    card5ApoioComercialAtivo: false,
    card5ApoioGestaoAtivo: false,
    card5MelhoraConversaoPercentual: 10,
    card5CustoOperacionalReais: 1800,
    card5CustoComercialReais: 2000,
    card5CustoGestaoReais: 1500,
    card5HorasAbsorvidasOperacional: 30,
    card5HorasAbsorvidasGestaoPropria: 20,
    card5HorasGestaoDaEquipe: 5,

    card6Ativo: false,
    quantidadeResgatar: 0,
    taxaSucessoPercentual: 0,

    premissas: ASSUMPTIONS_DEFAULT,
  }));

  // Carrega premissas salvas do cliente
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const savedPremissas = await carregarPremissasFase09(uid);
      if (!cancelled) {
        setPremissas(savedPremissas);
        setSimuladorState((prev) => ({
          ...prev,
          premissas: savedPremissas,
        }));
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [uid]);

  const handleSalvarPremissas = useCallback(
    (novasPremissas: Fase09Assumptions) => {
      setPremissas(novasPremissas);
      salvarPremissasFase09(uid, novasPremissas);
    },
    [uid]
  );

  function handleTela1Avancar(dados: { numeroMagico: number; tetoSemanaPerfeita: number; novasPremissas: Partial<Fase09Assumptions> }) {
    setSimuladorState((prev) => ({
      ...prev,
      numeroMagico: dados.numeroMagico,
      tetoSemanaPerfeita: dados.tetoSemanaPerfeita,
    }));
    if (dados.novasPremissas) {
      handleSalvarPremissas({ ...premissas, ...dados.novasPremissas });
    }
    setStep('tela2');
  }

  function handleTela2Avancar(dados: { formaRecebimento: FormaRecebimentoId; novasPremissas: Partial<Fase09Assumptions> }) {
    setSimuladorState((prev) => ({
      ...prev,
      formaRecebimento: dados.formaRecebimento,
    }));
    if (dados.novasPremissas) {
      handleSalvarPremissas({ ...premissas, ...dados.novasPremissas });
    }
    setStep('tela3');
  }

  function handleTela3Avancar(escolha: EscolhaCaminhoId) {
    setSimuladorState((prev) => ({
      ...prev,
      escolhaCaminho: escolha,
    }));
    setStep('simulador');
  }

  function handleVoltar() {
    if (step === 'tela2') setStep('tela1');
    else if (step === 'tela3') setStep('tela2');
    else if (step === 'simulador') setStep('tela3');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
        Carregando simulador do Eixo 09...
      </div>
    );
  }

  return (
    <div className="w-full py-4 px-4 space-y-6">
      {/* Seletor de Modo de Exibição (Modo Consultor Tela Única vs Modo Guiado) */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2 text-xs">
        <span className="text-slate-400 font-medium flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          Modo de Visualização do Simulador Eixo 09:
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setModoExibicao('mestre_consultor')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              modoExibicao === 'mestre_consultor'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            ⚡ Modo Consultor (Tela Única)
          </button>

          <button
            type="button"
            onClick={() => setModoExibicao('guiado')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              modoExibicao === 'guiado'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            🧙‍♂️ Modo Guiado (Passo a Passo)
          </button>
        </div>
      </div>

      {/* RENDER DO MODO CONSULTOR TELA ÚNICA */}
      {modoExibicao === 'mestre_consultor' ? (
        <FormularioMestreConsultor
          uid={uid}
          contexto={contexto}
          initialState={simuladorState}
        />
      ) : (
        /* RENDER DO MODO GUIADO PASSO A PASSO */
        <div className="w-full">
          {step !== 'tela1' && (
            <div className="w-full max-w-2xl mx-auto mb-4">
              <button
                type="button"
                id="btn_eixo09_voltar"
                onClick={handleVoltar}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Voltar
              </button>
            </div>
          )}

          {step === 'tela1' && (
            <Tela1NumeroMagico
              contexto={contexto}
              premissas={premissas}
              initialNumeroMagico={simuladorState.numeroMagico}
              initialTetoSemana={simuladorState.tetoSemanaPerfeita}
              onAvancar={handleTela1Avancar}
            />
          )}

          {step === 'tela2' && (
            <Tela2FormaRecebimento
              premissas={premissas}
              initialFormaRecebimento={simuladorState.formaRecebimento}
              onAvancar={handleTela2Avancar}
            />
          )}

          {step === 'tela3' && (
            <Tela3EscolhaCaminho
              baseAtivosAtual={contexto.baseAtivosAtual}
              initialEscolhaCaminho={simuladorState.escolhaCaminho}
              onAvancar={handleTela3Avancar}
            />
          )}

          {step === 'simulador' && (
            <SimuladorCardsFlow
              uid={uid}
              contexto={contexto}
              initialState={simuladorState}
              onSalvarPremissas={handleSalvarPremissas}
            />
          )}
        </div>
      )}
    </div>
  );
}
