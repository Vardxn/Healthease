'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Play, Shield, Lock, Clock, Star } from 'lucide-react'


export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden min-h-[90vh] flex flex-col justify-center">
      {/* Background Video - Raw and Zoomed */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <video
          src="/assets/hero-bg.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-105"
        />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} // Fable-style spring easing
          >
            {/* Trust badges row */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0D9488]/10 text-[#0D9488] text-xs font-semibold backdrop-blur-md">
                <Shield className="w-3.5 h-3.5" />
                HIPAA Compliant
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold backdrop-blur-md">
                <Lock className="w-3.5 h-3.5" />
                SOC 2 Certified
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-semibold backdrop-blur-md">
                <Clock className="w-3.5 h-3.5" />
                24/7 Support
              </span>
            </div>

            <h1 className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl lg:text-7xl font-bold text-slate-900 dark:text-white leading-[1.1] mb-6 tracking-tight">
              Stop Losing Track of Your{' '}
              <span className="text-[#0D9488] drop-shadow-[0_0_15px_rgba(13,148,136,0.3)] dark:drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">Medications</span> &{' '}
              <span className="text-[#2563EB] drop-shadow-[0_0_15px_rgba(37,99,235,0.3)] dark:drop-shadow-[0_0_15px_rgba(96,165,250,0.3)]">Vitals</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 leading-relaxed mb-8 max-w-xl font-light">
              HealthEase scans prescriptions with AI OCR, tracks your vitals in real-time, 
              and reminds you — so you never miss a dose again.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-[#0D9488] text-white px-10 py-5 rounded-full text-lg font-bold hover:bg-[#0F766E] transition-all shadow-xl shadow-[#0D9488]/30 hover:shadow-[#0D9488]/50 hover:-translate-y-1 w-full sm:w-auto uppercase tracking-wide"
              >
                Launch Demo Dashboard
                <ArrowRight className="w-6 h-6" />
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0D9488] to-[#2563EB] border-2 border-white dark:border-slate-900" />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-900 dark:text-white">4.9/5</span> from 2,000+ patients
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Content - Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, rotateY: -10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{ perspective: 1000 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-slate-900/20 border border-white/20 dark:border-slate-700/50 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/20 dark:border-slate-700/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="flex-1 text-center text-xs text-slate-500 dark:text-slate-400 font-mono">healthease.app/dashboard</div>
              </div>
              {/* Dashboard mockup content */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Heart Rate</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">72 <span className="text-sm font-normal text-slate-500">BPM</span></p>
                  </div>
                  <div className="w-24 h-12 bg-[#10B981]/10 rounded-lg flex items-end p-2 gap-1">
                    {[40,60,45,80,65,90,75,85].map((h,i) => (
                      <div key={i} className="flex-1 bg-[#10B981] rounded-sm" style={{height: `${h}%`}} />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                    <p className="text-sm text-slate-500 mb-1">Blood Pressure</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">120/80</p>
                    <span className="text-xs text-[#10B981] font-medium">Normal</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                    <p className="text-sm text-slate-500 mb-1">Next Dose</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">8:00 PM</p>
                    <span className="text-xs text-[#0D9488] font-medium">Metformin 500mg</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[#0D9488]/5 border border-[#0D9488]/20">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#0D9488] flex items-center justify-center shrink-0">
                      <span className="text-white text-xs font-bold">AI</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Dr. AI Assistant</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Your glucose levels have been stable. Keep up the good work!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Floating elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-6 -right-6 bg-white dark:bg-slate-800 rounded-xl shadow-xl p-4 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#10B981]/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#10B981]" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Status</p>
                  <p className="text-sm font-bold text-[#10B981]">Healthy</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
