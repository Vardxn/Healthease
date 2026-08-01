"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Activity, Heart, Save, Loader2 } from 'lucide-react';

const vitalsSchema = z.object({
  heartRate: z.number().min(30).max(250),
  systolic: z.number().min(70).max(250),
  diastolic: z.number().min(40).max(150),
  spo2: z.number().min(50).max(100).optional(),
});

type VitalsFormValues = z.infer<typeof vitalsSchema>;

export function VitalsEntryForm({ patientId, doctorId }: { patientId: string; doctorId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VitalsFormValues>({
    resolver: zodResolver(vitalsSchema),
  });

  const onSubmit = async (data: VitalsFormValues) => {
    setIsSubmitting(true);
    setSuccess(false);
    setErrorMsg('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/vitals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          patientId,
          doctorId,
          ...data
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.msg || result.error || 'Failed to submit vitals');
      }

      setSuccess(true);
      reset(); // clear form
      
      // We could use a toast here if shadcn toaster is configured
      // toast({ title: "Vitals recorded successfully" });
      setTimeout(() => setSuccess(false), 3000);

    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full shadow-sm border-slate-200">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
          <Activity className="h-5 w-5 text-sky-500" />
          Record Patient Vitals
        </CardTitle>
        <CardDescription>Enter the latest measurements. All fields are required except SpO2.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-md text-sm">
            Vitals recorded successfully. The patient dashboard has been updated.
          </div>
        )}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Heart Rate */}
            <div className="space-y-2">
              <Label htmlFor="heartRate" className="text-slate-700">Heart Rate (bpm)</Label>
              <div className="relative">
                <Heart className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  id="heartRate" 
                  type="number" 
                  placeholder="e.g. 72" 
                  className="pl-9"
                  {...register('heartRate', { valueAsNumber: true })} 
                />
              </div>
              {errors.heartRate && <p className="text-xs text-red-500">{errors.heartRate.message}</p>}
            </div>

            {/* SpO2 */}
            <div className="space-y-2">
              <Label htmlFor="spo2" className="text-slate-700">SpO2 (%) - Optional</Label>
              <Input 
                id="spo2" 
                type="number" 
                placeholder="e.g. 98" 
                {...register('spo2', { valueAsNumber: true, setValueAs: v => v === '' ? undefined : v })} 
              />
              {errors.spo2 && <p className="text-xs text-red-500">{errors.spo2.message}</p>}
            </div>

            {/* Systolic BP */}
            <div className="space-y-2">
              <Label htmlFor="systolic" className="text-slate-700">Systolic BP (mmHg)</Label>
              <Input 
                id="systolic" 
                type="number" 
                placeholder="e.g. 120" 
                {...register('systolic', { valueAsNumber: true })} 
              />
              {errors.systolic && <p className="text-xs text-red-500">{errors.systolic.message}</p>}
            </div>

            {/* Diastolic BP */}
            <div className="space-y-2">
              <Label htmlFor="diastolic" className="text-slate-700">Diastolic BP (mmHg)</Label>
              <Input 
                id="diastolic" 
                type="number" 
                placeholder="e.g. 80" 
                {...register('diastolic', { valueAsNumber: true })} 
              />
              {errors.diastolic && <p className="text-xs text-red-500">{errors.diastolic.message}</p>}
            </div>

          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={isSubmitting} className="bg-sky-600 hover:bg-sky-700 text-white">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Vitals
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
