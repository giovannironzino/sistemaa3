import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { createUserProfile, getUserProfile } from '../lib/db';
import { UserProfile } from '../types';
import { ShieldCheck, Heart, User, Lock, Mail, Users, ArrowRight } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: (user: UserProfile) => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'nutri' | 'consultor'>('nutri');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Sign In
        const credential = await signInWithEmailAndPassword(auth, email, password);
        let profile = await getUserProfile(credential.user.uid);
        if (!profile) {
          // Auto-heal: Create user profile in Firestore if it's missing but Firebase Auth succeeded
          profile = await createUserProfile(
            credential.user.uid,
            credential.user.email || email,
            credential.user.displayName || email.split('@')[0] || 'Usuário',
            'nutri'
          );
        }
        if (profile) {
          if (profile.status === 'inactive') {
            await signOut(auth);
            throw new Error('Sua conta está inativa. Entre em contato com seu consultor.');
          }
          onAuthSuccess(profile);
        } else {
          // Fallback if profile doesn't exist for some reason
          throw new Error('Perfil de usuário não encontrado.');
        }
      } else {
        // Sign Up
        if (!name.trim()) {
          throw new Error('Por favor, informe seu nome completo.');
        }
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        const profile = await createUserProfile(credential.user.uid, email, name, role);
        onAuthSuccess(profile);
      }
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message || 'Erro ao processar autenticação.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errMsg = 'E-mail ou senha inválidos.';
      } else if (err.code === 'auth/email-already-in-use') {
        errMsg = 'Este e-mail já está em uso por outra conta.';
      } else if (err.code === 'auth/weak-password') {
        errMsg = 'A senha deve ter pelo menos 6 caracteres.';
      } else if (err.code === 'auth/invalid-email') {
        errMsg = 'Endereço de e-mail inválido.';
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden" id="auth_container">
      {/* Background Mesh Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] bg-indigo-600/20 rounded-full blur-[110px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[130px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 shadow-xl mb-6 backdrop-blur-md" id="app_logo_box">
          <ShieldCheck className="h-9 w-9" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white font-display">
          SISTEMA A3
        </h2>
        <p className="mt-2 text-xs text-slate-400 max-w-xs mx-auto tracking-wide">
          Inteligência de Negócios e Modelagem Estratégica para Clínicas de Nutrição
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white/5 py-8 px-6 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-2xl sm:px-10" id="auth_card">
          <div className="flex border-b border-white/10 pb-4 mb-6 justify-around">
            <button
              id="btn_tab_login"
              type="button"
              className={`pb-2 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                isLogin
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
            >
              Entrar
            </button>
            <button
              id="btn_tab_register"
              type="button"
              className={`pb-2 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                !isLogin
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
            >
              Criar Conta
            </button>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit} id="auth_form">
            {error && (
              <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-300 font-medium" id="auth_error_box">
                {error}
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2" htmlFor="name_input">
                  Nome Completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-4.5 w-4.5 text-slate-400" />
                  </div>
                  <input
                    id="name_input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3.5 py-3 border border-white/10 rounded-xl bg-white/5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white/10 focus:border-indigo-500 transition-all"
                    placeholder="Seu nome"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2" htmlFor="email_input">
                E-mail Profissional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  id="email_input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3.5 py-3 border border-white/10 rounded-xl bg-white/5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white/10 focus:border-indigo-500 transition-all"
                  placeholder="voce@exemplo.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2" htmlFor="password_input">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  id="password_input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3.5 py-3 border border-white/10 rounded-xl bg-white/5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white/10 focus:border-indigo-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Tipo de Acesso
                </label>
                <div className="grid grid-cols-2 gap-3" id="role_selector">
                  <button
                    id="btn_role_nutri"
                    type="button"
                    onClick={() => setRole('nutri')}
                    className={`py-3 px-4 border rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-xs cursor-pointer ${
                      role === 'nutri'
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 font-bold shadow-lg'
                        : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <Heart className="h-4.5 w-4.5" />
                    Nutricionista
                  </button>
                  <button
                    id="btn_role_consultor"
                    type="button"
                    onClick={() => setRole('consultor')}
                    className={`py-3 px-4 border rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-xs cursor-pointer ${
                      role === 'consultor'
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 font-bold shadow-lg'
                        : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <Users className="h-4.5 w-4.5" />
                    Consultor A3
                  </button>
                </div>
              </div>
            )}

            <button
              id="btn_auth_submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-indigo-600/20"
            >
              {loading ? (
                <span>Aguarde...</span>
              ) : (
                <>
                  <span>{isLogin ? 'Entrar no Sistema' : 'Criar minha conta'}</span>
                  <ArrowRight className="h-4.5 w-4.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
