"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FolderOpen, Users, Settings, LogOut, BookOpen } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Resources", href: "/dashboard/resources", icon: FolderOpen },
    { name: "Teaching Kits", href: "/dashboard/kits", icon: BookOpen },
    { name: "Department", href: "/dashboard/department", icon: Users },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

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
      <nav className="flex flex-col w-full px-6 space-y-2 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

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
              <Icon size={20} className={isActive ? "text-[var(--color-base-text)]" : "group-hover:scale-110 transition-transform"} />
              <span className="text-sm tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="w-full px-6 mt-8">
        <button
          onClick={() => {
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
