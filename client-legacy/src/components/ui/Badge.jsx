import React from 'react';

export default function Badge({
  children,
  variant = 'secondary', // success, warning, danger, secondary
  className = '',
  ...props
}) {
  let badgeClass = 'he-badge-secondary';
  
  if (variant === 'success') badgeClass = 'he-badge-success';
  else if (variant === 'warning') badgeClass = 'he-badge-warning';
  else if (variant === 'danger') badgeClass = 'he-badge-danger';
  
  return (
    <span className={`${badgeClass} ${className}`} {...props}>
      {children}
    </span>
  );
}
