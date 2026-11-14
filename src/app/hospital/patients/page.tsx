"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users2,
  FileText,
  Lock,
  Unlock,
  ShieldCheck,
  Eye,
  Calendar,
  AlertTriangle,
  ArrowLeft,
  Building2,
  ExternalLink,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAppState } from "@/lib/store-context";
import { MedicalRecord } from "@/lib/mock-data";
import { formatDeterministicDate } from "@/lib/date-utils";

export default function HospitalPatientsPage() {
  const { patient, records, permissions } = useAppState();

  const [previewRecord, setPreviewRecord] = useState<MedicalRecord | null>(null);

  // Check consent for Dr. Ananya Sharma / Max Healthcare
  const hospitalConsent = permissions.find(
    (p) =>
      p.isActive &&
      (p.providerName.includes("Max") || p.provider.toLowerCase().includes("0x3c44"))
  );

  const grantedScopes = hospitalConsent?.scopes || [];

  // Map category to scope
  const isCategoryAllowed = (cat: MedicalRecord["category"]) => {
    if (grantedScopes.includes("FULL_HISTORY")) return true;
    if (cat === "lab" && grantedScopes.includes("LABS")) return true;
    if (cat === "prescription" && grantedScopes.includes("PRESCRIPTIONS")) return true;
    if (cat === "consultation" && grantedScopes.includes("CONSULTATIONS")) return true;
    if (cat === "imaging" && grantedScopes.includes("IMAGING")) return true;
    return false;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7FAF8] text-[#19302F]">
      <header className="px-6 py-4 bg-white/85 backdrop-blur-xl border-b border-[#7BAE9D]/25 flex items-center justify-between">
        <div className="text-left">
          <h1 className="text-xl font-bold text-[#19302F]">Authorized Patient Clinical File</h1>
          <p className="text-xs text-[#667A78]">
            Records decrypted according to active patient consent grant.
          </p>
        </div>
        <Link href="/hospital">
          <Button variant="outline" size="sm" className="text-xs border-[#7BAE9D]/35 text-[#176B67] hover:bg-[#E6F3EF] gap-1.5 font-bold">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Triage Scanner</span>
          </Button>
        </Link>
      </header>

      <div className="p-6 max-w-7xl mx-auto w-full space-y-6 text-left">
        {/* PATIENT HEADER SUMMARY */}
        <div className="p-5 rounded-2xl bg-white border border-[#7BAE9D]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#176B67] flex items-center justify-center text-white text-lg font-bold shadow-xs">
              {patient.name.charAt(0)}
            </div>
            <div>
              <div className="text-base font-bold text-[#19302F] flex items-center gap-2">
                {patient.name}
                <Badge variant="success" className="text-[10px]" dot>
                  Biometric ABHA Verified
                </Badge>
              </div>
              <div className="text-xs font-mono text-[#176B67] font-semibold">{patient.abhaId}</div>
              <div className="text-[11px] text-[#667A78]">
                Blood Group: {patient.bloodGroup} • DOB: {patient.dob} ({patient.age}y)
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <div className="text-[10px] text-[#667A78] uppercase font-bold">Active Consent Status</div>
            {hospitalConsent ? (
              <Badge variant="success" dot className="text-xs font-semibold">
                Valid Until {formatDeterministicDate(hospitalConsent.validUntil)}
              </Badge>
            ) : (
              <Badge variant="destructive" dot className="text-xs font-semibold">
                No Active Consent (Locked)
              </Badge>
            )}
            <div className="text-[10px] font-mono text-[#667A78]">
              Permitted: {grantedScopes.join(", ") || "None"}
            </div>
          </div>
        </div>

        {/* CLINICAL RECORDS LIST WITH CONSENT ENFORCEMENT */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#19302F]">Patient Clinical Archive ({records.length})</h2>
            <span className="text-xs text-[#667A78]">Locked scopes require patient authorization</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {records.map((record) => {
              const allowed = isCategoryAllowed(record.category);

              return (
                <Card
                  key={record.id}
                  className={`p-5 border transition-all ${
                    allowed
                      ? "border-[#7BAE9D]/30 bg-white shadow-xs hover:border-[#176B67]/40"
                      : "border-[#7BAE9D]/15 opacity-60 bg-[#F7FAF8]"
                  } space-y-3`}
                >
                  <div className="flex items-start justify-between">
                    <Badge variant={allowed ? "default" : "secondary"} className="text-[10px] uppercase font-bold">
                      {record.category}
                    </Badge>
                    <span className="text-xs flex items-center gap-1 font-semibold">
                      {allowed ? (
                        <span className="text-[#176B67] flex items-center gap-1 text-[11px] font-bold">
                          <Unlock className="w-3.5 h-3.5" />
                          Consented
                        </span>
                      ) : (
                        <span className="text-[#667A78] flex items-center gap-1 text-[11px]">
                          <Lock className="w-3.5 h-3.5" />
                          Scope Locked
                        </span>
                      )}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#19302F]">{record.title}</h3>
                    <p className="text-xs text-[#667A78] mt-0.5">{record.facility} • {record.date}</p>
                  </div>

                  {allowed ? (
                    <div className="space-y-2">
                      <p className="text-xs text-[#19302F] bg-[#F7FAF8] p-3 rounded-xl border border-[#7BAE9D]/20 leading-relaxed">
                        {record.summary}
                      </p>
                      <div className="pt-2 flex justify-end">
                        <Button
                          size="sm"
                          onClick={() => setPreviewRecord(record)}
                          className="bg-[#176B67] hover:bg-[#135855] text-white text-xs gap-1.5 font-bold shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Full Clinical Record</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-white border border-[#7BAE9D]/20 text-xs text-[#667A78] space-y-2">
                      <p>
                        This record category is restricted. You must request patient authorization.
                      </p>
                      <Link href="/hospital/requests">
                        <span className="text-xs text-[#176B67] font-bold hover:underline">
                          Request scope access →
                        </span>
                      </Link>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* RECORD PREVIEW DIALOG */}
      <Dialog open={Boolean(previewRecord)} onOpenChange={(open) => !open && setPreviewRecord(null)}>
        {previewRecord && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-center justify-between pr-8">
                <DialogTitle>{previewRecord.title}</DialogTitle>
                <Badge variant="default" className="text-[10px] uppercase font-bold">
                  {previewRecord.category}
                </Badge>
              </div>
              <DialogDescription>
                {previewRecord.facility} • {previewRecord.doctorName} • {previewRecord.date}
              </DialogDescription>
            </DialogHeader>

            <div className="my-3 space-y-4 max-h-[60vh] overflow-y-auto pr-1 text-left">
              <div className="p-3.5 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/25 space-y-1">
                <div className="text-[10px] uppercase font-bold text-[#667A78]">Clinical Summary</div>
                <p className="text-xs text-[#19302F] leading-relaxed">{previewRecord.summary}</p>
              </div>

              {previewRecord.clinicalDetails.findings.length > 0 && (
                <div className="p-3.5 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/25 space-y-2">
                  <div className="text-[10px] uppercase font-bold text-[#176B67]">Specific Findings & Values</div>
                  <ul className="space-y-1 text-xs text-[#19302F]">
                    {previewRecord.clinicalDetails.findings.map((finding, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#176B67]">•</span>
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {previewRecord.clinicalDetails.medications && (
                <div className="p-3.5 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/25 space-y-2">
                  <div className="text-[10px] uppercase font-bold text-[#176B67]">Prescriptions</div>
                  <div className="space-y-1.5">
                    {previewRecord.clinicalDetails.medications.map((med, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs p-2.5 rounded-lg bg-white border border-[#7BAE9D]/20 shadow-2xs">
                        <span className="font-bold text-[#19302F]">{med.name}</span>
                        <span className="text-[#667A78]">{med.dosage} ({med.frequency})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-[#E6F3EF] border border-[#7BAE9D]/30 text-[11px] font-mono space-y-1">
                <div className="text-[10px] uppercase font-sans font-bold text-[#176B67] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#176B67]" />
                  <span>Verified Against On-Chain Cryptographic Digest</span>
                </div>
                <div className="text-[#19302F] break-all">Digest: {previewRecord.sha256Digest}</div>
                <div className="text-[#667A78] text-[10px]">Sepolia Anchor Block: #{previewRecord.blockNumber}</div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#7BAE9D]/20">
              <Button size="sm" onClick={() => setPreviewRecord(null)} className="bg-[#176B67] hover:bg-[#135855] text-white font-bold">
                Dismiss Record
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
