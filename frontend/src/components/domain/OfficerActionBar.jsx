import React from 'react';
import { CheckCircle2, ShieldAlert, XCircle, ArrowUpRight, Forward, CheckSquare } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { cn } from '../../utils/cn.js';

export function OfficerActionBar({
  onMarkReviewed,
  onEscalate,
  onClear,
  onApprove,
  onDecline,
  onRefer,
  className = '',
}) {
  return (
    <div
      className={cn(
        'p-4 bg-white border border-[#E2E5EA] rounded-lg shadow-2xs flex flex-wrap items-center justify-between gap-3',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-[#1E3A5F] uppercase tracking-wider">
          Officer Decision Actions:
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {onMarkReviewed && (
          <Button variant="secondary" size="sm" icon={CheckSquare} onClick={onMarkReviewed}>
            Mark Reviewed
          </Button>
        )}
        {onClear && (
          <Button variant="outline" size="sm" icon={CheckCircle2} onClick={onClear}>
            Clear Risk
          </Button>
        )}
        {onApprove && (
          <Button variant="success" size="sm" icon={CheckCircle2} onClick={onApprove}>
            Approve
          </Button>
        )}
        {onRefer && (
          <Button variant="secondary" size="sm" icon={Forward} onClick={onRefer}>
            Refer to Legal
          </Button>
        )}
        {onEscalate && (
          <Button variant="teal" size="sm" icon={ArrowUpRight} onClick={onEscalate}>
            Escalate SAR
          </Button>
        )}
        {onDecline && (
          <Button variant="danger" size="sm" icon={XCircle} onClick={onDecline}>
            Decline Transfer
          </Button>
        )}
      </div>
    </div>
  );
}
