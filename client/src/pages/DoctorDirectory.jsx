import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Phone, Search, Star, Video, Award, Globe, ShieldCheck, ChevronRight, Activity, Loader2 } from 'lucide-react';
import BookingModal from '../components/BookingModal';
import { AuthContext } from '../context/AuthContext';
import { doctorAPI } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';

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
          className={index < fullStars ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
        />
      ))}
      <span className="ml-1 text-xs text-text-primary font-bold">{normalized.toFixed(1)}</span>
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
        className="h-16 w-16 rounded-[14px] object-cover border border-slate-100 shadow-sm"
        onError={() => setImageBroken(true)}
      />
    );
  }

  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-[14px] bg-primary/10 text-lg font-bold text-primary shadow-sm border border-primary/20">
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

  const onlineCount = useMemo(() => {
    return doctors.filter(doc => doc?.availability?.isOnline).length;
  }, [doctors]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="w-full space-y-6 pb-10">
      {/* SECTION 1: Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-text-primary tracking-tight">Find the Right Doctor</h2>
          <p className="text-text-secondary text-sm">Book consultations with verified healthcare professionals online.</p>
        </div>
        
        <div className="flex gap-3 text-xs font-semibold text-text-secondary">
          <div className="bg-surface-secondary border border-border px-4 py-2 rounded-custom text-center">
            <span className="text-text-primary text-lg font-bold block leading-none mb-1">{doctors.length}</span>
            Total Specialists
          </div>
          <div className="bg-surface-secondary border border-border px-4 py-2 rounded-custom text-center">
            <span className="text-success text-lg font-bold block leading-none mb-1">{onlineCount}</span>
            Online Now
          </div>
        </div>
      </div>

      {/* SECTION 2: Smart Search Area */}
      <Card className="p-6 space-y-4">
        <div className="relative w-full">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search doctors, specialties, symptoms..."
            className="w-full pl-11 pr-4 py-3 bg-surface-secondary border border-border rounded-[14px] text-sm focus:outline-none focus:border-primary focus:bg-surface transition-all duration-200 text-text-primary"
          />
        </div>

        <div className="space-y-4 pt-2">
          {/* Specialization Filter */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-text-secondary">Specialization</p>
            <div className="flex flex-wrap gap-2">
              {specializationPills.map((pill) => (
                <button
                  key={pill}
                  type="button"
                  onClick={() => setSpecialization(pill)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200 border ${
                    specialization === pill
                      ? 'border-primary bg-primary text-white hover:bg-primary-dark'
                      : 'border-border bg-surface-secondary text-text-secondary hover:border-text-secondary/50'
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
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-text-secondary">Consultation Mode</p>
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
                      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200 border ${
                        isActive
                          ? 'border-primary bg-primary text-white hover:bg-primary-dark'
                          : 'border-border bg-surface-secondary text-text-secondary hover:border-text-secondary/50'
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
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-text-secondary">Language</p>
              <div className="flex flex-wrap gap-2">
                {languagePills.map((pill) => (
                  <button
                    key={pill}
                    type="button"
                    onClick={() => setLanguage(pill)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200 border ${
                      language === pill
                        ? 'border-primary bg-primary text-white hover:bg-primary-dark'
                        : 'border-border bg-surface-secondary text-text-secondary hover:border-text-secondary/50'
                    }`}
                  >
                    {pill}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Fee & Availability Slider */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-2 border-t border-border">
            <div className="flex-1 max-w-md">
              <div className="flex justify-between text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">
                <span>Max Consultation Fee</span>
                <span className="text-primary font-black">₹{maxFee}</span>
              </div>
              <input
                type="range"
                min="100"
                max="3000"
                step="50"
                value={maxFee}
                onChange={(e) => setMaxFee(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-surface-secondary accent-primary"
              />
            </div>

            <label className="inline-flex items-center gap-2.5 text-xs font-bold text-text-primary cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isOnlineOnly}
                onChange={(e) => setIsOnlineOnly(e.target.checked)}
                className="h-4.5 w-4.5 rounded border-border text-primary focus:ring-primary"
              />
              Show Active Online Specialists Only
            </label>
          </div>
        </div>
      </Card>

      {error && (
        <div className="bg-danger/10 border border-danger/30 text-danger p-4 rounded-custom text-sm font-semibold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh] gap-2">
          <Loader2 className="animate-spin text-primary" size={24} />
          <p className="text-xs text-text-secondary font-bold">Fetching specialists...</p>
        </div>
      ) : null}

      {/* SECTION 3: Doctor Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {doctors.length === 0 ? (
            <Card className="col-span-full p-12 text-center max-w-md mx-auto space-y-3">
              <div className="text-4xl">🧑‍⚕️</div>
              <h4 className="font-bold text-text-primary">No Matching Doctors Found</h4>
              <p className="text-xs text-text-secondary">Try adjusting filters, specialties, or pricing budgets.</p>
            </Card>
          ) : (
            doctors.map((doctor) => {
              const isOnline = doctor?.availability?.isOnline;
              return (
                <Card
                  key={doctor._id}
                  className="hover:shadow-lg hover:-translate-y-1 transition-custom border border-border overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-6 flex flex-col h-full space-y-4">
                    {/* Top Row: Avatar & status */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <DoctorAvatar name={doctor.name} profilePhoto={doctor.profilePhoto} />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-bold text-text-primary text-base leading-tight">Dr. {doctor.name}</h3>
                            <div className="text-primary" title="Verified Specialist">
                              <ShieldCheck size={16} />
                            </div>
                          </div>
                          <p className="text-xs text-secondary font-bold mt-1 uppercase tracking-wider">
                            {doctor.specialization || 'General Medicine'}
                          </p>
                          <p className="text-xs text-text-secondary mt-1">
                            {doctor.experience || 0} years experience
                          </p>
                        </div>
                      </div>

                      {/* Online status indicator */}
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                        isOnline
                          ? 'bg-green-500/10 text-green-500 border-green-500/20'
                          : 'bg-surface-secondary text-text-secondary border-border'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-600' : 'bg-slate-400'}`} />
                        {isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>

                    {/* Middle details */}
                    <div className="space-y-2 text-xs text-text-secondary pt-2">
                      <div className="flex justify-between">
                        <span>Languages</span>
                        <span className="font-bold text-text-primary truncate max-w-[200px]">
                          {Array.isArray(doctor.languages) && doctor.languages.length
                            ? doctor.languages.join(', ')
                            : 'English, Hindi'}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Details (Fee & reviews) */}
                    <div className="flex items-center justify-between gap-4 pt-2">
                      <div>
                        <span className="text-[10px] font-bold text-text-secondary uppercase">Consultation Fee</span>
                        <p className="text-base font-black text-primary">
                          ₹{Number(doctor.consultationFee || 0).toLocaleString('en-IN')}{' '}
                          <span className="text-xs font-normal text-text-secondary">/ session</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <StarRating rating={doctor.rating} />
                        <span className="text-[10px] text-text-secondary font-bold">
                          ({doctor.totalConsultations || 0} consultations)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 4: Book Consultation CTA (Full width card footer button) */}
                  <button
                    type="button"
                    onClick={() => openBooking(doctor)}
                    className="w-full bg-primary hover:bg-primary-dark text-white py-3.5 font-bold text-sm flex items-center justify-center gap-1 transition-all duration-200 cursor-pointer"
                  >
                    Book Consultation <ChevronRight size={16} />
                  </button>
                </Card>
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
