import React from 'react';
import { User, Home, Upload, Briefcase, Package, ArrowLeft } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userType: string;
}

// Base navigation items for all users
const baseNavigationItems = [
  { id: 'account-info', label: 'Account Info', icon: User, color: 'text-blue-600' },
  { id: 'address', label: 'Address', icon: Home, color: 'text-green-600' },
  { id: 'account-uploads', label: 'Account Uploads', icon: Upload, color: 'text-purple-600' },
];

// Additional items for builders (FUNDI, PROFESSIONAL, CONTRACTOR, HARDWARE)
const builderNavigationItems = [
  { id: 'experience', label: 'Experience', icon: Briefcase, color: 'text-orange-600' },
  { id: 'products', label: 'Products', icon: Package, color: 'text-indigo-600' },
];

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, userType }) => {
  // Determine which navigation items to show based on user type
  const getNavigationItems = () => {
    if (userType === 'CUSTOMER') {
      return baseNavigationItems;
    } else {
      const items = [...baseNavigationItems, ...builderNavigationItems];
      if (userType === 'HARDWARE') {
        return items.filter((item) => item.id !== 'experience');
      }
      return items;
    }
  };

  const navigationItems = getNavigationItems();

  const getUserTypeLabel = () => {
    switch (userType) {
      case 'FUNDI':
        return 'Fundi Profile';
      case 'PROFESSIONAL':
        return 'Professional Profile';
      case 'CONTRACTOR':
        return 'Contractor Profile';
      case 'HARDWARE':
        return 'Hardware Provider Profile';
      case 'CUSTOMER':
        return 'Customer Profile';
      default:
        return 'User Profile';
    }
  };

  const handleBackToDashboard = () => {
    // Navigate back to the main dashboard based on user type
    const dashboardPath = `/dashboard/admin`;
    window.location.href = dashboardPath;
  };

  return (
    <div className="w-80 bg-white shadow-lg border-2 border-gray-200 rounded-2xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">{getUserTypeLabel()}</h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          Manage your account settings and preferences
        </p>
        <div className="mt-3">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${userType === 'CUSTOMER'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-green-100 text-green-800'
            }`}>
            {userType}
          </span>
        </div>
      </div>

      {/* Back to Dashboard Link */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={handleBackToDashboard}
          className="w-full flex items-center px-4 py-3 rounded-lg text-left transition-all duration-200 group hover:bg-gray-50 text-gray-700 border-2 border-transparent hover:border-gray-200"
        >
          <ArrowLeft className="w-5 h-5 mr-3 text-gray-600" />
          <span className="font-medium text-gray-700">Back to Dashboard</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all duration-200 group ${isActive
                    ? 'bg-blue-50 border-2 border-blue-200 text-blue-700'
                    : 'hover:bg-gray-50 text-gray-700 border-2 border-transparent hover:border-gray-200'
                    }`}
                >
                  <Icon
                    className={`w-5 h-5 mr-3 transition-colors duration-200 ${isActive ? 'text-blue-600' : item.color
                      }`}
                  />
                  <span className={`font-medium ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          {userType === 'CUSTOMER' ? 'Customer Dashboard' : 'Service Provider Dashboard'}
        </p>
      </div>
    </div>
    
  );
};

export default Sidebar;
