import React from 'react'

export default function SkeletonCard({ className = '' }) {
  return (
    <div className={`animate-pulse bg-[var(--color-surface-2)] rounded-[var(--radius-card)] p-4 ${className}`}>
      <div className="h-4 w-3/5 bg-gray-200 rounded mb-3" />
      <div className="h-8 w-full bg-gray-200 rounded mb-2" />
      <div className="h-3 w-2/3 bg-gray-200 rounded" />
    </div>
  )
}
