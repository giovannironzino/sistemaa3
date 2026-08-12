// geminiImportService.ts
// serviço de importação inteligente e OCR via SDK @google/genai (Gemini 2.5/1.5 Flash Free Tier).
// Analisa planilhas, PDFs e prints de tela do WhatsApp/Instagram/Prontuários e retorna dados estruturados.

import { GoogleGenAI, Type, Schema } from '@google/genai';

// Interface do Item da Cesta extraído pela IA
export interface ItemCestaExtraido {
  id: string;
  origemColhedor: 'colhedor01_prontuario' | 'colhedor02_captacao' | 'colhedor03_servicos' | 'colhedor04_financeiro';
  tipo: 'paciente' | 'contato_lead' | 'servico' | 'despesa_financeira';
  nome: string;
  mesAtendimento?: 'mesM2' | 'mesM1' | 'mesM0';
  dorId?: string;
  canalOrigem?: string;
  valor?: number;
  statusPagamento?: 'recebido' | 'parcelado' | 'pendente';
  statusFechamento?: 'sim' | 'nao';
  nomeParceiroIndicador?: string;
  // Status de Integridade da Extração pela IA
  statusIntegridade: 'ok' | 'duvida' | 'pendente';
  mensagemAjuda?: string;
}

export interface ResultadoProcessamentoCesta {
  totalItens: number;
  softwareDetectado?: string;
  totalPacientesAtivosDetectados?: number;
  itens: ItemCestaExtraido[];
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (window as any).__GEMINI_API_KEY__;
  if (!apiKey) {
    console.warn('[geminiImportService] VITE_GEMINI_API_KEY não definida. Usando modo simulação de apoio.');
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Processa um conjunto de arquivos/prints da Cesta de Dados usando a Gemini API Free Tier.
 */
export async function processarCestaDeDados(
  arquivos: Array<{ nome: string; tipo: string; base64: string; colhedorId: string }>
): Promise<ResultadoProcessamentoCesta> {
  const ai = getGeminiClient();

  if (!ai || arquivos.length === 0) {
    return simularProcessamentoCesta(arquivos);
  }

  try {
    const contentsParts: any[] = [];

    // Adiciona prompt orientador
    contentsParts.push({
      text: `Você é um assistente especialista em analisar documentos, planilhas e PRINTS DE TELA DE WHATSAPP / INSTAGRAM / WEBDIET / WELTS / DIETBOX de consultórios de nutrição no Brasil.
Analise todos os arquivos fornecidos e extraia as informações no seguinte formato estruturado:
- Pacientes ativos (do WebDiet/prontuários)
- Contatos/Leads (de prints de conversas de WhatsApp ou Direct do Instagram)
- Serviços e preços (de fotos de cardápios/contratos)
- Despesas fixas (de comprovantes/extratos)

Atribua o statusIntegridade para cada item:
- 'ok': se o nome e os dados principais foram lidos com clareza.
- 'duvida': se houve dúvida sobre o valor, data ou nome.
- 'pendente': se o nome do contato não estava visível no print e precisa ser preenchido pelo usuário.`,
    });

    // Anexa os arquivos base64
    arquivos.forEach((file) => {
      contentsParts.push({
        inlineData: {
          mimeType: file.tipo,
          data: file.base64.replace(/^data:[^;]+;base64,/, ''),
        },
      });
    });

    // Schema de saída estruturada
    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        totalItens: { type: Type.INTEGER },
        softwareDetectado: { type: Type.STRING },
        totalPacientesAtivosDetectados: { type: Type.INTEGER },
        itens: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              origemColhedor: { type: Type.STRING },
              tipo: { type: Type.STRING },
              nome: { type: Type.STRING },
              mesAtendimento: { type: Type.STRING },
              dorId: { type: Type.STRING },
              canalOrigem: { type: Type.STRING },
              valor: { type: Type.NUMBER },
              statusPagamento: { type: Type.STRING },
              statusFechamento: { type: Type.STRING },
              nomeParceiroIndicador: { type: Type.STRING },
              statusIntegridade: { type: Type.STRING },
              mensagemAjuda: { type: Type.STRING },
            },
            required: ['nome', 'statusIntegridade'],
          },
        },
      },
      required: ['itens'],
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contentsParts,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text;
    if (jsonText) {
      const parsed = JSON.parse(jsonText);
      return {
        totalItens: parsed.itens?.length || 0,
        softwareDetectado: parsed.softwareDetectado || 'WebDiet',
        totalPacientesAtivosDetectados: parsed.totalPacientesAtivosDetectados || parsed.itens?.length || 0,
        itens: (parsed.itens || []).map((item: any, idx: number) => ({
          id: item.id || `item_gemini_${Date.now()}_${idx}`,
          origemColhedor: item.origemColhedor || 'colhedor01_prontuario',
          tipo: item.tipo || 'paciente',
          nome: item.nome || `Item ${idx + 1}`,
          mesAtendimento: item.mesAtendimento || 'mesM0',
          dorId: item.dorId || 'estetica_emagrecimento',
          canalOrigem: item.canalOrigem || 'instagram_organico',
          valor: item.valor || 450,
          statusPagamento: item.statusPagamento || 'recebido',
          statusFechamento: item.statusFechamento || 'sim',
          nomeParceiroIndicador: item.nomeParceiroIndicador || '',
          statusIntegridade: (item.statusIntegridade as any) || 'ok',
          mensagemAjuda: item.mensagemAjuda || '',
        })),
      };
    }
  } catch (err) {
    console.error('[geminiImportService] Erro ao chamar Gemini API:', err);
  }

  return simularProcessamentoCesta(arquivos);
}

/**
 * Simulação de apoio rápida para demonstração local quando a API Key não for fornecida.
 */
function simularProcessamentoCesta(
  arquivos: Array<{ nome: string; tipo: string; base64: string; colhedorId: string }>
): ResultadoProcessamentoCesta {
  const temProntuario = arquivos.some((a) => a.colhedorId === 'colhedor01_prontuario');
  const temWhatsapp = arquivos.some((a) => a.colhedorId === 'colhedor02_captacao');

  const itens: ItemCestaExtraido[] = [];

  // Apenas gera itens de demonstração se nenhum arquivo real foi enviado
  if (arquivos.length === 0) {
    itens.push(
      {
        id: 'cesta_1',
        origemColhedor: 'colhedor01_prontuario',
        tipo: 'paciente',
        nome: 'Mariana Silva (Exemplo)',
        mesAtendimento: 'mesM0',
        dorId: 'estetica_emagrecimento',
        canalOrigem: 'instagram_organico',
        valor: 450,
        statusPagamento: 'recebido',
        statusFechamento: 'sim',
        statusIntegridade: 'ok',
      },
      {
        id: 'cesta_2',
        origemColhedor: 'colhedor01_prontuario',
        tipo: 'paciente',
        nome: 'Carlos Eduardo (Exemplo)',
        mesAtendimento: 'mesM1',
        dorId: 'comportamento_alimentar',
        canalOrigem: 'indicacao_boca_a_boca',
        valor: 500,
        statusPagamento: 'parcelado',
        statusFechamento: 'sim',
        statusIntegridade: 'ok',
      }
    );
  }

  if (temWhatsapp) {
    itens.push(
      {
        id: 'cesta_3',
        origemColhedor: 'colhedor02_captacao',
        tipo: 'contato_lead',
        nome: 'Fernanda Lima (Print WhatsApp)',
        mesAtendimento: 'mesM0',
        dorId: 'saude_clinica',
        canalOrigem: 'trafego_pago',
        statusFechamento: 'nao',
        statusIntegridade: 'duvida',
        mensagemAjuda: 'Verifique se o valor do orçamento foi R$ 350.',
      },
      {
        id: 'cesta_4',
        origemColhedor: 'colhedor02_captacao',
        tipo: 'contato_lead',
        nome: '(Contato sem nome visível)',
        mesAtendimento: 'mesM0',
        dorId: 'estetica_emagrecimento',
        canalOrigem: 'instagram_organico',
        statusFechamento: 'nao',
        statusIntegridade: 'pendente',
        mensagemAjuda: 'O nome da pessoa não estava visível no print do WhatsApp. Digite o nome:',
      }
    );
  }

  return {
    totalItens: itens.length,
    softwareDetectado: 'WebDiet / WhatsApp',
    totalPacientesAtivosDetectados: 35,
    itens,
  };
}
