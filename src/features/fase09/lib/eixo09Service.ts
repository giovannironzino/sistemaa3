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
