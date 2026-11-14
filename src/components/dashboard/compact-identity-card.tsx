"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, ShieldCheck, QrCode, ExternalLink, Fingerprint } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useAppState } from "@/lib/store-context";
import { formatAddress } from "@/lib/blockchain/wallet";
import { CLINICAL_ANCHOR_TIME } from "@/lib/mock-data";

export function CompactIdentityCard() {
  const { patient, isLiveSepolia, showNotice } = useAppState();
  const [copied, setCopied] = useState(false);

  // Scoped authentication token payload for QR code (Zero raw health data)
  const qrPayload = JSON.stringify({
    protocol: "saathi-did-v1",
    did: patient.did,
    abha: patient.abhaId,
    timestamp: CLINICAL_ANCHOR_TIME,
    challengeNonce: "0x98f2b...8a12",
    verifyEndpoint: "https://saathi.health/api/verify-token",
  });

  const handleCopyDid = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(patient.did);
    setCopied(true);
    showNotice("Decentralized ID copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-[#7BAE9D]/30 bg-white p-5 shadow-xs text-left space-y-4">
      {/* Header Row */}
      <div className="flex items-center justify-between pb-3 border-b border-[#7BAE9D]/15">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#E6F3EF] text-[#176B67]">
            <Fingerprint className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#176B67]">Digital Health Pass</h3>
            <p className="text-[11px] text-[#667A78]">ABDM & EIP-712 Sovereign Identity</p>
          </div>
        </div>
        <Badge variant={isLiveSepolia ? "success" : "default"} dot className="text-[10px]">
          {isLiveSepolia ? "Sepolia L1 Verified" : "Active Pass"}
        </Badge>
      </div>

      {/* Main Info with QR Code */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="text-base font-bold text-[#19302F] truncate">{patient.name}</div>
          <div className="text-xs font-mono font-semibold text-[#176B67] truncate">
            ABHA: {patient.abhaId}
          </div>
          <div className="text-[11px] text-[#667A78] flex flex-wrap gap-x-2 gap-y-0.5">
            <span>Blood Group: <strong className="text-[#19302F]">{patient.bloodGroup}</strong></span>
            <span>•</span>
            <span>DOB: <strong className="text-[#19302F]">{patient.dob}</strong></span>
          </div>
          <div className="pt-1 flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-[#667A78] truncate max-w-[150px]">
              {formatAddress(patient.did, 6)}
            </span>
            <button
              onClick={handleCopyDid}
              className="text-[#176B67] hover:text-[#135855] p-0.5 rounded cursor-pointer transition-colors"
              title="Copy DID"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Crisp QR Code Container */}
        <div className="p-2 rounded-xl bg-white border border-[#7BAE9D]/30 shadow-xs shrink-0 flex items-center justify-center">
          <QRCodeSVG
            value={qrPayload}
            size={76}
            level="M"
            bgColor="#FFFFFF"
            fgColor="#176B67"
          />
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="p-2.5 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 text-[#667A78]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#176B67]" />
          <span>Zero Health Data on QR</span>
        </div>
        <a
          href="/dashboard/identity"
          className="text-[#176B67] font-semibold hover:underline text-[11px] flex items-center gap-1"
        >
          <span>Credentials ({patient.kycTier.includes("3") ? "Verified" : "Level 1"})</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
