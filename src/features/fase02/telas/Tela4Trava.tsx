// Tela4Trava.tsx
// Tela 4 — Trava de Segurança antes de gerar o veredito.
// Emenda de Reconciliação com Prontuário: após a confirmação existente, uma
// nova sub-etapa (opcional) pergunta sobre o sistema de prontuário/plano
// alimentar, antes de selar (travaConfirmada = true).

import React, { useState } from 'react';
import { ShieldCheck, ArrowLeft, ClipboardCheck, Users } from 'lucide-react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateBR(isoDate: string): string {
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Tela4TravaProps {
  janelaInicial: string;
  janelaFinal: string;
  totalContatos: number;
  totalConvertidos: number;
  // Substitui o antigo onConfirmar: chamado ao final da(s) sub-etapa(s) desta
  // tela, já com o resultado da pergunta de reconciliação. Se
  // reconciliacaoPendenteQuantidade > 0, o chamador deve iniciar o loop de
  // reconciliação em vez de selar diretamente.
  onAvancar: (
    totalPacientesSistemaProntuario: number | null,
    reconciliacaoPendenteQuantidade: number
  ) => void;
  onVoltar: () => void;
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

type Subview = 'confirmacao' | 'pergunta_prontuario' | 'diferenca_encontrada';

export default function Tela4Trava({
  janelaInicial,
  janelaFinal,
  totalContatos,
  totalConvertidos,
  onAvancar,
  onVoltar,
}: Tela4TravaProps) {
  const [subview, setSubview] = useState<Subview>('confirmacao');
  const [inputValor, setInputValor] = useState<string>('');
  const [diferencaCalculada, setDiferencaCalculada] = useState<number>(0);
  const [valorProntuarioCalculado, setValorProntuarioCalculado] = useState<number>(0);

  function handleContinuarPergunta() {
    const texto = inputValor.trim();
    if (texto === '') {
      // 4.1 — Em branco: reconciliacaoPendenteQuantidade = 0, segue direto, sem nenhuma tela nova.
      onAvancar(null, 0);
      return;
    }
    const valor = Math.max(0, Math.floor(Number(texto)));
    const diferenca = Math.max(0, valor - totalConvertidos);
    if (diferenca === 0) {
      // 4.2 — Sem diferença (ou prontuário <= totalConvertidos): segue direto, sem aviso.
      onAvancar(valor, 0);
      return;
    }
    setValorProntuarioCalculado(valor);
    setDiferencaCalculada(diferenca);
    setSubview('diferenca_encontrada');
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8" id="tela4_trava_captacao">
      {subview === 'confirmacao' && (
        <>
          {/* Header */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">
                Eixo 02 · Captação · Tela 4 — Confirmação Final
              </span>
            </div>
            <h1 className="text-xl font-bold text-white leading-snug">
              Você confirma que conferiu seu WhatsApp/agenda e cadastrou{' '}
              <span className="text-amber-400">TODAS</span> as pessoas que te procuraram entre{' '}
              <span className="text-white font-bold">{formatDateBR(janelaInicial)}</span> e{' '}
              <span className="text-white font-bold">{formatDateBR(janelaFinal)}</span>?
            </h1>
          </div>

          {/* Card de aviso */}
          <div className="bg-amber-500/8 border border-amber-500/25 rounded-xl px-5 py-5 space-y-2">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-amber-400 shrink-0" />
              <p className="text-sm font-bold text-amber-300">
                Você cadastrou{' '}
                <span className="text-white">
                  {totalContatos} {totalContatos === 1 ? 'pessoa' : 'pessoas'}
                </span>{' '}
                no total.
              </p>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed pl-8">
              Garantir que nenhum contato ficou de fora é fundamental para que a sua taxa de
              conversão e o ranking de canais fiquem{' '}
              <span className="text-white font-semibold">100% corretos</span>.
            </p>
          </div>

          {/* Opções */}
          <div className="space-y-3">
            <button
              type="button"
              id="btn_tela4_confirmar"
              onClick={() => setSubview('pergunta_prontuario')}
              className="btn-primary w-full flex items-center justify-center gap-2 px-5 py-4 text-sm font-bold rounded-xl"
            >
              <ShieldCheck className="h-4 w-4" />
              Sim, garanto que cadastrei todos os contatos dos últimos 90 dias!
            </button>

            <button
              type="button"
              id="btn_tela4_voltar"
              onClick={onVoltar}
              className="btn-ghost w-full flex items-center justify-center gap-2 px-5 py-4 text-sm font-semibold rounded-xl"
            >
              <ArrowLeft className="h-4 w-4" />
              Ainda faltam datas/pessoas para conferir.
            </button>
          </div>
        </>
      )}

      {subview === 'pergunta_prontuario' && (
        <>
          {/* Header */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20">
              <span className="text-[10px] font-bold tracking-widest text-sky-400 uppercase">
                Eixo 02 · Captação · Tela 4 — Reconciliação com Prontuário
              </span>
            </div>
            <h1 className="text-xl font-bold text-white leading-snug">
              Você usa algum sistema de prontuário ou plano alimentar (ex: WebDiet) para cadastrar
              seus pacientes? Se sim, quantos pacientes novos esse sistema mostra para este mesmo
              período de 90 dias?
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Essa pergunta é opcional. Se você não usa nenhum sistema desse tipo, ou não tem esse
              número à mão agora, pode deixar em branco e seguir.
            </p>
          </div>

          {/* Input numérico opcional */}
          <div className="bg-sky-500/8 border border-sky-500/25 rounded-xl px-5 py-5 space-y-3">
            <label htmlFor="input_total_prontuario" className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-sky-400" />
              Pacientes novos no sistema de prontuário (opcional)
            </label>
            <input
              id="input_total_prontuario"
              type="number"
              min={0}
              placeholder="Deixe em branco se não usa ou não sabe"
              value={inputValor}
              onChange={(e) => setInputValor(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:border-sky-500 transition-colors"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              id="btn_tela4_pergunta_prontuario_continuar"
              onClick={handleContinuarPergunta}
              className="btn-primary flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl"
            >
              Continuar
            </button>
          </div>
        </>
      )}

      {subview === 'diferenca_encontrada' && (
        <>
          {/* Header */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
              <span className="text-[10px] font-bold tracking-widest text-violet-400 uppercase">
                Eixo 02 · Captação · Diferença Encontrada
              </span>
            </div>
            <h1 className="text-xl font-bold text-white leading-snug">
              Você achou{' '}
              <span className="text-emerald-400">{totalConvertidos}</span> pacientes revisando o
              WhatsApp, mas seu sistema mostra{' '}
              <span className="text-sky-400">{valorProntuarioCalculado}</span> pacientes novos no
              período. Isso quer dizer que{' '}
              <span className="text-violet-300 font-bold">
                {diferencaCalculada} {diferencaCalculada === 1 ? 'pessoa veio' : 'pessoas vieram'}
              </span>{' '}
              por um caminho que essa revisão não capturou — pode ser indicação direta, telefone,
              ou presencial. Vamos cadastrar rapidamente essas pessoas também, uma por uma, do
              mesmo jeito que fizemos com as outras.
            </h1>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              id="btn_tela4_iniciar_reconciliacao"
              onClick={() => onAvancar(valorProntuarioCalculado, diferencaCalculada)}
              className="btn-primary w-full flex items-center justify-center gap-2 px-5 py-4 text-sm font-bold rounded-xl"
            >
              <Users className="h-4 w-4" />
              Cadastrar as {diferencaCalculada} {diferencaCalculada === 1 ? 'pessoa' : 'pessoas'} que faltam
            </button>
          </div>
        </>
      )}
    </div>
  );
}
