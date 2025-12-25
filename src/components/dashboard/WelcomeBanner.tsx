import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Truck, ArrowRight } from 'lucide-react';

interface WelcomeBannerProps {
  isDark: boolean;
  onNavigate: (page: string) => void;
}

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ isDark, onNavigate }) => {
  const { admin } = useAuth();
  const hour = new Date().getHours();
  
  const getGreeting = () => {
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 p-6 md:p-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      {/* Decorative Elements */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl" />

      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm">{getGreeting()},</p>
              <h1 className="text-2xl font-bold text-white">
                {admin?.full_name || 'Admin'}
              </h1>
            </div>
          </div>
          <p className="text-white/70 mt-2 max-w-md">
            Welcome to your Linar Logistics command center. Manage your fleet, track inquiries, and monitor your business performance.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => onNavigate('trucks')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
          >
            View Fleet
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('analytics')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-600 font-medium hover:bg-white/90 transition-colors"
          >
            Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
