import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export function SearchBar({
  value = '',
  onChange,
  placeholder = 'Search records, account numbers, customer names...',
  className = '',
}) {
  return (
    <div className={cn('relative flex items-center w-full max-w-md', className)}>
      <div className="absolute left-3 text-[#6B7280] pointer-events-none">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white border border-[#E2E5EA] rounded-md pl-9 pr-8 py-2 text-xs text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:border-transparent transition-all shadow-2xs"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange && onChange('')}
          className="absolute right-2.5 text-[#9CA3AF] hover:text-[#111827] p-0.5 rounded-sm"
          aria-label="Clear search input"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
