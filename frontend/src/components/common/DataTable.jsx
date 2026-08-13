import React from 'react';
import { LoadingState } from './LoadingState.jsx';
import { EmptyState } from './EmptyState.jsx';
import { cn } from '../../utils/cn.js';

export function DataTable({
  columns = [],
  data = [],
  isLoading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items to display at this time.',
  onRowClick,
  className = '',
}) {
  if (isLoading) {
    return <LoadingState variant="table" count={4} />;
  }

  if (!data || data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className={cn('w-full border border-[#E2E8F0] rounded-xl overflow-x-auto bg-white corporate-card-shadow', className)}>
      <table className="w-full text-left text-xs text-[#0F172A] border-collapse">
        <thead className="bg-[#0B192C] text-white border-b border-[#0B192C] text-[11px] font-bold uppercase tracking-wider select-none">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                scope="col"
                className={cn('px-4 py-3.5 font-bold text-slate-200', col.align === 'right' && 'text-right', col.className)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0]">
          {data.map((row, rowIdx) => (
            <tr
              key={row.id || rowIdx}
              onClick={() => onRowClick && onRowClick(row)}
              className={cn(
                'hover:bg-slate-50/80 transition-all duration-150',
                onRowClick && 'cursor-pointer'
              )}
            >
              {columns.map((col, colIdx) => (
                <td
                  key={`${rowIdx}-${col.key || colIdx}`}
                  className={cn(
                    'px-4 py-3.5 text-xs font-normal whitespace-nowrap text-[#0F172A]',
                    col.align === 'right' && 'text-right',
                    col.className
                  )}
                >
                  {col.render ? col.render(row[col.key], row, rowIdx) : row[col.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
