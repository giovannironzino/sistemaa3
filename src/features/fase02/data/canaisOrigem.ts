// canaisOrigem.ts
// Fonte única de dados para os canais de origem da Fase 02 — Captação.

import { CanalOrigemId } from '../fase02.types';

export interface CanalDef {
  id: CanalOrigemId;
  label: string;
  temSubcampo: boolean;
  subcampoTipo?: 'indicador' | 'parceiro';
}

export const CANAIS_ORIGEM: CanalDef[] = [
  {
    id: 'indicacao_boca_a_boca',
    label: 'Indicação e boca a boca (pacientes atuais)',
    temSubcampo: true,
    subcampoTipo: 'indicador',
  },
  {
    id: 'instagram_organico',
    label: 'Instagram e marketing de conteúdo (orgânico)',
    temSubcampo: false,
  },
  {
    id: 'social_selling',
    label: 'Vendas via Direct e WhatsApp',
    temSubcampo: false,
  },
  {
    id: 'reativacao_antigos',
    label: 'Reativação de pacientes antigos',
    temSubcampo: false,
  },
  {
    id: 'desafios_grupos',
    label: 'Desafios e grupos de emagrecimento',
    temSubcampo: false,
  },
  {
    id: 'trafego_pago',
    label: 'Tráfego pago / anúncios patrocinados',
    temSubcampo: false,
  },
  {
    id: 'parcerias_medicas',
    label: 'Parcerias estratégicas e indicações médicas',
    temSubcampo: true,
    subcampoTipo: 'parceiro',
  },
  {
    id: 'eventos_presenciais',
    label: 'Eventos presenciais ou online',
    temSubcampo: false,
  },
  {
    id: 'busca_video_curto',
    label: 'Plataformas de busca e vídeos curtos (TikTok e Google)',
    temSubcampo: false,
  },
  {
    id: 'nao_rastreado',
    label: 'Não sei / não lembro por onde essa pessoa chegou',
    temSubcampo: false,
  },
];

export function getCanalById(id: CanalOrigemId): CanalDef | undefined {
  return CANAIS_ORIGEM.find((c) => c.id === id);
}

export function getLabelCanalById(id: CanalOrigemId): string {
  return getCanalById(id)?.label ?? id;
}
