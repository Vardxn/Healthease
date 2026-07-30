'use client'

import { motion } from 'framer-motion'
import { ScanLine, BarChart3, MessageCircle, TrendingUp } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: ScanLine,
    title: 'Scan',
    description: 'Take a photo of your prescription. Our AI OCR extracts medication names, dosages, and schedules instantly.',
    color: '#0D9488',
  },
  {
    number: '02',
    icon: BarChart3,
    title: 'Track',
    description: 'Your medications and vitals are organized in a beautiful dashboard. Sync with Apple Health, Fitbit, or Garmin.',
    color: '#2563EB',
  },
  {
    number: '03',
    icon: MessageCircle,
    title: 'Consult',
    description: 'Ask Dr. AI about symptoms, drug interactions, or health concerns. Get evidence-based answers in seconds.',
    color: '#F59E0B',
  },
  {
    number: '04',
    icon: TrendingUp,
    title: 'Improve',
    description: 'Receive personalized insights, adherence reports, and health trend analysis to optimize your wellness.',
    color: '#10B981',
  },
]

export function HowItWorks() {
  return (
    <section className="py-20 md:py-28 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#2563EB]/10 text-[#2563EB] text-sm font-semibold mb-4">
            How It Works
          </span>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Your Health Journey in 4 Steps
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connector line - desktop only */}
          <div className="hidden lg:block absolute top-24 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-[#0D9488] via-[#2563EB] to-[#10B981]" />
          
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative text-center"
            >
              <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 mb-6 shadow-lg z-10">
                <step.icon className="w-8 h-8" style={{ color: step.color }} />
                <span 
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center"
                  style={{ backgroundColor: step.color }}
                >
                  {step.number}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{step.title}</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
