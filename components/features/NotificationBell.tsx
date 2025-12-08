import React, { useState, useRef, useEffect } from 'react';
import { Notification } from '../../types';
import { BellAlertIcon, BellIconSolid, TrashIcon, XMarkIcon, CheckCircleIcon } from '../icons/HeroIcons';
import { useNotifications } from '../../src/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'error':
    case 'warning':
      return <BellAlertIcon className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />;
    case 'success':
      return <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />;
    default: // info
      return <BellAlertIcon className="w-5 h-5 text-primary mr-2 flex-shrink-0" />;
  }
};

interface NotificationBellProps {
  isMobileContext?: boolean;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ isMobileContext = false }) => {
  const { notifications, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemClick = (notification: Notification) => {
    if (!notification.isRead) markAsRead(notification.id);
    if (notification.linkUrl) navigate(notification.linkUrl);
    setIsOpen(false);
  }

  // Calculate time ago helper
  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "Just now";
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-neutral-dark hover:bg-neutral-light focus:outline-none transition-colors"
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        {unreadCount > 0 ? (
          <div className="relative">
            <BellIconSolid className="w-6 h-6 text-primary animate-pulse-slow" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </div>
        ) : (
          <BellAlertIcon className="w-6 h-6 text-zinc-400 group-hover:text-zinc-600" />
        )}
      </button>

      {isOpen && (
        <div className={`absolute ${isMobileContext ? 'right-0 mt-2' : 'left-0 mt-2'} w-80 max-h-[70vh] overflow-y-auto bg-white rounded-xl shadow-2xl z-50 border border-zinc-100 ring-1 ring-black ring-opacity-5 animate-fade-in-down`}>
          <div className="p-4 flex justify-between items-center border-b border-zinc-100 bg-zinc-50/50 rounded-t-xl">
            <h4 className="font-bold text-zinc-900">Notifications</h4>
            <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-600">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <BellAlertIcon className="w-12 h-12 text-zinc-200 mb-2" />
              <p className="text-sm text-zinc-500">You're all caught up!</p>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-zinc-50">
                {notifications.slice(0, 15).map(notification => (
                  <li
                    key={notification.id}
                    className={`p-4 hover:bg-zinc-50 cursor-pointer transition-colors ${notification.isRead ? 'opacity-60' : 'bg-blue-50/30'}`}
                    onClick={() => handleItemClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 p-1.5 rounded-full ${notification.type === 'error' ? 'bg-red-100 text-red-600' : notification.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${notification.isRead ? 'font-medium text-zinc-700' : 'font-bold text-zinc-900'} leading-snug`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{notification.message}</p>
                        <p className="text-[10px] text-zinc-400 mt-2 font-medium">{timeAgo(notification.createdAt)}</p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="p-3 border-t border-zinc-100 bg-zinc-50 rounded-b-xl flex justify-between items-center text-xs font-medium">
                {unreadCount > 0 ? (
                  <button onClick={() => { markAllAsRead(); }} className="text-blue-600 hover:text-blue-700 transition-colors">
                    Mark all as read
                  </button>
                ) : <span></span>}
                <button onClick={() => { clearAll(); }} className="text-zinc-500 hover:text-red-600 flex items-center transition-colors">
                  <TrashIcon className="w-3.5 h-3.5 mr-1" /> Clear All
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
