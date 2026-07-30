import React from 'react';

export function VitalsChart() {
  // Mock data for blood pressure and heart rate over 6 months
  const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  const systolic = [135, 132, 128, 125, 122, 120];
  const diastolic = [88, 86, 84, 82, 80, 80];
  
  const maxVal = 150;
  const minVal = 60;
  const range = maxVal - minVal;

  const width = 600;
  const height = 200;
  const paddingX = 40;
  const paddingY = 20;

  const stepX = (width - paddingX * 2) / (months.length - 1);
  
  const getY = (val: number) => {
    return height - paddingY - ((val - minVal) / range) * (height - paddingY * 2);
  };

  const systolicPoints = systolic.map((val, i) => `${paddingX + i * stepX},${getY(val)}`).join(' ');
  const diastolicPoints = diastolic.map((val, i) => `${paddingX + i * stepX},${getY(val)}`).join(' ');

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="min-w-[500px]">
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
          {/* Grid lines */}
          {[60, 90, 120, 150].map((val, i) => (
            <g key={i}>
              <line 
                x1={paddingX} y1={getY(val)} 
                x2={width - paddingX} y2={getY(val)} 
                stroke="currentColor" 
                className="text-slate-200 dark:text-slate-800" 
                strokeDasharray="4 4" 
              />
              <text 
                x={paddingX - 10} y={getY(val) + 4} 
                fontSize="10" fill="currentColor" 
                className="text-slate-400 text-end"
                textAnchor="end"
              >
                {val}
              </text>
            </g>
          ))}

          {/* Lines */}
          <polyline 
            fill="none" stroke="#0D9488" strokeWidth="3" 
            points={systolicPoints} 
            strokeLinecap="round" strokeLinejoin="round" 
          />
          <polyline 
            fill="none" stroke="#6366F1" strokeWidth="3" 
            points={diastolicPoints} 
            strokeLinecap="round" strokeLinejoin="round" 
          />

          {/* Points & Labels */}
          {months.map((month, i) => (
            <g key={i}>
              <text 
                x={paddingX + i * stepX} y={height - 2} 
                fontSize="12" fill="currentColor" 
                className="text-slate-500 font-medium"
                textAnchor="middle"
              >
                {month}
              </text>
              <circle cx={paddingX + i * stepX} cy={getY(systolic[i])} r="4" fill="#0D9488" className="drop-shadow-md" />
              <circle cx={paddingX + i * stepX} cy={getY(diastolic[i])} r="4" fill="#6366F1" className="drop-shadow-md" />
            </g>
          ))}
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#0D9488]"></div>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Systolic (mmHg)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#6366F1]"></div>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Diastolic (mmHg)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
