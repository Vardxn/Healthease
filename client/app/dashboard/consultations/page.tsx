'use client';

import React from 'react';
import { Calendar, Clock, Video, User, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const upcomingConsultations = [
  {
    id: 1,
    doctor: 'Dr. Vikram Singh',
    specialty: 'Cardiologist',
    date: 'Aug 15, 2026',
    time: '10:00 AM',
    type: 'Video Call',
    fee: '₹800',
    status: 'Upcoming'
  },
  {
    id: 2,
    doctor: 'Dr. Sneha Desai',
    specialty: 'General Practitioner',
    date: 'Aug 22, 2026',
    time: '2:30 PM',
    type: 'In Person',
    fee: '₹500',
    status: 'Upcoming'
  }
];

const pastConsultations = [
  {
    id: 3,
    doctor: 'Dr. Rajesh Kumar',
    specialty: 'Dermatologist',
    date: 'Jul 10, 2026',
    time: '11:15 AM',
    type: 'Video Call',
    fee: '₹600',
    status: 'Completed'
  }
];

export default function ConsultationsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10 font-[family-name:var(--font-sans)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-[family-name:var(--font-heading)]">Consultations</h1>
          <p className="text-slate-500 mt-2">Manage your upcoming appointments and view past visits.</p>
        </div>
        <Button className="bg-[#0D9488] hover:bg-[#0F766E] text-white font-medium px-6 py-2 rounded-xl shadow-lg shadow-[#0D9488]/20 transition-all">
          Book New Appointment
        </Button>
      </div>

      {/* Upcoming Section */}
      <div>
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#0D9488]" />
          Upcoming Appointments
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          {upcomingConsultations.map((apt, idx) => (
            <motion.div 
              key={apt.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#0D9488]/10 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-[#0D9488]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{apt.doctor}</h3>
                    <p className="text-sm text-slate-500">{apt.specialty}</p>
                  </div>
                </div>
                <span className="bg-blue-50 text-blue-600 border border-blue-200 text-xs px-2.5 py-1 rounded-full font-medium">
                  {apt.type}
                </span>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400 mb-6 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl flex-wrap">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {apt.date}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {apt.time}
                </div>
                <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                  <span>Fee:</span> {apt.fee}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-xl border-slate-200 dark:border-slate-700">Reschedule</Button>
                <Button className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-xl">
                  {apt.type === 'Video Call' ? (
                    <span className="flex items-center justify-center gap-2">
                      <Video className="w-4 h-4" /> Join Call
                    </span>
                  ) : (
                    'View Details'
                  )}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Past Section */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-slate-400" />
          Past Consultations
        </h2>
        
        <div className="space-y-3">
          {pastConsultations.map((apt) => (
            <div key={apt.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{apt.doctor}</h3>
                  <p className="text-sm text-slate-500">{apt.date} at {apt.time}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full sm:w-auto rounded-lg">View Summary</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
