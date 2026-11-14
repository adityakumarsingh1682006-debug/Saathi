import type { Metadata } from "next";
import "./globals.css";
import { AppStateProvider } from "@/lib/store-context";
import { SystemToast } from "@/components/ui/system-toast";

export const metadata: Metadata = {
  title: "SAATHI — Decentralized Healthcare Identity & Patient Records",
  description: "Your Health. Your Identity. Your Control. Self-sovereign medical identity, patient-controlled consent and verifiably secure medical records.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#F7FAF8] text-[#19302F] selection:bg-[#7BAE9D]/30 selection:text-[#176B67] font-sans">
        <AppStateProvider>
          {children}
          <SystemToast />
        </AppStateProvider>
      </body>
    </html>
  );
}
