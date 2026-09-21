import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeLabel = 'vs last period',
  icon: Icon,
  color = 'text-blue-600',
  className = '',
}) => {
  const getChangeIcon = () => {
    if (!change) return <Minus className="w-3 h-3" />;
    return change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />;
  };

  const getChangeColor = () => {
    if (!change) return 'text-gray-500';
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getBadgeVariant = () => {
    if (!change) return 'secondary';
    return change > 0 ? 'default' : 'destructive';
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-3">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>

            {change !== undefined && (
              <div className="flex items-center gap-2">
                <Badge
                  variant={getBadgeVariant()}
                  className={`text-xs px-2 py-1 ${
                    change > 0
                      ? 'bg-green-100 text-green-800 hover:bg-green-100'
                      : change < 0
                      ? 'bg-red-100 text-red-800 hover:bg-red-100'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  {getChangeIcon()}
                  <span className="ml-1">
                    {change > 0 ? '+' : ''}{change}%
                  </span>
                </Badge>
                <span className="text-xs text-gray-500">{changeLabel}</span>
              </div>
            )}
          </div>

          <div className={`p-3 rounded-full bg-gray-50 ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;