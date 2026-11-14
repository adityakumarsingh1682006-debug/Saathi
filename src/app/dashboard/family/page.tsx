"use client";

import React, { useState } from "react";
import {
  Users,
  ShieldCheck,
  UserPlus,
  Phone,
  Trash2,
  AlertCircle,
  Lock,
  Heart,
  ExternalLink,
  Info,
} from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useAppState } from "@/lib/store-context";
import { formatAddress } from "@/lib/blockchain/wallet";

export default function FamilyGuardiansPage() {
  const { guardians, addGuardian, removeGuardian } = useAppState();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("Spouse");
  const [phone, setPhone] = useState("");
  const [did, setDid] = useState("");
  const [accessLevel, setAccessLevel] = useState<"Emergency Only" | "Vital Summaries" | "Full Proxy">("Vital Summaries");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    addGuardian({
      name,
      relationship,
      phone,
      did: did.trim() || `did:saathi:sep:0x${Array.from({ length: 40 }, () => "7").join("")}`,
      accessLevel,
    });

    setAddModalOpen(false);
    setName("");
    setPhone("");
    setDid("");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7FAF8] text-[#19302F]">
      <Topbar
        title="Family & Guardian Delegation"
        subtitle="Trusted Family Access Under Strict Individual Privacy Sovereignty"
      />

      <div className="p-6 max-w-7xl mx-auto w-full space-y-6 text-left">
        {/* IMPORTANT PRIVACY MANDATE BANNER */}
        <div className="p-4 rounded-2xl bg-[#E6F3EF] border border-[#7BAE9D]/35 flex items-start gap-3 shadow-xs">
          <Info className="w-5 h-5 text-[#176B67] shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-bold text-[#19302F] block">Sovereign Privacy Guardrail</span>
            <p className="text-[#667A78] leading-relaxed">
              Every adult family member retains absolute, unalienable control over their independent medical identity. 
              Family links never grant automatic or unrestricted access to adult records; all shared scopes are explicitly delegated and can be revoked at any instant.
            </p>
          </div>
        </div>

        {/* HEADER CONTROLS */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#19302F] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#176B67]" />
              Designated Guardians & Family Members ({guardians.length})
            </h2>
            <p className="text-xs text-[#667A78]">
              Authorized individuals alerted during break-glass protocols and permitted limited clinical visibility.
            </p>
          </div>

          <Button
            onClick={() => setAddModalOpen(true)}
            size="sm"
            className="bg-[#176B67] hover:bg-[#135855] text-white font-bold gap-1.5 text-xs shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Trusted Guardian</span>
          </Button>
        </div>

        {/* GUARDIANS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guardians.map((guardian) => (
            <Card key={guardian.id} className="p-5 border-[#7BAE9D]/25 bg-white/95 hover:border-[#176B67]/40 transition-all space-y-4 shadow-xs">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E6F3EF] border border-[#7BAE9D]/30 flex items-center justify-center text-[#176B67] font-bold">
                    {guardian.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#19302F]">{guardian.name}</h3>
                    <p className="text-xs text-[#667A78]">{guardian.relationship}</p>
                  </div>
                </div>

                <Badge variant={guardian.accessLevel === "Emergency Only" ? "destructive" : "default"} className="text-[10px] font-bold">
                  {guardian.accessLevel}
                </Badge>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#667A78]">
                  <span>Emergency Phone:</span>
                  <span className="font-mono text-[#19302F] font-bold flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#176B67]" />
                    {guardian.phone}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#667A78]">
                  <span>Sovereign DID:</span>
                  <span className="font-mono text-[#176B67] font-semibold truncate max-w-[180px]">
                    {formatAddress(guardian.did, 6)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#667A78]">
                  <span>Authorized Since:</span>
                  <span className="text-[#19302F] font-mono">{guardian.addedDate}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#7BAE9D]/15 flex items-center justify-between text-xs">
                <span className="text-[10px] text-[#667A78] flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3 h-3 text-[#176B67]" />
                  Break-glass notification enabled
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeGuardian(guardian.id)}
                  className="text-[#C93C4B] hover:text-[#C93C4B] hover:bg-[#C93C4B]/10 text-xs p-1 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Revoke
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* POLICY EXPLANATION */}
        <Card className="p-6 border-[#7BAE9D]/25 bg-white/95 space-y-3 shadow-sm">
          <CardTitle>Guardian Permission Tiers</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
            <div className="p-3.5 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 space-y-1">
              <span className="font-bold text-[#C93C4B]">Emergency Only</span>
              <p className="text-[#667A78] leading-relaxed">
                Guardian receives instant automated SMS/push alerts during trauma break-glass events with location and hospital details. Zero daily record access.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 space-y-1">
              <span className="font-bold text-[#176B67]">Vital Summaries</span>
              <p className="text-[#667A78] leading-relaxed">
                Permits viewing critical blood groups, drug allergies, active maintenance prescriptions, and scheduled appointments. Excludes clinical pathology details.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 space-y-1">
              <span className="font-bold text-[#19302F]">Full Proxy (Minors / Dependents)</span>
              <p className="text-[#667A78] leading-relaxed">
                Appropriate for legal guardians of minors or incapacitated elders. Requires dual notarized attestation registered on the smart contract.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* ADD GUARDIAN MODAL */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Trusted Family Guardian</DialogTitle>
            <DialogDescription>
              Assign notification roles and limited emergency visibility.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 my-2 text-xs text-left">
            <div className="space-y-1.5">
              <label className="font-bold text-[#19302F]">Full Name</label>
              <Input
                placeholder="e.g. Priya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-[#19302F]">Relationship</label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full h-9 rounded-xl border border-[#7BAE9D]/30 bg-white px-3 text-xs text-[#19302F] focus:outline-none focus:border-[#176B67]"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent</option>
                  <option value="Child">Child</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Legal Guardian">Legal Guardian</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#19302F]">Emergency Phone</label>
                <Input
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#19302F]">Permission Scope</label>
              <select
                value={accessLevel}
                onChange={(e) => setAccessLevel(e.target.value as any)}
                className="w-full h-9 rounded-xl border border-[#7BAE9D]/30 bg-white px-3 text-xs text-[#19302F] focus:outline-none focus:border-[#176B67]"
              >
                <option value="Emergency Only">Emergency Only (Alert Notifications)</option>
                <option value="Vital Summaries">Vital Summaries (Blood/Allergies/Meds)</option>
                <option value="Full Proxy">Full Legal Proxy</option>
              </select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-[#176B67] hover:bg-[#135855] text-white font-bold">
                Authorize Guardian
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
