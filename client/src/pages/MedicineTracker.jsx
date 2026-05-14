import { useContext, useEffect, useMemo, useState } from 'react';
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
  X
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { medicineAPI } from '../services/api';

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

const statusStyles = {
  active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  paused: 'bg-amber-100 text-amber-800 border-amber-200',
  completed: 'bg-slate-100 text-slate-700 border-slate-200',
  stopped: 'bg-rose-100 text-rose-800 border-rose-200'
};

const reminderStyles = {
  pending: 'bg-blue-100 text-blue-800 border-blue-200',
  taken: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  skipped: 'bg-amber-100 text-amber-800 border-amber-200',
  missed: 'bg-rose-100 text-rose-800 border-rose-200'
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

const formatReminderDate = (value) => {
  if (!value) return 'Today';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Today';
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

const MedicineTracker = () => {
  const { isAuthenticated, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [stats, setStats] = useState({ pending: 0, taken: 0, skipped: 0, missed: 0, total: 0 });
  const [refillList, setRefillList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [medicinesRes, remindersRes, statsRes, refillRes] = await Promise.allSettled([
        medicineAPI.getAll(),
        medicineAPI.getTodayReminders(),
        medicineAPI.getReminderStatsToday(),
        medicineAPI.getRefillNeeded()
      ]);

      if (medicinesRes.status === 'fulfilled') {
        setMedicines(medicinesRes.value.data.medicines || []);
      }

      if (remindersRes.status === 'fulfilled') {
        setReminders(remindersRes.value.data.reminders || []);
      }

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data.stats || stats);
      }

      if (refillRes.status === 'fulfilled') {
        setRefillList(refillRes.value.data.medicines || []);
      }
    } catch (err) {
      setError('Failed to load medicine tracker');
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

  const activeMedicines = useMemo(
    () => medicines.filter((medicine) => medicine.status === 'active'),
    [medicines]
  );

  const refillAlerts = useMemo(
    () => refillList.length > 0 ? refillList : medicines.filter((medicine) => {
      if (medicine.quantityRemaining === null || medicine.quantityRemaining === undefined) return false;
      return medicine.quantityRemaining <= (medicine.refillThreshold || 7);
    }),
    [medicines, refillList]
  );

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(false);
  };

  const startCreate = () => {
    setForm(initialForm);
    setEditingId(null);
    setError('');
    setSuccess('');
    setShowForm(true);
  };

  const startEdit = (medicine) => {
    setForm({
      name: medicine.name || '',
      dosage: medicine.dosage || '',
      frequency: medicine.frequency || 'once daily',
      duration: medicine.duration || 7,
      startDate: medicine.startDate ? new Date(medicine.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      reminderTime: medicine.reminderTime || '08:00',
      instructions: medicine.instructions || '',
      takeWithFood: Boolean(medicine.takeWithFood),
      quantityRemaining: medicine.quantityRemaining ?? '',
      refillThreshold: medicine.refillThreshold ?? 7,
      sideEffectsText: Array.isArray(medicine.sideEffects) ? medicine.sideEffects.join(', ') : ''
    });
    setEditingId(medicine._id);
    setError('');
    setSuccess('');
    setShowForm(true);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submitForm = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name || !form.dosage || !form.frequency || !form.duration || !form.reminderTime) {
      setError('Please complete the required medicine fields.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      dosage: form.dosage.trim(),
      frequency: form.frequency,
      duration: Number(form.duration),
      startDate: form.startDate,
      reminderTime: form.reminderTime,
      instructions: form.instructions.trim(),
      takeWithFood: form.takeWithFood,
      quantityRemaining: form.quantityRemaining === '' ? null : Number(form.quantityRemaining),
      refillThreshold: Number(form.refillThreshold),
      sideEffects: parseSideEffects(form.sideEffectsText)
    };

    try {
      setSaving(true);
      if (editingId) {
        await medicineAPI.update(editingId, payload);
        setSuccess('Medicine updated successfully.');
      } else {
        await medicineAPI.add(payload);
        setSuccess('Medicine added successfully and reminders were generated.');
      }
      resetForm();
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save medicine');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (medicineId) => {
    if (!window.confirm('Delete this medicine and its reminders?')) return;
    try {
      await medicineAPI.remove(medicineId);
      setSuccess('Medicine deleted.');
      await fetchData();
    } catch (err) {
      setError('Failed to delete medicine');
    }
  };

  const handlePauseToggle = async (medicine) => {
    try {
      await medicineAPI.pause(medicine._id);
      setSuccess(medicine.status === 'paused' ? 'Medicine resumed.' : 'Medicine paused.');
      await fetchData();
    } catch (err) {
      setError('Failed to update medicine status');
    }
  };

  const handleComplete = async (medicineId) => {
    try {
      await medicineAPI.complete(medicineId);
      setSuccess('Medicine marked as completed.');
      await fetchData();
    } catch (err) {
      setError('Failed to complete medicine');
    }
  };

  const handleMarkTaken = async (reminderId) => {
    try {
      await medicineAPI.markReminderTaken(reminderId, 'Taken on schedule');
      setSuccess('Reminder marked as taken.');
      await fetchData();
    } catch (err) {
      setError('Failed to update reminder');
    }
  };

  const handleMarkSkipped = async (reminderId) => {
    try {
      await medicineAPI.markReminderSkipped(reminderId, 'Skipped by user');
      setSuccess('Reminder marked as skipped.');
      await fetchData();
    } catch (err) {
      setError('Failed to update reminder');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-primary-700 font-semibold">
          <Loader2 className="animate-spin" size={22} />
          Loading medicine tracker...
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
              <Pill size={16} /> Daily medicine tracking
            </div>
            <h1 className="mt-4 text-4xl md:text-5xl font-bold leading-tight">
              Stay on schedule with once-a-day reminders.
            </h1>
            <p className="mt-4 text-white/85 text-lg max-w-2xl">
              Track medicines, mark doses as taken, and get refill alerts without losing your daily rhythm.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 min-w-[260px]">
            <div className="rounded-2xl bg-white/15 backdrop-blur p-4">
              <p className="text-white/75 text-sm">Active medicines</p>
              <p className="text-3xl font-bold">{activeMedicines.length}</p>
            </div>
            <div className="rounded-2xl bg-white/15 backdrop-blur p-4">
              <p className="text-white/75 text-sm">Today reminders</p>
              <p className="text-3xl font-bold">{stats.total || reminders.length}</p>
            </div>
          </div>
        </div>
      </section>

      {(error || success) && (
        <div className={`rounded-2xl border px-4 py-3 ${error ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
          {error || success}
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={<Pill size={18} />} label="Total medicines" value={medicines.length} tone="teal" />
        <StatCard icon={<CheckCircle2 size={18} />} label="Taken today" value={stats.taken || 0} tone="green" />
        <StatCard icon={<CircleAlert size={18} />} label="Pending today" value={stats.pending || 0} tone="blue" />
        <StatCard icon={<ShieldAlert size={18} />} label="Refill alerts" value={refillAlerts.length} tone="orange" />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 glass-effect rounded-[1.75rem] p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Medicines</h2>
              <p className="text-gray-600">Manage daily medications and their status.</p>
            </div>
            <button
              onClick={startCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-white font-semibold hover:bg-primary-700 transition shadow-md"
            >
              <CirclePlus size={18} /> Add medicine
            </button>
          </div>

          {showForm && (
            <form onSubmit={submitForm} className="mb-6 rounded-2xl border border-gray-200 bg-white/90 p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-bold text-gray-800">
                  {editingId ? 'Edit medicine' : 'Add new medicine'}
                </h3>
                <button type="button" onClick={resetForm} className="text-gray-500 hover:text-gray-800">
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Medicine name" value={form.name} onChange={(value) => handleChange('name', value)} required />
                <Input label="Dosage" value={form.dosage} onChange={(value) => handleChange('dosage', value)} required />
                <Select label="Frequency" value={form.frequency} onChange={(value) => handleChange('frequency', value)} options={frequencyOptions} />
                <Input label="Duration (days)" type="number" value={form.duration} onChange={(value) => handleChange('duration', value)} required />
                <Input label="Start date" type="date" value={form.startDate} onChange={(value) => handleChange('startDate', value)} />
                <Input label="Reminder time" type="time" value={form.reminderTime} onChange={(value) => handleChange('reminderTime', value)} required />
                <Input label="Quantity remaining" type="number" value={form.quantityRemaining} onChange={(value) => handleChange('quantityRemaining', value)} />
                <Input label="Refill threshold" type="number" value={form.refillThreshold} onChange={(value) => handleChange('refillThreshold', value)} />
              </div>

              <Input
                label="Instructions"
                value={form.instructions}
                onChange={(value) => handleChange('instructions', value)}
                placeholder="Take after food, avoid alcohol, etc."
              />

              <Input
                label="Side effects (comma separated)"
                value={form.sideEffectsText}
                onChange={(value) => handleChange('sideEffectsText', value)}
                placeholder="Nausea, dizziness, sleepiness"
              />

              <label className="inline-flex items-center gap-3 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={form.takeWithFood}
                  onChange={(e) => handleChange('takeWithFood', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                Take with food
              </label>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-700 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-2.5 text-white font-semibold shadow-md disabled:opacity-60"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {editingId ? 'Update medicine' : 'Save medicine'}
                </button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {medicines.length === 0 ? (
              <EmptyState
                icon={<Pill size={26} />}
                title="No medicines yet"
                text="Add the medicines from your prescriptions to start tracking daily reminders."
                actionLabel="Add first medicine"
                onAction={startCreate}
              />
            ) : (
              medicines.map((medicine) => (
                <div key={medicine._id} className="rounded-2xl border border-white/60 bg-white/85 p-5 shadow-lg">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{medicine.name}</h3>
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[medicine.status] || statusStyles.active}`}>
                          {medicine.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1"><Pill size={14} /> {medicine.dosage}</span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1"><Clock3 size={14} /> {medicine.reminderTime}</span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1"><CalendarDays size={14} /> Ends {formatDate(medicine.endDate)}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <ActionButton icon={<PencilLine size={14} />} label="Edit" onClick={() => startEdit(medicine)} />
                      <ActionButton icon={<PauseCircle size={14} />} label={medicine.status === 'paused' ? 'Resume' : 'Pause'} onClick={() => handlePauseToggle(medicine)} />
                      <ActionButton icon={<CheckCircle2 size={14} />} label="Complete" onClick={() => handleComplete(medicine._id)} />
                      <ActionButton icon={<Trash2 size={14} />} label="Delete" danger onClick={() => handleDelete(medicine._id)} />
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <InfoCard label="Frequency" value={medicine.frequency} />
                    <InfoCard label="Duration" value={`${medicine.duration} days`} />
                    <InfoCard label="Remaining" value={medicine.quantityRemaining ?? 'N/A'} highlighted={medicine.quantityRemaining !== null && medicine.quantityRemaining !== undefined && medicine.quantityRemaining <= (medicine.refillThreshold || 7)} />
                  </div>

                  {medicine.instructions && (
                    <p className="mt-4 text-sm text-gray-600 bg-amber-50 border border-amber-100 rounded-xl p-3">
                      <strong>Instructions:</strong> {medicine.instructions}
                    </p>
                  )}

                  {medicine.sideEffects?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {medicine.sideEffects.map((effect) => (
                        <span key={effect} className="rounded-full bg-rose-50 text-rose-700 border border-rose-100 px-3 py-1 text-xs font-medium">
                          {effect}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-effect rounded-[1.75rem] p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-5">
              <BellRing className="text-primary-700" />
              <h2 className="text-2xl font-bold text-gray-800">Today's reminders</h2>
            </div>

            <div className="space-y-4">
              {reminders.length === 0 ? (
                <EmptyState
                  icon={<BellRing size={24} />}
                  title="No reminders for today"
                  text="When medicine schedules are created, today’s reminders will appear here."
                />
              ) : (
                reminders.map((reminder) => (
                  <div key={reminder._id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-gray-800">{reminder.medicineId?.name || 'Medicine'}</h3>
                        <p className="text-sm text-gray-600">{reminder.medicineId?.dosage}</p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${reminderStyles[reminder.status] || reminderStyles.pending}`}>
                        {reminder.status}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
                      <span className="rounded-full bg-gray-100 px-3 py-1">{formatReminderDate(reminder.reminderDate)}</span>
                      <span className="rounded-full bg-gray-100 px-3 py-1">{reminder.reminderTime}</span>
                    </div>

                    {reminder.status === 'pending' && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button onClick={() => handleMarkTaken(reminder._id)} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-white text-sm font-semibold hover:bg-emerald-700">
                          <CheckCircle2 size={14} /> Taken
                        </button>
                        <button onClick={() => handleMarkSkipped(reminder._id)} className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-3 py-2 text-white text-sm font-semibold hover:bg-amber-600">
                          <RotateCcw size={14} /> Skip
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-effect rounded-[1.75rem] p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-5">
              <ShieldAlert className="text-accent-600" />
              <h2 className="text-2xl font-bold text-gray-800">Refill watch</h2>
            </div>

            <div className="space-y-3">
              {refillAlerts.length === 0 ? (
                <EmptyState
                  icon={<ShieldAlert size={24} />}
                  title="No refill issues"
                  text="Your active medicines are above their refill thresholds."
                />
              ) : (
                refillAlerts.map((medicine) => (
                  <div key={medicine._id} className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-gray-800">{medicine.name}</h3>
                        <p className="text-sm text-gray-600">Remaining: {medicine.quantityRemaining ?? 'N/A'}</p>
                      </div>
                      <span className="rounded-full bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1 text-xs font-semibold">
                        Refill soon
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const Input = ({ label, value, onChange, type = 'text', required = false, placeholder = '' }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-semibold text-gray-700">{label}</span>
    <input
      type={type}
      value={value}
      required={required}
      placeholder={placeholder}
      onChange={(event) => onChange(type === 'checkbox' ? event.target.checked : event.target.value)}
      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
    />
  </label>
);

const Select = ({ label, value, onChange, options }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-semibold text-gray-700">{label}</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </label>
);

const StatCard = ({ icon, label, value, tone }) => {
  const toneMap = {
    teal: 'from-teal-500 to-cyan-500',
    green: 'from-emerald-500 to-lime-500',
    blue: 'from-sky-500 to-cyan-500',
    orange: 'from-amber-500 to-orange-500'
  };

  return (
    <div className="glass-effect rounded-2xl p-5 shadow-lg flex items-center gap-4">
      <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${toneMap[tone]} text-white flex items-center justify-center shadow-md`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

const ActionButton = ({ icon, label, onClick, danger = false }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
      danger
        ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
  >
    {icon}
    {label}
  </button>
);

const InfoCard = ({ label, value, highlighted = false }) => (
  <div className={`rounded-2xl border p-3 ${highlighted ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-gray-50'}`}>
    <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
    <p className="mt-1 font-semibold text-gray-800">{value}</p>
  </div>
);

const EmptyState = ({ icon, title, text, actionLabel, onAction }) => (
  <div className="rounded-2xl border border-dashed border-gray-300 bg-white/80 p-6 text-center">
    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
      {icon}
    </div>
    <h3 className="font-semibold text-gray-800">{title}</h3>
    <p className="mt-2 text-sm text-gray-600">{text}</p>
    {actionLabel && onAction ? (
      <button
        type="button"
        onClick={onAction}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-white font-semibold hover:bg-primary-700"
      >
        <Plus size={16} /> {actionLabel}
      </button>
    ) : null}
  </div>
);

export default MedicineTracker;
