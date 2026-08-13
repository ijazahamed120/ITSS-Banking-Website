import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card.jsx';
import { formatCurrency } from '../../utils/formatters.js';
import { cn } from '../../utils/cn.js';

const sampleBarData = [
  { month: 'Jan', domesticAmount: 420000, internationalAmount: 180000 },
  { month: 'Feb', domesticAmount: 510000, internationalAmount: 240000 },
  { month: 'Mar', domesticAmount: 480000, internationalAmount: 310000 },
  { month: 'Apr', domesticAmount: 620000, internationalAmount: 450000 },
  { month: 'May', domesticAmount: 590000, internationalAmount: 520000 },
  { month: 'Jun', domesticAmount: 710000, internationalAmount: 680000 },
];

export function TransactionHistoryBarChart({
  title = 'Monthly Transaction Value Comparison (₹ in Lakh)',
  data = sampleBarData,
  className = '',
}) {
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="py-3 bg-slate-50/50">
        <CardTitle className="text-xs font-bold text-[#1E3A5F]">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E5EA" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7280' }} />
              <YAxis
                tick={{ fontSize: 11, fill: '#6B7280' }}
                tickFormatter={(val) => `₹${val / 100000}L`}
              />
              <Tooltip
                formatter={(val) => [formatCurrency(val), 'Volume']}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E5EA',
                  borderRadius: '6px',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="domesticAmount" name="Domestic Wires" fill="#1E3A5F" radius={[4, 4, 0, 0]} />
              <Bar dataKey="internationalAmount" name="Cross-Border Wires" fill="#0F766E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
