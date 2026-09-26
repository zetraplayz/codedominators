"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FolderOpen, Users, Settings, LogOut, BookOpen, Bell, Shield, MessageSquare, Target } from "lucide-react";
import { useSession } from "@/context/session";
import { useState, useEffect } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchBadge = () => {
      fetch('/api/auth/notifications', { credentials: 'include' })
        .then(res => res.ok ? res.json() : { unread_count: 0 })
        .then(data => setUnreadCount(data.unread_count || 0))
        .catch(() => {});
    };
    fetchBadge();
    // Refresh badge every 60 seconds
    const interval = setInterval(fetchBadge, 60000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home, roles: ["ADMIN", "HOD", "STAFF"] },
    { name: "Resources", href: "/dashboard/resources", icon: FolderOpen, roles: ["ADMIN", "HOD", "STAFF"] },
    { name: "Teaching Kits", href: "/dashboard/kits", icon: BookOpen, roles: ["ADMIN", "HOD", "STAFF"] },
    { name: "Teaching Intents", href: "/dashboard/intents", icon: Target, roles: ["ADMIN", "HOD", "STAFF"] },
    { name: "Department", href: "/dashboard/department", icon: Users, roles: ["ADMIN", "HOD"] },
    { name: "Conversation", href: "/dashboard/conversation", icon: MessageSquare, roles: ["ADMIN", "HOD", "STAFF"] },
    { name: "Notifications", href: "/dashboard/notifications", icon: Bell, roles: ["ADMIN", "HOD", "STAFF"], badge: unreadCount },
    { name: "Admin Panel", href: "/dashboard/admin", icon: Shield, roles: ["ADMIN"] },
    { name: "Settings", href: "/dashboard/settings", icon: Settings, roles: ["ADMIN", "HOD", "STAFF"] },
  ];

  const visibleNavItems = navItems.filter(item => !user || item.roles.includes(user.role));

  return (
    <aside className="w-72 h-screen bg-[var(--color-base-bg)] flex flex-col py-8 z-10 relative border-r border-[var(--color-base-text)]/5">
      {/* Logo */}
      <div className="flex items-center gap-4 px-8 mb-12">
        <div className="p-2 bg-[var(--color-base-mint)] rounded-2xl shadow-clay-btn">
          <img src="/logo.png" alt="Connect Plus Logo" className="w-10 h-10 drop-shadow-sm" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-extrabold text-[var(--color-base-text)] tracking-tight leading-none">Connect<span className="opacity-50">+</span></span>
          <span className="text-[10px] font-bold text-[var(--color-base-text)] opacity-50 uppercase tracking-widest mt-1">Faculty Hub</span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex flex-col w-full px-6 space-y-2 flex-1 overflow-y-auto overflow-x-hidden pb-4">
        {visibleNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const badge = (item as any).badge as number | undefined;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center space-x-4 px-5 py-3.5 rounded-2xl transition-all duration-300 font-medium ${
                isActive
                  ? "bg-[var(--color-base-mint)] shadow-clay-pressed text-[var(--color-base-text)] font-bold"
                  : "text-[var(--color-base-text)] opacity-60 hover:bg-[var(--color-base-bg)] hover:shadow-clay-btn hover:opacity-100"
              }`}
            >
              <div className="relative flex-shrink-0">
                <Icon size={20} className={isActive ? "text-[var(--color-base-text)]" : "group-hover:scale-110 transition-transform"} />
                {badge !== undefined && badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-extrabold flex items-center justify-center">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
              <span className="text-sm tracking-wide flex-1">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      {user && (
        <div className="mx-6 mb-4 p-4 rounded-2xl bg-[var(--color-base-mint)] shadow-clay-pressed">
          <p className="text-xs font-extrabold text-[var(--color-base-text)] truncate">{user.name}</p>
          <p className="text-[10px] font-bold text-[var(--color-base-text)] opacity-50 uppercase tracking-widest mt-0.5">{user.role}</p>
        </div>
      )}

      {/* Logout */}
      <div className="w-full px-6">
        <button
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
            window.location.href = "/login";
          }}
          className="group flex items-center space-x-4 w-full px-5 py-3.5 rounded-2xl text-red-500/70 font-medium transition-all duration-300 hover:bg-[var(--color-base-mint)] hover:shadow-clay-btn hover:text-red-600"
        >
          <LogOut size={20} className="group-hover:scale-110 transition-transform" />
          <span className="text-sm tracking-wide">Logout</span>
        </button>
      </div>
    </aside>
  );
}
