import { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AchievementsSection from '../components/AchievementsSection';
import ProjectObjectivesSection from '../components/ProjectObjectivesSection';

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
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="gradient-primary text-white rounded-2xl p-10 mb-8 shadow-glow relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-16 -mb-16"></div>
        <div className="relative z-10">
          <h1 className="text-5xl font-bold mb-3 flex items-center gap-3">
            Welcome back, {user?.name}! <span className="text-4xl">👋</span>
          </h1>
          <p className="text-primary-50 text-xl font-light">
            Manage your health records with AI-powered prescription digitization
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link 
          to="/upload"
          className="glass-effect rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary-400 group transform hover:-translate-y-1"
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
          className="glass-effect rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary-400 group transform hover:-translate-y-1"
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
          className="glass-effect rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary-400 group transform hover:-translate-y-1"
        >
          <div className="bg-gradient-primary text-white w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-lg group-hover:scale-110 transition-transform">
            👤
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">My Profile</h3>
          <p className="text-gray-600 leading-relaxed">
            Update your medical history and personal information for better care
          </p>
        </Link>
      </div>

      {/* Features Section */}
      <div className="glass-effect rounded-2xl p-10 shadow-xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
          <span className="text-4xl">🚀</span>
          Platform Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex gap-5 items-start group">
            <div className="bg-primary-100 w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
              🔍
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2 text-lg">Smart OCR Technology</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Advanced image preprocessing and Google Vision API for accurate text extraction from any prescription
              </p>
            </div>
          </div>
          <div className="flex gap-5 items-start group">
            <div className="bg-accent-100 w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
              🤖
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2 text-lg">AI Medical Assistant</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Get instant answers to your medical queries with context-aware AI powered by GPT-4o
              </p>
            </div>
          </div>
          <div className="flex gap-5 items-start group">
            <div className="bg-primary-100 w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
              📊
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2 text-lg">Structured Data</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Medications parsed into searchable format with dosage, frequency, and duration tracking
              </p>
            </div>
          </div>
          <div className="flex gap-5 items-start group">
            <div className="bg-accent-100 w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
              🔒
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2 text-lg">Secure & Private</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Your health records are encrypted and protected with enterprise-grade security and privacy standards
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 mt-10">
        <ProjectObjectivesSection />
      </div>

      <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 mt-0">
        <AchievementsSection />
      </div>
    </div>
  );
};

export default Dashboard;
