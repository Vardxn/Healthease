import { Navbar } from '@/app/components/Navbar'
import { Footer } from '@/app/components/Footer'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      <Navbar />
      <div className="flex-1 pt-32 pb-20 max-w-4xl mx-auto px-4 w-full">
        <h1 className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-8">
          Privacy Policy
        </h1>
        <div className="prose dark:prose-invert max-w-none">
          <p>Your privacy is important to us. As a healthcare platform, we take data security very seriously...</p>
        </div>
      </div>
      <Footer />
    </main>
  )
}
