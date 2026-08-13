import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { cn } from '../../utils/cn.js';

export function ErrorState({
  title = 'Failed to load data',
  message = 'An unexpected network error occurred while retrieving records. Please check connection and try again.',
  onRetry,
  className = '',
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center bg-red-50/50 border border-red-200 rounded-lg',
        className
      )}
    >
      <div className="p-3 bg-red-100 rounded-full mb-3 text-red-600">
        <AlertOctagon className="w-8 h-8" />
      </div>
      <h4 className="text-base font-semibold text-red-950">{title}</h4>
      <p className="text-xs text-red-700 max-w-md mt-1 mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <Button variant="danger" size="sm" icon={RefreshCw} onClick={onRetry}>
          Retry Operation
        </Button>
      )}
    </div>
  );
}
