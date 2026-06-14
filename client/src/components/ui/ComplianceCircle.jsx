import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, HeartPulse } from 'lucide-react';

const ComplianceCircle = ({ percentage = 0 }) => {
  const radius = 42;
  const strokeWidth = 8;
  const size = 104;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      {/* Outer Ring with Glow and Animation */}
      <div 
        className="relative flex items-center justify-center rounded-full"
        style={{ 
          width: size, 
          height: size,
          boxShadow: '0 0 30px rgba(20, 184, 166, 0.25)'
        }}
      >
        {/* Glow effect behind */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#14B8A6]/10 to-[#10B981]/10 blur-sm" />

        <svg width={size} height={size} className="transform -rotate-90 relative z-10">
          <defs>
            <linearGradient id="complianceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#14B8A6" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>

          {/* Ring background */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Animated active path */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#complianceGradient)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: progressOffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Layout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-white">
          <div className="flex items-center gap-0.5 text-teal-300">
            <ShieldCheck size={14} />
            <HeartPulse size={12} className="animate-pulse" />
          </div>
          <span className="text-2xl font-black leading-none mt-0.5">{percentage}%</span>
        </div>
      </div>

      <span className="text-[10px] uppercase font-bold tracking-[2px] mt-3 text-white/70">
        Compliance Ratio
      </span>
    </div>
  );
};

export default ComplianceCircle;
