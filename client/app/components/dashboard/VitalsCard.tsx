'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface VitalsCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: LucideIcon;
  trend?: number;
  status?: 'normal' | 'warning' | 'critical';
  delay?: number;
}

export const VitalsCard: React.FC<VitalsCardProps> = ({ 
  title, 
  value, 
  unit, 
  icon: Icon, 
  trend,
  status = 'normal',
  delay = 0 
}) => {
  const getStatusColor = () => {
    switch(status) {
      case 'warning': return 'text-amber-500 bg-amber-50 dark:bg-amber-500/10';
      case 'critical': return 'text-rose-500 bg-rose-50 dark:bg-rose-500/10';
      default: return 'text-teal-500 bg-teal-50 dark:bg-teal-500/10';
    }
  };

  const getBorderColor = () => {
    switch(status) {
      case 'warning': return 'border-amber-200 dark:border-amber-900/50';
      case 'critical': return 'border-rose-200 dark:border-rose-900/50';
      default: return 'border-slate-100 dark:border-slate-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card className={`h-full ${getBorderColor()} shadow-sm transition-all duration-300`}>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${getStatusColor()}`}>
              <Icon className="w-6 h-6" />
            </div>
            {trend !== undefined && (
              <div className={`flex items-center gap-1 text-sm font-medium ${trend >= 0 ? 'text-teal-600' : 'text-rose-600'}`}>
                {trend > 0 ? '+' : ''}{trend}%
              </div>
            )}
          </div>
          
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</p>
            <div className="flex items-baseline gap-1">
              <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100 font-[family-name:var(--font-heading)]">{value}</h3>
              <span className="text-slate-500 font-medium">{unit}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
