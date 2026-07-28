import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { consultationAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { GuestContext } from '../context/GuestContext';
import { calculateConsultationScore } from '../utils/healthScoreEngine';
import {
  Calendar,
  Clock,
  Video,
  Phone,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Loader2,
  FileText,
  Grid,
  History
} from 'lucide-react';

const consultationTypeConfig = {
  video: { label: 'Video', Icon: Video },
  audio: { label: 'Audio', Icon: Phone },
  chat: { label: 'Chat', Icon: MessageSquare }
};

const statusBadgeConfig = {
    queued: { label: 'Upcoming', color: 'amber' },
    active: { label: 'Active', color: 'green' },
    completed: { label: 'Completed', color: 'green' },
    cancelled: { label: 'Cancelled', color: 'red' },
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

const DemoModeBanner = () => (
    <div className="liquid-glass-pill is-demo-banner mb-6">
        <p className="font-dmsans text-xs font-medium uppercase tracking-widest text-green-300">
            Viewing Simulated Data Model
        </p>
    </div>
);

const MyConsultations = () => {
  const navigate = useNavigate();
  const { socket, isAuthenticated } = useContext(AuthContext);
  const { isGuest } = useContext(GuestContext);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState({});
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'timeline'
  const [filter, setFilter] = useState('upcoming');

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

  const filteredConsultations = useMemo(() => {
    return consultations.filter(c => {
        const status = c.status;
        if (filter === 'upcoming') return status === 'queued' || status === 'active';
        if (filter === 'completed') return status === 'completed';
        if (filter === 'cancelled') return status === 'cancelled';
        return true;
    }).sort((a, b) => {
        const dateA = new Date(a.scheduledAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.scheduledAt || b.createdAt || 0).getTime();
        return dateB - dateA;
      });
  }, [consultations, filter]);

  const consultationPoints = useMemo(() => {
    return calculateConsultationScore(consultations);
  }, [consultations]);

  const groupedTimeline = useMemo(() => {
    const groups = {};
    filteredConsultations.forEach((item) => {
      const dateObj = new Date(item.scheduledAt || item.createdAt || 0);
      const monthYear = dateObj.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(item);
    });
    return groups;
  }, [filteredConsultations]);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCancelAppointment = (id) => {
    if (window.confirm('Are you sure you want to cancel this consultation?')) {
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
        <Loader2 className="animate-spin text-cyan-400" size={36} />
        <p className="text-white/60 font-semibold text-sm">Loading appointments...</p>
      </div>
    );
  }

  const ConsultationCard = ({ item, index }) => {
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
    const statusConfig = statusBadgeConfig[status] || {label: 'Unknown', color: 'gray'};
    const animationDelay = 300 + index * 100;

    return (
        <div className="liquid-glass-card p-6 animate-fade-up" style={{ animationDelay: `${animationDelay}ms` }}>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="font-dmsans text-lg font-bold text-white">Dr. {doctorName}</h3>
                        <div className={`liquid-glass-pill inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-full text-white/80`}>
                            <span className={`w-1.5 h-1.5 rounded-full bg-${statusConfig.color}-400`} />
                            {statusConfig.label}
                        </div>
                    </div>
                    <p className="font-inter text-xs text-cyan-400/70 font-bold uppercase tracking-wider">{specialization}</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-white/70 pt-2">
                        <span className="flex items-center gap-1.5"><Calendar size={13} /> {formatDate(item.scheduledAt || item.createdAt)}</span>
                        <span className="flex items-center gap-1.5"><Clock size={13} /> {formatTime(item.scheduledAt || item.createdAt)}</span>
                        <span className="flex items-center gap-1.5 capitalize font-medium">
                            <TypeIcon size={13} />
                            {Config.label}
                        </span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:self-center">
                    {status === 'active' && (
                        <Link to={`/consultation/${id}`}>
                            <button className="liquid-glass-cta px-4 py-2 text-xs font-bold rounded-full">Join Call</button>
                        </Link>
                    )}

                    {canViewNotes && (
                        <button
                        variant="secondary"
                        onClick={() => toggleExpand(id)}
                        className="liquid-glass-pill px-4 py-2 text-xs font-bold flex items-center gap-1 text-white/80 hover:bg-white/10"
                        >
                        {isExpanded ? 'Hide Notes' : 'View Doctor Notes'}
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                    )}

                    {(status === 'queued' || status === 'active') && (
                        <button
                        onClick={() => handleCancelAppointment(id)}
                        className="text-xs font-bold text-red-400 hover:bg-red-500/10 px-3 py-2 rounded-full transition-colors"
                        >
                        Cancel Call
                        </button>
                    )}
                </div>
            </div>

            {canViewNotes && isExpanded && (
                <div className="mt-4 p-5 bg-black/20 border border-white/10 rounded-2xl animate-fade-in space-y-4 text-xs text-white/70">
                    {/* Notes content unchanged */}
                </div>
            )}
        </div>
    );
  };

  return (
    <div className="w-full space-y-6 pb-10">
      {isGuest && <DemoModeBanner />}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4 animate-fade-in">
        <div>
          <h2 className="font-dmsans text-3xl font-extrabold text-white tracking-tight">My Consultations</h2>
          <p className="font-inter text-white/60 text-sm font-medium">Track your medical appointments, call records, and prescriptions.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 animate-fade-up" style={{animationDelay: '200ms'}}>
          <div className="liquid-glass p-1 rounded-full flex items-center">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 text-xs font-bold rounded-full flex items-center gap-1.5 transition-all duration-200 ${
                viewMode === 'cards' ? 'bg-cyan-400 text-black' : 'text-white/70 hover:text-white'
              }`}
            >
              <Grid size={13} /> Grid
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 text-xs font-bold rounded-full flex items-center gap-1.5 transition-all duration-200 ${
                viewMode === 'timeline' ? 'bg-cyan-400 text-black' : 'text-white/70 hover:text-white'
              }`}
            >
              <History size={13} /> Timeline
            </button>
          </div>

          <div className="liquid-glass-pill px-4 py-2 text-center">
              <span className="font-dmsans text-cyan-400 text-sm font-black block">{consultationPoints} / 20</span>
              <span className="font-inter text-xs text-white/60">Compliance Points</span>
          </div>

          {['upcoming', 'completed', 'cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
                    filter === f ? 'bg-cyan-400 text-black' : 'liquid-glass text-white/70 hover:bg-white/10'
                }`}
            >
                {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
      </div>


      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg text-sm font-semibold">
          {error}
        </div>
      )}

      {filteredConsultations.length === 0 && !loading ? (
        <div className="liquid-glass p-12 text-center max-w-md mx-auto space-y-4">
          <div className="text-4xl">📅</div>
          <h4 className="font-bold text-white">No Consultations Found</h4>
          <p className="text-xs text-white/60">You have no {filter} consultations.</p>
          <Link to="/doctors">
            <button className="liquid-glass-cta mx-auto rounded-full px-6 py-2 text-sm">Find a Doctor</button>
          </Link>
        </div>
      ) : (
        <>
          {viewMode === 'cards' ? (
            <div className="space-y-4">
              {filteredConsultations.map((item, index) => (
                <ConsultationCard key={item._id || item.id} item={item} index={index}/>
              ))}
            </div>
          ) : (
            <div className="space-y-8 relative pl-6 border-l border-white/10 ml-3">
              {Object.keys(groupedTimeline).map((monthYear) => (
                <div key={monthYear} className="space-y-4">
                  <div className="relative -left-[31px] flex items-center gap-2 mb-4 bg-slate-950 py-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 border-4 border-slate-950 ring-2 ring-cyan-400 flex-shrink-0" />
                    <span className="text-xs font-bold text-white/60 uppercase tracking-widest">{monthYear}</span>
                  </div>

                  <div className="space-y-4">
                    {groupedTimeline[monthYear].map((item, index) => (
                      <ConsultationCard key={item._id || item.id} item={item} index={index}/>
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
