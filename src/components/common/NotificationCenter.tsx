import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  X, 
  MessageSquare, 
  Briefcase, 
  CheckCircle, 
  Clock,
  FileText,
  ExternalLink,
  AlertTriangle,
  Check
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../../context/AuthContext';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface Notification {
  id: string;
  type: 'new_message' | 'job_invite' | 'application_status' | 'new_matching_job' | 'document_expiring' | 'document_expired';
  title: string;
  content: string;
  link?: string;
  resource_id?: string;
  resource_type?: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

// Mock notifications for demo accounts
const getMockNotifications = (): Notification[] => [
  {
    id: 'demo-notif-1',
    type: 'new_message',
    title: 'New Message from Healthcare Center',
    content: 'You have received a new message regarding your recent application.',
    link: '/messages',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
  },
  {
    id: 'demo-notif-2',
    type: 'job_invite',
    title: 'Job Invitation: ICU Nurse Position',
    content: 'You have been invited to apply for an ICU Nurse position at Metro General Hospital.',
    link: '/jobs',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: 'demo-notif-3',
    type: 'document_expiring',
    title: 'Document Expiring Soon',
    content: 'Your nursing license will expire in 30 days. Please renew it to maintain your active status.',
    link: '/documents',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    read_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
];

export function NotificationCenter() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Check if user is a demo account
  const isDemoAccount = user?.id?.startsWith('demo-');

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;
    
    // Handle demo accounts with mock data
    if (isDemoAccount) {
      const mockNotifications = getMockNotifications();
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.is_read).length);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (fetchError) throw fetchError;
      
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    // Handle demo accounts
    if (isDemoAccount) {
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, is_read: true, read_at: new Date().toISOString() } 
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      return;
    }

    try {
      const { error: markError } = await supabase.rpc(
        'mark_notification_as_read',
        { p_notification_id: notificationId }
      );
      
      if (markError) throw markError;
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, is_read: true, read_at: new Date().toISOString() } 
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    // Handle demo accounts
    if (isDemoAccount) {
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
      return;
    }

    try {
      const { error: markAllError } = await supabase.rpc('mark_all_notifications_as_read');
      
      if (markAllError) throw markAllError;
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    
    // Navigate if link exists
    if (notification.link) {
      window.location.href = notification.link;
    }
    
    // Close notification center
    setIsOpen(false);
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch notifications on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Skip real-time subscription for demo accounts
      if (isDemoAccount) {
        return;
      }
      
      // Set up real-time subscription for new notifications
      const subscription = supabase
        .channel('notifications_channel')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            // Add new notification to state
            const newNotification = payload.new as Notification;
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Show browser notification if supported
            if (Notification.permission === 'granted') {
              new Notification(newNotification.title, {
                body: newNotification.content,
                icon: '/favicon.ico'
              });
            }
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [user, isDemoAccount]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_message':
        return <MessageSquare className="h-5 w-5 text-primary-500" />;
      case 'job_invite':
        return <Briefcase className="h-5 w-5 text-sage-500" />;
      case 'application_status':
        return <CheckCircle className="h-5 w-5 text-accent-500" />;
      case 'new_matching_job':
        return <Briefcase className="h-5 w-5 text-secondary-500" />;
      case 'document_expiring':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'document_expired':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="relative" ref={notificationRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-500 hover:text-primary-500 transition-colors relative"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[80vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h3 className="font-medium text-gray-900">Notifications</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Mark all as read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto flex-1">
            {loading && (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-500 border-t-transparent mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
              </div>
            )}

            {error && (
              <div className="p-4 text-center">
                <AlertTriangle className="h-6 w-6 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-red-600">Error loading notifications</p>
                <button
                  onClick={fetchNotifications}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium mt-2"
                >
                  Try again
                </button>
              </div>
            )}

            {!loading && !error && notifications.length === 0 && (
              <div className="p-8 text-center">
                <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No notifications yet</p>
              </div>
            )}

            {!loading && !error && notifications.length > 0 && (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.is_read ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium text-gray-900 ${
                          !notification.is_read ? 'font-semibold' : ''
                        }`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.content}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center">
                          {formatRelativeTime(notification.created_at)}
                          {notification.link && (
                            <ExternalLink className="h-3 w-3 ml-1" />
                          )}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="ml-2 flex-shrink-0">
                          <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-gray-200 bg-gray-50 text-center">
            <button
              onClick={() => window.location.href = '/notifications'}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
