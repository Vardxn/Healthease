import { Navbar } from '@/app/components/Navbar'
import { Footer } from '@/app/components/Footer'

export default function ContactPage() {
  return (
    <main className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      <Navbar />
      <div className="flex-1 pt-32 pb-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Contact Sales
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Get in touch with us.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  )
}
