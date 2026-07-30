import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  disabled = false,
  onClick,
  ...props
}) {
  const baseClass = variant === 'secondary' ? 'he-btn-secondary' : 'he-btn-primary';
  
  return (
    <button
      type={type}
      className={`${baseClass} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
