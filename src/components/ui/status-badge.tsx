import React from 'react';

interface StatusBadgeProps {
  text: string;
  variant?: 'active' | 'inactive';
  className?: string;
}

export function StatusBadge({ text, variant = 'active', className = '' }: StatusBadgeProps) {
  const colors = variant === 'active' 
    ? {
        gradient: 'from-green-500/90 to-green-700/10',
        stroke: 'stroke-green-500',
        text: 'text-green-300 dark:text-green-300',
        glow: 'shadow-green-500/50'
      }
    : {
        gradient: 'from-red-500/90 to-red-700/10',
        stroke: 'stroke-red-500',
        text: 'text-red-300 dark:text-red-300',
        glow: 'shadow-red-500/50'
      };

  return (
    <div className={`relative inline-block animate-fade-in ${className}`}>
      <div className="relative">
        <svg 
          width="180" 
          height="36" 
          viewBox="0 0 180 36" 
          fill="none" 
          className="drop-shadow-lg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={`statusGradient-${variant}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" className={variant === 'active' ? 'text-green-500' : 'text-red-500'} stopOpacity="0.9" />
              <stop offset="100%" className={variant === 'active' ? 'text-green-700' : 'text-red-700'} stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path 
            d="M0 0H180V24H8L0 16V0Z"
            fill={`url(#statusGradient-${variant})`}
            className={`${colors.stroke} transition-all duration-300`}
            strokeWidth="1.5"
          />
        </svg>
        
        <div className="absolute inset-0 flex items-center justify-start pl-4 pb-3">
          <span className={`${colors.text} text-sm font-mono tracking-wider font-semibold uppercase animate-pulse`}>
            {text}
          </span>
        </div>
      </div>
    </div>
  );
}
