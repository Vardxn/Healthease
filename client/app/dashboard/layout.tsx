'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  HeartPulse,
  Pill,
  Calendar,
  MessageSquare,
  LogOut,
  Bell,
  User,
  Settings,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

const sidebarLinks = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Vitals', href: '/dashboard/vitals', icon: HeartPulse },
  { name: 'Medications', href: '/dashboard/medications', icon: Pill },
  { name: 'Consultations', href: '/dashboard/consultations', icon: Calendar },
  { name: 'AI Assistant', href: '/dashboard/assistant', icon: MessageSquare },
  { name: 'Prediction', href: '/dashboard/prediction', icon: Activity },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['patient']}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row font-[family-name:var(--font-sans)]">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-20 sticky top-0 h-auto md:h-screen shadow-sm md:shadow-none">
          <div className="p-6 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white font-[family-name:var(--font-heading)]">
              HealthEase
            </span>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto flex md:flex-col gap-2 md:gap-0">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);
              return (
                <Link key={link.name} href={link.href} className="flex-1 md:flex-none">
                  <motion.div
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 font-medium' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <link.icon className={`w-5 h-5 ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`} />
                    <span className="hidden md:inline">{link.name}</span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800 hidden md:block">
            <button onClick={logout} className="flex items-center gap-3 px-4 py-3 w-full text-slate-600 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all">
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Top Header */}
          <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-10 hidden md:flex">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 capitalize font-[family-name:var(--font-heading)]">
                {pathname?.split('/').pop() || 'Dashboard'}
              </h2>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
              </button>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-700 dark:text-teal-400 uppercase font-bold">
                  {user?.name?.charAt(0) || <User className="w-4 h-4" />}
                </div>
                <div className="text-sm">
                  <p className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-teal-600 transition-colors">{user?.name || 'Loading...'}</p>
                  <p className="text-xs text-slate-500 capitalize">{user?.role || 'Patient'}</p>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
