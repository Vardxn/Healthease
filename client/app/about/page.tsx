import { Navbar } from '@/app/components/Navbar'
import { StatsSection } from '@/app/components/StatsSection'
import { HowItWorks } from '@/app/components/HowItWorks'
import { TestimonialsSection } from '@/app/components/TestimonialsSection'
import { CTASection } from '@/app/components/CTASection'
import { Footer } from '@/app/components/Footer'

export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      <Navbar />
      <div className="pt-24">
        <div className="text-center py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            About HealthEase
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Our mission is to simplify modern healthcare by connecting patients and doctors through a unified, AI-powered platform.
          </p>
        </div>
      </div>
      <StatsSection />
      <HowItWorks />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  )
}
