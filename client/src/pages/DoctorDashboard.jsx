import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { doctorConsultationAPI } from '../services/api';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState('');
  const [error, setError] = useState('');

  const doctorToken = useMemo(() => localStorage.getItem('doctorToken'), []);
  const doctorId = useMemo(() => localStorage.getItem('doctorId'), []);
  const doctorProfile = useMemo(() => {
    const raw = localStorage.getItem('doctorProfile');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!doctorToken) {
      navigate('/doctor/login');
      return;
    }

    if (!doctorId) {
      setError('Doctor ID missing. Please login again.');
      setLoading(false);
      return;
    }

    const loadQueue = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await doctorConsultationAPI.getQueue(doctorId);

        const payload = response?.data;
        const data = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.queue)
            ? payload.queue
            : Array.isArray(payload)
              ? payload
              : [];

        setQueue(data);
      } catch (err) {
        setError(err.response?.data?.msg || 'Unable to load consultation queue');
      } finally {
        setLoading(false);
      }
    };

    loadQueue();
  }, [doctorId, doctorToken, navigate]);

  const startConsultation = async (consultationId) => {
    if (!consultationId || !doctorToken) return;

    try {
      setActionLoadingId(consultationId);
      await doctorConsultationAPI.updateStatus(consultationId, 'active');
      navigate(`/consultation/${consultationId}`);
    } catch (err) {
      setError(err.response?.data?.msg || 'Unable to start consultation');
    } finally {
      setActionLoadingId('');
    }
  };

  const logoutDoctor = () => {
    localStorage.removeItem('doctorToken');
    localStorage.removeItem('doctorId');
    localStorage.removeItem('doctorProfile');
    navigate('/doctor/login');
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5 text-gray-100">
      <header className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
            <p className="text-sm text-cyan-200">
              {doctorProfile?.name ? `Dr. ${doctorProfile.name}` : 'Welcome'}
              {doctorProfile?.specialization ? ` • ${doctorProfile.specialization}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={logoutDoctor}
            className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
          >
            Logout
          </button>
        </div>
      </header>

      {error ? (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <section className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Today's Consultation Queue</h2>
          <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs text-cyan-200">
            {queue.length} pending
          </span>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Loading queue...</p>
        ) : queue.length === 0 ? (
          <p className="text-sm text-gray-400">No consultations in queue right now.</p>
        ) : (
          <div className="space-y-3">
            {queue.map((item) => {
              const consultationId = item._id || item.id;
              const patientName = item?.patientId?.name || item?.patientName || 'Patient';

              return (
                <article
                  key={consultationId}
                  className="rounded-xl border border-gray-700 bg-gray-950/70 p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-gray-100">{patientName}</p>
                      <p className="text-sm text-gray-300 capitalize">
                        {item.consultationType || 'consultation'} • {item.status || 'queued'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startConsultation(consultationId)}
                        disabled={actionLoadingId === consultationId}
                        className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-gray-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {actionLoadingId === consultationId ? 'Starting...' : 'Start Consultation'}
                      </button>

                      <Link
                        to={`/consultation/${consultationId}/notes`}
                        className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 hover:bg-cyan-500/20"
                      >
                        Fill Notes
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default DoctorDashboard;
