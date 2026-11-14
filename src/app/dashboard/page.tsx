"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  ShieldCheck,
  KeyRound,
  Calendar,
  CheckCircle2,
  XCircle,
  Eye,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Upload,
  Pill,
  Activity,
  Trash2,
  Lock,
  Stethoscope,
  Info,
  Clock,
} from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { DigitalIdentityCard } from "@/components/dashboard/identity-card";
import { UploadReportModal } from "@/components/dashboard/upload-report-modal";
import { useAppState } from "@/lib/store-context";
import { MedicalRecord } from "@/lib/mock-data";
import { formatAddress } from "@/lib/blockchain/wallet";
import { formatDeterministicDate } from "@/lib/date-utils";

export default function DashboardOverviewPage() {
  const {
    patient,
    records,
    requests,
    permissions,
    prescriptions,
    consultations,
    labPanels,
    approveRequest,
    rejectRequest,
    revokePermission,
    deleteRecord,
    isLiveSepolia,
  } = useAppState();

  const [activeTab, setActiveTab] = useState<"all" | "lab" | "prescription" | "consultation" | "history">("all");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [previewRecord, setPreviewRecord] = useState<MedicalRecord | null>(null);

  const pendingRequests = requests.filter((r) => r.status === "Pending");
  const activePermissions = permissions.filter((p) => p.isActive);
  const activePrescriptions = prescriptions.filter((p) => p.isActive);

  // Extract abnormal laboratory observations across all panels
  const abnormalAnalytes = labPanels.flatMap((panel) =>
    panel.analytes
      .filter((a) => a.status === "Elevated" || a.status === "Low" || a.status === "Critical")
      .map((a) => ({
        ...a,
        panelTitle: panel.title,
        panelLoinc: panel.loincCode,
      }))
  );

  // Filter records based on selected tab
  const filteredRecords = records.filter((r) => {
    if (activeTab === "all") return true;
    if (activeTab === "lab") return r.category === "lab";
    if (activeTab === "prescription") return r.category === "prescription";
    if (activeTab === "consultation") return r.category === "consultation";
    if (activeTab === "history") return r.category === "vaccination" || r.category === "imaging" || r.category === "other";
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#F7FAF8] text-[#19302F]">
      {/* 1. COMPACT TOPBAR */}
      <Topbar
        title="Patient Health Dashboard"
        subtitle="Sovereign Healthcare Identity & Patient-Controlled Consent"
      />

      <div className="p-6 max-w-7xl mx-auto w-full space-y-6 text-left">
        {/* 1. WELCOME / ACTION BANNER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#19302F]">
              Welcome back, {patient.name} 👋
            </h2>
            <p className="text-xs text-[#667A78] mt-0.5">
              Manage your health records, permissions, and care — all in one place.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={() => setUploadModalOpen(true)}
              className="bg-[#176B67] hover:bg-[#135855] text-white font-semibold text-xs gap-1.5 shadow-xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Medical Report</span>
            </Button>
            <Link href="/dashboard/records">
              <Button
                variant="outline"
                className="border-[#7BAE9D]/35 text-[#176B67] hover:bg-[#E6F3EF] text-xs font-semibold cursor-pointer"
              >
                All Records
              </Button>
            </Link>
          </div>
        </div>

        {/* =============================================================== */}
        {/* 2. MAIN FEATURE: CR80 PVC HEALTH ID CARD (CENTERPIECE)          */}
        {/* =============================================================== */}
        <section className="w-full flex flex-col items-center justify-center pt-1 pb-2">
          <div className="w-full max-w-[720px] flex items-center justify-between mb-2.5 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#176B67]">
                Universal PVC Health Identity Pass
              </span>
              <span className="text-[11px] text-[#667A78] hidden sm:inline">• Standard CR80 PVC (85.60 × 53.98 mm)</span>
              <span className="text-[10px] text-[#667A78] sm:hidden">• Swipe horizontally</span>
            </div>
            <Badge variant="default" dot className="text-[10px] font-semibold">
              {isLiveSepolia ? "Sepolia Anchored L1" : "Active Pass"}
            </Badge>
          </div>

          {/* LARGE HORIZONTAL PVC CARD WITH 3D FLIP & CONTROLS */}
          <DigitalIdentityCard interactive={true} />
        </section>

        {/* 3. HEALTH OVERVIEW — 4 ESSENTIAL METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: Medical Records */}
          <Card className="p-4 border-[#7BAE9D]/25 bg-white shadow-2xs hover:border-[#176B67]/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#667A78] font-medium">Medical Records</span>
              <div className="p-1.5 rounded-lg bg-[#E6F3EF] text-[#176B67]">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-[#19302F]">{records.length}</span>
              <span className="text-[11px] text-[#667A78]">files vaulted</span>
            </div>
            <p className="mt-1 text-[11px] text-[#667A78]">Encrypted & integrity verified</p>
          </Card>

          {/* Metric 2: Active Prescriptions */}
          <Card className="p-4 border-[#7BAE9D]/25 bg-white shadow-2xs hover:border-[#176B67]/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#667A78] font-medium">Active Prescriptions</span>
              <div className="p-1.5 rounded-lg bg-[#E6F3EF] text-[#176B67]">
                <Pill className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-[#19302F]">{activePrescriptions.length}</span>
              <span className="text-[11px] text-[#667A78]">medications</span>
            </div>
            <p className="mt-1 text-[11px] text-[#667A78]">Current therapeutic courses</p>
          </Card>

          {/* Metric 3: Pending Consent Requests */}
          <Card className="p-4 border-[#7BAE9D]/25 bg-white shadow-2xs hover:border-[#C98A28]/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#667A78] font-medium">Consent Requests</span>
              <div className={`p-1.5 rounded-lg ${pendingRequests.length > 0 ? "bg-[#C98A28]/15 text-[#C98A28]" : "bg-[#E6F3EF] text-[#176B67]"}`}>
                <KeyRound className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-[#19302F]">{pendingRequests.length}</span>
              <span className="text-[11px] text-[#667A78]">pending</span>
            </div>
            <p className="mt-1 text-[11px] text-[#667A78]">
              {pendingRequests.length > 0 ? "Action required: review scopes" : "All permissions compliant"}
            </p>
          </Card>

          {/* Metric 4: Upcoming Consultations */}
          <Card className="p-4 border-[#7BAE9D]/25 bg-white shadow-2xs hover:border-[#176B67]/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#667A78] font-medium">Consultations</span>
              <div className="p-1.5 rounded-lg bg-[#E6F3EF] text-[#176B67]">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-[#19302F]">{consultations.length}</span>
              <span className="text-[11px] text-[#667A78]">encounters</span>
            </div>
            <p className="mt-1 text-[11px] text-[#667A78]">Recorded clinical visits</p>
          </Card>
        </div>

        {/* 3. MAIN SPLIT CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* =============================================================== */}
          {/* LEFT 8 COLUMNS: RECORDS & CLINICAL INSIGHTS                     */}
          {/* =============================================================== */}
          <div className="lg:col-span-8 space-y-6">
            {/* ACTION REQUIRED: PENDING CONSENT REQUESTS (If any) */}
            {pendingRequests.length > 0 && (
              <div className="rounded-2xl border border-[#C98A28]/35 bg-[#C98A28]/10 p-4 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C98A28] animate-pulse" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#C98A28]">
                      Pending Access Requests ({pendingRequests.length})
                    </h3>
                  </div>
                  <span className="text-[11px] text-[#667A78]">Patient authorization required</span>
                </div>

                <div className="space-y-2">
                  {pendingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-3.5 rounded-xl bg-white border border-[#7BAE9D]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-[#19302F]">{req.providerName}</div>
                        <div className="text-xs text-[#667A78] leading-snug">{req.purpose}</div>
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="text-[10px] text-[#667A78] font-semibold">Scopes:</span>
                          {req.requestedScopes.map((sc) => (
                            <span
                              key={sc}
                              className="px-2 py-0.5 rounded-md bg-[#E6F3EF] text-[10px] text-[#176B67] font-mono font-semibold"
                            >
                              {sc}
                            </span>
                          ))}
                          <span className="text-[10px] text-[#667A78] font-mono">• Duration: {req.requestedDurationHours}h</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => approveRequest(req.id)}
                          className="bg-[#176B67] hover:bg-[#135855] text-white font-bold text-xs gap-1 shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => rejectRequest(req.id)}
                          className="text-[#667A78] hover:text-[#C93C4B] hover:bg-[#C93C4B]/10 text-xs"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MEDICAL RECORDS SECTION (Tabbed SaaS View) */}
            <Card className="border-[#7BAE9D]/25 bg-white shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-[#7BAE9D]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-[#19302F]">Clinical Records Repository</h3>
                  <p className="text-xs text-[#667A78]">Encrypted laboratory tests, prescriptions & consultations</p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      activeTab === "all" ? "bg-[#176B67] text-white" : "bg-[#F7FAF8] text-[#667A78] hover:text-[#19302F]"
                    }`}
                  >
                    All ({records.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("lab")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      activeTab === "lab" ? "bg-[#176B67] text-white" : "bg-[#F7FAF8] text-[#667A78] hover:text-[#19302F]"
                    }`}
                  >
                    Labs
                  </button>
                  <button
                    onClick={() => setActiveTab("prescription")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      activeTab === "prescription" ? "bg-[#176B67] text-white" : "bg-[#F7FAF8] text-[#667A78] hover:text-[#19302F]"
                    }`}
                  >
                    Rx
                  </button>
                  <button
                    onClick={() => setActiveTab("consultation")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      activeTab === "consultation" ? "bg-[#176B67] text-white" : "bg-[#F7FAF8] text-[#667A78] hover:text-[#19302F]"
                    }`}
                  >
                    Consultations
                  </button>
                </div>
              </div>

              {/* Records List */}
              <div className="divide-y divide-[#7BAE9D]/15">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record) => (
                    <div
                      key={record.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F7FAF8] transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-[#E6F3EF] text-[#176B67] shrink-0 mt-0.5">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-sm font-bold text-[#19302F] flex items-center gap-2">
                            <span>{record.title}</span>
                            <Badge variant="outline" className="text-[10px] text-[#176B67] border-[#7BAE9D]/30 uppercase font-semibold">
                              {record.category}
                            </Badge>
                          </div>
                          <div className="text-xs text-[#667A78]">
                            Facility: <span className="font-medium text-[#19302F]">{record.facility}</span> • Physician:{" "}
                            <span className="font-medium text-[#19302F]">{record.doctorName || "Consulting Specialist"}</span>
                          </div>
                          <div className="text-[11px] font-mono text-[#667A78] flex items-center gap-2">
                            <span>Date: {formatDeterministicDate(record.date)}</span>
                            <span>•</span>
                            <span>Size: {record.fileSize}</span>
                            <span>•</span>
                            <span className="text-[#176B67] font-semibold">SHA-256 Anchored</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreviewRecord(record)}
                          className="text-xs text-[#667A78] hover:text-[#176B67] hover:bg-[#E6F3EF] p-2"
                          title="Preview details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteRecord(record.id)}
                          className="text-xs text-[#667A78] hover:text-[#C93C4B] hover:bg-[#C93C4B]/10 p-2"
                          title="Remove record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-[#667A78] text-xs space-y-2">
                    <FileText className="w-8 h-8 text-[#7BAE9D] mx-auto opacity-50" />
                    <p className="font-medium text-[#19302F]">No records found in this category.</p>
                    <p>Upload a new lab report or clinical summary to store it securely.</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* =============================================================== */}
          {/* RIGHT 4 COLUMNS: HEALTH INSIGHTS & ACCESS GOVERNANCE           */}
          {/* =============================================================== */}
          <div className="lg:col-span-4 space-y-6">
            {/* HEALTH INSIGHTS & CLINICAL OBSERVATIONS */}
            <Card className="border-[#7BAE9D]/25 bg-white shadow-2xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#7BAE9D]/15">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#E6F3EF] text-[#176B67]">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#19302F]">Health Insights</h3>
                    <p className="text-[11px] text-[#667A78]">MedlinePlus & NIH grounded</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] text-[#176B67] border-[#7BAE9D]/30">
                  AI Powered
                </Badge>
              </div>

              {/* Abnormal Value Alerts */}
              {abnormalAnalytes.length > 0 ? (
                <div className="space-y-2.5">
                  <div className="text-xs font-bold text-[#19302F]">Parameters Requiring Discussion:</div>
                  <div className="space-y-2">
                    {abnormalAnalytes.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl border border-[#C98A28]/35 bg-[#F7FAF8] space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#19302F] truncate">{item.name}</span>
                          <Badge variant="warning" className="text-[9px] px-1.5 py-0 font-bold">
                            {item.status}
                          </Badge>
                        </div>
                        <div className="text-xs font-mono font-bold text-[#C98A28]">
                          {item.result} {item.unit}
                        </div>
                        <div className="text-[10px] text-[#667A78]">
                          Reference: {item.referenceRange.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[#E6F3EF]/60 border border-[#7BAE9D]/30 flex items-center gap-2 text-xs text-[#176B67]">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>All recorded laboratory observations fall within standard clinical reference ranges.</span>
                </div>
              )}

              {/* Decentralized Storage & Privacy Card */}
              <div className="p-3.5 rounded-xl bg-[#E6F3EF]/50 border border-[#7BAE9D]/30 space-y-1.5 text-xs">
                <div className="font-bold text-[#19302F] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#176B67]" />
                  <span>Decentralized Record Vault</span>
                </div>
                <p className="text-[#667A78] text-[11px] leading-relaxed">
                  Medical documents are encrypted with authenticated AES-256-GCM and stored on IPFS. Access is guarded by your private consent tickets.
                </p>
              </div>
            </Card>

            {/* ACCESS MANAGEMENT & PERMISSION CONTROL */}
            <Card className="border-[#7BAE9D]/25 bg-white shadow-2xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#7BAE9D]/15">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#176B67]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#19302F]">
                    Access Governance
                  </h3>
                </div>
                <Link href="/dashboard/consent" className="text-xs text-[#176B67] font-semibold hover:underline">
                  Manage ({activePermissions.length})
                </Link>
              </div>

              {/* Authorized Providers List */}
              <div className="space-y-2.5">
                {activePermissions.length > 0 ? (
                  activePermissions.map((perm) => (
                    <div
                      key={perm.provider}
                      className="p-3 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-bold text-[#19302F] truncate">{perm.providerName}</div>
                        <Badge variant="success" dot className="text-[9px] shrink-0 font-bold">
                          Active
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {perm.scopes.map((s) => (
                          <span
                            key={s}
                            className="px-1.5 py-0.2 rounded bg-[#E6F3EF] text-[9px] text-[#176B67] font-mono font-semibold"
                          >
                            {s}
                          </span>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-[#7BAE9D]/15 flex items-center justify-between text-[11px] text-[#667A78]">
                        <span>Valid until: {formatDeterministicDate(perm.validUntil)}</span>
                        <button
                          onClick={() => revokePermission(perm.provider)}
                          className="text-[#C93C4B] hover:text-[#C93C4B] font-bold hover:underline cursor-pointer"
                        >
                          Revoke
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-[#667A78] text-xs">
                    No active provider permissions. Your health vault is locked.
                  </div>
                )}
              </div>

              <div className="p-2.5 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-[#667A78]">
                  <Lock className="w-3.5 h-3.5 text-[#176B67]" />
                  <span>Sovereign EIP-712 Revocable Permits</span>
                </div>
                <Link href="/dashboard/emergency" className="text-[#C93C4B] font-bold hover:underline">
                  Emergency Rule
                </Link>
              </div>
            </Card>

            {/* UPCOMING CONSULTATION SUMMARY */}
            <Card className="border-[#7BAE9D]/25 bg-white shadow-2xs p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#19302F] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#176B67]" />
                  Next Clinical Consultation
                </span>
                <Badge variant="default" className="text-[10px]">
                  Scheduled
                </Badge>
              </div>

              {consultations.length > 0 ? (
                <div className="p-3 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 space-y-1 text-xs">
                  <div className="font-bold text-[#19302F]">{consultations[0].doctorName}</div>
                  <div className="text-[#667A78] text-[11px]">{consultations[0].specialty} • {consultations[0].facility}</div>
                  <div className="text-[11px] font-mono text-[#176B67] font-semibold pt-1">
                    Date: {formatDeterministicDate(consultations[0].date)}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#667A78]">No upcoming consultations scheduled.</p>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* QUICK DOCUMENT PREVIEW MODAL */}
      <Dialog open={Boolean(previewRecord)} onOpenChange={(open) => !open && setPreviewRecord(null)}>
        {previewRecord && (
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <div className="flex items-center justify-between pr-8">
                <DialogTitle className="text-base">{previewRecord.title}</DialogTitle>
                <Badge variant="default" className="text-[10px] uppercase font-bold">
                  {previewRecord.category}
                </Badge>
              </div>
              <DialogDescription>
                {previewRecord.facility} • {previewRecord.doctorName} • {formatDeterministicDate(previewRecord.date)}
              </DialogDescription>
            </DialogHeader>

            <div className="my-3 space-y-3 max-h-[60vh] overflow-y-auto text-left text-xs">
              <div className="p-3 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 space-y-1">
                <div className="text-[10px] uppercase font-bold text-[#667A78]">Clinical Summary</div>
                <p className="text-[#19302F] leading-relaxed">{previewRecord.summary}</p>
              </div>

              {previewRecord.clinicalDetails?.findings && previewRecord.clinicalDetails.findings.length > 0 && (
                <div className="p-3 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 space-y-1.5">
                  <div className="text-[10px] uppercase font-bold text-[#176B67]">Observations & Measurements</div>
                  <ul className="space-y-1">
                    {previewRecord.clinicalDetails.findings.map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[#19302F]">
                        <span className="text-[#176B67] font-bold">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="p-3 rounded-xl bg-[#E6F3EF] border border-[#7BAE9D]/30 font-mono text-[11px] space-y-1">
                <div className="text-[9px] uppercase font-sans font-bold text-[#176B67] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#176B67]" />
                  <span>Cryptographic Integrity Digest</span>
                </div>
                <div className="text-[#19302F] break-all">SHA-256: {previewRecord.sha256Digest}</div>
                <div className="text-[#667A78] text-[10px]">Zero PHI Stored On-Chain</div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Link href="/dashboard/records" onClick={() => setPreviewRecord(null)}>
                <Button size="sm" className="bg-[#176B67] hover:bg-[#135855] text-white text-xs gap-1.5 font-bold shadow-xs">
                  <FileText className="w-3.5 h-3.5" />
                  <span>View in Records</span>
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => setPreviewRecord(null)} className="text-xs">
                Dismiss
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* UPLOAD REPORT MODAL */}
      <UploadReportModal open={uploadModalOpen} onOpenChange={setUploadModalOpen} />
    </div>
  );
}
