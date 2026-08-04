import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import { getUserProfile, createUserProfile, streamClientRecord } from './lib/db';
import { UserProfile, ClientRecord } from './types';
import Auth from './components/Auth';
// NOTE: Os componentes abaixo são do fluxo legado. Não foram apagados (regra 0 da spec).
// Apenas desconectados da navegação visível. Ficam órfãos até decisão futura do Giovanni.
import RetratoForm from './components/RetratoForm';
import PainelConsultor from './components/PainelConsultor';
import ExecucaoCliente from './components/ExecucaoCliente';
import MotorSimulacao from './components/MotorSimulacao';
// Fase01Flow é reutilizado internamente pelo JornadaA3Shell — não é legado.
import JornadaA3Shell from './features/jornada/JornadaA3Shell';
import {
  LogOut,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  ChevronRight,
  TrendingUp,
  Heart
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [clientRecord, setClientRecord] = useState<ClientRecord | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  // viewingMode removido — substituído por JornadaA3Shell (spec seção 4.4)

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          let profile = await getUserProfile(firebaseUser.uid);
          if (!profile) {
            // Auto-heal: Create a profile if it doesn't exist
            profile = await createUserProfile(
              firebaseUser.uid,
              firebaseUser.email || '',
              firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
              'nutri'
            );
          }
          if (profile && profile.status === 'active') {
            setCurrentUser(profile);
          } else if (profile && profile.status === 'inactive') {
            await signOut(auth);
            alert('Sua conta está inativa. Entre em contato com seu consultor.');
            setCurrentUser(null);
          } else {
            // Profile fallback
            setCurrentUser(null);
          }
        } catch (e) {
          console.error('Error fetching user profile:', e);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
        setClientRecord(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Real-time client document stream (if current user is nutri)
  useEffect(() => {
    if (currentUser && currentUser.role === 'nutri') {
      const unsubscribe = streamClientRecord(currentUser.uid, (record) => {
        setClientRecord(record);
      });
      return () => unsubscribe();
    }
  }, [currentUser]);

  const handleLogout = async () => {
    if (confirm('Deseja realmente sair do sistema?')) {
      await signOut(auth);
    }
  };
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#05070a] flex items-center justify-center font-sans relative overflow-hidden">
        {/* Background Mesh Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="text-center space-y-4 relative z-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto" />
          <p className="text-sm text-slate-400 font-medium">Iniciando conexão segura com o Sistema A3...</p>
        </div>
      </div>
    );
  }

  // Auth screen
  if (!currentUser) {
    return <Auth onAuthSuccess={(profile) => setCurrentUser(profile)} />;
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200 flex flex-col font-body relative overflow-hidden">
      {/* Universal Header */}
      <header className="bg-[#090d16] border-b border-white/10 sticky top-0 z-40" id="global_header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-indigo-600 border border-indigo-500 text-white flex items-center justify-center font-label text-xs font-bold">
              A3
            </div>
            <div>
              <span className="text-xs font-bold text-white block tracking-wider font-label uppercase">
                SISTEMA A3
              </span>
              <span className="text-[10px] text-indigo-400 font-label uppercase tracking-widest block">
                {currentUser.role === 'consultor' ? 'Painel de Consultoria' : 'Modelagem Estratégica'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-label text-white">{currentUser.name}</span>
              <span className="text-[10px] text-slate-400 font-mono">{currentUser.email}</span>
            </div>
            <button
              id="btn_header_logout"
              type="button"
              onClick={handleLogout}
              className="p-1.5 border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Sair do Sistema"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow py-8 relative z-10">
        {currentUser.role === 'consultor' ? (
          <PainelConsultor consultorId={currentUser.uid} consultorName={currentUser.name} />
        ) : (
          /* NUTRI (CLIENT) SECTION */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {!clientRecord ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                Carregando seus dados de modelagem...
              </div>
            ) : clientRecord.profile.fase === 2 ? (
              /* FASE 2: EXECUÇÃO (Checklists, monthly comparison logs) — fluxo legado mantido */
              <ExecucaoCliente
                clientId={currentUser.uid}
                blocks={clientRecord.blocks}
                initialWeekPlans={clientRecord.weekPlans}
                initialMonthlyRituals={clientRecord.monthlyRituals || []}
                isConsultant={false}
              />
            ) : (
              /* FASE 1 — NOVA JORNADA DO A3 (substitui o sistema de abas legado) */
              <JornadaA3Shell
                uid={currentUser.uid}
                clientRecord={clientRecord}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
