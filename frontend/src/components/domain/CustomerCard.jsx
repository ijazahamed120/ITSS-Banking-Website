import React from 'react';
import { User, Mail, Phone, Calendar, Flag } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card.jsx';
import { RiskBadge } from '../common/RiskBadge.jsx';
import { StatusBadge } from '../common/StatusBadge.jsx';
import { formatDate } from '../../utils/formatters.js';
import { cn } from '../../utils/cn.js';

export function CustomerCard({ customer, className = '' }) {
  if (!customer) return null;

  const {
    customerId,
    fullName,
    email,
    phone,
    kycStatus,
    riskScore,
    riskLevel,
    segment,
    pepStatus,
    country,
    accountOpenedDate,
  } = customer;

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardHeader className="bg-slate-50/50 flex items-center justify-between py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center font-bold text-xs">
            {fullName.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#111827]">{fullName}</h4>
            <span className="font-mono text-[10px] text-[#6B7280]">{customerId}</span>
          </div>
        </div>
        <RiskBadge level={riskLevel} score={riskScore} />
      </CardHeader>
      <CardContent className="p-4 space-y-2.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-[#6B7280]">KYC Status:</span>
          <StatusBadge status={kycStatus} />
        </div>

        <div className="space-y-1 text-[#6B7280]">
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-[#1E3A5F]" />
            <span className="truncate">{email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-[#1E3A5F]" />
            <span>{phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[#1E3A5F]" />
            <span>Client Since: {formatDate(accountOpenedDate, false)}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-[#E2E5EA] flex items-center justify-between text-[11px]">
          <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-medium">
            {segment}
          </span>
          {pepStatus && (
            <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded font-bold flex items-center gap-1">
              <Flag className="w-3 h-3" /> PEP Listed
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
