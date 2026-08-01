"use client";

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Activity } from 'lucide-react';

export function VitalsChart({ patientId }: { patientId: string }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Fetch time-series data from our new Express endpoint
    const fetchVitals = async () => {
      if (!patientId) return;
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/vitals/${patientId}`);
        const result = await response.json();
        if (result.success) setData(result.data);
      } catch (err) {
        console.error('Failed to fetch vitals:', err);
      }
    };
    fetchVitals();
  }, [patientId]);

  return (
    <Card className="w-full shadow-sm border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
        <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Activity className="h-5 w-5 text-sky-500"/>
          30-Day Vitals Trend
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[300px] w-full">
          <ResponsiveContainer height="100%" width="100%">
            <LineChart margin={{ top: 5, right: 20, bottom: 5, left: 0 }} data={data}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false}/>
              <XAxis axisLine={false} dataKey="date" fontSize={12} stroke="#64748b" tickLine={false}/>
              <YAxis axisLine={false} domain={['dataMin - 10', 'dataMax + 10']} fontSize={12} stroke="#64748b" tickLine={false} yAxisId="left"/>
              <YAxis axisLine={false} domain={['dataMin - 10', 'dataMax + 10']} fontSize={12} orientation="right" stroke="#64748b" tickLine={false} yAxisId="right"/>
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
              <Legend wrapperStyle={{ paddingTop: '10px' }}/>
              <Line activeDot={{ r: 6, fill: '#ef4444' }} dataKey="heartRate" name="Heart Rate (bpm)" stroke="#ef4444" strokeWidth={3} type="monotone" yAxisId="left" />
              <Line dataKey="systolic" name="Systolic (mmHg)" stroke="#0ea5e9" strokeWidth={3} type="monotone" yAxisId="right" activeDot={{ r: 4, fill: '#0ea5e9' }} />
              <Line dataKey="diastolic" name="Diastolic (mmHg)" stroke="#38bdf8" strokeDasharray="4 4" strokeWidth={2} type="monotone" yAxisId="right" activeDot={{ r: 3, fill: '#38bdf8' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
