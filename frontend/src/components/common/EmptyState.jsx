import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { cn } from '../../utils/cn.js';

export function EmptyState({
  title = 'No data available',
  description = 'There are no records matching your current filter criteria.',
  icon: Icon = Inbox,
  actionText,
  onAction,
  className = '',
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center bg-white border border-[#E2E5EA] rounded-lg border-dashed',
        className
      )}
    >
      <div className="p-3 bg-slate-50 rounded-full mb-3 text-[#6B7280]">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-base font-semibold text-[#111827]">{title}</h4>
      <p className="text-xs text-[#6B7280] max-w-sm mt-1 mb-4 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
