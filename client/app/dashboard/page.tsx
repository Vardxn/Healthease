'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Heart, Scale, Video } from 'lucide-react';
import { HealthScore } from '@/app/components/dashboard/HealthScore';
import { VitalsCard } from '@/app/components/dashboard/VitalsCard';
import { MedicationTimeline } from '@/app/components/dashboard/MedicationTimeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DashboardOverview() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-[family-name:var(--font-heading)]">
            Good morning, Jane
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Here is your daily health summary.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Health Score & Consultations */}
        <div className="space-y-6 flex flex-col">
          <HealthScore score={85} trend={2.5} />
          
          <Card className="bg-teal-600 dark:bg-teal-900 text-white border-0 overflow-hidden relative shadow-md">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-teal-500 dark:bg-teal-800 rounded-full blur-3xl opacity-50"></div>
            <CardHeader className="relative z-10 pb-2">
              <CardTitle className="text-teal-50 text-base font-semibold">Upcoming Consultation</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-2xl font-bold font-[family-name:var(--font-heading)] mb-1">Dr. Rajesh Kumar</p>
              <p className="text-teal-100 text-sm mb-6">Cardiologist • Today, 2:30 PM</p>
              
              <Button className="w-full bg-white text-teal-700 hover:bg-teal-50" size="lg">
                <Video className="w-5 h-5 mr-2" />
                Join Video Call
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Middle & Right Column: Vitals & Medications */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
            <VitalsCard 
              title="Heart Rate" 
              value="72" 
              unit="bpm" 
              icon={Heart} 
              trend={-1} 
              status="normal" 
              delay={0.1} 
            />
            <VitalsCard 
              title="Blood Pressure" 
              value="120/80" 
              unit="mmHg" 
              icon={Activity} 
              status="normal" 
              delay={0.2} 
            />
            <VitalsCard 
              title="Weight" 
              value="68.5" 
              unit="kg" 
              icon={Scale} 
              trend={-0.5} 
              status="normal" 
              delay={0.3} 
            />
          </div>

          <MedicationTimeline />

          {/* Find a Doctor Section */}
          <Card className="relative overflow-hidden bg-card/60 backdrop-blur-xl border-border/50 shadow-sm mt-6">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
            <CardHeader className="flex flex-row items-center justify-between relative z-10 pb-2">
              <CardTitle className="text-xl font-bold font-[family-name:var(--font-heading)]">Find a Doctor</CardTitle>
              <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10">View All</Button>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
              {[
                { type: 'Cardiologist', icon: Heart, bg: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400', border: 'hover:border-rose-200 dark:hover:border-rose-900/50' },
                { type: 'Neurologist', icon: Activity, bg: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400', border: 'hover:border-purple-200 dark:hover:border-purple-900/50' },
                { type: 'Dietitian', icon: Scale, bg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400', border: 'hover:border-emerald-200 dark:hover:border-emerald-900/50' },
                { type: 'General', icon: Activity, bg: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400', border: 'hover:border-blue-200 dark:hover:border-blue-900/50' }
              ].map((doc, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border bg-card cursor-pointer transition-all shadow-sm ${doc.border}`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-inner ${doc.bg}`}>
                    <doc.icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium">{doc.type}</span>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
