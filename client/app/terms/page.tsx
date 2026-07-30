import { Navbar } from '@/app/components/Navbar'
import { Footer } from '@/app/components/Footer'

export default function TermsPage() {
  return (
    <main className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      <Navbar />
      <div className="flex-1 pt-32 pb-20 max-w-4xl mx-auto px-4 w-full">
        <h1 className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-8">
          Terms of Service
        </h1>
        <div className="prose dark:prose-invert max-w-none">
          <p>By using HealthEase, you agree to these terms...</p>
        </div>
      </div>
      <Footer />
    </main>
  )
}
