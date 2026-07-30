'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

interface MobileNavProps {
  links: { href: string; label: string }[]
  onClose: () => void
}

export function MobileNav({ links, onClose }: MobileNavProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 overflow-hidden"
    >
      <div className="px-4 py-6 space-y-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="block text-base font-medium text-slate-600 dark:text-slate-300 hover:text-[#0D9488] transition-colors"
          >
            {link.label}
          </Link>
        ))}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <Link
            href="/login"
            onClick={onClose}
            className="block text-center text-base font-medium text-slate-600 dark:text-slate-300 py-2"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            onClick={onClose}
            className="block text-center text-base font-medium bg-[#0D9488] text-white py-3 rounded-full"
          >
            Get Started
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
