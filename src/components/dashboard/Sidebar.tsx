import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Truck, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  LogOut,
  X,
  ChevronLeft
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentPage, 
  setCurrentPage, 
  isOpen, 
  onClose,
  isCollapsed,
  toggleCollapse
}) => {
  const { logout, admin } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'trucks', label: 'Fleet Management', icon: Truck },
    { id: 'inquiries', label: 'Inquiries', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 h-full z-50 
          bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
          border-r border-slate-700/50
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}
          w-72
        `}
      >
        {/* Logo Section */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-700/50">
          <div className={`flex items-center gap-3 ${isCollapsed ? 'lg:hidden' : ''}`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Linar</h1>
              <p className="text-xs text-slate-400">Logistics</p>
            </div>
          </div>
          
          {/* Collapsed logo */}
          <div className={`hidden ${isCollapsed ? 'lg:flex' : 'lg:hidden'} items-center justify-center w-full`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <Truck className="w-6 h-6 text-white" />
            </div>
          </div>
          
          {/* Close button for mobile */}
          <button 
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-700/50 text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Collapse button for desktop */}
          <button 
            onClick={toggleCollapse}
            className={`hidden lg:flex p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl
                  transition-all duration-200 group
                  ${isActive 
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 shadow-lg shadow-cyan-500/10' 
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                  }
                  ${isCollapsed ? 'lg:justify-center lg:px-0' : ''}
                `}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-cyan-400' : 'group-hover:text-cyan-400'}`} />
                <span className={`font-medium ${isCollapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
                {isActive && (
                  <div className={`ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 ${isCollapsed ? 'lg:hidden' : ''}`} />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50">
          <div className={`flex items-center gap-3 mb-4 ${isCollapsed ? 'lg:justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
              {admin?.full_name?.charAt(0) || 'A'}
            </div>
            <div className={`${isCollapsed ? 'lg:hidden' : ''}`}>
              <p className="text-sm font-medium text-white">{admin?.full_name || 'Admin'}</p>
              <p className="text-xs text-slate-400">{admin?.email}</p>
            </div>
          </div>
          
          <button
            onClick={logout}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl
              text-red-400 hover:bg-red-500/10 transition-all duration-200
              ${isCollapsed ? 'lg:justify-center lg:px-0' : ''}
            `}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className={`font-medium ${isCollapsed ? 'lg:hidden' : ''}`}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
