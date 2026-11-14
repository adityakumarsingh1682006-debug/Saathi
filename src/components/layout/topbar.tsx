"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Search,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  User,
  Shield,
  LogOut,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Input } from "../ui/input";
import { useAppState } from "@/lib/store-context";
import { formatAddress } from "@/lib/blockchain/wallet";

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { patient, wallet, connectWallet, disconnectWallet, requests, records, isLiveSepolia } = useAppState();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const pendingRequests = requests.filter((r) => r.status === "Pending");
  const filteredRecords = searchQuery.trim()
    ? records.filter((r) =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.facility.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white/85 backdrop-blur-xl border-b border-[#7BAE9D]/25">
        {/* Left: Section Header */}
        <div className="text-left">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#19302F]">{title}</h1>
            {isLiveSepolia ? (
              <Badge variant="success" dot className="text-[10px] hidden sm:inline-flex font-bold">
                Sepolia Active
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] hidden sm:inline-flex font-medium text-[#176B67] border-[#7BAE9D]/30">
                Encrypted Vault
              </Badge>
            )}
          </div>
          {subtitle && <p className="text-xs text-[#667A78] mt-0.5">{subtitle}</p>}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Search Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/30 text-xs text-[#667A78] hover:text-[#19302F] hover:border-[#176B67]/40 transition-all shadow-2xs cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-[#176B67]" />
            <span>Search records, doctors...</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white text-[10px] font-mono text-[#667A78] border border-[#7BAE9D]/25 shadow-2xs">
              ⌘K
            </kbd>
          </button>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-xl bg-white border border-[#7BAE9D]/30 text-[#176B67] hover:bg-[#E6F3EF] hover:border-[#176B67]/40 transition-all shadow-xs cursor-pointer"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {pendingRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#C98A28] text-[9px] font-bold text-white animate-pulse">
                  {pendingRequests.length}
                </span>
              )}
            </button>

            {/* Notifications Flyout Drawer */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 rounded-2xl bg-white/95 border border-[#7BAE9D]/35 p-4 shadow-xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 text-left">
                <div className="flex items-center justify-between pb-3 border-b border-[#7BAE9D]/20">
                  <span className="text-xs font-bold text-[#19302F]">System Notifications</span>
                  <span className="text-[10px] text-[#176B67] font-bold font-mono">
                    {pendingRequests.length} Pending
                  </span>
                </div>

                <div className="py-2 space-y-2 max-h-72 overflow-y-auto">
                  {pendingRequests.length > 0 ? (
                    pendingRequests.map((req) => (
                      <Link
                        key={req.id}
                        href="/dashboard/consent"
                        onClick={() => setNotificationsOpen(false)}
                        className="block p-2.5 rounded-xl bg-[#F7FAF8] border border-[#C98A28]/35 hover:border-[#C98A28]/60 transition-colors"
                      >
                        <div className="flex items-center justify-between text-[11px] font-bold text-[#C98A28]">
                          <span>Access Request</span>
                          <span className="text-[9px] text-[#667A78]">Action Required</span>
                        </div>
                        <p className="text-xs text-[#19302F] mt-1 font-semibold">{req.providerName}</p>
                        <p className="text-[10px] text-[#667A78] mt-0.5 line-clamp-1">{req.purpose}</p>
                      </Link>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-[#667A78]">
                      No pending requests. Your health data is secure.
                    </div>
                  )}

                  <div className="p-2.5 rounded-xl bg-[#E6F3EF] border border-[#7BAE9D]/25 text-[11px] text-[#176B67] flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#176B67] mt-0.5 shrink-0" />
                    <span>Cryptographic consent heartbeat active on Sepolia network.</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#7BAE9D]/20">
                  <Link
                    href="/dashboard/consent"
                    onClick={() => setNotificationsOpen(false)}
                    className="block text-center text-xs font-bold text-[#176B67] hover:underline"
                  >
                    View All Consents & Logs →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Wallet Connection Pill */}
          <div className="flex items-center">
            {wallet.isConnected ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#7BAE9D]/35 text-xs text-[#19302F] shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#176B67] animate-pulse" />
                <span className="font-mono font-medium">{formatAddress(wallet.address || "")}</span>
                <span className="text-[10px] text-[#176B67] font-bold px-1.5 py-0.5 rounded bg-[#E6F3EF]">
                  {wallet.balance || "0.25 SEP"}
                </span>
                <button
                  onClick={disconnectWallet}
                  className="ml-1 text-[#667A78] hover:text-[#C93C4B] transition-colors cursor-pointer"
                  title="Disconnect wallet"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={connectWallet}
                className="gap-2 border-[#7BAE9D]/40 text-[#176B67] hover:bg-[#E6F3EF]"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Connect Wallet</span>
              </Button>
            )}
          </div>

          {/* User Profile Pill */}
          <Link
            href="/dashboard/identity"
            className="flex items-center gap-2.5 p-1 pr-3 rounded-full bg-white border border-[#7BAE9D]/30 hover:border-[#176B67]/40 transition-all shadow-xs"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border border-[#7BAE9D]/40 shrink-0 bg-[#E6F3EF]">
              <img
                src={patient.photoUrl || "/aditya-photo.png"}
                alt={patient.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-[#19302F] leading-tight">{patient.name}</div>
              <div className="text-[10px] font-mono text-[#667A78] leading-tight">{patient.bloodGroup || "B+"}</div>
            </div>
          </Link>
        </div>
      </header>

      {/* Global Notice Bar for Demo Protocol */}
      <div className="bg-[#E6F3EF] px-6 py-1.5 border-b border-[#7BAE9D]/20 flex items-center justify-between text-[11px] text-[#19302F]">
        <div className="flex items-center gap-2 truncate">
          <span className="px-1.5 py-0.2 rounded bg-white text-[#176B67] font-mono text-[9px] uppercase font-bold tracking-wider border border-[#7BAE9D]/30">
            Protocol Notice
          </span>
          <span className="truncate text-[#667A78]">
            Decentralized Self-Sovereign Healthcare Node active. Personal health records are end-to-end encrypted; only cryptographic proofs touch Ethereum Sepolia.
          </span>
        </div>
      </div>

      {/* Quick Search Modal */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Search Medical Records & Providers</DialogTitle>
            <DialogDescription>
              Filter your locally-decrypted health documents and physician consultations.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2 text-left">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#667A78]" />
              <Input
                placeholder="Search by title, doctor, facility or blood tests..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((r) => (
                  <Link
                    key={r.id}
                    href="/dashboard/records"
                    onClick={() => setSearchOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#F7FAF8] hover:bg-[#E6F3EF] border border-[#7BAE9D]/20 transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#19302F]">{r.title}</div>
                      <div className="text-[10px] text-[#667A78]">
                        {r.facility} • {r.doctorName}
                      </div>
                    </div>
                    <Badge variant="default" className="text-[9px]">
                      {r.category.toUpperCase()}
                    </Badge>
                  </Link>
                ))
              ) : searchQuery ? (
                <div className="py-8 text-center text-xs text-[#667A78]">
                  No records match &quot;{searchQuery}&quot;
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-[#667A78]">
                  Type keywords to search your encrypted medical history.
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
