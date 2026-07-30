'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface HealthScoreProps {
  score: number;
  label?: string;
  trend?: number;
}

export const HealthScore: React.FC<HealthScoreProps> = ({ score, label = "Health Score", trend = 0 }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const timeout = setTimeout(() => setAnimatedScore(score), 300);
    return () => clearTimeout(timeout);
  }, [score]);

  const getColor = (s: number) => {
    if (s >= 80) return 'text-teal-500';
    if (s >= 60) return 'text-amber-500';
    return 'text-rose-500';
  };

  return (
    <Card className="relative overflow-hidden group shadow-sm border-border/50 bg-card">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={getColor(score)}>
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="font-[family-name:var(--font-heading)]">{label}</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-center relative h-40">
          <svg className="transform -rotate-90 w-36 h-36">
            {/* Background circle */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-slate-100 dark:text-slate-800"
            />
            {/* Progress circle */}
            <motion.circle
              cx="72"
              cy="72"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
              className={getColor(score)}
            />
          </svg>
          
          <div className="absolute flex flex-col items-center justify-center">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={`text-4xl font-bold font-[family-name:var(--font-heading)] ${getColor(score)}`}
            >
              {animatedScore}
            </motion.span>
            <span className="text-xs text-slate-500 font-medium">/ 100</span>
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center text-sm">
          <span className="text-slate-500 dark:text-slate-400">Monthly Trend</span>
          <div className={`flex items-center gap-1 font-medium ${trend >= 0 ? 'text-teal-600' : 'text-rose-600'}`}>
            {trend >= 0 ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>
            )}
            <span>{Math.abs(trend)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
