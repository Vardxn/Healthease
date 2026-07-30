import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Phone, Search, Star, Video, Award, Globe, ShieldCheck, ChevronRight, Activity, Loader2 } from 'lucide-react';
import BookingModal from '../components/BookingModal';
import { AuthContext } from '../context/AuthContext';
import { GuestContext } from '../context/GuestContext';
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
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          size={14}
          className={index < fullStars ? 'fill-amber-400 text-amber-400' : 'text-slate-500'}
        />
      ))}
      <span className="ml-1 text-xs text-white font-bold">{normalized.toFixed(1)}</span>
    </div>
  );
};

const DoctorAvatar = ({ name, profilePhoto }) => {
    const [imageBroken, setImageBroken] = useState(false);

    const glassEffect = "relative overflow-hidden rounded-2xl bg-white/5 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:border-t before:border-rose-100/10 before:bg-gradient-to-r before:from-transparent before:via-rose-100/10 before:to-transparent";

    if (profilePhoto && !imageBroken) {
        return (
            <img
                src={profilePhoto}
                alt={name}
                className={`h-16 w-16 rounded-2xl object-cover shadow-sm ${glassEffect}`}
                onError={() => setImageBroken(true)}
            />
        );
    }

    return (
        <div className={`flex h-16 w-16 items-center justify-center text-lg font-bold text-white shadow-sm ${glassEffect}`}>
            {getInitials(name)}
        </div>
    );
};

const DemoModeBanner = () => (
    <div className="liquid-glass-pill is-demo-banner mb-6">
        <p className="font-dmsans text-xs font-medium uppercase tracking-widest text-green-300">
            Viewing Simulated Data Model
        </p>
    </div>
);


const DoctorDirectory = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const { isGuest } = useContext(GuestContext);
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

  const onlineCount = useMemo(() => {
    return doctors.filter(doc => doc?.availability?.isOnline).length;
  }, [doctors]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="w-full space-y-6 pb-10">
      {isGuest && <DemoModeBanner />}
      {/* SECTION 1: Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="font-dmsans text-3xl font-bold tracking-tight text-white">Find the Right Doctor</h2>
          <p className="font-inter text-white/60 text-sm">Book consultations with verified healthcare professionals online.</p>
        </div>

        <div className="flex gap-3 text-xs font-semibold text-white/60">
          <div className="liquid-glass rounded-full px-4 py-2 text-center">
            <span className="font-dmsans text-white text-lg font-bold block leading-none mb-1">{doctors.length}</span>
            <span className="font-inter text-xs text-white/60">Total Specialists</span>
          </div>
          <div className="liquid-glass rounded-full px-4 py-2 text-center">
            <span className="font-dmsans text-cyan-400 text-lg font-bold block leading-none mb-1">{onlineCount}</span>
            <span className="font-inter text-xs text-white/60">Online Now</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: Smart Search Area */}
      <div className="liquid-glass p-6 space-y-4 animate-fade-up" style={{animationDelay: '200ms'}}>
        <div className="relative w-full">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search doctors, specialties, symptoms..."
            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-full text-sm focus:outline-none focus:border-cyan-400 focus:bg-white/10 transition-all duration-200 text-white"
          />
        </div>

        <div className="space-y-4 pt-2">
          {/* Specialization Filter */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-white/60">Specialization</p>
            <div className="flex flex-wrap gap-2">
              {specializationPills.map((pill) => (
                <button
                  key={pill}
                  type="button"
                  onClick={() => setSpecialization(pill)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
                    specialization === pill
                      ? 'bg-cyan-400 text-black'
                      : 'liquid-glass text-white/70 hover:bg-white/10'
                  }`}
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>

          {/* Mode & Languages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-white/60">Consultation Mode</p>
              <div className="flex flex-wrap gap-2">
                {consultationTypePills.map((type) => {
                  const isActive = consultationType === type;
                  const label = type === 'all' ? 'All Modes' : consultationTypeConfig[type].label;
                  const Icon = type === 'all' ? null : consultationTypeConfig[type].Icon;

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setConsultationType(type)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
                        isActive
                          ? 'bg-cyan-400 text-black'
                          : 'liquid-glass text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {Icon ? <Icon size={12} /> : null}
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-white/60">Language</p>
              <div className="flex flex-wrap gap-2">
                {languagePills.map((pill) => (
                  <button
                    key={pill}
                    type="button"
                    onClick={() => setLanguage(pill)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
                        language === pill
                        ? 'bg-cyan-400 text-black'
                        : 'liquid-glass text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {pill}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Fee & Availability Slider */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-2 border-t border-white/10">
            <div className="flex-1 max-w-md">
              <div className="flex justify-between text-xs font-bold text-white/60 mb-2 uppercase tracking-wider">
                <span>Max Consultation Fee</span>
                <span className="text-cyan-400 font-black">₹{maxFee}</span>
              </div>
              <input
                type="range"
                min="100"
                max="3000"
                step="50"
                value={maxFee}
                onChange={(e) => setMaxFee(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-cyan-400"
              />
            </div>

            <label className="inline-flex items-center gap-2.5 text-xs font-bold text-white cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isOnlineOnly}
                onChange={(e) => setIsOnlineOnly(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-white/10 text-cyan-400 focus:ring-cyan-400"
              />
              Show Active Online Specialists Only
            </label>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg text-sm font-semibold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh] gap-2">
          <Loader2 className="animate-spin text-cyan-400" size={24} />
          <p className="text-xs text-white/60 font-bold">Fetching specialists...</p>
        </div>
      ) : null}

      {/* SECTION 3: Doctor Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {doctors.length === 0 ? (
            <div className="liquid-glass col-span-full p-12 text-center max-w-md mx-auto space-y-3">
              <div className="text-4xl">🧑‍⚕️</div>
              <h4 className="font-bold text-white">No Matching Doctors Found</h4>
              <p className="text-xs text-white/60">Try adjusting filters, specialties, or pricing budgets.</p>
            </div>
          ) : (
            doctors.map((doctor, index) => {
              const isOnline = doctor?.availability?.isOnline;
              const animationDelay = 300 + index * 100;
              return (
                <div
                  key={doctor._id}
                  className="liquid-glass-card hover:-translate-y-1 transition-transform duration-300 flex flex-col justify-between animate-fade-up"
                  style={{ animationDelay: `${animationDelay}ms` }}
                >
                  <div className="p-6 flex flex-col h-full space-y-4">
                    {/* Top Row: Avatar & status */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <DoctorAvatar name={doctor.name} profilePhoto={doctor.profilePhoto} />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-medium font-dmsans text-white text-base leading-tight">Dr. {doctor.name}</h3>
                            <div className="text-cyan-400" title="Verified Specialist">
                              <ShieldCheck size={16} />
                            </div>
                          </div>
                          <p className="font-inter text-xs text-cyan-400/70 font-bold mt-1 uppercase tracking-wider">
                            {doctor.specialization || 'General Medicine'}
                          </p>
                          <p className="font-inter text-xs text-white/60 mt-1">
                            {doctor.experience || 0} years experience
                          </p>
                        </div>
                      </div>

                      {/* Online status indicator */}
                      <div className={`liquid-glass-pill inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-full ${isOnline ? 'text-green-300' : 'text-white/60'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-slate-400'}`} />
                        {isOnline ? 'Online' : 'Offline'}
                      </div>
                    </div>

                    {/* Middle details */}
                    <div className="space-y-2 text-xs text-white/60 pt-2">
                      <div className="flex justify-between">
                        <span>Languages</span>
                        <span className="font-bold text-white truncate max-w-[200px]">
                          {Array.isArray(doctor.languages) && doctor.languages.length
                            ? doctor.languages.join(', ')
                            : 'English, Hindi'}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Details (Fee & reviews) */}
                    <div className="flex items-center justify-between gap-4 pt-2">
                      <div>
                        <span className="text-[10px] font-bold text-white/60 uppercase">Consultation Fee</span>
                        <p className="text-base font-black text-cyan-400">
                          ₹{Number(doctor.consultationFee || 0).toLocaleString('en-IN')}{' '}
                          <span className="text-xs font-normal text-white/60">/ session</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <StarRating rating={doctor.rating} />
                        <span className="text-[10px] text-white/60 font-bold">
                          ({doctor.totalConsultations || 0} consultations)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 4: Book Consultation CTA */}
                  <div className="p-3">
                    <button
                      type="button"
                      onClick={() => openBooking(doctor)}
                      className="w-full liquid-glass-cta rounded-full text-white py-3 font-bold text-sm flex items-center justify-center gap-1 transition-all duration-200 cursor-pointer"
                    >
                      Book Consultation <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

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
