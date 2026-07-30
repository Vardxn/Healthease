import { Navbar } from '@/app/components/Navbar'
import { Footer } from '@/app/components/Footer'
import { Check, X } from 'lucide-react'
import Link from 'next/link'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for getting started',
    features: [
      { text: 'Up to 5 prescription scans/month', included: true },
      { text: 'Basic vitals tracking', included: true },
      { text: 'Email reminders', included: true },
      { text: 'Community support', included: true },
      { text: 'AI chatbot (10 queries/day)', included: true },
      { text: 'Wearable sync', included: false },
      { text: 'Family sharing', included: false },
      { text: 'Priority support', included: false },
    ],
    cta: 'Get Started',
    href: '/signup',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$12',
    period: '/month',
    description: 'For serious health management',
    features: [
      { text: 'Unlimited prescription scans', included: true },
      { text: 'Advanced vitals analytics', included: true },
      { text: 'SMS & push notifications', included: true },
      { text: 'Priority email support', included: true },
      { text: 'Unlimited AI chatbot', included: true },
      { text: 'Wearable sync (Apple, Fitbit, Garmin)', included: true },
      { text: 'Family sharing (up to 4)', included: true },
      { text: 'Priority support', included: false },
    ],
    cta: 'Start Free Trial',
    href: '/signup?plan=pro',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For clinics and hospitals',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Unlimited family members', included: true },
      { text: 'Provider dashboard', included: true },
      { text: 'API access', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'SLA guarantee', included: true },
      { text: 'On-premise deployment', included: true },
    ],
    cta: 'Contact Sales',
    href: '/contact',
    popular: false,
  },
]

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#0D9488]/10 text-[#0D9488] text-sm font-semibold mb-4">
              Pricing
            </span>
            <h1 className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Start free, upgrade when you need more. No hidden fees, no surprises.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 ${
                  plan.popular
                    ? 'bg-slate-900 dark:bg-slate-800 text-white border-2 border-[#0D9488] shadow-2xl shadow-[#0D9488]/20 scale-105'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#0D9488] text-white text-sm font-bold rounded-full">
                    Most Popular
                  </span>
                )}
                <h3 className={`text-xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-6 ${plan.popular ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                  {plan.description}
                </p>
                <div className="mb-8">
                  <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                    {plan.price}
                  </span>
                  <span className={plan.popular ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}>
                    {plan.period}
                  </span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className={`w-5 h-5 shrink-0 ${plan.popular ? 'text-[#10B981]' : 'text-[#0D9488]'}`} />
                      ) : (
                        <X className="w-5 h-5 shrink-0 text-slate-300 dark:text-slate-600" />
                      )}
                      <span className={`text-sm ${feature.included ? (plan.popular ? 'text-slate-200' : 'text-slate-700 dark:text-slate-300') : 'text-slate-400 dark:text-slate-500'}`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`block text-center py-3 rounded-full font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-[#0D9488] text-white hover:bg-[#0F766E]'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
