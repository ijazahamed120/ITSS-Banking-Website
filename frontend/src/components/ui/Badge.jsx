import React from 'react';
import { cn } from '../../utils/cn.js';

export function Badge({ children, variant = 'default', className = '', ...props }) {
  const variants = {
    default: 'bg-slate-100 text-slate-800 border-slate-200',
    primary: 'bg-slate-900 text-white border-slate-900 font-semibold',
    navy: 'bg-[#0B192C] text-white border-[#0B192C]',
    teal: 'bg-teal-50 text-[#0F766E] border-teal-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-900 border-amber-200',
    danger: 'bg-red-50 text-red-800 border-red-200',
    purple: 'bg-purple-50 text-purple-900 border-purple-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-300',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold border transition-all select-none',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
