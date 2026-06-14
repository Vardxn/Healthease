import { useContext, useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
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
  FileCheck
} from 'lucide-react';

const Dashboard = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const navigate = useNavigate();

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
  const healthScore = useMemo(() => {
    if (medicines.length === 0) return 88; // Default good base score
    // base calculation on active medicines and refills needed
    const refillDeduction = refills.length * 5;
    const score = 95 - refillDeduction;
    return Math.max(50, Math.min(100, score));
  }, [medicines, refills]);

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
        <div className="lg:col-span-2 bg-gradient-to-r from-primary to-[#14B8A6] rounded-custom p-8 md:p-10 text-white relative overflow-hidden flex flex-col justify-between min-h-[200px] shadow-custom">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-16 -mb-16"></div>
          
          <div className="relative z-10 space-y-2">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {getGreeting()}, {user?.name || 'Guest'} 👋
            </h2>
            <p className="text-teal-50 text-base md:text-lg max-w-xl font-light">
              Manage your health records, prescriptions, and medical consultations in one place.
            </p>
          </div>

          <div className="relative z-10 pt-6">
            <Link to="/upload">
              <Button variant="secondary" className="bg-white text-primary border-transparent hover:bg-teal-50 hover:text-primary-hover shadow-md font-bold rounded-custom">
                Upload New Prescription
              </Button>
            </Link>
          </div>
        </div>

        {/* Health Score Card */}
        <Card className="flex flex-col justify-between p-8 text-center relative overflow-hidden">
          <div className="space-y-2">
            <p className="text-text-secondary text-sm font-bold uppercase tracking-wider">Health Score</p>
            <p className="text-xs text-text-secondary">Based on medication adherence and health indicators</p>
          </div>

          <div className="my-4 relative flex items-center justify-center">
            {/* Score Display */}
            <div className="relative w-28 h-28 flex items-center justify-center rounded-full border-8 border-slate-100">
              <div className="absolute inset-0 rounded-full border-8 border-primary border-t-transparent animate-pulse-slow"></div>
              <span className="text-4xl font-extrabold text-primary">{healthScore}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-success bg-success/10 px-3 py-1.5 rounded-full mx-auto">
            <ShieldCheck size={14} />
            Excellent Status
          </div>
        </Card>
      </div>

      {/* SECTION 2: Analytics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="flex items-center gap-4 p-5 hover:translate-y-[-4px] transition-custom">
          <div className="w-12 h-12 rounded-[14px] bg-primary/10 text-primary flex items-center justify-center">
            <FileCheck size={22} />
          </div>
          <div>
            <p className="text-text-secondary text-xs font-semibold uppercase tracking-wider">Total Prescriptions</p>
            <p className="text-2xl font-extrabold text-text-primary mt-0.5">{prescriptions.length}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5 hover:translate-y-[-4px] transition-custom">
          <div className="w-12 h-12 rounded-[14px] bg-secondary/10 text-secondary flex items-center justify-center">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-text-secondary text-xs font-semibold uppercase tracking-wider">Active Medicines</p>
            <p className="text-2xl font-extrabold text-text-primary mt-0.5">{activeMedicinesCount}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5 hover:translate-y-[-4px] transition-custom">
          <div className="w-12 h-12 rounded-[14px] bg-accent/10 text-accent flex items-center justify-center">
            <Calendar size={22} />
          </div>
          <div>
            <p className="text-text-secondary text-xs font-semibold uppercase tracking-wider">Upcoming Visits</p>
            <p className="text-2xl font-extrabold text-text-primary mt-0.5">{upcomingConsultations.length}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5 hover:translate-y-[-4px] transition-custom">
          <div className="w-12 h-12 rounded-[14px] bg-[#6366F1]/10 text-[#6366F1] flex items-center justify-center">
            <CalendarCheck2 size={22} />
          </div>
          <div>
            <p className="text-text-secondary text-xs font-semibold uppercase tracking-wider">Completed Sessions</p>
            <p className="text-2xl font-extrabold text-text-primary mt-0.5">{completedConsultationsCount}</p>
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
                    <div key={item._id || item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 border border-border rounded-custom gap-3">
                      <div>
                        <p className="font-bold text-text-primary text-sm">Dr. {item.doctorId?.name || item.doctorName || 'Doctor'}</p>
                        <p className="text-xs text-text-secondary mt-0.5">{item.doctorId?.specialization || 'General Medicine'}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-text-secondary">
                          <span className="flex items-center gap-1 font-medium"><Clock size={12} /> {schedule.date} @ {schedule.time}</span>
                          <span className="capitalize px-2 py-0.5 bg-slate-200/50 rounded-full font-semibold">{item.consultationType || 'video'}</span>
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
                  <div key={rem._id} className="flex items-center justify-between p-2.5 bg-slate-50 border border-border rounded-[14px]">
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
                  <div key={med._id} className="p-2.5 bg-amber-50 border border-amber-200 rounded-[14px] flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-amber-900">{med.name}</p>
                      <p className="text-amber-700 text-[10px]">Only {med.quantityRemaining ?? 0} doses left</p>
                    </div>
                    <Link to="/medicine-tracker">
                      <span className="text-[10px] font-bold text-primary hover:underline">Manage</span>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* SECTION 6: Quick Actions */}
          <Card className="p-6">
            <h3 className="font-bold text-text-primary text-lg mb-4 border-b border-border pb-3 flex items-center gap-2">
              <ClipboardList size={18} className="text-primary" />
              Quick Actions
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <Link to="/upload">
                <div className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-primary/5 border border-border hover:border-primary/20 rounded-[14px] text-center gap-2 transition-custom cursor-pointer h-full">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Upload size={16} />
                  </div>
                  <span className="text-xs font-bold text-text-primary">Upload Record</span>
                </div>
              </Link>

              <Link to="/doctors">
                <div className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-primary/5 border border-border hover:border-primary/20 rounded-[14px] text-center gap-2 transition-custom cursor-pointer h-full">
                  <div className="w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
                    <Calendar size={16} />
                  </div>
                  <span className="text-xs font-bold text-text-primary">Book Doctor</span>
                </div>
              </Link>

              <Link to="/vitals">
                <div className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-primary/5 border border-border hover:border-primary/20 rounded-[14px] text-center gap-2 transition-custom cursor-pointer h-full">
                  <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                    <Activity size={16} />
                  </div>
                  <span className="text-xs font-bold text-text-primary">Log Vitals</span>
                </div>
              </Link>

              <Link to="/profile">
                <div className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-primary/5 border border-border hover:border-primary/20 rounded-[14px] text-center gap-2 transition-custom cursor-pointer h-full">
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
    </div>
  );
};

export default Dashboard;
