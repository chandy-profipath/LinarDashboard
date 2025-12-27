import React from 'react';
import { Truck, MessageSquare, DollarSign, UserPlus, Clock } from 'lucide-react';

interface Activity {
  id: string;
  type: 'truck_added' | 'inquiry' | 'sale' | 'user';
  title: string;
  description: string;
  time: string;
}

interface RecentActivityProps {
  isDark: boolean;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ isDark }) => {
  const activities: Activity[] = [
    {
      id: '1',
      type: 'truck_added',
      title: 'New Truck Added',
      description: 'Volvo FH16 2024 added to inventory',
      time: '2 hours ago'
    },
    {
      id: '2',
      type: 'inquiry',
      title: 'New Inquiry',
      description: 'John Smith inquired about Mercedes Actros',
      time: '3 hours ago'
    },
    {
      id: '3',
      type: 'sale',
      title: 'Truck Sold',
      description: 'MAN TGX sold for £155,000',
      time: '5 hours ago'
    },
    {
      id: '4',
      type: 'inquiry',
      title: 'Inquiry Resolved',
      description: 'Shipping quote sent to David Brown',
      time: '1 day ago'
    },
    {
      id: '5',
      type: 'truck_added',
      title: 'Fleet Update',
      description: 'DAF XF status changed to reserved',
      time: '2 days ago'
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'truck_added': return { icon: Truck, color: 'bg-cyan-500/20 text-cyan-400' };
      case 'inquiry': return { icon: MessageSquare, color: 'bg-purple-500/20 text-purple-400' };
      case 'sale': return { icon: DollarSign, color: 'bg-green-500/20 text-green-400' };
      case 'user': return { icon: UserPlus, color: 'bg-orange-500/20 text-orange-400' };
      default: return { icon: Clock, color: 'bg-gray-500/20 text-gray-400' };
    }
  };

  return (
    <div className={`
      rounded-2xl overflow-hidden
      ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white border border-gray-200'}
    `}>
      <div className="p-5 border-b border-slate-700/50">
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Recent Activity
        </h3>
      </div>
      <div className="p-4">
        <div className="relative">
          {/* Timeline line */}
          <div className={`
            absolute left-5 top-0 bottom-0 w-px
            ${isDark ? 'bg-slate-700' : 'bg-gray-200'}
          `} />

          {/* Activities */}
          <div className="space-y-4">
            {activities.map((activity, index) => {
              const { icon: Icon, color } = getIcon(activity.type);
              return (
                <div key={activity.id} className="relative flex gap-4 pl-2">
                  <div className={`
                    relative z-10 w-8 h-8 rounded-full flex items-center justify-center
                    ${color}
                  `}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0 pb-4">
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {activity.title}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      {activity.description}
                    </p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                      {activity.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;
