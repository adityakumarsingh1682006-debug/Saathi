"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderLock,
  Fingerprint,
  ShieldCheck,
  Users,
  Sparkles,
  AlertTriangle,
  Settings,
  Building2,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { SaathiLogo } from "../ui/saathi-logo";
import { Badge } from "../ui/badge";
import { useAppState } from "@/lib/store-context";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Medical Records",
    href: "/dashboard/records",
    icon: FolderLock,
    badgeKey: "records",
  },
  {
    name: "My Identity",
    href: "/dashboard/identity",
    icon: Fingerprint,
  },
  {
    name: "Access & Consent",
    href: "/dashboard/consent",
    icon: ShieldCheck,
    badgeKey: "requests",
  },
  {
    name: "Family & Guardians",
    href: "/dashboard/family",
    icon: Users,
  },
  {
    name: "Emergency Access",
    href: "/dashboard/emergency",
    icon: AlertTriangle,
    alert: true,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { requests, records, emergencyEnabled } = useAppState();
  const [mobileOpen, setMobileOpen] = useState(false);

  const pendingRequestsCount = requests.filter((r) => r.status === "Pending").length;

  return (
    <>
      {/* Mobile Top Header with Hamburger */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-xl border-b border-[#7BAE9D]/25 sticky top-0 z-40">
        <Link href="/" className="hover:opacity-90 transition-opacity">
          <SaathiLogo size="sm" />
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-[#E6F3EF] border border-[#7BAE9D]/30 text-[#176B67] hover:bg-[#d8ede6]"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#19302F]/30 backdrop-blur-sm lg:hidden animate-in fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-2xl border-r border-[#7BAE9D]/25 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 shadow-sm",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Top: Logo & System Indicator */}
        <div>
          <div className="p-6 border-b border-[#7BAE9D]/20">
            <Link href="/" onClick={() => setMobileOpen(false)} className="hover:opacity-90 transition-opacity block">
              <SaathiLogo size="md" tagline={true} />
            </Link>
            
            <div className="mt-4 flex items-center justify-between px-3 py-2 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20">
              <span className="text-[11px] text-[#667A78] font-semibold">Gateway Protocol</span>
              <Badge variant="default" className="text-[10px] px-2 py-0.5 font-bold">
                Sepolia L1
              </Badge>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#667A78]">
              Patient Portal
            </div>

            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group relative",
                    isActive
                      ? "bg-[#E6F3EF] text-[#176B67] border border-[#7BAE9D]/35 shadow-xs"
                      : "text-[#667A78] hover:text-[#19302F] hover:bg-[#E6F3EF]/40 border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "w-4 h-4 transition-colors",
                        isActive
                          ? "text-[#176B67]"
                          : item.alert
                          ? "text-[#C98A28]"
                          : "text-[#667A78] group-hover:text-[#19302F]"
                      )}
                    />
                    <span>{item.name}</span>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-1.5">
                    {item.badgeKey === "requests" && pendingRequestsCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#C98A28] text-white animate-pulse">
                        {pendingRequestsCount}
                      </span>
                    )}
                    {item.badgeKey === "records" && (
                      <span className="text-[11px] font-mono text-[#667A78]">
                        {records.length}
                      </span>
                    )}
                    {item.alert && emergencyEnabled && (
                      <span className="w-2 h-2 rounded-full bg-[#C93C4B] animate-ping" />
                    )}
                    {isActive && (
                      <ChevronRight className="w-3.5 h-3.5 text-[#176B67]" />
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Switch to Hospital Portal */}
        <div className="p-4 border-t border-[#7BAE9D]/20 space-y-3">
          <Link
            href="/hospital"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-between p-3 rounded-2xl bg-[#E6F3EF] border border-[#7BAE9D]/35 text-[#176B67] hover:bg-[#d8eee6] transition-all shadow-xs group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white text-[#176B67] shadow-xs group-hover:scale-105 transition-transform">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-[#19302F]">Hospital Portal</div>
                <div className="text-[10px] text-[#667A78]">Provider & Scanner View</div>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-[#176B67] group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <div className="px-3 py-2 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 flex items-center justify-between text-[11px] text-[#667A78]">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#176B67]" />
              ABHA Connected
            </span>
            <span className="font-mono text-[10px] text-[#667A78]">v1.0.4</span>
          </div>
        </div>
      </aside>
    </>
  );
}
