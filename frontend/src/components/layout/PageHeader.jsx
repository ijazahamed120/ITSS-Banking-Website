import React from 'react';
import { cn } from '../../utils/cn.js';

export function PageHeader({
  title,
  subtitle,
  badge,
  actions,
  className = '',
}) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E2E5EA] mb-6',
        className
      )}
    >
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-[#111827] tracking-tight">{title}</h1>
          {badge}
        </div>
        {subtitle && <p className="text-xs text-[#6B7280] mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
    </div>
  );
}
