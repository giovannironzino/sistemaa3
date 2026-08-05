// calcularResumoCaptacao.ts
// Funções de cálculo puro do ResumoCaptacao a partir do array de contatos.

import {
  ContatoCaptacao,
  ResumoCaptacao,
  RankingCanal,
  TaxaConversaoCanal,
  RankingNome,
  CanalOrigemId,
} from '../fase02.types';
import { CANAIS_ORIGEM } from '../data/canaisOrigem';

// Ordem canônica dos 9 canais (para desempate no ranking de volume)
const CANAL_ORDER: CanalOrigemId[] = CANAIS_ORIGEM.map((c) => c.id);

export function calcularResumoCaptacao(contatos: ContatoCaptacao[]): ResumoCaptacao {
  const totalContatos = contatos.length;
  const totalConvertidos = contatos.filter((c) => c.statusFechamento === 'sim').length;
  const totalNaoConvertidos = totalContatos - totalConvertidos;
  const taxaConversaoGeral =
    totalContatos > 0
      ? Math.round((totalConvertidos / totalContatos) * 1000) / 10
      : 0;

  // Construir mapa por canal
  const mapCanal: Record<CanalOrigemId, { totalContatos: number; totalConvertidos: number }> =
    {} as any;
  for (const canalId of CANAL_ORDER) {
    mapCanal[canalId] = { totalContatos: 0, totalConvertidos: 0 };
  }
  for (const c of contatos) {
    mapCanal[c.canalOrigem].totalContatos += 1;
    if (c.statusFechamento === 'sim') {
      mapCanal[c.canalOrigem].totalConvertidos += 1;
    }
  }

  // rankingCanaisPorVolume — todos os 9, do maior pro menor volume
  // Empate: manter ordem da tabela 2.2 (CANAL_ORDER)
  const rankingCanaisPorVolume: RankingCanal[] = CANAL_ORDER.map((canalId) => ({
    canalOrigem: canalId,
    totalContatos: mapCanal[canalId].totalContatos,
    totalConvertidos: mapCanal[canalId].totalConvertidos,
  })).sort((a, b) => {
    if (b.totalContatos !== a.totalContatos) return b.totalContatos - a.totalContatos;
    return CANAL_ORDER.indexOf(a.canalOrigem) - CANAL_ORDER.indexOf(b.canalOrigem);
  });

  // taxaConversaoPorCanal — regra dos 10 leads
  const taxaConversaoPorCanal: TaxaConversaoCanal[] = CANAL_ORDER.map((canalId) => {
    const { totalContatos: tc, totalConvertidos: tconv } = mapCanal[canalId];
    const taxaConversao =
      tc >= 10 ? Math.round((tconv / tc) * 1000) / 10 : null;
    return { canalOrigem: canalId, taxaConversao, totalContatos: tc };
  });

  // canaisCampeoes — 3 canais com maior totalConvertidos (não volume)
  // Ignorar canais com 0 conversões
  const canaisCampeoes: CanalOrigemId[] = [...rankingCanaisPorVolume]
    .filter((r) => r.totalConvertidos > 0)
    .sort((a, b) => {
      if (b.totalConvertidos !== a.totalConvertidos)
        return b.totalConvertidos - a.totalConvertidos;
      return CANAL_ORDER.indexOf(a.canalOrigem) - CANAL_ORDER.indexOf(b.canalOrigem);
    })
    .slice(0, 3)
    .map((r) => r.canalOrigem);

  // topIndicadores
  const mapIndicadores: Record<string, { totalContatos: number; totalConvertidos: number }> = {};
  for (const c of contatos) {
    if (c.canalOrigem === 'indicacao_boca_a_boca' && c.sabeQuemIndicou === true && c.nomeIndicador) {
      const nome = c.nomeIndicador.trim();
      if (!mapIndicadores[nome]) mapIndicadores[nome] = { totalContatos: 0, totalConvertidos: 0 };
      mapIndicadores[nome].totalContatos += 1;
      if (c.statusFechamento === 'sim') mapIndicadores[nome].totalConvertidos += 1;
    }
  }
  const topIndicadores: RankingNome[] = Object.entries(mapIndicadores)
    .map(([nome, vals]) => ({ nome, ...vals }))
    .sort((a, b) => b.totalContatos - a.totalContatos);

  // topParceiros
  const mapParceiros: Record<string, { totalContatos: number; totalConvertidos: number }> = {};
  for (const c of contatos) {
    if (c.canalOrigem === 'parcerias_medicas' && c.sabeQualParceiro === true && c.nomeParceiro) {
      const nome = c.nomeParceiro.trim();
      if (!mapParceiros[nome]) mapParceiros[nome] = { totalContatos: 0, totalConvertidos: 0 };
      mapParceiros[nome].totalContatos += 1;
      if (c.statusFechamento === 'sim') mapParceiros[nome].totalConvertidos += 1;
    }
  }
  const topParceiros: RankingNome[] = Object.entries(mapParceiros)
    .map(([nome, vals]) => ({ nome, ...vals }))
    .sort((a, b) => b.totalContatos - a.totalContatos);

  // leadsMensaisMedia — janela de captação é de 90 dias ≈ 3 meses (mesma lógica de vendasMensaisMedia na Fase 04)
  const leadsMensaisMedia = totalContatos / 3;

  // canaisAtivos — extraído de rankingCanaisPorVolume, filtrando totalContatos > 0, preservando a ordem
  const canaisAtivos: CanalOrigemId[] = rankingCanaisPorVolume
    .filter((r) => r.totalContatos > 0)
    .map((r) => r.canalOrigem);

  return {
    totalContatos,
    totalConvertidos,
    totalNaoConvertidos,
    taxaConversaoGeral,
    rankingCanaisPorVolume,
    taxaConversaoPorCanal,
    canaisCampeoes,
    topIndicadores,
    topParceiros,
    leadsMensaisMedia,
    canaisAtivos,
  };
}
