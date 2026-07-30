'use client';

import { Navbar } from '@/app/components/Navbar'
import { Footer } from '@/app/components/Footer'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ContactPage() {
  return (
    <main className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-[family-name:var(--font-sans)]">
      <Navbar />
      <div className="flex-1 pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-16">
            <h1 className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Get in Touch
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Have questions about HealthEase Enterprise or need technical support? Our team is here to help you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
                <div className="bg-teal-50 dark:bg-teal-900/30 p-3 rounded-full text-teal-600 dark:text-teal-400">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Email Us</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Our friendly team is here to help.</p>
                  <a href="mailto:hello@healthease.com" className="text-teal-600 font-medium hover:underline">hello@healthease.com</a>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
                <div className="bg-teal-50 dark:bg-teal-900/30 p-3 rounded-full text-teal-600 dark:text-teal-400">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Call Us</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Mon-Fri from 8am to 5pm.</p>
                  <a href="tel:+1234567890" className="text-teal-600 font-medium hover:underline">+1 (555) 123-4567</a>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
                <div className="bg-teal-50 dark:bg-teal-900/30 p-3 rounded-full text-teal-600 dark:text-teal-400">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Office</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    100 Health Innovation Way<br />
                    San Francisco, CA 94107
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="md:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name</label>
                    <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
                    <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Doe" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                  <input type="email" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="john@example.com" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Message</label>
                  <textarea rows={5} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" placeholder="How can we help you?"></textarea>
                </div>

                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl py-6 text-lg shadow-lg shadow-teal-500/25">
                  Send Message
                  <Send className="w-5 h-5 ml-2" />
                </Button>
              </form>
            </div>
          </div>
          
        </div>
      </div>
      <Footer />
    </main>
  )
}
