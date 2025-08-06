import React from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

interface MetricCardProps {
  title: string;
  value: string;
  change?: number | null;
  changeLabel: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: 'blue' | 'green' | 'purple' | 'red' | 'yellow';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  color,
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      border: 'border-blue-200',
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      border: 'border-green-200',
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      border: 'border-purple-200',
    },
    red: {
      bg: 'bg-red-50',
      icon: 'text-red-600',
      border: 'border-red-200',
    },
    yellow: {
      bg: 'bg-yellow-50',
      icon: 'text-yellow-600',
      border: 'border-yellow-200',
    },
  };

  const formatChange = (changeValue: number) => {
    const isPositive = changeValue >= 0;
    return {
      value: `${isPositive ? '+' : ''}${changeValue.toFixed(1)}%`,
      isPositive,
    };
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start">
        <div className={`p-2 rounded-lg ${colorClasses[color].bg} ${colorClasses[color].border} border`}>
          <Icon className={`h-6 w-6 ${colorClasses[color].icon}`} />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
          </div>
          <div className="mt-2 flex items-center text-sm">
            {change !== null && change !== undefined ? (
              <>
                {change >= 0 ? (
                  <ArrowTrendingUpIcon className="w-4 h-4 text-red-500 mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="w-4 h-4 text-green-500 mr-1" />
                )}
                <span className={change >= 0 ? 'text-red-600' : 'text-green-600'}>
                  {formatChange(change).value}
                </span>
                <span className="text-gray-500 ml-1">{changeLabel}</span>
              </>
            ) : (
              <span className="text-gray-500">{changeLabel}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;