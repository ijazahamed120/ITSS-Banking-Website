import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, AlertOctagon } from 'lucide-react';
import { getRiskMetadata } from '../../utils/riskUtils.js';
import { cn } from '../../utils/cn.js';

export function RiskBadge({ level = 'LOW', score, className = '', showIcon = true }) {
  const meta = getRiskMetadata(score !== undefined ? score : level);

  const icons = {
    LOW: <ShieldCheck className="w-3.5 h-3.5 shrink-0" />,
    MEDIUM: <AlertTriangle className="w-3.5 h-3.5 shrink-0" />,
    HIGH: <ShieldAlert className="w-3.5 h-3.5 shrink-0" />,
    CRITICAL: <AlertOctagon className="w-3.5 h-3.5 shrink-0" />,
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all',
        meta.badgeClass,
        className
      )}
      title={`${meta.label}${score !== undefined ? ` (Score: ${score}/100)` : ''}`}
    >
      {showIcon && icons[meta.key]}
      <span>{meta.label}</span>
      {score !== undefined && <span className="opacity-75 font-normal">({score})</span>}
    </span>
  );
}
