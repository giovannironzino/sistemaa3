// webdietWeltsParser.ts
// Parser local ultra-rápido (< 10ms, Custo R$ 0, sem API) para relatórios do WebDiet e Welts.

import type { ItemCestaExtraido } from './geminiImportService';

/**
 * Lê o conteúdo em texto plano do relatório do WebDiet ou Welts e converte em itens tipados da Cesta A3.
 */
export function processarRelatorioLocal(
  textoConteudo: string,
  nomeArquivo: string
): { totalLidos: number; software: 'WebDiet' | 'Welts' | 'Desconhecido'; itens: ItemCestaExtraido[] } {
  const linhas = textoConteudo.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (linhas.length < 2) {
    return { totalLidos: 0, software: 'Desconhecido', itens: [] };
  }

  const cabecalho = linhas[0].toLowerCase();
  const isWebdiet = cabecalho.includes('nome do paciente') || cabecalho.includes('criado em') || cabecalho.includes('etiquetas');
  const isWelts = cabecalho.includes('whatsapp') || cabecalho.includes('status plano') || cabecalho.includes('ultimo atendimento');

  const delimitador = cabecalho.includes('\t') ? '\t' : cabecalho.includes(';') ? ';' : ',';
  const itens: ItemCestaExtraido[] = [];

  for (let i = 1; i < linhas.length; i++) {
    const colunas = linhas[i].split(delimitador).map((c) => c.replace(/^"|"$/g, '').trim());
    if (colunas.length < 2 || !colunas[0]) continue;

    const nome = colunas[0];

    if (isWebdiet) {
      // Estrutura WebDiet: Nome, CPF, Telefone, Email, Nasc, Modificado, Criado
      const criadoEm = colunas[6] || colunas[5] || '';
      const mesAtendimento = calcularMesAtendimento(criadoEm);

      itens.push({
        id: `webdiet_${Date.now()}_${i}`,
        origemColhedor: 'colhedor01_prontuario',
        tipo: 'paciente',
        nome: limpaNome(nome),
        mesAtendimento,
        dorId: 'estetica_emagrecimento', // Padrão editável inline
        valor: 450,
        statusPagamento: 'recebido',
        statusFechamento: 'sim',
        statusIntegridade: 'ok',
        mensagemAjuda: 'Importado do WebDiet. Ajuste a dor principal se necessário.',
      });
    } else if (isWelts) {
      // Estrutura Welts: NOME, APELIDO, WHATSAPP, ESTADO, CIDADE, STATUS, DATA DE CADASTRADO, ...
      const statusPlano = colunas[10] || colunas[5] || '';
      const planoNome = colunas[9] || '';
      const dataInicio = colunas[11] || colunas[6] || '';
      const mesAtendimento = calcularMesAtendimento(dataInicio);

      itens.push({
        id: `welts_${Date.now()}_${i}`,
        origemColhedor: 'colhedor01_prontuario',
        tipo: 'paciente',
        nome: limpaNome(nome),
        mesAtendimento,
        dorId: 'estetica_emagrecimento',
        valor: planoNome.toLowerCase().includes('semestral') ? 1200 : 450,
        statusPagamento: statusPlano.toLowerCase().includes('vencido') ? 'pendente' : 'recebido',
        statusFechamento: 'sim',
        statusIntegridade: 'ok',
        mensagemAjuda: `Plano: ${planoNome || 'Padrão'} (${statusPlano || 'Ativo'}).`,
      });
    }
  }

  return {
    totalLidos: itens.length,
    software: isWebdiet ? 'WebDiet' : isWelts ? 'Welts' : 'Desconhecido',
    itens,
  };
}

function limpaNome(raw: string): string {
  // Remove sufixos de mãe/pai como " - Viviane (Mãe)" se desejar ou limpa espaços
  return raw.trim();
}

function calcularMesAtendimento(dataStr: string): 'mesM2' | 'mesM1' | 'mesM0' {
  if (!dataStr) return 'mesM0';
  const hoje = new Date();
  const mesAtual = hoje.getMonth(); // 0-11

  let mesData = mesAtual;
  if (dataStr.includes('/')) {
    const partes = dataStr.split('/');
    if (partes.length >= 2) {
      mesData = parseInt(partes[1], 10) - 1;
    }
  } else if (dataStr.includes('-')) {
    const partes = dataStr.split('-');
    if (partes.length >= 2) {
      mesData = parseInt(partes[1], 10) - 1;
    }
  }

  const dif = (mesAtual - mesData + 12) % 12;
  if (dif === 0) return 'mesM0'; // Julho
  if (dif === 1) return 'mesM1'; // Junho
  return 'mesM2'; // Maio / anterior
}
