import type { HTMLAttributes } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'glass';
}

export const Badge = ({ className = '', variant = 'glass', children, ...props }: BadgeProps) => {
  const variants = {
    success: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    warning: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    error: "bg-red-500/20 text-red-300 border border-red-500/30",
    info: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    glass: "bg-white/10 text-text-primary border border-white/10 backdrop-blur-md"
  };

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
