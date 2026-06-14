import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import {
  Sparkles,
  Cpu,
  Users,
  Pill,
  Activity,
  Calendar,
  ShieldCheck,
  ChevronRight,
  Sun,
  Moon,
  CheckCircle2,
  FileCheck,
  Star,
  Video,
  Upload
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-text-primary transition-colors duration-200">
      {/* 1. Header/Navbar */}
      <header className="h-[72px] border-b border-border bg-white/80 dark:bg-card/85 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-[10px] flex items-center justify-center text-white font-bold">
            H
          </div>
          <span className="text-lg font-black tracking-tight">HEALTHEASE</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <Link to="/login">
            <Button variant="secondary" className="px-4 py-2 text-xs font-bold rounded-custom">
              Login
            </Button>
          </Link>
          <Link to="/register">
            <Button className="px-4 py-2 text-xs font-bold rounded-custom">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden py-20 px-6 md:px-12 text-center md:text-left max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full text-xs font-bold text-primary">
            <Sparkles size={12} className="animate-pulse" />
            Recruiter & Placement Portfolio Spotlight
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none">
            AI-Powered <br className="hidden md:inline" />
            <span className="bg-gradient-to-r from-primary to-[#14B8A6] bg-clip-text text-transparent">Healthcare</span> Platform
          </h1>
          
          <p className="text-text-secondary text-base md:text-lg max-w-xl leading-relaxed">
            Digitize handwritten prescriptions, log daily vitals metrics, track medicine stocks with compliance reminders, and consult telemedicine specialists.
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <Link to="/register">
              <Button className="px-6 py-3.5 font-bold rounded-custom text-sm flex items-center gap-1">
                Get Started Free <ChevronRight size={16} />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" className="px-6 py-3.5 font-bold rounded-custom text-sm">
                View Live Demo
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Illustration / Mockup */}
        <div className="relative flex justify-center lg:justify-end">
          <div className="absolute inset-0 bg-primary/10 rounded-full filter blur-3xl opacity-50 -z-10 animate-pulse-slow"></div>
          <Card className="w-full max-w-lg border border-border p-6 shadow-hover bg-white/80 dark:bg-card/80 backdrop-blur-xs relative">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#14B8A6]" />
                <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Medical Hub</span>
              </div>
              <Badge variant="success">Active Status</Badge>
            </div>
            
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-custom">
                <div className="w-10 h-10 bg-primary/10 rounded-[12px] flex items-center justify-center text-primary font-black text-sm">H</div>
                <div>
                  <p className="font-bold text-text-primary">Compliance Tracker</p>
                  <p className="text-text-secondary text-[10px] mt-0.5">Medication Adherence Ratio is at 94%</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="border border-border p-3 rounded-custom text-center">
                  <span className="text-text-secondary font-bold block text-[10px]">Heart Rate</span>
                  <span className="text-lg font-black text-danger mt-1 block">72 bpm</span>
                </div>
                <div className="border border-border p-3 rounded-custom text-center">
                  <span className="text-text-secondary font-bold block text-[10px]">SpO2</span>
                  <span className="text-lg font-black text-secondary mt-1 block">98%</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* 3. Features Grid */}
      <section className="bg-slate-50 dark:bg-slate-900/30 py-20 px-6 md:px-12 border-y border-border">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-text-primary tracking-tight">Comprehensive Healthcare Tools</h2>
            <p className="text-text-secondary text-sm max-w-lg mx-auto">Explore clinical and wellness widgets powered by AI extraction pipelines.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Cpu, title: 'AI Prescription OCR', desc: 'Preprocesses and digitizes handwritten scripts into database records.' },
              { icon: Users, title: 'Doctor Marketplace', desc: 'Browse specialists, specialization pills, languages, and booking forms.' },
              { icon: Pill, title: 'Medicine Tracking', desc: 'Compliance adherence calculations with warning threshold stock logs.' },
              { icon: Activity, title: 'Vitals Analytics', desc: 'Log blood pressure, glucose, temperature, and read 30-day timeline charts.' },
              { icon: Calendar, title: 'Health Timeline', desc: 'Group milestones chronologically by month under vertical node lines.' },
              { icon: Video, title: 'Teleconsultations', desc: 'Start secure video, audio, or chat consults directly inside WebRTC rooms.' }
            ].map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <Card key={idx} className="p-6 space-y-3 hover:translate-y-[-4px] transition-custom border border-border">
                  <div className="w-10 h-10 rounded-[12px] bg-primary/10 text-primary flex items-center justify-center">
                    <Icon size={20} />
                  </div>
                  <h4 className="font-bold text-text-primary text-base">{feat.title}</h4>
                  <p className="text-xs text-text-secondary leading-relaxed">{feat.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. How It Works */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-text-primary tracking-tight">How It Works</h2>
          <p className="text-text-secondary text-sm max-w-lg mx-auto">AI OCR extractors parse prescription schedules into structured calendars.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {[
            { step: '1', title: 'Upload Prescription', desc: 'Photograph or drop a prescription image from any device.' },
            { step: '2', title: 'AI Extracts Data', desc: 'FastAPI AI OCR reads instructions, dosages, and doctor names.' },
            { step: '3', title: 'Track Medicines', desc: 'Mark reminders as taken to update compliance scores.' },
            { step: '4', title: 'Monitor Health', desc: 'Track trends on vitals charts and consult specialists.' }
          ].map((st, idx) => (
            <div key={idx} className="relative space-y-3 p-4">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-black text-sm shadow-md shadow-primary/20">
                {st.step}
              </div>
              <h4 className="font-bold text-text-primary text-base pt-2">{st.title}</h4>
              <p className="text-xs text-text-secondary leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Testimonials Section */}
      <section className="bg-slate-50 dark:bg-slate-900/30 py-20 px-6 md:px-12 border-t border-border">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-text-primary tracking-tight">Trusted by Doctors & Patients</h2>
            <p className="text-text-secondary text-sm max-w-lg mx-auto">Read reviews from healthcare providers and active family accounts.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Dr. Rajesh Kumar', role: 'Chief Cardiologist', comment: 'Healthease allows my patients to stay highly consistent with complex cardiological medicine regimes.' },
              { name: 'Meera Deshmukh', role: 'Chronic Patient Care', comment: 'Uploading prescriptions was so easy. The AI extracted all my heart pills and sets gmail reminders automatically.' },
              { name: 'Amit Sharma', role: 'Fitness enthusiast', comment: 'Logging blood pressure and syncing wearable vitals provides excellent analytics dashboards during doctor followups.' }
            ].map((test, idx) => (
              <Card key={idx} className="p-6 space-y-4 border border-border">
                <div className="flex gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} className="fill-amber-400" />)}
                </div>
                <p className="text-xs text-text-secondary leading-relaxed italic">"{test.comment}"</p>
                <div>
                  <p className="font-bold text-text-primary text-xs">{test.name}</p>
                  <p className="text-[10px] text-text-secondary">{test.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CTA Section */}
      <section className="bg-gradient-to-r from-primary to-[#14B8A6] py-16 px-6 md:px-12 text-center text-white relative overflow-hidden shadow-custom">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-16 -mb-16"></div>
        
        <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Start Managing Your Healthcare Today</h2>
          <p className="text-teal-50 text-sm md:text-base font-light">
            Sign up now and join thousands of active users monitoring their diagnostic sheets, drug compliance stats, and health vitals.
          </p>
          <Link to="/register" className="inline-block pt-2">
            <Button variant="secondary" className="bg-white text-primary border-transparent hover:bg-teal-50 hover:text-primary-hover font-bold shadow-md rounded-custom px-6 py-3 text-sm">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="py-12 px-6 md:px-12 border-t border-border bg-white dark:bg-card">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-text-secondary">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-[8px] flex items-center justify-center text-white font-bold">H</div>
            <span className="font-bold text-text-primary">HEALTHEASE</span>
          </div>
          
          <div className="flex gap-6 font-semibold">
            <a href="https://github.com/Vardxn/Healthease" target="_blank" rel="noopener noreferrer" className="hover:text-primary">GitHub</a>
            <span className="cursor-pointer hover:text-primary">Privacy Policy</span>
            <span className="cursor-pointer hover:text-primary">Terms of Service</span>
            <span className="cursor-pointer hover:text-primary">Contact Support</span>
          </div>

          <p>© 2026 HEALTHEASE. Developed for placements & portfolio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
