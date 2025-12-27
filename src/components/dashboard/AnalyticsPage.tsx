import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Truck, Inquiry } from '@/types';
import {
  TrendingUp,
  TrendingDown,
  PoundSterling,
  Truck as TruckIcon,
  Package,
  Globe,
  Users,
  BarChart3
} from 'lucide-react';

interface AnalyticsPageProps {
  isDark: boolean;
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ isDark }) => {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [trucksRes, inquiriesRes] = await Promise.all([
        supabase.from('trucks').select('*'),
        supabase.from('inquiries').select('*')
      ]);

      if (trucksRes.data) setTrucks(trucksRes.data);
      if (inquiriesRes.data) setInquiries(inquiriesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const analytics = useMemo(() => {
    // Brand distribution
    const brandCounts: Record<string, number> = {};
    trucks.forEach(t => {
      brandCounts[t.brand] = (brandCounts[t.brand] || 0) + 1;
    });

    // Status distribution
    const statusCounts = {
      available: trucks.filter(t => t.status === 'available').length,
      sold: trucks.filter(t => t.status === 'sold').length,
      reserved: trucks.filter(t => t.status === 'reserved').length
    };

    // Service type distribution
    const serviceCounts = {
      truck_purchase: inquiries.filter(i => i.service_type === 'truck_purchase').length,
      parcel_delivery: inquiries.filter(i => i.service_type === 'parcel_delivery').length,
      international_shipping: inquiries.filter(i => i.service_type === 'international_shipping').length
    };

    // Price analytics
    const prices = trucks.map(t => t.price);
    const avgPrice = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 0;
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const totalValue = prices.reduce((a, b) => a + b, 0);

    // Revenue from sold trucks
    const revenue = trucks
      .filter(t => t.status === 'sold')
      .reduce((sum, t) => sum + t.price, 0);

    return {
      brandCounts,
      statusCounts,
      serviceCounts,
      avgPrice,
      maxPrice,
      minPrice,
      totalValue,
      revenue
    };
  }, [trucks, inquiries]);

  const brandColors = [
    'from-cyan-500 to-blue-500',
    'from-purple-500 to-pink-500',
    'from-orange-500 to-red-500',
    'from-green-500 to-emerald-500',
    'from-yellow-500 to-orange-500',
    'from-indigo-500 to-purple-500',
    'from-pink-500 to-rose-500',
    'from-teal-500 to-cyan-500'
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Analytics Dashboard
        </h2>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          Comprehensive overview of your fleet and business performance
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`
          p-5 rounded-2xl
          ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white border border-gray-200'}
        `}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <PoundSterling className="w-5 h-5 text-white" />
            </div>
            <span className="flex items-center gap-1 text-xs text-green-400">
              <TrendingUp className="w-3 h-3" /> +12%
            </span>
          </div>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Total Fleet Value</p>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            ${analytics.totalValue.toLocaleString()}
          </p>
        </div>

        <div className={`
          p-5 rounded-2xl
          ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white border border-gray-200'}
        `}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="flex items-center gap-1 text-xs text-green-400">
              <TrendingUp className="w-3 h-3" /> +23%
            </span>
          </div>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Revenue</p>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            ${analytics.revenue.toLocaleString()}
          </p>
        </div>

        <div className={`
          p-5 rounded-2xl
          ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white border border-gray-200'}
        `}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Average Price</p>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            ${Math.round(analytics.avgPrice).toLocaleString()}
          </p>
        </div>

        <div className={`
          p-5 rounded-2xl
          ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white border border-gray-200'}
        `}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="flex items-center gap-1 text-xs text-red-400">
              <TrendingDown className="w-3 h-3" /> -5%
            </span>
          </div>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Total Inquiries</p>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {inquiries.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fleet by Brand */}
        <div className={`
          p-6 rounded-2xl
          ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white border border-gray-200'}
        `}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Fleet by Brand
          </h3>
          <div className="space-y-4">
            {Object.entries(analytics.brandCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([brand, count], idx) => {
                const percentage = (count / trucks.length) * 100;
                return (
                  <div key={brand}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                        {brand}
                      </span>
                      <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        {count} trucks ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className={`h-3 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`}>
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${brandColors[idx % brandColors.length]} transition-all duration-1000`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Fleet Status */}
        <div className={`
          p-6 rounded-2xl
          ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white border border-gray-200'}
        `}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Fleet Status
          </h3>
          <div className="flex items-center justify-center h-64">
            <div className="relative w-48 h-48">
              {/* Pie Chart */}
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                {(() => {
                  const total = trucks.length || 1;
                  const available = (analytics.statusCounts.available / total) * 100;
                  const sold = (analytics.statusCounts.sold / total) * 100;
                  const reserved = (analytics.statusCounts.reserved / total) * 100;

                  let offset = 0;
                  const segments = [
                    { value: available, color: '#10B981' },
                    { value: sold, color: '#EF4444' },
                    { value: reserved, color: '#F59E0B' }
                  ];

                  return segments.map((seg, i) => {
                    const dashArray = `${seg.value} ${100 - seg.value}`;
                    const currentOffset = offset;
                    offset += seg.value;
                    return (
                      <circle
                        key={i}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke={seg.color}
                        strokeWidth="20"
                        strokeDasharray={dashArray}
                        strokeDashoffset={-currentOffset}
                        className="transition-all duration-1000"
                      />
                    );
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {trucks.length}
                </span>
                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  Total
                </span>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                Available ({analytics.statusCounts.available})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                Sold ({analytics.statusCounts.sold})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                Reserved ({analytics.statusCounts.reserved})
              </span>
            </div>
          </div>
        </div>

        {/* Service Inquiries */}
        <div className={`
          p-6 rounded-2xl
          ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white border border-gray-200'}
        `}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Inquiries by Service
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className={`
              p-4 rounded-xl text-center
              ${isDark ? 'bg-slate-700/50' : 'bg-gray-50'}
            `}>
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                <TruckIcon className="w-6 h-6 text-white" />
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {analytics.serviceCounts.truck_purchase}
              </p>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                Truck Purchase
              </p>
            </div>
            <div className={`
              p-4 rounded-xl text-center
              ${isDark ? 'bg-slate-700/50' : 'bg-gray-50'}
            `}>
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {analytics.serviceCounts.parcel_delivery}
              </p>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                Parcel Delivery
              </p>
            </div>
            <div className={`
              p-4 rounded-xl text-center
              ${isDark ? 'bg-slate-700/50' : 'bg-gray-50'}
            `}>
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {analytics.serviceCounts.international_shipping}
              </p>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                Int'l Shipping
              </p>
            </div>
          </div>
        </div>

        {/* Price Range */}
        <div className={`
          p-6 rounded-2xl
          ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white border border-gray-200'}
        `}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Price Analytics
          </h3>
          <div className="space-y-4">
            <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  Highest Price
                </span>
                <span className={`text-xl font-bold text-green-500`}>
                  ${analytics.maxPrice.toLocaleString()}
                </span>
              </div>
            </div>
            <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  Average Price
                </span>
                <span className={`text-xl font-bold text-cyan-500`}>
                  ${Math.round(analytics.avgPrice).toLocaleString()}
                </span>
              </div>
            </div>
            <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  Lowest Price
                </span>
                <span className={`text-xl font-bold text-orange-500`}>
                  ${analytics.minPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Performance Chart */}
      <div className={`
        p-6 rounded-2xl
        ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white border border-gray-200'}
      `}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Monthly Sales Performance
        </h3>
        <div className="h-64 flex items-end justify-between gap-2 px-4">
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => {
            const height = Math.random() * 70 + 30;
            const sales = Math.floor(Math.random() * 5) + 1;
            return (
              <div key={month} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="relative w-full">
                  <div
                    className="w-full bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t-lg transition-all duration-500 group-hover:from-cyan-400 group-hover:to-blue-400"
                    style={{ height: `${height * 2}px` }}
                  />
                  <div className={`
                    absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-xs font-medium
                    opacity-0 group-hover:opacity-100 transition-opacity
                    ${isDark ? 'bg-slate-700 text-white' : 'bg-gray-800 text-white'}
                  `}>
                    {sales} sold
                  </div>
                </div>
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

export default AnalyticsPage;
