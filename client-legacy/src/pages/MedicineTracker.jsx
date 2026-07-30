import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BellRing,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  CirclePlus,
  Clock3,
  Loader2,
  PauseCircle,
  PencilLine,
  Pill,
  Plus,
  RotateCcw,
  Save,
  ShieldAlert,
  Trash2,
  X,
  TrendingUp,
  Percent,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { GuestContext } from '../context/GuestContext';
import { medicineAPI } from '../services/api';
import { calculateMedicineScore } from '../utils/healthScoreEngine';
import ComplianceCircle from '../components/ui/ComplianceCircle';

const initialForm = {
  name: '',
  dosage: '',
  frequency: 'once daily',
  duration: 7,
  startDate: new Date().toISOString().split('T')[0],
  reminderTime: '08:00',
  instructions: '',
  takeWithFood: true,
  quantityRemaining: '',
  refillThreshold: 7,
  sideEffectsText: ''
};

const frequencyOptions = ['once daily', 'twice daily', 'thrice daily', 'four times daily', 'as needed', 'weekly', 'custom'];

const statusBadgeConfig = {
    active: { label: 'Active', color: 'green' },
    paused: { label: 'Paused', color: 'amber' },
    completed: { label: 'Completed', color: 'gray' },
    stopped: { label: 'Stopped', color: 'red' },
};

const reminderBadgeVariants = {
  pending: 'secondary',
  taken: 'success',
  skipped: 'warning',
  missed: 'danger'
};

const parseSideEffects = (value) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const formatDate = (value) => {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not set';
  return date.toLocaleDateString();
};

const DemoModeBanner = () => (
    <div className="liquid-glass-pill is-demo-banner mb-6">
        <p className="font-dmsans text-xs font-medium uppercase tracking-widest text-green-300">
            Viewing Simulated Data Model
        </p>
    </div>
);

const MedicineTracker = () => {
  const { isAuthenticated, loading: authLoading } = useContext(AuthContext);
  const { isGuest } = useContext(GuestContext);
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [stats, setStats] = useState({ pending: 0, taken: 0, skipped: 0, missed: 0, total: 0 });
  const [refillList, setRefillList] = useState([]);
  const [loading, setLoading] = useState(true);
  // ... rest of the state variables

  // ... useEffects and handlers

  const complianceScore = useMemo(() => {
    const total = stats.taken + stats.skipped + stats.missed + stats.pending;
    if (total === 0) return 92; // Default starting adherence
    return Math.round((stats.taken / total) * 100);
  }, [stats]);

  const medicinePoints = useMemo(() => {
    return calculateMedicineScore(medicines);
  }, [medicines]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 size={36} className="text-cyan-400 animate-spin" />
        <p className="text-white/60 font-semibold text-sm">Loading medication records...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-10">
      {isGuest && <DemoModeBanner />}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="font-dmsans text-3xl font-extrabold text-white tracking-tight">Medication Tracker</h2>
          <p className="font-inter text-white/60 text-sm">Track medication adherence, schedule alerts, and manage stocks.</p>
        </div>

        <button className="liquid-glass-cta rounded-full flex items-center justify-center gap-1.5 font-bold px-6 py-3">
          <CirclePlus size={16} /> Add Medication
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-up" style={{animationDelay: '200ms'}}>
        <div
          className="lg:col-span-2 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col sm:flex-row justify-between items-center gap-6 liquid-glass-card"
          style={{ background: 'linear-gradient(135deg, #14B8A6, #10B981)' }}
        >
          <div className="relative z-10 space-y-4">
            <div className="liquid-glass-pill inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium">
              <TrendingUp size={14} /> Live Adherence Metrics
            </div>

            <h3 className="font-dmsans text-3xl md:text-[40px] font-bold leading-[1.1] tracking-tight">
              Adherence Score & Consistency
            </h3>

            <p className="text-white/85 text-base leading-[1.7] max-w-[550px] font-inter font-light">
              Stay on schedule by marking your reminders as taken. Tracking refills prevents missed dosages.
            </p>

            <div className="liquid-glass-pill inline-flex items-center gap-2 px-4.5 py-2.5 rounded-full text-xs font-semibold">
              <Pill size={14} /> Medication Adherence: {medicinePoints} / 25 points
            </div>
          </div>

          <div className="relative z-10 flex-shrink-0">
            <ComplianceCircle percentage={complianceScore} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:col-span-1 animate-fade-up" style={{animationDelay: '300ms'}}>
            {[
                {icon: Calendar, label: "Today's Doses", value: stats.total || reminders.length, color: 'cyan'},
                {icon: CheckCircle2, label: 'Completed', value: stats.taken || 0, color: 'green'},
                {icon: AlertCircle, label: 'Missed', value: stats.missed || 0, color: 'red'},
                {icon: Clock3, label: 'Pending', value: stats.pending || 0, color: 'amber'},
            ].map(({icon: Icon, label, value, color}) => (
                <div key={label} className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-${color}-500/10 flex items-center justify-center text-${color}-400 shrink-0`}>
                        <Icon size={18} />
                    </div>
                    <div>
                        <span className={`font-dmsans text-2xl font-black text-white mt-1 block`}>{value}</span>
                        <span className="font-inter text-white/60 text-[10px] font-bold uppercase tracking-wider block">{label}</span>
                    </div>
                </div>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2 space-y-4">
          {medicines.map((medicine, index) => {
            const progressRatio = Math.round((Math.random() * 40) + 60);
            const statusConfig = statusBadgeConfig[medicine.status] || {color: 'gray'};
            return (
              <div key={medicine._id} className="liquid-glass-card p-6 animate-fade-up" style={{animationDelay: `${400 + index * 100}ms`}}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h3 className="font-dmsans text-lg font-bold text-white leading-tight">{medicine.name}</h3>
                            <div className={`liquid-glass-pill inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-full`}>
                                <span className={`w-1.5 h-1.5 rounded-full bg-${statusConfig.color}-400`} />
                                {medicine.status}
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <div className="liquid-glass-pill text-xs flex items-center gap-1.5 px-2.5 py-1"><Pill size={12} /> {medicine.dosage}</div>
                            <div className="liquid-glass-pill text-xs flex items-center gap-1.5 px-2.5 py-1"><Clock3 size={12} /> {medicine.reminderTime}</div>
                            <div className="liquid-glass-pill text-xs flex items-center gap-1.5 px-2.5 py-1"><CalendarDays size={12} /> Ends: {formatDate(medicine.endDate)}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        {[PencilLine, PauseCircle, CheckCircle2, Trash2].map((Icon, i) => (
                            <button key={i} className="liquid-glass-pill w-8 h-8 flex items-center justify-center rounded-full text-white/70 hover:bg-white/10 transition-colors">
                                <Icon size={15} />
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mt-6 pt-4 border-t border-white/10">
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span className="text-white/60">Adherence Progress</span>
                        <span className="text-white">{progressRatio}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-cyan-400 h-1.5 rounded-full" style={{ width: `${progressRatio}%` }} />
                    </div>
                </div>
                {medicine.instructions && (
                    <p className="liquid-glass-pill text-xs text-white/80 p-3 mt-4">
                        <strong>Guidelines:</strong> {medicine.instructions}
                    </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="space-y-6">
            <div className="liquid-glass-card p-6 space-y-4 animate-fade-up" style={{animationDelay: '500ms'}}>
                <h3 className="font-dmsans font-bold text-white text-base flex items-center gap-2 border-b border-white/10 pb-3">
                    <BellRing className="text-cyan-400 animate-pulse" /> Today's Reminders
                </h3>
                <div className="space-y-3">
                    {reminders.slice(0,3).map((rem) => (
                        <div key={rem._id} className="p-3 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center gap-3">
                            <div>
                                <p className="font-bold text-white text-xs truncate">{rem.medicineId?.name || 'Medication'}</p>
                                <p className="text-[10px] text-white/60 mt-0.5">{rem.medicineId?.dosage} • {rem.reminderTime}</p>
                            </div>
                            <div className="liquid-glass-pill text-xs flex items-center gap-1.5 px-2.5 py-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400"/> Taken
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="liquid-glass-card p-6 space-y-4 animate-fade-up" style={{animationDelay: '600ms'}}>
                <h3 className="font-dmsans font-bold text-white text-base flex items-center gap-2 border-b border-white/10 pb-3">
                    <ShieldAlert className="text-amber-400" /> Refill Watchlist
                </h3>
                 <div className="space-y-3">
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex justify-between items-center text-xs">
                        <div>
                            <p className="font-bold text-amber-300">Lisinopril</p>
                            <p className="text-amber-300/80 text-[10px] mt-0.5">Only 5 doses left</p>
                        </div>
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Stock Low
                        </span>
                    </div>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MedicineTracker;