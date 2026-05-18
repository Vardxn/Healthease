import { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AchievementsSection from '../components/AchievementsSection';

const Dashboard = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="gradient-primary text-white rounded-2xl p-10 mb-8 shadow-glow relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-16 -mb-16"></div>
        <div className="relative z-10">
          <h1 className="text-5xl font-heading font-bold mb-3 flex items-center gap-3">
            Welcome back, {user?.name}! <span className="text-4xl">👋</span>
          </h1>
          <p className="text-primary-50 text-xl font-light">
            Manage your health records with AI-powered prescription digitization
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/upload"
          className="bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:border-gray-200 group transform hover:-translate-y-1"
        >
          <div className="bg-gradient-primary text-white w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-lg group-hover:scale-110 transition-transform">
            📤
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Upload Prescription</h3>
          <p className="text-gray-600 leading-relaxed">
            Digitize handwritten prescriptions using AI-powered OCR technology in seconds
          </p>
        </Link>

        <Link
          to="/prescriptions"
          className="bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:border-gray-200 group transform hover:-translate-y-1"
        >
          <div className="bg-gradient-primary text-white w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-lg group-hover:scale-110 transition-transform">
            📋
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">My Prescriptions</h3>
          <p className="text-gray-600 leading-relaxed">
            View and manage all your digitized prescription records in one place
          </p>
        </Link>

        <Link
          to="/profile"
          className="bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:border-gray-200 group transform hover:-translate-y-1"
        >
          <div className="bg-gradient-primary text-white w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-lg group-hover:scale-110 transition-transform">
            👤
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">My Profile</h3>
          <p className="text-gray-600 leading-relaxed">
            Update your medical history and personal information for better care
          </p>
        </Link>

        <Link
          to="/doctors"
          className="bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:border-gray-200 group transform hover:-translate-y-1"
        >
          <div className="bg-gradient-primary text-white w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-lg group-hover:scale-110 transition-transform">
            📹
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Consult a Doctor</h3>
          <p className="text-gray-600 leading-relaxed">
            Browse specialists and start a secure video, audio, or chat consultation
          </p>
        </Link>

        <Link
          to="/consultations/my"
          className="bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:border-gray-200 group transform hover:-translate-y-1"
        >
          <div className="bg-gradient-primary text-white w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-lg group-hover:scale-110 transition-transform">
            📅
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">My Consultations</h3>
          <p className="text-gray-600 leading-relaxed">
            Track upcoming and past consultations with doctors in one timeline
          </p>
        </Link>

        <Link
          to="/timeline"
          className="bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:border-gray-200 group transform hover:-translate-y-1"
        >
          <div className="bg-gradient-primary text-white w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-lg group-hover:scale-110 transition-transform">
            🕒
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Health Timeline</h3>
          <p className="text-gray-600 leading-relaxed">
            View your complete health journey including consultations, tests, and prescriptions
          </p>
        </Link>

        <Link
          to="/medicine-tracker"
          className="bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:border-gray-200 group transform hover:-translate-y-1"
        >
          <div className="bg-gradient-accent text-white w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-lg group-hover:scale-110 transition-transform">
            💊
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Medicine Tracker</h3>
          <p className="text-gray-600 leading-relaxed">
            Track daily medicines, mark doses as taken, and see refill alerts in one place
          </p>
        </Link>

        <Link
          to="/vitals"
          className="bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:border-gray-200 group transform hover:-translate-y-1"
        >
          <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-lg group-hover:scale-110 transition-transform">
            📈
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Vitals Dashboard</h3>
          <p className="text-gray-600 leading-relaxed">
            Log and visualize blood pressure, glucose, SpO2, and weight trends over time
          </p>
        </Link>

        <Link
          to="/symptom-checker"
          className="bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:border-gray-200 group transform hover:-translate-y-1"
        >
          <div className="bg-gradient-to-r from-rose-500 to-amber-500 text-white w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-lg group-hover:scale-110 transition-transform">
            🩺
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Symptom Checker</h3>
          <p className="text-gray-600 leading-relaxed">
            Convert plain symptom text into a structured triage result with color-coded urgency guidance
          </p>
        </Link>
      </div>

      {/* Features Section */}
      <div className="bg-white w-full rounded-2xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <h2 className="mb-8 flex items-center gap-3 text-2xl font-heading font-bold text-gray-800 md:text-3xl">
          <span className="text-4xl">🚀</span>
          Platform Features
        </h2>
        <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2">
          <div className="flex w-full flex-col items-start gap-4 group sm:flex-row">
            <div className="bg-primary-100 w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
              🔍
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2 text-lg">Smart OCR Technology</h4>
              <p className="text-sm leading-relaxed text-gray-600 md:text-base">
                Advanced image preprocessing and Google Vision API for accurate text extraction from any prescription
              </p>
            </div>
          </div>
          <div className="flex w-full flex-col items-start gap-4 group sm:flex-row">
            <div className="bg-accent-100 w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
              🤖
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2 text-lg">AI Medical Assistant</h4>
              <p className="text-sm leading-relaxed text-gray-600 md:text-base">
                Get instant answers to your medical queries with context-aware AI powered by GPT-4o
              </p>
            </div>
          </div>
          <div className="flex w-full flex-col items-start gap-4 group sm:flex-row">
            <div className="bg-primary-100 w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
              📊
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2 text-lg">Structured Data</h4>
              <p className="text-sm leading-relaxed text-gray-600 md:text-base">
                Medications parsed into searchable format with dosage, frequency, and duration tracking
              </p>
            </div>
          </div>
          <div className="flex w-full flex-col items-start gap-4 group sm:flex-row">
            <div className="bg-accent-100 w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
              🔒
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2 text-lg">Secure & Private</h4>
              <p className="text-sm leading-relaxed text-gray-600 md:text-base">
                Your health records are encrypted and protected with enterprise-grade security and privacy standards
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 w-full">
        <AchievementsSection />
      </div>
    </div>
  );
};

export default Dashboard;
