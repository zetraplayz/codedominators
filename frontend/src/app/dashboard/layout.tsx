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
      <div className="flex min-h-screen bg-[var(--color-base-bg)]">
        <Sidebar />
        <main className="flex-1 p-10 overflow-y-auto">
          {children}
        </main>
        {/* MESH AI floating assistant — available on every dashboard page */}
        <AiAssistant />
      </div>
    </SessionProvider>
  );
}
