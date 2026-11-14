"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Plus,
  Building2,
  Trash2,
  ExternalLink,
  Layers,
  History,
  Lock,
} from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useAppState } from "@/lib/store-context";
import { CONSENT_SCOPES } from "@/lib/blockchain/types";
import { formatAddress } from "@/lib/blockchain/wallet";
import { formatDeterministicDate } from "@/lib/date-utils";

export default function AccessConsentPage() {
  const {
    requests,
    permissions,
    approveRequest,
    rejectRequest,
    revokePermission,
    grantNewPermission,
    isLiveSepolia,
  } = useAppState();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [grantModalOpen, setGrantModalOpen] = useState(false);
  const [providerName, setProviderName] = useState("");
  const [providerAddress, setProviderAddress] = useState("");
  const [selectedScopes, setSelectedScopes] = useState<string[]>(["LABS", "PRESCRIPTIONS"]);
  const [durationHours, setDurationHours] = useState(24);

  const pendingRequests = requests.filter((r) => r.status === "Pending");
  const activePermissions = permissions.filter((p) => p.isActive);
  const revokedPermissions = permissions.filter((p) => !p.isActive);

  const toggleScope = (scopeId: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scopeId) ? prev.filter((s) => s !== scopeId) : [...prev, scopeId]
    );
  };

  const handleGrantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!providerName.trim() || !providerAddress.trim()) return;

    await grantNewPermission(
      providerName,
      providerAddress,
      selectedScopes,
      durationHours
    );

    setGrantModalOpen(false);
    setProviderName("");
    setProviderAddress("");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7FAF8] text-[#19302F]">
      <Topbar
        title="Access & Consent Gateway"
        subtitle="Cryptographic Patient Consent Enforced by Smart Contracts"
      />

      <div className="p-6 max-w-7xl mx-auto w-full space-y-8 text-left">
        {/* CONTRACT STATE BANNER */}
        <div className="p-4 rounded-2xl bg-[#E6F3EF] border border-[#7BAE9D]/35 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white text-[#176B67] shadow-xs">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#19302F] flex items-center gap-2">
                ConsentRegistry (Ethereum Sepolia)
                <Badge variant={isLiveSepolia ? "default" : "outline"} className="text-[10px] font-bold">
                  {isLiveSepolia ? "Active Deployment" : "LOCAL PROTOCOL STATE"}
                </Badge>
              </div>
              <div className="text-xs text-[#667A78]">
                All authorizations are governed by EIP-712 structured data and patient-controlled cryptographic nonces.
              </div>
            </div>
          </div>

          <Button
            onClick={() => setGrantModalOpen(true)}
            size="sm"
            className="bg-[#176B67] hover:bg-[#135855] text-white font-bold gap-1.5 shrink-0 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Grant New Permission</span>
          </Button>
        </div>

        {/* 1. PENDING ACCESS REQUESTS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-[#19302F]">Pending Access Requests</span>
              {pendingRequests.length > 0 && (
                <Badge variant="warning">{pendingRequests.length} Awaiting Approval</Badge>
              )}
            </div>
          </div>

          {pendingRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map((req) => (
                <Card key={req.id} className="p-5 border-[#C98A28]/35 bg-[#C98A28]/10 space-y-4 shadow-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#19302F]">{req.providerName}</h3>
                      <p className="text-xs text-[#667A78]">{req.providerType} • Lic: {req.licenseNumber}</p>
                    </div>
                    <Badge variant="warning" className="text-[10px]">Pending</Badge>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-[#7BAE9D]/20 space-y-1 text-xs">
                    <span className="text-[10px] uppercase font-bold text-[#667A78]">Clinical Purpose:</span>
                    <p className="text-[#19302F] leading-snug">{req.purpose}</p>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <span className="text-[10px] uppercase font-bold text-[#176B67]">Requested Scopes:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {req.requestedScopes.map((scope) => (
                        <span
                          key={scope}
                          className="px-2 py-0.5 rounded-md bg-[#E6F3EF] text-[10px] text-[#176B67] font-mono font-semibold"
                        >
                          {scope}
                        </span>
                      ))}
                      <span className="text-[10px] text-[#667A78] font-mono self-center">
                        • {req.requestedDurationHours} hours
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#7BAE9D]/15">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => rejectRequest(req.id)}
                      className="text-[#667A78] hover:text-[#C93C4B] text-xs font-semibold"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => approveRequest(req.id)}
                      className="bg-[#176B67] hover:bg-[#135855] text-white font-bold text-xs gap-1.5 shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve with EIP-712
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center rounded-2xl bg-white border border-[#7BAE9D]/25 text-xs text-[#667A78] shadow-xs">
              No pending access requests. All incoming clinical requests will appear here for cryptographic sign-off.
            </div>
          )}
        </div>

        {/* 2. ACTIVE PERMISSIONS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#19302F]">Active Consents ({activePermissions.length})</h2>
            <span className="text-xs text-[#667A78]">Enforced by smart contract expiration</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activePermissions.map((perm, idx) => {
              const expiresInHours = mounted
                ? Math.max(0, Math.round((perm.validUntil - Date.now()) / (1000 * 60 * 60)))
                : null;

              return (
                <Card key={idx} className="p-5 border-[#7BAE9D]/25 bg-white/95 hover:border-[#176B67]/40 transition-all space-y-4 shadow-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#19302F]">{perm.providerName}</h3>
                      <p className="text-xs font-mono text-[#667A78]">
                        {formatAddress(perm.provider, 6)}
                      </p>
                    </div>
                    <Badge variant="success" dot className="text-[10px]">
                      {expiresInHours !== null ? `Active (${expiresInHours}h left)` : "Active"}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="text-[10px] uppercase font-bold text-[#667A78]">Granted Scopes:</span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {perm.scopes.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded-md bg-[#E6F3EF] text-[10px] text-[#176B67] font-mono font-semibold"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 flex items-center justify-between text-[11px] font-mono text-[#667A78]">
                    <span>Nonce: #{perm.nonce}</span>
                    <span>Valid until: {formatDeterministicDate(perm.validUntil)}</span>
                  </div>

                  <div className="pt-2 border-t border-[#7BAE9D]/15 flex items-center justify-between">
                    <span className="text-[10px] text-[#667A78] italic">
                      Zero PII on-chain
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => revokePermission(perm.provider)}
                      className="text-[#C93C4B] hover:text-[#C93C4B] hover:bg-[#C93C4B]/10 text-xs gap-1 font-bold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Revoke Access</span>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* 3. PERMISSION HISTORY & AUDIT LOG */}
        <Card className="p-6 border-[#7BAE9D]/25 bg-white/95 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#7BAE9D]/15">
            <div>
              <CardTitle>Permission History & Audit Trail</CardTitle>
              <CardDescription>Irreversible log of past consent grants, expirations and revocations</CardDescription>
            </div>
            <Badge variant="default" className="text-[10px]">
              Tamper-Proof
            </Badge>
          </div>

          <div className="space-y-2 text-xs">
            {revokedPermissions.length > 0 ? (
              revokedPermissions.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="font-bold text-[#19302F]">{item.providerName}</div>
                    <div className="text-[#667A78] text-[11px]">
                      Scopes: {item.scopes.join(", ")}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="destructive" className="text-[10px]">
                      Revoked
                    </Badge>
                    <span className="text-[#667A78] font-mono text-[11px]">
                      {formatDeterministicDate(item.validUntil)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-4 text-center text-[#667A78] text-xs">
                No past revocations recorded. All active permissions are currently compliant.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* GRANT NEW PERMISSION MODAL */}
      <Dialog open={grantModalOpen} onOpenChange={setGrantModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Grant Healthcare Provider Consent</DialogTitle>
            <DialogDescription>
              Authorizes an accredited provider to view specific records for a strict time period.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleGrantSubmit} className="space-y-4 my-2 text-xs text-left">
            <div className="space-y-1.5">
              <label className="font-bold text-[#19302F]">Provider / Hospital Name</label>
              <Input
                placeholder="e.g. Fortis Healthcare (Radiology Unit)"
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#19302F]">Provider Wallet Address or Accreditation ID</label>
              <Input
                placeholder="0x..."
                value={providerAddress}
                onChange={(e) => setProviderAddress(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="font-bold text-[#19302F]">Select Access Scopes</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(CONSENT_SCOPES).map((scope) => (
                  <button
                    type="button"
                    key={scope.id}
                    onClick={() => toggleScope(scope.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedScopes.includes(scope.id)
                        ? "bg-[#E6F3EF] border-[#176B67] text-[#176B67]"
                        : "bg-[#F7FAF8] border-[#7BAE9D]/20 text-[#667A78] hover:text-[#19302F]"
                    }`}
                  >
                    <div className="font-bold">{scope.name}</div>
                    <div className="text-[10px] text-[#667A78] line-clamp-1">{scope.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#19302F]">Access Expiration</label>
              <select
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                className="w-full h-9 rounded-xl border border-[#7BAE9D]/30 bg-white px-3 text-xs text-[#19302F] focus:outline-none focus:border-[#176B67]"
              >
                <option value={1}>1 Hour (Single Appointment)</option>
                <option value={24}>24 Hours (Day Assessment)</option>
                <option value={48}>48 Hours (Pre-procedure review)</option>
                <option value={168}>7 Days (Treatment Course)</option>
                <option value={720}>30 Days (Extended Follow-up)</option>
              </select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setGrantModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-[#176B67] hover:bg-[#135855] text-white font-bold">
                Sign & Authorize
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
