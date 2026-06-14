import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  Heart, 
  ShieldCheck, 
  CheckCircle2,
  Activity
} from 'lucide-react';
import Button from '../components/ui/Button';

const Login = () => {
  const { login, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background dark:bg-slate-950 font-sans transition-colors duration-200">
      {/* Left Panel: Branding & Benefits (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-950 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative background glows */}
        <div className="absolute top-[-20%] right-[-20%] w-96 h-96 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl" />
        
        {/* Brand Header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
            <Heart className="text-teal-400 fill-teal-400" size={20} />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">HEALTHEASE</span>
        </div>

        {/* Core Value Statement & Illustrative Mockup */}
        <div className="space-y-8 relative z-10 max-w-lg">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-teal-300 border border-white/5">
              <Sparkles size={12} className="animate-pulse" />
              Intelligence meets patient care
            </div>
            <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight">
              Your Whole Health,<br />
              <span className="text-teal-300 bg-gradient-to-r from-teal-300 to-emerald-400 bg-clip-text text-transparent">In One Smart Place.</span>
            </h1>
            <p className="text-teal-100 text-sm leading-relaxed">
              Experience a modern clinical hub offering prescription AI scanners, medicine schedule planners, vitals dashboards, and telemedicine consultants.
            </p>
          </div>

          {/* Benefits Bullet List */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-1 bg-teal-500/20 rounded-md text-teal-300 border border-teal-500/30">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <p className="font-bold text-sm text-white">AI Prescription Scanner</p>
                <p className="text-xs text-teal-200/80">Digitize clinical documents with advanced parsing algorithms.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-1 bg-teal-500/20 rounded-md text-teal-300 border border-teal-500/30">
                <ShieldCheck size={16} />
              </div>
              <div>
                <p className="font-bold text-sm text-white">Secure Consultations</p>
                <p className="text-xs text-teal-200/80">Direct end-to-end encrypted rooms for telemedicine sessions.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-1 bg-teal-500/20 rounded-md text-teal-300 border border-teal-500/30">
                <Activity size={16} />
              </div>
              <div>
                <p className="font-bold text-sm text-white">Active Adherence Logs</p>
                <p className="text-xs text-teal-200/80">Keep medicine stock metrics and compliance indicators at 100%.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-teal-300/60 relative z-10">
          © 2026 HEALTHEASE. HIPAA Compliant & Secure.
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
        <div className="w-full max-w-md space-y-8 animate-fadeIn">
          {/* Header */}
          <div className="text-center lg:text-left space-y-2">
            <div className="lg:hidden inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">H</div>
              <span className="font-bold text-text-primary tracking-tight">HEALTHEASE</span>
            </div>
            <h2 className="text-3xl font-black text-text-primary tracking-tight">
              Welcome Back
            </h2>
            <p className="text-text-secondary text-sm">
              Enter your credentials to manage your diagnostics and prescriptions.
            </p>
          </div>

          {/* Alert messages */}
          {error && (
            <div className="bg-danger/10 border border-danger/30 text-danger px-4 py-3 rounded-2xl text-xs flex items-center gap-2 animate-slideUp">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-card border border-border rounded-custom text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-text-primary"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-widest">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs font-bold text-primary hover:underline bg-transparent border-0"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-11 pr-11 py-3 bg-white dark:bg-card border border-border rounded-custom text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-text-primary"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary focus:outline-none"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 font-bold rounded-custom flex items-center justify-center gap-2 hover:shadow-glow text-sm transition-all duration-200"
            >
              {loading ? 'Signing in...' : 'Sign In'} <ArrowRight size={16} />
            </Button>
          </form>

          {/* Social Logins Dividers */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background dark:bg-slate-950 px-3 text-text-secondary font-bold">
                Or Continue With
              </span>
            </div>
          </div>

          {/* Social buttons grid */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-card border border-border rounded-custom hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-bold text-text-primary transition-all duration-200"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-card border border-border rounded-custom hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-bold text-text-primary transition-all duration-200"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </button>
          </div>

          <p className="text-center text-xs text-text-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-bold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

