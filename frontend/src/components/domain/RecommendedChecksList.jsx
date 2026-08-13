import React, { useState } from 'react';
import { CheckSquare, Square, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card.jsx';
import { cn } from '../../utils/cn.js';

export function RecommendedChecksList({
  checks = [],
  onToggleCheck,
  className = '',
}) {
  const [items, setItems] = useState(checks);

  const handleToggle = (id) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
    if (onToggleCheck) onToggleCheck(id);
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader className="bg-slate-50/50 py-3 flex items-center justify-between">
        <CardTitle className="text-xs font-bold text-[#1E3A5F] flex items-center gap-1.5">
          <CheckSquare className="w-4 h-4 text-[#0F766E]" /> Recommended Compliance Checks
        </CardTitle>
        <span className="text-[10px] text-[#6B7280]">
          {items.filter((i) => i.completed).length} of {items.length} Checked
        </span>
      </CardHeader>
      <CardContent className="p-4 space-y-2.5">
        {items.map((check) => (
          <div
            key={check.id}
            onClick={() => handleToggle(check.id)}
            className={cn(
              'flex items-start gap-3 p-2.5 rounded-md border transition-all cursor-pointer select-none text-xs',
              check.completed
                ? 'bg-slate-50 border-slate-200 text-slate-500 line-through'
                : 'bg-white border-[#E2E5EA] text-[#111827] hover:border-[#1E3A5F]'
            )}
          >
            <div className="mt-0.5 text-[#1E3A5F]">
              {check.completed ? (
                <CheckSquare className="w-4 h-4 text-emerald-600" />
              ) : (
                <Square className="w-4 h-4 text-[#9CA3AF]" />
              )}
            </div>
            <div className="flex-1">
              <p className="leading-tight font-medium">{check.text}</p>
              {check.required && !check.completed && (
                <span className="text-[10px] font-bold text-red-600 inline-flex items-center gap-0.5 mt-1">
                  <AlertCircle className="w-3 h-3" /> Mandatory Check
                </span>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
