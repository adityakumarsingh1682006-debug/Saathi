"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  QrCode,
  Users2,
  FileCheck2,
  ShieldCheck,
  Send,
  AlertTriangle,
  ArrowLeft,
  Menu,
  X,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { SaathiLogo } from "../ui/saathi-logo";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

const HOSPITAL_NAV = [
  {
    name: "Triage & QR Ingestion",
    href: "/hospital",
    icon: QrCode,
  },
  {
    name: "Authorized Patient Records",
    href: "/hospital/patients",
    icon: Users2,
  },
  {
    name: "Send Access Requests",
    href: "/hospital/requests",
    icon: Send,
  },
  {
    name: "Credential Verifier",
    href: "/hospital/credentials",
    icon: FileCheck2,
  },
];

export function HospitalSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-xl border-b border-[#7BAE9D]/25 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#176B67]" />
          <span className="font-bold text-[#19302F] text-sm">Provider Portal</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl bg-[#E6F3EF] border border-[#7BAE9D]/30 text-[#176B67]"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#19302F]/30 backdrop-blur-sm lg:hidden animate-in fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Hospital Sidebar */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-2xl border-r border-[#7BAE9D]/25 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 shadow-sm",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div>
          {/* Header */}
          <div className="p-6 border-b border-[#7BAE9D]/20">
            <Link href="/" onClick={() => setMobileOpen(false)} className="hover:opacity-90 transition-opacity block">
              <SaathiLogo size="md" tagline={true} />
            </Link>

            <div className="mt-4 p-3 rounded-2xl bg-[#E6F3EF] border border-[#7BAE9D]/30 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white border border-[#7BAE9D]/30 flex items-center justify-center text-[#176B67] shrink-0 shadow-2xs">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="text-left overflow-hidden">
                <div className="text-xs font-bold text-[#19302F] truncate">
                  Max Super Speciality
                </div>
                <div className="text-[10px] text-[#667A78] flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#176B67]" />
                  NABH Accredited
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#667A78]">
              Healthcare Provider Console
            </div>

            {HOSPITAL_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group",
                    isActive
                      ? "bg-[#E6F3EF] text-[#176B67] border border-[#7BAE9D]/35 shadow-xs"
                      : "text-[#667A78] hover:text-[#19302F] hover:bg-[#E6F3EF]/40 border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "w-4 h-4 transition-colors",
                        isActive ? "text-[#176B67]" : "text-[#667A78] group-hover:text-[#19302F]"
                      )}
                    />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#176B67]" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Switch back to Patient App */}
        <div className="p-4 border-t border-[#7BAE9D]/20 space-y-3">
          <Link
            href="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-between p-3 rounded-2xl bg-[#E6F3EF] border border-[#7BAE9D]/35 text-[#176B67] hover:bg-[#d8eee6] transition-all shadow-xs group"
          >
            <div className="flex items-center gap-3">
              <ArrowLeft className="w-4 h-4 text-[#176B67] group-hover:-translate-x-0.5 transition-transform" />
              <div className="text-left">
                <div className="text-xs font-bold text-[#19302F]">Return to Patient App</div>
                <div className="text-[10px] text-[#667A78]">Self-Sovereign Identity</div>
              </div>
            </div>
          </Link>

          <div className="px-3 py-2 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 flex items-center justify-between text-[11px] text-[#667A78]">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#176B67]" />
              Provider Registry V2
            </span>
            <span className="font-mono text-[10px] text-[#667A78]">Sepolia</span>
          </div>
        </div>
      </aside>
    </>
  );
}
