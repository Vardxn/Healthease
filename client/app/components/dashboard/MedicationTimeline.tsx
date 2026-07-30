'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, Pill } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
}

const mockMeds: Medication[] = [
  { id: '1', name: 'Atorvastatin', dosage: '20mg', time: '08:00 AM', taken: true },
  { id: '2', name: 'Metformin', dosage: '500mg', time: '01:00 PM', taken: false },
  { id: '3', name: 'Lisinopril', dosage: '10mg', time: '08:00 PM', taken: false },
];

export const MedicationTimeline: React.FC = () => {
  const [meds, setMeds] = useState<Medication[]>(mockMeds);

  const toggleTaken = (id: string) => {
    setMeds(meds.map(med => med.id === id ? { ...med, taken: !med.taken } : med));
  };

  return (
    <Card className="shadow-sm border-border/50 bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-[family-name:var(--font-heading)]">Today's Schedule</CardTitle>
        <Badge variant="secondary" className="bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 hover:bg-teal-50">
          {meds.filter(m => m.taken).length} / {meds.length} Taken
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        {meds.map((med, index) => (
          <motion.div 
            key={med.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            className={`flex items-center p-4 rounded-xl border transition-all ${
              med.taken 
                ? 'bg-muted/50 border-border/50 opacity-75' 
                : 'bg-card border-teal-100 dark:border-teal-900/30 shadow-sm'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0 ${
              med.taken ? 'bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            }`}>
              <Pill className="w-5 h-5" />
            </div>
            
            <div className="flex-1">
              <h4 className={`font-semibold ${med.taken ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                {med.name}
              </h4>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-muted-foreground font-medium">{med.dosage}</span>
                <span className="flex items-center text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 mr-1" />
                  {med.time}
                </span>
              </div>
            </div>

            <button 
              onClick={() => toggleTaken(med.id)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                med.taken 
                  ? 'bg-teal-500 text-white' 
                  : 'border-2 border-slate-200 dark:border-slate-700 text-transparent hover:border-teal-500'
              }`}
            >
              <Check className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
};
