// Fase09Flow.tsx
// Orquestrador do fluxo do Eixo 09 — Metas & Simulação (Mesa de Controle Viva)

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';

import type { SimuladorState, Fase09Assumptions, FormaRecebimentoId, EscolhaCaminhoId, OfertaEcossistema } from './eixo09.types';
import { obterContextoFasesAnteriores, ContextoFasesAnteriores } from './lib/obterContextoFasesAnteriores';
import { carregarPremissasFase09, salvarPremissasFase09, ASSUMPTIONS_DEFAULT } from './lib/eixo09Service';

import Tela1NumeroMagico from './telas/Tela1NumeroMagico';
import Tela2FormaRecebimento from './telas/Tela2FormaRecebimento';
import Tela3EscolhaCaminho from './telas/Tela3EscolhaCaminho';
import SimuladorCardsFlow from './telas/SimuladorCardsFlow';

type FlowStepScreen = 'tela1' | 'tela2' | 'tela3' | 'simulador';

interface Fase09FlowProps {
  uid: string;
  clientRecord: any;
}

export default function Fase09Flow({ uid, clientRecord }: Fase09FlowProps) {
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<FlowStepScreen>('tela1');
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

        // Atualiza ecossistema inicial se nenhum serviço secundário existir
        const nonAcc = contexto.servicos.filter(
          (s) => !s.formatoComercial.includes('Programa de Acompanhamento')
        );
        let ofertas: OfertaEcossistema[] = [];
        if (nonAcc.length > 0) {
          ofertas = nonAcc.map((s) => ({
            servicoId: s.id,
            nomeExibicao: s.nomeComercial,
            precoUnitario: s.precoVenda,
            quantidadeEstimada: 0,
          }));
        } else {
          const fallbackPrice = Math.round((contexto.ticketMedioAtual || 400) * 0.25);
          ofertas = [
            {
              servicoId: 'exemplo_ecossistema_1',
              nomeExibicao: 'Consulta Avulsa / Guia de Apoio',
              precoUnitario: fallbackPrice,
              quantidadeEstimada: 0,
            },
          ];
        }

        setSimuladorState((prev) => ({
          ...prev,
          card4BOfertas: ofertas,
        }));
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uid, contexto]);

  const handleSalvarPremissas = useCallback(
    (novasPremissas: Fase09Assumptions) => {
      setPremissas(novasPremissas);
      salvarPremissasFase09(uid, novasPremissas);
    },
    [uid]
  );

  // Navegação
  function handleTela1Avancar(dados: {
    numeroMagico: number;
    tetoSemanaPerfeita: number;
    novasPremissas: Partial<Fase09Assumptions>;
  }) {
    const nextPremissas = { ...premissas, ...dados.novasPremissas };
    if (Object.keys(dados.novasPremissas).length > 0) {
      handleSalvarPremissas(nextPremissas);
    }

    setSimuladorState((prev) => ({
      ...prev,
      numeroMagico: dados.numeroMagico,
      tetoSemanaPerfeita: dados.tetoSemanaPerfeita,
      premissas: nextPremissas,
    }));
    setStep('tela2');
  }

  function handleTela2Avancar(dados: {
    formaRecebimento: FormaRecebimentoId;
    novasPremissas: Partial<Fase09Assumptions>;
  }) {
    const nextPremissas = { ...premissas, ...dados.novasPremissas };
    if (Object.keys(dados.novasPremissas).length > 0) {
      handleSalvarPremissas(nextPremissas);
    }

    setSimuladorState((prev) => ({
      ...prev,
      formaRecebimento: dados.formaRecebimento,
      premissas: nextPremissas,
    }));
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
    <div className="w-full py-6 px-4">
      {/* Botão Voltar */}
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

      {/* Render das Telas */}
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
  );
}
