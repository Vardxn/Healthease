'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Heart, Scale, Video } from 'lucide-react';
import { HealthScore } from '@/app/components/dashboard/HealthScore';
import { VitalsCard } from '@/app/components/dashboard/VitalsCard';
import { MedicationTimeline } from '@/app/components/dashboard/MedicationTimeline';
import { VitalsChart } from '@/app/components/dashboard/VitalsChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DashboardOverview() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-[family-name:var(--font-heading)]">
            Good morning, Priya
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

          {/* Medical History & Body Analysis Graph */}
          <Card className="border-border/50 shadow-sm overflow-hidden bg-card mt-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold font-[family-name:var(--font-heading)]">Medical History & Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Primary Diagnosis: Stage 1 Hypertension</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Diagnosed in March 2026. Initially presented with elevated blood pressure (135/88 mmHg). 
                  Patient was prescribed Telmisartan 40mg and advised lifestyle modifications including dietary sodium restriction and regular cardiovascular exercise. 
                  Since intervention, blood pressure has steadily normalized.
                </p>
              </div>

              <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Blood Pressure Trend (6 Months)</h4>
              <VitalsChart />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
