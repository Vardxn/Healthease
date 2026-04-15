import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { analyticsAPI } from '../services/api';

const COLORS = ['#22d3ee', '#60a5fa', '#a78bfa', '#34d399', '#f59e0b', '#f87171'];

const SummaryCard = ({ title, value }) => (
  <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 shadow-lg">
    <p className="text-gray-400 text-sm font-medium">{title}</p>
    <p className="text-white text-2xl font-bold mt-2">{value ?? '-'}</p>
  </div>
);

const SkeletonCard = () => (
  <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 animate-pulse">
    <div className="h-4 w-32 bg-gray-700 rounded" />
    <div className="h-8 w-20 bg-gray-700 rounded mt-3" />
  </div>
);

const SkeletonChart = () => (
  <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 animate-pulse">
    <div className="h-5 w-40 bg-gray-700 rounded mb-4" />
    <div className="h-72 bg-gray-700 rounded" />
  </div>
);

const formatDate = (isoString) => {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString();
};

const AnalyticsDashboard = () => {
  const [data, setData] = useState({
    timeline: [],
    top_medications: [],
    medication_frequency: [],
    summary: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await analyticsAPI.getDashboard();
        setData(response.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to load analytics dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const hasAnyData = useMemo(() => {
    if (!data?.summary) return false;
    return (data.summary.total_prescriptions || 0) > 0;
  }, [data]);

  return (
    <div className="min-h-screen bg-gray-900 text-white rounded-2xl p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Health Analytics</h1>
        <p className="text-gray-400 mt-2">Your medication and prescription insights, powered by Python analytics.</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <SkeletonChart />
            <SkeletonChart />
            <div className="xl:col-span-2">
              <SkeletonChart />
            </div>
          </div>
        </>
      ) : !hasAnyData ? (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-10 text-center">
          <h2 className="text-2xl font-semibold">No analytics yet</h2>
          <p className="text-gray-400 mt-2">Upload your first prescription to start seeing trends and insights.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <SummaryCard title="Total Prescriptions" value={data.summary?.total_prescriptions ?? 0} />
            <SummaryCard title="Active Medications" value={data.summary?.active_medications ?? 0} />
            <SummaryCard title="Reminders Set" value={data.summary?.reminders_set ?? 0} />
            <SummaryCard title="Last Upload Date" value={formatDate(data.summary?.last_upload)} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
              <h3 className="text-lg font-semibold mb-4">Prescription Timeline (Last 6 Months)</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.timeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }}
                      labelStyle={{ color: '#f9fafb' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="count" name="Uploads" stroke="#22d3ee" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
              <h3 className="text-lg font-semibold mb-4">Top 5 Medications</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.top_medications}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" interval={0} angle={-15} textAnchor="end" height={60} />
                    <YAxis stroke="#9ca3af" allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }}
                      labelStyle={{ color: '#f9fafb' }}
                    />
                    <Legend />
                    <Bar dataKey="count" name="Prescribed Count" fill="#60a5fa" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="xl:col-span-2 bg-gray-800 border border-gray-700 rounded-xl p-5">
              <h3 className="text-lg font-semibold mb-4">Medication Frequency Breakdown</h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.medication_frequency}
                      dataKey="count"
                      nameKey="frequency"
                      cx="50%"
                      cy="50%"
                      outerRadius={140}
                      label
                    >
                      {data.medication_frequency.map((entry, index) => (
                        <Cell key={entry.frequency} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }}
                      labelStyle={{ color: '#f9fafb' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
