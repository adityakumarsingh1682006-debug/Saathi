"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  ShieldAlert,
  Clock,
  Bell,
  CheckCircle2,
  Lock,
  History,
  Phone,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Radio,
} from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAppState } from "@/lib/store-context";
import { formatAddress } from "@/lib/blockchain/wallet";

export default function EmergencyAccessPage() {
  const {
    emergencyEnabled,
    setEmergencyEnabled,
    emergencyScope,
    setEmergencyScope,
    emergencyDurationHours,
    setEmergencyDurationHours,
    emergencyLogs,
    guardians,
    triggerEmergencyAccess,
    isLiveSepolia,
    showNotice,
  } = useAppState();

  const [simulateHospital, setSimulateHospital] = useState("Apollo Hospital Trauma Emergency Unit");
  const [simulateReason, setSimulateReason] = useState("Patient unconscious following acute road traffic incident");

  const handleSimulateBreakGlass = () => {
    triggerEmergencyAccess(
      simulateHospital,
      "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
      simulateReason
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7FAF8] text-[#19302F]">
      <Topbar
        title="Emergency Access Protocol"
        subtitle="Cryptographic 'Break-Glass' Access for Accredited Trauma Teams"
      />

      <div className="p-6 max-w-7xl mx-auto w-full space-y-8 text-left">
        {/* PROTOCOL INTEGRITY BANNER */}
        <div className="p-4 rounded-2xl bg-[#C93C4B]/10 border border-[#C93C4B]/30 flex items-start gap-3 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-[#C93C4B] shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-bold text-[#C93C4B] block">Strict Trauma Governance Notice</span>
            <p className="text-[#19302F] leading-relaxed">
              There is <strong>no unrestricted back door</strong> in SAATHI. Emergency break-glass access can only be triggered by hospitals holding active regulatory accreditation on the ProviderRegistry smart contract. 
              Access is automatically time-boxed, restricted strictly to preconfigured emergency scopes, and irrevocably notified to all registered guardians.
            </p>
          </div>
        </div>

        {/* POLICY CONFIGURATION CARD */}
        <Card className="p-6 border-[#7BAE9D]/25 bg-white/95 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#7BAE9D]/15 gap-4">
            <div>
              <CardTitle>Patient Emergency Break-Glass Policy</CardTitle>
              <CardDescription>
                Define rules that govern access when you are unresponsive or in critical care
              </CardDescription>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-[#19302F] font-bold">
                {emergencyEnabled ? "Protocol Enabled" : "Protocol Suspended"}
              </span>
              <Switch checked={emergencyEnabled} onCheckedChange={setEmergencyEnabled} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Scope Selection */}
            <div className="p-4 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 space-y-3">
              <div className="font-bold text-[#19302F] flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#176B67]" />
                Permitted Emergency Scope
              </div>
              <p className="text-[#667A78]">
                Critical clinical categories made visible during break-glass:
              </p>
              <div className="space-y-2">
                {[
                  "Blood Group & Organ Donor Status",
                  "Severe Anaphylactic Drug Allergies (Penicillin, etc.)",
                  "Active Maintenance Prescriptions & Dosages",
                  "Designated Emergency Contact & Guardian Phone Numbers",
                ].map((scope, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[#19302F] font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#176B67] shrink-0" />
                    <span>{scope}</span>
                  </div>
                ))}
              </div>
              <div className="text-[11px] text-[#C98A28] pt-1 font-semibold italic">
                * Complete psychiatric, genetic, and full consultation histories remain locked by default.
              </div>
            </div>

            {/* Time Box & Guardian Dispatch */}
            <div className="p-4 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 space-y-4">
              <div>
                <div className="font-bold text-[#19302F] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#176B67]" />
                  Time-Limited Break-Glass Window
                </div>
                <p className="text-[#667A78] mt-1">
                  Access token automatically expires on-chain after:
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {[2, 4, 8].map((hours) => (
                    <button
                      key={hours}
                      onClick={() => setEmergencyDurationHours(hours)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                        emergencyDurationHours === hours
                          ? "bg-[#E6F3EF] text-[#176B67] border-[#176B67]/40 shadow-xs"
                          : "bg-white border-[#7BAE9D]/25 text-[#667A78] hover:text-[#19302F]"
                      }`}
                    >
                      {hours} Hours Max
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#7BAE9D]/15 space-y-2">
                <div className="font-bold text-[#19302F] flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-[#176B67]" />
                  Guardians Dispatched During Event ({guardians.length})
                </div>
                <div className="space-y-1">
                  {guardians.map((g) => (
                    <div key={g.id} className="flex justify-between items-center text-[#19302F]">
                      <span className="font-medium">{g.name} ({g.relationship})</span>
                      <span className="font-mono text-[#176B67] font-bold">{g.phone}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* TEST BREAK-GLASS WORKFLOW SIMULATOR */}
        <Card className="p-6 border-[#C93C4B]/30 bg-white/95 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#7BAE9D]/15">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#C93C4B] animate-pulse" />
              <CardTitle className="text-[#C93C4B] text-sm">
                Hospital Break-Glass Demonstration Sandbox
              </CardTitle>
            </div>
            <Badge variant="destructive" className="text-[10px]">
              Emergency Action
            </Badge>
          </div>

          <p className="text-xs text-[#667A78] leading-relaxed">
            Test the live response engine. When an emergency team requests emergency access, an immutable audit event is registered on the smart contract and all guardians receive real-time dispatch notices.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
            <div className="space-y-1">
              <label className="font-bold text-[#19302F]">Simulated Hospital Terminal</label>
              <input
                type="text"
                value={simulateHospital}
                onChange={(e) => setSimulateHospital(e.target.value)}
                className="w-full h-9 rounded-xl border border-[#7BAE9D]/30 bg-[#F7FAF8] px-3 text-xs text-[#19302F]"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-[#19302F]">Clinical Trauma Reason</label>
              <input
                type="text"
                value={simulateReason}
                onChange={(e) => setSimulateReason(e.target.value)}
                className="w-full h-9 rounded-xl border border-[#7BAE9D]/30 bg-[#F7FAF8] px-3 text-xs text-[#19302F]"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              onClick={handleSimulateBreakGlass}
              disabled={!emergencyEnabled}
              className="bg-[#C93C4B] hover:bg-[#a8313e] text-white font-bold text-xs gap-2 shadow-xs cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Simulate Emergency Break-Glass Event</span>
            </Button>
          </div>
        </Card>

        {/* AUDIT LOG OF EMERGENCY ACCESS EVENTS */}
        <Card className="p-6 border-[#7BAE9D]/25 bg-white/95 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#7BAE9D]/15">
            <div>
              <CardTitle>Emergency Access Audit Log</CardTitle>
              <CardDescription>Irreversible timeline of all emergency queries and trauma triggers</CardDescription>
            </div>
            <Badge variant="default" className="text-[10px]">Contract Audited</Badge>
          </div>

          <div className="space-y-3 text-xs">
            {emergencyLogs.length > 0 ? (
              emergencyLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#19302F]">{log.providerName}</span>
                      <Badge variant="destructive" className="text-[9px]">Emergency Unlocked</Badge>
                    </div>
                    <p className="text-xs text-[#667A78]">{log.reason}</p>
                    <div className="text-[10px] text-[#176B67] font-mono">
                      Attending Clinician Address: {formatAddress(log.providerAddress, 8)}
                    </div>
                  </div>

                  <div className="text-right sm:shrink-0 text-[#667A78] text-[11px] font-mono space-y-1">
                    <div suppressHydrationWarning>{new Date(log.timestamp).toLocaleString("en-US")}</div>
                    <div className="text-[#176B67] font-bold">Proof: {log.reasonHash || log.id}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-[#667A78] text-xs">
                No emergency access events recorded. Your emergency profile is locked and monitored.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
