import React, { useState, useEffect, useMemo } from 'react';
import { ClientBlocks } from '../types';
import { updateClientBlock } from '../lib/db';
import { DEMANDA_CLUSTERS, DemandaCluster } from '../lib/initialData';

interface RetratoFormProps {
  clientId: string;
  initialBlocks: ClientBlocks;
  onComplete: () => void;
}

interface PillarDef {
  id: string;
  category: 'R' | 'E';
  text: string;
}

interface DeliveryDef {
  id: string;
  label: string;
  dependsOn?: string;
}

const PILLAR_DEFS: PillarDef[] = [
  { id: 'R1', category: 'R', text: 'Emagrecimento acelerado e sustentável sem efeito sanfona' },
  { id: 'R2', category: 'R', text: 'Ganho de massa magra e hipertrofia muscular direcionada' },
  { id: 'R3', category: 'R', text: 'Reversão de exames alterados e controle de patologias/metabolismo' },
  { id: 'R4', category: 'R', text: 'Alta performance esportiva e rendimento físico de elite' },
  { id: 'E1', category: 'E', text: 'Acolhimento humanizado sem julgamentos e escuta empática' },
  { id: 'E2', category: 'E', text: 'Reeducação alimentar suave adaptada à rotina e preferências reais' },
  { id: 'E3', category: 'E', text: 'Autonomia alimentar e relação saudável, leve e livre com a comida' }
];

const DELIVERY_DEFS: DeliveryDef[] = [
  { id: 'kit', label: 'Kit de Boas-vindas' },
  { id: 'consultaInicial', label: 'Consulta Inicial' },
  { id: 'avaliacaoFisica', label: 'Avaliação Física' },
  { id: 'revisaoExames', label: 'Revisão de Exames', dependsOn: 'avaliacaoFisica' },
  { id: 'ajustePlano', label: 'Ajuste do Plano' },
  { id: 'materiaisApoio', label: 'Materiais de Apoio' },
  { id: 'consultaAcompanhamento', label: 'Consulta de Acompanhamento' },
  { id: 'relatorioEvolucao', label: 'Relatório de Evolução' },
  { id: 'checkin', label: 'Check-in Semanal/Quinzenal' },
  { id: 'contatoProativo', label: 'Contato Proativo' },
  { id: 'mudancaSuplementacao', label: 'Mudança de Suplementação' }
];

const EIXO_LABELS = [
  'Promessa & Método',
  'Captação',
  'Vendas',
  'Serviços',
  'Entrega & Rotina',
  'Agenda',
  'Equipe',
  'Financeiro',
  'Meta & Futuro'
];

const WEEK_DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const TURNOS = ['Manhã', 'Tarde', 'Noite'];

function formatBRL(cents: number): string {
  return ((cents || 0) / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export default function RetratoForm({ clientId, initialBlocks, onComplete }: RetratoFormProps) {
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [showNavOverlay, setShowNavOverlay] = useState<boolean>(false);

  // Core Form State
  const [answers, setAnswers] = useState<Record<string, any>>({
    taxaSucesso: 8,
    taxaConversao: 30,
    canais: ['Instagram', 'Indicação de Pacientes'],
    perChannel: {}
  });
  const [tagDraft, setTagDraft] = useState<string>('');
  const [pillars, setPillars] = useState<PillarDef[]>(PILLAR_DEFS);
  const [services, setServices] = useState<any[]>([
    { id: 1, name: 'Consulta Inicial', type: 'Consulta', price: 25000, activePatients: 8 },
    { id: 2, name: 'Pacote Trimestral', type: 'Pacote', price: 89000, activePatients: 22 }
  ]);
  const [deliveryAnswers, setDeliveryAnswers] = useState<Record<string, any>>({});
  const [schedule, setSchedule] = useState<Record<string, any>>({});
  const [commitments, setCommitments] = useState<any[]>([
    { id: 1, name: 'Pós-graduação', day: 'Qui', start: '19:00', end: '22:00' }
  ]);
  const [team, setTeam] = useState<any[]>([
    { id: 1, name: 'Camila Souza', role: 'Secretária', cost: 180000 }
  ]);

  // All 36 Step Definitions across 9 Eixos with logic conditions
  const ALL_STEPS = useMemo(() => [
    // EIXO 0: Promessa & Método
    { id: 'pillars', eixo: 0, type: 'rank', q: 'Dos 7 pilares abaixo, ordene colocando no topo o que é a prioridade central do seu atendimento.' },
    { id: 'fatorDecisivo', eixo: 0, type: 'choice', dynamic: true, condition: (a: any, p: PillarDef[]) => p[0]?.category !== p[1]?.category },
    { id: 'personalizacaoMetodo', eixo: 0, type: 'textarea', q: 'Além da consulta individual, seu acompanhamento inclui trabalho em grupo ou comunidades?' },
    { id: 'ferramentaPrincipal', eixo: 0, type: 'text', q: 'Qual é a ferramenta ou pilar técnico principal que você utiliza nas suas condutas?' },
    { id: 'queixaComum', eixo: 0, type: 'textarea', q: 'Qual é a maior reclamação ou dor recorrente que os pacientes relatam antes de te procurar?' },
    { id: 'passoAPasso', eixo: 0, type: 'textarea', q: 'Resuma em poucas palavras o passo a passo do seu método de acompanhamento.' },
    { id: 'taxaSucesso', eixo: 0, type: 'slider', q: 'De 0 a 10, qual a sua percepção da taxa de sucesso dos pacientes em atingir o objetivo principal?', min: 0, max: 10, suffix: ' / 10' },

    // EIXO 1: Captação
    { id: 'canais', eixo: 1, type: 'multi', q: 'Quais canais você utiliza ativamente para captar novos pacientes?', choices: ['Instagram', 'Google Ads / SEO', 'Indicação de Pacientes', 'Parcerias Médicas / Academias', 'Eventos / Palestras', 'Outros'] },
    { id: 'leadsConversao', eixo: 1, type: 'perChannel', q: 'Para cada canal, quantos leads chegam por mês e qual a taxa de conversão em consulta/plano?', condition: (a: any) => (a.canais || []).length > 0 },
    { id: 'diasMarketing', eixo: 1, type: 'slider', q: 'Quantos dias por semana você dedica tempo para marketing/redes sociais?', min: 0, max: 7, suffix: ' dias' },
    { id: 'horasConteudo', eixo: 1, type: 'text', q: 'Quantas horas por dia são gastas com criação de conteúdo?', placeholder: '0', inputType: 'number' },
    { id: 'usaApp', eixo: 1, type: 'choice', q: 'Você utiliza algum software de agendamento online automático?', choices: ['Sim', 'Não', 'Não sei'] },
    { id: 'appNome', eixo: 1, type: 'text', q: 'Qual o nome do software/aplicativo?', condition: (a: any) => a.usaApp === 'Sim' },

    // EIXO 2: Vendas
    { id: 'usaScript', eixo: 2, type: 'choice', q: 'Você segue um script/roteiro padronizado na hora de apresentar o preço e fechar?', choices: ['Sim', 'Não', 'Não sei'] },
    { id: 'canalFechamento', eixo: 2, type: 'choice', q: 'Onde a venda é finalizada na maioria das vezes?', choices: ['Mensagem (WhatsApp/DM)', 'Chamada de Vídeo / Reunião', 'Ambos'] },
    { id: 'usaCRM', eixo: 2, type: 'choice', q: 'Você utiliza algum CRM para organizar a esteira de vendas e contatos?', choices: ['Sim', 'Não', 'Não sei'] },
    { id: 'crmNome', eixo: 2, type: 'text', q: 'Qual o CRM utilizado?', condition: (a: any) => a.usaCRM === 'Sim' },
    { id: 'responsavelFechamento', eixo: 2, type: 'choice', q: 'Quem é a pessoa responsável por fazer a oferta e fechar as vendas?', choices: ['Eu mesma(o)', 'Outra pessoa da equipe'] },
    { id: 'closerNome', eixo: 2, type: 'text', q: 'Nome do responsável pelo fechamento?', condition: (a: any) => a.responsavelFechamento === 'Outra pessoa da equipe' },
    { id: 'fazFollowup', eixo: 2, type: 'choice', q: 'É feito acompanhamento ativo com contatos que pediram orçamento mas não fecharam?', choices: ['Sim', 'Não', 'Não sei'] },
    { id: 'followupDetalhes', eixo: 2, type: 'numberMulti', q: 'Como funciona esse follow-up?', labels: ['Dias até o 1º follow-up', 'Tentativas de contato'], condition: (a: any) => a.fazFollowup === 'Sim' },
    { id: 'tempoFechamento', eixo: 2, type: 'numberWithUnknown', q: 'Qual o tempo médio em dias entre o primeiro contato e o pagamento?' },
    { id: 'motivosPerda', eixo: 2, type: 'multi', q: 'Quais os motivos mais comuns para o cliente não fechar?', choices: ['Preço achado alto', 'Falta de horário na agenda', 'Formato (online/presencial)', 'Decisão adiada', 'Concorrência'] },

    // EIXO 3: Serviços
    { id: 'servicos', eixo: 3, type: 'repeater', q: 'Cadastre os serviços e planos que você oferece hoje.' },

    // EIXO 4: Entrega & Rotina
    { id: 'entregasClinicas', eixo: 4, type: 'deliveryTable', q: 'Para cada entrega clínica da sua rotina, ela está incluída? Se sim, quanto tempo consome?' },

    // EIXO 5: Agenda
    { id: 'scheduleGrid', eixo: 5, type: 'schedule', q: 'Quais dias da semana e turnos o seu consultório está aberto para atendimento?' },
    { id: 'compromissos', eixo: 5, type: 'repeaterCommit', q: 'Você possui compromissos fixos que travam sua agenda (aulas, pós-graduação, família)?' },

    // EIXO 6: Equipe
    { id: 'equipe', eixo: 6, type: 'repeaterTeam', q: 'Cadastre os membros da sua equipe de apoio e seus custos mensais.' },

    // EIXO 7: Financeiro
    { id: 'faturamentoHistorico', eixo: 7, type: 'currencyMulti', q: 'Qual foi seu faturamento nos últimos meses?', labels: ['M-2', 'M-1', 'M-0'] },
    { id: 'custosPorCategoria', eixo: 7, type: 'currencyMulti', q: 'Some seus custos fixos mensais por categoria.', labels: ['Espaço Físico', 'Pessoas & Equipe', 'Dia a Dia', 'Divulgação', 'Impostos / Docs', 'Reservas / Estudos'] },
    { id: 'temEmprestimo', eixo: 7, type: 'choice', q: 'Possui empréstimos ativos?', choices: ['Sim', 'Não', 'Não sei'] },
    { id: 'parcelaEmprestimo', eixo: 7, type: 'currency', q: 'Qual o valor da parcela mensal do empréstimo?', condition: (a: any) => a.temEmprestimo === 'Sim' },
    { id: 'temDivida', eixo: 7, type: 'choice', q: 'Possui dívidas acumuladas?', choices: ['Sim', 'Não', 'Não sei'] },
    { id: 'valorDivida', eixo: 7, type: 'currency', q: 'Qual o valor total da dívidas?', condition: (a: any) => a.temDivida === 'Sim' },

    // EIXO 8: Meta & Futuro
    { id: 'metasFaturamento', eixo: 8, type: 'currencyMulti', q: 'Quais são suas metas de faturamento para os próximos 90 dias?', labels: ['Meta 90 dias', 'M1', 'M2', 'M3'] },
    { id: 'metaPacientes', eixo: 8, type: 'text', q: 'Quantos pacientes ativos você deseja atender simultaneamente?', placeholder: '0', inputType: 'number' },
    { id: 'metaHoras', eixo: 8, type: 'text', q: 'Quantas horas livres por semana você quer ter garantidas na sua rotina?', placeholder: '0', inputType: 'number' }
  ], []);

  // Filter effective steps based on dynamic logic
  const effectiveSteps = useMemo(() => {
    return ALL_STEPS.filter((s) => !s.condition || s.condition(answers, pillars));
  }, [ALL_STEPS, answers, pillars]);

  const totalEffective = effectiveSteps.length;
  const isFinished = stepIdx >= totalEffective;
  const currentStep = !isFinished ? effectiveSteps[stepIdx] : null;

  // Auto-save progress
  useEffect(() => {
    if (clientId && answers) {
      updateClientBlock(clientId, 'b1', { answers, pillars, services, deliveryAnswers, schedule, commitments, team });
    }
  }, [answers, pillars, services, deliveryAnswers, schedule, commitments, team, clientId]);

  const movePillar = (id: string, dir: number) => {
    const arr = [...pillars];
    const idx = arr.findIndex((p) => p.id === id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= arr.length) return;
    [arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]];
    setPillars(arr);
  };

  const handleNext = () => {
    if (stepIdx < totalEffective - 1) {
      setStepIdx(stepIdx + 1);
      setTagDraft('');
    } else {
      setStepIdx(totalEffective);
      if (onComplete) onComplete();
    }
  };

  const handlePrev = () => {
    if (stepIdx > 0) {
      setStepIdx(stepIdx - 1);
      setTagDraft('');
    }
  };

  // Calculate Eixo Eyebrow & SubPosition
  const eixoIdx = currentStep?.eixo ?? 0;
  const stepsInThisEixo = effectiveSteps.filter((s) => s.eixo === eixoIdx);
  const posInEixo = currentStep ? stepsInThisEixo.indexOf(currentStep) + 1 : 1;

  // Dynamic question text evaluation (e.g. Fator Decisivo)
  let currentQuestionText = currentStep?.q || '';
  if (currentStep?.dynamic && currentStep.id === 'fatorDecisivo') {
    const catName = (c: string) => (c === 'R' ? 'Resultado' : 'Experiência');
    const top1 = pillars[0];
    const top2 = pillars[1];
    currentQuestionText = `Percebemos que seu 1º lugar é focado em ${catName(top1.category)} e o 2º em ${catName(
      top2.category
    )}. Na decisão final do cliente, qual desses dois fatores costuma pesar mais para fechar?`;
  }

  return (
    <div className="relative min-h-screen bg-[#05070a] overflow-hidden text-slate-200 flex flex-col font-sans">
      {/* Ambient Radial Background Glows */}
      <div className="absolute top-[-120px] left-[-80px] w-[520px] h-[520px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-160px] right-[-120px] w-[480px] h-[480px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col flex-1 max-w-[800px] w-full mx-auto px-6 py-7 sm:py-9 box-border">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-7 h-7 rounded-[7px] bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center font-extrabold text-xs text-white">
              A3
            </div>
            <div className="font-bold text-sm text-slate-50 tracking-tight whitespace-nowrap">
              Sistema A3
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-[10px] font-semibold tracking-widest uppercase text-indigo-300 bg-indigo-500/10 border border-indigo-500/25 px-3 py-1.5 rounded-full whitespace-nowrap">
              Fase 1 · O Retrato
            </div>
            <button
              type="button"
              onClick={() => setShowNavOverlay(true)}
              className="p-1.5 border border-white/10 hover:bg-white/5 rounded-lg text-slate-300 transition-all cursor-pointer font-bold text-sm"
              title="Menu de Pergunta"
            >
              ☰
            </button>
          </div>
        </div>

        {/* 9-Segment Progress Line Bar */}
        <div className="flex gap-1.5 mb-9">
          {EIXO_LABELS.map((label, eIdx) => {
            const stepsInE = effectiveSteps.filter((s) => s.eixo === eIdx);
            const totalInE = stepsInE.length || 1;
            let doneCount = 0;
            stepsInE.forEach((s) => {
              const gi = effectiveSteps.indexOf(s);
              if (gi < stepIdx) doneCount += 1;
              else if (gi === stepIdx) doneCount += 0.5;
            });
            const pct = Math.min(100, (doneCount / totalInE) * 100);

            return (
              <div key={label} className="flex-1 h-1 rounded-sm bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* COMPLETION SCREEN                                                         */}
        {/* ========================================================================= */}
        {isFinished ? (
          <div className="flex-1 flex flex-col items-start justify-center py-12">
            <div className="w-13 h-13 rounded-full bg-emerald-500/15 border border-emerald-400/35 text-emerald-400 font-extrabold text-2xl flex items-center justify-center mb-6">
              ✓
            </div>
            <h1 className="text-3xl font-extrabold text-slate-50 tracking-tight mb-3">
              Retrato concluído.
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed mb-8 max-w-md">
              Os 9 eixos foram respondidos. Seu consultor será notificado para revisar e agendar a Call 1 de alinhamento.
            </p>
            <button
              type="button"
              onClick={() => setStepIdx(0)}
              className="btn-ghost px-5 py-3 text-xs uppercase tracking-wider"
            >
              Revisar respostas
            </button>
          </div>
        ) : (
          /* ========================================================================= */
          /* INTERVIEW QUESTION VIEW                                                   */
          /* ========================================================================= */
          <div className="flex-1 flex flex-col justify-center">
            <div className="text-[11px] font-semibold tracking-widest uppercase text-slate-500 mb-1">
              EIXO 0{eixoIdx + 1} · {EIXO_LABELS[eixoIdx]?.toUpperCase()}
            </div>
            <div className="text-[11px] text-slate-600 mb-6">
              Pergunta {posInEixo} de {stepsInThisEixo.length}
            </div>

            <h1 className="text-[29px] leading-snug font-extrabold text-slate-50 tracking-tight mb-7 max-w-2xl">
              {currentQuestionText}
            </h1>

            {/* INPUT TYPE: RANK (PRIORIDADE DOS PILARES) */}
            {currentStep?.type === 'rank' && (
              <div className="flex flex-col gap-2.5 max-w-xl mb-8">
                {pillars.map((p, i) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3.5 bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-md"
                  >
                    <div className="w-6 h-6 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 text-xs font-semibold text-slate-200 leading-snug">
                      {p.text}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => movePillar(p.id, -1)}
                        disabled={i === 0}
                        className="w-7 h-7 rounded-lg border border-white/12 text-slate-400 text-xs hover:bg-white/10 disabled:opacity-30 cursor-pointer"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => movePillar(p.id, 1)}
                        disabled={i === pillars.length - 1}
                        className="w-7 h-7 rounded-lg border border-white/12 text-slate-400 text-xs hover:bg-white/10 disabled:opacity-30 cursor-pointer"
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* INPUT TYPE: TEXT */}
            {currentStep?.type === 'text' && (
              <div className="max-w-md mb-8">
                <input
                  type={currentStep.inputType || 'text'}
                  value={answers[currentStep.id] ?? ''}
                  onChange={(e) => setAnswers({ ...answers, [currentStep.id]: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleNext();
                  }}
                  placeholder={currentStep.placeholder || 'Sua resposta...'}
                  className="input-highlight py-2 text-xl"
                />
              </div>
            )}

            {/* INPUT TYPE: TEXTAREA */}
            {currentStep?.type === 'textarea' && (
              <div className="max-w-xl mb-8">
                <textarea
                  value={answers[currentStep.id] ?? ''}
                  onChange={(e) => setAnswers({ ...answers, [currentStep.id]: e.target.value })}
                  placeholder="Descreva detalhadamente..."
                  rows={3}
                  className="input-utility w-full p-4 text-sm leading-relaxed"
                />
              </div>
            )}

            {/* INPUT TYPE: CHOICE (SINGLE SELECTION) */}
            {currentStep?.type === 'choice' && (
              <div className="flex flex-wrap gap-2.5 mb-8 max-w-xl">
                {(currentStep.dynamic && currentStep.id === 'fatorDecisivo'
                  ? [pillars[0], pillars[1]].map((p) => ({ id: p.id, label: p.text }))
                  : (currentStep.choices || []).map((c: string) => ({ id: c, label: c }))
                ).map((item) => {
                  const isSelected = answers[currentStep.id] === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAnswers({ ...answers, [currentStep.id]: item.id })}
                      className={`pill-option ${isSelected ? 'pill-option-selected' : ''} px-4 py-3 text-xs`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* INPUT TYPE: MULTI (MULTIPLE SELECTION) */}
            {currentStep?.type === 'multi' && (
              <div className="flex flex-wrap gap-2.5 mb-8 max-w-xl">
                {(currentStep.choices || []).map((c: string) => {
                  const selectedArr: string[] = answers[currentStep.id] || [];
                  const isSelected = selectedArr.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        const next = isSelected ? selectedArr.filter((i) => i !== c) : [...selectedArr, c];
                        setAnswers({ ...answers, [currentStep.id]: next });
                      }}
                      className={`pill-option ${isSelected ? 'pill-option-selected' : ''} px-4 py-3 text-xs`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            )}

            {/* INPUT TYPE: SLIDER */}
            {currentStep?.type === 'slider' && (
              <div className="max-w-md mb-8 space-y-4">
                <div className="text-4xl font-extrabold text-emerald-400">
                  {(answers[currentStep.id] ?? currentStep.min) + (currentStep.suffix || '')}
                </div>
                <input
                  type="range"
                  min={currentStep.min}
                  max={currentStep.max}
                  step={1}
                  value={answers[currentStep.id] ?? currentStep.min}
                  onChange={(e) => setAnswers({ ...answers, [currentStep.id]: parseInt(e.target.value, 10) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            )}

            {/* INPUT TYPE: CURRENCY */}
            {currentStep?.type === 'currency' && (
              <div className="relative max-w-xs mb-8">
                <span className="absolute left-0 top-2 text-xl text-slate-500">R$</span>
                <input
                  type="text"
                  value={formatBRL(answers[currentStep.id] ?? 0)}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '');
                    setAnswers({ ...answers, [currentStep.id]: digits ? parseInt(digits, 10) : 0 });
                  }}
                  className="input-highlight py-2 pl-9 text-2xl"
                />
              </div>
            )}

            {/* INPUT TYPE: CURRENCY MULTI */}
            {currentStep?.type === 'currencyMulti' && (
              <div className="flex flex-wrap gap-5 mb-8 max-w-xl">
                {(currentStep.labels || []).map((label: string) => {
                  const vals = answers[currentStep.id] || {};
                  return (
                    <div key={label} className="space-y-1">
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        {label}
                      </div>
                      <div className="relative w-36">
                        <span className="absolute left-0 top-1 text-sm text-slate-500">R$</span>
                        <input
                          type="text"
                          value={formatBRL(vals[label] || 0)}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, '');
                            setAnswers({
                              ...answers,
                              [currentStep.id]: {
                                ...vals,
                                [label]: digits ? parseInt(digits, 10) : 0
                              }
                            });
                          }}
                          className="input-highlight py-1 pl-7 text-base"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* INPUT TYPE: REPEATER (SERVICES) */}
            {currentStep?.type === 'repeater' && (
              <div className="space-y-3 max-w-xl mb-8">
                {services.map((svc) => (
                  <div key={svc.id} className="card-glass p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={svc.name}
                        onChange={(e) =>
                          setServices(services.map((s) => (s.id === svc.id ? { ...s, name: e.target.value } : s)))
                        }
                        placeholder="Nome do Serviço"
                        className="bg-transparent text-slate-100 font-bold text-sm border-none p-0 focus:outline-none flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => setServices(services.filter((s) => s.id !== svc.id))}
                        className="text-xs text-slate-500 hover:text-rose-400 cursor-pointer"
                      >
                        Remover
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <select
                        value={svc.type}
                        onChange={(e) =>
                          setServices(services.map((s) => (s.id === svc.id ? { ...s, type: e.target.value } : s)))
                        }
                        className="input-utility p-2 text-xs bg-[#12141a]"
                      >
                        <option value="Consulta">Consulta</option>
                        <option value="Pacote">Pacote</option>
                        <option value="Plano">Plano</option>
                      </select>
                      <input
                        type="text"
                        value={formatBRL(svc.price)}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '');
                          setServices(
                            services.map((s) =>
                              s.id === svc.id ? { ...s, price: digits ? parseInt(digits, 10) : 0 } : s
                            )
                          );
                        }}
                        className="input-utility p-2 text-xs"
                      />
                      <input
                        type="number"
                        value={svc.activePatients || ''}
                        onChange={(e) =>
                          setServices(
                            services.map((s) => (s.id === svc.id ? { ...s, activePatients: Number(e.target.value) } : s))
                          )
                        }
                        placeholder="Pacientes ativos"
                        className="input-utility p-2 text-xs"
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setServices([
                      ...services,
                      { id: Date.now(), name: 'Novo Serviço', type: 'Consulta', price: 0, activePatients: 0 }
                    ])
                  }
                  className="btn-ghost w-full py-3 text-xs font-bold"
                >
                  + Adicionar serviço
                </button>
              </div>
            )}

            {/* NAVIGATION CONTROLS */}
            <div className="flex items-center justify-between pt-6 border-t border-white/10 mt-8">
              <button
                type="button"
                onClick={handlePrev}
                disabled={stepIdx === 0}
                className={`btn-ghost px-5 py-2.5 text-xs uppercase tracking-wider ${
                  stepIdx === 0 ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              >
                ← Voltar
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="btn-primary px-6 py-2.5 text-xs uppercase tracking-wider"
              >
                {stepIdx === totalEffective - 1 ? 'Concluir Retrato ✓' : 'Continuar ↵'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* OVERLAY MODAL MENU (☰)                                                    */}
      {/* ========================================================================= */}
      {showNavOverlay && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-white/10 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-white">Mapa de Perguntas do Retrato</h3>
                <p className="text-xs text-slate-400">Clique em qualquer pergunta para pular diretamente.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowNavOverlay(false)}
                className="text-slate-400 hover:text-white font-bold text-lg p-1 cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {EIXO_LABELS.map((eLabel, eIdx) => {
                const stepsInE = effectiveSteps.filter((s) => s.eixo === eIdx);
                return (
                  <div key={eLabel} className="space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 border-b border-white/10 pb-1 flex justify-between">
                      <span>EIXO 0{eIdx + 1} · {eLabel}</span>
                      <span className="font-mono text-slate-500">{stepsInE.length} perguntas</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {stepsInE.map((st) => {
                        const gi = effectiveSteps.indexOf(st);
                        const isCurrent = gi === stepIdx;
                        const isAnswered = gi < stepIdx;
                        return (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => {
                              setStepIdx(gi);
                              setShowNavOverlay(false);
                            }}
                            className={`text-left p-2.5 rounded-lg border text-xs flex items-center justify-between transition-all ${
                              isCurrent
                                ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold'
                                : isAnswered
                                ? 'bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/5'
                                : 'bg-transparent border-white/5 text-slate-400 hover:bg-white/5'
                            }`}
                          >
                            <span className="truncate pr-2">{st.q || st.id}</span>
                            {isAnswered && <span className="text-emerald-400 font-bold flex-shrink-0">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
