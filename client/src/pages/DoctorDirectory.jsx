import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Phone, Search, Star, Video } from 'lucide-react';
import BookingModal from '../components/BookingModal';
import { AuthContext } from '../context/AuthContext';
import { doctorAPI } from '../services/api';

const consultationTypeConfig = {
  video: { label: 'Video', Icon: Video },
  audio: { label: 'Audio', Icon: Phone },
  chat: { label: 'Chat', Icon: MessageSquare }
};

const specializationPills = [
  'All',
  'General Physician',
  'Cardiology',
  'Dermatology',
  'Pediatrics',
  'Orthopedics',
  'Neurology'
];

const consultationTypePills = ['all', 'video', 'audio', 'chat'];
const languagePills = ['All', 'English', 'Hindi', 'Urdu', 'Bengali', 'Tamil'];

const getInitials = (name) => {
  if (!name) return 'DR';
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) return 'DR';
  return parts.map((part) => part[0].toUpperCase()).join('');
};

const StarRating = ({ rating = 0 }) => {
  const normalized = Math.max(0, Math.min(5, Number(rating) || 0));
  const fullStars = Math.round(normalized);

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          size={14}
          className={index < fullStars ? 'fill-amber-400 text-amber-400' : 'text-gray-500'}
        />
      ))}
      <span className="ml-1 text-xs text-gray-300">{normalized.toFixed(1)}</span>
    </div>
  );
};

const DoctorAvatar = ({ name, profilePhoto }) => {
  const [imageBroken, setImageBroken] = useState(false);

  if (profilePhoto && !imageBroken) {
    return (
      <img
        src={profilePhoto}
        alt={name}
        className="h-14 w-14 rounded-xl object-cover"
        onError={() => setImageBroken(true)}
      />
    );
  }

  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-cyan-500/20 text-lg font-bold text-cyan-200">
      {getInitials(name)}
    </div>
  );
};

const DoctorDirectory = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [specialization, setSpecialization] = useState('All');
  const [consultationType, setConsultationType] = useState('all');
  const [maxFee, setMaxFee] = useState(3000);
  const [language, setLanguage] = useState('All');
  const [isOnlineOnly, setIsOnlineOnly] = useState(false);

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const queryParams = useMemo(() => {
    const params = {
      page: 1,
      limit: 50,
      maxFee
    };

    if (searchQuery) {
      params.search = searchQuery;
    }

    if (specialization !== 'All') {
      params.specialization = specialization;
    }

    if (consultationType !== 'all') {
      params.consultationType = consultationType;
    }

    if (language !== 'All') {
      params.language = language;
    }

    if (isOnlineOnly) {
      params.isOnline = true;
    }

    return params;
  }, [searchQuery, specialization, consultationType, maxFee, language, isOnlineOnly]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await doctorAPI.getAll(queryParams);
        setDoctors(Array.isArray(response?.data?.data) ? response.data.data : []);
      } catch (err) {
        setError(err.response?.data?.msg || 'Unable to fetch doctors right now');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchDoctors();
    }
  }, [isAuthenticated, queryParams]);

  const openBooking = (doctor) => {
    setSelectedDoctor(doctor);
    setBookingOpen(true);
  };

  const closeBooking = () => {
    setBookingOpen(false);
    setSelectedDoctor(null);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 text-gray-100">
      <section className="rounded-3xl border border-gray-800 bg-gray-900 p-5 md:p-7 shadow-2xl">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">Doctor Directory</h1>
            <p className="text-sm text-gray-400">Find the right doctor by specialty, mode, language, and fee.</p>
          </div>

          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search doctors by name"
              className="w-full rounded-xl border border-gray-700 bg-gray-950 py-3 pl-10 pr-3 text-sm text-gray-100 placeholder:text-gray-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="space-y-3 rounded-2xl border border-gray-800 bg-gray-950/70 p-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Specialization</p>
              <div className="flex flex-wrap gap-2">
                {specializationPills.map((pill) => (
                  <button
                    key={pill}
                    type="button"
                    onClick={() => setSpecialization(pill)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      specialization === pill
                        ? 'border-cyan-400 bg-cyan-500/20 text-cyan-100'
                        : 'border-gray-700 bg-gray-900 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {pill}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Consultation Type</p>
              <div className="flex flex-wrap gap-2">
                {consultationTypePills.map((type) => {
                  const isActive = consultationType === type;
                  const label = type === 'all' ? 'All' : consultationTypeConfig[type].label;
                  const Icon = type === 'all' ? null : consultationTypeConfig[type].Icon;

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setConsultationType(type)}
                      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition ${
                        isActive
                          ? 'border-cyan-400 bg-cyan-500/20 text-cyan-100'
                          : 'border-gray-700 bg-gray-900 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      {Icon ? <Icon size={13} /> : null}
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Max Fee: <span className="text-cyan-300">\u20b9{maxFee}</span>
              </p>
              <input
                type="range"
                min="100"
                max="3000"
                step="50"
                value={maxFee}
                onChange={(e) => setMaxFee(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-700 accent-cyan-400"
              />
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Language</p>
                <div className="flex flex-wrap gap-2">
                  {languagePills.map((pill) => (
                    <button
                      key={pill}
                      type="button"
                      onClick={() => setLanguage(pill)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                        language === pill
                          ? 'border-cyan-400 bg-cyan-500/20 text-cyan-100'
                          : 'border-gray-700 bg-gray-900 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      {pill}
                    </button>
                  ))}
                </div>
              </div>

              <label className="inline-flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={isOnlineOnly}
                  onChange={(e) => setIsOnlineOnly(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-emerald-400 focus:ring-emerald-400"
                />
                Online now only
              </label>
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center text-gray-300">Loading doctors...</div>
      ) : null}

      {!loading && !error ? (
        <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {doctors.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center text-gray-400">
              No doctors matched your filters.
            </div>
          ) : (
            doctors.map((doctor) => (
              <article
                key={doctor._id}
                className="rounded-2xl border border-gray-800 bg-gray-900 p-5 shadow-lg transition hover:border-cyan-500/60"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <DoctorAvatar name={doctor.name} profilePhoto={doctor.profilePhoto} />
                    <div>
                      <h3 className="text-lg font-semibold">Dr. {doctor.name}</h3>
                      <p className="text-sm text-cyan-200">{doctor.specialization || 'General Medicine'}</p>
                      <p className="text-xs text-gray-400">{doctor.experience || 0} yrs experience</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={`inline-block h-2.5 w-2.5 rounded-full ${
                        doctor?.availability?.isOnline ? 'bg-emerald-400' : 'bg-gray-500'
                      }`}
                    />
                    <span className={doctor?.availability?.isOnline ? 'text-emerald-300' : 'text-gray-400'}>
                      {doctor?.availability?.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">Languages</p>
                    <p className="text-sm text-gray-200">
                      {Array.isArray(doctor.languages) && doctor.languages.length
                        ? doctor.languages.join(', ')
                        : 'Not specified'}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">Consultation Modes</p>
                    <div className="flex flex-wrap gap-2">
                      {(doctor.consultationType || []).map((type) => {
                        const config = consultationTypeConfig[type];
                        if (!config) return null;
                        const Icon = config.Icon;
                        return (
                          <span
                            key={type}
                            className="inline-flex items-center gap-1 rounded-full border border-gray-700 bg-gray-800 px-2.5 py-1 text-xs text-gray-200"
                          >
                            <Icon size={12} />
                            {config.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-emerald-300">\u20b9{Number(doctor.consultationFee || 0).toLocaleString('en-IN')} / session</p>
                    <div className="mt-1 flex items-center gap-2">
                      <StarRating rating={doctor.rating} />
                      <span className="text-xs text-gray-400">({doctor.totalConsultations || 0} consultations)</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openBooking(doctor)}
                    className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-gray-950 transition hover:bg-cyan-400"
                  >
                    Book Now
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
      ) : null}

      <BookingModal
        isOpen={bookingOpen}
        onClose={closeBooking}
        doctor={selectedDoctor}
        user={user}
      />
    </div>
  );
};

export default DoctorDirectory;
