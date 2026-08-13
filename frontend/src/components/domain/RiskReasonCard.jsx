import React from 'react';
import { ShieldAlert, AlertTriangle, Info } from 'lucide-react';
import { Card } from '../ui/Card.jsx';
import { RiskBadge } from '../common/RiskBadge.jsx';
import { cn } from '../../utils/cn.js';

export function RiskReasonCard({ reason, className = '' }) {
  if (!reason) return null;

  const { category, severity, title, description } = reason;

  return (
    <Card className={cn('p-4 border-l-4', severity === 'CRITICAL' ? 'border-l-[#7C2D12]' : severity === 'HIGH' ? 'border-l-[#DC2626]' : 'border-l-[#D97706]', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
              [{category}]
            </span>
            <RiskBadge level={severity} showIcon={false} />
          </div>
          <h4 className="text-xs font-bold text-[#111827]">{title}</h4>
          <p className="text-xs text-[#6B7280] leading-relaxed">{description}</p>
        </div>
      </div>
    </Card>
  );
}
