import React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant =
  | 'critical'
  | 'high'
  | 'medium'
  | 'low'
  | 'in-care'
  | 'admitted'
  | 'discharged'
  | 'inactive'
  | 'active'
  | 'on-leave'
  | 'doctor'
  | 'nurse'
  | 'allied'
  | 'support'
  | 'primary'
  | 'secondary'
  | 'new';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'primary', children, className, ...props }) => {
  const variantStyles: Record<BadgeVariant, string> = {
    critical: 'bg-red-100 text-red-700 border border-red-200 font-semibold',
    high: 'bg-orange-100 text-orange-700 border border-orange-200 font-semibold',
    medium: 'bg-amber-100 text-amber-800 border border-amber-200 font-medium',
    low: 'bg-blue-100 text-blue-700 border border-blue-200 font-medium',
    'in-care': 'bg-emerald-100 text-emerald-700 border border-emerald-200 font-medium',
    admitted: 'bg-blue-100 text-blue-700 border border-blue-200 font-medium',
    discharged: 'bg-purple-100 text-purple-700 border border-purple-200 font-medium',
    inactive: 'bg-slate-100 text-slate-600 border border-slate-200 font-medium',
    active: 'bg-emerald-100 text-emerald-700 border border-emerald-200 font-medium',
    'on-leave': 'bg-amber-100 text-amber-800 border border-amber-200 font-medium',
    doctor: 'bg-blue-50 text-blue-600 border border-blue-200 font-medium',
    nurse: 'bg-emerald-50 text-emerald-600 border border-emerald-200 font-medium',
    allied: 'bg-amber-50 text-amber-700 border border-amber-200 font-medium',
    support: 'bg-purple-50 text-purple-600 border border-purple-200 font-medium',
    primary: 'bg-blue-600 text-white font-medium',
    secondary: 'bg-slate-100 text-slate-700 border border-slate-200 font-medium',
    new: 'bg-indigo-600 text-white font-bold tracking-wider text-[10px] uppercase px-1.5 py-0.5 rounded',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs transition-colors',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
