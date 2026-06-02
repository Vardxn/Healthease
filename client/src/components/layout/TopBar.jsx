import React from 'react'
import { Bell } from 'lucide-react'
import ThemeToggle from '../ThemeToggle'

export default function TopBar({ title }) {
  return (
    <header className="flex items-center justify-between gap-4 p-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{title}</h2>
        <div className="text-sm text-[var(--color-text-muted)]">Welcome back — here's your summary.</div>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <button className="relative p-2 rounded-md bg-[var(--color-surface-2)]">
          <Bell size={18} className="text-[var(--color-text-secondary)]" />
          <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[var(--color-surface)]" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--color-brand)] text-white flex items-center justify-center font-semibold">JD</div>
        </div>
      </div>
    </header>
  )
}
