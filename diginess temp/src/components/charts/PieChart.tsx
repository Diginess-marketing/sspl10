import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PieChartData {
  label: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  title: string;
  data: PieChartData[];
  size?: number;
  showLegend?: boolean;
  showValues?: boolean;
  className?: string;
}

const PieChart: React.FC<PieChartProps> = ({
  title,
  data,
  size = 200,
  showLegend = true,
  showValues = true,
  className = '',
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = -90; // Start from top

  const colors = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // green
    '#f59e0b', // yellow
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#ccff00', // Tennis Ball Green
    '#84cc16', // lime
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-6">
          {/* Pie Chart */}
          <div className="relative" style={{ width: size, height: size }}>
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="transform -rotate-90"
            >
              {data.map((item, index) => {
                const percentage = (item.value / total) * 100;
                const angle = (percentage / 100) * 360;
                const startAngle = currentAngle;
                const endAngle = currentAngle + angle;

                // Calculate path for pie slice
                const x1 = size / 2 + (size / 2) * Math.cos((startAngle * Math.PI) / 180);
                const y1 = size / 2 + (size / 2) * Math.sin((startAngle * Math.PI) / 180);
                const x2 = size / 2 + (size / 2) * Math.cos((endAngle * Math.PI) / 180);
                const y2 = size / 2 + (size / 2) * Math.sin((endAngle * Math.PI) / 180);

                const largeArcFlag = angle > 180 ? 1 : 0;

                const pathData = [
                  `M ${size / 2} ${size / 2}`,
                  `L ${x1} ${y1}`,
                  `A ${size / 2} ${size / 2} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  'Z',
                ].join(' ');

                currentAngle = endAngle;

                const color = item.color || colors[index % colors.length];

                return (
                  <path
                    key={index}
                    d={pathData}
                    fill={color}
                    stroke="white"
                    strokeWidth="2"
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                );
              })}
            </svg>

            {/* Center text */}
            {showValues && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{total.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Total</div>
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          {showLegend && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
              {data.map((item, index) => {
                const percentage = ((item.value / total) * 100).toFixed(1);
                const color = item.color || colors[index % colors.length];

                return (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {item.label}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.value.toLocaleString()} ({percentage}%)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PieChart;