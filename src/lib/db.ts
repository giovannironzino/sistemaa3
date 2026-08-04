import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, ClientProfile, ClientBlocks, Scenario, WeekPlan, MonthlyRitual } from '../types';
import { getInitialBlocks } from './initialData';

// Setup User Profile
export async function createUserProfile(uid: string, email: string, name: string, role: 'nutri' | 'consultor'): Promise<UserProfile> {
  const userProfile: UserProfile = {
    uid,
    email,
    name,
    role,
    status: 'active',
  };

  await setDoc(doc(db, 'users', uid), userProfile);

  if (role === 'nutri') {
    // Also initialize the client document
    const clientProfile: ClientProfile = {
      clientId: uid,
      clientName: name,
      clientEmail: email,
      status: 'active',
      linkedConsultorId: '', // initially empty, will link dynamically
      fase: 1,
      currentStep: 'retrato',
      call1CompletedAt: null,
      call2CompletedAt: null,
      call3CompletedAt: null,
      cenarioEscolhidoId: null,
      createdAt: new Date().toISOString(),
    };

    const initialBlocks = getInitialBlocks();

    await setDoc(doc(db, 'clients', uid), {
      profile: clientProfile,
      blocks: initialBlocks,
      comments: {},
      scenarios: {},
      weekPlans: {},
      monthlyRituals: []
    });
  }

  return userProfile;
}

// Get User Profile
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (snap.exists()) {
    return snap.data() as UserProfile;
  }
  return null;
}

// Get Client Record
export async function getClientRecord(clientId: string): Promise<any | null> {
  const snap = await getDoc(doc(db, 'clients', clientId));
  if (snap.exists()) {
    return snap.data();
  }
  return null;
}

// Update Client Profile Field
export async function updateClientProfile(clientId: string, updates: Partial<ClientProfile>): Promise<void> {
  const clientDocRef = doc(db, 'clients', clientId);
  const snap = await getDoc(clientDocRef);
  if (snap.exists()) {
    const data = snap.data();
    const currentProfile = data.profile || {};
    await updateDoc(clientDocRef, {
      profile: {
        ...currentProfile,
        ...updates
      }
    });

    // Also update in users collection
    if (updates.clientName || updates.status) {
      const userRef = doc(db, 'users', clientId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userUpdates: any = {};
        if (updates.clientName) userUpdates.name = updates.clientName;
        if (updates.status) userUpdates.status = updates.status;
        await updateDoc(userRef, userUpdates);
      }
    }
  }
}

export function removeUndefinedFields(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(removeUndefinedFields);
  }
  const cleanObj: any = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val !== undefined) {
      cleanObj[key] = removeUndefinedFields(val);
    }
  }
  return cleanObj;
}

// Update specific block data
export async function updateClientBlock(clientId: string, blockKey: string, blockData: any): Promise<void> {
  const clientDocRef = doc(db, 'clients', clientId);
  const cleanData = removeUndefinedFields(blockData);
  await updateDoc(clientDocRef, {
    [`blocks.${blockKey}`]: cleanData
  });
}

// Save all block data at once
export async function updateAllClientBlocks(clientId: string, blocks: ClientBlocks): Promise<void> {
  const clientDocRef = doc(db, 'clients', clientId);
  const cleanBlocks = removeUndefinedFields(blocks);
  await updateDoc(clientDocRef, {
    blocks: cleanBlocks
  });
}

// Save Consultant Comments
export async function saveConsultantComments(clientId: string, comments: Record<string, string>): Promise<void> {
  const clientDocRef = doc(db, 'clients', clientId);
  await updateDoc(clientDocRef, {
    comments: comments
  });
}

// Save Single Scenario
export async function saveClientScenario(clientId: string, scenario: Scenario): Promise<void> {
  const clientDocRef = doc(db, 'clients', clientId);
  await updateDoc(clientDocRef, {
    [`scenarios.${scenario.id}`]: scenario
  });
}

// Delete Single Scenario
export async function deleteClientScenario(clientId: string, scenarioId: string): Promise<void> {
  const clientDocRef = doc(db, 'clients', clientId);
  const snap = await getDoc(clientDocRef);
  if (snap.exists()) {
    const data = snap.data();
    const scenarios = { ...(data.scenarios || {}) };
    delete scenarios[scenarioId];
    await updateDoc(clientDocRef, { scenarios });
  }
}

// Save Week Plans (12-weeks)
export async function saveWeekPlan(clientId: string, weekIndex: number, weekPlan: WeekPlan): Promise<void> {
  const clientDocRef = doc(db, 'clients', clientId);
  await updateDoc(clientDocRef, {
    [`weekPlans.${weekIndex}`]: weekPlan
  });
}

// Update Monthly Rituals
export async function saveMonthlyRituals(clientId: string, rituals: MonthlyRitual[]): Promise<void> {
  const clientDocRef = doc(db, 'clients', clientId);
  await updateDoc(clientDocRef, {
    monthlyRituals: rituals
  });
}

// Set linked consultor
export async function linkClientToConsultor(clientId: string, consultorId: string): Promise<void> {
  await updateClientProfile(clientId, { linkedConsultorId: consultorId });
  // Also update user profile
  const userRef = doc(db, 'users', clientId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    await updateDoc(userRef, { linkedConsultorId: consultorId });
  }
}

// Stream clients for Consultant in real-time
export function streamConsultantClients(consultorId: string, callback: (clients: any[]) => void) {
  const q = collection(db, 'clients');
  return onSnapshot(q, (snapshot) => {
    const clients: any[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Allow consultant to see linked ones, or all of them so they can claim
      clients.push(data);
    });
    callback(clients);
  });
}

// Stream single client in real-time
export function streamClientRecord(clientId: string, callback: (clientRecord: any) => void) {
  const docRef = doc(db, 'clients', clientId);
  return onSnapshot(docRef, async (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data());
    } else {
      // Auto-heal: client record doesn't exist but user logged in. Create a fresh client record.
      console.log(`Auto-healing: clients record for ${clientId} not found. Attempting to create one.`);
      try {
        const userSnap = await getDoc(doc(db, 'users', clientId));
        if (userSnap.exists()) {
          const userData = userSnap.data() as UserProfile;
          const clientProfile: ClientProfile = {
            clientId,
            clientName: userData.name,
            clientEmail: userData.email,
            status: 'active',
            linkedConsultorId: userData.linkedConsultorId || '',
            fase: 1,
            currentStep: 'retrato',
            call1CompletedAt: null,
            call2CompletedAt: null,
            call3CompletedAt: null,
            cenarioEscolhidoId: null,
            createdAt: new Date().toISOString(),
          };
          const initialBlocks = getInitialBlocks();
          await setDoc(docRef, {
            profile: clientProfile,
            blocks: initialBlocks,
            comments: {},
            scenarios: {},
            weekPlans: {},
            monthlyRituals: []
          });
          console.log(`Successfully healed clients document for ${clientId}`);
        }
      } catch (err) {
        console.error('Error auto-creating client record in streamClientRecord:', err);
      }
    }
  });
}

// Save Questions Schema globally
export async function saveQuestionsSchema(eixosSchema: any[]): Promise<void> {
  const schemaDocRef = doc(db, 'settings', 'questionsSchema');
  await setDoc(schemaDocRef, { eixos: eixosSchema, updatedAt: new Date().toISOString() });
}

// Stream Questions Schema in real-time
export function streamQuestionsSchema(callback: (eixosSchema: any[]) => void) {
  const schemaDocRef = doc(db, 'settings', 'questionsSchema');
  return onSnapshot(schemaDocRef, (snap) => {
    if (snap.exists() && snap.data().eixos) {
      callback(snap.data().eixos);
    } else {
      callback([]);
    }
  });
}

// Save Call Record for client
export async function saveClientCalls(clientId: string, calls: Record<string, any>): Promise<void> {
  const clientDocRef = doc(db, 'clients', clientId);
  await updateDoc(clientDocRef, { calls });
}

// Add Activity Log item
export async function addClientActivityLog(clientId: string, activityText: string): Promise<void> {
  const clientDocRef = doc(db, 'clients', clientId);
  const snap = await getDoc(clientDocRef);
  if (snap.exists()) {
    const data = snap.data();
    const logs = data.activityLog || [];
    const newLog = {
      id: Math.random().toString(36).substring(2, 9),
      text: activityText,
      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    };
    await updateDoc(clientDocRef, { activityLog: [newLog, ...logs] });
  }
}

