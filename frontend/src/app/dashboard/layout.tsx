'use client';
import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { AiAssistant } from "@/components/AiAssistant";
import { SessionProvider, useSession } from "@/context/session";
import { Loader2 } from "lucide-react";

function MaintenanceScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[var(--color-base-bg)]">
      {/* Animated spinner rings */}
      <div className="w-32 h-32 mb-10 relative flex-shrink-0">
        <div className="absolute inset-0 border-4 border-[var(--color-base-text)]/20 rounded-full" />
        <div className="absolute inset-0 border-4 border-[var(--color-base-text)] rounded-full border-t-transparent animate-spin" />
        <div className="absolute inset-4 border-4 border-red-500 rounded-full border-b-transparent animate-spin animation-delay-300" style={{ animationDuration: "0.8s", animationDirection: "reverse" }} />
        <div className="absolute inset-8 border-2 border-[var(--color-base-yellow)] rounded-full border-l-transparent animate-spin" style={{ animationDuration: "1.5s" }} />
      </div>
      <h1 className="text-4xl font-extrabold text-[var(--color-base-text)] tracking-tight text-center">
        System Maintenance
      </h1>
      <p className="mt-4 font-medium text-[var(--color-base-text)] opacity-60 text-center max-w-sm">
        RIT Connect Plus is currently undergoing scheduled maintenance.
      </p>
      <p className="mt-2 text-sm font-medium text-[var(--color-base-text)] opacity-40 text-center">
        Please check back soon. Contact your administrator for updates.
      </p>
    </div>
  );
}

function DashboardInner({ children }: { children: React.ReactNode }) {
  const { user, loading: sessionLoading } = useSession();
  const [maintenance, setMaintenance] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [devAnnouncement, setDevAnnouncement] = useState("");
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    // Only fetch settings after session is known
    if (sessionLoading) return;


    const fetchSettings = () => {
      fetch("/api/admin/settings", { credentials: "include" })
        .then(res => {
          if (res.ok) return res.json();
          return {};
        })
        .then((data: Record<string, string>) => {
          const devModeActive = data.DEVELOPER_MODE === "true";
          const maintModeActive = data.MAINTENANCE_MODE === "true";

          // Dev Mode — apply/remove class based on server state, NEVER client state alone
          if (devModeActive) {
            document.body.classList.add("dev-mode");
            setDevMode(true);
            setDevAnnouncement(data.DEV_MODE_ANNOUNCEMENT || "");
          } else {
            // Always remove on fetch to prevent stale state after Dev Mode is disabled
            document.body.classList.remove("dev-mode");
            setDevMode(false);
            setDevAnnouncement("");
          }

          if (maintModeActive) {
            setMaintenance(true);
          } else {
            // If maintenance was lifted, we might be recovering
            if (maintenance) {
               // Optional: trigger a session refresh to ensure everything is in sync
               window.location.reload();
            }
            setMaintenance(false);
          }
        })
        .catch(() => {
          // On error, default to safe state — remove dev-mode class
          document.body.classList.remove("dev-mode");
        })
        .finally(() => setSettingsLoaded(true));
    };

    fetchSettings();
    // Poll every 5 seconds to provide "instant" state changes
    const interval = setInterval(fetchSettings, 5000);

    return () => clearInterval(interval);
  }, [sessionLoading, user, maintenance]);

  if (sessionLoading || !settingsLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--color-base-bg)]">
        <Loader2 size={32} className="animate-spin text-[var(--color-base-text)] opacity-40" />
      </div>
    );
  }

  // Maintenance gate — ADMIN bypasses, HOD/STAFF see maintenance screen
  if (maintenance && user?.role !== "ADMIN") {
    return <MaintenanceScreen />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-base-bg)] flex-col">
      {devMode && (
        <div className="bg-[#cc0000] text-white text-sm font-bold text-center py-2 px-4 shadow-md z-50 flex-shrink-0 animate-pulse-slow">
          ⚠ DEVELOPER MODE ACTIVE ⚠ {devAnnouncement && <span className="ml-2 border-l border-white/40 pl-2 font-medium">{devAnnouncement}</span>}
        </div>
      )}
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        <main className="flex-1 overflow-y-auto relative z-10">
          <div className="max-w-7xl mx-auto p-4 md:p-10">
            {children}
          </div>
        </main>
        <AiAssistant />
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <DashboardInner>{children}</DashboardInner>
    </SessionProvider>
  );
}
