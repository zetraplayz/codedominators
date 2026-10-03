'use client';
import { useEffect, useState } from "react";

export function GlobalSettingsManager({ children }: { children: React.ReactNode }) {
  const [devAnnouncement, setDevAnnouncement] = useState("");
  const [devMode, setDevMode] = useState(false);

  useEffect(() => {
    const fetchPublicSettings = () => {
      fetch("/api/public/settings")
        .then(res => res.json())
        .then((data: Record<string, string>) => {
          const devModeActive = data.DEVELOPER_MODE === "true";
          
          if (devModeActive) {
            document.body.classList.add("dev-mode");
            setDevMode(true);
            setDevAnnouncement(data.DEV_MODE_ANNOUNCEMENT || "");
          } else {
            document.body.classList.remove("dev-mode");
            setDevMode(false);
            setDevAnnouncement("");
          }
        })
        .catch(() => {
          document.body.classList.remove("dev-mode");
        });
    };

    fetchPublicSettings();
    const interval = setInterval(fetchPublicSettings, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {devMode && (
        <div className="bg-[#cc0000] text-white text-sm font-bold text-center py-2 px-4 shadow-md z-50 flex-shrink-0 animate-pulse-slow w-full">
          ⚠ DEVELOPER MODE ACTIVE ⚠ {devAnnouncement && <span className="ml-2 border-l border-white/40 pl-2 font-medium">{devAnnouncement}</span>}
        </div>
      )}
      {children}
    </>
  );
}
