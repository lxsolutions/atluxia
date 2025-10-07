'use client';

import { useState, useRef, useEffect } from 'react';
import { Notification, notificationManager } from '../lib/notifications';

interface NotificationBellProps {
  className?: string;
}

export default function NotificationBell({ className = "" }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load notifications
    setNotifications(notificationManager.getNotifications());

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const markAsRead = (id: string) => {
    notificationManager.markAsRead(id);
    setNotifications(notificationManager.getNotifications());
  };

  const markAllAsRead = () => {
    notificationManager.markAllAsRead();
    setNotifications([]);
    setIsOpen(false);
  };

  const getNotificationIcon = (type: string, module: string) => {
    // Module icons
    const moduleIcons = {
      nomad: '🌍',
      polyverse: '🌐',
      everpath: '📚',
      critters: '🐾',
      system: '⚙️'
    };

    // Type colors
    const typeColors = {
      info: 'text-blue-500',
      success: 'text-green-500',
      warning: 'text-yellow-500',
      error: 'text-red-500'
    };

    return (
      <div className={`flex-shrink-0 ${typeColors[type as keyof typeof typeColors]}`}>
        {moduleIcons[module as keyof typeof moduleIcons]}
      </div>
    );
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const unreadCount = notifications.length;

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={toggleDropdown}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-5 5v-5zM10.24 8.56a5.97 5.97 0 01-4.66-7.3 1 1 0 00-.68-1.21.978.978 0 00-1.21.68A7.97 7.97 0 008 12a7.97 7.97 0 007.97 7.97c.41 0 .82-.03 1.22-.09a.978.978 0 00.79-1.21.998.998 0 00-1.21-.68 5.97 5.97 0 01-4.33-9.44z"
          />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer last:border-b-0"
                >
                  <div className="flex items-start space-x-3">
                    {getNotificationIcon(notification.type, notification.module)}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400 capitalize">
                          {notification.module}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(notification.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <div className="text-gray-400 text-4xl mb-2">🔔</div>
                <p className="text-gray-500 text-sm">No new notifications</p>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200">
            <a
              href="/notifications"
              className="block text-center text-sm text-blue-600 hover:text-blue-800"
            >
              View all notifications
            </a>
          </div>
        </div>
      )}
    </div>
  );
}