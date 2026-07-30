'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Shield } from 'lucide-react'

export function CTASection() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0D9488] to-[#2563EB] p-8 md:p-16 text-center"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          </div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              HIPAA Compliant & End-to-End Encrypted
            </div>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Take Control of Your Health?
            </h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto mb-10">
              Join thousands of patients and healthcare providers who trust HealthEase for smarter, safer health management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 bg-white text-[#0D9488] px-8 py-4 rounded-full text-base font-bold hover:bg-slate-100 transition-colors shadow-xl"
              >
                Start Your Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-transparent text-white border-2 border-white/30 px-8 py-4 rounded-full text-base font-semibold hover:bg-white/10 transition-colors"
              >
                Talk to Sales
              </Link>
            </div>
            <p className="mt-6 text-sm text-white/70">No credit card required. 14-day free trial.</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
