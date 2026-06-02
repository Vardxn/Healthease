import { useState, useEffect } from 'react'
import Sidebar from '../components/layout/Sidebar'
import TopBar from '../components/layout/TopBar'
import SkeletonCard from '../components/ui/SkeletonCard'
import HealthScoreGauge from '../components/ui/HealthScoreGauge'
import { useNavigate } from 'react-router-dom'
import { authAPI, prescriptionAPI, patientAPI } from '../services/api'
import {
  Upload,
  FileText,
  User,
  Stethoscope,
  CalendarCheck,
  Activity,
  Pill,
  HeartPulse,
  Thermometer,
  ArrowRight,
  FileDown,
  Brain,
  Shield,
  Database,
  Search,
} from 'lucide-react'

const FEATURE_CARDS = [
  {
    title: 'Upload Prescription',
    description: 'Digitize handwritten prescriptions using AI-powered OCR in seconds',
    icon: Upload,
    color: 'teal',
    route: '/upload',
  },
  {
    title: 'My Prescriptions',
    description: 'View and manage all your digitized prescription records in one place',
    icon: FileText,
    color: 'blue',
    route: '/prescriptions',
  },
  {
    title: 'My Profile',
    description: 'Update your medical history and personal information for better care',
    icon: User,
    color: 'violet',
    route: '/profile',
  },
  {
    title: 'Consult a Doctor',
    description: 'Browse specialists and start a secure video, audio, or chat consultation',
    icon: Stethoscope,
    color: 'orange',
    route: '/consult',
  },
  {
    title: 'My Consultations',
    description: 'Track upcoming and past consultations with doctors in one timeline',
    icon: CalendarCheck,
    color: 'pink',
    route: '/consultations',
  },
  {
    title: 'Health Timeline',
    description: 'View your complete health journey including consultations and prescriptions',
    icon: Activity,
    color: 'cyan',
    route: '/timeline',
  },
  {
    title: 'Medicine Tracker',
    description: 'Track daily medicines, mark doses as taken, and see refill alerts',
    icon: Pill,
    color: 'green',
    route: '/medicines',
  },
  {
    title: 'Vitals Dashboard',
    description: 'Log and visualize blood pressure, glucose, SpO2, and weight trends',
    icon: HeartPulse,
    color: 'red',
    route: '/vitals',
  },
  {
    title: 'Symptom Checker',
    description: 'Convert plain symptom text into a structured triage result with urgency guidance',
    icon: Thermometer,
    color: 'amber',
    route: '/symptoms',
  },
]

const PLATFORM_FEATURES = [
  {
    icon: Search,
    color: 'teal',
    title: 'Smart OCR Technology',
    description: 'Advanced image preprocessing and Google Vision API for accurate text extraction',
  },
  {
    icon: Brain,
    color: 'violet',
    title: 'AI Medical Assistant',
    description: 'Instant answers to your medical queries with context-aware AI powered by Claude',
  },
  {
    icon: Database,
    color: 'blue',
    title: 'Structured Data',
    description: 'Medications parsed into searchable format with dosage and frequency tracking',
  },
  {
    icon: Shield,
    color: 'green',
    title: 'Secure & Private',
    description: 'Your health records are encrypted with enterprise-grade security standards',
  },
]

const COLOR_MAP = {
  teal: { bg: 'bg-teal-100 dark:bg-teal-900/30', icon: 'text-teal-600 dark:text-teal-400' },
  blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', icon: 'text-blue-600 dark:text-blue-400' },
  violet: { bg: 'bg-violet-100 dark:bg-violet-900/30', icon: 'text-violet-600 dark:text-violet-400' },
  orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', icon: 'text-orange-600 dark:text-orange-400' },
  pink: { bg: 'bg-pink-100 dark:bg-pink-900/30', icon: 'text-pink-600 dark:text-pink-400' },
  cyan: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', icon: 'text-cyan-600 dark:text-cyan-400' },
  green: { bg: 'bg-green-100 dark:bg-green-900/30', icon: 'text-green-600 dark:text-green-400' },
  red: { bg: 'bg-red-100 dark:bg-red-900/30', icon: 'text-red-600 dark:text-red-400' },
  amber: { bg: 'bg-amber-100 dark:bg-amber-900/30', icon: 'text-amber-600 dark:text-amber-400' },
}

const calculateHealthScore = ({ prescriptionsCount, vitalsCount, hasProfile }) => {
  const score = (prescriptionsCount * 10) + (vitalsCount * 15) + (hasProfile ? 10 : 0)
  return Math.min(100, score)
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('User')
  const [healthScore, setHealthScore] = useState(0)
  const [reportLoading, setReportLoading] = useState(false)

  useEffect(() => {
    let active = true

    const loadDashboardData = async () => {
      try {
        const [meResult, prescriptionsResult, vitalsResult, profileResult] = await Promise.allSettled([
          authAPI.getMe(),
          prescriptionAPI.getAll(),
          patientAPI.getVitals(),
          patientAPI.getProfile(),
        ])

        if (!active) return

        const user = meResult.status === 'fulfilled' ? meResult.value.data?.data : null
        const prescriptions = prescriptionsResult.status === 'fulfilled' ? prescriptionsResult.value.data?.data : []
        const vitals = vitalsResult.status === 'fulfilled' ? vitalsResult.value.data?.data : []
        const hasProfile = profileResult.status === 'fulfilled'

        setUserName(user?.name || 'User')
        setHealthScore(calculateHealthScore({
          prescriptionsCount: Array.isArray(prescriptions) ? prescriptions.length : 0,
          vitalsCount: Array.isArray(vitals) ? vitals.length : 0,
          hasProfile,
        }))
      } catch {
        if (!active) return
        setUserName('User')
        setHealthScore(0)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadDashboardData()

    return () => {
      active = false
    }
  }, [])

  const handleGenerateReport = async () => {
    setReportLoading(true)
    try {
      const res = await fetch('/api/reports/generate', { method: 'POST' })
      if (!res.ok) throw new Error('Failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `HealthEase-Report-${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      alert('Could not generate report. Please try again.')
    } finally {
      setReportLoading(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-surface-3)' }}>
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar title="Dashboard" />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">

          {/* ── HERO BANNER ──────────────────────────────── */}
          <div
            className="rounded-2xl p-8 flex items-center justify-between gap-6 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 45%, #0891b2 100%)',
            }}
          >
            {/* Decorative circles */}
            <div className="absolute right-48 top-[-40px] w-48 h-48 rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.05)' }} />
            <div className="absolute right-16 bottom-[-30px] w-32 h-32 rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.07)' }} />

            {/* Left: text + buttons */}
            <div className="flex flex-col gap-4 z-10">
              <div>
                <h1 className="text-3xl font-bold text-white">Welcome back, {userName}! 👋</h1>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginTop: '6px' }}>
                  Manage your health records with AI-powered prescription digitization.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/upload')}
                  className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium text-white transition-all"
                  style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
                >
                  <Upload size={15} /> Upload Prescription
                </button>

                <button
                  onClick={() => navigate('/prescriptions')}
                  className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all"
                  style={{ background: 'white', color: '#0f766e' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f0fdfa')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
                >
                  <FileText size={15} /> My Prescriptions
                </button>

                <button
                  onClick={handleGenerateReport}
                  disabled={reportLoading}
                  className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium text-white transition-all disabled:opacity-60"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                  onMouseEnter={(e) => !reportLoading && (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                >
                  <FileDown size={15} />
                  {reportLoading ? 'Generating...' : 'Download Health Report'}
                </button>
              </div>
            </div>

            {/* Right: Health Score Gauge */}
            <div className="z-10 shrink-0">
              <HealthScoreGauge score={healthScore} />
            </div>
          </div>

          {/* ── FEATURE CARDS GRID ───────────────────────── */}
          <div>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Quick Actions
            </h2>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 card-grid">
                {Array.from({ length: 9 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 card-grid">
                {FEATURE_CARDS.map((card) => {
                  const Icon = card.icon
                  const colors = COLOR_MAP[card.color]
                  return (
                    <div
                      key={card.title}
                      onClick={() => navigate(card.route)}
                      className="group animate-fade-in-up cursor-pointer rounded-2xl p-5 border flex flex-col gap-3 transition-all duration-200 hover:-translate-y-1"
                      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-card)')}
                    >
                      {/* Icon container */}
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colors.bg}`}>
                        <Icon size={20} className={colors.icon} />
                      </div>

                      {/* Text */}
                      <div className="flex-1">
                        <h3 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          {card.title}
                        </h3>
                        <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                          {card.description}
                        </p>
                      </div>

                      {/* Arrow (shows on hover) */}
                      <div className="flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200" style={{ color: 'var(--color-brand)' }}>
                        Open <ArrowRight size={13} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── PLATFORM FEATURES ────────────────────────── */}
          <div>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              🚀 Platform Features
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PLATFORM_FEATURES.map((feat) => {
                const Icon = feat.icon
                const colors = COLOR_MAP[feat.color]
                return (
                  <div key={feat.title} className="rounded-xl p-4 border flex flex-col gap-3" style={{ background: 'var(--color-surface-2)', borderColor: 'var(--color-border)' }}>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colors.bg}`}>
                      <Icon size={17} className={colors.icon} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        {feat.title}
                      </p>
                      <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                        {feat.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}
