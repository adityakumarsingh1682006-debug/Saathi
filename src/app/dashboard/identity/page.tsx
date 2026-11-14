"use client";

import React, { useState } from "react";
import {
  Fingerprint,
  ShieldCheck,
  Award,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Calendar,
  Heart,
  AlertCircle,
  FileCheck,
  RefreshCw,
  Download,
  Key,
} from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DigitalIdentityCard } from "@/components/dashboard/identity-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAppState } from "@/lib/store-context";
import { VerifiableCredential } from "@/lib/blockchain/types";
import { formatAddress } from "@/lib/blockchain/wallet";
import { formatDeterministicDate } from "@/lib/date-utils";

export default function DigitalIdentityPage() {
  const { patient, credentials, wallet, connectWallet, isLiveSepolia, showNotice } = useAppState();
  const [copiedDid, setCopiedDid] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<VerifiableCredential | null>(null);

  const handleCopyDid = () => {
    navigator.clipboard.writeText(patient.did);
    setCopiedDid(true);
    showNotice("Decentralized Identifier (DID) copied", "success");
    setTimeout(() => setCopiedDid(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7FAF8] text-[#19302F]">
      <Topbar
        title="Digital Health Identity"
        subtitle="Self-Sovereign Decentralized Identifier (DID) & W3C Verifiable Credentials"
      />

      <div className="p-6 max-w-7xl mx-auto w-full space-y-8 text-left">
        {/* TOP HERO SHOWCASE: CR80 PVC SOVEREIGN HEALTH IDENTITY CARD */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="flex items-center justify-between w-full max-w-[720px] px-1">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#176B67]">
                Universal CR80 PVC Health ID Pass
              </span>
              <p className="text-[11px] text-[#667A78]">Standard ID-1 Format (85.60 × 53.98 mm) • Click card to flip</p>
            </div>
            <Badge variant="default" dot>
              {isLiveSepolia ? "Sepolia Anchored" : "DEMO STATE"}
            </Badge>
          </div>

          {/* Full CR80 PVC Card Presentation */}
          <DigitalIdentityCard interactive={true} defaultFlipped={false} />
        </div>

        {/* PROFILE OVERVIEW & CRYPTOGRAPHIC ANCHORS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Profile Overview */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="p-6 border-[#7BAE9D]/25 bg-white/95 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#7BAE9D]/20 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-[#176B67] bg-[#E6F3EF] flex items-center justify-center shrink-0 shadow-xs">
                    <img
                      src={patient.photoUrl || "/aditya-photo.png"}
                      alt={patient.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#19302F] flex items-center gap-2">
                      {patient.name}
                      <ShieldCheck className="w-5 h-5 text-[#176B67]" />
                    </h2>
                    <p className="text-xs font-mono text-[#667A78]">{patient.did}</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyDid}
                  className="gap-2 border-[#7BAE9D]/35 text-xs text-[#19302F] hover:bg-[#E6F3EF]"
                >
                  {copiedDid ? <Check className="w-3.5 h-3.5 text-[#176B67]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDid ? "Copied" : "Copy DID"}</span>
                </Button>
              </div>

              {/* Demographics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 space-y-1">
                  <span className="text-[10px] text-[#667A78] uppercase font-bold">Blood Group</span>
                  <div className="text-sm font-bold text-[#176B67] font-mono">{patient.bloodGroup || "B+"}</div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 space-y-1">
                  <span className="text-[10px] text-[#667A78] uppercase font-bold">Date of Birth</span>
                  <div className="text-sm font-semibold text-[#19302F]">16 Aug 2006</div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 space-y-1">
                  <span className="text-[10px] text-[#667A78] uppercase font-bold">Age & Gender</span>
                  <div className="text-sm font-semibold text-[#19302F]">19y • Male</div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 space-y-1">
                  <span className="text-[10px] text-[#667A78] uppercase font-bold">Organ Donor</span>
                  <div className="text-sm font-bold text-[#176B67] flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 fill-[#176B67]" />
                    NOTTO Reg
                  </div>
                </div>
              </div>

              {/* Critical Clinical Alerts */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[#176B67] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#176B67]" />
                  Documented Medical Alerts & Allergies
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-lg bg-[#E6F3EF] border border-[#7BAE9D]/30 text-xs font-medium text-[#176B67]">
                    None Reported
                  </span>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="pt-2 border-t border-[#7BAE9D]/15 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                <div>
                  <span className="text-[#667A78]">Designated Emergency Contact:</span>
                  <span className="font-semibold text-[#19302F] ml-1.5">
                    Sunita Sharma (Mother)
                  </span>
                </div>
                <span className="font-mono text-[#176B67] font-semibold">+91 98201 44521</span>
              </div>
            </Card>
          </div>

          {/* Cryptographic Registry Info */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-[#7BAE9D]/30 space-y-4 text-xs shadow-sm">
              <h3 className="font-bold text-sm text-[#19302F] pb-2 border-b border-[#7BAE9D]/15 flex items-center gap-2">
                <Key className="w-4 h-4 text-[#176B67]" />
                <span>Cryptographic Identity Trust</span>
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#667A78]">Wallet Public Key:</span>
                  <span className="font-mono text-[#176B67] font-semibold">{formatAddress(patient.walletAddress, 6)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#667A78]">Network Standard:</span>
                  <span className="font-mono text-[#19302F] font-bold">ERC-1056 / EIP-712</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#667A78]">ABHA Registration:</span>
                  <span className="font-mono text-[#176B67] font-bold">{patient.abhaId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#667A78]">Verification Level:</span>
                  <span className="font-bold text-[#176B67] bg-[#E6F3EF] px-2.5 py-0.5 rounded-full border border-[#7BAE9D]/25">
                    Level 3 Verified
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#667A78]">Card Serial ID:</span>
                  <span className="font-mono font-bold text-[#19302F]">STHA-9F64-2817</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* VERIFIABLE CREDENTIALS SECTION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#19302F] flex items-center gap-2">
                <Award className="w-5 h-5 text-[#176B67]" />
                W3C Verifiable Credentials
              </h2>
              <p className="text-xs text-[#667A78]">
                Cryptographically attested health claims anchored on-chain by accredited issuers.
              </p>
            </div>
            <Badge variant="default" className="text-xs font-bold">
              {credentials.length} Attested Credentials
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {credentials.map((cred) => (
              <Card
                key={cred.id}
                className="p-5 border-[#7BAE9D]/25 bg-white/95 hover:border-[#176B67]/40 transition-all flex flex-col justify-between group shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={cred.status === "Valid" ? "success" : "destructive"} dot>
                      {cred.status}
                    </Badge>
                    <span className="text-[10px] text-[#667A78] font-mono font-medium">
                      {formatDeterministicDate(cred.issuedAt)}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#19302F] group-hover:text-[#176B67] transition-colors">
                      {cred.title}
                    </h3>
                    <p className="text-xs text-[#667A78] mt-1">{cred.issuerName}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 space-y-1.5 text-xs font-mono">
                    {Object.entries(cred.claims).slice(0, 2).map(([key, val]) => (
                      <div key={key} className="flex justify-between items-center text-[11px]">
                        <span className="text-[#667A78] truncate max-w-[120px]">{key.replace(/_/g, " ")}:</span>
                        <span className="text-[#176B67] font-bold truncate max-w-[150px]">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#7BAE9D]/15 flex items-center justify-between mt-4">
                  <span className="text-[10px] font-mono text-[#667A78] truncate max-w-[180px]">
                    Hash: {formatAddress(cred.credentialHash, 6)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCredential(cred)}
                    className="text-xs text-[#176B67] hover:bg-[#E6F3EF] p-1 font-bold"
                  >
                    View Proof →
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* IDENTITY ACTIVITY & AUDIT TRAIL */}
        <Card className="p-6 border-[#7BAE9D]/25 bg-white/95 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#7BAE9D]/15">
            <div>
              <CardTitle>Identity Cryptographic Audit Log</CardTitle>
              <CardDescription>Immutable record of authentication challenges and key assertions</CardDescription>
            </div>
            <Badge variant="default" className="text-[10px]">Zero Tamper</Badge>
          </div>

          <div className="space-y-3 text-xs">
            {[
              {
                event: "EIP-712 Challenge Signed",
                target: "Hospital QR Check-in Terminal (Max Super Speciality)",
                time: "Today at 08:45 AM",
                hash: "0x88f1...3921",
              },
              {
                event: "Verifiable Credential Anchor Sync",
                target: "Apollo Hospitals Clinical Attestation Registry",
                time: "Yesterday at 04:12 PM",
                hash: "0x44a1...9911",
              },
              {
                event: "ABHA Biometric Verification Refreshed",
                target: "National Health Authority ABDM Gateway",
                time: "Nov 02, 2026",
                hash: "0x91b2...7741",
              },
            ].map((log, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="font-bold text-[#19302F]">{log.event}</div>
                  <div className="text-[#667A78] text-[11px]">{log.target}</div>
                </div>
                <div className="flex items-center gap-4 text-[#667A78] text-[11px] font-mono">
                  <span>{log.time}</span>
                  <span className="text-[#176B67] font-bold">{log.hash}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* CREDENTIAL PROOF MODAL */}
      <Dialog open={Boolean(selectedCredential)} onOpenChange={(open) => !open && setSelectedCredential(null)}>
        {selectedCredential && (
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{selectedCredential.title}</DialogTitle>
              <DialogDescription>
                Issued by {selectedCredential.issuerName} • Type: {selectedCredential.type}
              </DialogDescription>
            </DialogHeader>

            <div className="my-3 space-y-4 max-h-[60vh] overflow-y-auto text-left">
              <div className="p-4 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/30 space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#176B67]">Attested Claims</span>
                <div className="divide-y divide-[#7BAE9D]/15 text-xs">
                  {Object.entries(selectedCredential.claims).map(([k, v]) => (
                    <div key={k} className="py-2 flex justify-between items-center">
                      <span className="text-[#667A78] font-medium">{k.replace(/_/g, " ")}</span>
                      <span className="text-[#19302F] font-mono font-bold">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#E6F3EF] border border-[#7BAE9D]/30 text-[11px] font-mono space-y-1">
                <div className="text-[10px] uppercase font-sans font-bold text-[#176B67]">
                  Cryptographic Status Digest
                </div>
                <div className="text-[#667A78] break-all">Digest: {selectedCredential.credentialHash}</div>
                <div className="text-[#667A78]">Issuer Address: {selectedCredential.issuerAddress}</div>
                <div className="text-[#176B67] font-bold pt-1">On-Chain State: VERIFIED VALID</div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#7BAE9D]/20">
              <Button size="sm" onClick={() => setSelectedCredential(null)}>
                Dismiss
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
