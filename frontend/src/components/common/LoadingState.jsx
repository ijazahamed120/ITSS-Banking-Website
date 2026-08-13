import React from 'react';
import { cn } from '../../utils/cn.js';

export function Skeleton({ className = '' }) {
  return (
    <div className={cn('animate-pulse bg-slate-200 rounded-md', className)} />
  );
}

export function LoadingState({ variant = 'card', count = 3, className = '' }) {
  if (variant === 'table') {
    return (
      <div className={cn('w-full border border-[#E2E5EA] rounded-lg overflow-hidden bg-white p-4 space-y-3', className)}>
        <Skeleton className="h-8 w-full" />
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (variant === 'detail') {
    return (
      <div className={cn('bg-white border border-[#E2E5EA] rounded-lg p-6 space-y-4', className)}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#E2E5EA]">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={cn('space-y-2', className)}>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  // Default: Card skeletons grid
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-[#E2E5EA] rounded-lg p-5 space-y-3">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-3 w-28" />
        </div>
      ))}
    </div>
  );
}
