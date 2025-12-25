import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Palette, 
  Shield, 
  Save,
  Loader2,
  Check
} from 'lucide-react';

interface SettingsPageProps {
  isDark: boolean;
  toggleTheme: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ isDark, toggleTheme }) => {
  const { admin } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: admin?.full_name || '',
    email: admin?.email || '',
    phone: '',
    company: 'Linar Logistics'
  });

  const [notifications, setNotifications] = useState({
    emailInquiries: true,
    emailSales: true,
    pushNotifications: false,
    weeklyReport: true
  });

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  const inputClass = `
    w-full px-4 py-3 rounded-xl transition-all
    ${isDark 
      ? 'bg-slate-900/50 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500' 
      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-cyan-500'
    }
    border focus:outline-none focus:ring-2 focus:ring-cyan-500/20
  `;

  const labelClass = `block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Settings
        </h2>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          Manage your account and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className={`
          p-4 rounded-2xl h-fit
          ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white border border-gray-200'}
        `}>
          <nav className="space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                  ${activeTab === id
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400'
                    : isDark 
                      ? 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className={`
          lg:col-span-3 p-6 rounded-2xl
          ${isDark ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white border border-gray-200'}
        `}>
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 pb-6 border-b border-slate-700/50">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                  {profileData.fullName.charAt(0) || 'A'}
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {profileData.fullName || 'Admin User'}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    {admin?.role || 'Administrator'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Email Address</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Phone Number</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 000-0000"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Company</label>
                  <input
                    type="text"
                    value={profileData.company}
                    onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Notification Preferences
              </h3>
              
              <div className="space-y-4">
                {[
                  { key: 'emailInquiries', label: 'Email for new inquiries', desc: 'Receive email when a new inquiry is submitted' },
                  { key: 'emailSales', label: 'Email for sales updates', desc: 'Get notified when a truck is sold' },
                  { key: 'pushNotifications', label: 'Push notifications', desc: 'Enable browser push notifications' },
                  { key: 'weeklyReport', label: 'Weekly report', desc: 'Receive weekly performance summary' }
                ].map(({ key, label, desc }) => (
                  <div 
                    key={key}
                    className={`
                      flex items-center justify-between p-4 rounded-xl
                      ${isDark ? 'bg-slate-700/50' : 'bg-gray-50'}
                    `}
                  >
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {label}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        {desc}
                      </p>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ 
                        ...prev, 
                        [key]: !prev[key as keyof typeof prev] 
                      }))}
                      className={`
                        w-12 h-6 rounded-full transition-colors relative
                        ${notifications[key as keyof typeof notifications]
                          ? 'bg-cyan-500'
                          : isDark ? 'bg-slate-600' : 'bg-gray-300'
                        }
                      `}
                    >
                      <div className={`
                        absolute top-1 w-4 h-4 rounded-full bg-white transition-all
                        ${notifications[key as keyof typeof notifications] ? 'left-7' : 'left-1'}
                      `} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Appearance Settings
              </h3>

              <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Dark Mode
                    </p>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      Toggle between light and dark theme
                    </p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`
                      w-12 h-6 rounded-full transition-colors relative
                      ${isDark ? 'bg-cyan-500' : 'bg-gray-300'}
                    `}
                  >
                    <div className={`
                      absolute top-1 w-4 h-4 rounded-full bg-white transition-all
                      ${isDark ? 'left-7' : 'left-1'}
                    `} />
                  </button>
                </div>
              </div>

              <div>
                <p className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Accent Color
                </p>
                <div className="flex gap-3">
                  {['#06B6D4', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444'].map(color => (
                    <button
                      key={color}
                      className="w-10 h-10 rounded-xl transition-transform hover:scale-110"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Security Settings
              </h3>

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Current Password</label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Two-Factor Authentication
                    </p>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      Add an extra layer of security
                    </p>
                  </div>
                  <button className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors">
                    Enable
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-6 mt-6 border-t border-slate-700/50">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
                ${saved
                  ? 'bg-green-500 text-white'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/25'
                }
                disabled:opacity-50
              `}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <Check className="w-5 h-5" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
