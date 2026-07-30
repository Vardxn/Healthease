'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, Activity, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DiseasePredictionPage() {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [predictionResult, setPredictionResult] = useState<any>(null);

  const handlePredict = async () => {
    if (!symptoms.trim()) {
      setError('Please enter your symptoms to get a prediction.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/ml/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ symptoms })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.msg || 'Prediction failed');
      }

      setPredictionResult(data.data);
    } catch (err: any) {
      setError(err.message || 'An error occurred during prediction.');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default: return 'text-green-600 bg-green-100 border-green-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-indigo-600" />
            AI Symptom Analyzer & Disease Prediction
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Describe how you are feeling. Our machine learning algorithm will analyze your symptoms and cross-reference them with your extracted vitals and medical profile.
          </p>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">What are your symptoms?</label>
            <textarea
              className="w-full min-h-[120px] p-4 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
              placeholder="e.g. I've had a severe headache and slight fever for the past 2 days, and I feel nauseous."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
            />
            
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-200 flex gap-2 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <Button 
              onClick={handlePredict} 
              disabled={loading || !symptoms.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Profile & Symptoms...
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4 mr-2" />
                  Predict Potential Conditions
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {predictionResult && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {predictionResult.predictions?.map((pred: any, idx: number) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-slate-900">{pred.disease}</h3>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getSeverityColor(pred.severity)}`}>
                    {pred.severity?.toUpperCase()}
                  </span>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500">Probability</span>
                    <span className="font-semibold text-slate-700">{pred.probability}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ width: `${pred.probability}%` }}
                    />
                  </div>
                </div>

                <div className="mt-auto">
                  <p className="text-sm text-slate-600 italic">"{pred.reasoning}"</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Recommended Actions</h3>
            <ul className="space-y-3">
              {predictionResult.recommendations?.map((rec: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                  <ArrowRight className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {predictionResult.requiresImmediateAttention && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
              <div className="flex items-center gap-3 text-red-800">
                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                <div>
                  <h4 className="font-bold">Immediate Medical Attention Recommended</h4>
                  <p className="text-sm mt-1">Based on your symptoms and vitals, we strongly advise consulting a healthcare professional immediately.</p>
                </div>
              </div>
            </div>
          )}

        </motion.div>
      )}
    </div>
  );
}
