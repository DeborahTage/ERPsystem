import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const KpiCard = ({ 
  title, 
  value, 
  icon: Icon,
  trend,
  trendValue,
  subtitle,
  className = '',
  index = 0
}) => {
  const trendColor = trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500';
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendBg = trend === 'up' ? 'bg-emerald-50' : trend === 'down' ? 'bg-red-50' : 'bg-gray-50';
  const staggerClass = index > 0 ? `stagger-${Math.min(index, 8)}` : '';

  return (
    <div className={`group bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm 
      hover:shadow-lg hover:-translate-y-0.5 hover:border-gray-300 
      transition-all duration-300 ease-out 
      animate-slide-up opacity-0 ${staggerClass} ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 truncate transition-colors group-hover:text-gray-700">{title}</p>
          <p className="mt-2.5 text-2xl font-bold text-gray-900 tracking-tight transition-transform duration-300 group-hover:scale-[1.02] origin-left">{value}</p>
          
          {subtitle && (
            <p className="mt-1.5 text-xs text-gray-400 transition-colors group-hover:text-gray-500">{subtitle}</p>
          )}
          
          {trend && (
            <div className="mt-3.5 flex items-center gap-1.5">
              <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${trendBg} ${trendColor} transition-transform duration-200 group-hover:scale-105`}>
                <TrendIcon className="h-3.5 w-3.5" />
                {trendValue}
              </span>
              <span className="text-xs text-gray-400">vs last period</span>
            </div>
          )}
        </div>
        
        {Icon && (
          <div className="ml-4 flex-shrink-0">
            <div className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-gradient-to-br from-brand-50 to-brand-100/50 text-brand-600 
              transition-all duration-300 group-hover:scale-110 group-hover:shadow-md group-hover:from-brand-100 group-hover:to-brand-200/50">
              <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" strokeWidth={2} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KpiCard;
