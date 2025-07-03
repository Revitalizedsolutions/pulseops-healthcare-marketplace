import React from 'react';
import { 
  Home, 
  Users, 
  Briefcase, 
  MessageSquare, 
  FileText, 
  Settings,
  Shield,
  UserCheck,
  Building,
  CreditCard,
  Eye,
  Search,
  Bell,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const { user } = useAuth();

  const nurseNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'profile', label: 'Profile', icon: Users },
    { id: 'jobs', label: 'Find Jobs', icon: Briefcase },
    { id: 'applications', label: 'My Applications', icon: FileText },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'documents', label: 'Documents', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const hcoNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'profile', label: 'Organization', icon: Building },
    { id: 'post-job', label: 'Post Job', icon: Briefcase },
    { id: 'jobs', label: 'My Jobs', icon: FileText },
    { id: 'applicants', label: 'View Applicants', icon: Eye },
    { id: 'search-nurses', label: 'Search & Invite Nurses', icon: Search },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const adminNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'admin-panel', label: 'Admin Panel', icon: LayoutDashboard },
    { id: 'credentialing', label: 'Credentialing', icon: UserCheck },
    { id: 'nurses', label: 'All Nurses', icon: Users },
    { id: 'organizations', label: 'Organizations', icon: Building },
    { id: 'jobs', label: 'All Jobs', icon: Briefcase },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const getNavItems = () => {
    switch (user?.userType) {
      case 'nurse':
        return nurseNavItems;
      case 'hco':
        return hcoNavItems;
      case 'admin':
        return adminNavItems;
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="w-64 bg-white border-r border-gray-200 h-full">
      <div className="p-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#b4d6d2]/50 to-[#7993ae]/30 border-r-2 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-[#b4d6d2]/25 hover:to-[#7993ae]/10 hover:shadow-sm'
                }`}
                style={{ 
                  borderRightColor: isActive ? '#dc6014' : 'transparent',
                  color: isActive ? '#20342b' : '#476457'
                }}
              >
                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-[#dc6014]' : 'text-gray-400'}`} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
