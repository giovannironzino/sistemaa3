import React, { useState, useEffect } from 'react';
import { ClientBlocks } from '../types';
import { saveConsultantComments } from '../lib/db';
import { BLOCK1_OPTIONS, FIXED_COST_ITEMS, ROUTINE_ITEMS } from '../lib/initialData';
import { Copy, Check, FileText, ArrowLeft, MessageSquare } from 'lucide-react';

interface AvaliacaoConsultorProps {
  clientId: string;
  clientName: string;
  clientEmail: string;
  blocks: ClientBlocks;
  initialComments: Record<string, string>;
  onBack: () => void;
}

export default function AvaliacaoConsultor({
  clientId,
  clientName,
  clientEmail,
  blocks,
  initialComments,
  onBack
}: AvaliacaoConsultorProps) {
  const [comments, setComments] = useState<Record<string, string>>(initialComments || {});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [globalCopied, setGlobalCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setComments(initialComments || {});
  }, [initialComments]);

  const handleCommentChange = (key: string, value: string) => {
    setComments((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveComments = async () => {
    setIsSaving(true);
    try {
      await saveConsultantComments(clientId, comments);
      alert('Comentários salvos com sucesso!');
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar comentários.');
    } finally {
      setIsSaving(false);
    }
  };

  const blockNames = [
    '1. Promessa & Método',
    '2. Captação',
    '3. Vendas',
    '4. Serviços',
    '5. Entrega & Rotina',
    '6. Agenda',
    '7. Equipe',
    '8. Financeiro',
    '9. Meta'
  ];

  // Logic to calculate how many "Não sei" are in each block
  const countNaoSeiPerBlock = (blockIdx: number): number => {
    let count = 0;
    if (blockIdx === 0) { // Block 1
      if (blocks.b1.decidingFactor === 'Não sei') count++;
      if (blocks.b1.energyFocus === 'Não sei') count++;
      if (blocks.b1.primaryTool === 'Não sei') count++;
      if (blocks.b1.commonComplaint === 'Não sei') count++;
      if (blocks.b1.stepByStep === 'Não sei') count++;
    } else if (blockIdx === 1) { // Block 2
      if (blocks.b2.usesSchedulingApp === 'Não sei') count++;
    } else if (blockIdx === 2) { // Block 3
      if (blocks.b3.followsScript === 'Não sei') count++;
      if (blocks.b3.usesCRM === 'Não sei') count++;
      if (blocks.b3.doesFollowUp === 'Não sei') count++;
      if (blocks.b3.averageClosingTimeNotKnown) count++;
      if (blocks.b3.lostReasons?.includes('Não sei')) count++;
    } else if (blockIdx === 4) { // Block 5
      Object.keys(blocks.b5 || {}).forEach((key) => {
        const item = (blocks.b5 as any)[key];
        if (item && item.included === 'Não sei') count++;
        if (item && item.supportPrepTimeNotKnown) count++;
      });
    } else if (blockIdx === 7) { // Block 8
      if (blocks.b8.fixedCosts) {
        Object.values(blocks.b8.fixedCosts).forEach((v: any) => {
          if (v.status === 'Não sei' || v.type === 'Não sei') count++;
        });
      }
      if (blocks.b8.loanStatus === 'Não sei') count++;
      if (blocks.b8.debtStatus === 'Não sei') count++;
    }
    return count;
  };

  // Render question-answer pair list
  const getBlockQuestionsList = (blockIdx: number) => {
    const questions: { id: string; label: string; value: string }[] = [];

    if (blockIdx === 0) { // B1
      const rankedOptions = (blocks.b1.ranking || []).map((id, index) => {
        const opt = BLOCK1_OPTIONS.find(o => o.id === id);
        return `${index + 1}º: ${opt ? opt.text : id}`;
      }).join('; ');
      questions.push({ id: 'b1_1.1', label: '1.1 Ranking Promessa/Posicionamento', value: rankedOptions });
      questions.push({ id: 'b1_1.2', label: '1.2 Descrição complementar de trabalho', value: blocks.b1.customWork || 'Nenhuma' });
      questions.push({ id: 'b1_1.2b', label: '1.2b Fator Decisivo Condicional', value: blocks.b1.decidingFactor || 'Nenhum' });
      questions.push({ id: 'b1_1.3', label: '1.3 Onde gasta mais energia na consulta', value: blocks.b1.energyFocus || 'Não selecionado' });
      questions.push({ id: 'b1_1.4', label: '1.4 Ferramenta de diferenciação que mais usa', value: blocks.b1.primaryTool || 'Não selecionado' });
      questions.push({ id: 'b1_1.5', label: '1.5 Reclamação mais comum de profissionais anteriores', value: blocks.b1.commonComplaint || 'Não selecionado' });
      questions.push({ id: 'b1_1.6', label: '1.6 Passo a passo para chegar na meta', value: blocks.b1.stepByStep || 'Não selecionado' });
      questions.push({ id: 'b1_1.7', label: '1.7 Taxa de sucesso (de cada 10 pacientes)', value: `${blocks.b1.successRate || 0} / 10` });
    } else if (blockIdx === 1) { // B2
      questions.push({ id: 'b2_2.1', label: '2.1 Canais de atração ativos', value: (blocks.b2.channels || []).join(', ') || 'Nenhum' });
      (blocks.b2.channels || []).forEach((ch) => {
        questions.push({ id: `b2_2.2_${ch}`, label: `2.2 Atração [${ch}] (últimos 3 meses)`, value: `${blocks.b2.channelInquiries?.[ch] || 0} pessoas` });
        questions.push({ id: `b2_2.3_${ch}`, label: `2.3 Fechamentos [${ch}] (últimos 3 meses)`, value: `${blocks.b2.channelConversions?.[ch] || 0} fechados` });
      });
      questions.push({ id: 'b2_2.4', label: '2.4 Quantidade de ações de marketing por semana', value: `${blocks.b2.marketingFrequency || 0} vezes` });
      questions.push({ id: 'b2_2.5', label: '2.5 Duração das ações de marketing', value: `${blocks.b2.marketingDuration || 0} minutos` });
      questions.push({ id: 'b2_2.6', label: '2.6 Uso de ferramentas de agendamento', value: blocks.b2.usesSchedulingApp || 'Não sei' });
      questions.push({ id: 'b2_2.7', label: '2.7 Nome do aplicativo de agendamento', value: blocks.b2.schedulingAppName || 'Nenhum' });
    } else if (blockIdx === 2) { // B3
      questions.push({ id: 'b3_3.1', label: '3.1 Segue roteiro estruturado nas conversas', value: blocks.b3.followsScript || 'Não sei' });
      questions.push({ id: 'b3_3.2', label: '3.2 Canal preferencial de vendas', value: blocks.b3.closingChannel === 'mensagem' ? 'Mensagem escrita' : blocks.b3.closingChannel === 'chamada' ? 'Ligação (Voz/Vídeo)' : 'Ambos' });
      questions.push({ id: 'b3_3.3', label: '3.3 Usa sistema / CRM para organizar vendas', value: blocks.b3.usesCRM || 'Não sei' });
      questions.push({ id: 'b3_3.4', label: '3.4 Nome do sistema de CRM', value: blocks.b3.crmName || 'Nenhum' });
      questions.push({ id: 'b3_3.5', label: '3.5 Quem atende e fecha com interessados', value: blocks.b3.closer || 'Não definido' });
      questions.push({ id: 'b3_3.6', label: '3.6 Nome do vendedor na equipe', value: blocks.b3.closerName || 'Nenhum' });
      questions.push({ id: 'b3_3.7', label: '3.7 Faz follow-up pós contato', value: blocks.b3.doesFollowUp || 'Não sei' });
      questions.push({ id: 'b3_3.8', label: '3.8 Dias até tentar novo contato', value: `${blocks.b3.followUpDays || 0} dias` });
      questions.push({ id: 'b3_3.9', label: '3.9 Tentativas de contato antes de desistir', value: `${blocks.b3.followUpAttempts || 0} tentativas` });
      questions.push({ id: 'b3_3.10', label: '3.10 Tempo médio até fechar (dias)', value: blocks.b3.averageClosingTimeNotKnown ? 'Não sei' : `${blocks.b3.averageClosingTime || 0} dias` });
      questions.push({ id: 'b3_3.11', label: '3.11 Motivos mais comuns de perda', value: (blocks.b3.lostReasons || []).join(', ') || 'Nenhum' });
    } else if (blockIdx === 3) { // B4
      const services = blocks.b4.services || [];
      services.forEach((s, idx) => {
        questions.push({ id: `b4_s_${s.id}_name`, label: `Serviço ${idx + 1} - Nome`, value: s.name });
        questions.push({ id: `b4_s_${s.id}_type`, label: `Serviço ${idx + 1} - Formato/Tipo`, value: `${s.type} (${s.format})` });
        questions.push({ id: `b4_s_${s.id}_price`, label: `Serviço ${idx + 1} - Preço`, value: `R$ ${s.price || 0}` });
        questions.push({ id: `b4_s_${s.id}_delivery`, label: `Serviço ${idx + 1} - Envio de Plano`, value: s.deliveryTime === 'Depende' ? `Depende (NA consulta: ${s.deliveryDuringRatio || 0}/5)` : s.deliveryTime });
        questions.push({ id: `b4_s_${s.id}_actives`, label: `Serviço ${idx + 1} - Pacientes Ativos`, value: `${s.activePatients || 0} pacientes` });
      });
    } else if (blockIdx === 4) { // B5
      ROUTINE_ITEMS.forEach((rit) => {
        const item = (blocks.b5 as any)[rit.id] || {};
        questions.push({
          id: `b5_${rit.id}`,
          label: `Rotina - ${rit.label}`,
          value: item.included === 'Sim' ? `Sim (Resp: ${item.responsible}, Tempo: ${item.duration}min, Freq/Quant: ${item.times || item.frequencyValue || item.supportCount || ''})` : item.included || 'Não sei'
        });
      });
      questions.push({ id: 'b5_process_alta', label: 'Processo estruturado de Alta', value: blocks.b5.terminationProcess || 'Não' });
    } else if (blockIdx === 5) { // B6
      questions.push({ id: 'b6_days', label: 'Dias de clínica aberta', value: (blocks.b6.daysOpen || []).join(', ') || 'Nenhum' });
      questions.push({ id: 'b6_commitments', label: 'Possui compromissos fixos', value: blocks.b6.hasRecurringCommitments || 'Não' });
    } else if (blockIdx === 6) { // B7
      const members = blocks.b7.members || [];
      members.forEach((m, idx) => {
        questions.push({ id: `b7_member_${m.id}`, label: `Equipe - Integrante ${idx + 1}`, value: `${m.name} (${m.role}) - R$ ${m.cost}/mês` });
      });
    } else if (blockIdx === 7) { // B8
      questions.push({ id: 'b8_fat_m2', label: 'Faturamento 2 meses atrás', value: `R$ ${blocks.b8.faturamentoM2 || 0}` });
      questions.push({ id: 'b8_fat_m1', label: 'Faturamento mês passado', value: `R$ ${blocks.b8.faturamentoM1 || 0}` });
      questions.push({ id: 'b8_fat_actual', label: 'Faturamento mês atual', value: `R$ ${blocks.b8.faturamentoAtual || 0}` });
      Object.keys(blocks.b8.fixedCosts || {}).forEach((key) => {
        const cost = blocks.b8.fixedCosts?.[key];
        if (cost && cost.status === 'Sim') {
          questions.push({ id: `b8_cost_${key}`, label: `Custo Fixo - ${key}`, value: `Sim (R$ ${cost.value})` });
        }
      });
    } else if (blockIdx === 8) { // B9
      questions.push({ id: 'b9_meta_fat', label: 'Meta Faturamento 90 dias', value: `R$ ${blocks.b9.faturamento90 || 0}` });
      questions.push({ id: 'b9_m1', label: 'Meta Mês 1', value: `R$ ${blocks.b9.faturamentoM1 || 0}` });
      questions.push({ id: 'b9_m2', label: 'Meta Mês 2', value: `R$ ${blocks.b9.faturamentoM2 || 0}` });
      questions.push({ id: 'b9_m3', label: 'Meta Mês 3', value: `R$ ${blocks.b9.faturamentoM3 || 0}` });
    }

    return questions;
  };

  const copyIndividualItem = (qId: string, label: string, val: string) => {
    const text = `ETAPA: ${blockNames[activeTab]}\nPERGUNTA: ${label}\nRESPOSTA DO PACIENTE: ${val}\nCOMENTÁRIO DO CONSULTOR: ${comments[qId] || 'Sem comentário'}`;
    navigator.clipboard.writeText(text);
    setCopiedId(qId);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const copyEverythingInMarkdown = () => {
    let md = `# Diagnóstico e Retrato Estratégico do Cliente: ${clientName} (${clientEmail})\n\n`;

    for (let i = 0; i < 9; i++) {
      md += `## ${blockNames[i]}\n`;
      const naoseiCount = countNaoSeiPerBlock(i);
      if (naoseiCount > 0) {
        md += `*Alerta: O cliente marcou "Não sei" em ${naoseiCount} respostas deste bloco.*\n\n`;
      }
      const questions = getBlockQuestionsList(i);
      questions.forEach((q) => {
        md += `### ${q.label}\n`;
        md += `**Resposta:** ${q.value}\n`;
        md += `**Comentário do Consultor:** ${comments[q.id] || '_Nenhum comentário adicionado_'}\n\n`;
      });
      md += `--- \n\n`;
    }

    navigator.clipboard.writeText(md);
    setGlobalCopied(true);
    setTimeout(() => setGlobalCopied(false), 2000);
  };

  const activeQuestions = getBlockQuestionsList(activeTab);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-sans" id="avaliacao_consultor_root">
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
              Avaliação do Retrato do Cliente
            </h1>
            <p className="text-sm text-slate-500">
              Analisando: <span className="font-semibold text-slate-800">{clientName}</span> ({clientEmail})
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            id="btn_copy_all_markdown"
            type="button"
            onClick={copyEverythingInMarkdown}
            className="py-2.5 px-4 bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-slate-800 shadow-sm cursor-pointer"
          >
            {globalCopied ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                <span>Copiar Tudo em Markdown</span>
              </>
            )}
          </button>

          <button
            id="btn_save_evaluation_comments"
            type="button"
            onClick={handleSaveComments}
            disabled={isSaving}
            className="py-2.5 px-4 bg-indigo-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-indigo-700 disabled:opacity-50 shadow-sm cursor-pointer"
          >
            <MessageSquare className="h-4 w-4" />
            <span>{isSaving ? 'Salvando...' : 'Salvar Comentários'}</span>
          </button>
        </div>
      </div>

      {/* Grid containing tabs and main review box */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left tabs of blocks */}
        <div className="space-y-1.5 lg:col-span-1">
          {blockNames.map((name, idx) => {
            const naoseiCount = countNaoSeiPerBlock(idx);
            return (
              <button
                key={name}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={`w-full text-left p-3.5 border rounded-xl flex justify-between items-center transition-all ${
                  activeTab === idx
                    ? 'border-indigo-600 bg-indigo-50/20 text-indigo-900 font-bold'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs truncate">{name}</span>
                {naoseiCount > 0 && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded-full font-bold">
                    {naoseiCount} ?
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right side question list with comments */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                {blockNames[activeTab]}
              </span>
              {countNaoSeiPerBlock(activeTab) > 0 && (
                <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2 py-1 rounded-lg font-semibold">
                  Atenção: {countNaoSeiPerBlock(activeTab)} respostas "Não sei" identificadas neste bloco.
                </span>
              )}
            </div>

            <div className="space-y-4">
              {activeQuestions.map((q) => (
                <div key={q.id} className="p-4 border border-slate-200 rounded-xl space-y-3 hover:border-slate-300 transition-colors bg-slate-50/20">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <span className="text-xs font-bold text-slate-800 block mb-1">
                        {q.label}
                      </span>
                      <p className="text-sm font-semibold text-slate-950 bg-slate-100/50 p-2.5 rounded-lg border border-slate-200">
                        {q.value}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyIndividualItem(q.id, q.label, q.value)}
                      className="p-2 border border-slate-200 hover:border-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg text-slate-400 transition-all"
                      title="Copiar Item"
                    >
                      {copiedId === q.id ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Comment input box */}
                  <div className="border-t border-dashed border-slate-200 pt-2.5">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Comentário do Consultor para este item:
                    </label>
                    <textarea
                      value={comments[q.id] || ''}
                      onChange={(e) => handleCommentChange(q.id, e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none min-h-[60px]"
                      placeholder="Adicione observações para discutir na Call..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
