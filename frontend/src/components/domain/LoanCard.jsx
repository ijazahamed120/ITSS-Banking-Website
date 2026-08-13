import React from 'react';
import { FileText, DollarSign, Clock, Percent } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card.jsx';
import { RiskBadge } from '../common/RiskBadge.jsx';
import { StatusBadge } from '../common/StatusBadge.jsx';
import { formatCurrency, formatPercentage } from '../../utils/formatters.js';
import { cn } from '../../utils/cn.js';

export function LoanCard({ loan, className = '' }) {
  if (!loan) return null;

  const {
    loanId,
    applicantName,
    requestedAmount,
    loanPurpose,
    termMonths,
    riskScore,
    riskLevel,
    dtiRatio,
    creditScore,
    status,
  } = loan;

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardHeader className="bg-slate-50/50 flex items-center justify-between py-3">
        <div>
          <span className="font-mono text-[10px] text-[#6B7280]">{loanId}</span>
          <h4 className="text-xs font-bold text-[#111827]">{applicantName}</h4>
        </div>
        <RiskBadge level={riskLevel} score={riskScore} />
      </CardHeader>
      <CardContent className="p-4 space-y-3 text-xs">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-[10px] text-[#6B7280] uppercase font-semibold">Requested Loan</span>
            <p className="text-base font-bold text-[#1E3A5F]">{formatCurrency(requestedAmount)}</p>
          </div>
          <StatusBadge status={status} />
        </div>

        <p className="text-[#6B7280] italic text-[11px] bg-[#F7F8FA] p-2 rounded border border-[#E2E5EA]">
          "{loanPurpose}"
        </p>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E2E5EA] text-center">
          <div className="bg-slate-50 p-1.5 rounded">
            <span className="text-[10px] text-[#6B7280]">Term</span>
            <p className="font-bold text-[#111827] text-xs">{termMonths} Mos</p>
          </div>
          <div className="bg-slate-50 p-1.5 rounded">
            <span className="text-[10px] text-[#6B7280]">DTI Ratio</span>
            <p className="font-bold text-[#111827] text-xs">{formatPercentage(dtiRatio)}</p>
          </div>
          <div className="bg-slate-50 p-1.5 rounded">
            <span className="text-[10px] text-[#6B7280]">FICO</span>
            <p className="font-bold text-[#111827] text-xs">{creditScore}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
