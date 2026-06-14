import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { consultationAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { calculateConsultationScore } from '../utils/healthScoreEngine';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import {
  Calendar,
  Clock,
  Video,
  Phone,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  FileText,
  Activity,
  History,
  Grid,
  ListTodo
} from 'lucide-react';

const consultationTypeConfig = {
  video: { label: 'Video', Icon: Video },
  audio: { label: 'Audio', Icon: Phone },
  chat: { label: 'Chat', Icon: MessageSquare }
};

const badgeVariants = {
  queued: 'warning',
  active: 'success',
  completed: 'secondary',
  cancelled: 'danger'
};

const formatDate = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatTime = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const MyConsultations = () => {
  const navigate = useNavigate();
  const { socket, isAuthenticated } = useContext(AuthContext);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState({});
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'timeline'

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchConsultations = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await consultationAPI.getMy();
        const payload = response?.data;
        const data = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.consultations)
            ? payload.consultations
            : Array.isArray(payload)
              ? payload
              : [];
        setConsultations(data);
      } catch (err) {
        setError(err.response?.data?.msg || 'Unable to load consultations');
      } finally {
        setLoading(false);
      }
    };

    fetchConsultations();
  }, [navigate, isAuthenticated]);

  useEffect(() => {
    if (!socket) return undefined;
    const handleConsultationStart = ({ consultationId }) => {
      if (consultationId) {
        navigate(`/consultation/${consultationId}`);
      }
    };
    socket.on('consultation:start', handleConsultationStart);
    return () => {
      socket.off('consultation:start', handleConsultationStart);
    };
  }, [navigate, socket]);

  // Sorting: most recent appointments first
  const sortedConsultations = useMemo(() => {
    return [...consultations].sort((a, b) => {
      const dateA = new Date(a.scheduledAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.scheduledAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, [consultations]);

  // Statistics counters
  const stats = useMemo(() => {
    const counts = { upcoming: 0, completed: 0, cancelled: 0 };
    consultations.forEach((c) => {
      if (c.status === 'queued' || c.status === 'active') counts.upcoming++;
      else if (c.status === 'completed') counts.completed++;
      else if (c.status === 'cancelled') counts.cancelled++;
    });
    return counts;
  }, [consultations]);

  const consultationPoints = useMemo(() => {
    return calculateConsultationScore(consultations);
  }, [consultations]);

  // Group by Month (for timeline view)
  const groupedTimeline = useMemo(() => {
    const groups = {};
    sortedConsultations.forEach((item) => {
      const dateObj = new Date(item.scheduledAt || item.createdAt || 0);
      const monthYear = dateObj.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(item);
    });
    return groups;
  }, [sortedConsultations]);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCancelAppointment = (id) => {
    if (window.confirm('Are you sure you want to cancel this consultation?')) {
      // API call to cancel status
      consultationAPI.updateStatus(id, 'cancelled')
        .then(() => {
          setConsultations(prev => prev.map(c => c._id === id || c.id === id ? { ...c, status: 'cancelled' } : c));
        })
        .catch(() => alert('Failed to cancel appointment'));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="animate-spin text-primary" size={36} />
        <p className="text-text-secondary font-semibold text-sm">Loading appointments...</p>
      </div>
    );
  }

  const ConsultationCard = ({ item }) => {
    const id = item._id || item.id;
    const doctorName = item?.doctorId?.name || item?.doctorName || 'Doctor';
    const specialization = item?.doctorId?.specialization || item?.specialization || 'General Medicine';
    const status = item?.status || 'queued';
    const canViewNotes = status === 'completed';
    const isExpanded = !!expanded[id];
    const notes = item?.notes || {};
    const meds = Array.isArray(notes?.prescribedMedicines) ? notes.prescribedMedicines : [];
    const tests = Array.isArray(notes?.testsOrdered) ? notes.testsOrdered : [];
    const consultationType = item.consultationType || 'video';
    const Config = consultationTypeConfig[consultationType] || consultationTypeConfig.video;
    const TypeIcon = Config.Icon;

    return (
      <Card className="hover:translate-y-[-2px] transition-custom border border-border p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-text-primary">Dr. {doctorName}</h3>
              <Badge variant={badgeVariants[status] || 'secondary'}>{status}</Badge>
            </div>
            <p className="text-xs text-secondary font-bold uppercase tracking-wider">{specialization}</p>
            
            <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary mt-3">
              <span className="flex items-center gap-1"><Calendar size={13} /> {formatDate(item.scheduledAt || item.createdAt)}</span>
              <span className="flex items-center gap-1"><Clock size={13} /> {formatTime(item.scheduledAt || item.createdAt)}</span>
              <span className="flex items-center gap-1.5 capitalize font-medium">
                <TypeIcon size={13} />
                {Config.label}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:self-center">
            {status === 'active' && (
              <Link to={`/consultation/${id}`}>
                <Button className="px-4 py-2 text-xs font-bold rounded-custom">Join Call</Button>
              </Link>
            )}

            {canViewNotes && (
              <Button
                variant="secondary"
                onClick={() => toggleExpand(id)}
                className="px-4 py-2 text-xs font-bold rounded-custom flex items-center gap-1 border-primary text-primary hover:bg-primary/5"
              >
                {isExpanded ? (
                  <>Hide Notes <ChevronUp size={12} /></>
                ) : (
                  <>View Doctor Notes <ChevronDown size={12} /></>
                )}
              </Button>
            )}

            {(status === 'queued' || status === 'active') && (
              <button
                onClick={() => handleCancelAppointment(id)}
                className="text-xs font-bold text-danger hover:bg-red-50 px-3 py-2 rounded-custom transition-colors border border-transparent hover:border-danger/20"
              >
                Cancel Call
              </button>
            )}
          </div>
        </div>

        {/* Notes Collapsible details drawer */}
        {canViewNotes && isExpanded && (
          <div className="mt-4 p-5 bg-slate-50 border border-border rounded-custom animate-slideUp space-y-4 text-xs text-text-secondary">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-bold text-text-primary mb-1 uppercase tracking-wider text-[10px]">Diagnosis</p>
                <p className="text-sm text-text-primary bg-white border border-border p-3 rounded-[12px]">
                  {notes?.diagnosis || 'No diagnosis logged.'}
                </p>
              </div>

              <div>
                <p className="font-bold text-text-primary mb-1 uppercase tracking-wider text-[10px]">Follow-up Date</p>
                <p className="text-sm text-text-primary bg-white border border-border p-3 rounded-[12px] flex items-center gap-1.5">
                  <Calendar size={14} className="text-primary" />
                  {formatDate(notes?.followUpDate)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <p className="font-bold text-text-primary mb-1.5 uppercase tracking-wider text-[10px]">Prescribed Medications</p>
                {meds.length === 0 ? (
                  <p className="text-text-secondary italic">No medicines listed.</p>
                ) : (
                  <div className="space-y-2">
                    {meds.map((med, idx) => (
                      <div key={idx} className="bg-white border border-border p-2.5 rounded-[12px] flex justify-between items-center">
                        <span className="font-bold text-text-primary text-xs">{med.name}</span>
                        <span className="text-[10px] bg-slate-100 text-text-secondary px-2 py-0.5 rounded-full">
                          {med.dosage} • {med.frequency} • {med.duration}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="font-bold text-text-primary mb-1.5 uppercase tracking-wider text-[10px]">Diagnostic Tests</p>
                {tests.length === 0 ? (
                  <p className="text-text-secondary italic">No medical tests ordered.</p>
                ) : (
                  <div className="space-y-2">
                    {tests.map((test, idx) => (
                      <div key={idx} className="bg-white border border-border p-2.5 rounded-[12px] flex justify-between items-center">
                        <div>
                          <p className="font-bold text-text-primary text-xs">{test.testName}</p>
                          <p className="text-[10px] text-text-secondary mt-0.5">{test.reason}</p>
                        </div>
                        <Badge variant={test.urgency === 'High' ? 'danger' : 'secondary'}>{test.urgency}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="w-full space-y-6 pb-10">
      {/* SECTION 1: Hero Header & Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-text-primary tracking-tight">My Consultations</h2>
          <p className="text-text-secondary text-sm font-medium">Track your medical appointments, call records, and prescriptions.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Mode Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-[14px] border border-border mr-2">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 text-xs font-bold rounded-custom flex items-center gap-1.5 transition-all duration-200 ${
                viewMode === 'cards' ? 'bg-white text-primary shadow-xs' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Grid size={13} /> Grid
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 text-xs font-bold rounded-custom flex items-center gap-1.5 transition-all duration-200 ${
                viewMode === 'timeline' ? 'bg-white text-primary shadow-xs' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <History size={13} /> Timeline
            </button>
          </div>

          <div className="flex flex-wrap gap-3 text-xs font-bold text-text-secondary items-center">
            <div className="bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-custom text-center">
              <span className="text-primary text-sm font-black block">{consultationPoints} / 20</span>
              Compliance Points
            </div>
            <div className="bg-slate-50 border border-border px-3.5 py-1.5 rounded-custom text-center">
              <span className="text-text-primary text-sm font-black block">{stats.upcoming}</span>
              Upcoming
            </div>
            <div className="bg-slate-50 border border-border px-3.5 py-1.5 rounded-custom text-center">
              <span className="text-text-primary text-sm font-black block">{stats.completed}</span>
              Completed
            </div>
            <div className="bg-slate-50 border border-border px-3.5 py-1.5 rounded-custom text-center">
              <span className="text-text-primary text-sm font-black block">{stats.cancelled}</span>
              Cancelled
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-danger/30 text-danger p-4 rounded-custom text-sm font-semibold">
          {error}
        </div>
      )}

      {/* SECTION 2 & 3: Consultations Render */}
      {sortedConsultations.length === 0 ? (
        <Card className="p-12 text-center max-w-md mx-auto space-y-4 border border-border">
          <div className="text-4xl">📅</div>
          <h4 className="font-bold text-text-primary">No Consultations Found</h4>
          <p className="text-xs text-text-secondary">You haven't scheduled any telemedicine consultations yet.</p>
          <Link to="/doctors">
            <Button className="mx-auto rounded-custom">Find a Doctor</Button>
          </Link>
        </Card>
      ) : (
        <>
          {viewMode === 'cards' ? (
            <div className="space-y-4">
              {sortedConsultations.map((item) => (
                <ConsultationCard key={item._id || item.id} item={item} />
              ))}
            </div>
          ) : (
            // TIMELINE MODE (Grouped by month)
            <div className="space-y-8 relative pl-6 border-l border-border ml-3">
              {Object.keys(groupedTimeline).map((monthYear) => (
                <div key={monthYear} className="space-y-4">
                  {/* Month header node */}
                  <div className="relative -left-[31px] flex items-center gap-2 mb-4 bg-white py-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary border-4 border-white ring-2 ring-primary flex-shrink-0" />
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">{monthYear}</span>
                  </div>
                  
                  <div className="space-y-4">
                    {groupedTimeline[monthYear].map((item) => (
                      <ConsultationCard key={item._id || item.id} item={item} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyConsultations;
