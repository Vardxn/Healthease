import React from 'react';

export default function Card({
  children,
  interactive = false,
  className = '',
  onClick,
  ...props
}) {
  const cardClass = interactive ? 'he-card-interactive' : 'he-card';
  
  return (
    <div
      className={`${cardClass} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}
