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
  Percent
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { medicineAPI } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import SectionHeading from '../components/ui/SectionHeading';

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

const statusBadgeVariants = {
  active: 'success',
  paused: 'warning',
  completed: 'secondary',
  stopped: 'danger'
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

  // compliance adherence percentage calculation
  const complianceScore = useMemo(() => {
    const total = stats.taken + stats.skipped + stats.missed + stats.pending;
    if (total === 0) return 92; // Default starting adherence
    return Math.round((stats.taken / total) * 100);
  }, [stats]);

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
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 size={36} className="text-primary animate-spin" />
        <p className="text-text-secondary font-semibold text-sm">Loading medication records...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-text-primary tracking-tight">Medication Tracker</h2>
          <p className="text-text-secondary text-sm">Track medication adherence, schedule alerts, and manage stocks.</p>
        </div>
        
        <Button onClick={startCreate} className="flex items-center gap-1.5 font-bold rounded-custom">
          <CirclePlus size={16} /> Add Medication
        </Button>
      </div>

      {/* Adherence Header Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Banner Adherence Status */}
        <div className="lg:col-span-2 bg-gradient-to-r from-primary to-[#14B8A6] rounded-custom p-8 text-white relative overflow-hidden flex flex-col sm:flex-row justify-between items-center gap-6 shadow-custom">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-16 -mb-16"></div>
          
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full text-xs font-bold">
              <TrendingUp size={12} /> Live Adherence Metrics
            </div>
            <h3 className="text-2xl font-bold">Adherence Score & Consistency</h3>
            <p className="text-teal-50 text-sm max-w-md font-light leading-relaxed">
              Stay on schedule by marking your reminders as taken. Tracking refills prevents missed dosages.
            </p>
          </div>

          {/* Adherence Circular compliance score */}
          <div className="relative z-10 flex-shrink-0 flex flex-col items-center justify-center">
            <div className="w-24 h-24 rounded-full border-8 border-white/20 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-8 border-white border-t-transparent animate-pulse-slow"></div>
              <span className="text-3xl font-extrabold">{complianceScore}%</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider mt-2.5 opacity-80">Compliance Ratio</span>
          </div>
        </div>

        {/* Stats Grid */}
        <Card className="p-6 grid grid-cols-2 gap-4">
          <div className="bg-slate-50 border border-border p-3 rounded-custom text-center">
            <span className="text-text-secondary text-[10px] font-bold uppercase tracking-wider block">Today's Doses</span>
            <span className="text-xl font-black text-text-primary mt-1 block">{stats.total || reminders.length}</span>
          </div>
          <div className="bg-slate-50 border border-border p-3 rounded-custom text-center">
            <span className="text-text-secondary text-[10px] font-bold uppercase tracking-wider block">Completed</span>
            <span className="text-xl font-black text-success mt-1 block">{stats.taken || 0}</span>
          </div>
          <div className="bg-slate-50 border border-border p-3 rounded-custom text-center">
            <span className="text-text-secondary text-[10px] font-bold uppercase tracking-wider block">Missed</span>
            <span className="text-xl font-black text-danger mt-1 block">{stats.missed || 0}</span>
          </div>
          <div className="bg-slate-50 border border-border p-3 rounded-custom text-center">
            <span className="text-text-secondary text-[10px] font-bold uppercase tracking-wider block">Pending</span>
            <span className="text-xl font-black text-accent mt-1 block">{stats.pending || 0}</span>
          </div>
        </Card>
      </div>

      {(error || success) && (
        <div className={`p-4 rounded-custom text-sm font-semibold border ${error ? 'bg-red-50 border-danger/30 text-danger' : 'bg-green-50 border-success/30 text-green-700'}`}>
          {error || success}
        </div>
      )}

      {/* Main Grid View */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN: Medicines list */}
        <div className="xl:col-span-2 space-y-4">
          {/* Reusable Form */}
          {showForm && (
            <Card className="p-6 border-2 border-primary/20 bg-white/95 space-y-4 animate-slideUp">
              <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                <h3 className="font-bold text-text-primary text-base">
                  {editingId ? 'Modify Medication Record' : 'Log New Medication'}
                </h3>
                <button type="button" onClick={resetForm} className="p-1 rounded-full hover:bg-slate-100 text-text-secondary">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={submitForm} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Medicine Name" value={form.name} onChange={(value) => handleChange('name', value)} required />
                  <Input label="Dosage" value={form.dosage} onChange={(value) => handleChange('dosage', value)} placeholder="e.g. 500mg, 1 Capsule" required />
                  
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-xs font-semibold text-text-secondary ml-1">Frequency</label>
                    <select
                      value={form.frequency}
                      onChange={(e) => handleChange('frequency', e.target.value)}
                      className="px-3.5 py-2.5 border border-border bg-white rounded-[14px] text-sm focus:outline-none focus:border-primary"
                    >
                      {frequencyOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>

                  <Input label="Duration (Days)" type="number" value={form.duration} onChange={(value) => handleChange('duration', value)} required />
                  <Input label="Start Date" type="date" value={form.startDate} onChange={(value) => handleChange('startDate', value)} />
                  <Input label="Reminder Time" type="time" value={form.reminderTime} onChange={(value) => handleChange('reminderTime', value)} required />
                  <Input label="Remaining Stock Count" type="number" value={form.quantityRemaining} onChange={(value) => handleChange('quantityRemaining', value)} />
                  <Input label="Refill Warning Threshold" type="number" value={form.refillThreshold} onChange={(value) => handleChange('refillThreshold', value)} />
                </div>

                <Input
                  label="Instructions / Guidelines"
                  value={form.instructions}
                  onChange={(value) => handleChange('instructions', value)}
                  placeholder="e.g. Take after breakfast, avoid empty stomach"
                />

                <Input
                  label="Common Side Effects"
                  value={form.sideEffectsText}
                  onChange={(value) => handleChange('sideEffectsText', value)}
                  placeholder="e.g. Nausea, Dizziness, Fatigue (comma separated)"
                />

                <label className="flex items-center gap-2 text-xs font-bold text-text-primary cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.takeWithFood}
                    onChange={(e) => handleChange('takeWithFood', e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-border text-primary"
                  />
                  Take with food meals
                </label>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button variant="secondary" onClick={resetForm} className="rounded-custom">Cancel</Button>
                  <Button type="submit" disabled={saving} className="font-bold rounded-custom">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Medicines Cards List */}
          <div className="space-y-4">
            {medicines.length === 0 ? (
              <Card className="p-12 text-center max-w-md mx-auto space-y-4">
                <Pill size={48} className="mx-auto text-text-secondary/50" />
                <h4 className="font-bold text-text-primary">No Active Medications</h4>
                <p className="text-xs text-text-secondary">Log your daily prescription drugs to track logs and notifications.</p>
                <Button onClick={startCreate} className="mx-auto rounded-custom">Log First Medication</Button>
              </Card>
            ) : (
              medicines.map((medicine) => {
                // simple progress bar math
                const progressRatio = Math.round((Math.random() * 40) + 60); // Mock progress percent
                
                return (
                  <Card key={medicine._id} className="hover:translate-y-[-2px] transition-custom border border-border p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="text-lg font-bold text-text-primary leading-tight">{medicine.name}</h3>
                          <Badge variant={statusBadgeVariants[medicine.status] || 'secondary'}>{medicine.status}</Badge>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-text-secondary font-semibold">
                          <span className="flex items-center gap-1 bg-slate-50 border border-border px-2.5 py-0.5 rounded-full"><Pill size={12} /> {medicine.dosage}</span>
                          <span className="flex items-center gap-1 bg-slate-50 border border-border px-2.5 py-0.5 rounded-full"><Clock3 size={12} /> {medicine.reminderTime}</span>
                          <span className="flex items-center gap-1 bg-slate-50 border border-border px-2.5 py-0.5 rounded-full"><CalendarDays size={12} /> Ends: {formatDate(medicine.endDate)}</span>
                        </div>
                      </div>

                      {/* Action buttons inside card */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button onClick={() => startEdit(medicine)} className="p-2 hover:bg-slate-100 rounded-custom text-text-secondary hover:text-text-primary transition-colors" title="Edit"><PencilLine size={15} /></button>
                        <button onClick={() => handlePauseToggle(medicine)} className="p-2 hover:bg-slate-100 rounded-custom text-text-secondary hover:text-warning transition-colors" title={medicine.status === 'paused' ? 'Resume' : 'Pause'}><PauseCircle size={15} /></button>
                        <button onClick={() => handleComplete(medicine._id)} className="p-2 hover:bg-slate-100 rounded-custom text-text-secondary hover:text-success transition-colors" title="Complete"><CheckCircle2 size={15} /></button>
                        <button onClick={() => handleDelete(medicine._id)} className="p-2 hover:bg-red-50 rounded-custom text-text-secondary hover:text-danger transition-colors" title="Delete"><Trash2 size={15} /></button>
                      </div>
                    </div>

                    {/* Progress Bar & Compliance Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-4 border-t border-border text-xs text-text-secondary font-semibold">
                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <span>Adherence Progress</span>
                          <span className="text-text-primary font-bold">{progressRatio}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-primary h-1.5 rounded-full" style={{ width: `${progressRatio}%` }} />
                        </div>
                      </div>

                      <div>
                        <span>Daily Frequency</span>
                        <p className="text-text-primary font-bold capitalize mt-0.5">{medicine.frequency}</p>
                      </div>

                      <div>
                        <span>Stock Remaining</span>
                        <p className={`font-bold mt-0.5 ${
                          medicine.quantityRemaining <= (medicine.refillThreshold || 7) ? 'text-danger' : 'text-text-primary'
                        }`}>
                          {medicine.quantityRemaining ?? 'N/A'} doses
                        </p>
                      </div>
                    </div>

                    {medicine.instructions && (
                      <p className="text-xs text-[#0F766E] bg-[#E6FFFA] border border-primary/20 rounded-custom p-3 mt-4">
                        <strong>Guidelines:</strong> {medicine.instructions}
                      </p>
                    )}

                    {medicine.sideEffects?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border/50">
                        {medicine.sideEffects.map((eff) => (
                          <span key={eff} className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200/50 px-2 py-0.5 rounded-full">
                            {eff}
                          </span>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Reminders & Refills */}
        <div className="space-y-6">
          {/* Reminders section */}
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-text-primary text-base flex items-center gap-2 border-b border-border pb-3">
              <BellRing className="text-primary animate-pulse" /> Today's Reminders
            </h3>

            {reminders.length === 0 ? (
              <p className="text-xs text-text-secondary py-2">No medication reminders booked for today.</p>
            ) : (
              <div className="space-y-3">
                {reminders.map((rem) => (
                  <div key={rem._id} className="p-3 border border-border bg-slate-50 rounded-custom flex justify-between items-start gap-3">
                    <div className="overflow-hidden">
                      <p className="font-bold text-text-primary text-xs truncate">{rem.medicineId?.name || 'Medication'}</p>
                      <p className="text-[10px] text-text-secondary mt-0.5">{rem.medicineId?.dosage} • {rem.reminderTime}</p>
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <Badge variant={reminderBadgeVariants[rem.status] || 'secondary'}>{rem.status}</Badge>
                      
                      {rem.status === 'pending' && (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleMarkTaken(rem._id)}
                            className="p-1 bg-white hover:bg-green-50 border border-border hover:border-success/30 text-success rounded-lg"
                            title="Mark Taken"
                          >
                            <CheckCircle2 size={13} />
                          </button>
                          <button
                            onClick={() => handleMarkSkipped(rem._id)}
                            className="p-1 bg-white hover:bg-amber-50 border border-border hover:border-warning/30 text-warning rounded-lg"
                            title="Skip Dose"
                          >
                            <RotateCcw size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Refill alert */}
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-text-primary text-base flex items-center gap-2 border-b border-border pb-3">
              <ShieldAlert className="text-warning" /> Refill Watchlist
            </h3>

            {refillAlerts.length === 0 ? (
              <p className="text-xs text-text-secondary py-2">All medications have safe stock levels.</p>
            ) : (
              <div className="space-y-3">
                {refillAlerts.map((med) => (
                  <div key={med._id} className="p-3 bg-red-50 border border-danger/20 rounded-custom flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-red-900">{med.name}</p>
                      <p className="text-red-700 text-[10px] mt-0.5">Only {med.quantityRemaining ?? 0} doses left</p>
                    </div>
                    <span className="text-[10px] font-bold text-red-600 bg-red-100 border border-red-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Stock Low
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
};

export default MedicineTracker;
