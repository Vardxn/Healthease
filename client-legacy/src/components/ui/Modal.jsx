import React, { useEffect } from 'react';
import Card from './Card';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  maxWidth = 'max-w-lg'
}) {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop click listener */}
      <div className="absolute inset-0" onClick={onClose} />
      
      <Card className={`relative z-10 w-full ${maxWidth} bg-white shadow-hover border border-border animate-slideUp p-6 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
          {title && <h3 className="text-lg font-bold text-text-primary">{title}</h3>}
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-text-secondary hover:text-text-primary transition-all duration-200"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Content */}
        <div className="max-h-[75vh] overflow-y-auto pr-1">
          {children}
        </div>
      </Card>
    </div>
  );
}
