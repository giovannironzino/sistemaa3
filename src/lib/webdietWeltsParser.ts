// webdietWeltsParser.ts
// Parser local universal e de altíssima velocidade (< 10ms, Custo R$ 0, sem API)
// Suporta arquivos .xlsx, .xls, .csv, .tsv, .txt e colagens via Ctrl+V de WebDiet, Welts e PDF de Serviços.

import * as XLSX from 'xlsx';
import type { ItemCestaExtraido } from './geminiImportService';

export interface DiagnosticoArquivo {
  nomeArquivo: string;
  sucesso: boolean;
  statusTexto: string;
  totalItensExtraidos: number;
  softwareDetectado?: string;
  tipoConteudo: 'pacientes' | 'servicos' | 'leads' | 'financeiro' | 'desconhecido';
}

export interface ResultadoProcessamentoUniversal {
  totalItens: number;
  softwareDetectado: string;
  diagnosticos: DiagnosticoArquivo[];
  itens: ItemCestaExtraido[];
}

/**
 * Lê o conteúdo de um arquivo (ArrayBuffer, Base64 ou Texto) ou colagem (Ctrl+V)
 * e converte em itens tipados do Sistema A3 com feedback em Linguagem Simples.
 */
export function processarConteudoUniversal(
  arquivosETextos: Array<{ nome: string; buffer?: ArrayBuffer; base64?: string; texto?: string; caixinhaId: string }>
): ResultadoProcessamentoUniversal {
  const todosItens: ItemCestaExtraido[] = [];
  const diagnosticos: DiagnosticoArquivo[] = [];
  let softwarePrincipal = 'WebDiet / Welts';

  for (const item of arquivosETextos) {
    let textoPlanilha = item.texto || '';

    // 1. Se for arquivo Excel (.xlsx, .xls) ou ArrayBuffer, extrai via SheetJS
    if (item.buffer || (item.nome && (item.nome.endsWith('.xlsx') || item.nome.endsWith('.xls')))) {
      try {
        let wb: XLSX.WorkBook;
        if (item.buffer) {
          wb = XLSX.read(item.buffer, { type: 'array' });
        } else if (item.base64) {
          const b64Data = item.base64.replace(/^data:[^;]+;base64,/, '');
          wb = XLSX.read(b64Data, { type: 'base64' });
        } else {
          wb = XLSX.read(item.texto || '', { type: 'string' });
        }

        const firstSheetName = wb.SheetNames[0];
        const worksheet = wb.Sheets[firstSheetName];
        textoPlanilha = XLSX.utils.sheet_to_csv(worksheet, { FS: '\t' });
      } catch (err) {
        console.warn('[webdietWeltsParser] Erro ao ler Excel via SheetJS:', err);
      }
    }

    // 2. Tenta extrair itens de Pacientes (WebDiet / Welts)
    if (textoPlanilha.trim().length > 0) {
      const resPacientes = extrairPacientesTexto(textoPlanilha, item.nome);
      if (resPacientes.itens.length > 0) {
        todosItens.push(...resPacientes.itens);
        softwarePrincipal = resPacientes.software;
        diagnosticos.push({
          nomeArquivo: item.nome,
          sucesso: true,
          statusTexto: `🟢 Identificamos ${resPacientes.itens.length} pacientes ativos no relatório do ${resPacientes.software}.`,
          totalItensExtraidos: resPacientes.itens.length,
          softwareDetectado: resPacientes.software,
          tipoConteudo: 'pacientes',
        });
        continue;
      }

      // 3. Tenta extrair Serviços de Tabela/PDF
      const resServicos = extrairServicosTexto(textoPlanilha, item.nome);
      if (resServicos.itens.length > 0) {
        todosItens.push(...resServicos.itens);
        diagnosticos.push({
          nomeArquivo: item.nome,
          sucesso: true,
          statusTexto: `🟢 Identificamos ${resServicos.itens.length} serviços no cardápio/tabela de preços.`,
          totalItensExtraidos: resServicos.itens.length,
          tipoConteudo: 'servicos',
        });
        continue;
      }
    }

    // Se não conseguiu extrair texto do PDF ou arquivo
    diagnosticos.push({
      nomeArquivo: item.nome,
      sucesso: false,
      statusTexto: `🟡 O arquivo "${item.nome}" não continha texto selecionável (como um PDF digitalizado ou imagem). Experimente colar o conteúdo em texto ou enviar como print de tela.`,
      totalItensExtraidos: 0,
      tipoConteudo: 'desconhecido',
    });
  }

  return {
    totalItens: todosItens.length,
    softwareDetectado: softwarePrincipal,
    diagnosticos,
    itens: todosItens,
  };
}

/**
 * Extrai pacientes de textos formatados do WebDiet, Welts ou TSV/CSV genérico.
 */
export function extrairPacientesTexto(
  textoConteudo: string,
  nomeOrigem: string
): { software: 'WebDiet' | 'Welts' | 'Planilha'; itens: ItemCestaExtraido[] } {
  const linhas = textoConteudo.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (linhas.length < 1) {
    return { software: 'Planilha', itens: [] };
  }

  const cabecalho = linhas[0].toLowerCase();
  const isWebdiet = cabecalho.includes('nome do paciente') || cabecalho.includes('criado em') || cabecalho.includes('etiquetas');
  const isWelts = cabecalho.includes('whatsapp') || cabecalho.includes('status plano') || cabecalho.includes('ultimo atendimento');

  const delimitador = cabecalho.includes('\t') ? '\t' : cabecalho.includes(';') ? ';' : ',';
  const itens: ItemCestaExtraido[] = [];

  const startIndex = isWebdiet || isWelts ? 1 : 0;

  for (let i = startIndex; i < linhas.length; i++) {
    const colunas = linhas[i].split(delimitador).map((c) => c.replace(/^"|"$/g, '').trim());
    if (colunas.length === 0 || !colunas[0]) continue;

    const nome = limpaNome(colunas[0]);
    // Evita ler cabeçalho ou linhas vazias
    if (nome.toLowerCase() === 'nome' || nome.toLowerCase() === 'nome do paciente') continue;

    if (isWebdiet) {
      const criadoEm = colunas[6] || colunas[5] || '';
      const mesAtendimento = calcularMesAtendimento(criadoEm);

      itens.push({
        id: `webdiet_${Date.now()}_${i}`,
        origemColhedor: 'colhedor01_prontuario',
        tipo: 'paciente',
        nome,
        mesAtendimento,
        dorId: 'estetica_emagrecimento',
        valor: 450,
        statusPagamento: 'recebido',
        statusFechamento: 'sim',
        statusIntegridade: 'ok',
        mensagemAjuda: 'Importado do WebDiet. Ajuste a dor principal se necessário.',
      });
    } else if (isWelts) {
      const statusPlano = colunas[10] || colunas[5] || '';
      const planoNome = colunas[9] || '';
      const dataInicio = colunas[11] || colunas[6] || '';
      const mesAtendimento = calcularMesAtendimento(dataInicio);

      itens.push({
        id: `welts_${Date.now()}_${i}`,
        origemColhedor: 'colhedor01_prontuario',
        tipo: 'paciente',
        nome,
        mesAtendimento,
        dorId: 'estetica_emagrecimento',
        valor: planoNome.toLowerCase().includes('semestral') ? 1200 : 450,
        statusPagamento: statusPlano.toLowerCase().includes('vencido') ? 'pendente' : 'recebido',
        statusFechamento: 'sim',
        statusIntegridade: 'ok',
        mensagemAjuda: `Plano: ${planoNome || 'Padrão'} (${statusPlano || 'Ativo'}).`,
      });
    } else {
      // Formato genérico por linhas/colagem
      itens.push({
        id: `gen_${Date.now()}_${i}`,
        origemColhedor: 'colhedor01_prontuario',
        tipo: 'paciente',
        nome,
        mesAtendimento: 'mesM0',
        dorId: 'estetica_emagrecimento',
        valor: 450,
        statusPagamento: 'recebido',
        statusFechamento: 'sim',
        statusIntegridade: 'ok',
      });
    }
  }

  return {
    software: isWebdiet ? 'WebDiet' : isWelts ? 'Welts' : 'Planilha',
    itens,
  };
}

/**
 * Extrai serviços de um catálogo em texto/PDF.
 */
export function extrairServicosTexto(
  textoConteudo: string,
  nomeOrigem: string
): { itens: ItemCestaExtraido[] } {
  const linhas = textoConteudo.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const itens: ItemCestaExtraido[] = [];

  linhas.forEach((linha, idx) => {
    // Procura por linhas que pareçam serviços (ex: "Consulta R$ 350" ou "Acompanhamento Trimestral")
    if (linha.toLowerCase().includes('consulta') || linha.toLowerCase().includes('plano') || linha.toLowerCase().includes('programa') || linha.includes('R$')) {
      const matchValor = linha.match(/R\$\s*([\d\.,]+)/i);
      const valor = matchValor ? parseFloat(matchValor[1].replace('.', '').replace(',', '.')) : 450;

      itens.push({
        id: `srv_${Date.now()}_${idx}`,
        origemColhedor: 'colhedor03_servicos',
        tipo: 'servico',
        nome: linha.replace(/R\$\s*[\d\.,]+/i, '').trim() || 'Acompanhamento Nutricional',
        valor,
        statusIntegridade: 'ok',
      });
    }
  });

  return { itens };
}

function limpaNome(raw: string): string {
  return raw.replace(/^["'\s]+|["'\s]+$/g, '').trim();
}

function calcularMesAtendimento(dataStr: string): 'mesM2' | 'mesM1' | 'mesM0' {
  if (!dataStr) return 'mesM0';
  const hoje = new Date();
  const mesAtual = hoje.getMonth();

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
  if (dif === 0) return 'mesM0';
  if (dif === 1) return 'mesM1';
  return 'mesM2';
}
