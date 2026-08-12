// TelaFormulario.tsx
// Formulário de cadastro/edição de contato — chips clicáveis para objetivo e canal.

import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ContatoCaptacao, CanalOrigemId, StatusFechamento } from '../fase02.types';
import type { ClusterId } from '../../fase01/fase01.types';
import { CLUSTERS } from '../../fase01/data/bancoDePromessas';
import { CANAIS_ORIGEM } from '../data/canaisOrigem';
import { criarContato, formatDateBR } from '../lib/contatoUtils';
import { C, badgeStyle, chipStyle, toggleBtnStyle, primaryBtnStyle, inputStyle } from '../ui/tokens';
import { obterDatasA3 } from '../../../lib/dateUtils';

interface TelaFormularioProps {
  selectedDate: string;
  contatoEditando?: ContatoCaptacao;
  pacientesMapeadosEixo01?: Array<{ id: string; nome: string; dorId: ClusterId }>;
  onSalvar: (contato: ContatoCaptacao) => void;
  onVoltar: () => void;
  modoReconciliacao?: boolean;
}

interface FormState {
  nomeContato: string;
  objetivoPrincipal: ClusterId | '';
  canalOrigem: CanalOrigemId | '';
  statusFechamento: StatusFechamento | '';
  sabeQuemIndicou: boolean | null;
  nomeIndicador: string;
  sabeQualParceiro: boolean | null;
  nomeParceiro: string;
  vinculadoEixo01: boolean;
}

function buildInitialForm(contato?: ContatoCaptacao): FormState {
  if (!contato) {
    return {
      nomeContato: '',
      objetivoPrincipal: '',
      canalOrigem: '',
      statusFechamento: '',
      sabeQuemIndicou: null,
      nomeIndicador: '',
      sabeQualParceiro: null,
      nomeParceiro: '',
      vinculadoEixo01: false,
    };
  }
  return {
    nomeContato: contato.nomeContato,
    objetivoPrincipal: contato.objetivoPrincipal,
    canalOrigem: contato.canalOrigem,
    statusFechamento: contato.statusFechamento,
    sabeQuemIndicou: contato.sabeQuemIndicou ?? null,
    nomeIndicador: contato.nomeIndicador ?? '',
    sabeQualParceiro: contato.sabeQualParceiro ?? null,
    nomeParceiro: contato.nomeParceiro ?? '',
    vinculadoEixo01: false,
  };
}

export default function TelaFormulario({
  selectedDate,
  contatoEditando,
  pacientesMapeadosEixo01 = [],
  onSalvar,
  onVoltar,
  modoReconciliacao = false,
}: TelaFormularioProps) {
  const [form, setForm] = useState<FormState>(() => buildInitialForm(contatoEditando));

  const datas = obterDatasA3(null);
  const hoje = new Date();
  const anoMesM0 = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  const anoMesM1 = (() => { const d = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; })();
  const anoMesM2 = (() => { const d = new Date(hoje.getFullYear(), hoje.getMonth() - 2, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; })();

  const [mesSelecionado, setMesSelecionado] = useState<string>(() => selectedDate.substring(0, 7));

  useEffect(() => {
    setForm(buildInitialForm(contatoEditando));
  }, [contatoEditando?.id]);

  // Match de Paciente Mapeado no Eixo 01
  const pacienteCorrespondenteEixo01 = pacientesMapeadosEixo01.find((p) =>
    form.nomeContato.trim().length >= 3 &&
    p.nome.toLowerCase().includes(form.nomeContato.trim().toLowerCase())
  );

  function handleConfirmarVinculo() {
    if (!pacienteCorrespondenteEixo01) return;
    setForm((prev) => ({
      ...prev,
      objetivoPrincipal: pacienteCorrespondenteEixo01.dorId,
      vinculadoEixo01: true,
    }));
  }

  function isValid(): boolean {
    if (!form.nomeContato.trim()) return false;
    if (!form.objetivoPrincipal) return false;
    if (!form.canalOrigem) return false;
    if (!modoReconciliacao && !form.statusFechamento) return false;
    if (form.canalOrigem === 'indicacao_boca_a_boca' && form.sabeQuemIndicou === true && !form.nomeIndicador.trim()) return false;
    return true;
  }

  function handleCanalChange(canalId: CanalOrigemId) {
    setForm((prev) => ({
      ...prev,
      canalOrigem: canalId,
      sabeQuemIndicou: null,
      nomeIndicador: '',
      sabeQualParceiro: null,
      nomeParceiro: '',
    }));
  }

  function handleSalvar() {
    if (!isValid()) return;
    const contato = criarContato({
      data: mesSelecionado + '-01',
      nomeContato: form.nomeContato,
      objetivoPrincipal: form.objetivoPrincipal as ClusterId,
      canalOrigem: form.canalOrigem as CanalOrigemId,
      statusFechamento: modoReconciliacao ? 'sim' : (form.statusFechamento as StatusFechamento),
      sabeQuemIndicou: form.sabeQuemIndicou === true,
      nomeIndicador: form.nomeIndicador,
      origemRegistro: modoReconciliacao ? 'reconciliacao_prontuario' : 'revisao_whatsapp',
      idExistente: contatoEditando?.id,
      criadoEmExistente: contatoEditando?.criadoEm,
    });
    onSalvar(contato);
  }

  const isIndicacao = form.canalOrigem === 'indicacao_boca_a_boca';
  const isParceria = form.canalOrigem === 'parcerias_medicas';

  return (
    <div>
      <div
        onClick={onVoltar}
        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: C.textSecondary, cursor: 'pointer', marginBottom: 18, width: 'fit-content' }}
      >
        <ArrowLeft size={14} /> Voltar para a lista do dia
      </div>
      <div style={badgeStyle}>{modoReconciliacao ? 'EIXO 02 · RECONCILIAÇÃO COM PRONTUÁRIO' : 'EIXO 02 · CAPTAÇÃO'}</div>
      <div style={{ fontSize: 22, fontWeight: 800, marginTop: 16, marginBottom: 8 }}>
        {modoReconciliacao ? (
          'Cadastrando paciente que o prontuário mostra mas a revisão de WhatsApp não capturou'
        ) : (
          <>Cadastrando quem te procurou em <span style={{ color: C.accentText }}>{mesSelecionado === anoMesM2 ? datas.mesM2 : mesSelecionado === anoMesM1 ? datas.mesM1 : datas.mesM0}</span></>
        )}
      </div>
      <p style={{ fontSize: 13, color: C.textSecondary, marginBottom: 22 }}>
        Preencha os dados brutos de quem entrou em contato. O sistema calculará a taxa de conversão comercial automaticamente.
      </p>

      {/* Seleção de Mês (Visível apenas se não for reconciliação) */}
      {!modoReconciliacao && (
        <div style={{ marginBottom: 24, display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          <div
            onClick={() => setMesSelecionado(anoMesM2)}
            style={{ ...chipStyle(mesSelecionado === anoMesM2), fontSize: 13, padding: '8px 16px', flexShrink: 0 }}
          >
            {datas.mesM2}
          </div>
          <div
            onClick={() => setMesSelecionado(anoMesM1)}
            style={{ ...chipStyle(mesSelecionado === anoMesM1), fontSize: 13, padding: '8px 16px', flexShrink: 0 }}
          >
            {datas.mesM1}
          </div>
          <div
            onClick={() => setMesSelecionado(anoMesM0)}
            style={{ ...chipStyle(mesSelecionado === anoMesM0), fontSize: 13, padding: '8px 16px', flexShrink: 0 }}
          >
            {datas.mesM0}
          </div>
        </div>
      )}

      {/* 1. Nome do Contato */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>1. Nome da pessoa que te chamou no WhatsApp</div>
        <p style={{ fontSize: 11, color: C.textSecondary, marginBottom: 8 }}>Digite o nome como consta na conversa ou na sua agenda.</p>
        <input
          value={form.nomeContato}
          onChange={(e) => setForm((prev) => ({ ...prev, nomeContato: e.target.value, vinculadoEixo01: false }))}
          placeholder="Ex: Maria Clara, João Pedro..."
          style={inputStyle}
        />

        {/* Chip de Vínculo Guiado pelo Usuário com o Eixo 01 */}
        {pacienteCorrespondenteEixo01 && !form.vinculadoEixo01 && (
          <div style={{ marginTop: 10, padding: 12, borderRadius: 10, background: 'rgba(109,94,248,.12)', border: '1px solid rgba(109,94,248,.3)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 12, color: '#e2e8f0' }}>
              💡 <strong>Match Encontrado:</strong> Esta pessoa corresponde ao paciente <strong>{pacienteCorrespondenteEixo01.nome}</strong> já mapeado no Eixo 01?
            </div>
            <button
              type="button"
              onClick={handleConfirmarVinculo}
              style={{ background: '#6d5ef8', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              Vincular Dados ✓
            </button>
          </div>
        )}

        {form.vinculadoEixo01 && (
          <div style={{ marginTop: 8, fontSize: 11, color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            ✓ Dados de objetivo vinculados automaticamente ao Eixo 01!
          </div>
        )}
      </div>

      {/* 2. Objetivo Principal */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>2. O que esta pessoa estava buscando resolver?</div>
        <p style={{ fontSize: 11, color: C.textSecondary, marginBottom: 8 }}>Selecione o objetivo principal relatado pela pessoa na conversa inicial.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 8 }}>
          {CLUSTERS.map((cluster) => (
            <div
              key={cluster.id}
              onClick={() => setForm((prev) => ({ ...prev, objetivoPrincipal: cluster.id }))}
              style={chipStyle(form.objetivoPrincipal === cluster.id)}
            >
              {cluster.label}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Canal de Origem */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>3. Como esta pessoa conheceu o seu trabalho?</div>
        <p style={{ fontSize: 11, color: C.textSecondary, marginBottom: 8 }}>Identifique a origem para descobrir qual canal gera mais pacientes reais.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 8 }}>
          {CANAIS_ORIGEM.map((canal) => (
            <div key={canal.id} onClick={() => handleCanalChange(canal.id)} style={chipStyle(form.canalOrigem === canal.id)}>
              {canal.label}
            </div>
          ))}
        </div>

        {/* Sub-campo: Indicação boca a boca */}
        {isIndicacao && (
          <div style={{ marginTop: 12, padding: 14, borderLeft: `2px solid ${C.accent}`, background: 'rgba(109,94,248,.08)', borderRadius: '0 8px 8px 0' }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: '#c3c7d4' }}>Você sabe quem indicou este paciente?</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <div
                onClick={() => setForm((prev) => ({ ...prev, sabeQuemIndicou: true }))}
                style={toggleBtnStyle(form.sabeQuemIndicou === true)}
              >
                Sim
              </div>
              <div
                onClick={() => setForm((prev) => ({ ...prev, sabeQuemIndicou: false, nomeIndicador: '' }))}
                style={toggleBtnStyle(form.sabeQuemIndicou === false)}
              >
                Não sei quem indicou
              </div>
            </div>
            {form.sabeQuemIndicou === true && (
              <input
                value={form.nomeIndicador}
                onChange={(e) => setForm((prev) => ({ ...prev, nomeIndicador: e.target.value }))}
                placeholder="Nome do paciente ou pessoa que indicou"
                style={{ ...inputStyle, padding: '10px 12px', fontSize: 13, borderRadius: 8 }}
              />
            )}
          </div>
        )}

        {/* Sub-campo: Parcerias Estratégicas & Indicações Médicas */}
        {isParceria && (
          <div style={{ marginTop: 12, padding: 14, borderLeft: '2px solid #38bdf8', background: 'rgba(56,189,248,.07)', borderRadius: '0 8px 8px 0' }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: '#c3c7d4' }}>Você sabe qual parceiro ou médico indicou?</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <div
                onClick={() => setForm((prev) => ({ ...prev, sabeQualParceiro: true }))}
                style={toggleBtnStyle(form.sabeQualParceiro === true)}
              >
                Sim, sei quem foi
              </div>
              <div
                onClick={() => setForm((prev) => ({ ...prev, sabeQualParceiro: false, nomeParceiro: '' }))}
                style={toggleBtnStyle(form.sabeQualParceiro === false)}
              >
                Não sei o parceiro
              </div>
            </div>
            {form.sabeQualParceiro === true && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input
                  value={form.nomeParceiro}
                  onChange={(e) => setForm((prev) => ({ ...prev, nomeParceiro: e.target.value }))}
                  placeholder="Nome do parceiro / médico (ex: Dr. Ricardo Santos)"
                  style={{ ...inputStyle, padding: '10px 12px', fontSize: 13, borderRadius: 8 }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Status de Fechamento */}
      {!modoReconciliacao && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>4. Esta pessoa fechou o acompanhamento com você?</div>
          <p style={{ fontSize: 11, color: C.textSecondary, marginBottom: 8 }}>Indique se a conversa virou uma consulta/plano pago ou se parou antes de fechar.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 10 }}>
            <div
              onClick={() => setForm((prev) => ({ ...prev, statusFechamento: 'sim' }))}
              style={toggleBtnStyle(form.statusFechamento === 'sim')}
            >
              🟢 SIM (Fechou e virou paciente ativo)
            </div>
            <div
              onClick={() => setForm((prev) => ({ ...prev, statusFechamento: 'nao' }))}
              style={toggleBtnStyle(form.statusFechamento === 'nao')}
            >
              🔴 NÃO (Não fechou / parou de responder)
            </div>
          </div>
        </div>
      )}

      <div id="btn_salvar_contato" onClick={() => isValid() && handleSalvar()} style={primaryBtnStyle(isValid())}>
        ✓ Salvar Registro de Contato
      </div>
    </div>
  );
}

