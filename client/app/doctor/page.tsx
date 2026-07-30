'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, UserPlus, Video, MoreVertical, HeartPulse } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const mockPatients = [
  { id: 1, name: 'Jane Doe', age: 28, lastVisit: 'Today', status: 'Requires Attention', score: 85 },
  { id: 2, name: 'Michael Chen', age: 45, lastVisit: '2 days ago', status: 'Stable', score: 92 },
  { id: 3, name: 'Sarah Connor', age: 34, lastVisit: '1 week ago', status: 'Review Needed', score: 78 },
];

export default function DoctorDashboard() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-[family-name:var(--font-heading)]">
            Welcome, Dr. Smith
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">You have 3 consultations scheduled today.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Patient Note
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: My Patients */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/50 shadow-sm overflow-hidden bg-card">
            <div className="p-6 border-b border-border/50 flex justify-between items-center bg-muted/30">
              <h2 className="font-semibold text-lg font-[family-name:var(--font-heading)] text-foreground">My Patients</h2>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search patients..."
                  className="pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="divide-y divide-border/50">
              {mockPatients.map((patient, index) => (
                <motion.div 
                  key={patient.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 flex items-center justify-between hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border border-blue-100 dark:border-blue-900/50">
                      <AvatarFallback className="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-bold">
                        {patient.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-foreground">{patient.name}</h4>
                      <p className="text-sm text-muted-foreground">Age: {patient.age} • Last visit: {patient.lastVisit}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden md:block">
                      <div className="flex items-center gap-1 text-sm font-medium justify-end mb-1">
                        <HeartPulse className="w-4 h-4 text-teal-500" />
                        <span className={patient.score >= 80 ? 'text-teal-600' : 'text-amber-600'}>{patient.score}/100</span>
                      </div>
                      <Badge variant={patient.status === 'Requires Attention' ? 'destructive' : patient.status === 'Stable' ? 'secondary' : 'outline'} className="text-[10px] uppercase font-bold tracking-wider">
                        {patient.status}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Upcoming Schedule */}
        <div className="space-y-6 flex flex-col">
          <Card className="bg-slate-800 dark:bg-slate-900 text-white shadow-md relative overflow-hidden border-0">
             <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500 dark:bg-blue-800 rounded-full blur-3xl opacity-30"></div>
             <CardHeader className="pb-2">
               <CardTitle className="text-blue-200 text-base font-semibold flex items-center gap-2">
                 <Video className="w-5 h-5" />
                 Next Appointment
               </CardTitle>
             </CardHeader>
             
             <CardContent className="relative z-10">
               <div className="mb-6">
                 <p className="text-2xl font-bold font-[family-name:var(--font-heading)] mb-1">Jane Doe</p>
                 <p className="text-slate-300 text-sm">Follow-up • Today, 2:30 PM</p>
               </div>
               
               <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30" size="lg">
                 Start Video Call
               </Button>
             </CardContent>
          </Card>
          
          <Card className="border-border/50 shadow-sm bg-card mt-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-[family-name:var(--font-heading)]">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 hover:border-blue-200">
                  <span className="text-sm font-medium">Write Prescription</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 hover:border-blue-200">
                  <span className="text-sm font-medium">Lab Results</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
