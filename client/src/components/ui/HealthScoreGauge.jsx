import React from 'react'

export default function HealthScoreGauge({ score = 72 }) {
  const radius = 44
  const stroke = 7
  const normalizedRadius = radius - stroke / 2
  const circumference = 2 * Math.PI * normalizedRadius
  const progress = Math.min(Math.max(score, 0), 100)
  const offset = circumference - (progress / 100) * circumference

  const color =
    progress >= 75 ? '#2dd4bf' : progress >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="flex flex-col items-center justify-center gap-1">
      <svg height={radius * 2} width={radius * 2}>
        <circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={stroke}
        />

        <circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
            transition: 'stroke-dashoffset 1s ease',
          }}
        />

        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fontSize="18"
          fontWeight="700"
          fontFamily="inherit"
        >
          {progress}
        </text>
      </svg>
      <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '11px' }}>Health Score</span>
    </div>
  )
}
