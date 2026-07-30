'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Database, AlertCircle, Trash2, HeartPulse, Stethoscope, Search } from 'lucide-react';

const mockUsers = [
  { id: '1', name: 'Jane Doe', email: 'jane@example.com', role: 'patient', status: 'Active', joinedAt: '2026-07-28' },
  { id: '2', name: 'Dr. Rajesh Kumar', email: 'rajesh@example.com', role: 'doctor', status: 'Active', joinedAt: '2026-07-20' },
  { id: '3', name: 'Michael Chen', email: 'michael@example.com', role: 'patient', status: 'Inactive', joinedAt: '2026-07-15' },
  { id: '4', name: 'Dr. Sarah Connor', email: 'sarah@example.com', role: 'doctor', status: 'Pending', joinedAt: '2026-07-30' },
];

export default function AdminDashboard() {
  const [users, setUsers] = useState(mockUsers);

  const handleDelete = (id: string) => {
    // In a real app, this would be an API call
    if(confirm("Are you sure you want to completely remove this user's data from the database? This action is irreversible.")) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-[family-name:var(--font-heading)]">
            Platform Administration
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage users, databases, and system settings.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Total Patients', value: '1,248', icon: HeartPulse, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10' },
          { title: 'Verified Doctors', value: '156', icon: Stethoscope, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
          { title: 'System Health', value: '99.9%', icon: Database, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-500/10' }
        ].map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{stat.title}</p>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100 font-[family-name:var(--font-heading)]">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* User Management Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden mt-6">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="font-semibold text-lg text-slate-800 dark:text-slate-200 font-[family-name:var(--font-heading)] flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Global User Database
          </h2>
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/20 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        user.role === 'doctor' ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700'
                      }`}>
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-800 dark:text-slate-200">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      user.role === 'doctor' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-sm ${
                      user.status === 'Active' ? 'text-emerald-600 dark:text-emerald-400' : 
                      user.status === 'Pending' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        user.status === 'Active' ? 'bg-emerald-500' : 
                        user.status === 'Pending' ? 'bg-amber-500' : 'bg-slate-400'
                      }`}></span>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {user.joinedAt}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(user.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                      title="Remove from database"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
