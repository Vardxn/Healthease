import React from 'react';

export default function Input({
  label,
  error,
  className = '',
  id,
  ...props
}) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-text-secondary ml-1">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`he-input ${error ? 'border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]' : ''} ${className}`}
        {...props}
      />
      {error && (
        <span className="text-xs text-danger ml-1 mt-0.5">{error}</span>
      )}
    </div>
  );
}
