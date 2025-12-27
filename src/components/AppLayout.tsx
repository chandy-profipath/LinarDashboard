import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LoginPage from './dashboard/LoginPage';
import Sidebar from './dashboard/Sidebar';
import Header from './dashboard/Header';
import DashboardPage from './dashboard/DashboardPage';
import TrucksPage from './dashboard/TrucksPage';
import InquiriesPage from './dashboard/InquiriesPage';
import AnalyticsPage from './dashboard/AnalyticsPage';
import SettingsPage from './dashboard/SettingsPage';

const DashboardContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('linar_theme');
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('linar_theme', newTheme ? 'dark' : 'light');
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard': return 'Dashboard';
      case 'trucks': return 'Fleet Management';
      case 'inquiries': return 'Customer Inquiries';
      case 'analytics': return 'Analytics';
      case 'settings': return 'Settings';
      default: return 'Dashboard';
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage isDark={isDark} />;
      case 'trucks':
        return <TrucksPage isDark={isDark} />;
      case 'inquiries':
        return <InquiriesPage isDark={isDark} />;
      case 'analytics':
        return <AnalyticsPage isDark={isDark} />;
      case 'settings':
        return <SettingsPage isDark={isDark} toggleTheme={toggleTheme} />;
      default:
        return <DashboardPage isDark={isDark} />;
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        toggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div className={`
        transition-all duration-300
        ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}
      `}>
        {/* Header */}
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          title={getPageTitle()}
          isDark={isDark}
          toggleTheme={toggleTheme}
        />

        {/* Page Content */}
        <main className="p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
};

export default AppLayout;
