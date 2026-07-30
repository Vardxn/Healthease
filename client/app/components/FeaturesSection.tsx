'use client'

import { motion } from 'framer-motion'
import { ScanLine, CalendarDays, Activity, MessageSquare, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const features = [
  {
    icon: ScanLine,
    title: 'Prescription Scanner',
    description: 'Extract medications instantly with Cloud OCR. Snap a photo and get structured data in 2 seconds.',
    color: '#0D9488',
    href: '/features/prescription-scanner',
  },
  {
    icon: CalendarDays,
    title: 'Smart Schedules',
    description: 'Automatic dosage logs and replenishment alerts. Never miss a medication again.',
    color: '#2563EB',
    href: '/features/smart-schedules',
  },
  {
    icon: Activity,
    title: 'Vitals Analytics',
    description: 'Interactive health tracker with wearable sync. Visualize trends and spot anomalies early.',
    color: '#10B981',
    href: '/features/vitals-analytics',
  },
  {
    icon: MessageSquare,
    title: 'Dr. AI Assistant',
    description: 'Interactive chat for diagnostics and queries. Available 24/7 with medical-grade accuracy.',
    color: '#F59E0B',
    href: '/features/ai-assistant',
  },
]

export function FeaturesSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#0D9488]/10 text-[#0D9488] text-sm font-semibold mb-4">
            What We Offer
          </span>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Everything You Need for Better Health
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Comprehensive healthcare solutions designed to keep you healthy, informed, and in control.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className="group relative p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[color:var(--feature-color)] dark:hover:border-[color:var(--feature-color)] transition-all duration-300 shadow-sm hover:shadow-xl"
              style={{ '--feature-color': feature.color } as React.CSSProperties}
            >
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${feature.color}15` }}
              >
                <feature.icon className="w-7 h-7" style={{ color: feature.color }} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                {feature.description}
              </p>
              <Link
                href={feature.href}
                className="inline-flex items-center gap-2 text-sm font-semibold transition-colors"
                style={{ color: feature.color }}
              >
                Learn more
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
