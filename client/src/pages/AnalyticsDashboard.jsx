import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileDown } from 'lucide-react';
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
import { exportAnalyticsPDF } from '../utils/pdfExport';

const CHART_COLORS = ['#06b6d4', '#6366f1', '#10b981', '#f59e0b', '#ef4444'];

const SummaryCard = ({ title, value, subtitle, accent = 'text-white' }) => (
  <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-5 shadow-lg">
    <p className="text-slate-400 text-sm font-medium">{title}</p>
    <p className={`text-2xl font-bold mt-2 ${accent}`}>{value ?? '-'}</p>
    {subtitle ? <p className="text-xs text-slate-400 mt-2">{subtitle}</p> : null}
  </div>
);

const SkeletonCard = () => (
  <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-5 animate-pulse">
    <div className="h-4 w-32 bg-slate-700 rounded" />
    <div className="h-8 w-20 bg-slate-700 rounded mt-3" />
  </div>
);

const SkeletonPanel = ({ titleWidth = 'w-40', height = 'h-72' }) => (
  <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-5 animate-pulse">
    <div className={`h-5 ${titleWidth} bg-slate-700 rounded mb-4`} />
    <div className={`${height} bg-slate-700 rounded`} />
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-5 shadow-lg">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    {children}
  </div>
);

const EmptyChartState = ({ onUpload }) => (
  <div className="h-full flex flex-col items-center justify-center text-center px-6">
    <p className="text-slate-300">No data yet — upload your first prescription to see insights</p>
    <button
      type="button"
      onClick={onUpload}
      className="mt-4 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold transition-colors"
    >
      Upload Now
    </button>
  </div>
);

const formatDate = (isoString) => {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString();
};

const piePercentLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (!percent || percent < 0.05) {
    return null;
  }

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="#e2e8f0" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${Math.round(percent * 100)}%`}
    </text>
  );
};

const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    timeline: [],
    top_medications: [],
    medication_frequency: [],
    top_diagnoses: [],
    recent_prescriptions: [],
    summary: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const response = await analyticsAPI.getDashboard();
        setData(response.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to load analytics dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const totalPrescriptions = useMemo(() => data?.summary?.total_prescriptions || 0, [data]);
  const remindersSet = useMemo(() => data?.summary?.reminders_set || 0, [data]);

  const adherenceRate = useMemo(() => {
    if (totalPrescriptions <= 0) {
      return 0;
    }

    return Number(((remindersSet / totalPrescriptions) * 100).toFixed(1));
  }, [remindersSet, totalPrescriptions]);

  const adherenceTone = useMemo(() => {
    if (adherenceRate >= 70) {
      return 'text-emerald-400';
    }
    if (adherenceRate >= 40) {
      return 'text-amber-400';
    }
    return 'text-red-400';
  }, [adherenceRate]);

  const hasNoData = totalPrescriptions === 0;

  const commonTooltip = {
    contentStyle: { backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8 },
    labelStyle: { color: '#e2e8f0' }
  };

  const handleExportReport = () => {
    exportAnalyticsPDF({
      summary: {
        totalPrescriptions: data?.summary?.total_prescriptions ?? 0,
        activeMedications: data?.summary?.active_medications ?? 0,
        remindersSet: data?.summary?.reminders_set ?? 0,
        lastUploadDate: data?.summary?.last_upload ?? ''
      },
      topMedications: data?.top_medications || [],
      timeline: data?.timeline || [],
      medicationFrequency: data?.medication_frequency || [],
      recentPrescriptions: (data?.recent_prescriptions || []).map((item) => ({
        date: item?.date,
        doctorName: item?.doctor_name,
        medicationCount: item?.medication_count,
        isVerified: Boolean(item?.is_verified)
      }))
    });
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white rounded-2xl p-6 md:p-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Health Analytics</h1>
          <p className="text-slate-400 mt-2">Your medication and prescription insights, powered by Python analytics.</p>
        </div>
        <button
          type="button"
          onClick={handleExportReport}
          disabled={isLoading || !data?.summary}
          className="inline-flex items-center gap-2 self-start px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-600 disabled:text-slate-300 disabled:cursor-not-allowed text-white font-semibold transition-colors"
        >
          <FileDown size={16} />
          Export Report
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {isLoading ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 mb-6">
            <div className="xl:col-span-3">
              <SkeletonPanel height="h-80" />
            </div>
            <div className="xl:col-span-2">
              <SkeletonPanel titleWidth="w-32" height="h-80" />
            </div>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            <SkeletonPanel height="h-80" />
            <SkeletonPanel height="h-80" />
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            <div className="xl:col-span-2">
              <SkeletonPanel height="h-80" />
            </div>
            <div className="xl:col-span-3">
              <SkeletonPanel height="h-80" />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <SummaryCard title="Total Prescriptions" value={data.summary?.total_prescriptions ?? 0} />
            <SummaryCard title="Active Medications" value={data.summary?.active_medications ?? 0} />
            <SummaryCard title="Reminders Set" value={data.summary?.reminders_set ?? 0} />
            <SummaryCard title="Last Upload Date" value={formatDate(data.summary?.last_upload)} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 mb-6">
            <div className="xl:col-span-3">
              <ChartCard title="Prescription Timeline (Last 6 Months)">
                <div className="h-80">
                  {hasNoData ? (
                    <EmptyChartState onUpload={() => navigate('/upload')} />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.timeline} margin={{ top: 12, right: 16, left: 0, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="month" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" allowDecimals={false} />
                        <Tooltip {...commonTooltip} />
                        <Line type="monotone" dataKey="count" name="Uploads" stroke="#06b6d4" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </ChartCard>
            </div>

            <div className="xl:col-span-2">
              <SummaryCard
                title="Reminder Adherence"
                value={`${adherenceRate}%`}
                accent={adherenceTone}
                subtitle={`${remindersSet}/${totalPrescriptions} prescriptions with reminders enabled`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            <ChartCard title="Top 5 Medications">
              <div className="h-80">
                {hasNoData ? (
                  <EmptyChartState onUpload={() => navigate('/upload')} />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.top_medications} margin={{ top: 10, right: 12, left: 0, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" interval={0} angle={-35} textAnchor="end" height={70} />
                      <YAxis stroke="#94a3b8" allowDecimals={false} />
                      <Tooltip
                        {...commonTooltip}
                        formatter={(value) => [`${value}`, 'Count']}
                        labelFormatter={(label) => `Medication: ${label}`}
                      />
                      <Bar dataKey="count" name="Prescribed Count" fill="#06b6d4" radius={[4, 4, 0, 0]} barSize={34} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </ChartCard>

            <ChartCard title="Top Diagnoses">
              <div className="h-80">
                {hasNoData ? (
                  <EmptyChartState onUpload={() => navigate('/upload')} />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={data.top_diagnoses}
                      margin={{ top: 10, right: 16, left: 8, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis type="number" stroke="#94a3b8" allowDecimals={false} />
                      <YAxis dataKey="diagnosis" type="category" stroke="#94a3b8" width={130} />
                      <Tooltip
                        {...commonTooltip}
                        formatter={(value) => [`${value}`, 'Count']}
                        labelFormatter={(label) => `Diagnosis: ${label}`}
                      />
                      <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            <div className="xl:col-span-2">
              <ChartCard title="Medication Frequency Breakdown">
                <div className="h-[320px]">
                  {hasNoData ? (
                    <EmptyChartState onUpload={() => navigate('/upload')} />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.medication_frequency}
                          dataKey="count"
                          nameKey="frequency"
                          cx="50%"
                          cy="44%"
                          outerRadius={92}
                          labelLine={false}
                          label={piePercentLabel}
                        >
                          {data.medication_frequency.map((entry, index) => (
                            <Cell key={entry.frequency} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          {...commonTooltip}
                          formatter={(value) => [`${value}`, 'Count']}
                          labelFormatter={(label) => `Frequency: ${label}`}
                        />
                        <Legend
                          verticalAlign="bottom"
                          align="center"
                          wrapperStyle={{ paddingTop: 16 }}
                          formatter={(value) => <span style={{ color: '#cbd5e1' }}>{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </ChartCard>
            </div>

            <div className="xl:col-span-3">
              <ChartCard title="Recent Prescriptions">
                <div className="h-80 overflow-y-auto pr-2">
                  {hasNoData ? (
                    <EmptyChartState onUpload={() => navigate('/upload')} />
                  ) : (
                    <div className="relative pl-6">
                      <div className="absolute left-[11px] top-1 bottom-1 w-px bg-slate-600" />
                      {(data.recent_prescriptions || []).map((item) => (
                        <div key={item.id} className="relative mb-6 last:mb-0">
                          <div className="absolute -left-[14px] top-1.5 w-3 h-3 rounded-full bg-cyan-500 border border-cyan-300" />
                          <div className="bg-slate-800/70 border border-slate-700 rounded-lg p-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-sm text-slate-200 font-medium">{formatDate(item.date)}</p>
                              {item.is_verified ? (
                                <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-700">
                                  Verified
                                </span>
                              ) : null}
                            </div>
                            <p className="text-slate-300 mt-1">Doctor: {item.doctor_name || 'UNCLEAR'}</p>
                            <p className="text-slate-400 text-sm mt-1">Medications: {item.medication_count || 0}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ChartCard>
            </div>
          </div>

          {hasNoData ? (
            <div className="mt-6 bg-[#1e293b] border border-slate-700 rounded-xl p-6 text-center">
              <p className="text-slate-300">No data yet — upload your first prescription to see insights</p>
              <button
                type="button"
                onClick={() => navigate('/upload')}
                className="mt-4 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold transition-colors"
              >
                Upload Now
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
