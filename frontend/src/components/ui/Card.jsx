import React from 'react';
import { cn } from '../../utils/cn.js';

export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={cn('bg-white border border-[#E2E8F0] rounded-xl corporate-card-shadow overflow-hidden transition-all duration-150', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={cn('px-6 py-4 border-b border-[#E2E8F0]', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3 className={cn('text-sm font-bold text-[#0F172A] tracking-tight', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '', ...props }) {
  return (
    <p className={cn('text-xs text-[#64748B] mt-0.5 leading-normal', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={cn('p-6', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={cn('px-6 py-3.5 bg-slate-50/70 border-t border-[#E2E8F0] flex items-center justify-between', className)} {...props}>
      {children}
    </div>
  );
}
