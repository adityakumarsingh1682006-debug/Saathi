"use client";

import React, { useState, useRef } from "react";
import NextLink from "next/link";
import { QRCodeSVG } from "qrcode.react";
import {
  Copy,
  Check,
  ShieldCheck,
  Heart,
  RefreshCw,
  QrCode,
  ExternalLink,
  Download,
  Printer,
  Calendar,
  User,
  MapPin,
  CreditCard,
  Link as LinkIcon,
  Phone,
  AlertCircle,
  FileText,
  Pill,
  Sparkles,
} from "lucide-react";
import { SaathiLogo } from "../ui/saathi-logo";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { useAppState } from "@/lib/store-context";
import { formatAddress } from "@/lib/blockchain/wallet";
import { CLINICAL_ANCHOR_TIME } from "@/lib/mock-data";

export function DigitalIdentityCard({
  interactive = true,
  defaultFlipped = false,
}: {
  interactive?: boolean;
  defaultFlipped?: boolean;
}) {
  const { patient, records, prescriptions, consultations, permissions, isLiveSepolia, showNotice } = useAppState();
  const [flipped, setFlipped] = useState(defaultFlipped);
  const [copied, setCopied] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const patientId = patient.patientId || "STHA-9F64-2817";
  const abhaId = patient.abhaId || "91-3847-5621-9083";
  const location = patient.location || "Kanchrapara, West Bengal";
  const bloodGroup = patient.bloodGroup || "B+";
  const allergiesText = patient.allergies && patient.allergies.length > 0 ? patient.allergies.join(", ") : "None Reported";
  const chronicText = patient.chronicConditions && patient.chronicConditions.length > 0 ? patient.chronicConditions.join(", ") : "Not Recorded";
  const consentStatus = permissions.some((p) => p.isActive) ? "Active" : "Locked";

  // Scoped authentication verification URL (Zero raw health data)
  const qrVerificationUrl = `https://saathi.health/verify/${patientId}?sig=${patient.walletAddress.slice(2, 10)}`;

  const handleCopyId = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(patientId);
    setCopied(true);
    showNotice(`Patient ID ${patientId} copied to clipboard`, "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPng = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const html2canvasModule = await import("html2canvas");
      const html2canvas = html2canvasModule.default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, // 3x high-resolution print quality
        useCORS: true,
        backgroundColor: null,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `SAATHI-Health-Card-${patientId}.png`;
      link.href = dataUrl;
      link.click();
      showNotice("High-resolution PVC card image downloaded", "success");
    } catch (err) {
      console.error("Export error:", err);
      showNotice("Could not export card. Please use browser print.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-[720px] mx-auto space-y-4">
      {/* 3D PERSPECTIVE CONTAINER (WITH MOBILE HORIZONTAL SWIPE SUPPORT) */}
      <div className="w-full overflow-x-auto sm:overflow-visible pb-1 scrollbar-none perspective-1000">
        <div
          ref={cardRef}
          onClick={() => interactive && setFlipped(!flipped)}
          className={`relative w-full min-w-[560px] sm:min-w-0 aspect-[1.586/1] rounded-[26px] sm:rounded-[30px] p-4 sm:p-6 transition-all duration-700 cursor-pointer select-none group border border-[#7BAE9D]/35 shadow-[0_16px_40px_rgba(23,107,103,0.14)] ${
            flipped ? "rotate-y-180" : ""
          } bg-[#F4FAF7] overflow-hidden hover:shadow-[0_24px_55px_rgba(23,107,103,0.22)] hover:-translate-y-1 transition-all duration-500`}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Flowing Organic Contour SVG Background Matching Reference Image */}
          <div className="absolute inset-0 pointer-events-none opacity-60 z-0">
            <svg
              className="w-full h-full"
              viewBox="0 0 660 416"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <path
                d="M-50 120 C180 80, 360 220, 710 140 L710 460 L-50 460 Z"
                fill="url(#waveGrad1)"
              />
              <path
                d="M-50 200 C150 160, 420 300, 710 240 L710 460 L-50 460 Z"
                fill="url(#waveGrad2)"
              />
              <path
                d="M-50 290 C220 250, 480 340, 710 320 L710 460 L-50 460 Z"
                fill="url(#waveGrad3)"
              />
              <defs>
                <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E6F3EF" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#D4ECE4" stopOpacity="0.5" />
                </linearGradient>
                <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7BAE9D" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#E6F3EF" stopOpacity="0.6" />
                </linearGradient>
                <linearGradient id="waveGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#176B67" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#7BAE9D" stopOpacity="0.12" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* FRONT SIDE OF THE CARD */}
          {!flipped ? (
            <div className="relative z-10 h-full flex flex-col justify-between text-left">
              {/* 1. TOP HEADER BAR */}
              <div className="flex items-center justify-between">
                {/* Left Branding */}
                <div className="flex items-center gap-2.5">
                  {/* Saathi Heart Pulse Icon */}
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white border border-[#7BAE9D]/30 flex items-center justify-center shadow-2xs shrink-0">
                    <svg viewBox="0 0 32 32" className="w-5 h-5 sm:w-6 sm:h-6 text-[#176B67]" fill="none" stroke="currentColor">
                      <path
                        d="M16 26s-10-6.5-10-13a6 6 0 0 1 10-4.24A6 6 0 0 1 26 13c0 6.5-10 13-10 13z"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="#E6F3EF"
                      />
                      <path
                        d="M10 14h2.5l2-4 3 8 2.5-4H22"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        stroke="#176B67"
                      />
                    </svg>
                  </div>

                  <div className="flex flex-col text-left">
                    <span className="text-base sm:text-2xl font-black tracking-tight text-[#19302F] leading-none">
                      SAATHI
                    </span>
                    <span className="text-[9px] sm:text-xs font-bold text-[#176B67] leading-tight tracking-wide mt-0.5">
                      Digital Health ID
                    </span>
                  </div>

                  {/* Vertical Divider */}
                  <div className="hidden sm:block h-7 w-px bg-[#7BAE9D]/35 mx-1" />

                  {/* Subtitle */}
                  <div className="hidden sm:block text-[10px] text-[#667A78] leading-tight">
                    <div>Unified Health Record</div>
                    <div>& Consent Management</div>
                  </div>
                </div>

                {/* Right Badge */}
                <div className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#176B67] text-white text-[10px] sm:text-xs font-bold shadow-xs">
                  Patient Health Card
                </div>
              </div>

              {/* 2. PATIENT MAIN MIDDLE SECTION */}
              <div className="flex items-center justify-between gap-3 sm:gap-4 my-auto">
                {/* Patient Photo Frame */}
                <div className="w-24 h-28 sm:w-32 sm:h-36 rounded-2xl border-[3px] border-white shadow-[0_4px_14px_rgba(23,107,103,0.12)] overflow-hidden bg-white shrink-0">
                  <img
                    src="/aditya-photo.png"
                    alt={patient.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Patient Info Fields */}
                <div className="flex-1 min-w-0 space-y-1 sm:space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-lg sm:text-2xl font-extrabold tracking-tight text-[#19302F] truncate">
                      {patient.name}
                    </h2>
                    {/* Teal Verified Badge */}
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#176B67] flex items-center justify-center shrink-0 shadow-2xs">
                      <Check className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-white stroke-[3]" />
                    </div>
                  </div>

                  <div className="space-y-0.5 text-[10px] sm:text-xs text-[#19302F]">
                    {/* DOB & Age */}
                    <div className="flex items-center gap-1.5 text-[#19302F] whitespace-nowrap">
                      <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#176B67] shrink-0" />
                      <span className="font-medium">16 Aug 2006</span>
                      <span className="text-[#667A78]">(19 years)</span>
                    </div>

                    {/* Gender */}
                    <div className="flex items-center gap-1.5 text-[#19302F]">
                      <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#176B67] shrink-0" />
                      <span className="font-medium">Male</span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-[#19302F] truncate">
                      <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#176B67] shrink-0" />
                      <span className="truncate">{location}</span>
                    </div>

                    {/* Patient ID */}
                    <div className="flex items-center gap-1.5 font-mono text-[#19302F]">
                      <CreditCard className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#176B67] shrink-0" />
                      <span>Patient ID: <strong>{patientId}</strong></span>
                    </div>

                    {/* ABHA ID */}
                    <div className="flex items-center gap-1.5 font-mono text-[#176B67] font-semibold">
                      <LinkIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#176B67] shrink-0" />
                      <span>ABHA ID: {abhaId}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Functional QR Code Section */}
                <div className="shrink-0 flex flex-col items-center space-y-1">
                  <div className="p-2 sm:p-2.5 rounded-2xl bg-white border border-[#7BAE9D]/30 shadow-xs flex items-center justify-center">
                    <QRCodeSVG
                      value={qrVerificationUrl}
                      size={90}
                      level="H"
                      bgColor="#FFFFFF"
                      fgColor="#19302F"
                      imageSettings={{
                        src: "/saathi-heart.svg",
                        x: undefined,
                        y: undefined,
                        height: 24,
                        width: 24,
                        excavate: true,
                      }}
                    />
                  </div>
                  <span className="text-[8px] sm:text-[9px] font-semibold text-[#19302F] px-2 py-0.5 rounded-full bg-white/90 border border-[#7BAE9D]/25">
                    Scan to Access Record
                  </span>
                </div>
              </div>

              {/* 3. MEDICAL INFORMATION STRIP */}
              <div className="rounded-xl sm:rounded-2xl bg-white/95 border border-[#7BAE9D]/30 shadow-xs p-2 sm:p-2.5 flex items-center justify-between text-xs">
                {/* Blood Group */}
                <div className="flex items-center gap-2 flex-1 px-1">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[#E6F3EF] border border-[#7BAE9D]/25 flex items-center justify-center text-[#176B67] shrink-0">
                    <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#176B67]" />
                  </div>
                  <div>
                    <div className="text-[9px] sm:text-[10px] text-[#667A78] uppercase font-bold leading-none">
                      Blood Group
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold text-[#19302F] mt-0.5 leading-none">
                      {bloodGroup}
                    </div>
                  </div>
                </div>

                <div className="h-6 w-px bg-[#7BAE9D]/25" />

                {/* Allergies */}
                <div className="flex items-center gap-2 flex-1 px-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[#E6F3EF] border border-[#7BAE9D]/25 flex items-center justify-center text-[#176B67] shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#176B67]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[9px] sm:text-[10px] text-[#667A78] uppercase font-bold leading-none">
                      Allergies
                    </div>
                    <div className="text-[11px] sm:text-xs font-bold text-[#176B67] truncate mt-0.5 leading-none">
                      {allergiesText}
                    </div>
                  </div>
                </div>

                <div className="h-6 w-px bg-[#7BAE9D]/25" />

                {/* Chronic Condition */}
                <div className="flex items-center gap-2 flex-1 px-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[#E6F3EF] border border-[#7BAE9D]/25 flex items-center justify-center text-[#176B67] shrink-0">
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#176B67]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[9px] sm:text-[10px] text-[#667A78] uppercase font-bold leading-none">
                      Chronic Condition
                    </div>
                    <div className="text-[11px] sm:text-xs font-bold text-[#176B67] truncate mt-0.5 leading-none">
                      {chronicText}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. BOTTOM DEEP TEAL INFORMATION STRIP */}
              <div className="rounded-xl sm:rounded-2xl bg-[#176B67] text-white p-2 sm:p-2.5 flex items-center justify-between text-xs shadow-xs">
                {/* Records Count */}
                <div className="flex items-center gap-2 flex-1 justify-center">
                  <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E6F3EF]" />
                  <div className="text-left leading-tight">
                    <span className="text-[9px] sm:text-[10px] opacity-80 block">Medical Records</span>
                    <span className="font-extrabold text-xs sm:text-sm font-mono">{records.length}</span>
                  </div>
                </div>

                <div className="h-5 w-px bg-white/20" />

                {/* Prescriptions Count */}
                <div className="flex items-center gap-2 flex-1 justify-center">
                  <Pill className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E6F3EF]" />
                  <div className="text-left leading-tight">
                    <span className="text-[9px] sm:text-[10px] opacity-80 block">Prescriptions</span>
                    <span className="font-extrabold text-xs sm:text-sm font-mono">{prescriptions.length}</span>
                  </div>
                </div>

                <div className="h-5 w-px bg-white/20" />

                {/* Consultations Count */}
                <div className="flex items-center gap-2 flex-1 justify-center">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E6F3EF]" />
                  <div className="text-left leading-tight">
                    <span className="text-[9px] sm:text-[10px] opacity-80 block">Consultations</span>
                    <span className="font-extrabold text-xs sm:text-sm font-mono">{consultations.length}</span>
                  </div>
                </div>

                <div className="h-5 w-px bg-white/20" />

                {/* Consent Status */}
                <div className="flex items-center gap-2 flex-1 justify-center">
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E6F3EF]" />
                  <div className="text-left leading-tight flex flex-col items-start">
                    <span className="text-[9px] sm:text-[10px] opacity-80 block">Consent Status</span>
                    <span className="px-2 py-0.2 rounded-full bg-[#E6F3EF] text-[#176B67] text-[10px] font-extrabold mt-0.5">
                      {consentStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* BACK SIDE OF THE CARD */
            <div className="relative z-10 h-full flex flex-col justify-between text-left [transform:rotateY(180deg)]">
              {/* Magnetic Stripe */}
              <div className="-mx-4 sm:-mx-6 -mt-4 sm:-mt-6 h-9 sm:h-11 bg-gradient-to-r from-neutral-800 via-neutral-900 to-neutral-800 shadow-inner" />

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between pb-2 border-b border-[#7BAE9D]/20">
                  <div className="flex items-center gap-2">
                    <SaathiLogo size="sm" showText={true} />
                    <span className="text-[10px] font-bold text-[#176B67]">| Sovereign Health Protocol</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#667A78]">Serial: #{patientId}</span>
                </div>

                {/* Emergency Contact */}
                <div className="p-3 rounded-xl bg-white/95 border border-[#7BAE9D]/25 space-y-1 text-xs">
                  <div className="text-[10px] uppercase font-bold text-[#176B67] flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#176B67]" />
                    <span>Emergency Contact (Break-Glass Recipient)</span>
                  </div>
                  <div className="font-bold text-[#19302F]">
                    {patient.emergencyContact?.name || "Sunita Sharma"} ({patient.emergencyContact?.relationship || "Mother"})
                  </div>
                  <div className="font-mono text-[11px] text-[#667A78]">
                    Phone: {patient.emergencyContact?.phone || "+91 98201 44521"}
                  </div>
                </div>

                {/* Privacy & Governance Notice */}
                <div className="p-3 rounded-xl bg-[#E6F3EF]/70 border border-[#7BAE9D]/30 text-[10px] text-[#19302F] space-y-1 leading-relaxed">
                  <div className="font-bold text-[#176B67]">Cryptographic Consent Governance Notice</div>
                  <p>
                    This sovereign PVC credential does not store personal health records (PHI) on the card surface or on public ledgers. 
                    Authorized healthcare providers scan the front QR code to issue an EIP-712 access challenge, requiring patient cryptographic consent.
                  </p>
                </div>
              </div>

              {/* Bottom Card Reverse Footer */}
              <div className="pt-2 border-t border-[#7BAE9D]/20 flex items-center justify-between text-[10px] text-[#667A78] font-mono">
                <div>Issue Date: 14 Nov 2026</div>
                <div>Status: Validated L3</div>
                <div>Sepolia Contract: 0x56382...21e3</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. INTERACTIVE ACTION TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-white border border-[#7BAE9D]/25 shadow-xs text-xs">
        <div className="flex items-center flex-wrap gap-2">
          {/* Flip Card Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFlipped(!flipped)}
            className="text-xs border-[#7BAE9D]/35 text-[#176B67] hover:bg-[#E6F3EF] gap-1.5 font-bold cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{flipped ? "Show Front Side" : "Flip to Back"}</span>
          </Button>

          {/* Copy Patient ID */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCopyId()}
            className="text-xs text-[#19302F] hover:bg-[#E6F3EF] gap-1.5 font-semibold cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy ID</span>
          </Button>

          {/* View Full Identity */}
          <NextLink href="/dashboard/identity">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-[#176B67] hover:bg-[#E6F3EF] gap-1.5 font-semibold cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Identity Details</span>
            </Button>
          </NextLink>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Verify Token Modal */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setVerifyModalOpen(true)}
            className="text-xs text-[#176B67] hover:bg-[#E6F3EF] gap-1.5 font-semibold cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Verify QR</span>
          </Button>

          {/* Download PNG */}
          <Button
            size="sm"
            disabled={isExporting}
            onClick={handleDownloadPng}
            className="bg-[#176B67] hover:bg-[#135855] text-white font-bold text-xs gap-1.5 shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? "Rendering..." : "Download PNG"}</span>
          </Button>

          {/* Print PDF / PVC */}
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrintCard}
            className="border-[#7BAE9D]/35 text-[#176B67] hover:bg-[#E6F3EF] text-xs font-semibold gap-1.5 cursor-pointer"
            title="Print or export as PDF (CR80 PVC format)"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PDF / Print</span>
          </Button>
        </div>
      </div>

      {/* QR VERIFICATION DETAILS MODAL */}
      <Dialog open={verifyModalOpen} onOpenChange={setVerifyModalOpen}>
        <DialogContent className="max-w-md text-left text-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <QrCode className="w-4 h-4 text-[#176B67]" />
              <span>Cryptographic QR Verification Protocol</span>
            </DialogTitle>
            <DialogDescription>
              How healthcare providers authenticate this sovereign identity card.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 my-2">
            <div className="p-3 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 space-y-1.5">
              <div className="text-[10px] uppercase font-bold text-[#176B67]">Decentralized DID & Wallet</div>
              <div className="font-mono text-[#19302F] break-all">{patient.did}</div>
              <div className="text-[11px] text-[#667A78]">Registered Address: {patient.walletAddress}</div>
            </div>

            <div className="p-3 rounded-xl bg-[#E6F3EF] border border-[#7BAE9D]/30 space-y-1 text-[11px]">
              <div className="font-bold text-[#176B67]">Privacy Guarantee</div>
              <p className="text-[#19302F]">
                The QR code encodes a dynamic challenge endpoint:
              </p>
              <div className="font-mono text-[10px] bg-white p-2 rounded-lg border border-[#7BAE9D]/25 break-all text-[#176B67]">
                {qrVerificationUrl}
              </div>
              <p className="text-[10px] text-[#667A78] pt-1">
                Zero clinical files, diagnoses, or prescriptions are visible until the patient signs an EIP-712 consent permit.
              </p>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button size="sm" onClick={() => setVerifyModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
