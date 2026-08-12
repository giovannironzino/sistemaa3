// CestaDeDadosModal.tsx
// Modal amplo e contextual de importação da Cesta de Dados A3 (Progressive Disclosure em 2 passos).

import React, { useState, useMemo } from 'react';
import { Sparkles, Upload, FileText, Clipboard, Check, X, ArrowRight, Loader2, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Trash2, RefreshCw } from 'lucide-react';
import { processarCestaDeDados, ResultadoProcessamentoCesta, ItemCestaExtraido } from '../lib/geminiImportService';
import { processarConteudoUniversal, DiagnosticoArquivo } from '../lib/webdietWeltsParser';
import TelaConfirmacaoCesta from './TelaConfirmacaoCesta';

interface CestaDeDadosModalProps {
  onProcessado: (resultado: ResultadoProcessamentoCesta) => void;
  onConfirmarImportacao: (itensValidados: ItemCestaExtraido[]) => void;
  onFechar: () => void;
}

export interface FonteItem {
  id: string;
  titulo: string;
  subtitulo: string;
  extracaoInfo: string;
  caixinhaId: string;
  aceita: string;
  recomendado: boolean;
}

const FONTES_DISPONIVEIS: FonteItem[] = [
  {
    id: 'fonte_pacientes_ativos',
    titulo: 'Relatório de pacientes ativos',
    subtitulo: 'Planilha (.xlsx/.csv) ou tabela copiada do seu prontuário (WebDiet, Welts, Dietbox).',
    extracaoInfo: 'O A3 vai extrair: nomes dos pacientes, status e histórico.',
    caixinhaId: 'caixa_1a_webdiet',
    aceita: '.csv,.xlsx,.xls,.txt,.tsv,image/*',
    recomendado: true,
  },
  {
    id: 'fonte_historico_90dias',
    titulo: 'Histórico dos últimos 90 dias',
    subtitulo: 'Lista ou planilha de atendimentos realizados nos últimos meses.',
    extracaoInfo: 'O A3 vai extrair: ticket pago e mês de atendimento.',
    caixinhaId: 'caixa_1b_atendimentos',
    aceita: '.csv,.xlsx,.xls,.pdf,image/*',
    recomendado: true,
  },
  {
    id: 'fonte_whatsapp',
    titulo: 'Conversas do WhatsApp / Mensagens',
    subtitulo: 'Prints ou textos de conversas com pacientes interessados ou em acompanhamento.',
    extracaoInfo: 'O A3 vai extrair: sinais da dor principal e valores citados.',
    caixinhaId: 'caixa_2a_whatsapp',
    aceita: 'image/*,.txt',
    recomendado: true,
  },
  {
    id: 'fonte_instagram_direct',
    titulo: 'Prints do Direct do Instagram',
    subtitulo: 'Prints de mensagens recebidas no Instagram.',
    extracaoInfo: 'O A3 vai extrair: interessados e queixas frequentes.',
    caixinhaId: 'caixa_2b_direct',
    aceita: 'image/*',
    recomendado: false,
  },
  {
    id: 'fonte_tabela_precos',
    titulo: 'Tabela de preços & contratos',
    subtitulo: 'PDFs ou imagens de propostas comerciais e contratos.',
    extracaoInfo: 'O A3 vai extrair: nomes de serviços e preços cobrados.',
    caixinhaId: 'caixa_3a_precos',
    aceita: 'image/*,.pdf,.txt',
    recomendado: false,
  },
];

export default function CestaDeDadosModal({
  onProcessado,
  onConfirmarImportacao,
  onFechar,
}: CestaDeDadosModalProps) {
  // Passo 1: 'fontes' | Passo 2: 'revisao'
  const [passo, setPasso] = useState<'fontes' | 'revisao'>('fontes');

  // Fontes adicionadas / uploads
  const [arquivos, setArquivos] = useState<
    Array<{ id: string; nome: string; tipo: string; base64?: string; texto?: string; buffer?: ArrayBuffer; caixinhaId: string }>
  >([]);
  const [textosColados, setTextosColados] = useState<Record<string, string>>({});
  const [fonteEmEdicaoColar, setFonteEmEdicaoColar] = useState<string | null>(null);
  const [outrasFontesAbertas, setOutrasFontesAbertas] = useState(false);

  // Status de processamento por IA
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoProcessamentoCesta | null>(null);

  const fontesRecomendadas = useMemo(() => FONTES_DISPONIVEIS.filter((f) => f.recomendado), []);
  const outrasFontes = useMemo(() => FONTES_DISPONIVEIS.filter((f) => !f.recomendado), []);

  // Manipuladores de upload de arquivo por fonte
  const handleFileUpload = async (fonteId: string, caixinhaId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
        reader.readAsArrayBuffer(file);
        reader.onload = () => {
          const buffer = reader.result as ArrayBuffer;
          setArquivos((prev) => [
            ...prev.filter((a) => a.caixinhaId !== caixinhaId),
            { id: `arq_${Date.now()}_${i}`, nome: file.name, tipo: file.type, buffer, caixinhaId },
          ]);
        };
      } else {
        reader.readAsDataURL(file);
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          setArquivos((prev) => [
            ...prev.filter((a) => a.caixinhaId !== caixinhaId),
            { id: `arq_${Date.now()}_${i}`, nome: file.name, tipo: file.type, base64, caixinhaId },
          ]);
        };
      }
    }
  };

  const handleRemoverArquivo = (caixinhaId: string) => {
    setArquivos((prev) => prev.filter((a) => a.caixinhaId !== caixinhaId));
    setTextosColados((prev) => {
      const next = { ...prev };
      delete next[caixinhaId];
      return next;
    });
  };

  const totalFontesAdicionadas = useMemo(() => {
    const caixasComArquivo = new Set(arquivos.map((a) => a.caixinhaId));
    Object.entries(textosColados).forEach(([caixa, txt]) => {
      if (typeof txt === 'string' && txt.trim().length > 0) caixasComArquivo.add(caixa);
    });
    return caixasComArquivo.size;
  }, [arquivos, textosColados]);

  // Execução do parsing inteligente
  const handleProcessar = async () => {
    if (totalFontesAdicionadas === 0) return;
    setProcessando(true);

    try {
      // 1. Tenta leitura universal via SheetJS e Parser local
      const payloadLeitura: Array<{ nome: string; buffer?: ArrayBuffer; base64?: string; texto?: string; caixinhaId: string }> = [
        ...arquivos.map((a) => ({ nome: a.nome, buffer: a.buffer, base64: a.base64, caixinhaId: a.caixinhaId })),
      ];

      Object.entries(textosColados).forEach(([caixinhaId, texto]) => {
        const txt = typeof texto === 'string' ? texto : '';
        if (txt.trim().length > 0) {
          payloadLeitura.push({
            nome: `Texto Colado em ${caixinhaId}`,
            texto: txt,
            caixinhaId,
          });
        }
      });

      const resLocal = processarConteudoUniversal(payloadLeitura);

      if (resLocal.totalItens > 0) {
        const resProcessado: ResultadoProcessamentoCesta = {
          totalItens: resLocal.totalItens,
          softwareDetectado: resLocal.softwareDetectado,
          totalPacientesAtivosDetectados: resLocal.totalItens,
          itens: resLocal.itens,
        };
        setResultado(resProcessado);
        onProcessado(resProcessado);
        setPasso('revisao');
        return;
      }

      // 2. Fallback para processamento via Gemini AI se houver imagens/prints
      const payloadGemini: Array<{ nome: string; tipo: string; base64: string; colhedorId: string }> = arquivos.map((a) => ({
        nome: a.nome,
        tipo: a.tipo,
        base64: a.base64 || '',
        colhedorId: a.caixinhaId,
      }));

      const resGemini = await processarCestaDeDados(payloadGemini);
      setResultado(resGemini);
      onProcessado(resGemini);
      setPasso('revisao');
    } catch (err) {
      console.error('[CestaDeDadosModal] Erro ao processar dados:', err);
      alert('Ocorreu um erro ao processar os arquivos. Tente novamente.');
    } finally {
      setProcessando(false);
    }
  };

  const colunasMapeadas = useMemo(() => {
    if (!resultado || !resultado.itens || resultado.itens.length === 0) return [];
    return [
      { colunaArquivo: 'Nome do Paciente', campoA3Sugerido: 'nome', confianca: 'confirmed' },
      { colunaArquivo: 'Mês de Atendimento', campoA3Sugerido: 'mesAtendimento', confianca: 'confirmed' },
      { colunaArquivo: 'Ticket Pago (R$)', campoA3Sugerido: 'valor', confianca: 'confirmed' },
      { colunaArquivo: 'Dor / Motivo', campoA3Sugerido: 'dorId', confianca: 'inferred' },
    ];
  }, [resultado]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn" id="cesta_dados_modal">
      <div className="bg-[#090d16] border border-white/10 rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-auto">
        
        {/* ── HEADER DO MODAL ── */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-400 font-label">
                Copiloto de Ingestão A3
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                {passo === 'fontes' ? 'Importar da Cesta de Dados' : 'Revisar dados encontrados'}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                {passo === 'fontes'
                  ? 'Use arquivos, prints ou tabelas copiadas para acelerar o preenchimento deste eixo.'
                  : 'Confirme os registros confiáveis e aplique diretamente à Jornada.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onFechar}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Fechar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── BENEFÍCIO CURTO & ESTATÍSTICA DE APROVEITAMENTO ── */}
        {passo === 'fontes' && (
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 flex items-center gap-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Economia de Tempo:</strong> O A3 organiza essas informações e ajuda você a montar este eixo com menos esforço, aproveitando dados mesmo quando o arquivo for parcial.
            </span>
          </div>
        )}

        {/* ── PASSO 1: SELEÇÃO DE FONTES DE DADOS ── */}
        {passo === 'fontes' && (
          <div className="space-y-6">
            {/* Fontes Recomendadas para o Eixo 01 */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-label block">
                Recomendado para o Eixo 01
              </span>

              <div className="space-y-3">
                {fontesRecomendadas.map((fonte) => {
                  const arqCadastrado = arquivos.find((a) => a.caixinhaId === fonte.caixinhaId);
                  const txtColado = textosColados[fonte.caixinhaId];
                  const possuiDado = !!arqCadastrado || (!!txtColado && txtColado.trim().length > 0);

                  return (
                    <div
                      key={fonte.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        possuiDado
                          ? 'bg-emerald-950/20 border-emerald-500/40'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            {fonte.titulo}
                            {possuiDado && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                Fonte Adicionada ✓
                              </span>
                            )}
                          </h4>
                          <p className="text-xs text-slate-300 mt-0.5">{fonte.subtitulo}</p>
                          <span className="text-[11px] text-indigo-300 block mt-1 font-mono">
                            💡 {fonte.extracaoInfo}
                          </span>
                        </div>

                        {/* Ações da Fonte */}
                        <div className="flex items-center gap-2 shrink-0">
                          {possuiDado ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-emerald-400 truncate max-w-[150px]">
                                {arqCadastrado ? arqCadastrado.nome : 'Texto Colado'}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoverArquivo(fonte.caixinhaId)}
                                className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:text-red-300 border border-red-500/20"
                                title="Remover fonte"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <label className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow">
                                <Upload className="h-3.5 w-3.5" />
                                <span>Enviar arquivo</span>
                                <input
                                  type="file"
                                  accept={fonte.aceita}
                                  onChange={(e) => handleFileUpload(fonte.id, fonte.caixinhaId, e)}
                                  className="hidden"
                                />
                              </label>

                              <button
                                type="button"
                                onClick={() =>
                                  setFonteEmEdicaoColar(
                                    fonteEmEdicaoColar === fonte.caixinhaId ? null : fonte.caixinhaId
                                  )
                                }
                                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                              >
                                <Clipboard className="h-3.5 w-3.5 text-slate-400" />
                                <span>Colar</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Área de Colagem de Texto Se Ativa */}
                      {fonteEmEdicaoColar === fonte.caixinhaId && !possuiDado && (
                        <div className="mt-3 pt-3 border-t border-white/10 space-y-2 animate-fadeIn">
                          <textarea
                            rows={3}
                            placeholder="Cole aqui a tabela copiada do seu prontuário ou mensagens..."
                            value={textosColados[fonte.caixinhaId] || ''}
                            onChange={(e) =>
                              setTextosColados((prev) => ({ ...prev, [fonte.caixinhaId]: e.target.value }))
                            }
                            className="w-full p-3 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-indigo-400"
                          />
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => setFonteEmEdicaoColar(null)}
                              className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold"
                            >
                              Confirmar Cola
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Outras Fontes Opcionais (Accordion Colapsado) */}
            <div className="border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={() => setOutrasFontesAbertas(!outrasFontesAbertas)}
                className="w-full text-left flex items-center justify-between text-xs font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <span>Outras fontes opcionais da Jornada ({outrasFontes.length})</span>
                {outrasFontesAbertas ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {outrasFontesAbertas && (
                <div className="mt-3 space-y-3 animate-fadeIn">
                  {outrasFontes.map((fonte) => (
                    <div key={fonte.id} className="p-3 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-white block">{fonte.titulo}</span>
                        <span className="text-slate-400">{fonte.subtitulo}</span>
                      </div>
                      <label className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-semibold cursor-pointer">
                        Enviar
                        <input
                          type="file"
                          accept={fonte.aceita}
                          onChange={(e) => handleFileUpload(fonte.id, fonte.caixinhaId, e)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── STICKY FOOTER DE AÇÕES ── */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs font-bold text-slate-300 font-mono">
                {totalFontesAdicionadas > 0 ? (
                  <span className="text-emerald-400">✓ {totalFontesAdicionadas} fonte(s) adicionada(s)</span>
                ) : (
                  <span className="text-slate-500">Nenhuma fonte adicionada ainda</span>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onFechar}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Continuar depois
                </button>

                <button
                  type="button"
                  onClick={handleProcessar}
                  disabled={totalFontesAdicionadas === 0 || processando}
                  className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    totalFontesAdicionadas > 0 && !processando
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  {processando ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      <span>Analisando...</span>
                    </>
                  ) : (
                    <>
                      <span>Processar dados</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── PASSO 2: REVISÃO E CONFIRMAÇÃO DOS DADOS ENCONTRADOS ── */}
        {passo === 'revisao' && resultado && (
          <div className="space-y-4">
            <TelaConfirmacaoCesta
              itensIniciais={resultado.itens}
              softwareDetectado={resultado.softwareDetectado || 'WebDiet / Prontuário'}
              totalAtivosDetectados={resultado.totalPacientesAtivosDetectados || resultado.itens.length}
              ocultarHeader={true}
              onConfirmar={(itensValidados) => {
                onConfirmarImportacao(itensValidados);
              }}
              onCancelar={() => {
                setPasso('fontes');
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
