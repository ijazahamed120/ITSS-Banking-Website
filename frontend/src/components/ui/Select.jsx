import React from 'react';
import { cn } from '../../utils/cn.js';

export function Select({
  label,
  options = [],
  error,
  className = '',
  id,
  value,
  onChange,
  placeholder = 'Select option...',
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold text-[#111827]">
          {label}
        </label>
      )}
      <select
        id={selectId}
        value={value}
        onChange={onChange}
        className={cn(
          'w-full bg-white border border-[#E2E5EA] rounded-md px-3 py-2 text-sm text-[#111827]',
          'focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent transition-all cursor-pointer',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-600 font-medium">{error}</span>}
    </div>
  );
}
