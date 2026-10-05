'use client';
import { useEffect, useState, useRef } from "react";
import Sidebar from "../../components/Sidebar";
import { TopBar } from "@/components/TopBar";
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

function DevModeRestrictedScreen({ announcement }: { announcement?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#0d0d0d] text-white px-4">
      <div className="w-24 h-24 mb-6 rounded-3xl bg-[#1a1a1a] border border-red-600/40 flex items-center justify-center shadow-lg animate-pulse">
        <span className="text-4xl text-red-500 font-extrabold">⚠</span>
      </div>
      <h1 className="text-3xl font-extrabold text-white tracking-tight text-center">
        Developer Control Mode Active
      </h1>
      <p className="mt-3 text-sm text-gray-400 text-center max-w-md">
        An institution-level developer maintenance session is in progress. User plane operations are temporarily locked.
      </p>
      {announcement && (
        <div className="mt-6 p-4 rounded-2xl bg-[#1e1e1e] border border-red-500/30 text-red-400 text-xs font-semibold max-w-md text-center">
          {announcement}
        </div>
      )}
      <button 
        onClick={() => { window.location.href = "/login"; }}
        className="mt-8 px-6 py-3 rounded-xl bg-[#cc0000] hover:bg-red-700 text-white font-bold text-sm transition-all shadow-lg"
      >
        Return to Login
      </button>
    </div>
  );
}

function DashboardInner({ children }: { children: React.ReactNode }) {
  const { user, loading: sessionLoading } = useSession();
  const [maintenance, setMaintenance] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [devAnnouncement, setDevAnnouncement] = useState("");
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const prevDevMode = useRef<boolean | null>(null);

  useEffect(() => {
    if (sessionLoading) return;

    const fetchSettings = () => {
      fetch("/api/public/settings", { credentials: "include" })
        .then(res => {
          if (res.ok) return res.json();
          return {};
        })
        .then((data: Record<string, string>) => {
          const devModeActive = data.DEVELOPER_MODE === "true";
          const maintModeActive = data.MAINTENANCE_MODE === "true";

          // If dev mode was active and just got disabled, redirect staff/HOD immediately to /login
          if (prevDevMode.current === true && !devModeActive && user && user.role !== "ADMIN") {
            window.location.href = "/login";
            return;
          }
          prevDevMode.current = devModeActive;

          // Dev Mode styling
          if (devModeActive) {
            document.body.classList.add("dev-mode");
            setDevMode(true);
            setDevAnnouncement(data.DEV_MODE_ANNOUNCEMENT || "");
          } else {
            document.body.classList.remove("dev-mode");
            setDevMode(false);
            setDevAnnouncement("");
          }

          if (maintModeActive) {
            setMaintenance(true);
          } else {
            if (maintenance) {
              window.location.reload();
            }
            setMaintenance(false);
          }
        })
        .catch(() => {
          document.body.classList.remove("dev-mode");
        })
        .finally(() => setSettingsLoaded(true));
    };

    fetchSettings();
    const interval = setInterval(fetchSettings, 3000);
    return () => clearInterval(interval);
  }, [sessionLoading, user, maintenance]);

  if (sessionLoading || !settingsLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--color-base-bg)]">
        <Loader2 size={32} className="animate-spin text-[var(--color-base-text)] opacity-40" />
      </div>
    );
  }

  // Developer mode restriction — non-admins cannot access the dashboard
  if (devMode && user?.role !== "ADMIN") {
    return <DevModeRestrictedScreen announcement={devAnnouncement} />;
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
        <main className="flex-1 overflow-y-auto relative z-10 flex flex-col">
          <TopBar />
          <div className="max-w-7xl mx-auto p-4 md:p-8 flex-1 w-full">
            {children}
          </div>
        </main>
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
