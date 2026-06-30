import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Sparkles, 
  Heart, 
  ArrowRight, 
  Activity, 
  ShieldCheck, 
  Brain, 
  MessageSquare, 
  Calendar 
} from 'lucide-react';
import Button from '../components/ui/Button';

const Landing = () => {
  const { demoLogin, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already logged in, navigate straight to dashboard
  if (isAuthenticated) {
    navigate('/dashboard');
  }

  const handleExploreDemo = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await demoLogin();
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Unable to start demo mode. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-hidden flex flex-col justify-between">
      {/* Background Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      
      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Heart className="text-white fill-white/10" size={20} />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            HEALTHEASE
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link 
            to="/login" 
            className="text-slate-400 hover:text-white font-semibold transition-colors duration-200"
          >
            Login
          </Link>
          <Link 
            to="/register" 
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-teal-400 font-semibold transition-all duration-200"
          >
            Register
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex items-center justify-center px-6 py-12 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-500/10 border border-teal-500/20 rounded-full text-xs font-bold text-teal-400 uppercase tracking-wider animate-pulse">
            <Sparkles size={12} />
            Next-Gen Health Intelligence
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] text-white">
              HealthEase
            </h1>
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              AI-Powered Healthcare Platform
            </h2>
            <p className="max-w-xl mx-auto text-base md:text-lg text-slate-400 leading-relaxed">
              Experience AI-powered healthcare instantly. Scanners, planners, vital logs, and telehealth consults integrated into one beautiful, secure hub.
            </p>
          </div>

          {/* Error display */}
          {error && (
            <div className="max-w-md mx-auto bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-2xl text-xs flex items-center justify-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Call to Actions */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <Button
                onClick={handleExploreDemo}
                disabled={loading}
                className="w-full py-4 text-base font-bold bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-teal-500/10 hover:shadow-teal-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Entering Demo...
                  </>
                ) : (
                  <>
                    Explore Demo <ArrowRight size={18} />
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <span>Already have an account?</span>
              <Link to="/login" className="text-teal-400 hover:text-teal-300 font-bold hover:underline transition-all">
                Login
              </Link>
              <span className="mx-1.5">•</span>
              <span>Don't have one?</span>
              <Link to="/register" className="text-teal-400 hover:text-teal-300 font-bold hover:underline transition-all">
                Register
              </Link>
            </div>
          </div>

          {/* Small Feature Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-12 border-t border-slate-900">
            <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-2xl hover:border-slate-800 transition-all duration-200 text-left">
              <Brain className="text-teal-400 mb-2" size={24} />
              <h4 className="font-bold text-sm text-slate-200">Prescription Scanner</h4>
              <p className="text-xs text-slate-500">Extract medications via Cloud OCR instantly.</p>
            </div>
            <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-2xl hover:border-slate-800 transition-all duration-200 text-left">
              <Calendar className="text-emerald-400 mb-2" size={24} />
              <h4 className="font-bold text-sm text-slate-200">Smart Schedules</h4>
              <p className="text-xs text-slate-500">Automatic dosage logs and replenishment alerts.</p>
            </div>
            <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-2xl hover:border-slate-800 transition-all duration-200 text-left">
              <Activity className="text-cyan-400 mb-2" size={24} />
              <h4 className="font-bold text-sm text-slate-200">Vitals Analytics</h4>
              <p className="text-xs text-slate-500">Interactive health tracker & wearability sync.</p>
            </div>
            <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-2xl hover:border-slate-800 transition-all duration-200 text-left">
              <MessageSquare className="text-teal-400 mb-2" size={24} />
              <h4 className="font-bold text-sm text-slate-200">Dr. AI Assistant</h4>
              <p className="text-xs text-slate-500">Interactive chat for diagnostics and queries.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-xs text-slate-600 relative z-10 border-t border-slate-900">
        <div className="flex items-center justify-center gap-4 mb-2">
          <span>HIPAA Compliant</span>
          <span>•</span>
          <span>End-to-End Encrypted</span>
          <span>•</span>
          <span>Open-Source Portfolio</span>
        </div>
        <div>© 2026 HEALTHEASE. All rights reserved.</div>
      </footer>
    </div>
  );
};

export default Landing;
