import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Filter, Loader2, Pill, Search, ShieldAlert } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { medicineAPI } from '../services/api';

const statusStyles = {
  pending: 'bg-blue-100 text-blue-800 border-blue-200',
  taken: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  skipped: 'bg-amber-100 text-amber-800 border-amber-200',
  missed: 'bg-rose-100 text-rose-800 border-rose-200'
};

const statusOptions = ['all', 'pending', 'taken', 'skipped', 'missed'];

const toISODate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

const fromISODate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatTime = (value) => {
  if (!value) return '--:--';
  return value;
};

const ReminderHistory = () => {
  const { isAuthenticated, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMedicineId, setSelectedMedicineId] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [medicinesRes, remindersRes] = await Promise.all([
        medicineAPI.getAll(),
        medicineAPI.getReminderHistory({
          medicineId: selectedMedicineId !== 'all' ? selectedMedicineId : undefined,
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
          startDate: dateFrom || undefined,
          endDate: dateTo || undefined
        })
      ]);

      setMedicines(medicinesRes.data.medicines || []);
      setReminders(remindersRes.data.reminders || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reminder history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const filteredReminders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return reminders.filter((reminder) => {
      const medicineName = reminder?.medicineId?.name || '';
      const matchesSearch = !term || medicineName.toLowerCase().includes(term);
      return matchesSearch;
    });
  }, [reminders, searchTerm]);

  const summary = useMemo(() => {
    const stats = { pending: 0, taken: 0, skipped: 0, missed: 0, total: 0 };
    filteredReminders.forEach((reminder) => {
      const status = reminder?.status || 'pending';
      if (stats[status] !== undefined) {
        stats[status] += 1;
      }
      stats.total += 1;
    });
    return stats;
  }, [filteredReminders]);

  const completionRate = useMemo(() => {
    if (!summary.total) return 0;
    return Math.round((summary.taken / summary.total) * 100);
  }, [summary]);

  const handleApplyFilters = async (event) => {
    event.preventDefault();
    await fetchData();
  };

  const handleReset = async () => {
    setSelectedMedicineId('all');
    setSelectedStatus('all');
    setDateFrom('');
    setDateTo('');
    setSearchTerm('');
    setError('');
    setLoading(true);
    try {
      const [medicinesRes, remindersRes] = await Promise.all([
        medicineAPI.getAll(),
        medicineAPI.getReminderHistory()
      ]);
      setMedicines(medicinesRes.data.medicines || []);
      setReminders(remindersRes.data.reminders || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset filters');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-primary-700 font-semibold">
          <Loader2 className="animate-spin" size={22} />
          Loading reminder history...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <section className="hero-surface rounded-[2rem] p-8 md:p-10 text-white overflow-hidden relative shadow-2xl">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.4),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.3),transparent_25%)]" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur">
              <CalendarDays size={16} /> Reminder history
            </div>
            <h1 className="mt-4 text-4xl md:text-5xl font-bold leading-tight">
              See taken, skipped, missed, and pending doses.
            </h1>
            <p className="mt-4 text-white/85 text-lg max-w-2xl">
              Filter by date and medicine to review how well the daily schedule is being followed.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 min-w-[260px]">
            <MetricCard label="Completion" value={`${completionRate}%`} />
            <MetricCard label="Total logs" value={summary.total} />
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <SummaryCard label="Taken" value={summary.taken} tone="emerald" />
        <SummaryCard label="Skipped" value={summary.skipped} tone="amber" />
        <SummaryCard label="Missed" value={summary.missed} tone="rose" />
        <SummaryCard label="Pending" value={summary.pending} tone="blue" />
        <SummaryCard label="Completion" value={`${completionRate}%`} tone="teal" />
      </section>

      <section className="glass-effect rounded-[1.75rem] p-6 shadow-xl">
        <form onSubmit={handleApplyFilters} className="grid grid-cols-1 xl:grid-cols-5 gap-4 items-end">
          <div className="xl:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Search medicine</label>
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by medicine name"
                className="w-full rounded-xl border border-gray-300 bg-white pl-11 pr-4 py-3 text-gray-800 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>
          </div>

          <FilterSelect
            label="Medicine"
            value={selectedMedicineId}
            onChange={setSelectedMedicineId}
            options={[
              { label: 'All medicines', value: 'all' },
              ...medicines.map((medicine) => ({ label: medicine.name, value: medicine._id }))
            ]}
          />

          <FilterSelect
            label="Status"
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={statusOptions.map((status) => ({ label: status === 'all' ? 'All statuses' : status, value: status }))}
          />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">From date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">To date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
          </div>

          <div className="xl:col-span-5 flex flex-wrap gap-3">
            <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-white font-semibold hover:bg-primary-700 transition">
              <Filter size={16} /> Apply filters
            </button>
            <button type="button" onClick={handleReset} className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-700 font-semibold hover:bg-gray-50 transition">
              Reset
            </button>
          </div>
        </form>
      </section>

      <section className="glass-effect rounded-[1.75rem] p-6 shadow-xl">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">History log</h2>
            <p className="text-gray-600">Filtered reminder records with status and schedule details.</p>
          </div>
        </div>

        {filteredReminders.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <Th>Medicine</Th>
                    <Th>Date</Th>
                    <Th>Time</Th>
                    <Th>Status</Th>
                    <Th>Notes</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredReminders.map((reminder) => (
                    <tr key={reminder._id} className="hover:bg-gray-50">
                      <Td>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center">
                            <Pill size={16} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{reminder?.medicineId?.name || 'Medicine'}</p>
                            <p className="text-xs text-gray-500">{reminder?.medicineId?.dosage || 'No dosage'}</p>
                          </div>
                        </div>
                      </Td>
                      <Td>{fromISODate(reminder.reminderDate)}</Td>
                      <Td>{formatTime(reminder.reminderTime)}</Td>
                      <Td>
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[reminder.status] || statusStyles.pending}`}>
                          {reminder.status}
                        </span>
                      </Td>
                      <Td>
                        <p className="text-sm text-gray-600">
                          {reminder.notes || reminder.takenAt || reminder.notificationSent ? 'Tracked' : 'No notes'}
                        </p>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

const MetricCard = ({ label, value }) => (
  <div className="rounded-2xl bg-white/15 backdrop-blur p-4">
    <p className="text-white/75 text-sm">{label}</p>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

const SummaryCard = ({ label, value, tone }) => {
  const toneMap = {
    emerald: 'from-emerald-500 to-emerald-400',
    amber: 'from-amber-500 to-orange-400',
    rose: 'from-rose-500 to-pink-400',
    blue: 'from-sky-500 to-cyan-400',
    teal: 'from-teal-500 to-cyan-500'
  };

  return (
    <div className="glass-effect rounded-2xl p-5 shadow-lg flex items-center gap-4">
      <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${toneMap[tone]} text-white flex items-center justify-center shadow-md`}>
        <Filter size={18} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

const FilterSelect = ({ label, value, onChange, options }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-semibold text-gray-700">{label}</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  </label>
);

const Th = ({ children }) => (
  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{children}</th>
);

const Td = ({ children }) => <td className="px-4 py-4 text-sm text-gray-700 align-top">{children}</td>;

const EmptyState = () => (
  <div className="rounded-2xl border border-dashed border-gray-300 bg-white/80 p-10 text-center">
    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
      <ShieldAlert size={24} />
    </div>
    <h3 className="font-semibold text-gray-800">No reminder history found</h3>
    <p className="mt-2 text-sm text-gray-600">Try widening the date range or switching to another medicine.</p>
  </div>
);

export default ReminderHistory;