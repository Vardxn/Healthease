import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Upload,
  FileText,
  User,
  Stethoscope,
  CalendarCheck,
  Activity,
  Pill,
  Heart,
  Thermometer,
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Upload Prescription', to: '/upload', icon: Upload },
  { label: 'My Prescriptions', to: '/prescriptions', icon: FileText },
  { label: 'Profile', to: '/profile', icon: User },
  { label: 'Consult a Doctor', to: '/doctors', icon: Stethoscope },
  { label: 'My Consultations', to: '/consultations/my', icon: CalendarCheck },
  { label: 'Health Timeline', to: '/timeline', icon: Activity },
  { label: 'Medicine Tracker', to: '/medicine-tracker', icon: Pill },
  { label: 'Vitals Dashboard', to: '/vitals', icon: Heart },
  { label: 'Symptom Checker', to: '/symptom-checker', icon: Thermometer },
]

function NavItem({ to, label, icon: Icon, active }) {
  const base = 'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150'
  const defaultCls = 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)]'
  const activeCls = 'bg-[var(--color-brand)]/10 text-[var(--color-brand)] font-semibold border-l-3 border-l-[var(--color-brand)]'

  return (
    <Link to={to} className={`${base} ${active ? activeCls : defaultCls}`}>
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  )
}

export default function Sidebar() {
  const { pathname } = useLocation()

  return (
    <aside className="w-64 h-screen sticky top-0 bg-[var(--color-surface)] border-r border-[var(--color-border)] relative">
      {/* subtle gradient overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[var(--color-brand)]/5 to-transparent" />

      <div className="relative z-10 flex flex-col h-full p-4">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[var(--color-border)]">
          <div className="w-10 h-10 bg-[var(--color-brand)] rounded-md flex items-center justify-center text-white font-bold">H</div>
          <div className="font-semibold text-[var(--color-text-primary)]">HEALTHEASE</div>
        </div>

        <div className="mt-2">
          <div className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] px-3 mt-4 mb-1">Clinical</div>
          <nav className="flex flex-col gap-1 px-1">
            {NAV_ITEMS.slice(0, 7).map((item) => (
              <NavItem key={item.to} {...item} active={pathname === item.to} />
            ))}
          </nav>

          <div className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] px-3 mt-4 mb-1">Account</div>
          <nav className="flex flex-col gap-1 px-1">
            {NAV_ITEMS.slice(7).map((item) => (
              <NavItem key={item.to} {...item} active={pathname === item.to} />
            ))}
          </nav>
        </div>

        <div className="mt-auto border-t border-[var(--color-border)] pt-3 flex items-center justify-between">
          <div>{/* ThemeToggle will be injected at topbar area; placeholder here */}</div>
          <button className="text-[var(--color-text-muted)] hover:text-red-500 transition-colors">Log Out</button>
        </div>
      </div>
    </aside>
  )
}
