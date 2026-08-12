// CestaDeDadosDrawer.tsx
// Componente de atalho opcional da Cesta de Dados A3 com os 4 Colhedores Específicos.
// Permite subir planilhas do WebDiet, prints de WhatsApp/Instagram, tabelas de preço ou extratos.

import React, { useState } from 'react';
import { Sparkles, Upload, FileText, Image, Check, X, ArrowRight, Loader2 } from 'lucide-react';
import { processarCestaDeDados, ResultadoProcessamentoCesta, ItemCestaExtraido } from '../lib/geminiImportService';
import { processarRelatorioLocal } from '../lib/webdietWeltsParser';

interface CestaDeDadosDrawerProps {
  onProcessado: (resultado: ResultadoProcessamentoCesta) => void;
  onFechar: () => void;
}

export default function CestaDeDadosDrawer({ onProcessado, onFechar }: CestaDeDadosDrawerProps) {
  const [arquivos, setArquivos] = useState<Array<{ id: string; nome: string; tipo: string; base64: string; texto?: string; colhedorId: string }>>([]);
  const [processando, setProcessando] = useState(false);

  const caixinhas = [
    {
      id: 'caixa_1a_webdiet',
      colhedorId: 'colhedor01_prontuario',
      titulo: '📦 Caixa 1A — Relatório de Pacientes Ativos (WebDiet / Welts / Dietbox)',
      descricao: 'Planilha (.csv/.xlsx) ou texto exportado com nomes, telefones e planos ativos.',
      aceita: '.csv,.xlsx,.txt,.tsv,image/*',
    },
    {
      id: 'caixa_1b_atendimentos',
      colhedorId: 'colhedor01_prontuario',
      titulo: '📦 Caixa 1B — Histórico de Atendimentos dos 90 Dias (M-2, M-1, M0)',
      descricao: 'Lista de pacientes atendidos especificamente nos últimos 3 meses.',
      aceita: '.csv,.xlsx,.pdf,image/*',
    },
    {
      id: 'caixa_2a_whatsapp',
      colhedorId: 'colhedor02_captacao',
      titulo: '📦 Caixa 2A — Prints de Conversas do WhatsApp (Novos Interessados)',
      descricao: 'Prints de tela de conversas com pessoas perguntando sobre consultas e preços.',
      aceita: 'image/*,.txt',
    },
    {
      id: 'caixa_2b_direct',
      colhedorId: 'colhedor02_captacao',
      titulo: '📦 Caixa 2B — Prints do Direct do Instagram',
      descricao: 'Prints de mensagens recebidas na caixa de entrada do Direct.',
      aceita: 'image/*',
    },
    {
      id: 'caixa_2c_indicacoes',
      colhedorId: 'colhedor02_captacao',
      titulo: '📦 Caixa 2C — Parcerias & Indicações Médicas',
      descricao: 'Foto ou anotação da lista de pacientes indicados por médicos ou parceiros.',
      aceita: 'image/*,.pdf,.txt',
    },
    {
      id: 'caixa_3a_precos',
      colhedorId: 'colhedor03_servicos',
      titulo: '📦 Caixa 3A — Tabela de Preços & Cardápio de Serviços',
      descricao: 'Foto do cardápio de serviços, tabela de valores ou print do site.',
      aceita: 'image/*,.pdf',
    },
    {
      id: 'caixa_3b_contrato',
      colhedorId: 'colhedor03_servicos',
      titulo: '📦 Caixa 3B — Proposta / Contrato de Acompanhamento',
      descricao: 'PDF ou print do modelo de contrato ou proposta comercial.',
      aceita: 'image/*,.pdf',
    },
    {
      id: 'caixa_4a_extrato',
      colhedorId: 'colhedor04_financeiro',
      titulo: '📦 Caixa 4A — Extrato Bancário / Entradas no Caixa',
      descricao: 'Print ou PDF do extrato bancário PJ/PF dos últimos 3 meses.',
      aceita: 'image/*,.csv,.pdf',
    },
    {
      id: 'caixa_4b_custos',
      colhedorId: 'colhedor04_financeiro',
      titulo: '📦 Caixa 4B — Comprovantes de Custos Fixos & Sublocação',
      descricao: 'Comprovantes de aluguel, condomínio, software WebDiet/Welts ou CRN.',
      aceita: 'image/*,.pdf,.csv',
    },
  ];

  function handleFileChange(colhedorId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      const isText = file.name.endsWith('.csv') || file.name.endsWith('.tsv') || file.name.endsWith('.txt');

      if (isText) {
        const textReader = new FileReader();
        textReader.onload = (tEvt) => {
          const texto = tEvt.target?.result as string;
          setArquivos((prev) => [
            ...prev,
            {
              id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
              nome: file.name,
              tipo: file.type || 'text/plain',
              base64: '',
              texto,
              colhedorId,
            },
          ]);
        };
        textReader.readAsText(file);
      } else {
        reader.onload = (evt) => {
          const base64 = evt.target?.result as string;
          setArquivos((prev) => [
            ...prev,
            {
              id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
              nome: file.name,
              tipo: file.type || 'application/octet-stream',
              base64,
              colhedorId,
            },
          ]);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  function handleRemoverArquivo(id: string) {
    setArquivos((prev) => prev.filter((a) => a.id !== id));
  }

  async function handleProcessarCesta() {
    setProcessando(true);
    try {
      // 1. Verifica se há arquivo de texto plano (CSV/TSV/WebDiet/Welts)
      const arquivoTexto = arquivos.find((a) => a.nome.endsWith('.csv') || a.nome.endsWith('.tsv') || a.nome.endsWith('.txt'));

      if (arquivoTexto && arquivoTexto.texto) {
        const resultadoLocal = processarRelatorioLocal(arquivoTexto.texto, arquivoTexto.nome);
        if (resultadoLocal.totalLidos > 0) {
          onProcessado({
            totalItens: resultadoLocal.totalLidos,
            softwareDetectado: resultadoLocal.software,
            totalPacientesAtivosDetectados: resultadoLocal.totalLidos,
            itens: resultadoLocal.itens,
          });
          return;
        }
      }

      // 2. Chama o Gemini API em Chunks para prints/imagens
      const resultado = await processarCestaDeDados(arquivos);
      onProcessado(resultado);
    } catch (err) {
      console.error('[CestaDeDadosDrawer] Erro ao processar:', err);
    } finally {
      setProcessando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border-l border-white/10 w-full max-w-2xl h-full p-6 overflow-y-auto space-y-6 flex flex-col justify-between shadow-2xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400">
                  Atalho de Importação Opcional
                </span>
                <h2 className="text-lg font-bold text-white leading-tight">
                  Cesta de Dados A3 (As 9 Caixinhas de Coleta)
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onFechar}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            💡 <strong>Este é um atalho opcional de agilidade.</strong> Coloque seus arquivos ou prints em cada caixinha abaixo. Ao confirmar, os eixos serão pré-preenchidos e você continuará a jornada normalmente podendo editar tudo inline!
          </p>

          {/* As 9 Caixinhas Organizadas */}
          <div className="space-y-3">
            {caixinhas.map((c) => {
              const arquivosDaCaixa = arquivos.filter((a) => a.colhedorId === c.colhedorId);

              return (
                <div key={c.id} className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                        {c.titulo}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">{c.descricao}</p>
                    </div>

                    <label className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 text-xs font-bold transition-all cursor-pointer shrink-0 inline-flex items-center gap-1.5">
                      <Upload className="h-3.5 w-3.5" /> Adicionar
                      <input
                        type="file"
                        accept={c.aceita}
                        multiple
                        onChange={(e) => handleFileChange(c.colhedorId, e)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Lista de Arquivos no Colhedor */}
                  {arquivosDaCaixa.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {arquivosDaCaixa.map((a) => (
                        <div key={a.id} className="flex items-center justify-between bg-slate-900 px-3 py-1.5 rounded-lg text-xs text-slate-300">
                          <span className="truncate max-w-[280px] font-mono text-[11px]">{a.nome}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoverArquivo(a.id)}
                            className="text-slate-500 hover:text-red-400 text-xs cursor-pointer ml-2"
                          >
                            Remover
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-semibold">
            {arquivos.length} arquivo(s) na Cesta
          </span>

          <button
            type="button"
            onClick={handleProcessarCesta}
            disabled={processando}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-6 py-3.5 rounded-xl transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {processando ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Analisando Cesta com Gemini IA...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Processar Cesta com O Grande Colhedor →
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
