'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Sparkles, Check, ExternalLink, X, ChevronRight, AlertCircle, Info } from 'lucide-react';
import Link from 'next/link';

interface NotificationItem {
  id: number;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string | null;
  metadata?: Record<string, unknown>;
}

interface PatchNoteData {
  version: string;
  content: string;
}

export function TopBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'notifications' | 'patch'>('notifications');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [patchNote, setPatchNote] = useState<PatchNoteData | null>(null);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/auth/notifications', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch {
      // Silent error fallback
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/public/settings', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.PATCH_NOTE_VERSION && data.PATCH_NOTE_CONTENT) {
          setPatchNote({
            version: data.PATCH_NOTE_VERSION,
            content: data.PATCH_NOTE_CONTENT,
          });
        } else {
          setPatchNote(null);
        }
      }
    } catch {
      // Silent error fallback
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchSettings();
    const interval = setInterval(() => {
      fetchNotifications();
      fetchSettings();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const markAsRead = async (id: number) => {
    try {
      await fetch(`/api/auth/notifications/${id}/read`, {
        method: 'POST',
        credentials: 'include',
      });
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // Silent fallback
    }
  };

  const toggleOpen = (tab: 'notifications' | 'patch') => {
    if (isOpen && activeTab === tab) {
      setIsOpen(false);
    } else {
      setActiveTab(tab);
      setIsOpen(true);
      if (tab === 'notifications') {
        fetchNotifications();
      } else {
        fetchSettings();
      }
    }
  };

  return (
    <div className="relative flex items-center justify-end gap-3 px-6 py-3.5 z-40 select-none" ref={dropdownRef}>
      {/* Patch Update Action Bar Button */}
      <button
        onClick={() => toggleOpen('patch')}
        aria-label="Patch Updates"
        className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl transition-all ${
          isOpen && activeTab === 'patch'
            ? 'bg-[var(--color-base-mint)] shadow-clay-pressed text-[var(--color-base-text)]'
            : 'bg-[var(--color-base-bg)] shadow-clay-btn hover:shadow-clay-pressed text-[var(--color-base-text)] opacity-85 hover:opacity-100'
        }`}
      >
        <Sparkles size={16} className="text-amber-600" />
        <span className="text-xs font-bold tracking-tight">Patch Update</span>
        {patchNote?.version && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500 text-white shadow-sm">
            v{patchNote.version}
          </span>
        )}
      </button>

      {/* Notifications Action Bar Button */}
      <button
        onClick={() => toggleOpen('notifications')}
        aria-label="Notifications"
        className={`relative flex items-center justify-center w-10 h-10 rounded-2xl transition-all ${
          isOpen && activeTab === 'notifications'
            ? 'bg-[var(--color-base-mint)] shadow-clay-pressed text-[var(--color-base-text)]'
            : 'bg-[var(--color-base-bg)] shadow-clay-btn hover:shadow-clay-pressed text-[var(--color-base-text)] opacity-85 hover:opacity-100'
        }`}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center shadow-md animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Minimal Tabs Popup Window / Bar */}
      {isOpen && (
        <div className="absolute top-14 right-6 w-96 max-w-[92vw] bg-[var(--color-base-bg)] rounded-3xl shadow-clay-card border border-[var(--color-base-text)]/10 overflow-hidden flex flex-col z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Minimal Tab Switcher Header */}
          <div className="flex items-center justify-between p-3 border-b border-[var(--color-base-text)]/10 bg-[var(--color-base-mint)]/40">
            <div className="flex gap-1.5 p-1 bg-[var(--color-base-mint)] rounded-2xl shadow-clay-pressed">
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'notifications'
                    ? 'bg-[var(--color-base-bg)] text-[var(--color-base-text)] shadow-clay-btn'
                    : 'text-[var(--color-base-text)] opacity-60 hover:opacity-100'
                }`}
              >
                <Bell size={13} />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-red-500 text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('patch')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'patch'
                    ? 'bg-[var(--color-base-bg)] text-[var(--color-base-text)] shadow-clay-btn'
                    : 'text-[var(--color-base-text)] opacity-60 hover:opacity-100'
                }`}
              >
                <Sparkles size={13} className="text-amber-600" />
                <span>Patch Update</span>
                {patchNote?.version && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-[var(--color-base-yellow)] text-[var(--color-base-text)]">
                    v{patchNote.version}
                  </span>
                )}
              </button>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--color-base-text)] opacity-50 hover:opacity-100 transition-opacity"
            >
              <X size={15} />
            </button>
          </div>

          {/* Content Area */}
          <div className="max-h-[420px] overflow-y-auto p-4 flex flex-col gap-3">
            {activeTab === 'notifications' ? (
              notifications.length === 0 ? (
                <div className="py-10 text-center flex flex-col items-center justify-center opacity-60">
                  <Bell size={28} className="mb-2 opacity-40" />
                  <p className="text-sm font-bold text-[var(--color-base-text)]">All Caught Up</p>
                  <p className="text-xs text-[var(--color-base-text)] opacity-70 mt-0.5">No unread notifications at this time.</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    className={`p-3.5 rounded-2xl transition-all flex flex-col gap-1.5 ${
                      n.is_read
                        ? 'bg-[var(--color-base-mint)]/40 opacity-70'
                        : 'bg-[var(--color-base-mint)] shadow-clay-btn'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${n.is_read ? 'bg-gray-400' : 'bg-red-500'}`} />
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-base-text)] opacity-60">
                          {n.type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      {!n.is_read && (
                        <button
                          onClick={() => markAsRead(n.id)}
                          className="text-[10px] font-bold text-green-700 hover:underline flex items-center gap-1"
                        >
                          <Check size={11} /> Mark read
                        </button>
                      )}
                    </div>
                    <p className="text-xs font-medium text-[var(--color-base-text)] leading-relaxed">
                      {n.message}
                    </p>
                    {n.created_at && (
                      <span className="text-[10px] text-[var(--color-base-text)] opacity-40 font-medium">
                        {new Date(n.created_at).toLocaleDateString()} · {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                ))
              )
            ) : (
              /* Patch Update Tab */
              <div className="flex flex-col gap-3">
                {patchNote ? (
                  <div className="p-4 rounded-2xl bg-[var(--color-base-mint)] shadow-clay-pressed flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-base-text)] opacity-60">
                        Official Release Note
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-red-500 text-white shadow-sm">
                        v{patchNote.version}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-[var(--color-base-text)] whitespace-pre-wrap leading-relaxed">
                      {patchNote.content}
                    </div>
                    <div className="pt-2 border-t border-[var(--color-base-text)]/10 flex items-center justify-between text-[10px] font-bold text-[var(--color-base-text)] opacity-60">
                      <span>Publisher: Code Dominator</span>
                      <span>Verified System Update</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center flex flex-col items-center justify-center opacity-60">
                    <Sparkles size={28} className="mb-2 opacity-40 text-amber-600" />
                    <p className="text-sm font-bold text-[var(--color-base-text)]">System Up to Date</p>
                    <p className="text-xs text-[var(--color-base-text)] opacity-70 mt-0.5">
                      No active patch update notice published.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
