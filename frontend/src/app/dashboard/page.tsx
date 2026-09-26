'use client';

import { useState, useEffect } from 'react';
import { FileText, BookOpen, Bell, TrendingUp, Clock, Upload, Eye, Lock, Search } from 'lucide-react';
import { useSession } from '@/context/session';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://codedominators-five.vercel.app';

interface Resource {
  id: number;
  title: string;
  visibility: string;
  created_at: string;
  owner_id: string;
}

function StatCard({ label, value, icon: Icon, accent, href }: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  accent?: boolean;
  href?: string;
}) {
  const content = (
    <>
      <div className="flex items-center justify-between">
        <p className="text-[var(--color-base-text)] opacity-70 text-xs font-bold uppercase tracking-widest">{label}</p>
        <div className="p-2 rounded-xl bg-[var(--color-base-bg)] shadow-clay-btn">
          <Icon size={16} className="text-[var(--color-base-text)]" />
        </div>
      </div>
      <p className="text-5xl font-extrabold text-[var(--color-base-text)] tracking-tight">{value}</p>
    </>
  );

  const className = `p-6 rounded-3xl shadow-clay-card flex flex-col gap-3 transition-all ${accent ? 'bg-[var(--color-base-yellow)]' : 'bg-[var(--color-base-mint)]'} ${href ? 'hover:shadow-clay-pressed cursor-pointer' : ''}`;

  if (href) {
    return (
      <a href={href} className={className} style={{ display: 'flex', textDecoration: 'none' }}>
        {content}
      </a>
    );
  }

  return (
    <div className={className}>
      {content}
    </div>
  );
}

function VisibilityBadge({ v }: { v: string }) {
  const map: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
    PRIVATE: { label: 'Private', icon: Lock, cls: 'bg-[var(--color-base-yellow)]' },
    DEPARTMENT_DISCOVERABLE: { label: 'Dept.', icon: Eye, cls: 'bg-[var(--color-base-mint)]' },
    INSTITUTION_DISCOVERABLE: { label: 'Public', icon: Eye, cls: 'bg-[var(--color-base-bg)]' },
  };
  const cfg = map[v] || map.PRIVATE;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-clay-btn border border-white/20 text-[var(--color-base-text)] ${cfg.cls}`}>
      <cfg.icon size={10} />
      {cfg.label}
    </span>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function DashboardPage() {
  const { user: session, loading: sessionLoading } = useSession();
  const [resources, setResources] = useState<Resource[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [accessRequests, setAccessRequests] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch(`/api/resources/`, { credentials: 'include', cache: 'no-store' }).then(r => r.ok ? r.json() : []),
      fetch(`/api/auth/notifications`, { credentials: 'include', cache: 'no-store' }).then(r => r.ok ? r.json() : { access_request_count: 0 })
    ])
      .then(([resourcesData, notifData]) => {
        setResources(Array.isArray(resourcesData) ? resourcesData : []);
        setAccessRequests(notifData.access_request_count || 0);
      })
      .catch(() => setResources([]))
      .finally(() => setDataLoading(false));
  }, []);

  if (sessionLoading) return <div className="text-[var(--color-base-text)] opacity-50 font-bold p-10 animate-pulse">Loading dashboard...</div>;
  if (!session) return null;

  const myResources = resources.filter(r => r.owner_id === session.id);
  const recentActivity = [...resources]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-10">
      {/* Header */}
      <header>
        <p className="text-[var(--color-base-text)] opacity-50 text-xs font-bold uppercase tracking-widest mb-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="text-4xl font-extrabold text-[var(--color-base-text)] tracking-tight">
          Welcome back, <span className="opacity-60">{session.name}</span>
        </h1>
        <p className="text-[var(--color-base-text)] opacity-50 mt-1 font-medium text-sm">
          {session.role} - Connect Plus
        </p>
      </header>

      {/* Stats */}
      {dataLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-6 rounded-3xl bg-[var(--color-base-mint)] shadow-clay-card animate-pulse h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label="My Resources" value={myResources.length} icon={FileText} href="/dashboard/resources" />
          <StatCard label="Total in Vault" value={resources.length} icon={BookOpen} accent href="/dashboard/resources" />
          <StatCard label="Access Requests" value={accessRequests} icon={Bell} href="/dashboard/notifications" />
        </div>
      )}

      {/* Quick Actions */}
      <section className="flex flex-wrap gap-4">
        <a href="/dashboard/notifications" className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-[var(--color-base-yellow)] shadow-clay-card hover:shadow-clay-pressed transition-all text-[var(--color-base-text)] font-bold">
          <Bell size={20} />
          Access Requests
          {accessRequests > 0 && <span className="ml-2 bg-[var(--color-base-bg)] text-xs px-2 py-0.5 rounded-full shadow-clay-btn">{accessRequests}</span>}
        </a>
        <a href="/dashboard/resources" className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-[var(--color-base-mint)] shadow-clay-card hover:shadow-clay-pressed transition-all text-[var(--color-base-text)] font-bold">
          <BookOpen size={20} />
          Resource Vault
        </a>
        <a href="/dashboard/kits" className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-[var(--color-base-bg)] shadow-clay-card hover:shadow-clay-pressed transition-all text-[var(--color-base-text)] font-bold border border-white/20">
          <FileText size={20} />
          Teaching Kits
        </a>
        <a href="/dashboard/resources" className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-[var(--color-base-mint)] shadow-clay-card hover:shadow-clay-pressed transition-all text-[var(--color-base-text)] font-bold">
          <Search size={20} />
          AI Search
        </a>
      </section>

      {/* Recent Activity */}
      <section className="p-8 rounded-3xl bg-[var(--color-base-mint)] shadow-clay-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[var(--color-base-bg)] shadow-clay-btn">
              <Clock size={16} className="text-[var(--color-base-text)]" />
            </div>
            <h2 className="text-xl font-bold text-[var(--color-base-text)]">Recent Activity</h2>
          </div>
          <a href="/dashboard/resources" className="text-xs font-bold text-[var(--color-base-text)] opacity-50 hover:opacity-100 transition-opacity">
            View all →
          </a>
        </div>

        {dataLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-2xl bg-[var(--color-base-bg)] shadow-clay-pressed animate-pulse" />
            ))}
          </div>
        ) : recentActivity.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-[var(--color-base-text)]">
            <Upload size={36} className="opacity-20" />
            <p className="font-bold opacity-50">No activity yet</p>
            <p className="text-sm opacity-40 text-center max-w-xs">
              Upload your first resource to get started. Your teaching materials will appear here.
            </p>
            <a href="/dashboard/resources" className="mt-2 px-5 py-2.5 rounded-xl bg-[var(--color-base-bg)] shadow-clay-btn text-sm font-bold text-[var(--color-base-text)] hover:shadow-clay-pressed transition-all">
              Go to Resource Vault →
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivity.map(r => (
              <div key={r.id} className="flex items-center justify-between p-4 rounded-2xl bg-[var(--color-base-bg)] shadow-clay-pressed">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-[var(--color-base-mint)] shadow-clay-btn flex-shrink-0">
                    <FileText size={16} className="text-[var(--color-base-text)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[var(--color-base-text)] font-bold text-sm truncate">{r.title}</p>
                    <p className="text-[var(--color-base-text)] opacity-50 text-xs font-medium flex items-center gap-1">
                      <TrendingUp size={10} />
                      {timeAgo(r.created_at)}
                    </p>
                  </div>
                </div>
                <VisibilityBadge v={r.visibility} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
