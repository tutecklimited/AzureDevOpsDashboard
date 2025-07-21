import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  trend?: number;
  subtitle?: string;
}

const MetricsCard: React.FC<MetricsCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  trend, 
  subtitle 
}) => {
  const colorClasses = {
    blue: 'from-blue-50 to-blue-100 border-blue-200/50 text-blue-900',
    green: 'from-emerald-50 to-green-100 border-emerald-200/50 text-emerald-900',
    yellow: 'from-yellow-50 to-yellow-100 border-yellow-200/50 text-yellow-900',
    red: 'from-red-50 to-red-100 border-red-200/50 text-red-900',
    purple: 'from-purple-50 to-violet-100 border-purple-200/50 text-purple-900'
  };

  const iconColorClasses = {
    blue: 'text-blue-600',
    green: 'text-emerald-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    purple: 'text-purple-600'
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border shadow-lg hover:shadow-xl transition-all duration-300 p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-medium mt-1">{value.toLocaleString()}</p>
          {subtitle && (
            <p className="text-xs opacity-70 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-2 bg-white/50 ${iconColorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center">
          <span className="text-xs font-medium text-green-600">
            +{trend}%
          </span>
          <span className="text-xs opacity-70 ml-1">vs last month</span>
        </div>
      )}
    </div>
  );
};

export default MetricsCard;