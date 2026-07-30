'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Activity, Scale, Droplet, ArrowUpRight, ArrowDownRight, MoreVertical } from 'lucide-react';
import { VitalsCard } from '@/app/components/dashboard/VitalsCard';

// Dummy data for the line charts
const heartRateData = [68, 72, 70, 75, 71, 74, 72];
const bpData = [115, 118, 120, 119, 122, 120, 121]; // Systolic mock

const ChartLine = ({ data, color }: { data: number[], color: string }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  
  return (
    <div className="h-32 flex items-end justify-between gap-2 mt-6">
      {data.map((val, i) => {
        const height = ((val - min) / range) * 80 + 20; // 20% to 100%
        return (
          <motion.div 
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${height}%` }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className={`w-full rounded-t-sm opacity-80 hover:opacity-100 cursor-pointer ${color}`}
          />
        );
      })}
    </div>
  );
};

export default function VitalsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-[family-name:var(--font-heading)]">
          Vitals Tracking
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Monitor your key health metrics over time.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <VitalsCard title="Heart Rate" value="72" unit="bpm" icon={Heart} trend={-2} status="normal" delay={0.1} />
        <VitalsCard title="Blood Pressure" value="120/80" unit="mmHg" icon={Activity} status="normal" delay={0.2} />
        <VitalsCard title="Weight" value="68.5" unit="kg" icon={Scale} trend={-0.5} status="normal" delay={0.3} />
        <VitalsCard title="Glucose" value="95" unit="mg/dL" icon={Droplet} status="normal" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Heart Rate Chart */}
        <div className="relative overflow-hidden backdrop-blur-xl bg-white/70 dark:bg-slate-900/60 rounded-3xl p-6 border border-white/40 dark:border-slate-700/50 shadow-xl shadow-slate-200/40 dark:shadow-slate-900/50">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-400/20 dark:bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex justify-between items-center relative z-10">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">Heart Rate History</h3>
              <p className="text-sm text-slate-500">Last 7 days</p>
            </div>
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <MoreVertical className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          
          <div className="relative z-10">
            <ChartLine data={heartRateData} color="bg-rose-500" />
            <div className="flex justify-between text-xs text-slate-400 mt-2 font-mono">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>
        </div>

        {/* Blood Pressure Chart */}
        <div className="relative overflow-hidden backdrop-blur-xl bg-white/70 dark:bg-slate-900/60 rounded-3xl p-6 border border-white/40 dark:border-slate-700/50 shadow-xl shadow-slate-200/40 dark:shadow-slate-900/50">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex justify-between items-center relative z-10">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">Blood Pressure History</h3>
              <p className="text-sm text-slate-500">Systolic (Last 7 days)</p>
            </div>
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <MoreVertical className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          
          <div className="relative z-10">
            <ChartLine data={bpData} color="bg-blue-500" />
            <div className="flex justify-between text-xs text-slate-400 mt-2 font-mono">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
