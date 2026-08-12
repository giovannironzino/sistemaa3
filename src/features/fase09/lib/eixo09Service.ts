// eixo09Service.ts
// Serviços de Firestore para o Eixo 09 (salvar premissas e guardar simulações)

import { doc, getDoc, updateDoc, setDoc, collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import type { Fase09Assumptions, ResumoSimulacaoEixo09, SimuladorState, ResultadoSimulado } from '../eixo09.types';

export const ASSUMPTIONS_DEFAULT: Fase09Assumptions = {
  minutosPacienteNovo: null,
  minutosPacienteAtivo: null,
  impostosPercentual: null,
  taxaCartaoPercentual: null,
  taxaAntecipacaoPercentual: null,
  totalPacientesInativos: null,
  temComunidadeAtiva: null,
  atualizadoEm: new Date().toISOString(),
};

/**
 * Carrega premissas temporárias salvas do Firestore: clients/{uid}.eixo09.premissas
 */
export async function carregarPremissasFase09(uid: string): Promise<Fase09Assumptions> {
  try {
    const clientDocRef = doc(db, 'clients', uid);
    const snap = await getDoc(clientDocRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data?.eixo09?.premissas) {
        return { ...ASSUMPTIONS_DEFAULT, ...data.eixo09.premissas };
      }
    }
  } catch (err) {
    console.error('[eixo09Service] Erro ao carregar premissas:', err);
  }
  return { ...ASSUMPTIONS_DEFAULT };
}

/**
 * Salva premissas temporárias no Firestore: clients/{uid}.eixo09.premissas
 */
export async function salvarPremissasFase09(uid: string, premissas: Fase09Assumptions): Promise<void> {
  try {
    const clientDocRef = doc(db, 'clients', uid);
    const snap = await getDoc(clientDocRef);
    const premissasAtualizadas = { ...premissas, atualizadoEm: new Date().toISOString() };

    if (snap.exists()) {
      await updateDoc(clientDocRef, { 'eixo09.premissas': premissasAtualizadas });
    } else {
      await setDoc(clientDocRef, { eixo09: { premissas: premissasAtualizadas } }, { merge: true });
    }
  } catch (err) {
    console.error('[eixo09Service] Erro ao salvar premissas:', err);
  }
}

/**
 * Salva uma nova simulação guardada em: clients/{uid}/eixo09_simulacoes/{id}
 */
export async function guardarSimulacaoFase09(
  uid: string,
  nomeExibicaoCustom: string | null,
  estado: SimuladorState,
  resultado: ResultadoSimulado
): Promise<ResumoSimulacaoEixo09> {
  const agora = new Date();
  const dateStr = agora.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  const timeStr = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const nomeAuto = `Simulação de ${dateStr} às ${timeStr}`;
  const nomeFinal = nomeExibicaoCustom && nomeExibicaoCustom.trim().length > 0
    ? nomeExibicaoCustom.trim()
    : nomeAuto;

  const id = crypto.randomUUID();
  const resumo: ResumoSimulacaoEixo09 = {
    id,
    nomeExibicao: nomeFinal,
    criadoEm: agora.toISOString(),
    favorita: false,
    estado: JSON.parse(JSON.stringify(estado)), // snapshot imutável
    resultado: { ...resultado },
  };

  try {
    const docRef = doc(db, 'clients', uid, 'eixo09_simulacoes', id);
    await setDoc(docRef, resumo);

    // Também atualizar premissas globais
    await salvarPremissasFase09(uid, estado.premissas);
  } catch (err) {
    console.error('[eixo09Service] Erro ao guardar simulação:', err);
  }

  return resumo;
}

/**
 * Carrega simulações guardadas em: clients/{uid}/eixo09_simulacoes
 */
export async function listarSimulacoesGuardadas(uid: string): Promise<ResumoSimulacaoEixo09[]> {
  try {
    const colRef = collection(db, 'clients', uid, 'eixo09_simulacoes');
    const snap = await getDocs(colRef);
    const lista: ResumoSimulacaoEixo09[] = [];
    snap.forEach((docSnap) => {
      lista.push(docSnap.data() as ResumoSimulacaoEixo09);
    });
    // Ordenar mais recentes primeiro
    lista.sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
    return lista;
  } catch (err) {
    console.error('[eixo09Service] Erro ao listar simulações:', err);
    return [];
  }
}

/**
 * Alterna status de favorita (máximo 3)
 */
export async function alternarFavoritaSimulacao(
  uid: string,
  simulacaoId: string,
  atualFavorita: boolean,
  todasGuardadas: ResumoSimulacaoEixo09[]
): Promise<{ sucesso: boolean; mensagem?: string }> {
  if (!atualFavorita) {
    const favoritedCount = todasGuardadas.filter((s) => s.favorita).length;
    if (favoritedCount >= 3) {
      return {
        sucesso: false,
        mensagem: 'Você já possui 3 simulações favoritas. Desmarque uma antes de favoritar esta.',
      };
    }
  }

  try {
    const docRef = doc(db, 'clients', uid, 'eixo09_simulacoes', simulacaoId);
    await updateDoc(docRef, { favorita: !atualFavorita });
    return { sucesso: true };
  } catch (err) {
    console.error('[eixo09Service] Erro ao favoritar simulação:', err);
    return { sucesso: false, mensagem: 'Erro ao atualizar favorita no banco.' };
  }
}

/**
 * Sincronização Global no Firestore (Full System Sync)
 * Atualiza simultaneamente os nós dos Eixos 04, 07, 08 e 09 no documento do cliente: clients/{uid}
 * Garantindo a retroalimentação total de todo o Sistema A3.
 */
/**
 * Sincronização Global no Firestore (Full System Hydration)
 * Atualiza simultaneamente os nós de todos os 9 Eixos (fase01 a fase09) no documento do cliente: clients/{uid}
 * Garantindo que a Coleta Única do Consultor popule 100% da plataforma A3.
 */
export async function salvarSincronizacaoGlobalClient(
  uid: string,
  dados: {
    fase01Data?: any;
    fase02Data?: any;
    fase03Data?: any;
    servicesEixo04?: any[];
    fase04Extra?: any;
    fase05Data?: any;
    fase06Data?: any;
    membrosEquipeEixo07?: any[];
    financeiroEixo08?: any;
    simuladorEixo09?: any;
  }
): Promise<void> {
  try {
    const clientDocRef = doc(db, 'clients', uid);
    const isoAgora = new Date().toISOString();
    const updates: Record<string, any> = {
      atualizadoEm: isoAgora,
    };

    if (dados.fase01Data) {
      Object.entries(dados.fase01Data).forEach(([k, v]) => {
        updates[`fase01.${k}`] = v;
      });
      updates['fase01.fase01Completa'] = true;
      updates['fase01.atualizadoEm'] = isoAgora;
    }

    if (dados.fase02Data) {
      Object.entries(dados.fase02Data).forEach(([k, v]) => {
        updates[`fase02.${k}`] = v;
      });
      updates['fase02.fase02Completa'] = true;
      updates['fase02.atualizadoEm'] = isoAgora;
    }

    if (dados.fase03Data) {
      Object.entries(dados.fase03Data).forEach(([k, v]) => {
        updates[`fase03.${k}`] = v;
      });
      updates['fase03.fase03Completa'] = true;
      updates['fase03.atualizadoEm'] = isoAgora;
    }

    if (dados.servicesEixo04) {
      updates['fase04.services'] = dados.servicesEixo04;
      if (dados.fase04Extra) {
        Object.entries(dados.fase04Extra).forEach(([k, v]) => {
          updates[`fase04.${k}`] = v;
        });
      }
      updates['fase04.fase04Completa'] = true;
      updates['fase04.atualizadoEm'] = isoAgora;
    }

    if (dados.fase05Data) {
      Object.entries(dados.fase05Data).forEach(([k, v]) => {
        updates[`fase05.${k}`] = v;
      });
      updates['fase05.fase05Completa'] = true;
      updates['fase05.atualizadoEm'] = isoAgora;
    }

    if (dados.fase06Data) {
      Object.entries(dados.fase06Data).forEach(([k, v]) => {
        updates[`fase06.${k}`] = v;
      });
      updates['fase06.fase06Completa'] = true;
      updates['fase06.atualizadoEm'] = isoAgora;
    }

    if (dados.membrosEquipeEixo07) {
      updates['fase07.membros'] = dados.membrosEquipeEixo07;
      const custoTotalEquipe = dados.membrosEquipeEixo07.reduce((acc, m) => acc + (Number(m.custoMensal) || 0), 0);
      updates['fase07.custoTotalEquipe'] = custoTotalEquipe;
      updates['fase07.fase07Completa'] = true;
      updates['fase07.atualizadoEm'] = isoAgora;
    }

    if (dados.financeiroEixo08) {
      Object.entries(dados.financeiroEixo08).forEach(([k, v]) => {
        updates[`fase08.${k}`] = v;
      });
      updates['fase08.fase08Completa'] = true;
      updates['fase08.atualizadoEm'] = isoAgora;
    }

    if (dados.simuladorEixo09) {
      updates['fase09'] = dados.simuladorEixo09;
      updates['fase09.fase09Completa'] = true;
      updates['fase09.atualizadoEm'] = isoAgora;
    }

    const snap = await getDoc(clientDocRef);
    if (snap.exists()) {
      await updateDoc(clientDocRef, updates);
    } else {
      await setDoc(clientDocRef, updates, { merge: true });
    }
  } catch (err) {
    console.error('[eixo09Service] Erro ao executar Full System Hydration no Firestore:', err);
  }
}


