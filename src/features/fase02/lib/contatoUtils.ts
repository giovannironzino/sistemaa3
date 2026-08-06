// contatoUtils.ts
// Helpers compartilhados para criar/validar um ContatoCaptacao — usados tanto
// pelo formulário da Fase 02 quanto pelo mini-formulário "faltou no CRM" da Ponte CRM.

import { ContatoCaptacao, CanalOrigemId, StatusFechamento, OrigemRegistroId } from '../fase02.types';
import type { ClusterId } from '../../fase01/fase01.types';

export function gerarUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function formatDateBR(isoDate: string): string {
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}

interface CriarContatoInput {
  data: string;
  nomeContato: string;
  objetivoPrincipal: ClusterId;
  canalOrigem: CanalOrigemId;
  statusFechamento: StatusFechamento;
  sabeQuemIndicou?: boolean;
  nomeIndicador?: string;
  sabeQualParceiro?: boolean;
  nomeParceiro?: string;
  origemCrm?: boolean;
  reconcileAdd?: boolean;
  origemRegistro?: OrigemRegistroId; // se omitido, inferido: reconcileAdd/origemCrm → 'reconciliacao_prontuario', senão 'revisao_whatsapp'
  idExistente?: string;
  criadoEmExistente?: string;
}

export function criarContato(input: CriarContatoInput): ContatoCaptacao {
  const agora = new Date().toISOString();
  const contato: ContatoCaptacao = {
    id: input.idExistente ?? gerarUUID(),
    data: input.data,
    nomeContato: input.nomeContato.trim(),
    objetivoPrincipal: input.objetivoPrincipal,
    statusFechamento: input.statusFechamento,
    canalOrigem: input.canalOrigem,
    origemRegistro:
      input.origemRegistro ?? (input.reconcileAdd || input.origemCrm ? 'reconciliacao_prontuario' : 'revisao_whatsapp'),
    criadoEm: input.criadoEmExistente ?? agora,
    atualizadoEm: agora,
  };

  if (input.canalOrigem === 'indicacao_boca_a_boca') {
    contato.sabeQuemIndicou = input.sabeQuemIndicou === true;
    if (input.sabeQuemIndicou === true) {
      contato.nomeIndicador = (input.nomeIndicador ?? '').trim();
    }
  }

  if (input.canalOrigem === 'parcerias_medicas') {
    contato.sabeQualParceiro = input.sabeQualParceiro === true;
    if (input.sabeQualParceiro === true) {
      contato.nomeParceiro = (input.nomeParceiro ?? '').trim();
    }
  }

  if (input.origemCrm) contato.origemCrm = true;
  if (input.reconcileAdd) contato.reconcileAdd = true;

  return contato;
}
