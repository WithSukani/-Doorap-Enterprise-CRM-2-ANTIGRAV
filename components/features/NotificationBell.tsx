
import React, { useState, useRef, useEffect } from 'react';
import { NotificationType, Notification as NotificationData } from '../../types';
import { BellAlertIcon, BellIconSolid, CheckCircleIcon, TrashIcon, XMarkIcon } from '../icons/HeroIcons'; // Using BellIconSolid for active state

const getNotificationIcon = (type: (typeof NotificationType)[keyof typeof NotificationType]) => {
  switch (type) {
    case NotificationType.OVERDUE_REMINDER:
      return <BellAlertIcon className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />;
    case NotificationType.NEW_URGENT_MAINTENANCE:
      return <BellAlertIcon className="w-5 h-5 text-orange-500 mr-2 flex-shrink-0" />;
    case NotificationType.LEASE_EXPIRY_SOON:
      return <BellAlertIcon className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0" />;
    default:
      return <BellAlertIcon className="w-5 h-5 text-primary mr-2 flex-shrink-0" />;
  }
};

interface NotificationBellProps {
    notifications: NotificationData[];
    onMarkRead: (id: string) => void;
    onMarkAllRead: () => void;
    onClearAll: () => void;
    onNotificationClick: (linkTo?: string, notificationId?: string) => void;
    isMobileContext?: boolean;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ 
    notifications, onMarkRead, onMarkAllRead, onClearAll, onNotificationClick, isMobileContext = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemClick = (notification: NotificationData) => {
    if(!notification.isRead) onMarkRead(notification.id);
    onNotificationClick(notification.linkTo, notification.id);
    setIsOpen(false);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative p-2 rounded-full text-neutral-dark hover:bg-neutral-light focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        {unreadCount > 0 ? <BellIconSolid className="w-6 h-6 text-primary" /> : <BellAlertIcon className="w-6 h-6" />}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-4 w-4 transform -translate-y-1/2 translate-x-1/2 rounded-full bg-secondary text-white text-xs flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={`absolute ${isMobileContext ? 'right-0 mt-2' : 'right-0 lg:left-auto lg:right-0 mt-2'} w-80 max-h-[70vh] overflow-y-auto bg-white rounded-md shadow-xl z-50 border border-neutral-light`}>
          <div className="p-3 flex justify-between items-center border-b border-neutral-light">
            <h4 className="font-semibold text-neutral-dark">Notifications</h4>
            <button onClick={() => setIsOpen(false)} className="text-neutral-DEFAULT hover:text-primary-dark">
              <XMarkIcon className="w-5 h-5"/>
            </button>
          </div>
          {notifications.length === 0 ? (
            <p className="text-center text-neutral-DEFAULT p-4">No notifications.</p>
          ) : (
            <>
              <ul className="divide-y divide-neutral-light">
                {notifications.slice(0, 10).map(notification => ( // Show latest 10 or so
                  <li 
                    key={notification.id} 
                    className={`p-3 hover:bg-neutral-light cursor-pointer ${notification.isRead ? 'opacity-70' : 'font-medium'}`}
                    onClick={() => handleItemClick(notification)}
                  >
                    <div className="flex items-start">
                      {getNotificationIcon(notification.type)}
                      <div>
                        <p className="text-sm text-neutral-dark leading-tight">{notification.message}</p>
                        <p className="text-xs text-neutral-DEFAULT mt-0.5">{new Date(notification.date).toLocaleString()}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="p-2 border-t border-neutral-light flex justify-between items-center text-xs">
                {unreadCount > 0 && 
                    <button onClick={() => { onMarkAllRead(); setIsOpen(false);}} className="text-primary hover:underline">Mark all as read</button>
                }
                <button onClick={() => { onClearAll(); setIsOpen(false); }} className="text-secondary hover:underline flex items-center">
                    <TrashIcon className="w-3 h-3 mr-1"/> Clear All
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
