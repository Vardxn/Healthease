'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Dr. Sarah Chen',
    role: 'Endocrinologist',
    image: '/avatars/sarah.jpg',
    content: 'HealthEase has transformed how my patients manage their diabetes. The prescription scanner alone saves us 15 minutes per appointment.',
    rating: 5,
  },
  {
    name: 'Michael Rodriguez',
    role: 'Patient, Type 2 Diabetes',
    image: '/avatars/michael.jpg',
    content: 'I used to forget my metformin all the time. Now I get a gentle reminder and my glucose readings are finally stable. Life-changing.',
    rating: 5,
  },
  {
    name: 'Dr. James Wilson',
    role: 'Family Physician',
    image: '/avatars/james.jpg',
    content: 'The vitals analytics help me spot trends before they become problems. I recommend HealthEase to all my chronic care patients.',
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] text-sm font-semibold mb-4">
            Testimonials
          </span>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Trusted by Patients & Doctors
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <Quote className="absolute top-6 right-6 w-10 h-10 text-[#0D9488]/10" />
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[#F59E0B] text-[#F59E0B]" />
                ))}
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                &quot;{testimonial.content}&quot;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0D9488] to-[#2563EB] flex items-center justify-center text-white font-bold text-lg">
                  {testimonial.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{testimonial.name}</p>
                  <p className="text-sm text-slate-500">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
