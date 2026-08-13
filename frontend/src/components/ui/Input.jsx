import React from 'react';
import { cn } from '../../utils/cn.js';

export function Input({
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  id,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-[#111827]">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-[#6B7280] pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full bg-white border border-[#E2E5EA] rounded-md px-3 py-2 text-sm text-[#111827] placeholder:text-[#9CA3AF]',
            'focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent transition-all',
            Icon && 'pl-9',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-red-600 font-medium">{error}</span>}
      {helperText && !error && <span className="text-xs text-[#6B7280]">{helperText}</span>}
    </div>
  );
}
