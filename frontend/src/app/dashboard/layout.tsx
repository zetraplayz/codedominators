'use client';
import Sidebar from "../../components/Sidebar";
import { AiAssistant } from "@/components/AiAssistant";
import { SessionProvider } from "@/context/session";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="flex h-screen overflow-hidden bg-[var(--color-base-bg)]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 md:p-10">
            {children}
          </div>
        </main>
        {/* MESH AI floating assistant — available on every dashboard page */}
        <AiAssistant />
      </div>
    </SessionProvider>
  );
}
