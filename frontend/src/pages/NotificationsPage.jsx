import { useState, useEffect } from 'react';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api';

const TYPE_ICONS = {
  POINTS_EARNED: '\u2B50',
  TIER_UPGRADE: '\uD83C\uDFC6',
  REVIEW_APPROVED: '\u2705',
  REVIEW_REJECTED: '\u274C',
  WELCOME: '\uD83D\uDC4B',
};

export default function NotificationsPage({ onUnreadChange }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadNotifications();
  }, [page]);

  const loadNotifications = async () => {
    try {
      const data = await getNotifications(page);
      setNotifications(data.notifications);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      onUnreadChange?.();
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      onUnreadChange?.();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const hasUnread = notifications.some(n => !n.read);

  if (loading) return <div className="loading">Loading notifications...</div>;

  return (
    <div className="page-content">
      <div className="notifications-header">
        <h3 className="section-title">Notifications</h3>
        {hasUnread && (
          <button className="btn-text" onClick={handleMarkAllRead}>
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{'\uD83D\uDD14'}</div>
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`notification-item ${!notif.read ? 'notification-unread' : ''}`}
              onClick={() => !notif.read && handleMarkRead(notif.id)}
            >
              <div className="notification-item-icon">
                {TYPE_ICONS[notif.type] || '\uD83D\uDD14'}
              </div>
              <div className="notification-item-content">
                <div className="notification-item-title">{notif.title}</div>
                <div className="notification-item-message">{notif.message}</div>
                <div className="notification-item-time">
                  {new Date(notif.createdAt).toLocaleDateString('sr-Latn-RS', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
              {!notif.read && <div className="notification-dot" />}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-secondary"
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </button>
          <span className="page-info">{page} / {totalPages}</span>
          <button
            className="btn btn-secondary"
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
