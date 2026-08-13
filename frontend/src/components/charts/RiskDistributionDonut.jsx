import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card.jsx';
import { cn } from '../../utils/cn.js';

const sampleDonutData = [
  { name: 'Low Risk', value: 45, color: '#16A34A' },
  { name: 'Medium Risk', value: 25, color: '#D97706' },
  { name: 'High Risk', value: 20, color: '#DC2626' },
  { name: 'Critical Risk', value: 10, color: '#7C2D12' },
];

export function RiskDistributionDonut({
  title = 'Risk Breakdown Across Portfolio',
  data = sampleDonutData,
  className = '',
}) {
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="py-3 bg-slate-50/50">
        <CardTitle className="text-xs font-bold text-[#1E3A5F]">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-64 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val) => [`${val}%`, 'Share']}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E5EA',
                  borderRadius: '6px',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
