import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '../ui/Card.jsx';
import { cn } from '../../utils/cn.js';

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendDirection = 'up',
  trendIsPositive = true,
  className = '',
}) {
  return (
    <Card className={cn('hover:border-[#0B192C] transition-all corporate-card-shadow border-t-2 border-t-[#0B192C]', className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
            {title}
          </span>
          {Icon && (
            <div className="p-2 bg-[#F8FAFC] rounded-lg text-[#0B192C] border border-[#E2E8F0]">
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-3xl font-extrabold text-[#0F172A] tracking-tight">{value}</span>
          {trend && (
            <span
              className={cn(
                'inline-flex items-center text-xs font-bold gap-0.5 px-2 py-0.5 rounded',
                trendIsPositive ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
              )}
            >
              {trendDirection === 'up' ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {trend}
            </span>
          )}
        </div>

        {subtitle && <p className="text-xs text-[#64748B] font-medium mt-2">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}
