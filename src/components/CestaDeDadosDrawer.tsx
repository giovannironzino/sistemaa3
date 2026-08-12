// CestaDeDadosDrawer.tsx
// Componente da Cesta de Dados A3 com as 09 Caixinhas de Coleta Organizadas.
// Suporta Upload de Planilhas (XLSX, CSV, TSV), PDFs, Prints de Imagem e a opção Copiar & Colar (Ctrl+V) Tático.

import React, { useState } from 'react';
import { Sparkles, Upload, FileText, Clipboard, Check, X, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { processarCestaDeDados, ResultadoProcessamentoCesta } from '../lib/geminiImportService';
import { processarConteudoUniversal, DiagnosticoArquivo } from '../lib/webdietWeltsParser';

interface CestaDeDadosDrawerProps {
  onProcessado: (resultado: ResultadoProcessamentoCesta) => void;
  onFechar: () => void;
}

export default function CestaDeDadosDrawer({ onProcessado, onFechar }: CestaDeDadosDrawerProps) {
  const [arquivos, setArquivos] = useState<
    Array<{ id: string; nome: string; tipo: string; base64?: string; texto?: string; buffer?: ArrayBuffer; caixinhaId: string }>
  >([]);
  const [textosColados, setTextosColados] = useState<Record<string, string>>({});
  const [abaAtiva, setAbaAtiva] = useState<Record<string, 'upload' | 'colar'>>({});
  const [diagnosticosLocais, setDiagnosticosLocais] = useState<DiagnosticoArquivo[]>([]);
  const [processando, setProcessando] = useState(false);

  const caixinhas = [
    {
      id: 'caixa_1a_webdiet',
      titulo: '📦 Caixa 1A — Relatório de Pacientes Ativos (WebDiet / Welts / Dietbox)',
      descricao: 'Planilha (.xlsx/.csv) ou cole a tabela copiada do seu prontuário com nomes e status.',
      aceita: '.csv,.xlsx,.xls,.txt,.tsv,image/*',
    },
    {
      id: 'caixa_1b_atendimentos',
      titulo: '📦 Caixa 1B — Histórico dos Últimos 90 Dias (M-2, M-1, M0)',
      descricao: 'Lista ou print dos atendimentos realizados em Maio, Junho e Julho.',
      aceita: '.csv,.xlsx,.xls,.pdf,image/*',
    },
    {
      id: 'caixa_2a_whatsapp',
      titulo: '📦 Caixa 2A — Prints de Conversas do WhatsApp (Novos Interessados)',
      descricao: 'Prints de tela de conversas com pessoas perguntando sobre consultas e valores.',
      aceita: 'image/*,.txt',
    },
    {
      id: 'caixa_2b_direct',
      titulo: '📦 Caixa 2B — Prints do Direct do Instagram',
      descricao: 'Prints de mensagens recebidas na caixa de entrada do Direct.',
      aceita: 'image/*',
    },
    {
      id: 'caixa_2c_indicacoes',
      titulo: '📦 Caixa 2C — Parcerias & Indicações Médicas',
      descricao: 'Foto ou anotação da lista de pacientes indicados por médicos ou parceiros.',
      aceita: 'image/*,.pdf,.txt',
    },
    {
      id: 'caixa_3a_precos',
      titulo: '📦 Caixa 3A — Tabela de Preços & Cardápio de Serviços',
      descricao: 'Foto do cardápio de serviços, tabela de valores ou PDF de propostas.',
      aceita: 'image/*,.pdf,.txt',
    },
    {
      id: 'caixa_3b_contrato',
      titulo: '📦 Caixa 3B — Proposta / Contrato de Acompanhamento',
      descricao: 'PDF ou print do modelo de contrato ou proposta comercial.',
      aceita: 'image/*,.pdf,.txt',
    },
    {
      id: 'caixa_4a_extrato',
      titulo: '📦 Caixa 4A — Extrato Bancário / Entradas no Caixa',
      descricao: 'Print ou PDF do extrato bancário PJ/PF dos últimos 3 meses.',
      aceita: 'image/*,.csv,.pdf',
    },
    {
      id: 'caixa_4b_custos',
      titulo: '📦 Caixa 4B — Comprovantes de Custos Fixos & Sublocação',
      descricao: 'Comprovantes de aluguel, condomínio, software WebDiet/Welts ou CRN.',
      aceita: 'image/*,.pdf,.csv,.txt',
    },
  ];

  function handleFileChange(caixinhaId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();

      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        // Arquivo Excel binário -> le como ArrayBuffer
        reader.onload = (evt) => {
          const buffer = evt.target?.result as ArrayBuffer;
          setArquivos((prev) => [
            ...prev,
            {
              id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
              nome: file.name,
              tipo: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              buffer,
              caixinhaId,
            },
          ]);
        };
        reader.readAsArrayBuffer(file);
      } else if (file.name.endsWith('.csv') || file.name.endsWith('.tsv') || file.name.endsWith('.txt')) {
        // Arquivo de Texto plano -> le como String
        reader.onload = (evt) => {
          const texto = evt.target?.result as string;
          setArquivos((prev) => [
            ...prev,
            {
              id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
              nome: file.name,
              tipo: 'text/plain',
              texto,
              caixinhaId,
            },
          ]);
        };
        reader.readAsText(file);
      } else {
        // Imagem / PDF -> le como DataURL (Base64)
        reader.onload = (evt) => {
          const base64 = evt.target?.result as string;
          setArquivos((prev) => [
            ...prev,
            {
              id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
              nome: file.name,
              tipo: file.type || 'application/octet-stream',
              base64,
              caixinhaId,
            },
          ]);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  function handleTextoColadoChange(caixinhaId: string, valor: string) {
    setTextosColados((prev) => ({ ...prev, [caixinhaId]: valor }));
  }

  function handleRemoverArquivo(id: string) {
    setArquivos((prev) => prev.filter((a) => a.id !== id));
  }

  async function handleProcessarCesta() {
    setProcessando(true);
    setDiagnosticosLocais([]);

    try {
      // Agrupa todos os arquivos e textos colados de todas as caixinhas
      const payloadLeitura: Array<{ nome: string; buffer?: ArrayBuffer; base64?: string; texto?: string; caixinhaId: string }> = [
        ...arquivos.map((a) => ({ nome: a.nome, buffer: a.buffer, base64: a.base64, texto: a.texto, caixinhaId: a.caixinhaId })),
      ];

      // Adiciona textos colados manualmente via Ctrl+V
      Object.entries(textosColados).forEach(([caixinhaId, texto]) => {
        const txt = (texto || '') as string;
        if (txt.trim().length > 0) {
          payloadLeitura.push({
            nome: `Texto Colado (Ctrl+V) em ${caixinhaId}`,
            texto: txt,
            caixinhaId,
          });
        }
      });

      // 1. Processa localmente via Parser Universal (SheetJS + Text/TSV)
      const resLocal = processarConteudoUniversal(payloadLeitura);
      setDiagnosticosLocais(resLocal.diagnosticos);

      if (resLocal.totalItens > 0) {
        onProcessado({
          totalItens: resLocal.totalItens,
          softwareDetectado: resLocal.softwareDetectado,
          totalPacientesAtivosDetectados: resLocal.totalItens,
          itens: resLocal.itens,
        });
        return;
      }

      // 2. Fallback para Gemini API se houver apenas imagens/prints
      const resGemini = await processarCestaDeDados(
        arquivos.map((a) => ({
          nome: a.nome,
          tipo: a.tipo,
          base64: a.base64 || '',
          colhedorId: a.caixinhaId,
        }))
      );
      onProcessado(resGemini);
    } catch (err) {
      console.error('[CestaDeDadosDrawer] Erro ao processar:', err);
    } finally {
      setProcessando(false);
    }
  }

  const totalArquivos = arquivos.length + Object.values(textosColados).filter((t) => String(t || '').trim().length > 0).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border-l border-white/10 w-full max-w-2xl h-full p-6 overflow-y-auto space-y-6 flex flex-col justify-between shadow-2xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400">
                  Atalho de Importação Opcional · Linguagem Simples
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

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-1">
            <p>
              💡 <strong className="text-white font-semibold">Como funciona:</strong> Você pode subir planilhas do WebDiet/Welts, prints do WhatsApp ou simplesmente <strong className="text-indigo-400">copiar a tabela do prontuário e colar no campo de texto (Ctrl+V)</strong>.
            </p>
            <p className="text-[11px] text-slate-400">
              Ao confirmar, os eixos serão pré-preenchidos automaticamente e você continuará a jornada com total liberdade para editar tudo inline!
            </p>
          </div>

          {/* Feedback de Diagnóstico dos Arquivos se houver */}
          {diagnosticosLocais.length > 0 && (
            <div className="space-y-2 p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30">
              <span className="text-[10px] font-bold uppercase text-indigo-400 block">
                📋 Diagnóstico de Leitura dos Arquivos:
              </span>
              {diagnosticosLocais.map((d, idx) => (
                <div key={idx} className="text-xs text-slate-200 leading-relaxed font-medium">
                  {d.statusTexto}
                </div>
              ))}
            </div>
          )}

          {/* As 9 Caixinhas Organizadas */}
          <div className="space-y-4">
            {caixinhas.map((c) => {
              const arquivosDaCaixa = arquivos.filter((a) => a.caixinhaId === c.id);
              const modoColar = abaAtiva[c.id] === 'colar';
              const textoColadoItem = textosColados[c.id] || '';

              return (
                <div key={c.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                        {c.titulo}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">{c.descricao}</p>
                    </div>

                    {/* Alternador de Modo: Upload vs Copiar/Colar */}
                    <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
                      <button
                        type="button"
                        onClick={() => setAbaAtiva((prev) => ({ ...prev, [c.id]: 'upload' }))}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          !modoColar ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        📁 Upload
                      </button>
                      <button
                        type="button"
                        onClick={() => setAbaAtiva((prev) => ({ ...prev, [c.id]: 'colar' }))}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          modoColar ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        📋 Cole (Ctrl+V)
                      </button>
                    </div>
                  </div>

                  {/* Modo Upload de Arquivo */}
                  {!modoColar ? (
                    <div className="space-y-2">
                      <label className="w-full border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl p-3 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 hover:text-indigo-300 transition-all cursor-pointer bg-slate-900/50">
                        <Upload className="h-4 w-4 text-indigo-400" />
                        <span>Clique para selecionar arquivo (.xlsx, .csv, .pdf, imagem)</span>
                        <input
                          type="file"
                          accept={c.aceita}
                          multiple
                          onChange={(e) => handleFileChange(c.id, e)}
                          className="hidden"
                        />
                      </label>

                      {/* Lista de Arquivos Adicionados nesta Caixinha */}
                      {arquivosDaCaixa.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          {arquivosDaCaixa.map((a) => (
                            <div key={a.id} className="flex items-center justify-between bg-slate-900 px-3 py-1.5 rounded-lg text-xs text-slate-300">
                              <span className="truncate max-w-[280px] font-mono text-[11px]">🟢 {a.nome}</span>
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
                  ) : (
                    /* Modo Copiar e Colar (Ctrl+V) */
                    <div className="space-y-1.5">
                      <textarea
                        value={textoColadoItem}
                        onChange={(e) => handleTextoColadoChange(c.id, e.target.value)}
                        placeholder="Selecione a tabela no seu prontuário (WebDiet/Welts), dê Ctrl+C e cole aqui (Ctrl+V)..."
                        rows={3}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 font-mono focus:border-indigo-500 focus:outline-none"
                      />
                      {textoColadoItem.trim().length > 0 && (
                        <span className="text-[10px] text-emerald-400 font-bold block">
                          ✓ Texto pronto para leitura local instantânea!
                        </span>
                      )}
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
            {totalArquivos} item(ns) prontos na Cesta
          </span>

          <button
            type="button"
            onClick={handleProcessarCesta}
            disabled={processando || totalArquivos === 0}
            className={`font-bold text-xs px-6 py-3.5 rounded-xl transition-all shadow-xl flex items-center gap-2 cursor-pointer ${
              totalArquivos > 0 && !processando
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {processando ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Lendo arquivos e textos...
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
