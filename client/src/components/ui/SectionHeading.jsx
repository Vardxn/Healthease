import React from 'react';

export default function SectionHeading({
  title,
  subtitle,
  action,
  className = ''
}) {
  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 ${className}`}>
      <div>
        <h2 className="he-section-heading">{title}</h2>
        {subtitle && <p className="he-section-subheading mb-0">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}
