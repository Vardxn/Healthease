'use client'

import { motion } from 'framer-motion'
import { ScanLine, CalendarDays, Activity, MessageSquare, ArrowRight, BrainCircuit, HeartPulse, Stethoscope, FileText, Sparkles } from 'lucide-react'
import Link from 'next/link'

const coreInnovations = [
  {
    icon: ScanLine,
    title: 'AI Prescription Scanner',
    description: 'Transform handwritten doctor notes into structured data instantly using state-of-the-art Cloud OCR.',
    color: '#0D9488',
    href: '/dashboard/scanner',
    highlight: 'Extracts 99% of medical terms accurately.'
  },
  {
    icon: BrainCircuit,
    title: 'Disease Prediction Engine',
    description: 'Leverage machine learning to predict potential health risks based on your vitals and medical history.',
    color: '#6366F1',
    href: '/dashboard/prediction',
    highlight: 'Proactive healthcare, not reactive.'
  },
  {
    icon: MessageSquare,
    title: 'Dr. AI Assistant',
    description: 'Your 24/7 personalized medical companion. Ask questions, check symptoms, and get instant guidance.',
    color: '#F59E0B',
    href: '/dashboard/chat',
    highlight: 'Trained on medical-grade data.'
  },
]

const standardFeatures = [
  {
    icon: CalendarDays,
    title: 'Smart Medication Schedules',
    description: 'Automatic dosage logs and replenishment alerts. Never miss a medication again.',
    href: '/dashboard/medications',
  },
  {
    icon: Activity,
    title: 'Vitals Analytics',
    description: 'Interactive health tracker with wearable sync. Visualize your health trends easily.',
    href: '/dashboard/vitals',
  },
  {
    icon: Stethoscope,
    title: 'Telehealth Consultations',
    description: 'Book and attend secure video calls with top doctors right from your dashboard.',
    href: '/dashboard/consultations',
  },
  {
    icon: FileText,
    title: 'Secure Health Records',
    description: 'A centralized, HIPAA-compliant vault for all your lab reports and medical history.',
    href: '/dashboard',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 scroll-mt-20 relative overflow-hidden bg-slate-50 dark:bg-slate-950/50">
      {/* Background decorations */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent"></div>
      <div className="absolute top-40 -left-40 w-96 h-96 bg-[#0D9488]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Core Innovations Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-sm font-bold mb-4 shadow-sm border border-indigo-200 dark:border-indigo-800">
            <Sparkles className="w-4 h-4" />
            Our Core Motive
          </span>
          <h2 className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
            Next-Generation <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0D9488] to-indigo-600">AI Healthcare</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            We are redefining patient care. Our proprietary AI tools eliminate manual data entry and provide proactive insights, putting the future of medicine in your hands.
          </p>
        </motion.div>

        {/* Core Innovations Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-28">
          {coreInnovations.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: feature.color }}></div>
              <div className="absolute -right-6 -top-6 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                <feature.icon className="w-32 h-32" style={{ color: feature.color }} />
              </div>
              
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-md"
                style={{ backgroundColor: `${feature.color}15` }}
              >
                <feature.icon className="w-8 h-8" style={{ color: feature.color }} />
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 font-[family-name:var(--font-heading)]">
                {feature.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                {feature.description}
              </p>
              
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 mb-8">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <CheckCircleIcon color={feature.color} />
                  {feature.highlight}
                </p>
              </div>

              <Link
                href={feature.href}
                className="inline-flex items-center gap-2 font-bold transition-all group-hover:gap-3"
                style={{ color: feature.color }}
              >
                Explore Feature
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center mb-20">
          <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1 max-w-xs"></div>
          <HeartPulse className="w-6 h-6 text-slate-400 mx-4" />
          <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1 max-w-xs"></div>
        </div>

        {/* Standard Features Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-slate-900 dark:text-white mb-4">
            The Complete Health Suite
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Everything else you need to manage your daily health, built with the same exceptional standard of quality.
          </p>
        </motion.div>

        {/* Standard Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {standardFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-teal-50 dark:group-hover:bg-teal-900/30 transition-colors">
                <feature.icon className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {feature.description}
              </p>
              <Link
                href={feature.href}
                className="text-sm font-semibold text-slate-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 flex items-center gap-1"
              >
                Learn more <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}

function CheckCircleIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  )
}
