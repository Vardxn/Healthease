import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Stethoscope, Beaker, TrendingUp, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { patientAPI } from '../services/api';

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
      // Endpoint: GET /api/patients/:patientId/care-timeline
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
        return <Stethoscope size={20} className="text-blue-400" />;
      case 'test':
        return <Beaker size={20} className="text-purple-400" />;
      case 'vitals':
        return <TrendingUp size={20} className="text-emerald-400" />;
      case 'alert':
        return <AlertCircle size={20} className="text-red-400" />;
      case 'prescription':
        return <AlertCircle size={20} className="text-amber-400" />;
      default:
        return <Calendar size={20} className="text-cyan-400" />;
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      consultation: 'Consultation',
      test: 'Lab Test',
      vitals: 'Vitals',
      alert: 'Vitals Alert',
      prescription: 'Prescription',
      milestone: 'Milestone'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type) => {
    const colors = {
      consultation: 'bg-blue-900/30 border-blue-700 text-blue-200',
      test: 'bg-purple-900/30 border-purple-700 text-purple-200',
      vitals: 'bg-emerald-900/30 border-emerald-700 text-emerald-200',
      alert: 'bg-red-900/30 border-red-700 text-red-200',
      prescription: 'bg-amber-900/30 border-amber-700 text-amber-200',
      milestone: 'bg-cyan-900/30 border-cyan-700 text-cyan-200'
    };
    return colors[type] || 'bg-slate-900/30 border-slate-700 text-slate-200';
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 size={40} className="text-cyan-500 animate-spin mx-auto mb-3" />
          <p className="text-slate-300">Loading your care timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto text-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">📅 Care Timeline</h1>
        <p className="text-slate-400">
          View your complete healthcare journey — consultations, tests, vitals, and milestones
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {['all', 'consultation', 'test', 'vitals', 'prescription'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filterType === type
                ? 'bg-cyan-500 text-slate-900 shadow-glow-cyan'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
            }`}
          >
            {type === 'all' ? 'All Events' : getTypeLabel(type)}
          </button>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 mb-6 text-red-200 flex items-start gap-3">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Empty State */}
      {filteredEventsCount === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
          <Calendar size={48} className="mx-auto text-slate-500 mb-4" />
          <h3 className="text-xl font-bold text-slate-300 mb-2">No timeline events</h3>
          <p className="text-slate-400">
            {filterType === 'all'
              ? 'Your healthcare timeline will appear here once you have consultations, tests, or vitals recorded.'
              : `No ${getTypeLabel(filterType)} records found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredGroups.map((group) => (
            <div key={group.key || group.month}>
              {/* Date Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px flex-1 bg-slate-700"></div>
                <span className="text-sm font-semibold text-cyan-400 bg-slate-900 px-4 py-1 rounded-full">
                  {group.month || 'Unknown'}
                </span>
                <div className="h-px flex-1 bg-slate-700"></div>
              </div>

              {/* Events for this date */}
              <div className="space-y-4 ml-4">
                {group.entries.map((event) => (
                  <div key={event.id}>
                    {/* Timeline Connector */}
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="bg-slate-700 p-3 rounded-full mb-2">
                          {getTypeIcon(event.type)}
                        </div>
                        <div className="w-1 h-12 bg-slate-700"></div>
                      </div>

                      {/* Event Card */}
                      <div
                        className={`flex-1 rounded-xl border p-4 cursor-pointer transition-all hover:shadow-lg ${getTypeColor(event.type)}`}
                        onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                      >
                        {/* Event Title */}
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-bold text-lg">{getTypeLabel(event.type)}</p>
                            {event.doctorName && (
                              <p className="text-sm opacity-80">
                                with Dr. {event.doctorName}
                                {event.specialization && ` (${event.specialization})`}
                              </p>
                            )}
                          </div>
                          {event.status && (
                            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                              event.status === 'completed' ? 'bg-emerald-900/50 text-emerald-200' :
                              event.status === 'active' ? 'bg-blue-900/50 text-blue-200' :
                              event.status === 'cancelled' ? 'bg-red-900/50 text-red-200' :
                              'bg-slate-900/50 text-slate-200'
                            }`}>
                              {event.status}
                            </span>
                          )}
                        </div>

                        {/* Event Summary */}
                        {event.summary && (
                          <p className="text-sm mb-2">{event.summary}</p>
                        )}

                        {/* Quick Details */}
                        <div className="text-xs space-y-1 opacity-80">
                          {event.consultationType && (
                            <p>📞 Type: {event.consultationType}</p>
                          )}
                          {event.testName && (
                            <p>🧪 Test: {event.testName}</p>
                          )}
                          {event.urgency && (
                            <p>⚡ Urgency: {event.urgency}</p>
                          )}
                          {event.reason && (
                            <p>📝 Reason: {event.reason}</p>
                          )}
                          {event.followUpDate && (
                            <p>📅 Follow-up: {formatDate(event.followUpDate)}</p>
                          )}
                        </div>

                        {/* Abnormal Flag */}
                        {(event.abnormal || event.isAbnormal) && (
                          <div className="mt-3 px-3 py-2 bg-red-900/30 border border-red-700 rounded-lg flex items-center gap-2 text-sm text-red-200">
                            <AlertCircle size={16} />
                            <span>Abnormal reading - consult doctor</span>
                          </div>
                        )}

                        {/* Improvement Indicator */}
                        {event.improvementObserved && (
                          <div className="mt-3 px-3 py-2 bg-emerald-900/30 border border-emerald-700 rounded-lg flex items-center gap-2 text-sm text-emerald-200">
                            <CheckCircle2 size={16} />
                            <span>Improvement observed</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedEvent === event.id && (
                      <div className="mt-4 ml-16 bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
                        {event.fullNotes?.chiefComplaint && (
                          <div>
                            <p className="text-sm font-semibold text-cyan-400 mb-1">Chief Complaint</p>
                            <p className="text-slate-300 text-sm">{event.fullNotes.chiefComplaint}</p>
                          </div>
                        )}

                        {event.fullNotes?.diagnosis && (
                          <div>
                            <p className="text-sm font-semibold text-cyan-400 mb-1">Diagnosis</p>
                            <p className="text-slate-300 text-sm">{event.fullNotes.diagnosis}</p>
                          </div>
                        )}

                        {Array.isArray(event.fullNotes?.prescribedMedicines) && event.fullNotes.prescribedMedicines.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-cyan-400 mb-2">Prescribed Medicines</p>
                            <div className="space-y-2">
                              {event.fullNotes.prescribedMedicines.map((med, idx) => (
                                <div key={idx} className="bg-slate-700/50 rounded p-3 text-sm">
                                  <p className="font-medium text-white">{med.name}</p>
                                  <p className="text-slate-300">
                                    {med.dosage} • {med.frequency} • {med.duration}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {Array.isArray(event.fullNotes?.testsOrdered) && event.fullNotes.testsOrdered.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-cyan-400 mb-2">Tests Ordered</p>
                            <div className="space-y-2">
                              {event.fullNotes.testsOrdered.map((test, idx) => (
                                <div key={idx} className="bg-slate-700/50 rounded p-3 text-sm">
                                  <p className="font-medium text-white">{test.testName}</p>
                                  <p className="text-slate-300">
                                    {test.urgency && `${test.urgency} • `}
                                    {test.reason || 'No reason specified'}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {event.fullNotes?.doctorPrivateNotes && (
                          <div>
                            <p className="text-sm font-semibold text-cyan-400 mb-1">Doctor Notes</p>
                            <p className="text-slate-300 text-sm">{event.fullNotes.doctorPrivateNotes}</p>
                          </div>
                        )}

                        {event.improvementDetails && (
                          <div>
                            <p className="text-sm font-semibold text-emerald-400 mb-1">Improvement Details</p>
                            <p className="text-slate-300 text-sm">{event.improvementDetails}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CareTimeline;
