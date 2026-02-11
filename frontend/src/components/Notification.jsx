import { useState, useEffect, useCallback } from 'react';

const ICONS = {
  success: '\u2705',
  error: '\u274C',
  warning: '\u26A0\uFE0F',
  info: '\u2139\uFE0F',
};

export default function Notification({ notifications = [], onDismiss }) {
  return (
    <div className="notification-container">
      {notifications.map((notif) => (
        <NotificationItem
          key={notif.id}
          notification={notif}
          onDismiss={() => onDismiss(notif.id)}
        />
      ))}
    </div>
  );
}

function NotificationItem({ notification, onDismiss }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const duration = notification.duration || 4000;
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onDismiss, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  const handleClick = useCallback(() => {
    setExiting(true);
    setTimeout(onDismiss, 300);
  }, [onDismiss]);

  const type = notification.type || 'info';

  return (
    <div
      className={`notification-toast notification-${type} ${exiting ? 'notification-exit' : 'notification-enter'}`}
      onClick={handleClick}
    >
      <span className="notification-icon">{ICONS[type]}</span>
      <span className="notification-message">{notification.message}</span>
    </div>
  );
}
