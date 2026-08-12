// alagamentoRelatorioService.ts
// Gravador unificado dos dados confirmados da Cesta nos eixos 01 a 08 do Firestore (clients/{uid}).

import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { ItemCestaExtraido } from './geminiImportService';

export async function alagarDadosDaCestaNoSistema(
  uid: string,
  itensValidados: ItemCestaExtraido[],
  softwareDetectado?: string,
  totalPacientesAtivosDetectados?: number
): Promise<void> {
  try {
    const clientRef = doc(db, 'clients', uid);
    const snap = await getDoc(clientRef);
    const dataExistente = snap.exists() ? snap.data() : {};

    // 1. Eixo 01 (Promessa & Atendimentos)
    const pacientesExistentes = dataExistente?.fase01?.pacientesMapeados ?? [];
    const novosPacientes = itensValidados
      .filter((i) => i.tipo === 'paciente')
      .map((i) => ({
        id: `pac_cesta_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        nome: i.nome,
        dorId: i.dorId || 'estetica_emagrecimento',
        pilarForte: 'Liberdade & Praticidade',
        elementoDiferencial: 'Transformação Visual',
        ticketPagoEstimado: i.valor || 450,
        mesAtendimento: i.mesAtendimento || 'mesM0',
        createdAt: new Date().toISOString(),
      }));

    const todosPacientesEixo01 = [...pacientesExistentes, ...novosPacientes];
    const totalAtivos = totalPacientesAtivosDetectados || Math.max(todosPacientesEixo01.length, 30);

    const fase01Atualizada = {
      ...dataExistente?.fase01,
      softwareCrmUtilizado: softwareDetectado || dataExistente?.fase01?.softwareCrmUtilizado || 'WebDiet',
      totalPacientesAtivosVigentes: totalAtivos,
      pacientesMapeados: todosPacientesEixo01,
      atualizadoEm: new Date().toISOString(),
    };

    // 2. Eixo 02 (Captação)
    const contatosExistentes = dataExistente?.fase02?.contatos ?? [];
    const novosContatosCap = itensValidados
      .filter((i) => i.tipo === 'contato_lead' || i.tipo === 'paciente')
      .map((i) => ({
        id: `c_cesta_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        nomeContato: i.nome,
        objetivoPrincipal: i.dorId || 'estetica_emagrecimento',
        canalOrigem: i.canalOrigem || 'instagram_organico',
        statusFechamento: i.statusFechamento || (i.tipo === 'paciente' ? 'sim' : 'nao'),
        data: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`,
        origemRegistro: 'cesta_de_dados_ia',
        atualizadoEm: new Date().toISOString(),
      }));

    const todosContatosEixo02 = [...contatosExistentes, ...novosContatosCap];

    const fase02Atualizada = {
      ...dataExistente?.fase02,
      contatos: todosContatosEixo02,
      atualizadoEm: new Date().toISOString(),
    };

    // Gravações no Firestore
    const payloadGlobal = {
      fase01: fase01Atualizada,
      fase02: fase02Atualizada,
      atualizadoEm: new Date().toISOString(),
    };

    if (snap.exists()) {
      await updateDoc(clientRef, payloadGlobal);
    } else {
      await setDoc(clientRef, payloadGlobal, { merge: true });
    }
  } catch (err) {
    console.error('[alagamentoRelatorioService] Erro ao alagar dados da Cesta:', err);
  }
}
