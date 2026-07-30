'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Database,
  Settings,
  LogOut,
  Shield,
  Activity,
  User as UserIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

const sidebarLinks = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'User Management', href: '/admin/users', icon: Users },
  { name: 'System Logs', href: '/admin/logs', icon: Activity },
  { name: 'Database', href: '/admin/database', icon: Database },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row font-[family-name:var(--font-sans)]">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-slate-900 text-white border-r border-slate-800 flex flex-col z-20 sticky top-0 h-auto md:h-screen shadow-xl">
          <div className="p-6 flex items-center gap-3 border-b border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight font-[family-name:var(--font-heading)]">
              Admin Console
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
                        ? 'bg-purple-600 text-white font-medium shadow-md' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <link.icon className="w-5 h-5" />
                    <span className="hidden md:inline">{link.name}</span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800 hidden md:block">
            <button onClick={logout} className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-all">
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Top Header */}
          <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-10 hidden md:flex">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 font-[family-name:var(--font-heading)]">
                System Overview
              </h2>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-700 dark:text-purple-400 uppercase font-bold">
                  {user?.name?.charAt(0) || <Shield className="w-4 h-4" />}
                </div>
                <div className="text-sm">
                  <p className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-purple-600 transition-colors">{user?.name || 'Loading...'}</p>
                  <p className="text-xs text-slate-500 capitalize">{user?.role || 'Admin'}</p>
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
