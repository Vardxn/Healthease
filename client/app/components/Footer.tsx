import Link from 'next/link'
import { Shield, Mail, Phone } from 'lucide-react'

const footerLinks = {
  Product: [
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Dashboard', href: '/dashboard-preview' },
    { label: 'Integrations', href: '/integrations' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'HIPAA Notice', href: '/hipaa' },
    { label: 'Security', href: '/security' },
  ],
  Support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Status', href: '/status' },
    { label: 'API Docs', href: '/api-docs' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-[#0D9488] rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="font-[family-name:var(--font-heading)] text-xl font-bold text-slate-900 dark:text-white">
                Health<span className="text-[#0D9488]">Ease</span>
              </span>
            </Link>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              AI-powered healthcare platform for smarter medication management and vital tracking.
            </p>
            <div className="space-y-3">
              <a href="mailto:vardan2701@gmail.com" className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-[#0D9488] transition-colors">
                <Mail className="w-4 h-4" />
                vardan2701@gmail.com
              </a>
              <a href="tel:+918279696707" className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-[#0D9488] transition-colors">
                <Phone className="w-4 h-4" />
                +91-8279696707
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-slate-600 dark:text-slate-400 hover:text-[#0D9488] transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            © 2026 HealthEase. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Shield className="w-4 h-4 text-[#0D9488]" />
            HIPAA Compliant • SOC 2 Certified • 256-bit Encryption
          </div>
        </div>
      </div>
    </footer>
  )
}
