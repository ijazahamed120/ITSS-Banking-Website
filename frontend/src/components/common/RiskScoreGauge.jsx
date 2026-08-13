import React from 'react';
import { getRiskMetadata } from '../../utils/riskUtils.js';
import { cn } from '../../utils/cn.js';

export function RiskScoreGauge({ score = 0, size = 'md', className = '' }) {
  const meta = getRiskMetadata(score);
  const normalizedScore = Math.max(0, Math.min(100, score));

  // Circular gauge calculations
  const radius = size === 'sm' ? 20 : size === 'lg' ? 44 : 32;
  const strokeWidth = size === 'sm' ? 4 : size === 'lg' ? 8 : 6;
  const normalizedRadius = radius - strokeWidth * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  const svgDimensions = radius * 2;

  return (
    <div className={cn('flex flex-col items-center justify-center gap-1', className)}>
      <div className="relative inline-flex items-center justify-center">
        <svg
          height={svgDimensions}
          width={svgDimensions}
          className="transform -rotate-90"
        >
          {/* Track */}
          <circle
            stroke="#E2E5EA"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Value Progress */}
          <circle
            stroke={meta.color}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={cn('font-bold text-[#111827]', size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-xl' : 'text-sm')}>
            {normalizedScore}
          </span>
        </div>
      </div>
      <span className="text-xs font-semibold" style={{ color: meta.color }}>
        {meta.label}
      </span>
    </div>
  );
}
