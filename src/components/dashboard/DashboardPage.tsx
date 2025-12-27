import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Truck, DashboardStats, Inquiry } from '@/types';
import StatCard from './StatCard';
import RecentActivity from './RecentActivity';
import WelcomeBanner from './WelcomeBanner';
import {
  Truck as TruckIcon,
  PoundSterling,
  MessageSquare,
  CheckCircle,
  Clock,
  Package,
  Globe,
  TrendingUp
} from 'lucide-react';

interface DashboardPageProps {
  isDark: boolean;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ isDark }) => {

  const [stats, setStats] = useState<DashboardStats>({
    totalTrucks: 0,
    availableTrucks: 0,
    soldTrucks: 0,
    totalInquiries: 0,
    pendingInquiries: 0,
    totalRevenue: 0
  });
  const [recentTrucks, setRecentTrucks] = useState<Truck[]>([]);
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch trucks
      const { data: trucks } = await supabase
        .from('trucks')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch inquiries
      const { data: inquiries } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (trucks) {
        const available = trucks.filter(t => t.status === 'available').length;
        const sold = trucks.filter(t => t.status === 'sold').length;
        const revenue = trucks
          .filter(t => t.status === 'sold')
          .reduce((sum, t) => sum + Number(t.price), 0);

        setStats(prev => ({
          ...prev,
          totalTrucks: trucks.length,
          availableTrucks: available,
          soldTrucks: sold,
          totalRevenue: revenue
        }));
        setRecentTrucks(trucks.slice(0, 5));
      }

      if (inquiries) {
        const pending = inquiries.filter(i => i.status === 'pending').length;
        setStats(prev => ({
          ...prev,
          totalInquiries: inquiries.length,
          pendingInquiries: pending
        }));
        setRecentInquiries(inquiries.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'truck_purchase': return TruckIcon;
      case 'parcel_delivery': return Package;
      case 'international_shipping': return Globe;
      default: return MessageSquare;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'replied': return 'bg-blue-500/20 text-blue-400';
      case 'resolved': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Fleet"
          value={stats.totalTrucks}
          icon={TruckIcon}
          color="cyan"
          trend={12}
          isDark={isDark}
        />
        <StatCard
          title="Available Trucks"
          value={stats.availableTrucks}
          icon={CheckCircle}
          color="green"
          trend={8}
          isDark={isDark}
        />
        <StatCard
          title="Pending Inquiries"
          value={stats.pendingInquiries}
          icon={Clock}
          color="orange"
          trend={-5}
          isDark={isDark}
        />
        <StatCard
          title="Total Revenue"
          value={stats.totalRevenue}
          prefix="£"
          icon={PoundSterling}
          color="purple"
          trend={23}
          isDark={isDark}
        />
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`
          p-5 rounded-2xl
          ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white border border-gray-200'}
        `}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Parcel Deliveries</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>1,234</p>
            </div>
          </div>
        </div>

        <div className={`
          p-5 rounded-2xl
          ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white border border-gray-200'}
        `}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Int'l Shipments</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>567</p>
            </div>
          </div>
        </div>

        <div className={`
          p-5 rounded-2xl
          ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white border border-gray-200'}
        `}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Monthly Growth</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>+18%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Trucks */}
        <div className={`
          rounded-2xl overflow-hidden
          ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white border border-gray-200'}
        `}>
          <div className="p-5 border-b border-slate-700/50">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Recent Fleet Additions
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {recentTrucks.map((truck) => (
              <div
                key={truck.id}
                className={`
                  flex items-center gap-4 p-3 rounded-xl transition-colors cursor-pointer
                  ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'}
                `}
              >
                <img
                  src={truck.main_image}
                  alt={truck.model}
                  className="w-16 h-12 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {truck.brand} {truck.model}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    {truck.year} • {truck.mileage.toLocaleString()} km
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-cyan-400">
                    £{truck.price.toLocaleString()}
                  </p>
                  <span className={`
                    text-xs px-2 py-0.5 rounded-full
                    ${truck.status === 'available'
                      ? 'bg-green-500/20 text-green-400'
                      : truck.status === 'sold'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }
                  `}>
                    {truck.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Inquiries */}
        <div className={`
          rounded-2xl overflow-hidden
          ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white border border-gray-200'}
        `}>
          <div className="p-5 border-b border-slate-700/50">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Recent Inquiries
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {recentInquiries.map((inquiry) => {
              const ServiceIcon = getServiceIcon(inquiry.service_type);
              return (
                <div
                  key={inquiry.id}
                  className={`
                    flex items-center gap-4 p-3 rounded-xl transition-colors cursor-pointer
                    ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'}
                  `}
                >
                  <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center
                    ${inquiry.service_type === 'truck_purchase'
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : inquiry.service_type === 'parcel_delivery'
                        ? 'bg-pink-500/20 text-pink-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }
                  `}>
                    <ServiceIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {inquiry.customer_name}
                    </p>
                    <p className={`text-sm truncate ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      {inquiry.subject}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(inquiry.status)}`}>
                    {inquiry.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Activity Chart Placeholder */}
      <div className={`
        rounded-2xl p-6
        ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white border border-gray-200'}
      `}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Monthly Performance
        </h3>
        <div className="h-64 flex items-end justify-between gap-2 px-4">
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => {
            const height = Math.random() * 80 + 20;
            return (
              <div key={month} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t-lg transition-all duration-500 hover:from-cyan-400 hover:to-blue-400"
                  style={{
                    height: `${height}%`,
                    animationDelay: `${i * 100}ms`
                  }}
                />
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {month}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
