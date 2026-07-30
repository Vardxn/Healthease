import React, { createContext, useCallback, useContext, useState } from 'react';
import { AuthContext } from './AuthContext';
import { cloneMockDemoPatient } from '../data/mockDemoPatient';

export const GuestContext = createContext();

export const GuestProvider = ({ children }) => {
  const { isAuthenticated, login, register, demoLogin } = useContext(AuthContext);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState('');
  const [authIntent, setAuthIntent] = useState('/dashboard');
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // default to guestMode if user is not logged in
  const guestMode = !isAuthenticated;

  const [demoData, setDemoData] = useState(() => cloneMockDemoPatient());

  const resetDemoSession = useCallback(() => {
    const nextDemoData = cloneMockDemoPatient();
    setDemoData(nextDemoData);
    sessionStorage.setItem('healthease_demo_patient', JSON.stringify(nextDemoData));
    return nextDemoData;
  }, []);

  const completeAuthIntent = () => {
    setShowAuthModal(false);
    window.location.assign(authIntent || '/dashboard');
  };

  const triggerAuthIntercept = useCallback((message, intent = window.location.pathname + window.location.search) => {
    setAuthModalMessage(message || "Authentication required to parse private medical data. Create a verified account to test our live infrastructure pipelines.");
    setAuthIntent(intent || '/dashboard');
    setAuthError('');
    setAuthMode('login');
    setShowAuthModal(true);
  }, []);

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    const result = authMode === 'register'
      ? await register(authForm.name, authForm.email, authForm.password)
      : await login(authForm.email, authForm.password);

    setAuthLoading(false);
    if (result.success) {
      completeAuthIntent();
      return;
    }

    setAuthError(result.message);
  };

  const handleDemoPatient = async () => {
    setAuthError('');
    setAuthLoading(true);
    resetDemoSession();
    const result = await demoLogin();
    setAuthLoading(false);
    if (result.success) {
      window.location.assign('/dashboard');
      return;
    }
    setAuthError(result.message);
  };

  return (
    <GuestContext.Provider
      value={{
        guestMode,
        demoData,
        showAuthModal,
        setShowAuthModal,
        authModalMessage,
        triggerAuthIntercept,
        resetDemoSession
      }}
    >
      {children}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="liquid-glass max-w-md w-full rounded-3xl p-8 bg-neutral-900 border border-white/10 text-white flex flex-col gap-6 animate-scale-in">
            <div className="flex flex-col gap-2">
              <h3 className="font-dmsans text-2xl tracking-[-0.05em] text-emerald-400 font-medium">
                Authentication Required
              </h3>
              <p className="font-inter text-sm text-white/70 leading-relaxed font-light">
                {authModalMessage}
              </p>
            </div>
            {authError && (
              <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-xs text-red-100">
                {authError}
              </div>
            )}
            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-3">
              {authMode === 'register' && (
                <input
                  type="text"
                  value={authForm.name}
                  onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })}
                  placeholder="Full name"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-emerald-400/60"
                  required
                />
              )}
              <input
                type="email"
                value={authForm.email}
                onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })}
                placeholder="Email address"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-emerald-400/60"
                required
              />
              <input
                type="password"
                value={authForm.password}
                onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
                placeholder="Password"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-emerald-400/60"
                required
              />
              <button
                type="submit"
                disabled={authLoading}
                className="bg-emerald-400 text-black font-inter font-medium text-sm py-3 rounded-full hover:bg-emerald-300 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              >
                {authLoading ? 'Please wait...' : authMode === 'register' ? 'Create Account' : 'Sign In'}
              </button>
            </form>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDemoPatient}
                disabled={authLoading}
                className="flex-1 bg-white/5 border border-emerald-400/20 text-emerald-300 font-inter font-medium text-sm py-3 rounded-full hover:bg-emerald-400/10 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              >
                Explore Demo Space
              </button>
              <button
                onClick={() => setShowAuthModal(false)}
                className="flex-1 bg-white/5 border border-white/10 text-white font-inter font-medium text-sm py-3 rounded-full hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setAuthError('');
                setAuthMode(authMode === 'login' ? 'register' : 'login');
              }}
              className="text-xs text-white/55 hover:text-white underline underline-offset-4"
            >
              {authMode === 'login' ? 'Need an account? Create one here.' : 'Already have an account? Sign in.'}
            </button>
          </div>
        </div>
      )}
    </GuestContext.Provider>
  );
};
