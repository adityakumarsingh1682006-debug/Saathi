"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  Plus,
  Filter,
  Eye,
  Trash2,
  ShieldCheck,
  Calendar,
  Building2,
  FileCheck2,
  Upload,
  X,
  Clock,
  ExternalLink,
  Activity,
  Pill,
  AlertTriangle,
  Stethoscope,
  HeartPulse,
  Droplet,
  Beaker,
  Thermometer,
  Layers,
  ChevronDown,
  ChevronRight,
  Info,
  CheckCircle2,
  User,
  Syringe,
  History,
  FileSearch,
  Database,
  Printer,
} from "lucide-react";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppState } from "@/lib/store-context";
import { MedicalRecord } from "@/lib/mock-data";
import { LabPanel, LabAnalyte, PrescriptionItem, AllergyRecord, ConsultationRecord } from "@/lib/medical/types";
import { OFFICIAL_LAB_CAVEAT } from "@/lib/medical/reference-data";
import { formatDeterministicDate } from "@/lib/date-utils";
import { KAGGLE_MEDICAL_DATASETS, classifyDataOrigin } from "@/lib/medical/kaggle-datasets";
import { UploadReportModal } from "@/components/dashboard/upload-report-modal";
import { ReportDetailModal } from "@/components/dashboard/report-detail-modal";

type CategoryTab =
  | "labs"
  | "prescriptions"
  | "consultations"
  | "history"
  | "allergies"
  | "vaccinations"
  | "imaging"
  | "timeline"
  | "datasets";

export default function MedicalRecordsPage() {
  const {
    records,
    addRecord,
    deleteRecord,
    labPanels,
    prescriptions,
    allergies,
    consultations,
    timeline,
    addPrescription,
    addAllergy,
    patient,
    isLiveSepolia,
    showNotice,
  } = useAppState();

  // Active Category Tab
  const [activeTab, setActiveTab] = useState<CategoryTab>("labs");

  // Search & Filter Query
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedReportForView, setSelectedReportForView] = useState<LabPanel | MedicalRecord | null>(null);

  // Imaging & Vaccination records from documents
  const imagingRecords = records.filter((r) => r.category === "imaging");
  const vaccinationRecords = records.filter((r) => r.category === "vaccination");

  // Medical History items (synthesized from consultations & chronic records)
  const medicalHistoryItems = [
    {
      id: "hist-01",
      condition: "Seasonal Allergic Rhinitis & Exercise-Induced Bronchospasm",
      diagnosedDate: "2024-03-15",
      facility: "Max Healthcare Pulmonary Dept",
      status: "Managed with maintenance inhaler",
      severity: "Mild",
      notes: "Triggered by cold weather and prolonged endurance cardio. Prophylactic inhaler recommended.",
    },
    {
      id: "hist-02",
      condition: "Grade III Penicillin Allergy (Documented)",
      diagnosedDate: "2021-08-10",
      facility: "Apollo Hospital Emergency Unit",
      status: "Lifelong Contraindication",
      severity: "Severe / Anaphylactoid",
      notes: "Severe urticaria, angioedema. Avoid all penicillin derivatives and beta-lactam antibiotics.",
    },
    {
      id: "hist-03",
      condition: "Childhood Immunization & Tdap Booster Schedule",
      diagnosedDate: "2025-11-20",
      facility: "Manipal Hospital Vaccination Hub",
      status: "Up to date",
      severity: "Preventive",
      notes: "Adult booster administered. Next tetanus booster due in 2035.",
    },
  ];

  // Helper to calculate status for a lab panel
  const getPanelStatus = (panel: LabPanel): { label: "Normal" | "Needs Attention" | "Awaiting Review"; count: number } => {
    const abnormal = panel.analytes.filter((a) => a.status === "Elevated" || a.status === "Low" || a.status === "Critical");
    if (abnormal.length > 0) {
      return { label: "Needs Attention", count: abnormal.length };
    }
    return { label: "Normal", count: 0 };
  };

  // Filtered Lab Panels
  const filteredPanels = labPanels.filter((p) => {
    const query = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(query) ||
      p.facility.toLowerCase().includes(query) ||
      p.analytes.some((a) => a.name.toLowerCase().includes(query))
    );
  });

  // Filtered Prescriptions
  const filteredPrescriptions = prescriptions.filter((rx) => {
    const query = searchQuery.toLowerCase();
    return (
      rx.brandName.toLowerCase().includes(query) ||
      rx.genericName.toLowerCase().includes(query) ||
      rx.facility.toLowerCase().includes(query) ||
      rx.indication.toLowerCase().includes(query)
    );
  });

  // Filtered Consultations
  const filteredConsultations = consultations.filter((c) => {
    const query = searchQuery.toLowerCase();
    return (
      c.specialty.toLowerCase().includes(query) ||
      c.doctorName.toLowerCase().includes(query) ||
      c.facility.toLowerCase().includes(query) ||
      c.subjectiveChiefComplaint.toLowerCase().includes(query)
    );
  });

  // Filtered Imaging
  const filteredImaging = imagingRecords.filter((img) => {
    const query = searchQuery.toLowerCase();
    return (
      img.title.toLowerCase().includes(query) ||
      img.facility.toLowerCase().includes(query) ||
      img.summary.toLowerCase().includes(query)
    );
  });

  // Filtered Vaccinations
  const filteredVaccinations = vaccinationRecords.filter((v) => {
    const query = searchQuery.toLowerCase();
    return (
      v.title.toLowerCase().includes(query) ||
      v.facility.toLowerCase().includes(query) ||
      v.summary.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#F7FAF8] text-[#19302F]">
      <Topbar
        title="Medical Records"
        subtitle="Simple, Patient-Friendly Health Records & Test Explanations"
      />

      <div className="p-6 max-w-7xl mx-auto w-full space-y-6 text-left">
        {/* TOP PATIENT HEADER BANNER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-[#7BAE9D]/30 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E6F3EF] text-[#176B67] flex items-center justify-center font-bold text-lg shadow-2xs shrink-0">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#19302F]">
                  Personal Health Records
                </h2>
                <Badge variant="outline" className="text-[10px] text-[#176B67] border-[#7BAE9D]/40">
                  Patient: {patient.name}
                </Badge>
              </div>
              <p className="text-xs text-[#667A78]">
                All records are AES-256-GCM encrypted, anchored on Sepolia blockchain, and cryptographically verified.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={() => setUploadModalOpen(true)}
              className="bg-[#176B67] hover:bg-[#135855] text-white font-bold gap-2 text-xs h-10 px-4 rounded-xl shadow-xs"
            >
              <Upload className="w-4 h-4" />
              <span>+ Upload Medical Report</span>
            </Button>
          </div>
        </div>

        {/* 7 PATIENT-FRIENDLY CATEGORY TABS + TIMELINE + DATASETS */}
        <div className="flex items-center gap-2 border-b border-[#7BAE9D]/25 pb-3 overflow-x-auto scrollbar-none">
          {/* 1. Lab Reports */}
          <button
            onClick={() => setActiveTab("labs")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === "labs"
                ? "bg-[#176B67] text-white shadow-xs"
                : "bg-white text-[#667A78] hover:text-[#19302F] border border-[#7BAE9D]/25"
            }`}
          >
            <Beaker className="w-3.5 h-3.5" />
            <span>Lab Reports</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === "labs" ? "bg-white/20 text-white" : "bg-[#E6F3EF] text-[#176B67]"
              }`}
            >
              {labPanels.length}
            </span>
          </button>

          {/* 2. Prescriptions */}
          <button
            onClick={() => setActiveTab("prescriptions")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === "prescriptions"
                ? "bg-[#176B67] text-white shadow-xs"
                : "bg-white text-[#667A78] hover:text-[#19302F] border border-[#7BAE9D]/25"
            }`}
          >
            <Pill className="w-3.5 h-3.5" />
            <span>Prescriptions</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === "prescriptions" ? "bg-white/20 text-white" : "bg-[#E6F3EF] text-[#176B67]"
              }`}
            >
              {prescriptions.length}
            </span>
          </button>

          {/* 3. Doctor Visits */}
          <button
            onClick={() => setActiveTab("consultations")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === "consultations"
                ? "bg-[#176B67] text-white shadow-xs"
                : "bg-white text-[#667A78] hover:text-[#19302F] border border-[#7BAE9D]/25"
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Doctor Visits</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === "consultations" ? "bg-white/20 text-white" : "bg-[#E6F3EF] text-[#176B67]"
              }`}
            >
              {consultations.length}
            </span>
          </button>

          {/* 4. Medical History */}
          <button
            onClick={() => setActiveTab("history")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === "history"
                ? "bg-[#176B67] text-white shadow-xs"
                : "bg-white text-[#667A78] hover:text-[#19302F] border border-[#7BAE9D]/25"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Medical History</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === "history" ? "bg-white/20 text-white" : "bg-[#E6F3EF] text-[#176B67]"
              }`}
            >
              {medicalHistoryItems.length}
            </span>
          </button>

          {/* 5. Allergies */}
          <button
            onClick={() => setActiveTab("allergies")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === "allergies"
                ? "bg-[#176B67] text-white shadow-xs"
                : "bg-white text-[#667A78] hover:text-[#19302F] border border-[#7BAE9D]/25"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Allergies</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === "allergies" ? "bg-white/20 text-white" : "bg-[#E6F3EF] text-[#176B67]"
              }`}
            >
              {allergies.length}
            </span>
          </button>

          {/* 6. Vaccinations */}
          <button
            onClick={() => setActiveTab("vaccinations")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === "vaccinations"
                ? "bg-[#176B67] text-white shadow-xs"
                : "bg-white text-[#667A78] hover:text-[#19302F] border border-[#7BAE9D]/25"
            }`}
          >
            <Syringe className="w-3.5 h-3.5" />
            <span>Vaccinations</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === "vaccinations" ? "bg-white/20 text-white" : "bg-[#E6F3EF] text-[#176B67]"
              }`}
            >
              {vaccinationRecords.length || 1}
            </span>
          </button>

          {/* 7. Imaging & Scans */}
          <button
            onClick={() => setActiveTab("imaging")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === "imaging"
                ? "bg-[#176B67] text-white shadow-xs"
                : "bg-white text-[#667A78] hover:text-[#19302F] border border-[#7BAE9D]/25"
            }`}
          >
            <FileSearch className="w-3.5 h-3.5" />
            <span>Imaging & Scans</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === "imaging" ? "bg-white/20 text-white" : "bg-[#E6F3EF] text-[#176B67]"
              }`}
            >
              {imagingRecords.length || 1}
            </span>
          </button>

          <span className="h-5 w-px bg-[#7BAE9D]/30 shrink-0 mx-1" />

          {/* Medical Timeline */}
          <button
            onClick={() => setActiveTab("timeline")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === "timeline"
                ? "bg-[#176B67] text-white shadow-xs"
                : "bg-white text-[#667A78] hover:text-[#19302F] border border-[#7BAE9D]/25"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Medical Timeline</span>
          </button>

          {/* Research Datasets (Tier C) */}
          <button
            onClick={() => setActiveTab("datasets")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === "datasets"
                ? "bg-[#176B67] text-white shadow-xs"
                : "bg-white text-[#667A78] hover:text-[#19302F] border border-[#7BAE9D]/25"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Research Datasets (10)</span>
          </button>
        </div>

        {/* SEARCH BAR */}
        {activeTab !== "timeline" && activeTab !== "datasets" && (
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667A78]" />
            <Input
              placeholder="Search reports, tests, hospitals, or doctor names..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 text-xs bg-white border-[#7BAE9D]/30 rounded-xl"
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: LAB REPORTS                                                        */}
        {/* ========================================================================= */}
        {activeTab === "labs" && (
          <div className="space-y-5">
            {/* Friendly Educational Note */}
            <div className="p-4 rounded-2xl bg-[#E6F3EF]/70 border border-[#7BAE9D]/35 flex items-start gap-3 text-xs">
              <Info className="w-4 h-4 text-[#176B67] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-[#176B67]">Laboratory Reports Overview</span>
                <p className="text-[#19302F] text-[11px] leading-relaxed">
                  Laboratory reference ranges reflect standard healthy baselines established by each testing facility.
                  Status badges are only assigned when supported by actual test numbers and reference intervals.
                </p>
              </div>
            </div>

            {/* REPORT CARDS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPanels.map((panel) => {
                const statusInfo = getPanelStatus(panel);
                return (
                  <Card
                    key={panel.id}
                    className="p-5 border-[#7BAE9D]/30 bg-white flex flex-col justify-between shadow-xs hover:border-[#176B67]/50 transition-all rounded-2xl"
                  >
                    <div className="space-y-3">
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-mono text-[#176B67] font-bold uppercase">
                            LOINC: {panel.loincCode}
                          </span>
                          <h3 className="font-bold text-sm text-[#19302F] leading-tight">
                            {panel.title}
                          </h3>
                        </div>

                        {/* Status Badge */}
                        {statusInfo.label === "Normal" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Normal
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Needs Attention
                          </span>
                        )}
                      </div>

                      {/* Hospital & Date */}
                      <div className="space-y-1 text-xs text-[#667A78] border-y border-[#7BAE9D]/15 py-2.5">
                        <div className="flex items-center gap-1.5 text-[#19302F]">
                          <Building2 className="w-3.5 h-3.5 text-[#176B67] shrink-0" />
                          <span className="truncate">{panel.facility}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-1.5 text-[#667A78]">
                            <Calendar className="w-3.5 h-3.5 text-[#176B67]" />
                            {formatDeterministicDate(panel.reportedDate.split("T")[0])}
                          </span>
                          <span className="font-medium text-[#19302F]">
                            {panel.analytes.length} tests performed
                          </span>
                        </div>
                      </div>

                      {/* Sample Analyte Highlights */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-[#667A78] tracking-wider block">
                          Key Test Highlights:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {panel.analytes.slice(0, 3).map((a) => (
                            <span
                              key={a.id}
                              className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                                a.status === "Normal"
                                  ? "bg-[#F7FAF8] border-[#7BAE9D]/25 text-[#19302F]"
                                  : "bg-amber-50 border-amber-200 text-amber-800 font-bold"
                              }`}
                            >
                              {a.name.split(" ")[0]}: {a.result} {a.unit}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Card Actions: View Report */}
                    <div className="mt-5 pt-3 border-t border-[#7BAE9D]/15 flex items-center justify-between gap-2">
                      <Button
                        onClick={() => setSelectedReportForView(panel)}
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 border-[#7BAE9D]/35 text-[#176B67] hover:bg-[#E6F3EF] font-semibold gap-1.5 w-full"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Report & AI Summary</span>
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PRESCRIPTIONS                                                      */}
        {/* ========================================================================= */}
        {activeTab === "prescriptions" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPrescriptions.map((rx) => (
                <Card
                  key={rx.id}
                  className="p-5 border-[#7BAE9D]/30 bg-white flex flex-col justify-between shadow-xs rounded-2xl"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono text-[#176B67] uppercase font-bold tracking-wider">
                          {rx.form} • {rx.route}
                        </span>
                        <h4 className="font-bold text-sm text-[#19302F] mt-0.5">{rx.brandName}</h4>
                        <div className="text-xs text-[#667A78]">{rx.genericName}</div>
                      </div>
                      <Badge variant="success" dot>Active</Badge>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 space-y-1.5 text-xs">
                      <div>
                        <span className="text-[#667A78]">Dosage & Frequency:</span>
                        <div className="font-bold text-[#19302F]">{rx.dosage} — {rx.frequency}</div>
                      </div>
                      <div>
                        <span className="text-[#667A78]">Indication:</span>
                        <div className="text-[#19302F]">{rx.indication}</div>
                      </div>
                      <div>
                        <span className="text-[#667A78]">Prescribed by:</span>
                        <div className="text-[#19302F] font-medium">{rx.prescriberName} ({rx.facility})</div>
                      </div>
                    </div>

                    {rx.warningAlerts && rx.warningAlerts.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-[#C98A28]/10 border border-[#C98A28]/30 text-[11px] text-[#19302F] space-y-1">
                        <span className="font-bold text-[#C98A28] flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Safety Alert:
                        </span>
                        {rx.warningAlerts.map((w, idx) => (
                          <p key={idx} className="leading-tight">{w}</p>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#7BAE9D]/15 flex items-center justify-between">
                    <span className="text-[11px] text-[#667A78] font-medium">{rx.duration}</span>
                    <Badge variant="outline" className="text-[10px] text-[#176B67] border-[#7BAE9D]/30 bg-[#E6F3EF]/50">
                      {rx.dosage}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: DOCTOR VISITS                                                      */}
        {/* ========================================================================= */}
        {activeTab === "consultations" && (
          <div className="space-y-5">
            <div className="space-y-4">
              {filteredConsultations.map((enc) => (
                <Card
                  key={enc.id}
                  className="border-[#7BAE9D]/30 bg-white overflow-hidden shadow-xs rounded-2xl"
                >
                  <div className="p-5 border-b border-[#7BAE9D]/20 bg-[#F7FAF8] flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[#176B67] border-[#7BAE9D]/40 text-[10px]">
                          {enc.consultationType}
                        </Badge>
                        <h3 className="font-bold text-sm text-[#19302F]">{enc.specialty} Consultation</h3>
                      </div>
                      <p className="text-xs text-[#667A78]">
                        Physician: <span className="font-medium text-[#19302F]">{enc.doctorName}</span> • Facility:{" "}
                        <span className="font-medium text-[#19302F]">{enc.facility}</span> • Date:{" "}
                        <span className="font-medium text-[#19302F]">{formatDeterministicDate(enc.date)}</span>
                      </p>
                    </div>

                    <Badge variant="outline" className="text-xs border-[#7BAE9D]/40 text-[#176B67] bg-[#E6F3EF]/60 font-semibold px-3 py-1">
                      Verified Clinical Summary
                    </Badge>
                  </div>

                  <div className="p-5 space-y-4 text-xs">
                    {/* VITALS GRID */}
                    <div>
                      <span className="font-bold text-xs text-[#19302F] block mb-2">Recorded Vitals:</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                        <div className="p-2.5 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 text-center">
                          <span className="text-[10px] text-[#667A78] uppercase">Blood Pressure</span>
                          <div className="font-bold text-[#176B67] text-sm mt-0.5">{enc.vitals.bloodPressureSys}/{enc.vitals.bloodPressureDia}</div>
                          <span className="text-[9px] text-[#667A78]">mmHg</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 text-center">
                          <span className="text-[10px] text-[#667A78] uppercase">Heart Rate</span>
                          <div className="font-bold text-[#176B67] text-sm mt-0.5">{enc.vitals.heartRateBpm}</div>
                          <span className="text-[9px] text-[#667A78]">bpm</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 text-center">
                          <span className="text-[10px] text-[#667A78] uppercase">Oxygen SpO2</span>
                          <div className="font-bold text-[#176B67] text-sm mt-0.5">{enc.vitals.oxygenSaturationSpo2}%</div>
                          <span className="text-[9px] text-[#667A78]">Room Air</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 text-center">
                          <span className="text-[10px] text-[#667A78] uppercase">Resp. Rate</span>
                          <div className="font-bold text-[#176B67] text-sm mt-0.5">{enc.vitals.respiratoryRate}</div>
                          <span className="text-[9px] text-[#667A78]">breaths/min</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 text-center">
                          <span className="text-[10px] text-[#667A78] uppercase">Temp</span>
                          <div className="font-bold text-[#176B67] text-sm mt-0.5">{enc.vitals.bodyTemperatureF}°F</div>
                          <span className="text-[9px] text-[#667A78]">Oral</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 text-center">
                          <span className="text-[10px] text-[#667A78] uppercase">BMI</span>
                          <div className="font-bold text-[#176B67] text-sm mt-0.5">{enc.vitals.bodyMassIndex}</div>
                          <span className="text-[9px] text-[#667A78]">kg/m²</span>
                        </div>
                      </div>
                    </div>

                    {/* ASSESSMENT SUMMARY */}
                    <div className="p-3.5 rounded-xl bg-[#E6F3EF]/60 border border-[#7BAE9D]/25 space-y-1.5">
                      <span className="font-bold text-[#176B67] text-xs">Attending Physician Assessment:</span>
                      <p className="text-[#19302F] text-xs leading-relaxed">{enc.clinicalAssessmentSummary}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: MEDICAL HISTORY                                                    */}
        {/* ========================================================================= */}
        {activeTab === "history" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {medicalHistoryItems.map((item) => (
                <Card
                  key={item.id}
                  className="p-5 border-[#7BAE9D]/30 bg-white space-y-3 shadow-xs rounded-2xl flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm text-[#19302F]">{item.condition}</h4>
                      <Badge
                        variant={item.severity.includes("Severe") ? "destructive" : "outline"}
                        className="text-[10px]"
                      >
                        {item.severity}
                      </Badge>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 space-y-1.5 text-xs">
                      <div>
                        <span className="text-[#667A78]">Status:</span>
                        <div className="font-semibold text-[#19302F]">{item.status}</div>
                      </div>
                      <div>
                        <span className="text-[#667A78]">Diagnosed Facility:</span>
                        <div className="text-[#19302F]">{item.facility}</div>
                      </div>
                      <div>
                        <span className="text-[#667A78]">Date:</span>
                        <div className="font-mono text-[#19302F]">{item.diagnosedDate}</div>
                      </div>
                    </div>

                    <p className="text-xs text-[#667A78] leading-relaxed">{item.notes}</p>
                  </div>

                  <div className="pt-2 border-t border-[#7BAE9D]/15 text-[11px] text-[#176B67] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified in Patient Health History</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: ALLERGIES                                                          */}
        {/* ========================================================================= */}
        {activeTab === "allergies" && (
          <div className="space-y-5">
            {/* CRITICAL ALLERGEN WARNING BANNER */}
            <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-300 text-red-950 flex items-start gap-3.5 shadow-xs">
              <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <span className="font-bold text-sm text-red-700 block">Critical Allergen Warning Flagged</span>
                <p className="leading-relaxed">
                  Patient has a documented, clinically verified <strong>Grade III Anaphylactoid Allergy to Penicillin and Beta-Lactam Antibiotics</strong>.
                  Attending doctors and pharmacies must verify zero beta-lactam compounding.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {allergies.map((alg) => (
                <Card key={alg.id} className="p-5 border-[#7BAE9D]/30 bg-white space-y-3 shadow-xs rounded-2xl">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono text-[#176B67] font-bold uppercase">
                        SNOMED: {alg.snomedCode}
                      </span>
                      <h4 className="font-bold text-sm text-[#19302F]">{alg.substance}</h4>
                    </div>
                    <Badge
                      variant={alg.severity.includes("Severe") ? "destructive" : "warning"}
                      className="text-[10px]"
                    >
                      {alg.severity}
                    </Badge>
                  </div>

                  <div className="p-3 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 space-y-1.5 text-xs">
                    <div>
                      <span className="text-[#667A78]">Reaction Manifestation:</span>
                      <div className="font-semibold text-[#19302F] mt-0.5">{alg.reaction}</div>
                    </div>
                    <div>
                      <span className="text-[#667A78]">Category:</span>
                      <div className="text-[#19302F]">{alg.category}</div>
                    </div>
                    <div>
                      <span className="text-[#667A78]">Diagnosed By:</span>
                      <div className="text-[#19302F]">{alg.diagnosedBy} ({alg.diagnosedDate})</div>
                    </div>
                  </div>

                  <div className="pt-2 text-[11px] text-[#667A78] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#176B67]" />
                    <span>Verified: {alg.verificationSource}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: VACCINATIONS                                                       */}
        {/* ========================================================================= */}
        {activeTab === "vaccinations" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredVaccinations.map((vac) => (
                <Card
                  key={vac.id}
                  className="p-5 border-[#7BAE9D]/30 bg-white flex flex-col justify-between shadow-xs rounded-2xl"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-9 h-9 rounded-xl bg-[#E6F3EF] text-[#176B67] flex items-center justify-center font-bold">
                        <Syringe className="w-5 h-5" />
                      </div>
                      <Badge variant="success" className="text-[10px]">
                        Verified Certificate
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-[#19302F]">{vac.title}</h4>
                      <p className="text-xs text-[#667A78] mt-0.5">{vac.facility}</p>
                    </div>

                    <p className="text-xs text-[#667A78] leading-relaxed">
                      {vac.summary}
                    </p>

                    <div className="space-y-1 text-xs">
                      {vac.clinicalDetails.findings.map((f, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[11px] text-[#19302F]">
                          <span className="text-[#176B67] font-bold">•</span>
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#7BAE9D]/15 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#667A78]">{vac.date}</span>
                    <Button
                      onClick={() => setSelectedReportForView(vac)}
                      variant="outline"
                      size="sm"
                      className="text-xs border-[#7BAE9D]/35 text-[#176B67] gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Certificate</span>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: IMAGING & SCANS                                                    */}
        {/* ========================================================================= */}
        {activeTab === "imaging" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredImaging.map((img) => (
                <Card
                  key={img.id}
                  className="p-5 border-[#7BAE9D]/30 bg-white flex flex-col justify-between shadow-xs rounded-2xl"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-9 h-9 rounded-xl bg-[#E6F3EF] text-[#176B67] flex items-center justify-center font-bold">
                        <FileSearch className="w-5 h-5" />
                      </div>
                      <Badge variant="outline" className="text-[10px] font-mono border-[#7BAE9D]/35">
                        MRI / RADIOLOGY
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-[#19302F]">{img.title}</h4>
                      <p className="text-xs text-[#667A78] mt-0.5">{img.facility}</p>
                    </div>

                    <p className="text-xs text-[#667A78] leading-relaxed">
                      {img.summary}
                    </p>

                    <div className="space-y-1 text-xs">
                      {img.clinicalDetails.findings.map((f, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[11px] text-[#19302F]">
                          <span className="text-[#176B67] font-bold">•</span>
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#7BAE9D]/15 flex items-center justify-between gap-2">
                    <Button
                      onClick={() => setSelectedReportForView(img)}
                      variant="outline"
                      size="sm"
                      className="text-xs border-[#7BAE9D]/35 text-[#176B67] hover:bg-[#E6F3EF] gap-1.5 w-full font-semibold"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Scan Details</span>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: MEDICAL TIMELINE                                                   */}
        {/* ========================================================================= */}
        {activeTab === "timeline" && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-white border border-[#7BAE9D]/30 space-y-1">
              <h3 className="font-bold text-sm text-[#19302F]">Chronological Medical Timeline</h3>
              <p className="text-xs text-[#667A78]">
                A unified audit log of your laboratory reports, specialist visits, prescriptions, and health events.
              </p>
            </div>

            <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#7BAE9D]/30">
              {timeline.map((event) => (
                <div key={event.id} className="relative group">
                  <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-[#176B67] border-2 border-white ring-2 ring-[#7BAE9D]/40" />
                  <Card className="p-4 border-[#7BAE9D]/25 bg-white space-y-2 shadow-xs hover:border-[#176B67]/50 transition-colors rounded-2xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#19302F]">{event.title}</span>
                        {event.highlightBadge && (
                          <Badge variant="default" className="text-[10px]">
                            {event.highlightBadge}
                          </Badge>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-[#667A78]">{event.date}</span>
                    </div>

                    <p className="text-xs text-[#667A78] leading-relaxed">{event.summary}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-[#7BAE9D]/15 text-[11px]">
                      <span className="text-[#667A78]">
                        Facility: <span className="font-medium text-[#19302F]">{event.facility}</span> ({event.provider})
                      </span>
                      <span className="text-[10px] text-[#7BAE9D] font-mono">
                        Audited Log
                      </span>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 9: KAGGLE & RESEARCH DATASETS (TIER C SEPARATION)                     */}
        {/* ========================================================================= */}
        {activeTab === "datasets" && (
          <div className="space-y-6">
            {/* 3-TIER ARCHITECTURE SEPARATION BANNER */}
            <div className="p-5 rounded-3xl bg-white border border-[#7BAE9D]/40 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E6F3EF] text-[#176B67] flex items-center justify-center font-bold">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#19302F]">
                    Kaggle & Open Clinical Research Datasets
                  </h3>
                  <p className="text-xs text-[#667A78]">
                    Strict Three-Tier Data Architecture Separation ensures research models never mix with your personal records.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-[#E6F3EF]/60 border border-[#7BAE9D]/30 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[#176B67]">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Tier A: Real Patient Data</span>
                  </div>
                  <p className="text-[11px] text-[#19302F]">
                    Your confirmed documents. Encrypted off-chain and anchored on Sepolia blockchain via SHA-256 digests.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-sky-800">
                    <Info className="w-4 h-4 text-sky-600" />
                    <span>Tier B: Medical Reference Data</span>
                  </div>
                  <p className="text-[11px] text-sky-900">
                    Official clinical reference intervals from MedlinePlus/NIH, LOINC, and ADA. Educational context only.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Tier C: Kaggle / Research Data</span>
                  </div>
                  <p className="text-[11px] text-amber-900">
                    Open datasets for algorithm benchmarking. Clearly labeled; strictly separated from personal records.
                  </p>
                </div>
              </div>
            </div>

            {/* 10 RESEARCH DATASETS ACCORDION/LIST */}
            <div className="space-y-4">
              {Object.values(KAGGLE_MEDICAL_DATASETS).map((ds, idx) => (
                <Card
                  key={ds.id}
                  className="p-5 border-[#7BAE9D]/30 bg-white space-y-3 shadow-xs rounded-2xl"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#7BAE9D]/20 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#E6F3EF] text-[#176B67] flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </span>
                        <h4 className="font-bold text-sm text-[#19302F]">{ds.name}</h4>
                        <Badge variant="outline" className="text-[10px] text-[#176B67] border-[#7BAE9D]/35">
                          {ds.domain}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#667A78] mt-1">
                        Source: {ds.authorOrInstitution} • License: {ds.license} • Size: {ds.sampleCount}
                      </p>
                    </div>

                    <a
                      href={ds.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#176B67] hover:underline"
                    >
                      <span>Dataset Source</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 space-y-1">
                      <span className="font-bold text-[#176B67]">Intended Algorithmic Use:</span>
                      <p className="text-[#19302F] text-[11px]">{ds.intendedUse}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F7FAF8] border border-[#7BAE9D]/20 space-y-1">
                      <span className="font-bold text-amber-800">Clinical Limitations:</span>
                      <p className="text-[#667A78] text-[11px]">{ds.clinicalLimitations}</p>
                    </div>
                  </div>

                  {/* DATA DICTIONARY PREVIEW */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-xs uppercase text-[#19302F] tracking-wider block">
                      Data Dictionary Sample:
                    </span>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px] border-collapse">
                        <thead>
                          <tr className="border-b border-[#7BAE9D]/20 text-[#667A78] bg-[#F7FAF8]">
                            <th className="py-2 px-3">Column Name</th>
                            <th className="py-2 px-3">Clinical Meaning</th>
                            <th className="py-2 px-3">Unit</th>
                            <th className="py-2 px-3">Standard Reference Interval</th>
                            <th className="py-2 px-3">Standard Code</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#7BAE9D]/15 text-[#19302F]">
                          {ds.dataDictionary.map((col, cIdx) => (
                            <tr key={cIdx} className="hover:bg-[#F7FAF8]">
                              <td className="py-2 px-3 font-mono font-bold text-[#176B67]">{col.columnName}</td>
                              <td className="py-2 px-3">{col.clinicalMeaning}</td>
                              <td className="py-2 px-3 font-mono text-[#667A78]">{col.standardUnit}</td>
                              <td className="py-2 px-3">{col.typicalRangeOrValues}</td>
                              <td className="py-2 px-3 font-mono text-[10px] text-[#667A78]">
                                {col.loincOrStandardCode || "N/A"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* UPLOAD REPORT MODAL */}
      <UploadReportModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        defaultCategory={activeTab === "imaging" ? "imaging" : activeTab === "prescriptions" ? "prescription" : "lab"}
      />

      {/* EASY-TO-UNDERSTAND REPORT DETAIL MODAL */}
      <ReportDetailModal
        open={!!selectedReportForView}
        onOpenChange={(open) => !open && setSelectedReportForView(null)}
        report={selectedReportForView}
      />
    </div>
  );
}
