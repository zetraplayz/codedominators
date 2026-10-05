import type { Metadata } from "next";
import "./globals.css";
import { GlobalSettingsManager } from "@/components/GlobalSettingsManager";
import InitialSplash from "@/components/InitialSplash";

export const metadata: Metadata = {
  title: "RIT CONNECT PLUS",
  description: "Unified intelligence and resource sharing platform for HODs, Faculty, and Administrators",
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col font-sans">
        <InitialSplash />
        <GlobalSettingsManager>
          <main className="animate-page-enter flex-1 flex flex-col min-h-0">
            {children}
          </main>
        </GlobalSettingsManager>
      </body>
    </html>
  );
}
