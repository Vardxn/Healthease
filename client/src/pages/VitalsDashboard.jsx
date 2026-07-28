import React, { useContext, useEffect, useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Flame, Loader2, TrendingUp, Activity, ShieldCheck, Heart, User, Droplets, Thermometer, Weight, GitCommitHorizontal, FileText, BarChart, Users, Plus } from 'lucide-react';
import * as api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { GuestContext } from '../context/GuestContext';
import { calculateHealthScore } from '../utils/healthScoreEngine';

const VitalsForm = ({ userId, onLogSuccess }) => {
    const [form, setForm] = useState({ systolic: '', diastolic: '', bloodSugar: '', spo2: '', weight: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        // ... submit logic
    };

    return (
        <div className="liquid-glass-card p-6 animate-fade-up" style={{ animationDelay: '400ms' }}>
            <h3 className="font-dmsans text-lg font-bold text-white mb-4">Log New Vitals</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <input type="number" placeholder="Systolic" className="liquid-glass-input" value={form.systolic} onChange={e => setForm({...form, systolic: e.target.value})} />
                    <input type="number" placeholder="Diastolic" className="liquid-glass-input" value={form.diastolic} onChange={e => setForm({...form, diastolic: e.target.value})} />
                    <input type="number" placeholder="Blood Sugar" className="liquid-glass-input" value={form.bloodSugar} onChange={e => setForm({...form, bloodSugar: e.target.value})} />
                    <input type="number" placeholder="SpO2 %" className="liquid-glass-input" value={form.spo2} onChange={e => setForm({...form, spo2: e.target.value})} />
                    <input type="number" placeholder="Weight (kg)" className="liquid-glass-input" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} />
                </div>
                <div className="flex justify-end pt-2">
                    <button type="submit" className="liquid-glass-cta rounded-full px-6 py-2.5 text-sm font-bold">
                        {loading ? <Loader2 className="animate-spin" /> : 'Log Vitals'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const WellnessWidget = ({ achievements }) => {
    if (!achievements) return null;
    return (
        <div className="liquid-glass p-5 rounded-2xl h-full flex flex-col justify-between">
            <div>
                <h3 className="font-dmsans text-lg font-bold">Wellness Snapshot</h3>
                <p className="text-xs text-white/60">Streak & point summary.</p>
            </div>
            <div className="liquid-glass-pill flex items-center gap-3 px-4 py-2.5 rounded-full mt-4">
                <Flame className="text-amber-300" />
                <div>
                    <p className="font-bold text-sm">{achievements?.currentStreakDays || 0} Day Streak</p>
                    <p className="text-xs text-white/60">Keep it up!</p>
                </div>
            </div>
        </div>
    );
};


const VitalsDashboard = ({ userId: userIdProp }) => {
  const { user } = useContext(AuthContext);
  const { isGuest } = useContext(GuestContext);
  const userId = userIdProp || user?._id;
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // ... other states

  // Dummy data for presentation
  const healthScore = 88;
  const achievements = { currentStreakDays: 5, wellnessPoints: 125 };
  const latestVitals = { bp: '118/78', heart: '68', spo2: '99', weight: '68.5', sugar: '92', temp: '98.4' };
  const chartData = [
      {date: '06/21', systolic: 120, diastolic: 80, bloodSugar: 95}, {date: '06/28', systolic: 118, diastolic: 78, bloodSugar: 92}, {date: '07/05', systolic: 122, diastolic: 81, bloodSugar: 98}, {date: '07/12', systolic: 117, diastolic: 77, bloodSugar: 90}, {date: '07/19', systolic: 118, diastolic: 78, bloodSugar: 92}
    ];

  useEffect(() => {
    // Simulating data fetching
    setTimeout(() => setLoading(false), 1000);
  }, [userId]);


  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-cyan-400" size={48} /></div>;
  }

  const Stat = ({ label, value, unit, icon: Icon, color }) => (
      <div className="text-center">
          <p className={`font-inter text-xs text-white/60 uppercase tracking-wider`}>{label}</p>
          <p className={`font-dmsans text-3xl font-bold text-${color}-400 my-1`}>{value}</p>
          <p className="font-inter text-xs text-white/50">{unit}</p>
      </div>
  )

  return (
    <div className="space-y-6 pb-10">
        {isGuest && <div className="liquid-glass-pill is-demo-banner mb-6"><p className="font-dmsans text-xs font-medium uppercase tracking-widest text-green-300">Viewing Simulated Data Model</p></div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-between liquid-glass-card animate-fade-up" style={{animationDelay: '200ms', background: 'linear-gradient(135deg, #14B8A6, #10B981)'}}>
                <div className="relative z-10">
                    <div className="liquid-glass-pill inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium mb-3">Health Analytics Dashboard</div>
                    <h1 className="font-dmsans text-3xl font-black tracking-tight leading-tight">Vitals & Wellness Trends</h1>
                    <p className="text-teal-50 text-sm max-w-xl font-light mt-2">Monitor key health metrics and track your wellness journey over time.</p>
                </div>
                <WellnessWidget achievements={achievements} />
            </div>
            <div className="liquid-glass-card p-6 space-y-4 animate-fade-up" style={{animationDelay: '500ms'}}>
                <h3 className="font-dmsans text-lg font-bold border-b border-white/10 pb-2">At a Glance</h3>
                <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center text-sm"><span className="font-inter text-white/60">Total Log Entries</span> <span className="font-dmsans font-bold">34</span></div>
                    <div className="flex justify-between items-center text-sm"><span className="font-inter text-white/60">Current Log Streak</span> <span className="font-dmsans font-bold text-amber-300">{achievements.currentStreakDays} Days</span></div>
                    <div className="flex justify-between items-center text-sm"><span className="font-inter text-white/60">Wellness Points</span> <span className="font-dmsans font-bold text-green-300">{achievements.wellnessPoints}</span></div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-fade-up" style={{animationDelay: '300ms'}}>
            <Stat label="Blood Pressure" value={latestVitals.bp} unit="mmHg" icon={Heart} color="red" />
            <Stat label="Heart Rate" value={latestVitals.heart} unit="bpm" icon={GitCommitHorizontal} color="pink" />
            <Stat label="SpO2" value={`${latestVitals.spo2}%`} unit="Oxygen Sat" icon={BarChart} color="blue" />
            <Stat label="Weight" value={latestVitals.weight} unit="kg" icon={Weight} color="yellow" />
            <Stat label="Blood Sugar" value={latestVitals.sugar} unit="mg/dL" icon={Droplets} color="green" />
            <Stat label="Temperature" value={`${latestVitals.temp}°F`} unit="Body Temp" icon={Thermometer} color="purple" />
        </div>

        <VitalsForm userId={userId} onLogSuccess={() => {}} />

        <div className="space-y-4 animate-fade-up" style={{ animationDelay: '600ms' }}>
            <h2 className="font-dmsans text-xl font-bold text-white border-b border-white/10 pb-2">Health Trends</h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="liquid-glass-card p-4 h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="rgba(255,255,255,0.4)" />
                            <YAxis tick={{ fontSize: 11 }} stroke="rgba(255,255,255,0.4)" />
                            <Tooltip contentStyle={{backgroundColor: 'rgba(20,20,20,0.8)', border: '1px solid rgba(255,255,255,0.2)'}} />
                            <Legend wrapperStyle={{fontSize: "12px"}} />
                            <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={2} name="Systolic" dot={false} />
                            <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={2} name="Diastolic" dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                 <div className="liquid-glass-card p-4 h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="rgba(255,255,255,0.4)" />
                            <YAxis tick={{ fontSize: 11 }} stroke="rgba(255,255,255,0.4)" />
                            <Tooltip contentStyle={{backgroundColor: 'rgba(20,20,20,0.8)', border: '1px solid rgba(255,255,255,0.2)'}} />
                            <Line type="monotone" dataKey="bloodSugar" stroke="#10b981" strokeWidth={2} name="Glucose" dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    </div>
  );
};

export default VitalsDashboard;
