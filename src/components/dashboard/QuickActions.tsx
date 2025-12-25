import React from 'react';
import { Plus, MessageSquare, BarChart3, Settings, Truck, FileText } from 'lucide-react';

interface QuickActionsProps {
  isDark: boolean;
  onNavigate: (page: string) => void;
  onAddTruck: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ isDark, onNavigate, onAddTruck }) => {
  const actions = [
    { icon: Plus, label: 'Add Truck', action: onAddTruck, color: 'from-cyan-500 to-blue-600' },
    { icon: MessageSquare, label: 'View Inquiries', action: () => onNavigate('inquiries'), color: 'from-purple-500 to-pink-600' },
    { icon: BarChart3, label: 'Analytics', action: () => onNavigate('analytics'), color: 'from-orange-500 to-red-600' },
    { icon: Settings, label: 'Settings', action: () => onNavigate('settings'), color: 'from-green-500 to-emerald-600' },
  ];

  return (
    <div className={`
      p-4 rounded-2xl
      ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white border border-gray-200'}
    `}>
      <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {actions.map(({ icon: Icon, label, action, color }) => (
          <button
            key={label}
            onClick={action}
            className={`
              flex items-center gap-2 p-3 rounded-xl transition-all
              ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'}
              group
            `}
          >
            <div className={`
              w-8 h-8 rounded-lg bg-gradient-to-br ${color}
              flex items-center justify-center
              group-hover:scale-110 transition-transform
            `}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
