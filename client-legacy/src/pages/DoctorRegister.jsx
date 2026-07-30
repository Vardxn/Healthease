import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const DoctorRegister = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
    experience: '',
    consultationFee: '',
    consultationType: [],
    languages: '',
    bio: ''
  });

  const consultationTypes = ['video', 'audio', 'chat'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConsultationTypeChange = (type) => {
    setFormData(prev => {
      const isSelected = prev.consultationType.includes(type);
      return {
        ...prev,
        consultationType: isSelected
          ? prev.consultationType.filter(t => t !== type)
          : [...prev.consultationType, type]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (!formData.specialization.trim()) {
      setError('Specialization is required');
      return;
    }
    if (!formData.experience || parseInt(formData.experience) < 0) {
      setError('Valid experience (years) is required');
      return;
    }
    if (!formData.consultationFee || parseInt(formData.consultationFee) <= 0) {
      setError('Valid consultation fee is required');
      return;
    }
    if (formData.consultationType.length === 0) {
      setError('Select at least one consultation type');
      return;
    }
    if (!formData.languages.trim()) {
      setError('Languages are required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const languagesArray = formData.languages
        .split(',')
        .map(lang => lang.trim())
        .filter(lang => lang.length > 0);

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        specialization: formData.specialization.trim(),
        experience: parseInt(formData.experience),
        consultationFee: parseInt(formData.consultationFee),
        consultationType: formData.consultationType,
        languages: languagesArray,
        bio: formData.bio.trim() || ''
      };

      const response = await api.post('/doctors/register', payload);

      if (response.data?.success) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/doctor/login');
        }, 1500);
      } else {
        setError(response.data?.msg || 'Registration failed');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.msg || err.message || 'Registration failed. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Card Container */}
        <div className="bg-slate-800 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-8 md:px-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Register as Doctor</h1>
            <p className="text-cyan-100">Join HealthEase and reach more patients</p>
          </div>

          {/* Form Container */}
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-900/30 border border-red-700 text-red-200">
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-900/30 border border-emerald-700 text-emerald-200">
                <CheckCircle2 size={20} className="flex-shrink-0 mt-0.5" />
                <p className="text-sm">{success}</p>
              </div>
            )}

            {/* Row 1: Name and Email */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Dr. John Doe"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="doctor@example.com"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Row 2: Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Row 3: Specialization and Experience */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Specialization *
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  placeholder="e.g., Cardiology, Dentistry"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Experience (Years) *
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="e.g., 5"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Row 4: Consultation Fee */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Consultation Fee (₹) *
              </label>
              <input
                type="number"
                name="consultationFee"
                value={formData.consultationFee}
                onChange={handleInputChange}
                min="1"
                placeholder="e.g., 500"
                className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition"
              />
            </div>

            {/* Row 5: Consultation Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-3">
                Consultation Types * (Select at least one)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {consultationTypes.map(type => (
                  <label
                    key={type}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition ${
                      formData.consultationType.includes(type)
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-200'
                        : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.consultationType.includes(type)}
                      onChange={() => handleConsultationTypeChange(type)}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <span className="capitalize font-medium">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Row 6: Languages */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Languages (Comma-separated) *
              </label>
              <input
                type="text"
                name="languages"
                value={formData.languages}
                onChange={handleInputChange}
                placeholder="e.g., English, Hindi, Tamil"
                className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition"
              />
              <p className="text-xs text-slate-400 mt-1">Separate multiple languages with commas</p>
            </div>

            {/* Row 7: Bio */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Professional Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Brief description about yourself and your practice..."
                rows="4"
                className="w-full px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition transform hover:scale-[1.02] shadow-lg"
            >
              {loading ? 'Registering...' : 'Register as Doctor'}
            </button>

            {/* Login Link */}
            <p className="text-center text-slate-400">
              Already have an account?{' '}
              <Link
                to="/doctor/login"
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition"
              >
                Login here
              </Link>
            </p>
          </form>
        </div>

        {/* Footer Text */}
        <p className="text-center text-slate-400 text-sm mt-6">
          HealthEase - Connecting Doctors with Patients
        </p>
      </div>
    </div>
  );
};

export default DoctorRegister;
