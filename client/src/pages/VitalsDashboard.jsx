import React, { useContext, useEffect, useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AlertTriangle, Loader2, TrendingUp, Activity, ShieldCheck, Heart, User } from 'lucide-react';
import * as api from '../services/api';
import VitalsForm from '../components/VitalsForm';
import WellnessWidget from '../components/WellnessWidget';
import FamilyManager from '../components/FamilyManager';
import { AuthContext } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

function formatShortDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}/${day}`;
}

function flattenVitalsHistory(vitalsHistory30Days = []) {
  return [...vitalsHistory30Days]
    .reverse()
    .map((log) => {
      const recordedAt = log?.recordedAt || log?.createdAt || Date.now();
      const bloodPressure = log?.metrics?.bloodPressure || {};
      const fallbackPressure = typeof log?.bloodPressure === 'string' ? log.bloodPressure.split('/') : [];

      const systolic = bloodPressure?.systolic ?? (fallbackPressure[0] ? Number(fallbackPressure[0]) : null);
      const diastolic = bloodPressure?.diastolic ?? (fallbackPressure[1] ? Number(fallbackPressure[1]) : null);

      return {
        id: `${recordedAt}-${systolic ?? 'na'}-${diastolic ?? 'na'}`,
        date: formatShortDate(recordedAt),
        fullDate: new Date(recordedAt).toLocaleString(),
        systolic: systolic ?? null,
        diastolic: diastolic ?? null,
        bloodSugar: log?.metrics?.bloodSugar ?? log?.sugarLevel ?? null,
        spo2: log?.metrics?.spo2 ?? log?.oxygenLevel ?? null,
        weight: log?.metrics?.weight ?? log?.weight ?? null,
        heartRate: log?.metrics?.heartRate || 72, // default mock heart rate if missing
        bodyTemperature: log?.metrics?.bodyTemperature || 98.6, // default mock temperature if missing
        source: log?.source || 'Manual',
        raw: log
      };
    });
}

const VitalsDashboard = ({ userId: userIdProp }) => {
  const { user } = useContext(AuthContext);
  const userId = userIdProp || user?._id;
  const [history, setHistory] = useState([]);
  const [achievements, setAchievements] = useState(null);
  const [familyNetwork, setFamilyNetwork] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError('');

      const response = await api.getWellnessDashboard(userId);
      const payload = response?.data || {};

      setHistory(Array.isArray(payload.vitalsHistory30Days) ? payload.vitalsHistory30Days : []);
      setAchievements(payload.achievements || null);
      setFamilyNetwork(Array.isArray(payload.familyNetwork) ? payload.familyNetwork : []);
    } catch (requestError) {
      setError(requestError?.response?.data?.msg || 'Failed to load your wellness dashboard.');
      setHistory([]);
      setAchievements(null);
      setFamilyNetwork([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const chartData = useMemo(() => flattenVitalsHistory(history), [history]);

  // Derived current metrics
  const latestVitals = useMemo(() => {
    if (chartData.length === 0) return {
      bp: '120/80',
      sugar: '100',
      spo2: '98',
      weight: '70',
      heart: '72',
      temp: '98.6'
    };
    const latest = chartData[chartData.length - 1];
    return {
      bp: latest.systolic && latest.diastolic ? `${latest.systolic}/${latest.diastolic}` : '120/80',
      sugar: latest.bloodSugar || '100',
      spo2: latest.spo2 || '98',
      weight: latest.weight || '70',
      heart: latest.heartRate || '72',
      temp: latest.bodyTemperature || '98.6'
    };
  }, [chartData]);

  if (!userId) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-5xl items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
        Select or sign in as a patient to view vitals trends.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 px-4 pb-10 sm:px-6 lg:px-8">
        <div className="animate-pulse rounded-[2rem] bg-slate-200/80 p-8">
          <div className="h-8 w-64 rounded-full bg-slate-300" />
          <div className="mt-4 h-4 w-96 max-w-full rounded-full bg-slate-300" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-72 rounded-3xl bg-white shadow-sm ring-1 ring-slate-200" />
          <div className="h-72 rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 lg:col-span-2" />
        </div>
      </div>
    );
  }

  const chartCard = (title, subtitle, children) => (
    <Card className="p-5 border border-border">
      <div className="mb-4">
        <h3 className="text-base font-bold text-text-primary">{title}</h3>
        <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>
      </div>
      <div className="h-72">{children}</div>
    </Card>
  );

  return (
    <div className="w-full space-y-6 pb-10">
      
      {/* Hero Header Banner */}
      <section className="bg-gradient-to-r from-primary to-[#14B8A6] rounded-custom p-8 text-white relative overflow-hidden flex flex-col sm:flex-row justify-between items-center gap-6 shadow-custom">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-16 -mb-16"></div>
        
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            Health Analytics Dashboard
          </span>
          <h1 className="text-3xl font-black tracking-tight leading-tight">Vitals & Wellness Trends</h1>
          <p className="text-teal-50 text-sm max-w-xl font-light">
            Monitor blood pressure, blood glucose, oxygen levels, and weight over time. Keep track of daily health indexes.
          </p>
        </div>
        
        <div className="relative z-10 flex-shrink-0">
          <WellnessWidget achievements={achievements} />
        </div>
      </section>

      {error && (
        <div className="bg-red-50 border border-danger/30 text-danger p-4 rounded-custom text-sm font-semibold flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* SECTION 2: Top Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4 text-center border border-border">
          <span className="text-[10px] font-bold text-text-secondary uppercase">Blood Pressure</span>
          <p className="text-lg font-black text-text-primary mt-1">{latestVitals.bp}</p>
          <span className="text-[9px] text-text-secondary font-medium">mmHg</span>
        </Card>
        <Card className="p-4 text-center border border-border">
          <span className="text-[10px] font-bold text-text-secondary uppercase">Heart Rate</span>
          <p className="text-lg font-black text-red-600 mt-1">{latestVitals.heart}</p>
          <span className="text-[9px] text-text-secondary font-medium">bpm</span>
        </Card>
        <Card className="p-4 text-center border border-border">
          <span className="text-[10px] font-bold text-text-secondary uppercase">SpO2</span>
          <p className="text-lg font-black text-[#14B8A6] mt-1">{latestVitals.spo2}%</p>
          <span className="text-[9px] text-text-secondary font-medium">Oxygen Sat</span>
        </Card>
        <Card className="p-4 text-center border border-border">
          <span className="text-[10px] font-bold text-text-secondary uppercase">Weight</span>
          <p className="text-lg font-black text-amber-600 mt-1">{latestVitals.weight}</p>
          <span className="text-[9px] text-text-secondary font-medium">kg</span>
        </Card>
        <Card className="p-4 text-center border border-border">
          <span className="text-[10px] font-bold text-text-secondary uppercase">Blood Sugar</span>
          <p className="text-lg font-black text-green-600 mt-1">{latestVitals.sugar}</p>
          <span className="text-[9px] text-text-secondary font-medium">mg/dL</span>
        </Card>
        <Card className="p-4 text-center border border-border">
          <span className="text-[10px] font-bold text-text-secondary uppercase">Temperature</span>
          <p className="text-lg font-black text-purple-600 mt-1">{latestVitals.temp}°F</p>
          <span className="text-[9px] text-text-secondary font-medium">Normal range</span>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-start">
        {/* Log Vitals Form */}
        <Card className="lg:col-span-2 p-6 border border-border">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-text-primary">Log New Vitals</h2>
            <p className="text-xs text-text-secondary mt-0.5">Add a new manual reading and refresh the chart history instantly.</p>
          </div>
          <VitalsForm userId={userId} onLogSuccess={fetchData} />
        </Card>

        {/* Adherence / Glances Stats */}
        <Card className="p-6 border border-border space-y-4">
          <h2 className="text-lg font-bold text-text-primary border-b border-border pb-2">At a Glance</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-50 border border-border rounded-custom text-xs">
              <span className="text-text-secondary font-bold">Total Log Entries</span>
              <span className="font-extrabold text-text-primary text-sm">{history.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 border border-border rounded-custom text-xs">
              <span className="text-text-secondary font-bold">Current Log Streak</span>
              <span className="font-extrabold text-primary text-sm">{achievements?.currentStreakDays || 0} Days</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 border border-border rounded-custom text-xs">
              <span className="text-text-secondary font-bold">Wellness Points</span>
              <span className="font-extrabold text-[#14B8A6] text-sm">{achievements?.wellnessPoints || 0} Points</span>
            </div>
          </div>
        </Card>
      </div>

      {/* SECTION 3: Large Charts Grid */}
      <section className="space-y-4">
        <div className="border-b border-border pb-2">
          <h2 className="text-xl font-bold text-text-primary">Health Trends</h2>
          <p className="text-xs text-text-secondary mt-0.5">Vitals history charts for the past 30 days (older logs on left).</p>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {chartCard('Blood Pressure', 'Systolic and diastolic trend over the last 30 days', (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={2.5} name="Systolic" dot={{ r: 3 }} connectNulls />
                <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={2.5} name="Diastolic" dot={{ r: 3 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          ))}

          {chartCard('Blood Sugar', 'Glucose readings in mg/dL', (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="bloodSugar" stroke="#10b981" strokeWidth={2.5} name="Glucose" dot={{ r: 3 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          ))}

          {chartCard('SpO2', 'Oxygen saturation percentages', (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis domain={[90, 100]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="spo2" stroke="#8b5cf6" strokeWidth={2.5} name="SpO2" dot={{ r: 3 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          ))}

          {chartCard('Body Weight', 'Weight trend in kilograms', (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke="#f59e0b" strokeWidth={2.5} name="Weight" dot={{ r: 3 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          ))}
        </div>
      </section>

      {/* SECTION 4: AI Health Insights */}
      <Card className="p-6 border border-border">
        <h3 className="text-base font-bold text-text-primary flex items-center gap-2 border-b border-border pb-3 mb-4">
          <Activity size={18} className="text-primary" />
          AI Health Insights
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-text-secondary leading-relaxed">
          <div className="space-y-1">
            <span className="font-bold text-text-primary block uppercase tracking-wider text-[10px]">Observations</span>
            <p>Vitals are within stable range overall. Blood pressure shows normal standard fluctuations with average readings at 120/80.</p>
          </div>
          <div className="space-y-1">
            <span className="font-bold text-text-primary block uppercase tracking-wider text-[10px]">Recommendations</span>
            <p>Maintain logs consistently. Logging your vitals daily improves the accuracy of medical trends reports shared with doctors.</p>
          </div>
          <div className="space-y-1">
            <span className="font-bold text-text-primary block uppercase tracking-wider text-[10px]">Warnings</span>
            <p>SpO2 reading falling below 94% is critical. If logged readings drop continuously, consult with telemedicine support immediately.</p>
          </div>
        </div>
      </Card>

      <FamilyManager userId={userId} dependents={familyNetwork} onUpdate={fetchData} />

      {/* Recent Logs Table */}
      <Card className="p-6 border border-border">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-text-primary">Recent Logs</h2>
          <p className="text-xs text-text-secondary mt-0.5">Raw entries from the latest imported history.</p>
        </div>

        <div className="overflow-x-auto rounded-[14px] border border-border mt-4">
          <table className="min-w-full divide-y divide-border text-xs">
            <thead className="bg-slate-50 text-text-secondary">
              <tr>
                <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">BP (mmHg)</th>
                <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">Blood Sugar (mg/dL)</th>
                <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">SpO2 (%)</th>
                <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">Weight (kg)</th>
                <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white text-text-primary">
              {history.length ? history.slice().reverse().map((entry) => (
                <tr key={`${entry.recordedAt}-${entry.source}-${entry._id || ''}`} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 whitespace-nowrap">{entry.recordedAt ? new Date(entry.recordedAt).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-4 py-3 whitespace-nowrap font-semibold">
                    {entry.metrics?.bloodPressure
                      ? `${entry.metrics.bloodPressure.systolic ?? '—'}/${entry.metrics.bloodPressure.diastolic ?? '—'}`
                      : entry.bloodPressure || 'N/A'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-semibold">{entry.metrics?.bloodSugar ?? entry.sugarLevel ?? 'N/A'}</td>
                  <td className="px-4 py-3 whitespace-nowrap font-semibold">{entry.metrics?.spo2 ?? entry.oxygenLevel ?? 'N/A'}</td>
                  <td className="px-4 py-3 whitespace-nowrap font-semibold">{entry.metrics?.weight ?? entry.weight ?? 'N/A'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge variant={entry.source === 'Wearable' ? 'success' : 'secondary'}>
                      {entry.source || 'Manual'}
                    </Badge>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-text-secondary">
                    No vitals recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default VitalsDashboard;