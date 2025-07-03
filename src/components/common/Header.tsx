import React from 'react';
import { Heart, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationCenter } from './NotificationCenter';

interface HeaderProps {
  title?: string;
  showNotifications?: boolean;
}

export function Header({ title = 'PulseOps', showNotifications = true }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg shadow-lg" style={{ backgroundColor: '#dc6014' }}>
              <Heart className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold" style={{ color: '#20342b', fontFamily: 'Recoleta Bold, serif' }}>{title}</h1>
          </div>
          {user?.credentialingStatus === 'pending' && (
            <div className="ml-4 px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: '#b4d6d2', color: '#20342b' }}>
              Credentialing Pending
            </div>
          )}
          {user?.credentialingStatus === 'approved' && (
            <div className="ml-4 px-3 py-1 rounded-full text-sm font-medium flex items-center" style={{ backgroundColor: '#b4d6d2', color: '#20342b' }}>
              <div className="w-2 h-2 bg-[#476457] rounded-full mr-2"></div>
              Approved
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {showNotifications && (
            <NotificationCenter />
          )}
          
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-full" style={{ backgroundColor: '#8fb1a8' }}>
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-medium" style={{ color: '#20342b' }}>{user?.email}</div>
              <div className="text-xs capitalize" style={{ color: '#476457' }}>{user?.userType}</div>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
