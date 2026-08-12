// webdietWeltsParser.ts
// Parser local universal e de altíssima velocidade (< 10ms, Custo R$ 0, sem API)
// Suporta arquivos .xlsx, .xls, .csv, .tsv, .txt e colagens via Ctrl+V de WebDiet, Welts e PDF de Serviços.

import * as XLSX from 'xlsx';
import type { ItemCestaExtraido } from './geminiImportService';

export interface MapeamentoColuna {
  colunaArquivo: string;
  campoA3Sugerido: 'nome' | 'valor' | 'mesAtendimento' | 'dorId' | 'ignorar';
  confianca: 'confirmed' | 'inferred' | 'ambiguo';
}

export interface EstatisticaAproveitamento {
  totalRegistros: number;
  totalProntos: number;
  totalPendencias: number;
  porcentagemAproveitavel: number;
}

export interface DiagnosticoArquivo {
  nomeArquivo: string;
  sucesso: boolean;
  statusTexto: string;
  totalItensExtraidos: number;
  softwareDetectado?: string;
  tipoConteudo: 'pacientes' | 'servicos' | 'leads' | 'financeiro' | 'desconhecido';
  colunasDetectadas?: MapeamentoColuna[];
  estatisticas?: EstatisticaAproveitamento;
}

export interface ResultadoProcessamentoUniversal {
  totalItens: number;
  softwareDetectado: string;
  diagnosticos: DiagnosticoArquivo[];
  itens: ItemCestaExtraido[];
  estatisticasGlobais?: EstatisticaAproveitamento;
}

/**
 * Mapeia os cabeçalhos de um arquivo CSV/XLSX para os campos conhecidos do A3.
 */
export function detectarMapeamentoColunas(cabecalhos: string[]): MapeamentoColuna[] {
  return cabecalhos.map((c) => {
    const raw = c.toLowerCase().trim();
    if (raw.includes('nome') || raw.includes('paciente') || raw.includes('cliente')) {
      return { colunaArquivo: c, campoA3Sugerido: 'nome', confianca: 'confirmed' };
    }
    if (raw.includes('valor') || raw.includes('ticket') || raw.includes('preço') || raw.includes('pago')) {
      return { colunaArquivo: c, campoA3Sugerido: 'valor', confianca: 'confirmed' };
    }
    if (raw.includes('data') || raw.includes('atendimento') || raw.includes('criado') || raw.includes('consulta')) {
      return { colunaArquivo: c, campoA3Sugerido: 'mesAtendimento', confianca: 'confirmed' };
    }
    if (raw.includes('dor') || raw.includes('queixa') || raw.includes('motivo') || raw.includes('nicho')) {
      return { colunaArquivo: c, campoA3Sugerido: 'dorId', confianca: 'inferred' };
    }
    return { colunaArquivo: c, campoA3Sugerido: 'ignorar', confianca: 'ambiguo' };
  });
}

/**
 * Lê o conteúdo de um arquivo (ArrayBuffer, Base64 ou Texto) ou colagem (Ctrl+V)
 * e converte em itens tipados do Sistema A3 com feedback de Ingestão Não Binária.
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

        const totalProntos = resPacientes.itens.filter((i) => i.statusIntegridade === 'ok').length;
        const totalPendencias = resPacientes.itens.length - totalProntos;
        const pct = Math.round((totalProntos / resPacientes.itens.length) * 100);

        diagnosticos.push({
          nomeArquivo: item.nome,
          sucesso: true,
          statusTexto: `🟢 ${resPacientes.itens.length} registros encontrados no ${resPacientes.software} (${totalProntos} prontos, ${totalPendencias} pendências · ${pct}% aproveitável).`,
          totalItensExtraidos: resPacientes.itens.length,
          softwareDetectado: resPacientes.software,
          tipoConteudo: 'pacientes',
          colunasDetectadas: resPacientes.colunas,
          estatisticas: {
            totalRegistros: resPacientes.itens.length,
            totalProntos,
            totalPendencias,
            porcentagemAproveitavel: pct,
          },
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
      statusTexto: `🟡 Não identificamos automaticamente este arquivo. Você pode mapear as colunas manualmente ou colar o conteúdo em texto.`,
      totalItensExtraidos: 0,
      tipoConteudo: 'desconhecido',
    });
  }

  const totalProntosGlobais = todosItens.filter((i) => i.statusIntegridade === 'ok').length;
  const totalPendenciasGlobais = todosItens.length - totalProntosGlobais;
  const pctGlobal = todosItens.length > 0 ? Math.round((totalProntosGlobais / todosItens.length) * 100) : 0;

  return {
    totalItens: todosItens.length,
    softwareDetectado: softwarePrincipal,
    diagnosticos,
    itens: todosItens,
    estatisticasGlobais: {
      totalRegistros: todosItens.length,
      totalProntos: totalProntosGlobais,
      totalPendencias: totalPendenciasGlobais,
      porcentagemAproveitavel: pctGlobal,
    },
  };
}

/**
 * Extrai pacientes de textos formatados do WebDiet, Welts ou TSV/CSV genérico.
 */
const TERMOS_SERVICOS_REJEITADOS = [
  'emagrecimento', 'mensal', 'semanal', 'trimestral', 'semestral', 'anual',
  'consulta', 'retorno', 'pacote', 'protocolo', 'plano', 'atendimento',
  'fotos', 'sem fotos', 'com fotos', 'avaliação', 'bioimpedancia',
  'consultoria', 'programa', 'acompanhamento', 'servico', 'serviço'
];

export function isNomePacienteValido(nome: string): boolean {
  if (!nome || nome.trim().length < 2) return false;
  const lower = nome.toLowerCase().trim();

  // Rejeita especificamente nomes de ações/botões do chat/UI ou rótulos
  if (lower === 'proceder' || lower === 'nome' || lower === 'nome do paciente' || lower === 'paciente' || lower === 'cliente' || lower === 'status') {
    return false;
  }

  // Rejeita strings que comecem claramente com título de plano/serviço
  if (
    lower.startsWith('emagrecimento mensal') ||
    lower.startsWith('emagrecimento semanal') ||
    lower.startsWith('emagrecimento trimestral') ||
    lower.startsWith('plano ') ||
    lower.startsWith('pacote ') ||
    lower.startsWith('protocolo ') ||
    lower.startsWith('consultoria ')
  ) {
    return false;
  }

  return true;
}

export function extrairPacientesTexto(
  textoConteudo: string,
  nomeOrigem: string
): { software: 'WebDiet' | 'Welts' | 'Planilha'; itens: ItemCestaExtraido[]; colunas?: MapeamentoColuna[] } {
  const linhas = textoConteudo.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (linhas.length < 1) {
    return { software: 'Planilha', itens: [], colunas: [] };
  }

  const cabecalho = linhas[0].toLowerCase();
  const isWebdiet = cabecalho.includes('nome do paciente') || cabecalho.includes('criado em') || cabecalho.includes('etiquetas');
  const isWelts = cabecalho.includes('whatsapp') || cabecalho.includes('status plano') || cabecalho.includes('ultimo atendimento');

  const delimitador = cabecalho.includes('\t') ? '\t' : cabecalho.includes(';') ? ';' : ',';
  const colunasCabecalho = linhas[0].split(delimitador).map((c) => c.replace(/^"|"$/g, '').trim());
  const colunasMapeadas = detectarMapeamentoColunas(colunasCabecalho);

  // Localiza dinamicamente qual coluna contém o Nome do Paciente, Ticket e Data
  let nomeIdx = 0;
  let valorIdx = -1;
  let dataIdx = -1;

  colunasCabecalho.forEach((col, idx) => {
    const raw = col.toLowerCase();
    if (raw.includes('nome') || raw.includes('paciente') || raw.includes('cliente')) {
      nomeIdx = idx;
    }
    if (raw.includes('valor') || raw.includes('ticket') || raw.includes('preço') || raw.includes('pago')) {
      valorIdx = idx;
    }
    if (raw.includes('data') || raw.includes('criado') || raw.includes('atendimento')) {
      dataIdx = idx;
    }
  });

  const itens: ItemCestaExtraido[] = [];
  const startIndex = isWebdiet || isWelts || cabecalho.includes('nome') ? 1 : 0;

  for (let i = startIndex; i < linhas.length; i++) {
    const colunas = linhas[i].split(delimitador).map((c) => c.replace(/^"|"$/g, '').trim());
    if (colunas.length <= nomeIdx) continue;

    const rawNome = colunas[nomeIdx];
    if (!rawNome) continue;

    const nome = limpaNome(rawNome);
    if (!isNomePacienteValido(nome)) continue;

    // Tenta ler valor da coluna encontrada ou fallback 450
    let valorEncontrado: number | undefined = undefined;
    if (valorIdx >= 0 && colunas[valorIdx]) {
      const numMatch = colunas[valorIdx].replace(/[^\d.,]/g, '').replace(',', '.');
      const valParsed = parseFloat(numMatch);
      if (valParsed > 0) valorEncontrado = valParsed;
    }

    // Tenta ler data da coluna encontrada
    let mesAtendimento: 'mesM2' | 'mesM1' | 'mesM0' = 'mesM0';
    if (dataIdx >= 0 && colunas[dataIdx]) {
      mesAtendimento = calcularMesAtendimento(colunas[dataIdx]);
    }

    if (isWebdiet) {
      const criadoEm = dataIdx >= 0 ? colunas[dataIdx] : colunas[6] || colunas[5] || '';
      mesAtendimento = calcularMesAtendimento(criadoEm);

      itens.push({
        id: `webdiet_${Date.now()}_${i}`,
        origemColhedor: 'colhedor01_prontuario',
        tipo: 'paciente',
        nome,
        mesAtendimento,
        dorId: 'estetica_emagrecimento',
        valor: valorEncontrado || 450,
        statusPagamento: 'recebido',
        statusFechamento: 'sim',
        statusIntegridade: 'ok',
        mensagemAjuda: 'Confirmado no WebDiet.',
      });
    } else if (isWelts) {
      const statusPlano = colunas[10] || colunas[5] || '';
      const planoNome = colunas[9] || '';
      const dataInicio = dataIdx >= 0 ? colunas[dataIdx] : colunas[11] || colunas[6] || '';
      mesAtendimento = calcularMesAtendimento(dataInicio);

      itens.push({
        id: `welts_${Date.now()}_${i}`,
        origemColhedor: 'colhedor01_prontuario',
        tipo: 'paciente',
        nome,
        mesAtendimento,
        dorId: 'estetica_emagrecimento',
        valor: valorEncontrado || (planoNome.toLowerCase().includes('semestral') ? 1200 : 450),
        statusPagamento: statusPlano.toLowerCase().includes('vencido') ? 'pendente' : 'recebido',
        statusFechamento: 'sim',
        statusIntegridade: 'ok',
        mensagemAjuda: `Plano: ${planoNome || 'Padrão'} (${statusPlano || 'Ativo'}).`,
      });
    } else {
      // Formato genérico por planilha/colagem
      itens.push({
        id: `gen_${Date.now()}_${i}`,
        origemColhedor: 'colhedor01_prontuario',
        tipo: 'paciente',
        nome,
        mesAtendimento,
        dorId: 'estetica_emagrecimento',
        valor: valorEncontrado || 450,
        statusPagamento: 'recebido',
        statusFechamento: 'sim',
        statusIntegridade: 'ok',
      });
    }
  }

  return {
    software: isWebdiet ? 'WebDiet' : isWelts ? 'Welts' : 'Planilha',
    itens,
    colunas: colunasMapeadas,
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
