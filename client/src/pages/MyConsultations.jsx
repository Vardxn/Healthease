import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { consultationAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const badgeClasses = {
  queued: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
  active: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
  completed: 'bg-cyan-500/20 text-cyan-200 border-cyan-500/30',
  cancelled: 'bg-rose-500/20 text-rose-200 border-rose-500/30'
};

const formatDate = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString();
};

const MyConsultations = () => {
  const navigate = useNavigate();
  const { socket } = useContext(AuthContext);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
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
  }, [navigate]);

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

  const sortedConsultations = useMemo(() => {
    return [...consultations].sort((a, b) => {
      const dateA = new Date(a.scheduledAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.scheduledAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }, [consultations]);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5 text-gray-100">
      <header className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
        <h1 className="text-3xl font-bold">My Consultations</h1>
        <p className="mt-1 text-sm text-gray-400">Track your consultation history, status, and doctor notes.</p>
      </header>

      {error ? (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center text-gray-300">
          Loading consultation history...
        </div>
      ) : null}

      {!loading && !error && sortedConsultations.length === 0 ? (
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center text-gray-400">
          No consultations found yet.
        </div>
      ) : null}

      {!loading && !error && sortedConsultations.length > 0 ? (
        <section className="space-y-4">
          {sortedConsultations.map((item) => {
            const id = item._id || item.id;
            const doctorName = item?.doctorId?.name || item?.doctorName || 'Doctor';
            const specialization = item?.doctorId?.specialization || item?.specialization || 'General Medicine';
            const status = item?.status || 'queued';
            const canViewNotes = status === 'completed';
            const isExpanded = !!expanded[id];
            const notes = item?.notes || {};
            const meds = Array.isArray(notes?.prescribedMedicines) ? notes.prescribedMedicines : [];
            const tests = Array.isArray(notes?.testsOrdered) ? notes.testsOrdered : [];

            return (
              <article key={id} className="rounded-2xl border border-gray-800 bg-gray-900 p-5 shadow-lg">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Dr. {doctorName}</h2>
                    <p className="text-sm text-cyan-200">{specialization}</p>
                    <p className="mt-2 text-sm text-gray-300">Date: {formatDate(item.scheduledAt || item.createdAt)}</p>
                    <p className="text-sm text-gray-300 capitalize">Type: {item.consultationType || 'video'}</p>
                    <p className="text-sm text-gray-300">Fee Paid: ₹{Number(item.fee || 0).toLocaleString('en-IN')}</p>
                  </div>

                  <div className="flex flex-col items-start gap-2 md:items-end">
                    <span className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${badgeClasses[status] || 'bg-gray-700 text-gray-200 border-gray-600'}`}>
                      {status}
                    </span>

                    {status === 'active' ? (
                      <button
                        type="button"
                        onClick={() => navigate(`/consultation/${id}`)}
                        className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-gray-950 hover:bg-emerald-400"
                      >
                        Rejoin
                      </button>
                    ) : null}

                    {canViewNotes ? (
                      <button
                        type="button"
                        onClick={() => toggleExpand(id)}
                        className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 hover:bg-cyan-500/20"
                      >
                        {isExpanded ? 'Hide Notes' : 'View Notes'}
                      </button>
                    ) : null}
                  </div>
                </div>

                {canViewNotes && isExpanded ? (
                  <div className="mt-4 space-y-3 rounded-xl border border-gray-800 bg-gray-950/60 p-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">Diagnosis</p>
                      <p className="text-sm text-gray-200">{notes?.diagnosis || 'N/A'}</p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">Medicines</p>
                      {meds.length === 0 ? (
                        <p className="text-sm text-gray-400">No medicines listed.</p>
                      ) : (
                        <ul className="list-inside list-disc space-y-1 text-sm text-gray-200">
                          {meds.map((med, idx) => (
                            <li key={`${id}-med-${idx}`}>
                              {med?.name || 'Medicine'}
                              {med?.dosage ? ` • ${med.dosage}` : ''}
                              {med?.frequency ? ` • ${med.frequency}` : ''}
                              {med?.duration ? ` • ${med.duration}` : ''}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">Tests Ordered</p>
                      {tests.length === 0 ? (
                        <p className="text-sm text-gray-400">No tests ordered.</p>
                      ) : (
                        <ul className="list-inside list-disc space-y-1 text-sm text-gray-200">
                          {tests.map((test, idx) => (
                            <li key={`${id}-test-${idx}`}>
                              {test?.testName || 'Test'}
                              {test?.urgency ? ` • ${test.urgency}` : ''}
                              {test?.reason ? ` • ${test.reason}` : ''}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">Follow-up Date</p>
                      <p className="text-sm text-gray-200">{formatDate(notes?.followUpDate)}</p>
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </section>
      ) : null}
    </div>
  );
};

export default MyConsultations;
