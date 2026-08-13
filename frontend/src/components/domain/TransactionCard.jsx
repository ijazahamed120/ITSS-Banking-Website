import React from 'react';
import { ArrowUpRight, Globe, Clock, ShieldAlert } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card.jsx';
import { RiskBadge } from '../common/RiskBadge.jsx';
import { StatusBadge } from '../common/StatusBadge.jsx';
import { formatCurrency, formatDate, maskAccountNumber } from '../../utils/formatters.js';
import { cn } from '../../utils/cn.js';

export function TransactionCard({ transaction, onViewDetails, className = '' }) {
  if (!transaction) return null;

  const {
    transactionId,
    amount,
    currency = 'INR',
    senderAccount,
    recipientName,
    recipientAccount,
    timestamp,
    status,
    riskLevel,
    riskScore,
    flagReason,
    originCountry,
    destinationCountry,
  } = transaction;

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardHeader className="bg-slate-50/50 flex flex-wrap items-center justify-between gap-2 py-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-[#1E3A5F]">{transactionId}</span>
          <StatusBadge status={status} />
        </div>
        <RiskBadge level={riskLevel} score={riskScore} />
      </CardHeader>
      <CardContent className="p-4 space-y-3 text-xs">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-bold text-[#111827]">{formatCurrency(amount, currency)}</span>
          <span className="text-[11px] text-[#6B7280] flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(timestamp)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-[#F7F8FA] p-2.5 rounded-md border border-[#E2E5EA]">
          <div>
            <span className="text-[10px] uppercase font-semibold text-[#6B7280]">Sender Account</span>
            <p className="font-mono font-medium text-[#111827] mt-0.5">{maskAccountNumber(senderAccount)}</p>
            {originCountry && <p className="text-[10px] text-[#6B7280]">{originCountry}</p>}
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-[#6B7280]">Beneficiary</span>
            <p className="font-medium text-[#111827] truncate mt-0.5">{recipientName}</p>
            <p className="font-mono text-[10px] text-[#6B7280]">{maskAccountNumber(recipientAccount)}</p>
          </div>
        </div>

        {flagReason && (
          <div className="flex items-start gap-1.5 text-xs text-red-700 bg-red-50 p-2 rounded border border-red-100">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-snug">{flagReason}</p>
          </div>
        )}
      </CardContent>
      {onViewDetails && (
        <CardFooter className="py-2.5">
          <span className="text-[11px] text-[#6B7280] flex items-center gap-1">
            <Globe className="w-3 h-3 text-[#0F766E]" />
            {originCountry} → {destinationCountry || 'Cayman Islands'}
          </span>
          <button
            onClick={() => onViewDetails(transactionId)}
            className="text-xs font-semibold text-[#1E3A5F] hover:underline inline-flex items-center gap-1"
          >
            Investigate Transfer <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </CardFooter>
      )}
    </Card>
  );
}
