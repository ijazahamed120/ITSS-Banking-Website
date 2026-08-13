import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card.jsx';
import { cn } from '../../utils/cn.js';

const sampleTrendData = [
  { date: 'Aug 01', flaggedTransfers: 12, resolvedSARs: 10 },
  { date: 'Aug 02', flaggedTransfers: 18, resolvedSARs: 14 },
  { date: 'Aug 03', flaggedTransfers: 15, resolvedSARs: 12 },
  { date: 'Aug 04', flaggedTransfers: 24, resolvedSARs: 19 },
  { date: 'Aug 05', flaggedTransfers: 28, resolvedSARs: 22 },
  { date: 'Aug 06', flaggedTransfers: 20, resolvedSARs: 18 },
  { date: 'Aug 07', flaggedTransfers: 32, resolvedSARs: 26 },
];

export function TrendLineChart({
  title = 'Suspicious Transfer Volume Trend (7 Days)',
  data = sampleTrendData,
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
            <LineChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E5EA" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E5EA',
                  borderRadius: '6px',
                  fontSize: '12px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="flaggedTransfers"
                name="Flagged Transfers"
                stroke="#DC2626"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="resolvedSARs"
                name="Resolved SARs"
                stroke="#0F766E"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
