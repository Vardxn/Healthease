'use client';

import React, { useState } from 'react';
import { Navbar } from '@/app/components/Navbar';
import { Footer } from '@/app/components/Footer';
import { useRouter } from 'next/navigation';
import { UserCircle, Stethoscope, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loadingRole, setLoadingRole] = useState<'patient' | 'doctor' | null>(null);
  const { login } = useAuth();

  const handleDemoLogin = async (role: 'patient' | 'doctor') => {
    setError('');
    setLoadingRole(role);
    
    // Hardcoded credentials based on your database seeds
    const credentials = {
      patient: { email: 'john@test.com', password: 'easy123' },
      doctor: { email: 'smith@test.com', password: 'care123' }
    };
    
    try {
      const res = await api.post('/auth/login', credentials[role]);
      
      if (res.success && res.token && res.user) {
        login(res.token, res.user);
        
        // Role-based routing
        if (res.user.role === 'admin') {
          router.push('/admin');
        } else if (res.user.role === 'doctor') {
          router.push('/doctor');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError('Login failed. Ensure test users are seeded in the database.');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials or backend unavailable');
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-[family-name:var(--font-sans)]">
      <Navbar />
      <div className="flex-1 pt-32 pb-20 flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl"
        >
          <div className="text-center mb-8">
            <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Interview Demo Mode
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Standard authentication is temporarily disabled. Select a role below to instantly log in.
            </p>
          </div>

          <div className="space-y-4">
            {error && (
              <div className="bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 p-3 rounded-xl text-sm text-center">
                {error}
              </div>
            )}

            <button 
              onClick={() => handleDemoLogin('patient')}
              disabled={loadingRole !== null}
              className="w-full flex items-center justify-between bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold p-4 rounded-xl transition-all disabled:opacity-50 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-200/50 flex items-center justify-center">
                  <UserCircle className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="block text-lg">Use as Patient</span>
                  <span className="text-xs text-indigo-500 font-normal">View dashboard, AI chat, and book calls</span>
                </div>
              </div>
              {loadingRole === 'patient' ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>}
            </button>

            <button 
              onClick={() => handleDemoLogin('doctor')}
              disabled={loadingRole !== null}
              className="w-full flex items-center justify-between bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 font-semibold p-4 rounded-xl transition-all disabled:opacity-50 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-200/50 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="block text-lg">Use as Doctor</span>
                  <span className="text-xs text-teal-500 font-normal">Manage patients and join calls</span>
                </div>
              </div>
              {loadingRole === 'doctor' ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>}
            </button>

          </div>

          <div className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
            Authentication logic (JWT, password hashing) remains intact on the backend but is hidden here for speed.
          </div>
        </motion.div>
      </div>
      <Footer />
    </main>
  );
}
