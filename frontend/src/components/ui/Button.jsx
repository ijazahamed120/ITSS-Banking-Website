import React from 'react';
import { cn } from '../../utils/cn.js';

/**
 * Enterprise standard corporate Button component
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  icon: Icon,
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B192C] disabled:opacity-50 disabled:cursor-not-allowed select-none text-xs tracking-tight';

  const variants = {
    primary: 'bg-[#0B192C] hover:bg-[#1E3A5F] text-white shadow-xs active:bg-[#060D18]',
    secondary: 'bg-white hover:bg-slate-50 text-[#0F172A] border border-[#E2E8F0] shadow-xs active:bg-slate-100',
    outline: 'border border-[#0B192C] text-[#0B192C] hover:bg-[#0B192C]/5',
    ghost: 'text-[#475569] hover:bg-slate-100 hover:text-[#0F172A]',
    danger: 'bg-red-700 hover:bg-red-800 text-white shadow-xs active:bg-red-900',
    success: 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs',
    teal: 'bg-[#0F766E] hover:bg-[#0D645E] text-white shadow-xs active:bg-teal-900',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-xs gap-2',
    lg: 'px-5 py-2.5 text-sm gap-2.5',
    icon: 'p-2 aspect-square',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      {children}
    </button>
  );
}
