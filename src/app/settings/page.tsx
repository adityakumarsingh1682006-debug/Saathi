"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Settings,
  User,
  Shield,
  Key,
  Wallet,
  Download,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ArrowLeft,
  RefreshCw,
  Cpu,
  Layers,
  Sparkles,
  Database,
  Lock,
} from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppState } from "@/lib/store-context";
import { formatAddress } from "@/lib/blockchain/wallet";

interface ConfigStatus {
  gemini?: { isConfigured: boolean; label: string; model?: string; service?: string };
  supabase: { isConfigured: boolean; label: string };
  sepoliaRpc: { isConfigured: boolean; label: string };
  providerRegistry: { isDeployed: boolean; label: string; address: string | null };
  consentRegistry: { isDeployed: boolean; label: string; address: string | null };
  credentialRegistry: { isDeployed: boolean; label: string; address: string | null };
  network: { chainId: number; name: string };
}

export default function SettingsPage() {
  const { patient, updatePatient, wallet, connectWallet, isLiveSepolia, showNotice } = useAppState();

  const [name, setName] = useState(patient.name);
  const [bloodGroup, setBloodGroup] = useState(patient.bloodGroup);
  const [emergencyPhone, setEmergencyPhone] = useState(patient.emergencyContact.phone);

  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  useEffect(() => {
    fetch("/api/config/status")
      .then((res) => res.json())
      .then((data) => {
        setConfigStatus(data);
        setLoadingConfig(false);
      })
      .catch(() => {
        setLoadingConfig(false);
      });
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updatePatient({
      name,
      bloodGroup,
      emergencyContact: {
        ...patient.emergencyContact,
        phone: emergencyPhone,
      },
    });
  };

  const handleDownloadBackup = () => {
    const backupData = {
      protocol: "SAATHI_SOVEREIGN_BACKUP_V1",
      patientName: patient.name,
      did: patient.did,
      abhaId: patient.abhaId,
      exportedAt: new Date().toISOString(),
      network: "Ethereum Sepolia (ChainId 11155111)",
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `saathi-identity-backup-${patient.name.toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotice("Cryptographic identity backup exported", "success");
  };

  return (
    <div className="min-h-screen bg-[#F7FAF8] text-[#19302F] flex flex-col lg:flex-row font-sans">
      <Sidebar />

      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        <Topbar
          title="Account & Cryptographic Settings"
          subtitle="Configure Profile, Export Keys & Manage Connected Blockchain Gateways"
        />

        <div className="p-6 max-w-5xl mx-auto w-full space-y-6 text-left">
          {/* SYSTEM ENVIRONMENT & INTEGRATION STATUS SECTION */}
          <Card className="p-6 border-[#7BAE9D]/25 bg-white/95 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#7BAE9D]/15 gap-2">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-[#176B67]" />
                  Integration & Security Environment Status
                </CardTitle>
                <CardDescription>
                  Central status of all configured API services and Ethereum smart contract deployments.
                </CardDescription>
              </div>

              <div className="text-[11px] font-mono text-[#667A78]">
                Source: <code className="text-[#176B67] font-bold bg-[#E6F3EF] px-1.5 py-0.5 rounded">.env.local</code>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              {/* Gemini Report Summarizer */}
              <div className="p-4 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#19302F] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#176B67]" />
                    Gemini AI Summarizer
                  </span>
                  <Badge
                    variant={configStatus?.gemini?.isConfigured ? "default" : "warning"}
                    dot
                    className="text-[10px]"
                  >
                    {configStatus?.gemini?.isConfigured ? "Active" : "Simulation"}
                  </Badge>
                </div>
                <p className="text-[11px] text-[#667A78] leading-snug">
                  {configStatus?.gemini?.isConfigured
                    ? "Official Google GenAI SDK connected. Server-side clinical report summaries active."
                    : "Running evidence-based clinical reference engine fallback."}
                </p>
              </div>

              {/* Supabase Status */}
              <div className="p-4 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#19302F] flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-[#176B67]" />
                    Supabase
                  </span>
                  <Badge
                    variant={configStatus?.supabase.isConfigured ? "default" : "secondary"}
                    dot
                    className="text-[10px]"
                  >
                    {configStatus?.supabase.isConfigured ? "Configured" : "Missing"}
                  </Badge>
                </div>
                <p className="text-[11px] text-[#667A78] leading-snug">
                  {configStatus?.supabase.isConfigured
                    ? "Storage client connected to encrypted record bucket."
                    : "Client-side encrypted memory store active."}
                </p>
              </div>

              {/* Sepolia RPC */}
              <div className="p-4 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#19302F] flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-[#7BAE9D]" />
                    Sepolia RPC
                  </span>
                  <Badge
                    variant={configStatus?.sepoliaRpc.isConfigured ? "default" : "secondary"}
                    dot
                    className="text-[10px]"
                  >
                    {configStatus?.sepoliaRpc.isConfigured ? "Configured" : "Missing"}
                  </Badge>
                </div>
                <p className="text-[11px] text-[#667A78] leading-snug">
                  {configStatus?.sepoliaRpc.isConfigured
                    ? "Dedicated RPC node endpoint configured for backend queries."
                    : "Public fallback RPC active for contract reads."}
                </p>
              </div>

              {/* Provider Registry */}
              <div className="p-4 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#19302F] flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-[#176B67]" />
                    Provider Registry
                  </span>
                  <Badge
                    variant={configStatus?.providerRegistry.isDeployed ? "default" : "outline"}
                    className="text-[10px]"
                  >
                    {configStatus?.providerRegistry.isDeployed ? "Deployed" : "Not configured"}
                  </Badge>
                </div>
                <p className="text-[11px] font-mono text-[#667A78] truncate">
                  {configStatus?.providerRegistry.address
                    ? formatAddress(configStatus.providerRegistry.address, 6)
                    : "Pending testnet deployment"}
                </p>
              </div>

              {/* Consent Registry */}
              <div className="p-4 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#19302F] flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-[#176B67]" />
                    Consent Registry
                  </span>
                  <Badge
                    variant={configStatus?.consentRegistry.isDeployed ? "default" : "outline"}
                    className="text-[10px]"
                  >
                    {configStatus?.consentRegistry.isDeployed ? "Deployed" : "Not configured"}
                  </Badge>
                </div>
                <p className="text-[11px] font-mono text-[#667A78] truncate">
                  {configStatus?.consentRegistry.address
                    ? formatAddress(configStatus.consentRegistry.address, 6)
                    : "Pending testnet deployment"}
                </p>
              </div>

              {/* Credential Registry */}
              <div className="p-4 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#19302F] flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#7BAE9D]" />
                    Credential Registry
                  </span>
                  <Badge
                    variant={configStatus?.credentialRegistry.isDeployed ? "default" : "outline"}
                    className="text-[10px]"
                  >
                    {configStatus?.credentialRegistry.isDeployed ? "Deployed" : "Not configured"}
                  </Badge>
                </div>
                <p className="text-[11px] font-mono text-[#667A78] truncate">
                  {configStatus?.credentialRegistry.address
                    ? formatAddress(configStatus.credentialRegistry.address, 6)
                    : "Pending testnet deployment"}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#E6F3EF] border border-[#7BAE9D]/30 text-[11px] text-[#667A78] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span>Security Guarantee: Secret values and private keys are never exposed in browser runtime.</span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[#176B67] font-bold">Chain: Sepolia (11155111)</span>
                <Link href="/settings/deploy">
                  <Button size="sm" className="bg-[#176B67] hover:bg-[#135855] text-white font-bold h-7 px-3 text-[11px] gap-1 shadow-2xs">
                    <Wallet className="w-3 h-3" />
                    <span>MetaMask Deployer</span>
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* PROFILE CONFIGURATION */}
          <Card className="p-6 border-[#7BAE9D]/25 bg-white/95 space-y-6 shadow-sm">
            <div className="pb-3 border-b border-[#7BAE9D]/15">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-5 h-5 text-[#176B67]" />
                Profile Demographics
              </CardTitle>
              <CardDescription>
                Personal health identity attributes presented on your universal pass.
              </CardDescription>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-[#19302F]">Full Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[#19302F]">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full h-9 rounded-xl border border-[#7BAE9D]/30 bg-white px-3 text-xs text-[#19302F] focus:outline-none focus:border-[#176B67]"
                  >
                    {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#19302F]">Emergency Phone</label>
                <Input
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" size="sm" className="bg-[#176B67] hover:bg-[#135855] text-white font-bold shadow-xs">
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </Card>

          {/* BLOCKCHAIN & WALLET CONNECTION */}
          <Card className="p-6 border-[#7BAE9D]/25 bg-white/95 space-y-6 shadow-sm">
            <div className="pb-3 border-b border-[#7BAE9D]/15">
              <CardTitle className="text-base flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#176B67]" />
                Ethereum Sepolia Gateway
              </CardTitle>
              <CardDescription>
                Connect a browser wallet (MetaMask / Rabby) to sign EIP-712 consent permits.
              </CardDescription>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-[#19302F]">Wallet Connection Status</div>
                  <div className="text-[#667A78] font-mono text-[11px]">
                    {wallet.isConnected
                      ? `Connected: ${wallet.address}`
                      : "Using local demo wallet (EIP-712 simulated)"}
                  </div>
                </div>

                <Button
                  onClick={connectWallet}
                  size="sm"
                  variant="outline"
                  className="border-[#7BAE9D]/40 text-[#176B67] hover:bg-[#E6F3EF] text-xs shrink-0"
                >
                  {wallet.isConnected ? "Switch Wallet" : "Connect MetaMask"}
                </Button>
              </div>

              <div className="flex items-center justify-between text-[#667A78] text-[11px] px-1">
                <span>Target Chain: Sepolia (11155111)</span>
                <span>Smart Contract: {isLiveSepolia ? "Live" : "Development Prototype"}</span>
              </div>
            </div>
          </Card>

          {/* CRYPTOGRAPHIC KEYS & BACKUP EXPORT */}
          <Card className="p-6 border-[#7BAE9D]/25 bg-white/95 space-y-4 shadow-sm">
            <div className="pb-3 border-b border-[#7BAE9D]/15">
              <CardTitle className="text-base flex items-center gap-2">
                <Key className="w-5 h-5 text-[#176B67]" />
                Identity Backup & Data Portability
              </CardTitle>
              <CardDescription>
                Download a JSON credential backup to restore on another device.
              </CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <p className="text-[#667A78] max-w-lg leading-relaxed">
                Your health identity is self-sovereign. Export your DID metadata, public key anchor, and verified credential proofs at any time.
              </p>
              <Button
                onClick={handleDownloadBackup}
                size="sm"
                className="bg-[#176B67] hover:bg-[#135855] text-white font-bold gap-2 shrink-0 shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Export Identity Backup</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
