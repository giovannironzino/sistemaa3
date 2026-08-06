// crmBridge.types.ts
// Contrato de dados da Ponte CRM — reconcilia o total de pacientes de uma
// plataforma externa (WebDiet, WebNutri etc.) com os contatos marcados como
// "virou paciente" em Captação. Não é uma das 9 fases da Jornada — persiste em
// clients/{uid}.crmBridge, independente de FaseJornadaId/jornadaState.

export type CrmPlatformId =
  | 'WebDiet'
  | 'WebNutri'
  | 'DietBox'
  | 'Welts'
  | 'ClickUp'
  | 'CRM Próprio'
  | 'Trello'
  | 'Pipefy'
  | 'Outros';

export const CRM_PLATFORMS: CrmPlatformId[] = [
  'WebDiet', 'WebNutri', 'DietBox', 'Welts', 'ClickUp', 'CRM Próprio', 'Trello', 'Pipefy', 'Outros',
];

export interface CrmMissingDraft {
  name: string;
  objetivo: string;
  canal: string;
  date: string;
}

export interface CrmBridgeState {
  platforms: CrmPlatformId[];
  primaryPlatform: CrmPlatformId | '';
  totalCount: string;
  crmBridgeCompleta: boolean;
  atualizadoEm: string;
}
