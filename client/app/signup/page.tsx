'use client';

import React, { useState } from 'react';
import { Navbar } from '@/app/components/Navbar';
import { Footer } from '@/app/components/Footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User, Shield, Stethoscope, HeartPulse } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<'patient' | 'doctor' | 'admin'>('patient');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      
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
        setError('Signup failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
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
              Create an Account
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Join HealthEase today.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            
            {error && (
              <div className="bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 p-3 rounded-xl text-sm text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Select Role</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('patient')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                    role === 'patient' 
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 shadow-sm' 
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500'
                  }`}
                >
                  <HeartPulse className="w-5 h-5 mb-1" />
                  <span className="text-xs font-semibold">Patient</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('doctor')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                    role === 'doctor' 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm' 
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500'
                  }`}
                >
                  <Stethoscope className="w-5 h-5 mb-1" />
                  <span className="text-xs font-semibold">Doctor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                    role === 'admin' 
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 shadow-sm' 
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500'
                  }`}
                >
                  <Shield className="w-5 h-5 mb-1" />
                  <span className="text-xs font-semibold">Admin</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  placeholder="Jane Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 text-white font-semibold py-3 rounded-xl hover:bg-teal-700 transition-colors shadow-lg shadow-teal-500/30 disabled:opacity-70"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="text-teal-600 dark:text-teal-400 font-semibold hover:underline">
              Log in
            </Link>
          </div>
        </motion.div>
      </div>
      <Footer />
    </main>
  );
}
