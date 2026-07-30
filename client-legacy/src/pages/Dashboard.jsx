import { useContext, useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  prescriptionAPI,
  medicineAPI,
  consultationAPI,
  patientAPI
} from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import {
  Upload,
  Calendar,
  Activity,
  User,
  Plus,
  Clock,
  ClipboardList,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  CalendarCheck2,
  FileCheck,
  Bell,
  Sparkles
} from 'lucide-react';

import HealthScoreModal from '../components/HealthScoreModal';
import { calculateHealthScore } from '../utils/healthScoreEngine';

const Dashboard = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const { notifications, addNotification } = useNotifications();
  const navigate = useNavigate();
  const [isScoreOpen, setIsScoreOpen] = useState(false);

  // Dashboard state
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [refills, setRefills] = useState([]);
  const [vitals, setVitals] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [
          prescriptionsRes,
          medicinesRes,
          consultationsRes,
          remindersRes,
          refillRes,
          vitalsRes
        ] = await Promise.allSettled([
          prescriptionAPI.getAll(),
          medicineAPI.getAll(),
          consultationAPI.getMy(),
          medicineAPI.getTodayReminders(),
          medicineAPI.getRefillNeeded(),
          patientAPI.getVitals()
        ]);

        if (prescriptionsRes.status === 'fulfilled') {
          setPrescriptions(prescriptionsRes.value.data?.prescriptions || []);
        }
        if (medicinesRes.status === 'fulfilled') {
          setMedicines(medicinesRes.value.data?.medicines || []);
        }
        if (consultationsRes.status === 'fulfilled') {
          const payload = consultationsRes.value.data;
          const data = Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.consultations)
              ? payload.consultations
              : Array.isArray(payload)
                ? payload
                : [];
          setConsultations(data);
        }
        if (remindersRes.status === 'fulfilled') {
          setReminders(remindersRes.value.data?.reminders || []);
        }
        if (refillRes.status === 'fulfilled') {
          setRefills(refillRes.value.data?.medicines || []);
        }
        if (vitalsRes.status === 'fulfilled') {
          setVitals(vitalsRes.value.data?.vitals || []);
        }
      } catch (err) {
        console.error('Error loading dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [isAuthenticated, navigate]);

  // Greeting helper based on time of day
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Derived calculations
  const activeMedicinesCount = useMemo(() => {
    return medicines.filter((m) => m.status === 'active').length;
  }, [medicines]);

  const upcomingConsultations = useMemo(() => {
    return consultations
      .filter((c) => c.status === 'queued' || c.status === 'active')
      .sort((a, b) => new Date(a.scheduledAt || a.createdAt) - new Date(b.scheduledAt || b.createdAt));
  }, [consultations]);

  const completedConsultationsCount = useMemo(() => {
    return consultations.filter((c) => c.status === 'completed').length;
  }, [consultations]);

  // Dynamic adherence/health score calculation
  const healthData = useMemo(() => {
    return calculateHealthScore(medicines, vitals, consultations);
  }, [medicines, vitals, consultations]);

  const healthScore = healthData.score;

  useEffect(() => {
    if (loading) return;
    const lastScore = localStorage.getItem('last_health_score');
    const currentScore = healthData.score;
    if (lastScore && parseInt(lastScore, 10) !== currentScore) {
      const diff = currentScore - parseInt(lastScore, 10);
      const direction = diff > 0 ? 'improved' : 'decreased';
      addNotification(
        `Health Score Updated`,
        `Your Health Score has ${direction} to ${currentScore} (${healthData.status}).`,
        'ai'
      );
    }
    localStorage.setItem('last_health_score', currentScore.toString());
  }, [healthData.score, healthData.status, loading]);

  // Format Helper
  const formatDateTime = (isoString) => {
    if (!isoString) return 'Not Scheduled';
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return 'Not Scheduled';
    return {
      date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-text-secondary font-semibold text-sm">Preparing your health dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* SECTION 1: Hero Banner & Health Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Banner */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-[#131926] to-[#1b2336] p-8 shadow-[0_0_30px_rgba(0,242,254,0.03)]">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#00F2FE]/10 blur-[80px]" />

          <div className="relative z-10 flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="max-w-xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#00F2FE]/20 bg-[#00F2FE]/10 px-3 py-1 text-xs font-medium text-[#00F2FE]">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                AI-Powered OCR Extraction Engine Active
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                {getGreeting()}, {user?.name || 'Guest'} 👋
              </h2>
              <p className="text-sm leading-relaxed text-gray-400">
                Upload handwritten or digital prescriptions. Our intelligence system will instantly digitize medications, dosages, and timelines.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/upload')}
              className="group flex h-36 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-700 bg-[#0B0F19]/60 px-6 transition-all duration-300 hover:border-[#00F2FE] hover:bg-[#0B0F19] md:w-64"
              aria-label="Upload a new prescription"
            >
              <div className="mb-2 rounded-lg bg-gray-800 p-3 text-gray-400 transition-all duration-300 group-hover:bg-[#00F2FE]/10 group-hover:text-[#00F2FE]">
                <Upload className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-gray-300 group-hover:text-white">Upload New Prescription</p>
              <p className="mt-1 text-xs text-gray-500">Drag & drop or click to browse</p>
            </button>
          </div>
        </div>

        {/* Health Score Card */}
        <Card
          onClick={() => navigate('/health-score')}
          className="flex h-full cursor-pointer flex-col items-center justify-between rounded-2xl border border-white/5 bg-[#131926] p-6 text-center transition-all duration-200 hover:border-white/10"
        >
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Health Score</p>
            <p className="text-xs text-gray-500">Based on adherence & diagnostics</p>
          </div>

          <div className="relative my-4 flex items-center justify-center">
            <svg className="h-32 w-32 -rotate-90">
              <circle cx="64" cy="64" r="50" stroke="#1b2336" strokeWidth="8" fill="transparent" />
              <circle
                cx="64"
                cy="64"
                r="50"
                stroke="url(#healthScoreGradient)"
                strokeWidth="10"
                strokeDasharray={314}
                strokeDashoffset={314 - (314 * healthScore) / 100}
                strokeLinecap="round"
                fill="transparent"
                className="drop-shadow-[0_0_8px_rgba(0,242,254,0.5)] transition-all duration-500"
              />
              <defs>
                <linearGradient id="healthScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0575E6" />
                  <stop offset="100%" stopColor="#00F2FE" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute text-center">
              <span className="text-3xl font-extrabold tracking-tight text-white">{healthScore}</span>
              <span className="block text-xs text-gray-500">/100</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-block rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
              Status: {healthData.status}
            </div>
            {healthData.recommendations?.[0] && (
              <p className="mx-auto max-w-[200px] truncate text-[10px] text-gray-500">
                💡 {healthData.recommendations[0].text}
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* SECTION 2: Analytics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="flex items-center justify-between rounded-xl border border-white/5 bg-[#131926] p-5 transition-all duration-200 hover:border-white/10">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Total Prescriptions</p>
            <p className="text-3xl font-bold tracking-tight text-white">{prescriptions.length}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-[#0B0F19] p-3 text-[#00F2FE]">
            <FileCheck size={20} />
          </div>
        </Card>

        <Card className="flex items-center justify-between rounded-xl border border-white/5 bg-[#131926] p-5 transition-all duration-200 hover:border-white/10">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Active Medicines</p>
            <p className="text-3xl font-bold tracking-tight text-white">{activeMedicinesCount}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-[#0B0F19] p-3 text-emerald-400">
            <CheckCircle2 size={20} />
          </div>
        </Card>

        <Card className="flex items-center justify-between rounded-xl border border-white/5 bg-[#131926] p-5 transition-all duration-200 hover:border-white/10">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Upcoming Visits</p>
            <p className="text-3xl font-bold tracking-tight text-white">{upcomingConsultations.length}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-[#0B0F19] p-3 text-[#00F2FE]">
            <Calendar size={20} />
          </div>
        </Card>

        <Card className="flex items-center justify-between rounded-xl border border-white/5 bg-[#131926] p-5 transition-all duration-200 hover:border-white/10">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Completed Sessions</p>
            <p className="text-3xl font-bold tracking-tight text-white">{completedConsultationsCount}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-[#0B0F19] p-3 text-violet-400">
            <CalendarCheck2 size={20} />
          </div>
        </Card>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT & CENTER COLS */}
        <div className="lg:col-span-2 space-y-6">
          {/* SECTION 4: Upcoming Consultations */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
              <h3 className="font-bold text-text-primary text-lg flex items-center gap-2">
                <Calendar size={18} className="text-primary" />
                Upcoming Consultations
              </h3>
              <Link to="/consultations/my" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                View All <ArrowRight size={12} />
              </Link>
            </div>

            {upcomingConsultations.length === 0 ? (
              <div className="py-8 text-center text-text-secondary text-sm">
                No upcoming doctor consultations booked.
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingConsultations.slice(0, 3).map((item) => {
                  const schedule = formatDateTime(item.scheduledAt || item.createdAt);
                  const status = item.status || 'queued';
                  let statusVariant = 'warning';
                  if (status === 'active') statusVariant = 'success';
                  if (status === 'completed') statusVariant = 'secondary';
                  if (status === 'cancelled') statusVariant = 'danger';

                  return (
                    <div key={item._id || item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-surface-secondary border border-border rounded-custom gap-3">
                      <div>
                        <p className="font-bold text-text-primary text-sm">Dr. {item.doctorId?.name || item.doctorName || 'Doctor'}</p>
                        <p className="text-xs text-text-secondary mt-0.5">{item.doctorId?.specialization || 'General Medicine'}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-text-secondary">
                          <span className="flex items-center gap-1 font-medium"><Clock size={12} /> {schedule.date} @ {schedule.time}</span>
                          <span className="capitalize px-2 py-0.5 bg-surface border border-border rounded-full font-semibold">{item.consultationType || 'video'}</span>
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2">
                        <Badge variant={statusVariant}>{status}</Badge>
                        {status === 'active' && (
                          <Link to={`/consultation/${item._id || item.id}`}>
                            <Button className="px-3 py-1.5 text-xs font-bold rounded-custom">Join Consultation</Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
 
          {/* SECTION 3: Recent Activity */}
          <Card className="p-6">
            <h3 className="font-bold text-text-primary text-lg mb-4 border-b border-border pb-3 flex items-center gap-2">
              <Activity size={18} className="text-primary" />
              Recent Health Activity
            </h3>
 
            <div className="relative border-l border-border ml-3.5 space-y-6 py-2">
              {/* Prescription Activity */}
              {prescriptions.length > 0 && (
                <div className="relative pl-6">
                  <div className="absolute -left-[7px] top-1.5 w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-text-secondary uppercase">Prescription Digitized</span>
                    <p className="text-sm font-semibold text-text-primary mt-0.5">
                      Uploaded by {prescriptions[0].doctorName || 'Self'}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      Contains {prescriptions[0].medications?.length || 0} medications • {new Date(prescriptions[0].date || prescriptions[0].createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
 
              {/* Consultation Activity */}
              {consultations.length > 0 && (
                <div className="relative pl-6">
                  <div className="absolute -left-[7px] top-1.5 w-3.5 h-3.5 rounded-full bg-secondary flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-text-secondary uppercase">Consultation Event</span>
                    <p className="text-sm font-semibold text-text-primary mt-0.5">
                      Session with Dr. {consultations[0].doctorId?.name || consultations[0].doctorName || 'Doctor'}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      Status: <span className="capitalize font-semibold">{consultations[0].status}</span> • {new Date(consultations[0].createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
 
              {/* Vitals Activity */}
              {vitals.length > 0 && (
                <div className="relative pl-6">
                  <div className="absolute -left-[7px] top-1.5 w-3.5 h-3.5 rounded-full bg-accent flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-text-secondary uppercase">Vitals Logged</span>
                    <p className="text-sm font-semibold text-text-primary mt-0.5">
                      Logged new health indicators
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      Blood Pressure: {vitals[vitals.length - 1].bloodPressure || 'N/A'} • SpO2: {vitals[vitals.length - 1].spo2 || 'N/A'}%
                    </p>
                  </div>
                </div>
              )}
 
              {/* Fallback when no activities */}
              {prescriptions.length === 0 && consultations.length === 0 && vitals.length === 0 && (
                <p className="text-sm text-text-secondary text-center py-2">No recent health activity logs yet.</p>
              )}
            </div>
          </Card>
        </div>
 
        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* SECTION 5: Medicine Reminders */}
          <Card className="p-6">
            <h3 className="font-bold text-text-primary text-lg mb-4 border-b border-border pb-3 flex items-center gap-2">
              <Clock size={18} className="text-primary" />
              Medicine Reminders
            </h3>
 
            {/* Next Reminders List */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-text-secondary uppercase">Today's Schedule</p>
              {reminders.length === 0 ? (
                <p className="text-xs text-text-secondary py-1">No medication scheduled for today.</p>
              ) : (
                reminders.slice(0, 3).map((rem) => (
                  <div key={rem._id} className="flex items-center justify-between p-2.5 bg-surface-secondary border border-border rounded-[14px]">
                    <div className="overflow-hidden">
                      <p className="font-bold text-text-primary text-xs truncate">{rem.medicineId?.name || 'Medicine'}</p>
                      <p className="text-[11px] text-text-secondary">{rem.medicineId?.dosage} • {rem.reminderTime}</p>
                    </div>
                    <Badge variant={rem.status === 'taken' ? 'success' : rem.status === 'skipped' ? 'warning' : 'secondary'}>
                      {rem.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
 
            {/* Refill alerts */}
            <div className="mt-5 pt-4 border-t border-border space-y-3">
              <p className="text-xs font-bold text-text-secondary uppercase flex items-center gap-1">
                <AlertTriangle size={12} className="text-warning" />
                Refill Alerts
              </p>
              {refills.length === 0 ? (
                <p className="text-xs text-text-secondary py-1">All medications are adequately stocked.</p>
              ) : (
                refills.slice(0, 2).map((med) => (
                  <div key={med._id} className="p-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-[14px] flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-amber-900 dark:text-amber-200">{med.name}</p>
                      <p className="text-amber-700 dark:text-amber-400 text-[10px]">Only {med.quantityRemaining ?? 0} doses left</p>
                    </div>
                    <Link to="/medicine-tracker">
                      <span className="text-[10px] font-bold text-primary hover:underline">Manage</span>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* SECTION 5.5: Recent Notifications */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
              <h3 className="font-bold text-text-primary text-lg flex items-center gap-2">
                <Bell size={18} className="text-primary" />
                Recent Alerts
              </h3>
              <Link to="/notifications" className="text-xs font-bold text-primary hover:underline">
                View All
              </Link>
            </div>
            {notifications.length === 0 ? (
              <p className="text-xs text-text-secondary py-2">No notifications found.</p>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 5).map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 border rounded-custom flex flex-col gap-1 transition-all ${
                      notif.read ? 'border-border bg-surface-secondary/40 opacity-75' : 'border-primary/10 bg-surface'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <p className={`font-bold text-xs ${notif.read ? 'text-text-secondary' : 'text-text-primary'}`}>{notif.title}</p>
                      {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </div>
                    <p className="text-[11px] text-text-secondary leading-relaxed truncate">{notif.message}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* SECTION 6: Quick Actions */}
          <Card className="p-6">
            <h3 className="font-bold text-text-primary text-lg mb-4 border-b border-border pb-3 flex items-center gap-2">
              <ClipboardList size={18} className="text-primary" />
              Quick Actions
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <Link to="/upload">
                <div className="flex flex-col items-center justify-center p-4 bg-surface-secondary hover:bg-primary/5 border border-border hover:border-primary/20 rounded-[14px] text-center gap-2 transition-custom cursor-pointer h-full">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Upload size={16} />
                  </div>
                  <span className="text-xs font-bold text-text-primary">Upload Record</span>
                </div>
              </Link>
 
              <Link to="/doctors">
                <div className="flex flex-col items-center justify-center p-4 bg-surface-secondary hover:bg-primary/5 border border-border hover:border-primary/20 rounded-[14px] text-center gap-2 transition-custom cursor-pointer h-full">
                  <div className="w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
                    <Calendar size={16} />
                  </div>
                  <span className="text-xs font-bold text-text-primary">Book Doctor</span>
                </div>
              </Link>
 
              <Link to="/vitals">
                <div className="flex flex-col items-center justify-center p-4 bg-surface-secondary hover:bg-primary/5 border border-border hover:border-primary/20 rounded-[14px] text-center gap-2 transition-custom cursor-pointer h-full">
                  <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                    <Activity size={16} />
                  </div>
                  <span className="text-xs font-bold text-text-primary">Log Vitals</span>
                </div>
              </Link>
 
              <Link to="/profile">
                <div className="flex flex-col items-center justify-center p-4 bg-surface-secondary hover:bg-primary/5 border border-border hover:border-primary/20 rounded-[14px] text-center gap-2 transition-custom cursor-pointer h-full">
                  <div className="w-8 h-8 rounded-full bg-[#6366F1]/10 text-[#6366F1] flex items-center justify-center">
                    <User size={16} />
                  </div>
                  <span className="text-xs font-bold text-text-primary">My Profile</span>
                </div>
              </Link>
            </div>
          </Card>
        </div>

      </div>

      <HealthScoreModal 
        isOpen={isScoreOpen} 
        onClose={() => setIsScoreOpen(false)} 
        score={healthScore} 
      />
    </div>
  );
};

export default Dashboard;
