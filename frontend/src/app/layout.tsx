import type { Metadata } from "next";
import "./globals.css";
import { GlobalSettingsManager } from "@/components/GlobalSettingsManager";

export const metadata: Metadata = {
  title: "RIT Connect Plus",
  description: "Unified intelligence and resource sharing platform for HODs, Faculty, and Administrators",
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
        <GlobalSettingsManager>
          {children}
        </GlobalSettingsManager>
      </body>
    </html>
  );
}
