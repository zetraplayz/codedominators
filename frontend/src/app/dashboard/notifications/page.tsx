'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, UserCheck, UserX, Info, Gift, Loader2 } from 'lucide-react';

interface Notification {
  id: number;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  metadata?: { resource_id?: number; requester_id?: string; notification_id?: number };
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NotifIcon({ type }: { type: string }) {
  const cls = 'p-2 rounded-xl shadow-clay-btn flex-shrink-0 mt-1';
  if (type === 'RESOURCE_ACCESS_REQUEST')
    return <div className={`${cls} bg-[var(--color-base-yellow)]`}><UserCheck size={20} className="text-[var(--color-base-text)]" /></div>;
  if (type === 'RESOURCE_ACCESS_GRANTED')
    return <div className={`${cls} bg-[var(--color-base-mint)]`}><Gift size={20} className="text-[var(--color-base-text)]" /></div>;
  return <div className={`${cls} bg-[var(--color-base-bg)]`}><Info size={20} className="text-[var(--color-base-text)]" /></div>;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchNotifs = () => {
    fetch('/api/auth/notifications', { credentials: 'include' })
      .then(res => res.ok ? res.json() : { notifications: [] })
      .then(data => setNotifications(data.notifications || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifs(); }, []);

  const markAsRead = async (id: number) => {
    await fetch(`/api/auth/notifications/${id}/read`, { method: 'POST', credentials: 'include' });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleApprove = async (notif: Notification) => {
    const resourceId = notif.metadata?.resource_id;
    if (!resourceId) return;
    setActionLoading(notif.id);
    try {
      const res = await fetch(`/api/resources/${resourceId}/approve-access/${notif.id}`, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        fetchNotifs();
      } else {
        const data = await res.json().catch(() => ({}));
        alert('Failed to approve: ' + (data.detail || 'Unknown error'));
      }
    } catch {
      alert('Network error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeny = async (notif: Notification) => {
    setActionLoading(notif.id);
    try {
      await markAsRead(notif.id);
    } finally {
      setActionLoading(null);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-[var(--color-base-text)] opacity-40" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <header className="flex items-center gap-4">
        <div className="relative">
          <div className="p-3 bg-[var(--color-base-yellow)] rounded-2xl shadow-clay-btn">
            <Bell size={24} className="text-[var(--color-base-text)]" />
          </div>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-clay-btn">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-[var(--color-base-text)] tracking-tight">Notifications</h1>
          <p className="text-[var(--color-base-text)] opacity-60 font-medium mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'} — access requests and alerts.
          </p>
        </div>
      </header>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[var(--color-base-bg)] shadow-clay-card rounded-3xl text-[var(--color-base-text)]">
          <Bell size={48} className="opacity-20 mb-4" />
          <p className="font-bold text-lg opacity-50">All caught up!</p>
          <p className="text-sm opacity-40">You don&apos;t have any notifications right now.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {notifications.map(notif => {
            const isAccessRequest = notif.type === 'RESOURCE_ACCESS_REQUEST';
            const isActioning = actionLoading === notif.id;

            return (
              <div
                key={notif.id}
                className={`p-6 rounded-3xl flex flex-col gap-4 transition-all ${
                  notif.is_read
                    ? 'bg-[var(--color-base-bg)] shadow-clay-pressed opacity-70'
                    : 'bg-[var(--color-base-mint)] shadow-clay-card'
                }`}
              >
                <div className="flex items-start gap-4">
                  <NotifIcon type={notif.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[var(--color-base-text)] font-bold leading-snug">{notif.message}</p>
                    <p className="text-[var(--color-base-text)] opacity-40 text-xs font-medium mt-1">
                      {timeAgo(notif.created_at)} · {new Date(notif.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!notif.is_read && !isAccessRequest && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="flex-shrink-0 p-2 rounded-xl bg-[var(--color-base-bg)] shadow-clay-btn hover:shadow-clay-pressed text-[var(--color-base-text)] opacity-60 hover:opacity-100 transition-all"
                      title="Mark as read"
                    >
                      <Check size={16} />
                    </button>
                  )}
                </div>

                {/* Access Request Action Buttons */}
                {isAccessRequest && !notif.is_read && (
                  <div className="flex items-center gap-3 pl-12">
                    <button
                      onClick={() => handleApprove(notif)}
                      disabled={isActioning}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-base-bg)] shadow-clay-btn hover:shadow-clay-pressed text-[var(--color-base-text)] font-bold text-sm transition-all disabled:opacity-40"
                    >
                      {isActioning ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />}
                      Approve & Fork
                    </button>
                    <button
                      onClick={() => handleDeny(notif)}
                      disabled={isActioning}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-base-yellow)] shadow-clay-btn hover:shadow-clay-pressed text-[var(--color-base-text)] font-bold text-sm transition-all disabled:opacity-40"
                    >
                      {isActioning ? <Loader2 size={14} className="animate-spin" /> : <UserX size={14} />}
                      Dismiss
                    </button>
                  </div>
                )}

                {/* Already read access request indicator */}
                {isAccessRequest && notif.is_read && (
                  <div className="pl-12 text-xs font-bold text-[var(--color-base-text)] opacity-40">
                    ✓ Handled
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
