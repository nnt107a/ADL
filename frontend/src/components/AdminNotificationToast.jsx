import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAdminSession from '../hooks/useAdminSession';

const STORAGE_KEY = 'adl_notified_message_ids';

function getNotifiedIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveNotifiedIds(ids) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch (err) {
    console.error('Failed to save notified message IDs:', err);
  }
}

export default function AdminNotificationToast() {
  const { isAdmin } = useAdminSession();
  const [activeNotification, setActiveNotification] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAdmin) {
      setActiveNotification(null);
      return undefined;
    }

    async function checkNotifications() {
      try {
        const response = await fetch('/api/admin/messages/notifications', {
          credentials: 'same-origin',
        });

        if (!response.ok) return;

        const data = await response.json();
        const unreadList = data.unreadMessages || [];
        setUnreadCount(data.unreadCount || 0);

        if (unreadList.length === 0) return;

        const notifiedIds = getNotifiedIds();
        const freshMessages = unreadList.filter((m) => !notifiedIds.includes(String(m._id)));

        if (freshMessages.length > 0) {
          const newest = freshMessages[0];
          setActiveNotification({
            idsToMark: freshMessages.map((m) => String(m._id)),
            count: freshMessages.length,
            name: newest.name,
            subject: newest.subject || 'General Inquiry',
          });
        }
      } catch (err) {
        console.error('Failed to poll message notifications:', err);
      }
    }

    checkNotifications();

    const interval = setInterval(checkNotifications, 15000);

    return () => clearInterval(interval);
  }, [isAdmin]);

  if (!isAdmin || !activeNotification) {
    return null;
  }

  function handleDismiss() {
    if (activeNotification?.idsToMark) {
      const existing = getNotifiedIds();
      const updated = Array.from(new Set([...existing, ...activeNotification.idsToMark]));
      saveNotifiedIds(updated);
    }
    setActiveNotification(null);
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        maxWidth: '380px',
        width: 'calc(100vw - 48px)',
        backgroundColor: '#0c2839',
        color: '#ffffff',
        borderRadius: '16px',
        padding: '1.2rem 1.4rem',
        boxShadow: '0 12px 32px rgba(12, 40, 57, 0.35)',
        border: '1px solid rgba(255, 189, 89, 0.4)',
      }}
      role="alert"
      aria-live="polite"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.2rem' }}>🔔</span>
          <strong style={{ fontSize: '0.95rem', letterSpacing: '0.02em', color: '#ffbd59' }}>
            New User Message{activeNotification.count > 1 ? `s (${activeNotification.count})` : ''}
          </strong>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: '#a0aec0',
            cursor: 'pointer',
            fontSize: '1.1rem',
            padding: '0 0 0 0.5rem',
            lineHeight: 1,
          }}
          aria-label="Dismiss notification"
        >
          ✕
        </button>
      </div>

      <p style={{ margin: '0 0 1rem 0', fontSize: '0.88rem', color: '#e2e8f0', lineHeight: 1.45 }}>
        <strong>{activeNotification.name}</strong>: {activeNotification.subject}
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link
          to="/admin/messages"
          onClick={handleDismiss}
          style={{
            display: 'inline-block',
            backgroundColor: '#ffbd59',
            color: '#0c2839',
            fontWeight: 700,
            fontSize: '0.82rem',
            padding: '0.45rem 1rem',
            borderRadius: '8px',
            textDecoration: 'none',
          }}
        >
          Open Messages Inbox ({unreadCount})
        </Link>
        <button
          type="button"
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: '#a0aec0',
            fontSize: '0.8rem',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
