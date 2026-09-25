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
    <aside className="w-64 min-h-screen bg-[var(--color-base-bg)] shadow-clay-card flex flex-col items-center py-8 z-10 relative">
      {/* Logo */}
      <div className="flex flex-col items-center mb-12">
        <img src="/logo.png" alt="Connect Plus Logo" className="w-16 h-16 drop-shadow-md mb-2" />
        <div className="text-xl font-bold text-[var(--color-base-text)] tracking-tight">
          Connect Plus
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex flex-col w-full px-6 space-y-4 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 font-medium ${
                isActive
                  ? "bg-[var(--color-base-mint)] shadow-clay-pressed text-[var(--color-base-text)] font-bold"
                  : "text-[var(--color-base-text)] opacity-80 hover:bg-[var(--color-base-mint)] hover:shadow-clay-btn hover:opacity-100"
              }`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
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
          className="flex items-center space-x-3 w-full px-4 py-3 rounded-2xl text-red-500/80 font-medium transition-all duration-300 hover:bg-[var(--color-base-mint)] hover:shadow-clay-btn hover:text-red-500"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
