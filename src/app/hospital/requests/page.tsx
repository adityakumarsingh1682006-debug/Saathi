"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Send,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  FileCheck2,
  Plus,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppState } from "@/lib/store-context";
import { CONSENT_SCOPES } from "@/lib/blockchain/types";

export default function HospitalRequestsPage() {
  const { patient, requests, showNotice } = useAppState();

  const [targetPatientDid, setTargetPatientDid] = useState(patient.did);
  const [purpose, setPurpose] = useState("Pre-operative cardiac risk clearance and current prescription verification");
  const [selectedScopes, setSelectedScopes] = useState<string[]>(["LABS", "PRESCRIPTIONS"]);
  const [durationHours, setDurationHours] = useState(48);

  const toggleScope = (scopeId: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scopeId) ? prev.filter((s) => s !== scopeId) : [...prev, scopeId]
    );
  };

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPatientDid.trim() || !purpose.trim()) return;

    showNotice(`Access request dispatched to ${patient.name} via EIP-712 protocol`, "success");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7FAF8] text-[#19302F]">
      <header className="px-6 py-4 bg-white/85 backdrop-blur-xl border-b border-[#7BAE9D]/25 flex items-center justify-between">
        <div className="text-left">
          <h1 className="text-xl font-bold text-[#19302F]">Clinical Access Request Gateway</h1>
          <p className="text-xs text-[#667A78]">
            Request scoped access to patient records under ABDM and NABH compliance.
          </p>
        </div>
        <Link href="/hospital">
          <Button variant="outline" size="sm" className="text-xs border-[#7BAE9D]/35 text-[#176B67] hover:bg-[#E6F3EF] gap-1.5 font-bold">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Triage Scanner</span>
          </Button>
        </Link>
      </header>

      <div className="p-6 max-w-7xl mx-auto w-full space-y-8 text-left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT 7 COLS: DISPATCH FORM */}
          <div className="lg:col-span-7">
            <Card className="p-6 border-[#7BAE9D]/25 bg-white/95 space-y-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[#7BAE9D]/15">
                <CardTitle className="text-sm">Compose Scoped Access Request</CardTitle>
                <Badge variant="default" className="text-[10px]">EIP-712 Structured</Badge>
              </div>

              <form onSubmit={handleSendRequest} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-[#19302F]">Target Patient DID or ABHA Address</label>
                  <Input
                    value={targetPatientDid}
                    onChange={(e) => setTargetPatientDid(e.target.value)}
                    required
                    className="font-mono text-xs bg-white border-[#7BAE9D]/30"
                  />
                  <span className="text-[11px] text-[#667A78]">Defaulted to demo patient: {patient.name}</span>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[#19302F]">Clinical Purpose & Diagnostic Justification</label>
                  <Input
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    required
                    className="bg-white border-[#7BAE9D]/30"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-[#19302F]">Requested Clinical Record Scopes</label>
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
                  <label className="font-bold text-[#19302F]">Requested Duration</label>
                  <select
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
                    className="w-full h-9 rounded-xl border border-[#7BAE9D]/30 bg-white px-3 text-xs text-[#19302F] focus:outline-none focus:border-[#176B67]"
                  >
                    <option value={24}>24 Hours (Immediate Clinic Visit)</option>
                    <option value={48}>48 Hours (Pre-procedure Workup)</option>
                    <option value={168}>7 Days (Active Treatment Course)</option>
                    <option value={720}>30 Days (Follow-up Monitoring)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <Button type="submit" className="w-full bg-[#176B67] hover:bg-[#135855] text-white font-bold gap-2 shadow-xs">
                    <Send className="w-4 h-4" />
                    <span>Dispatch Access Request to Patient</span>
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* RIGHT 5 COLS: OUTGOING ACTIVITY FEED */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-6 border-[#7BAE9D]/25 bg-white/95 space-y-4 shadow-sm">
              <CardTitle className="text-sm">Outgoing Request Feed</CardTitle>
              <div className="space-y-3 text-xs">
                {requests.map((r) => (
                  <div
                    key={r.id}
                    className="p-3.5 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#19302F]">{r.providerName}</span>
                      <Badge variant={r.status === "Pending" ? "warning" : "default"} className="text-[10px]">
                        {r.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-[#667A78] leading-tight">{r.purpose}</p>
                    <div className="text-[10px] text-[#176B67] font-mono">
                      Scopes: {r.requestedScopes.join(", ")}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
