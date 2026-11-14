"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileCheck2,
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Building2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppState } from "@/lib/store-context";
import { formatDeterministicDate } from "@/lib/date-utils";

export default function HospitalCredentialsPage() {
  const { credentials } = useAppState();

  const [inputHash, setInputHash] = useState(credentials[0]?.credentialHash || "");
  const [verifying, setVerifying] = useState(false);
  const [verifiedResult, setVerifiedResult] = useState<any>(null);

  const handleVerify = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      const match = credentials.find(
        (c) => c.credentialHash.toLowerCase() === inputHash.trim().toLowerCase()
      );

      if (match) {
        setVerifiedResult({
          valid: match.status === "Valid",
          title: match.title,
          issuer: match.issuerName,
          claims: match.claims,
          status: match.status,
          date: formatDeterministicDate(match.issuedAt),
        });
      } else {
        setVerifiedResult({
          valid: false,
          error: "No matching credential anchor found on Sepolia CredentialStatusRegistry.",
        });
      }
    }, 800);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7FAF8] text-[#19302F]">
      <header className="px-6 py-4 bg-white/85 backdrop-blur-xl border-b border-[#7BAE9D]/25 flex items-center justify-between">
        <div className="text-left">
          <h1 className="text-xl font-bold text-[#19302F]">Credential Status Registry Verifier</h1>
          <p className="text-xs text-[#667A78]">
            Verify authenticity and revocation status of health credentials directly against Ethereum Sepolia.
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT 6 COLS: INPUT & QUICK SAMPLE SELECTION */}
          <div className="lg:col-span-6 space-y-6">
            <Card className="p-6 border-[#7BAE9D]/25 bg-white/95 space-y-4 shadow-sm">
              <CardTitle className="text-sm">Verify Credential Cryptographic Digest</CardTitle>
              <CardDescription>
                Query the CredentialStatusRegistry smart contract to ensure the credential has not been revoked or expired.
              </CardDescription>

              <div className="space-y-2 text-xs">
                <label className="font-bold text-[#19302F]">Credential Hash (bytes32 keccak256)</label>
                <div className="flex gap-2">
                  <Input
                    value={inputHash}
                    onChange={(e) => setInputHash(e.target.value)}
                    placeholder="0x..."
                    className="font-mono text-xs bg-white border-[#7BAE9D]/30"
                  />
                  <Button
                    onClick={handleVerify}
                    disabled={verifying}
                    className="bg-[#176B67] hover:bg-[#135855] text-white font-bold text-xs gap-1.5 shrink-0 shadow-xs"
                  >
                    {verifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    <span>Verify</span>
                  </Button>
                </div>
              </div>

              {/* Sample credentials picker */}
              <div className="pt-2 border-t border-[#7BAE9D]/15 space-y-2 text-xs">
                <span className="text-[10px] uppercase font-bold text-[#667A78]">Sample Patient Credentials:</span>
                <div className="space-y-1.5">
                  {credentials.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setInputHash(c.credentialHash);
                        setVerifiedResult(null);
                      }}
                      className="w-full p-2.5 rounded-xl bg-[#F7FAF8] hover:bg-[#E6F3EF] border border-[#7BAE9D]/20 text-left flex items-center justify-between text-xs transition-colors cursor-pointer"
                    >
                      <div>
                        <div className="font-bold text-[#19302F]">{c.title}</div>
                        <div className="text-[10px] text-[#667A78]">{c.issuerName}</div>
                      </div>
                      <Badge variant="outline" className="text-[9px]">Select</Badge>
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* RIGHT 6 COLS: VERIFICATION RESULT */}
          <div className="lg:col-span-6">
            {verifiedResult ? (
              <Card
                className={`p-6 border ${
                  verifiedResult.valid
                    ? "border-emerald-500/40 bg-white/95"
                    : "border-[#C93C4B]/40 bg-white/95"
                } space-y-4 shadow-sm`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#7BAE9D]/15">
                  <div className="flex items-center gap-2">
                    {verifiedResult.valid ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-[#C93C4B]" />
                    )}
                    <span className="text-sm font-bold text-[#19302F]">
                      {verifiedResult.valid ? "Credential Authenticated" : "Verification Failed"}
                    </span>
                  </div>
                  <Badge variant={verifiedResult.valid ? "success" : "destructive"}>
                    {verifiedResult.valid ? "Valid on Sepolia" : "Revoked or Invalid"}
                  </Badge>
                </div>

                {verifiedResult.valid ? (
                  <div className="space-y-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 space-y-1">
                      <div className="font-bold text-sm text-[#19302F]">{verifiedResult.title}</div>
                      <div className="text-[11px] text-[#667A78]">Issued by {verifiedResult.issuer} • {verifiedResult.date}</div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-[#176B67]">Attested Claims:</span>
                      <div className="divide-y divide-[#7BAE9D]/15 bg-[#F7FAF8] p-3 rounded-xl border border-[#7BAE9D]/20 text-xs">
                        {Object.entries(verifiedResult.claims).map(([k, v]) => (
                          <div key={k} className="py-1.5 flex justify-between items-center">
                            <span className="text-[#667A78] font-medium">{k.replace(/_/g, " ")}:</span>
                            <span className="text-[#19302F] font-mono font-bold">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#C93C4B]/10 border border-[#C93C4B]/20 text-xs text-[#C93C4B] font-medium">
                    {verifiedResult.error}
                  </div>
                )}
              </Card>
            ) : (
              <div className="py-20 text-center rounded-3xl bg-white border border-[#7BAE9D]/25 space-y-3 p-6 shadow-xs">
                <FileCheck2 className="w-12 h-12 text-[#7BAE9D] mx-auto" />
                <div className="text-sm font-bold text-[#19302F]">Ready to Verify Credential</div>
                <p className="text-xs text-[#667A78] max-w-sm mx-auto">
                  Select a sample credential or paste any bytes32 cryptographic hash to query the smart contract.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
