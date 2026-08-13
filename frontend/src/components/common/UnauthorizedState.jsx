import React from 'react';
import { Lock, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { cn } from '../../utils/cn.js';

export function UnauthorizedState({
  title = 'Access Restricted',
  description = 'Your user role (AUDITOR) does not have authorization to view or edit this operational workflow.',
  onNavigate,
  className = '',
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-10 text-center bg-white border border-[#E2E5EA] rounded-lg shadow-sm',
        className
      )}
    >
      <div className="p-3.5 bg-amber-50 rounded-full mb-3 text-amber-700 border border-amber-200">
        <Lock className="w-8 h-8" />
      </div>
      <h4 className="text-lg font-bold text-[#111827]">{title}</h4>
      <p className="text-xs text-[#6B7280] max-w-md mt-1 mb-5 leading-relaxed">{description}</p>
      {onNavigate && (
        <Button variant="primary" size="sm" icon={ArrowLeft} onClick={onNavigate}>
          Return to Console Dashboard
        </Button>
      )}
    </div>
  );
}
