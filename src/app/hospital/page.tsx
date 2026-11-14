"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  QrCode,
  Search,
  ShieldCheck,
  Building2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  ArrowRight,
  Clock,
  Sparkles,
  Camera,
  RefreshCw,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppState } from "@/lib/store-context";
import { formatAddress } from "@/lib/blockchain/wallet";

export default function HospitalTriagePage() {
  const { patient, records, permissions, showNotice } = useAppState();

  const [scannedInput, setScannedInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [scanResult, setScanResult] = useState<{
    matched: boolean;
    hasConsent: boolean;
    permittedScopes: string[];
  } | null>(null);

  const handleSimulateScan = () => {
    setIsVerifying(true);
    setScannedInput(patient.did);

    setTimeout(() => {
      setIsVerifying(false);
      const activeConsent = permissions.find(
        (p) =>
          p.isActive &&
          (p.providerName.includes("Max") || p.provider.includes("0x3C44"))
      );

      setScanResult({
        matched: true,
        hasConsent: Boolean(activeConsent),
        permittedScopes: activeConsent?.scopes || [],
      });

      if (activeConsent) {
        showNotice("Patient identity verified with active consent grant", "success");
      } else {
        showNotice("Identity verified, but NO active consent found on smart contract", "error");
      }
    }, 1200);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7FAF8] text-[#19302F]">
      {/* Top Hospital Header */}
      <header className="px-6 py-4 bg-white/85 backdrop-blur-xl border-b border-[#7BAE9D]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#19302F]">Triage & Patient QR Ingestion</h1>
            <Badge variant="default" className="text-[10px] font-bold">
              NABH Terminal #4
            </Badge>
          </div>
          <p className="text-xs text-[#667A78]">
            Scan patient universal pass to verify identity and query cryptographically consented records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="success" dot className="text-xs font-semibold">
            Accreditation Valid (Sepolia #681502)
          </Badge>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto w-full space-y-8 text-left">
        {/* PRIVACY MANDATE REMINDER */}
        <div className="p-4 rounded-2xl bg-[#E6F3EF] border border-[#7BAE9D]/35 flex items-start gap-3 shadow-xs">
          <ShieldCheck className="w-5 h-5 text-[#176B67] shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-bold text-[#19302F] block">Cryptographic Access Enforcement</span>
            <p className="text-[#667A78] leading-relaxed">
              Hospital personnel cannot unilaterally browse patient files. 
              The application queries the <strong>ConsentRegistry</strong> smart contract with your accredited provider address. 
              Only categories explicitly approved by the patient will be decrypted.
            </p>
          </div>
        </div>

        {/* SCANNER WORKFLOW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT 6 COLS: SCANNER CONTROLS */}
          <div className="lg:col-span-6 space-y-6">
            <Card className="p-6 border-[#7BAE9D]/25 bg-white/95 space-y-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[#7BAE9D]/15">
                <CardTitle className="text-sm">Patient QR Handshake Scanner</CardTitle>
                <Badge variant="outline" className="text-[10px]">
                  Zero-PII Token
                </Badge>
              </div>

              {/* Camera Simulation Viewport */}
              <div className="relative aspect-video rounded-2xl bg-[#F7FAF8] border border-[#7BAE9D]/30 flex flex-col items-center justify-center p-6 text-center overflow-hidden group">
                {/* Target Reticle */}
                <div className="relative w-44 h-44 border-2 border-[#176B67]/40 rounded-2xl flex items-center justify-center bg-white/60 shadow-inner">
                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#176B67]" />
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#176B67]" />
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#176B67]" />
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#176B67]" />
                  
                  <Camera className="w-12 h-12 text-[#7BAE9D] group-hover:text-[#176B67] transition-colors" />
                </div>

                <div className="mt-4 text-xs font-semibold text-[#667A78]">
                  Align patient QR code within frame
                </div>
              </div>

              {/* Manual Input or Quick Simulation */}
              <div className="space-y-3 text-left">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#19302F]">
                    Or Enter Patient DID / Scanned Challenge Token
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="did:saathi:sep:0x..."
                      value={scannedInput}
                      onChange={(e) => setScannedInput(e.target.value)}
                      className="text-xs font-mono bg-white border-[#7BAE9D]/30"
                    />
                    <Button
                      onClick={handleSimulateScan}
                      disabled={isVerifying}
                      className="bg-[#176B67] hover:bg-[#135855] text-white font-bold text-xs gap-1.5 shrink-0 shadow-xs"
                    >
                      {isVerifying ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Checking Contract...</span>
                        </>
                      ) : (
                        <>
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Simulate Scan</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <p className="text-[11px] text-[#667A78]">
                  Click &ldquo;Simulate Scan&rdquo; to test the real handshake against patient {patient.name}.
                </p>
              </div>
            </Card>
          </div>

          {/* RIGHT 6 COLS: SCAN & CONTRACT VERIFICATION RESULT */}
          <div className="lg:col-span-6 space-y-6">
            {scanResult ? (
              <Card
                className={`p-6 border ${
                  scanResult.hasConsent
                    ? "border-emerald-500/40 bg-white/95"
                    : "border-[#C98A28]/40 bg-white/95"
                } space-y-6 shadow-sm`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#7BAE9D]/15">
                  <div className="flex items-center gap-2">
                    {scanResult.hasConsent ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-[#C98A28]" />
                    )}
                    <span className="text-sm font-bold text-[#19302F]">
                      {scanResult.hasConsent
                        ? "Consent Verified on Sepolia"
                        : "No Active Consent Grant"}
                    </span>
                  </div>
                  <Badge variant={scanResult.hasConsent ? "success" : "warning"} dot>
                    {scanResult.hasConsent ? "Access Authorized" : "Access Blocked"}
                  </Badge>
                </div>

                <div className="space-y-3 text-xs text-left">
                  <div className="p-3.5 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 space-y-1">
                    <span className="text-[10px] text-[#667A78] uppercase font-bold">Identified Patient</span>
                    <div className="text-base font-bold text-[#19302F]">{patient.name}</div>
                    <div className="text-xs text-[#176B67] font-mono font-semibold">ABHA: {patient.abhaId}</div>
                    <div className="text-[11px] text-[#667A78]">Blood Group: {patient.bloodGroup} • Age: {patient.age}y</div>
                  </div>

                  {scanResult.hasConsent ? (
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-[#176B67]">
                        Permitted Clinical Scopes:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {scanResult.permittedScopes.map((scope) => (
                          <span
                            key={scope}
                            className="px-2.5 py-1 rounded-lg bg-[#E6F3EF] text-[#176B67] font-mono text-xs font-bold border border-[#7BAE9D]/30"
                          >
                            {scope}
                          </span>
                        ))}
                      </div>

                      <div className="pt-4">
                        <Link href="/hospital/patients">
                          <Button className="w-full bg-[#176B67] hover:bg-[#135855] text-white font-bold text-xs gap-2 shadow-xs">
                            <span>Open Authorized Patient Records</span>
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-[#667A78] leading-relaxed">
                        The patient has not granted consent to Dr. Ananya Sharma or the consent duration has expired.
                      </p>
                      <div className="flex items-center gap-3">
                        <Link href="/hospital/requests" className="flex-1">
                          <Button size="sm" className="w-full bg-[#176B67] hover:bg-[#135855] text-white font-bold text-xs shadow-xs">
                            Send Access Request to Patient
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <div className="py-20 text-center rounded-3xl bg-white border border-[#7BAE9D]/25 space-y-3 p-6 shadow-xs">
                <QrCode className="w-12 h-12 text-[#7BAE9D] mx-auto" />
                <div className="text-sm font-bold text-[#19302F]">Awaiting Patient Scan</div>
                <p className="text-xs text-[#667A78] max-w-sm mx-auto">
                  Scan a physical patient card or mobile QR pass to evaluate live consent on Ethereum Sepolia.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
