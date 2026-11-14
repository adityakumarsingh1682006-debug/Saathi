"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  QrCode,
  ArrowRight,
  Activity,
  HeartPulse,
  KeyRound,
  FileCheck2,
  Building2,
  AlertTriangle,
  Layers,
  ChevronRight,
  ExternalLink,
  Cpu,
  CheckCircle2,
} from "lucide-react";
import { SaathiLogo } from "@/components/ui/saathi-logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SaathiIdentityCard3D } from "@/components/3d/saathi-identity-card-3d";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F7FAF8] text-[#19302F] selection:bg-[#7BAE9D]/30 selection:text-[#176B67] overflow-x-hidden font-sans">
      {/* Background peaceful ambient lighting inspired by MediKey */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-b from-[#E6F3EF] via-[#7BAE9D]/12 to-transparent blur-[120px]" />
        <div className="absolute top-[850px] right-[-80px] w-[500px] h-[500px] bg-[#7BAE9D]/10 blur-[130px]" />
        <div className="absolute top-[1700px] left-[-100px] w-[600px] h-[600px] bg-[#E6F3EF]/70 blur-[140px]" />
      </div>

      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/80 border-b border-[#7BAE9D]/25 px-6 py-4 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="hover:opacity-95 transition-opacity">
            <SaathiLogo size="md" tagline={true} />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#667A78]">
            <a href="#how-it-works" className="hover:text-[#176B67] transition-colors">How it Works</a>
            <a href="#identity" className="hover:text-[#176B67] transition-colors">Digital Identity</a>
            <a href="#consent" className="hover:text-[#176B67] transition-colors">Consent Engine</a>
            <a href="#hospitals" className="hover:text-[#176B67] transition-colors">For Providers</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/hospital">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex text-[#176B67] border-[#7BAE9D]/40 hover:bg-[#E6F3EF]">
                <Building2 className="w-3.5 h-3.5 mr-1" />
                Hospital Portal
              </Button>
            </Link>

            <Link href="/dashboard">
              <Button size="sm" className="bg-[#176B67] hover:bg-[#135855] text-white font-semibold shadow-sm">
                Launch Patient App
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION — REDESIGNED WITH 3D SAATHI DIGITAL HEALTH IDENTITY CARD */}
      <section className="relative z-10 pt-16 pb-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-6 space-y-7 text-left">
            {/* Small Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E6F3EF] border border-[#7BAE9D]/35 text-xs font-bold text-[#176B67] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#176B67] animate-pulse" />
              YOUR PERSONAL HEALTH COMPANION
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#19302F] leading-[1.12]">
              Your health.<br />
              <span className="text-[#176B67]">Your identity.</span><br />
              Your control.
            </h1>

            {/* Supporting Description */}
            <p className="text-base sm:text-lg text-[#667A78] max-w-xl leading-relaxed">
              One secure digital identity for your healthcare journey. Manage medical records, control access and connect with healthcare providers on your terms.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/dashboard">
                <Button size="lg" className="h-12 px-7 bg-[#176B67] hover:bg-[#135855] text-white font-bold rounded-xl shadow-md gap-2">
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              <Link href="/hospital">
                <Button variant="secondary" size="lg" className="h-12 px-6 bg-[#E6F3EF] hover:bg-[#d5ece4] text-[#176B67] border border-[#7BAE9D]/40 font-bold rounded-xl gap-2 shadow-xs">
                  <Building2 className="w-4 h-4 text-[#176B67]" />
                  <span>Explore Platform</span>
                </Button>
              </Link>
            </div>

            {/* Key Trust Pillars */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#7BAE9D]/20 text-xs font-semibold text-[#667A78]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#176B67] shrink-0" />
                <span>Zero PII On-Chain</span>
              </div>
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#7BAE9D] shrink-0" />
                <span>EIP-712 Scoped Consent</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#176B67] shrink-0" />
                <span>ABHA & FHIR Ready</span>
              </div>
            </div>
          </div>

          {/* Hero Right: 3D SAATHI Digital Health Identity Card */}
          <div className="lg:col-span-6 relative flex flex-col items-center justify-center">
            <div className="w-full max-w-lg aspect-[1.4/1] sm:aspect-[1.5/1] flex items-center justify-center">
              <SaathiIdentityCard3D className="w-full h-80 sm:h-96" />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: HOW SAATHI WORKS */}
      <section id="how-it-works" className="relative z-10 py-24 px-6 border-t border-[#7BAE9D]/20 bg-white/70">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <Badge variant="default">System Architecture</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#19302F]">
              How decentralized healthcare identity works
            </h2>
            <p className="text-[#667A78] text-sm sm:text-base leading-relaxed">
              Medical records are encrypted locally with client-side keys. Only cryptographic proofs and time-limited consent permits are anchored on Ethereum Sepolia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
            {[
              {
                step: "01",
                icon: KeyRound,
                title: "Self-Sovereign DID",
                desc: "A tamper-proof decentralized identity is minted and anchored to your biometric ABHA, owned solely by your private key.",
              },
              {
                step: "02",
                icon: Lock,
                title: "Local Encryption",
                desc: "Lab reports and prescriptions are encrypted with SHA-256 IPFS content digests. No raw medical data ever touches the blockchain.",
              },
              {
                step: "03",
                icon: FileCheck2,
                title: "EIP-712 Consent Gate",
                desc: "You grant specific scopes (e.g. Labs only) and precise durations (e.g. 24h) via nonced cryptographic permits.",
              },
              {
                step: "04",
                icon: AlertTriangle,
                title: "Audited Break-Glass",
                desc: "Accredited trauma units can unlock pre-configured critical emergency scopes, leaving an immutable, notified audit trail.",
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <Card key={card.step} className="p-6 relative group border-[#7BAE9D]/25 bg-white/90 hover:border-[#176B67]/45 transition-all">
                  <div className="text-4xl font-black text-[#E6F3EF] font-mono mb-4 group-hover:text-[#7BAE9D]/30 transition-colors">
                    {card.step}
                  </div>
                  <div className="p-3 rounded-xl bg-[#E6F3EF] border border-[#7BAE9D]/30 inline-block mb-4 text-[#176B67]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#19302F] mb-2">{card.title}</h3>
                  <p className="text-xs text-[#667A78] leading-relaxed">{card.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 2: PATIENT-CONTROLLED MEDICAL IDENTITY */}
      <section id="identity" className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left">
            <Badge variant="default" dot>Universal Identity</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#19302F] leading-tight">
              One cryptographic pass for every hospital, lab & specialist
            </h2>
            <p className="text-[#667A78] text-sm leading-relaxed">
              Never re-register, fill paper registration packets, or repeat identical blood tests. 
              Your SAATHI pass proves your identity, verified blood group, documented drug allergies, and active insurance coverage in a single millisecond scan.
            </p>

            <div className="space-y-3 pt-2">
              {[
                "Zero raw health details exposed in the QR code challenge",
                "W3C Verifiable Credentials issued by accredited hospitals",
                "Dynamic anti-counterfeit cryptographic nonces expiring in 15 minutes",
                "Offline-first emergency biometric attestation support",
              ].map((bullet, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs font-medium text-[#19302F]">
                  <div className="w-5 h-5 rounded-full bg-[#E6F3EF] text-[#176B67] flex items-center justify-center shrink-0 border border-[#7BAE9D]/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>{bullet}</span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Link href="/dashboard/identity">
                <Button className="bg-[#176B67] hover:bg-[#135855] text-white font-semibold gap-2">
                  <span>Explore Identity Portal</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-white/90 border border-[#7BAE9D]/30 backdrop-blur-2xl shadow-xl space-y-6 text-left">
            <div className="flex items-center justify-between pb-4 border-b border-[#7BAE9D]/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E6F3EF] border border-[#7BAE9D]/30 flex items-center justify-center text-[#176B67]">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#19302F]">Universal Patient Handshake</div>
                  <div className="text-[11px] text-[#667A78]">ABHA + DID Verifiable Presentation</div>
                </div>
              </div>
              <Badge variant="success" dot>Verified</Badge>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 space-y-1">
                <div className="text-[10px] uppercase text-[#667A78] font-sans font-bold">Decentralized Identifier</div>
                <div className="text-[#176B67] font-bold truncate">did:saathi:sep:0x71C6793F205C921F223B225E0359b3D76F6D6498</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 space-y-1">
                <div className="text-[10px] uppercase text-[#667A78] font-sans font-bold">Issuing Authority</div>
                <div className="text-[#19302F]">National Health Authority (ABDM) • L3 Biometric</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 space-y-1">
                <div className="text-[10px] uppercase text-[#667A78] font-sans font-bold">Active Attestations</div>
                <div className="text-[#19302F]">Grade III Penicillin Allergy • O+ Blood • Health Policy</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: BLOCKCHAIN-POWERED CONSENT */}
      <section id="consent" className="relative z-10 py-24 px-6 border-t border-[#7BAE9D]/20 bg-[#E6F3EF]/30">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <Badge variant="default">Smart Contract Architecture</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#19302F]">
              Granular consent enforced by Ethereum Sepolia
            </h2>
            <p className="text-[#667A78] text-sm sm:text-base leading-relaxed">
              Access requests are never all-or-nothing. Grant access to your blood tests without revealing psychiatric consultations. Set expiration timers and revoke instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <Card className="p-6 border-[#7BAE9D]/25 bg-white/95 space-y-4">
              <div className="p-3 rounded-xl bg-[#E6F3EF] text-[#176B67] w-fit">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#19302F]">Granular Scopes</h3>
              <p className="text-xs text-[#667A78] leading-relaxed">
                Partition your record archive into discrete cryptographic scopes: Lab Reports, Prescriptions, Consultation Notes, and Diagnostic Imaging.
              </p>
            </Card>

            <Card className="p-6 border-[#7BAE9D]/25 bg-white/95 space-y-4">
              <div className="p-3 rounded-xl bg-[#E6F3EF] text-[#176B67] w-fit">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#19302F]">EIP-712 Signatures</h3>
              <p className="text-xs text-[#667A78] leading-relaxed">
                Approve requests using human-readable typed signatures in MetaMask. Replay attacks are strictly prevented via incremental patient nonces.
              </p>
            </Card>

            <Card className="p-6 border-[#7BAE9D]/25 bg-white/95 space-y-4">
              <div className="p-3 rounded-xl bg-[#E6F3EF] text-[#176B67] w-fit">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#19302F]">Instant Revocation</h3>
              <p className="text-xs text-[#667A78] leading-relaxed">
                One click revokes a provider&apos;s authorization on the smart contract immediately. Future queries are blocked by cryptographic verification.
              </p>
            </Card>
          </div>

          <div className="text-center pt-4">
            <Link href="/dashboard/consent">
              <Button size="lg" className="bg-[#176B67] hover:bg-[#135855] text-white font-bold shadow-md">
                <span>View Live Consent Manager</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 4: FOR HOSPITALS & PROVIDERS */}
      <section id="hospitals" className="relative z-10 py-24 px-6 border-t border-[#7BAE9D]/20 bg-white/70">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#7BAE9D]/20">
            <div className="space-y-3 text-left">
              <Badge variant="default">Healthcare Provider Portal</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#19302F]">
                Built for hospitals, clinics and emergency response teams
              </h2>
              <p className="text-[#667A78] text-sm max-w-2xl leading-relaxed">
                Accredited healthcare organizations query patient records in compliance with NABH, HIPAA, and ABDM regulations without holding centralized vulnerability honeypots.
              </p>
            </div>

            <Link href="/hospital" className="shrink-0">
              <Button size="lg" className="bg-[#176B67] hover:bg-[#135855] text-white font-bold gap-2">
                <Building2 className="w-4 h-4" />
                <span>Open Provider Console</span>
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <Card className="p-6 border-[#7BAE9D]/25 bg-white/95">
              <h3 className="text-base font-bold text-[#19302F] mb-2">QR Patient Ingestion</h3>
              <p className="text-xs text-[#667A78] leading-relaxed">
                Scan patient QR passes at triage. The terminal requests authorization for specific ICD-10 clinical categories without paper bottlenecks.
              </p>
            </Card>

            <Card className="p-6 border-[#7BAE9D]/25 bg-white/95">
              <h3 className="text-base font-bold text-[#19302F] mb-2">Accreditation Registry</h3>
              <p className="text-xs text-[#667A78] leading-relaxed">
                Healthcare providers must hold an active regulatory license verified on the ProviderRegistry smart contract before patients can accept consent.
              </p>
            </Card>

            <Card className="p-6 border-[#7BAE9D]/25 bg-white/95">
              <h3 className="text-base font-bold text-[#19302F] mb-2">Break-Glass Audit Logs</h3>
              <p className="text-xs text-[#667A78] leading-relaxed">
                In trauma emergencies, verified clinicians access pre-approved emergency scopes under an irreversible on-chain audit contract.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-[#7BAE9D]/20 bg-[#FAFDFB] py-16 px-6 text-xs text-[#667A78]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 text-left">
          <div className="space-y-4 md:col-span-1">
            <SaathiLogo size="md" tagline={true} />
            <p className="text-xs text-[#667A78] leading-relaxed">
              Decentralized, patient-sovereign healthcare identity. Your Health. Your Identity. Your Control.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#176B67] animate-pulse" />
              <span className="text-[11px] text-[#19302F] font-mono font-semibold">Sepolia Testnet Active</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[#19302F] font-bold text-xs tracking-wider uppercase">Patient Portal</div>
            <ul className="space-y-1.5">
              <li><Link href="/dashboard" className="hover:text-[#176B67] transition-colors">Overview Dashboard</Link></li>
              <li><Link href="/dashboard/records" className="hover:text-[#176B67] transition-colors">Encrypted Records</Link></li>
              <li><Link href="/dashboard/identity" className="hover:text-[#176B67] transition-colors">Digital Identity Card</Link></li>
              <li><Link href="/dashboard/consent" className="hover:text-[#176B67] transition-colors">Consent Manager</Link></li>
              <li><Link href="/dashboard/family" className="hover:text-[#176B67] transition-colors">Family & Guardians</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="text-[#19302F] font-bold text-xs tracking-wider uppercase">Provider Portal</div>
            <ul className="space-y-1.5">
              <li><Link href="/hospital" className="hover:text-[#176B67] transition-colors">Hospital Dashboard</Link></li>
              <li><Link href="/hospital/patients" className="hover:text-[#176B67] transition-colors">Authorized Patients</Link></li>
              <li><Link href="/hospital/requests" className="hover:text-[#176B67] transition-colors">Pending Access Requests</Link></li>
              <li><Link href="/hospital/credentials" className="hover:text-[#176B67] transition-colors">Credential Verifier</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="text-[#19302F] font-bold text-xs tracking-wider uppercase">Security & Standards</div>
            <ul className="space-y-1.5">
              <li>W3C Verifiable Credentials</li>
              <li>Ethereum Sepolia EIP-712</li>
              <li>ABHA & ABDM Architecture</li>
              <li>NABH / HIPAA Data Guardrails</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-10 mt-10 border-t border-[#7BAE9D]/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-[#667A78]">
          <div>© {new Date().getFullYear()} SAATHI Health Identity Protocol. Prototype Demonstration Build.</div>
          <div className="text-[11px] font-mono text-[#176B67] font-semibold">Zero Personal Health Information On-Chain</div>
        </div>
      </footer>
    </div>
  );
}
