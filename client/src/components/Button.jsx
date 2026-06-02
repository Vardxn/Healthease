import React from 'react'

export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2'
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 px-4 py-2 shadow',
    secondary: 'bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 px-3 py-2',
    ghost: 'bg-transparent text-primary-500 px-3 py-2'
  }

  const cls = `${base} ${variants[variant] || variants.primary} ${className}`

  return (
    <button className={cls} {...props}>
      {children}
    </button>
  )
}
