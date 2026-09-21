import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AreaChartData {
  label: string;
  value: number;
  date?: string;
}

interface AreaChartProps {
  title: string;
  data: AreaChartData[];
  height?: number;
  color?: string;
  fillColor?: string;
  showGrid?: boolean;
  className?: string;
}

const AreaChart: React.FC<AreaChartProps> = ({
  title,
  data,
  height = 300,
  color = '#3b82f6',
  fillColor,
  showGrid = true,
  className = '',
}) => {
  const maxValue = data.length > 0 ? Math.max(...data.map(item => item.value)) : 0;
  const minValue = data.length > 0 ? Math.min(...data.map(item => item.value)) : 0;
  const range = (maxValue - minValue) || 1;

  // Create points for the area
  const points = data.length < 2 
    ? (data.length === 1 ? `0,${100 - ((data[0].value - minValue) / range) * 100} 100,${100 - ((data[0].value - minValue) / range) * 100}` : "0,100 100,100")
    : data.map((item, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 100 - ((item.value - minValue) / range) * 100;
        const safeX = isNaN(x) ? 0 : x;
        const safeY = isNaN(y) ? 100 : y;
        return `${safeX},${safeY}`;
      }).join(' ');

  // Create area fill points (from line to bottom)
  const areaPoints = `${points} 100,100 0,100`;

  const safeHeight = isNaN(height) ? 300 : height;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative" style={{ height: `${safeHeight}px` }}>
          {/* Grid lines */}
          {showGrid && data.length > 1 && (
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
            <span>{(maxValue || 0).toLocaleString()}</span>
            <span>{(((maxValue || 0) + (minValue || 0)) / 2).toLocaleString()}</span>
            <span>{(minValue || 0).toLocaleString()}</span>
          </div>

          {/* Chart area */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Area fill */}
            <polygon
              points={areaPoints}
              fill={fillColor || `${color}20`}
              stroke="none"
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
            {data.length > 1 && data.map((item, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - ((item.value - minValue) / range) * 100;
              const safeX = isNaN(x) ? 0 : x;
              const safeY = isNaN(y) ? 100 : y;

              return (
                <circle
                  key={index}
                  cx={safeX}
                  cy={safeY}
                  r="2"
                  fill={color}
                  stroke="white"
                  strokeWidth="2"
                  className="hover:r-3 transition-all cursor-pointer"
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

          {/* Gradient definition */}
          <svg className="absolute" width="0" height="0">
            <defs>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                <stop offset="100%" stopColor={color} stopOpacity="0.05" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </CardContent>
    </Card>
  );
};

export default AreaChart;