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
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import SectionHeading from '../components/ui/SectionHeading';

const CHART_COLORS = ['#0F766E', '#14B8A6', '#06B6D4', '#F59E0B', '#EF4444'];

const SummaryCard = ({ title, value, subtitle, accent = 'text-text-primary' }) => (
  <Card>
    <p className="text-text-secondary text-sm font-semibold uppercase tracking-wider">{title}</p>
    <p className={`text-3xl font-extrabold mt-2 ${accent}`}>{value ?? '-'}</p>
    {subtitle ? <p className="text-xs text-text-secondary mt-2">{subtitle}</p> : null}
  </Card>
);

const SkeletonCard = () => (
  <Card className="animate-pulse">
    <div className="h-4 w-32 bg-slate-200 rounded" />
    <div className="h-8 w-20 bg-slate-200 rounded mt-3" />
  </Card>
);

const SkeletonPanel = ({ titleWidth = 'w-40', height = 'h-72' }) => (
  <Card className="animate-pulse">
    <div className={`h-5 ${titleWidth} bg-slate-200 rounded mb-4`} />
    <div className={`${height} bg-slate-200 rounded`} />
  </Card>
);

const ChartCard = ({ title, children }) => (
  <Card>
    <h3 className="text-lg font-bold text-text-primary mb-6">{title}</h3>
    {children}
  </Card>
);

const EmptyChartState = ({ onUpload }) => (
  <div className="h-full flex flex-col items-center justify-center text-center px-6 py-8">
    <p className="text-text-secondary">No data yet — upload your first prescription to see insights</p>
    <Button
      onClick={onUpload}
      className="mt-4"
    >
      Upload Now
    </Button>
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
    <text x={x} y={y} fill="#ffffff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>
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
      return 'text-success';
    }
    if (adherenceRate >= 40) {
      return 'text-warning';
    }
    return 'text-danger';
  }, [adherenceRate]);

  const hasNoData = totalPrescriptions === 0;

  const commonTooltip = {
    contentStyle: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 8px 24px rgba(15,23,42,0.08)' },
    labelStyle: { color: '#0f172a', fontWeight: 'bold' }
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
    <div className="w-full">
      <SectionHeading
        title="Health Analytics"
        subtitle="Your medication and prescription insights, powered by Python analytics."
        action={
          <Button
            onClick={handleExportReport}
            disabled={isLoading || !data?.summary}
            className="flex items-center gap-2"
          >
            <FileDown size={16} />
            Export Report
          </Button>
        }
      />

      {error && (
        <div className="mb-6 bg-red-50 border border-danger/30 text-danger px-4 py-3 rounded-custom text-sm font-semibold">
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
                    <ResponsiveContainer width="100%" height={320}>
                      <LineChart data={data.timeline} margin={{ top: 12, right: 16, left: -20, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" stroke="#64748b" />
                        <YAxis stroke="#64748b" allowDecimals={false} />
                        <Tooltip {...commonTooltip} />
                        <Line type="monotone" dataKey="count" name="Uploads" stroke="#0F766E" strokeWidth={3} activeDot={{ r: 8 }} />
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
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={data.top_medications} margin={{ top: 10, right: 12, left: -20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" stroke="#64748b" interval={0} angle={-35} textAnchor="end" height={70} />
                      <YAxis stroke="#64748b" allowDecimals={false} />
                      <Tooltip
                        {...commonTooltip}
                        formatter={(value) => [`${value}`, 'Count']}
                        labelFormatter={(label) => `Medication: ${label}`}
                      />
                      <Bar dataKey="count" name="Prescribed Count" fill="#0F766E" radius={[6, 6, 0, 0]} barSize={34} />
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
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart
                      layout="vertical"
                      data={data.top_diagnoses}
                      margin={{ top: 10, right: 16, left: 20, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" stroke="#64748b" allowDecimals={false} />
                      <YAxis dataKey="diagnosis" type="category" stroke="#64748b" width={100} />
                      <Tooltip
                        {...commonTooltip}
                        formatter={(value) => [`${value}`, 'Count']}
                        labelFormatter={(label) => `Diagnosis: ${label}`}
                      />
                      <Bar dataKey="count" fill="#14B8A6" radius={[0, 6, 6, 0]} barSize={18} />
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
                    <ResponsiveContainer width="100%" height={320}>
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
                          formatter={(value) => <span className="text-text-secondary text-sm">{value}</span>}
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
                      <div className="absolute left-[11px] top-1 bottom-1 w-px bg-border" />
                      {(data.recent_prescriptions || []).map((item) => (
                        <div key={item.id} className="relative mb-6 last:mb-0">
                          <div className="absolute -left-[14px] top-2 w-3 h-3 rounded-full bg-secondary border border-white" />
                          <Card className="p-4 bg-background border border-border">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-sm text-text-primary font-bold">{formatDate(item.date)}</p>
                              {item.is_verified ? (
                                <Badge variant="success">Verified</Badge>
                              ) : (
                                <Badge variant="warning">Pending Verification</Badge>
                              )}
                            </div>
                            <p className="text-text-secondary text-sm mt-1">Doctor: {item.doctor_name || 'UNCLEAR'}</p>
                            <p className="text-text-secondary text-sm">Medications: {item.medication_count || 0}</p>
                          </Card>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ChartCard>
            </div>
          </div>

          {hasNoData ? (
            <Card className="mt-6 p-6 text-center">
              <p className="text-text-secondary">No data yet — upload your first prescription to see insights</p>
              <Button
                onClick={() => navigate('/upload')}
                className="mt-4"
              >
                Upload Now
              </Button>
            </Card>
          ) : null}
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
