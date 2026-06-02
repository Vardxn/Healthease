import React from 'react'

export default function Card({ children, className = '' }) {
  return (
    <div className={`rounded-xl bg-white shadow-md p-6 ${className}`}>
      {children}
    </div>
  )
}
