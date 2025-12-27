import React, { useEffect, useState } from 'react';
import { LucideIcon, TrendingUp, TrendingDown, PoundSterling } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: LucideIcon;
  trend?: number;
  color: 'cyan' | 'purple' | 'green' | 'orange' | 'pink' | 'blue';
  isDark: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  prefix = '',
  suffix = '',
  icon: Icon,
  trend,
  color,
  isDark
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const colorClasses = {
    cyan: {
      bg: 'from-cyan-500/20 to-cyan-600/20',
      icon: 'from-cyan-400 to-cyan-600',
      shadow: 'shadow-cyan-500/20',
      text: 'text-cyan-400'
    },
    purple: {
      bg: 'from-purple-500/20 to-purple-600/20',
      icon: 'from-purple-400 to-purple-600',
      shadow: 'shadow-purple-500/20',
      text: 'text-purple-400'
    },
    green: {
      bg: 'from-emerald-500/20 to-emerald-600/20',
      icon: 'from-emerald-400 to-emerald-600',
      shadow: 'shadow-emerald-500/20',
      text: 'text-emerald-400'
    },
    orange: {
      bg: 'from-orange-500/20 to-orange-600/20',
      icon: 'from-orange-400 to-orange-600',
      shadow: 'shadow-orange-500/20',
      text: 'text-orange-400'
    },
    pink: {
      bg: 'from-pink-500/20 to-pink-600/20',
      icon: 'from-pink-400 to-pink-600',
      shadow: 'shadow-pink-500/20',
      text: 'text-pink-400'
    },
    blue: {
      bg: 'from-blue-500/20 to-blue-600/20',
      icon: 'from-blue-400 to-blue-600',
      shadow: 'shadow-blue-500/20',
      text: 'text-blue-400'
    }
  };

  const colors = colorClasses[color];

  const formatValue = (val: number) => {
    if (prefix === '£') {
      if (val >= 1000000) return `£${(val / 1000000).toFixed(1)}M`;
      if (val >= 1000) return `£${(val / 1000).toFixed(1)}K`;
      return `£${val}`;
    }
    return val.toLocaleString();
  };

  return (
    <div className={`
      relative overflow-hidden rounded-2xl p-6
      ${isDark ? 'bg-slate-800/80 backdrop-blur-xl shadow-xl border border-slate-700/50' : 'bg-white shadow-lg border border-gray-100'}
      hover:scale-[1.02] transition-all duration-300 group
    `}>
      {/* Background Glow */}
      <div className={`
        absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-50
        group-hover:opacity-100 transition-opacity duration-500
      `} />

      <div className="relative flex items-center justify-between mb-4">
        <div className={`
          w-12 h-12 rounded-xl bg-gradient-to-br ${colors.icon}
          flex items-center justify-center shadow-lg ${colors.shadow}
          group-hover:scale-110 transition-transform duration-300
        `}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`
            flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium
            ${trend > 0
              ? 'bg-green-500/10 text-green-400'
              : 'bg-red-500/10 text-red-400'}
          `}>
            {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div className="relative">
        <p className={`text-sm font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          {title}
        </p>
        <div className="flex items-baseline gap-1">
          <h3 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {formatValue(displayValue)}
          </h3>
          {suffix && (
            <span className={`text-lg font-medium ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
              {suffix}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
