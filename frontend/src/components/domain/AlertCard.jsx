import React from 'react';
import { AlertTriangle, Bell, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Card } from '../ui/Card.jsx';
import { formatDate } from '../../utils/formatters.js';
import { cn } from '../../utils/cn.js';

export function AlertCard({
  alert = {
    id: 'ALT-1',
    title: 'High Velocity Transfer Spike',
    description: 'Account ACC-99201482 initiated 4 wires within 2 hours totaling ₹1.2 Crore.',
    severity: 'HIGH',
    timestamp: new Date().toISOString(),
  },
  onDismiss,
  className = '',
}) {
  const severities = {
    CRITICAL: 'bg-red-50 border-red-300 text-red-900 icon-red-600',
    HIGH: 'bg-amber-50 border-amber-300 text-amber-900 icon-amber-600',
    MEDIUM: 'bg-blue-50 border-blue-300 text-blue-900 icon-blue-600',
    LOW: 'bg-slate-50 border-slate-300 text-slate-900 icon-slate-600',
  };

  const style = severities[alert.severity] || severities.HIGH;

  return (
    <Card className={cn('p-4 border', style, className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white/80 rounded-md border shadow-2xs mt-0.5">
            <ShieldAlert className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs">{alert.title}</span>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-black/10">
                {alert.severity}
              </span>
            </div>
            <p className="text-xs mt-1 opacity-90 leading-normal">{alert.description}</p>
            <span className="text-[10px] opacity-75 mt-1 block">
              Triggered: {formatDate(alert.timestamp)}
            </span>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={() => onDismiss(alert.id)}
            className="text-xs font-semibold hover:underline opacity-80 hover:opacity-100"
          >
            Acknowledge
          </button>
        )}
      </div>
    </Card>
  );
}
