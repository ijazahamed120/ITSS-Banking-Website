import React from 'react';
import { UserCheck, CreditCard, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../ui/Card.jsx';
import { cn } from '../../utils/cn.js';
import { formatCurrency } from '../../utils/formatCurrency.js';

/**
 * Payee case card grounded in ledger fields only.
 * Payee identity = transactions.counterparty (no payees.csv / no invented bank fields).
 */
export function PayeeCard({ payee, className = '' }) {
  if (!payee) return null;

  const {
    txn_id,
    counterparty,
    customer_id,
    account_id,
    amount,
    channel,
    narrative,
    txn_date,
    is_suspicious,
    is_first_time_payee,
  } = payee;

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardHeader className="bg-slate-50/50 flex items-center justify-between py-3">
        <div>
          <span className="font-mono text-[10px] text-[#6B7280]">{txn_id}</span>
          <h4 className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-[#0F766E]" />
            {counterparty || 'Not available in supplied data'}
          </h4>
        </div>
        {is_first_time_payee && (
          <span className="bg-amber-100 text-amber-900 font-bold text-[10px] px-2 py-0.5 rounded border border-amber-200">
            1st Time Payee
          </span>
        )}
      </CardHeader>
      <CardContent className="p-4 space-y-2.5 text-xs">
        <div className="flex items-center justify-between bg-[#F7F8FA] p-2 rounded border border-[#E2E5EA]">
          <div>
            <span className="text-[10px] text-[#6B7280]">Amount / Channel</span>
            <p className="font-mono text-[11px] font-semibold text-[#111827]">
              -{formatCurrency(Math.abs(Number(amount) || 0))} · {channel}
            </p>
          </div>
          <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded font-bold text-slate-800">
            {txn_date}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1 text-[11px] text-[#6B7280]">
          <span className="flex items-center gap-1">
            <CreditCard className="w-3.5 h-3.5 text-[#0F766E]" />
            Cust {customer_id} · Acc {account_id}
          </span>
        </div>

        {narrative && (
          <p className="text-[11px] text-[#475569] truncate" title={narrative}>
            {narrative}
          </p>
        )}

        {is_suspicious === 'Y' && (
          <div className="flex items-center gap-1.5 text-[11px] text-red-700 bg-red-50 p-2 rounded border border-red-200">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="font-semibold">Ledger Flag: is_suspicious = Y</span>
          </div>
        )}

        <p className="text-[10px] text-[#94A3B8]">
          Bank / SWIFT / country / watchlist: Not available in supplied data.
        </p>
      </CardContent>
    </Card>
  );
}
