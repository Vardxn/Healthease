import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Stethoscope,
  Beaker,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileText,
  Bookmark,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { patientAPI } from '../services/api';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import SectionHeading from '../components/ui/SectionHeading';

const CareTimeline = () => {
  const { isAuthenticated, user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [timelineGroups, setTimelineGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [expandedEvent, setExpandedEvent] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!authLoading && isAuthenticated && user?._id) {
      fetchCareTimeline();
    }
  }, [authLoading, isAuthenticated, user?._id, navigate]);

  const fetchCareTimeline = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await patientAPI.getCareTimeline(user._id);
      if (response.data?.success) {
        const groupedTimeline = Array.isArray(response.data?.data?.groupedTimeline)
          ? response.data.data.groupedTimeline
          : [];
        setTimelineGroups(groupedTimeline);
      } else {
        setError(response.data?.msg || 'Failed to fetch timeline');
      }
    } catch (err) {
      console.error('Fetch care timeline error:', err);
      setError(err.response?.data?.msg || 'Failed to load care timeline');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'consultation':
        return <Stethoscope size={18} className="text-primary" />;
      case 'test':
        return <Beaker size={18} className="text-purple-600" />;
      case 'vitals':
        return <TrendingUp size={18} className="text-[#14B8A6]" />;
      case 'alert':
        return <AlertCircle size={18} className="text-danger" />;
      case 'prescription':
        return <FileText size={18} className="text-accent" />;
      default:
        return <Calendar size={18} className="text-text-secondary" />;
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      consultation: 'Consultation',
      test: 'Lab Test',
      vitals: 'Vitals Logged',
      alert: 'Vitals Alert',
      prescription: 'Prescription Uploaded',
      milestone: 'Milestone'
    };
    return labels[type] || type;
  };

  const getTypeColorClasses = (type) => {
    switch (type) {
      case 'consultation':
        return { bg: 'bg-primary/10', text: 'text-primary' };
      case 'test':
        return { bg: 'bg-purple-100', text: 'text-purple-700' };
      case 'vitals':
        return { bg: 'bg-teal-50', text: 'text-teal-700' };
      case 'alert':
        return { bg: 'bg-red-50', text: 'text-red-700' };
      case 'prescription':
        return { bg: 'bg-cyan-50', text: 'text-cyan-700' };
      default:
        return { bg: 'bg-slate-100', text: 'text-slate-700' };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'Unknown date';
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredGroups = timelineGroups
    .map((group) => {
      const entries = Array.isArray(group.entries) ? group.entries : [];
      const filteredEntries = filterType === 'all'
        ? entries
        : entries.filter((event) => event.type === filterType);

      return {
        ...group,
        entries: filteredEntries
      };
    })
    .filter((group) => group.entries.length > 0);

  const filteredEventsCount = filteredGroups.reduce((count, group) => count + group.entries.length, 0);

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 size={36} className="text-primary animate-spin" />
        <p className="text-text-secondary font-semibold text-sm">Loading your care timeline...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <h2 className="text-3xl font-extrabold text-text-primary tracking-tight">Health Journey</h2>
        <p className="text-text-secondary text-sm">
          Track prescriptions, consultations, medicines, and vitals logged over time.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {['all', 'consultation', 'test', 'vitals', 'prescription'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-full font-bold text-xs transition-all border ${
              filterType === type
                ? 'bg-primary border-primary text-white shadow-custom'
                : 'bg-white border-border hover:border-text-secondary text-text-secondary'
            }`}
          >
            {type === 'all' ? 'All Events' : getTypeLabel(type)}
          </button>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-danger/20 text-danger p-4 rounded-custom text-sm font-semibold flex items-center gap-3">
          <AlertCircle size={18} className="flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Empty State */}
      {filteredEventsCount === 0 ? (
        <Card className="p-12 text-center max-w-md mx-auto space-y-4">
          <Calendar size={48} className="mx-auto text-text-secondary/50" />
          <h3 className="text-xl font-bold text-text-primary">No Journey Logs</h3>
          <p className="text-xs text-text-secondary">
            {filterType === 'all'
              ? 'Your healthcare timeline will appear here once you schedule appointments, log vitals, or digitize records.'
              : `No ${getTypeLabel(filterType)} records found.`}
          </p>
        </Card>
      ) : (
        // Vertical timeline connector
        <div className="space-y-8 relative pl-6 border-l-2 border-slate-100 ml-3.5">
          {filteredGroups.map((group) => (
            <div key={group.key || group.month} className="space-y-4">
              {/* Month grouping header */}
              <div className="relative -left-[35px] flex items-center gap-2 bg-white py-1">
                <div className="w-3.5 h-3.5 rounded-full bg-primary border-4 border-white ring-2 ring-primary flex-shrink-0" />
                <span className="text-xs font-bold text-text-secondary uppercase tracking-widest bg-white px-2">
                  {group.month || 'Journey Record'}
                </span>
              </div>

              {/* Entries for this month */}
              <div className="space-y-5">
                {group.entries.map((event) => {
                  const colorClasses = getTypeColorClasses(event.type);
                  const isExpanded = expandedEvent === event.id;
                  
                  return (
                    <div key={event.id} className="relative group">
                      {/* Event node badge */}
                      <div className={`absolute -left-[37px] top-4 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white ring-2 ring-slate-100 shadow-sm flex-shrink-0 ${colorClasses.bg}`}>
                        {getTypeIcon(event.type)}
                      </div>

                      <Card
                        className="hover:translate-y-[-2px] transition-custom border border-border p-5 cursor-pointer ml-3"
                        onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-text-primary text-base">
                                {getTypeLabel(event.type)}
                              </h4>
                              {event.status && (
                                <Badge variant={
                                  event.status === 'completed' ? 'secondary' :
                                  event.status === 'active' ? 'success' :
                                  event.status === 'cancelled' ? 'danger' : 'secondary'
                                }>
                                  {event.status}
                                </Badge>
                              )}
                            </div>
                            
                            {event.doctorName && (
                              <p className="text-xs font-semibold text-text-secondary mt-1">
                                with Dr. {event.doctorName}
                                {event.specialization && ` (${event.specialization})`}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-text-secondary font-bold bg-slate-50 border border-border px-2.5 py-1 rounded-full">
                              {formatDate(event.createdAt || event.date)}
                            </span>
                            {isExpanded ? <ChevronUp size={16} className="text-text-secondary" /> : <ChevronDown size={16} className="text-text-secondary" />}
                          </div>
                        </div>

                        {/* Summary description */}
                        {event.summary && (
                          <p className="text-xs text-text-secondary mt-3 leading-relaxed bg-slate-50 border border-border/60 p-3 rounded-[12px]">{event.summary}</p>
                        )}

                        {/* Quick metadata fields */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-3 border-t border-border/50 text-[11px] text-text-secondary font-semibold">
                          {event.consultationType && (
                            <div>
                              <span>Mode:</span>
                              <p className="text-text-primary font-bold capitalize mt-0.5">{event.consultationType}</p>
                            </div>
                          )}
                          {event.testName && (
                            <div>
                              <span>Test Ordered:</span>
                              <p className="text-text-primary font-bold mt-0.5">{event.testName}</p>
                            </div>
                          )}
                          {event.urgency && (
                            <div>
                              <span>Urgency:</span>
                              <p className="text-text-primary font-bold mt-0.5">{event.urgency}</p>
                            </div>
                          )}
                          {event.followUpDate && (
                            <div>
                              <span>Follow-up Scheduled:</span>
                              <p className="text-text-primary font-bold mt-0.5">{formatDate(event.followUpDate)}</p>
                            </div>
                          )}
                        </div>

                        {/* Vitals indicators */}
                        {(event.abnormal || event.isAbnormal) && (
                          <div className="mt-4 px-3 py-2.5 bg-red-50 border border-danger/20 rounded-custom flex items-center gap-2 text-xs text-danger font-semibold">
                            <AlertCircle size={15} />
                            <span>Warning: Abnormal readings logged. Consult with Doctor immediately.</span>
                          </div>
                        )}

                        {event.improvementObserved && (
                          <div className="mt-4 px-3 py-2.5 bg-green-50 border border-success/20 rounded-custom flex items-center gap-2 text-xs text-green-700 font-semibold">
                            <CheckCircle2 size={15} />
                            <span>Adherence Status: Progress and improvements observed.</span>
                          </div>
                        )}
                      </Card>

                      {/* Expanding medical charts notes */}
                      {isExpanded && (
                        <div className="mt-2 ml-3 pl-5 border-l-2 border-slate-100 animate-slideUp">
                          <Card className="p-5 bg-slate-50 border border-border/80 rounded-custom space-y-4 text-xs text-text-secondary">
                            {event.fullNotes?.chiefComplaint && (
                              <div>
                                <p className="font-bold text-text-primary uppercase tracking-wider text-[10px] mb-1">Chief Complaint</p>
                                <p className="text-text-primary bg-white p-3 border border-border rounded-[12px]">{event.fullNotes.chiefComplaint}</p>
                              </div>
                            )}

                            {event.fullNotes?.diagnosis && (
                              <div>
                                <p className="font-bold text-text-primary uppercase tracking-wider text-[10px] mb-1">Diagnosis</p>
                                <p className="text-text-primary bg-white p-3 border border-border rounded-[12px]">{event.fullNotes.diagnosis}</p>
                              </div>
                            )}

                            {Array.isArray(event.fullNotes?.prescribedMedicines) && event.fullNotes.prescribedMedicines.length > 0 && (
                              <div>
                                <p className="font-bold text-text-primary uppercase tracking-wider text-[10px] mb-2">Prescribed Medicines</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {event.fullNotes.prescribedMedicines.map((med, idx) => (
                                    <div key={idx} className="bg-white border border-border rounded-[12px] p-3">
                                      <p className="font-bold text-text-primary text-xs">{med.name}</p>
                                      <p className="text-[10px] text-text-secondary mt-0.5">
                                        {med.dosage} • {med.frequency} • {med.duration}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {Array.isArray(event.fullNotes?.testsOrdered) && event.fullNotes.testsOrdered.length > 0 && (
                              <div>
                                <p className="font-bold text-text-primary uppercase tracking-wider text-[10px] mb-2">Diagnostic Labs</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {event.fullNotes.testsOrdered.map((test, idx) => (
                                    <div key={idx} className="bg-white border border-border rounded-[12px] p-3">
                                      <p className="font-bold text-text-primary text-xs">{test.testName}</p>
                                      <p className="text-[10px] text-text-secondary mt-0.5">{test.urgency || 'Normal'} • {test.reason}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {event.fullNotes?.doctorPrivateNotes && (
                              <div>
                                <p className="font-bold text-text-primary uppercase tracking-wider text-[10px] mb-1">Private Doctor Notes</p>
                                <p className="text-text-primary bg-white p-3 border border-border rounded-[12px]">{event.fullNotes.doctorPrivateNotes}</p>
                              </div>
                            )}

                            {event.improvementDetails && (
                              <div>
                                <p className="font-bold text-text-primary uppercase tracking-wider text-[10px] mb-1">Improvement Logs</p>
                                <p className="text-text-primary bg-white p-3 border border-border rounded-[12px]">{event.improvementDetails}</p>
                              </div>
                            )}
                          </Card>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CareTimeline;
