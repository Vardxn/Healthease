import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from './components/ThemeProvider'
import { ScrollProgress } from './components/ScrollProgress'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'HealthEase | AI-Powered Healthcare & Diagnostics Platform',
  description: 'Scan prescriptions with AI OCR, track vitals, manage medications, and consult with Dr. AI. HIPAA-compliant healthcare platform for patients and providers.',
  keywords: 'healthcare, AI, prescription scanner, vitals tracker, telehealth, HIPAA',
  authors: [{ name: 'HealthEase' }],
  openGraph: {
    title: 'HealthEase — Your AI Health Companion',
    description: 'AI-powered healthcare platform for smarter medication management and vital tracking.',
    type: 'website',
  },
}

import { AuthProvider } from '@/context/AuthContext'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-[family-name:var(--font-sans)] antialiased bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100`}>
        <ThemeProvider>
          <AuthProvider>
            <ScrollProgress />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
