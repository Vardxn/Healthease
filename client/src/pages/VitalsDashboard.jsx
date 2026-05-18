import { useContext, useEffect, useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AlertTriangle, Loader2 } from 'lucide-react';
import * as api from '../services/api';
import VitalsForm from '../components/VitalsForm';
import WellnessWidget from '../components/WellnessWidget';
import FamilyManager from '../components/FamilyManager';
import { AuthContext } from '../context/AuthContext';

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
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="h-72">{children}</div>
    </section>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 pb-10 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-teal-900 p-8 text-white shadow-2xl">
        <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-200/80">Step 3 Wellness</p>
            <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">Vitals Dashboard</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-200 sm:text-base">
              Track your blood pressure, glucose, SpO2, and weight over time with a compact view optimized for daily health monitoring.
            </p>
          </div>
          <div className="lg:justify-self-end">
            <WellnessWidget achievements={achievements} />
          </div>
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900">Log New Vitals</h2>
            <p className="mt-1 text-sm text-slate-500">Add a new manual reading and refresh the chart history instantly.</p>
          </div>
          <VitalsForm userId={userId} onLogSuccess={fetchData} />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
          <h2 className="text-xl font-bold text-slate-900">At a Glance</h2>
          <div className="mt-4 space-y-3">
            <MiniStat label="Entries" value={history.length} />
            <MiniStat label="Current Streak" value={`${achievements?.currentStreakDays || 0} days`} />
            <MiniStat label="Points" value={achievements?.wellnessPoints || 0} />
          </div>
        </div>
      </div>

      <section className="space-y-6">
        <div className="flex flex-col gap-2 border-b border-slate-200 pb-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Health Trends</h2>
            <p className="mt-1 text-sm text-slate-500">Older readings appear on the left and newer readings on the right.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {chartCard('Blood Pressure', 'Systolic and diastolic trend over the last 30 days', (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" width={34} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={2.5} name="Systolic" dot={{ r: 3 }} connectNulls />
                <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={2.5} name="Diastolic" dot={{ r: 3 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          ))}

          {chartCard('Blood Sugar', 'Glucose readings in mg/dL', (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" width={34} />
                <Tooltip />
                <Line type="monotone" dataKey="bloodSugar" stroke="#10b981" strokeWidth={2.5} name="Glucose" dot={{ r: 3 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          ))}

          {chartCard('SpO2', 'Oxygen saturation percentages', (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis domain={[90, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" width={34} />
                <Tooltip />
                <Line type="monotone" dataKey="spo2" stroke="#8b5cf6" strokeWidth={2.5} name="SpO2" dot={{ r: 3 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          ))}

          {chartCard('Body Weight', 'Weight trend in kilograms', (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" width={34} />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke="#f59e0b" strokeWidth={2.5} name="Weight" dot={{ r: 3 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          ))}
        </div>
      </section>

      <FamilyManager userId={userId} dependents={familyNetwork} onUpdate={fetchData} />

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Recent Logs</h2>
            <p className="mt-1 text-sm text-slate-500">Raw entries from the latest imported history.</p>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-left font-semibold">BP</th>
                <th className="px-4 py-3 text-left font-semibold">Blood Sugar</th>
                <th className="px-4 py-3 text-left font-semibold">SpO2</th>
                <th className="px-4 py-3 text-left font-semibold">Weight</th>
                <th className="px-4 py-3 text-left font-semibold">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
              {history.length ? history.slice().reverse().map((entry) => (
                <tr key={`${entry.recordedAt}-${entry.source}-${entry._id || ''}`}>
                  <td className="px-4 py-3 whitespace-nowrap">{entry.recordedAt ? new Date(entry.recordedAt).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {entry.metrics?.bloodPressure
                      ? `${entry.metrics.bloodPressure.systolic ?? '—'}/${entry.metrics.bloodPressure.diastolic ?? '—'}`
                      : entry.bloodPressure || 'N/A'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{entry.metrics?.bloodSugar ?? entry.sugarLevel ?? 'N/A'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{entry.metrics?.spo2 ?? entry.oxygenLevel ?? 'N/A'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{entry.metrics?.weight ?? entry.weight ?? 'N/A'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{entry.source || 'Manual'}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-4 py-10 text-center text-slate-500">
                    No vitals recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}

export default VitalsDashboard;