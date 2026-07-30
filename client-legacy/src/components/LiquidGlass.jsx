import React from 'react';

export const LiquidGlass = ({
  children,
  className = '',
  as: Component = 'div',
  onClick,
}) => {
  return (
    <Component
      onClick={onClick}
      className={`liquid-glass relative overflow-hidden border-0 ${className}`}
    >
      {children}
    </Component>
  );
};
