import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Search, Bell, CircleUserRound, Menu, X, Sparkles, ArrowUpRight } from 'lucide-react';
import { LiquidGlass } from './LiquidGlass';
import { MobileMenuOverlay } from './MobileMenuOverlay';
import { useWordReveal } from '../hooks/useWordReveal';
import { AuthContext } from '../context/AuthContext';
import { GuestContext } from '../context/GuestContext';

export const HeroSection = ({
  heroVideoUrl = '/assets/hero-bg.mp4',
  avatarUrls = [
    'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1594824813573-246434de83fb?w=100&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop&q=60'
  ],
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, demoLogin } = useContext(AuthContext);
  const { triggerAuthIntercept } = useContext(GuestContext);

  const handlePrimaryCTA = () => {
    if (isAuthenticated) {
      navigate('/upload');
    } else {
      triggerAuthIntercept("Authentication required to scan and parse your prescriptions. Sign in or view a demo patient session to test our OCR pipeline.");
    }
  };

  const handleAccountAction = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
      return;
    }

    triggerAuthIntercept('Sign in to open your HealthEase dashboard, or view the pre-populated demo patient account instantly.', '/dashboard');
  };

  const handleDemoLogin = async () => {
    const result = await demoLogin();
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <section className="relative w-full h-screen min-h-[650px] overflow-hidden flex flex-col justify-between bg-black text-white">
      {/* BACKGROUND FOOTAGE SCRIM PIPELINE */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          src={heroVideoUrl}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
      </div>

      {/* HEADER NAVIGATION PIPELINE */}
      <header className="relative z-20 w-full flex items-center justify-between px-5 pt-6 sm:px-8 sm:pt-8 md:px-16 lg:px-20 animate-fade-in">
        <div className="flex items-center gap-2 animate-slide-left delay-200 cursor-pointer" onClick={() => navigate('/')}>
          <Activity className="h-8 w-8 md:h-9 md:w-9 text-white stroke-[2]" />
          <span className="font-dmsans text-[28px] md:text-[30px] font-medium tracking-[-0.05em] leading-none">
            HealthEase
          </span>
        </div>

        <nav className="hidden md:block animate-fade-in delay-400">
          <LiquidGlass className="rounded-full px-8 py-3 flex items-center gap-6 font-dmsans text-sm font-medium bg-white/[0.02] backdrop-blur-md">
            <Link to="/" className="text-white">Home</Link>
            <Link to="/features" className="text-white/70 hover:text-white transition-colors">Features</Link>
            <Link to="/how-it-works" className="text-white/70 hover:text-white transition-colors">How It Works</Link>
            <Link to="/for-doctors" className="text-white/70 hover:text-white transition-colors">For Doctors</Link>
          </LiquidGlass>
        </nav>

        <div className="hidden md:flex items-center gap-4 animate-slide-right delay-300">
          <button className="text-white/80 hover:text-white transition-colors" onClick={handleAccountAction}>
            <Search className="h-5 w-5 stroke-[1.5]" />
          </button>
          <button className="text-white/80 hover:text-white transition-colors" onClick={handleAccountAction}>
            <Bell className="h-5 w-5 stroke-[1.5]" />
          </button>
          <LiquidGlass className="h-10 w-10 rounded-full flex items-center justify-center cursor-pointer" onClick={handleAccountAction}>
            <CircleUserRound className="h-5 w-5 text-white/80 stroke-[1.5]" />
          </LiquidGlass>
        </div>

        {/* MOBILE INTERACTIVE HEADER TRIGGER */}
        <div className="md:hidden z-50">
          <LiquidGlass
            as="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="h-10 w-10 rounded-full flex items-center justify-center transition-transform duration-300"
          >
            <div className="relative w-5 h-5">
              <span className={`absolute inset-0 flex items-center justify-center transform transition-all duration-300 ${menuOpen ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}>
                <Menu className="h-5 w-5 stroke-[1.5]" />
              </span>
              <span className={`absolute inset-0 flex items-center justify-center transform transition-all duration-300 ${menuOpen ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`}>
                <X className="h-5 w-5 stroke-[1.5]" />
              </span>
            </div>
          </LiquidGlass>
        </div>
      </header>

      {/* MOBILE FULL SCREEN LAYOUT OVERLAY */}
      <MobileMenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* HERO HERO TITLE CORE MATRIX */}
      <div className="relative z-10 w-full flex-1 flex flex-col justify-center px-5 sm:px-8 md:px-16 lg:px-20 max-w-6xl mt-12 sm:mt-0">
        {/* TRUSTED BADGE CONTAINER */}
        <div className="mb-5 sm:mb-6 animate-fade-up delay-500">
          <LiquidGlass className="rounded-full inline-flex items-center gap-2.5 sm:gap-3 px-3 py-1.5 sm:px-4 sm:py-2">
            <div className="flex -space-x-2">
              {avatarUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Verified Doctor/Patient Headshot ${index + 1}`}
                  className="h-5 w-5 sm:h-6 sm:w-6 rounded-full border-2 border-white/20 object-cover"
                />
              ))}
            </div>
            <span className="font-inter font-light text-xs sm:text-sm text-white/80 whitespace-nowrap">
              trusted by patients & verified doctors
            </span>
          </LiquidGlass>
        </div>

        {/* STAGGERED HEADLINE REVEAL MATRIX */}
        <h1 className="font-dmsans tracking-[-0.05em] font-normal text-[48px] sm:text-[72px] md:text-[96px] lg:text-[112px] leading-[1.05] sm:leading-[0.95]">
          <span className="block text-white">
            {useWordReveal("Prescriptions, Understood", 3)}
            <span className="inline-block overflow-hidden mr-[0.25em] last:mr-0 h-fit pb-1">
              <span className="inline-block animate-word-reveal text-white/45 delay-500">Instantly.</span>
            </span>
          </span>
          <span className="block text-white/45">
            <span className="inline-block overflow-hidden mr-[0.25em] last:mr-0 h-fit pb-1">
              <span className="inline-block animate-word-reveal delay-600">Your</span>
            </span>
            <span className="inline-block overflow-hidden mr-[0.25em] last:mr-0 h-fit pb-1">
              <span className="inline-block animate-word-reveal delay-700">Health,</span>
            </span>
            {useWordReveal("Simplified", 8)}
          </span>
          <span className="block text-white">
            {useWordReveal("by AI.", 9)}
            <span className="inline-flex items-center justify-center align-middle ml-2 animate-scale-in delay-1100">
              <Sparkles className="h-6 w-6 sm:h-10 sm:w-10 text-emerald-400 fill-emerald-400/10" />
            </span>
          </span>
        </h1>

        <p className="font-inter font-light text-sm sm:text-base md:text-lg text-white/70 max-w-xl mt-4 sm:mt-5 animate-fade-up delay-900">
          AI-powered prescription OCR, secure clinical telemetry, and digital treatment logs — built for modern patient care.
        </p>

        {/* Action Controls Frame */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-6 sm:mt-8 animate-fade-up delay-900">
          <LiquidGlass as="button" onClick={handlePrimaryCTA} className="rounded-full px-6 py-3 sm:px-7 sm:py-3.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-white/10 flex items-center">
            Scan Your First Prescription
            <ArrowUpRight className="h-4 w-4 ml-1.5 stroke-[2.5]" />
          </LiquidGlass>
          <button onClick={handleDemoLogin} className="liquid-glass rounded-full px-6 py-3 sm:px-7 sm:py-3.5 text-sm font-medium text-emerald-400 bg-white/[0.02] border border-emerald-400/20 hover:bg-emerald-400/10 transition-colors flex items-center">
            Explore Demo Space
          </button>
          <Link to="/how-it-works" className="font-inter font-normal text-sm text-white/60 underline underline-offset-4 hover:text-white transition-colors">
            See how it works
          </Link>
        </div>
      </div>

      {/* METRIC ROW DISPLAY ARCHETYPE */}
      <div className="relative z-10 w-full px-5 pb-12 sm:px-8 sm:pb-14 md:px-16 lg:px-20 flex flex-wrap items-end gap-8 sm:gap-10 md:gap-16 mt-12 sm:mt-0 animate-fade-up delay-1000">
        {/* Stat Item 1 */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <div className="grid grid-cols-3 gap-1 w-5 h-5">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="w-[2.5px] h-[2.5px] bg-emerald-400 rounded-sm" />
              ))}
            </div>
            <span className="font-inter font-normal text-xl sm:text-2xl md:text-3xl text-white tracking-tight leading-none">94%</span>
          </div>
          <span className="font-inter font-light text-xs sm:text-sm text-white/60">OCR Accuracy</span>
        </div>

        {/* Stat Item 2 */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <div className="grid grid-cols-3 gap-[2px] w-5 h-5">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1 h-1 rounded-[1px] ${i % 2 === 0 ? 'bg-emerald-400' : 'bg-transparent'}`}
                />
              ))}
            </div>
            <span className="font-inter font-normal text-xl sm:text-2xl md:text-3xl text-white tracking-tight leading-none">45–50 req/s</span>
          </div>
          <span className="font-inter font-light text-xs sm:text-sm text-white/60">Pipeline Throughput</span>
        </div>

        {/* Stat Item 3 */}
        <div className="flex flex-col gap-1.5">
          <span className="font-inter font-normal text-xl sm:text-2xl md:text-3xl text-white tracking-tight leading-none">24/7</span>
          <span className="font-inter font-light text-xs sm:text-sm text-white/60">AI Health Assistant</span>
        </div>
      </div>
    </section>
  );
};
