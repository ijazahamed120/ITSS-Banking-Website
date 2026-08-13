import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { Select } from '../ui/Select.jsx';
import { Button } from '../ui/Button.jsx';
import { cn } from '../../utils/cn.js';

export function FilterBar({
  filters = [],
  activeFilters = {},
  onFilterChange,
  onReset,
  className = '',
}) {
  const hasActiveFilters = Object.values(activeFilters).some((val) => val !== '' && val !== undefined);

  return (
    <div className={cn('flex flex-wrap items-center gap-3 p-3 bg-white border border-[#E2E5EA] rounded-lg shadow-2xs', className)}>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1E3A5F] mr-1">
        <Filter className="w-4 h-4" />
        <span>Filters:</span>
      </div>

      {filters.map((filter) => (
        <div key={filter.key} className="w-44">
          <Select
            placeholder={`All ${filter.label}`}
            options={filter.options}
            value={activeFilters[filter.key] || ''}
            onChange={(e) => onFilterChange && onFilterChange(filter.key, e.target.value)}
          />
        </div>
      ))}

      {hasActiveFilters && onReset && (
        <Button variant="ghost" size="sm" icon={RotateCcw} onClick={onReset} className="ml-auto text-xs">
          Reset Filters
        </Button>
      )}
    </div>
  );
}
