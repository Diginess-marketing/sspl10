import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LineChartData {
  label: string;
  value: number;
  date?: string;
}

interface LineChartProps {
  title: string;
  data: LineChartData[];
  height?: number;
  color?: string;
  showGrid?: boolean;
  className?: string;
}

const LineChart: React.FC<LineChartProps> = ({
  title,
  data,
  height = 300,
  color = '#3b82f6',
  showGrid = true,
  className = '',
}) => {
  const maxValue = Math.max(...data.map(item => item.value));
  const minValue = Math.min(...data.map(item => item.value));
  const range = maxValue - minValue || 1;

  // Create points for the line
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((item.value - minValue) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative" style={{ height: `${height}px` }}>
          {/* Grid lines */}
          {showGrid && (
            <>
              {/* Horizontal grid lines */}
              {[0, 25, 50, 75, 100].map((percentage) => (
                <div
                  key={percentage}
                  className="absolute w-full border-t border-gray-200"
                  style={{ top: `${percentage}%` }}
                />
              ))}
              {/* Vertical grid lines */}
              {data.map((_, index) => (
                <div
                  key={index}
                  className="absolute h-full border-l border-gray-200"
                  style={{ left: `${(index / (data.length - 1)) * 100}%` }}
                />
              ))}
            </>
          )}

          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-8">
            <span>{maxValue.toLocaleString()}</span>
            <span>{((maxValue + minValue) / 2).toLocaleString()}</span>
            <span>{minValue.toLocaleString()}</span>
          </div>

          {/* Chart area */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Area fill */}
            <polygon
              points={`0,100 ${points} 100,100`}
              fill={color}
              fillOpacity="0.1"
            />

            {/* Line */}
            <polyline
              points={points}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {data.map((item, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - ((item.value - minValue) / range) * 100;

              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="1.5"
                  fill={color}
                  className="hover:r-2 transition-all cursor-pointer"
                />
              );
            })}
          </svg>

          {/* X-axis labels */}
          <div className="absolute bottom-0 left-0 w-full flex justify-between text-xs text-gray-500 -mb-6">
            {data.map((item, index) => (
              <span key={index} className="truncate max-w-16">
                {item.date || item.label}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LineChart;