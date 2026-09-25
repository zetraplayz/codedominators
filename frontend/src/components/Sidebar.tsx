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
    <aside className="w-64 min-h-screen bg-[#F0F3F8] shadow-[10px_10px_20px_#d1d5db,-10px_-10px_20px_#ffffff] flex flex-col items-center py-8">
      {/* Logo */}
      <div className="text-2xl font-bold text-gray-800 mb-12 tracking-tight">
        Connect Plus
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
                  ? "bg-[#E6E9F0] shadow-[inset_4px_4px_8px_#c8ccd4,inset_-4px_-4px_8px_#ffffff] text-blue-600"
                  : "text-gray-600 hover:bg-[#E6E9F0] hover:shadow-[4px_4px_8px_#c8ccd4,-4px_-4px_8px_#ffffff]"
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
            // Handle Logout
            window.location.href = "/login";
          }}
          className="flex items-center space-x-3 w-full px-4 py-3 rounded-2xl text-red-500 font-medium transition-all duration-300 hover:bg-[#E6E9F0] hover:shadow-[4px_4px_8px_#c8ccd4,-4px_-4px_8px_#ffffff]"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
