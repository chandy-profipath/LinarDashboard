import React from 'react';
import { Menu, Bell, Search, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  title: string;
  isDark: boolean;
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, title, isDark, toggleTheme }) => {
  const [notifications] = React.useState([
    { id: 1, message: 'New inquiry received', time: '5 min ago' },
    { id: 2, message: 'Truck sold: Volvo FH16', time: '1 hour ago' },
    { id: 3, message: 'New customer registration', time: '2 hours ago' },
  ]);
  const [showNotifications, setShowNotifications] = React.useState(false);

  return (
    <header className={`
      h-20 flex items-center justify-between px-6
      ${isDark ? 'bg-slate-900/80' : 'bg-white/80'}
      backdrop-blur-xl border-b
      ${isDark ? 'border-slate-700/50' : 'border-gray-200'}
      sticky top-0 z-30
    `}>
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className={`
            lg:hidden p-2 rounded-xl transition-colors
            ${isDark ? 'hover:bg-slate-700/50 text-slate-400' : 'hover:bg-gray-100 text-gray-600'}
          `}
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h2>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className={`
          hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl
          ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-100 border-gray-200'}
          border
        `}>
          <Search className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
          <input
            type="text"
            placeholder="Search..."
            className={`
              bg-transparent outline-none text-sm w-40
              ${isDark ? 'text-white placeholder-slate-500' : 'text-gray-900 placeholder-gray-400'}
            `}
          />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`
            p-2.5 rounded-xl transition-all duration-300
            ${isDark 
              ? 'bg-slate-800/50 hover:bg-slate-700/50 text-yellow-400' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }
          `}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`
              p-2.5 rounded-xl transition-colors relative
              ${isDark 
                ? 'bg-slate-800/50 hover:bg-slate-700/50 text-slate-400' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }
            `}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className={`
              absolute right-0 top-full mt-2 w-80 rounded-2xl shadow-2xl overflow-hidden
              ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'}
              animate-in fade-in slide-in-from-top-2 duration-200
            `}>
              <div className={`px-4 py-3 border-b ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Notifications
                </h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    className={`
                      px-4 py-3 border-b last:border-0 cursor-pointer transition-colors
                      ${isDark 
                        ? 'border-slate-700/50 hover:bg-slate-700/50' 
                        : 'border-gray-100 hover:bg-gray-50'
                      }
                    `}
                  >
                    <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {notif.message}
                    </p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      {notif.time}
                    </p>
                  </div>
                ))}
              </div>
              <div className={`px-4 py-3 border-t ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                <button className="text-sm text-cyan-500 hover:text-cyan-400 font-medium">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
