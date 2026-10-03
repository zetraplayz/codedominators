'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Search, MessageSquare, Plus, X, Loader2, User } from 'lucide-react';
import { useSession } from '@/context/session';

interface ConversationItem {
  id: string;
  other_user_id: string;
  other_user_name: string;
  other_user_photo?: string;
  other_user_role: string;
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
}

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_photo?: string;
  is_mine: boolean;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface SearchableUser {
  id: string;
  name: string;
  role: string;
  department?: string;
  photo?: string;
  email: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function Avatar({ name, photo, size = 40 }: { name: string; photo?: string; size?: number }) {
  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        style={{ width: size, height: size }}
        className="rounded-full object-cover shadow-clay-btn flex-shrink-0"
      />
    );
  }
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-[var(--color-base-mint)] shadow-clay-btn flex items-center justify-center flex-shrink-0"
    >
      <span
        style={{ fontSize: size * 0.35 }}
        className="font-extrabold text-[var(--color-base-text)] opacity-60"
      >
        {name?.charAt(0)?.toUpperCase() || '?'}
      </span>
    </div>
  );
}

export default function ConversationPage() {
  const { user } = useSession();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // New conversation flow
  const [showNewDM, setShowNewDM] = useState(false);
  const [searchUsers, setSearchUsers] = useState('');
  const [searchableUsers, setSearchableUsers] = useState<SearchableUser[]>([]);
  const [newDMMessage, setNewDMMessage] = useState('');
  const [selectedNewUser, setSelectedNewUser] = useState<SearchableUser | null>(null);
  const [startingDM, setStartingDM] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/conversations/', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // eslint-disable-next-line
    fetchConversations();
    // Poll conversations every 10s
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  const fetchMessages = useCallback(async (convoId: string, silent = false) => {
    if (!silent) setMessagesLoading(true);
    try {
      const res = await fetch(`/api/conversations/${convoId}/messages`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        // Update unread count to 0 locally
        setConversations(prev => prev.map(c => c.id === convoId ? { ...c, unread_count: 0 } : c));
      }
    } catch { /* silent */ }
    finally { if (!silent) setMessagesLoading(false); }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (activeConvoId) {
      // eslint-disable-next-line
      fetchMessages(activeConvoId);
      // Poll messages every 3s when a conversation is open
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => fetchMessages(activeConvoId, true), 3000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activeConvoId, fetchMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConvoId || sending) return;
    setSending(true);
    const content = newMessage.trim();
    setNewMessage('');
    try {
      const res = await fetch(`/api/conversations/${activeConvoId}/messages`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages(prev => [...prev, msg]);
        fetchConversations();
      }
    } catch { /* silent */ }
    finally { setSending(false); }
  };

  const fetchSearchableUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/conversations/users/searchable', { credentials: 'include' });
      if (res.ok) setSearchableUsers(await res.json());
    } catch { /* silent */ }
  }, []);

  const openNewDM = () => {
    setShowNewDM(true);
    fetchSearchableUsers();
  };

  const handleStartDM = async () => {
    if (!selectedNewUser || !newDMMessage.trim()) return;
    setStartingDM(true);
    try {
      const res = await fetch('/api/conversations/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participant_id: selectedNewUser.id, initial_message: newDMMessage })
      });
      if (res.ok) {
        const data = await res.json();
        setShowNewDM(false);
        setSelectedNewUser(null);
        setNewDMMessage('');
        setSearchUsers('');
        await fetchConversations();
        setActiveConvoId(data.conversation_id);
      }
    } catch { /* silent */ }
    finally { setStartingDM(false); }
  };

  const activeConvo = conversations.find(c => c.id === activeConvoId);
  const filteredUsers = searchableUsers.filter(u =>
    u.name.toLowerCase().includes(searchUsers.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUsers.toLowerCase()) ||
    u.role.toLowerCase().includes(searchUsers.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-3xl overflow-hidden bg-[var(--color-base-bg)] shadow-clay-card border border-white/20">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 flex flex-col border-r border-[var(--color-base-text)]/10 bg-[var(--color-base-mint)]">
        {/* Header */}
        <div className="p-5 border-b border-[var(--color-base-text)]/10 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-[var(--color-base-text)]">Messages</h1>
            <p className="text-xs font-medium text-[var(--color-base-text)] opacity-50 mt-0.5">
              {conversations.reduce((sum, c) => sum + c.unread_count, 0)} unread
            </p>
          </div>
          <button
            onClick={openNewDM}
            className="p-2.5 rounded-xl bg-[var(--color-base-bg)] shadow-clay-btn hover:shadow-clay-pressed transition-all text-[var(--color-base-text)] opacity-70 hover:opacity-100"
            title="New message"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-[var(--color-base-text)] opacity-40" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 gap-3 text-[var(--color-base-text)]">
              <MessageSquare size={36} className="opacity-20" />
              <p className="font-bold opacity-50 text-sm text-center">No messages yet</p>
              <button
                onClick={openNewDM}
                className="text-xs font-bold opacity-70 hover:opacity-100 underline"
              >
                Start a conversation →
              </button>
            </div>
          ) : (
            conversations.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveConvoId(c.id)}
                className={`w-full text-left px-4 py-4 flex items-center gap-3 transition-all border-b border-[var(--color-base-text)]/5 ${
                  activeConvoId === c.id
                    ? 'bg-[var(--color-base-bg)] shadow-clay-pressed'
                    : 'hover:bg-[var(--color-base-bg)]/50'
                }`}
              >
                <div className="relative">
                  <Avatar name={c.other_user_name} photo={c.other_user_photo} size={44} />
                  {c.unread_count > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-extrabold flex items-center justify-center">
                      {c.unread_count > 9 ? '9+' : c.unread_count}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`font-bold text-sm truncate text-[var(--color-base-text)] ${c.unread_count > 0 ? '' : 'opacity-80'}`}>
                      {c.other_user_name}
                    </p>
                    {c.last_message_at && (
                      <span className="text-[10px] font-medium text-[var(--color-base-text)] opacity-40 flex-shrink-0 ml-1">
                        {timeAgo(c.last_message_at)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[10px] font-bold text-[var(--color-base-text)] opacity-40 uppercase">
                      {c.other_user_role}
                    </span>
                    {c.last_message && (
                      <>
                        <span className="text-[10px] opacity-30">·</span>
                        <p className="text-xs text-[var(--color-base-text)] opacity-50 truncate">
                          {c.last_message}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      {activeConvoId && activeConvo ? (
        <div className="flex-1 flex flex-col">
          {/* Chat header */}
          <div className="px-6 py-4 border-b border-[var(--color-base-text)]/10 flex items-center gap-4 bg-[var(--color-base-bg)]">
            <Avatar name={activeConvo.other_user_name} photo={activeConvo.other_user_photo} size={44} />
            <div>
              <p className="font-extrabold text-[var(--color-base-text)]">{activeConvo.other_user_name}</p>
              <p className="text-xs font-bold text-[var(--color-base-text)] opacity-50 uppercase tracking-wider">
                {activeConvo.other_user_role}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
            {messagesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-[var(--color-base-text)] opacity-40" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-[var(--color-base-text)]">
                <MessageSquare size={40} className="opacity-20" />
                <p className="font-bold opacity-40">No messages yet — say hello!</p>
              </div>
            ) : (
              messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${msg.is_mine ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {!msg.is_mine && (
                    <Avatar name={msg.sender_name} photo={msg.sender_photo} size={32} />
                  )}
                  <div className={`max-w-[70%] flex flex-col ${msg.is_mine ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed ${
                        msg.is_mine
                          ? 'bg-[var(--color-base-text)] text-[var(--color-base-bg)] rounded-br-sm'
                          : 'bg-[var(--color-base-mint)] shadow-clay-btn text-[var(--color-base-text)] rounded-bl-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[10px] font-medium text-[var(--color-base-text)] opacity-40 mt-1 px-1">
                      {msg.created_at ? timeAgo(msg.created_at) : ''}
                      {msg.is_mine && msg.is_read && ' · Seen'}
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input */}
          <form onSubmit={handleSend} className="px-6 py-4 border-t border-[var(--color-base-text)]/10 bg-[var(--color-base-bg)] flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder={`Message ${activeConvo.other_user_name}…`}
              className="flex-1 px-5 py-3 rounded-2xl bg-[var(--color-base-mint)] shadow-clay-pressed text-[var(--color-base-text)] font-medium text-sm placeholder:opacity-40 outline-none focus:ring-2 focus:ring-[var(--color-base-text)]/20 transition-all"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="w-12 h-12 rounded-2xl bg-[var(--color-base-text)] text-[var(--color-base-bg)] flex items-center justify-center shadow-clay-btn hover:shadow-clay-pressed transition-all disabled:opacity-40 flex-shrink-0"
            >
              {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-[var(--color-base-text)] bg-[var(--color-base-bg)]">
          <MessageSquare size={56} className="opacity-10" />
          <p className="font-extrabold text-xl opacity-30">Select a conversation</p>
          <p className="text-sm opacity-20">or start a new one</p>
          <button
            onClick={openNewDM}
            className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-base-mint)] shadow-clay-btn text-sm font-bold text-[var(--color-base-text)] hover:shadow-clay-pressed transition-all"
          >
            <Plus size={16} /> New Message
          </button>
        </div>
      )}

      {/* New DM Modal */}
      {showNewDM && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-[var(--color-base-bg)] rounded-3xl shadow-clay-card p-8 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-[var(--color-base-text)]">New Message</h2>
              <button
                onClick={() => { setShowNewDM(false); setSelectedNewUser(null); setSearchUsers(''); setNewDMMessage(''); }}
                className="p-2 rounded-xl bg-[var(--color-base-mint)] shadow-clay-btn hover:shadow-clay-pressed text-[var(--color-base-text)] opacity-60 hover:opacity-100 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {!selectedNewUser ? (
              <>
                <div className="relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-base-text)] opacity-40" />
                  <input
                    type="text"
                    placeholder="Search by name, role, or email…"
                    value={searchUsers}
                    onChange={e => setSearchUsers(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--color-base-mint)] shadow-clay-pressed text-[var(--color-base-text)] font-medium text-sm placeholder:opacity-40 outline-none focus:ring-2 focus:ring-[var(--color-base-text)]/20 transition-all"
                    autoFocus
                  />
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2">
                  {filteredUsers.length === 0 ? (
                    <p className="text-center text-sm font-medium text-[var(--color-base-text)] opacity-40 py-4">
                      {searchableUsers.length === 0 ? 'Loading users…' : 'No users found'}
                    </p>
                  ) : (
                    filteredUsers.map(u => (
                      <button
                        key={u.id}
                        onClick={() => setSelectedNewUser(u)}
                        className="w-full text-left flex items-center gap-3 p-3 rounded-2xl hover:bg-[var(--color-base-mint)] hover:shadow-clay-btn transition-all"
                      >
                        <Avatar name={u.name} photo={u.photo} size={40} />
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-[var(--color-base-text)] truncate">{u.name}</p>
                          <p className="text-xs font-medium text-[var(--color-base-text)] opacity-50 flex items-center gap-1">
                            <span className="uppercase">{u.role}</span>
                            {u.department && <><span>·</span><span>{u.department}</span></>}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--color-base-mint)] shadow-clay-pressed">
                  <Avatar name={selectedNewUser.name} photo={selectedNewUser.photo} size={44} />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[var(--color-base-text)] truncate">{selectedNewUser.name}</p>
                    <p className="text-xs font-medium text-[var(--color-base-text)] opacity-50 uppercase">{selectedNewUser.role}</p>
                  </div>
                  <button
                    onClick={() => setSelectedNewUser(null)}
                    className="p-1.5 rounded-lg bg-[var(--color-base-bg)] shadow-clay-btn text-[var(--color-base-text)] opacity-50 hover:opacity-100 transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>

                <textarea
                  rows={3}
                  placeholder="Write your first message…"
                  value={newDMMessage}
                  onChange={e => setNewDMMessage(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-[var(--color-base-mint)] shadow-clay-pressed text-[var(--color-base-text)] font-medium text-sm placeholder:opacity-40 outline-none focus:ring-2 focus:ring-[var(--color-base-text)]/20 transition-all resize-none"
                  autoFocus
                />

                <button
                  onClick={handleStartDM}
                  disabled={!newDMMessage.trim() || startingDM}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-[var(--color-base-text)] text-[var(--color-base-bg)] font-extrabold text-sm shadow-clay-btn hover:shadow-clay-pressed transition-all disabled:opacity-40"
                >
                  {startingDM ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Send Message
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
