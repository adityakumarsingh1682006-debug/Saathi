"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  DEMO_PATIENT,
  INITIAL_RECORDS,
  INITIAL_REQUESTS,
  INITIAL_PERMISSIONS,
  INITIAL_CREDENTIALS,
  INITIAL_GUARDIANS,
  INITIAL_EMERGENCY_LOGS,
  MedicalRecord,
  PatientProfile,
  GuardianMember,
} from "./mock-data";
import { AccessRequest, ConsentRecord, VerifiableCredential, EmergencyAccessLog, CONSENT_SCOPES } from "./blockchain/types";
import { WalletState, connectInjectedWallet, formatAddress } from "./blockchain/wallet";
import { getBlockchainConfig, grantConsentOnChain, revokeConsentOnChain } from "./blockchain/service";
import {
  SYNTHETIC_LAB_PANELS,
  SYNTHETIC_PRESCRIPTIONS,
  SYNTHETIC_ALLERGIES,
  SYNTHETIC_CONSULTATIONS,
  SYNTHETIC_TIMELINE,
} from "./medical/synthetic-records";
import {
  LabPanel,
  PrescriptionItem,
  AllergyRecord,
  ConsultationRecord,
  MedicalTimelineEvent,
} from "./medical/types";
import {
  patientService,
  recordService,
  labService,
  prescriptionService,
  allergyService,
  consentService,
  requestService,
  emergencyService,
} from "./database";

interface AppStateContextType {
  // Patient Profile
  patient: PatientProfile;
  updatePatient: (partial: Partial<PatientProfile>) => void;

  // Records
  records: MedicalRecord[];
  addRecord: (record: Omit<MedicalRecord, "id" | "sha256Digest" | "blockchainAnchored"> & { date?: string }) => void;
  deleteRecord: (id: string) => void;

  // Medically Grounded Synthetic Clinical Dataset
  labPanels: LabPanel[];
  prescriptions: PrescriptionItem[];
  allergies: AllergyRecord[];
  consultations: ConsultationRecord[];
  timeline: MedicalTimelineEvent[];
  addPrescription: (item: Omit<PrescriptionItem, "id" | "isSynthetic">) => void;
  addAllergy: (item: Omit<AllergyRecord, "id" | "isSynthetic">) => void;

  // Consent & Requests
  requests: AccessRequest[];
  permissions: ConsentRecord[];
  approveRequest: (requestId: string, customScopes?: string[], durationHours?: number) => Promise<void>;
  rejectRequest: (requestId: string) => void;
  revokePermission: (providerAddress: string) => Promise<void>;
  grantNewPermission: (providerName: string, providerAddress: string, scopes: string[], durationHours: number) => Promise<void>;

  // Guardians
  guardians: GuardianMember[];
  addGuardian: (guardian: Omit<GuardianMember, "id" | "addedDate" | "status">) => void;
  removeGuardian: (id: string) => void;

  // Emergency Policy & Logs
  emergencyEnabled: boolean;
  setEmergencyEnabled: (val: boolean) => void;
  emergencyScope: string;
  setEmergencyScope: (val: string) => void;
  emergencyDurationHours: number;
  setEmergencyDurationHours: (val: number) => void;
  emergencyLogs: EmergencyAccessLog[];
  triggerEmergencyAccess: (providerName: string, providerAddress: string, reason: string) => void;

  // Verifiable Credentials
  credentials: VerifiableCredential[];

  // Wallet
  wallet: WalletState;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;

  // Toast / System notice
  notice: { message: string; type: "success" | "error" | "info" } | null;
  clearNotice: () => void;
  showNotice: (message: string, type?: "success" | "error" | "info") => void;

  // Mode Indicator
  isLiveSepolia: boolean;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [patient, setPatient] = useState<PatientProfile>(DEMO_PATIENT);
  const [records, setRecords] = useState<MedicalRecord[]>(INITIAL_RECORDS);
  const [requests, setRequests] = useState<AccessRequest[]>(INITIAL_REQUESTS);
  const [permissions, setPermissions] = useState<ConsentRecord[]>(INITIAL_PERMISSIONS);
  const [credentials, setCredentials] = useState<VerifiableCredential[]>(INITIAL_CREDENTIALS);
  const [guardians, setGuardians] = useState<GuardianMember[]>(INITIAL_GUARDIANS);
  const [emergencyLogs, setEmergencyLogs] = useState<EmergencyAccessLog[]>(INITIAL_EMERGENCY_LOGS);

  // Synthetic Medically Grounded Datasets
  const [labPanels, setLabPanels] = useState<LabPanel[]>(SYNTHETIC_LAB_PANELS);
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>(SYNTHETIC_PRESCRIPTIONS);
  const [allergies, setAllergies] = useState<AllergyRecord[]>(SYNTHETIC_ALLERGIES);
  const [consultations, setConsultations] = useState<ConsultationRecord[]>(SYNTHETIC_CONSULTATIONS);
  const [timeline, setTimeline] = useState<MedicalTimelineEvent[]>(SYNTHETIC_TIMELINE);

  const [emergencyEnabled, setEmergencyEnabled] = useState(true);
  const [emergencyScope, setEmergencyScope] = useState("Critical Allergies, Blood Group & Active Medications");
  const [emergencyDurationHours, setEmergencyDurationHours] = useState(4);

  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    isSepolia: false,
    balance: null,
    provider: null,
    signer: null,
    error: null,
  });

  const [notice, setNotice] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const blockchainConfig = getBlockchainConfig();
  const isLiveSepolia = blockchainConfig.isLiveDeployment;

  // Hydrate from persistent database layer on mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        const storedProfile = await patientService.getProfile(DEMO_PATIENT.did);
        if (storedProfile) {
          setPatient((prev) => ({
            ...prev,
            name: storedProfile.full_name,
            did: storedProfile.did,
            abhaId: storedProfile.abha_id,
            dob: storedProfile.date_of_birth,
            gender: storedProfile.biological_sex,
            bloodGroup: storedProfile.blood_group,
            walletAddress: storedProfile.wallet_address,
          }));
        }

        const storedRecords = await recordService.getRecords(DEMO_PATIENT.did);
        if (storedRecords && storedRecords.length > 0) {
          setRecords(
            storedRecords.map((r) => ({
              id: r.id || `rec-${Date.now()}`,
              title: r.title,
              category: r.category,
              facility: r.facility,
              doctorName: r.doctor_name || "",
              date: r.date_of_record,
              fileType: (r.file_type as any) || "pdf",
              fileSize: `${Math.round((r.file_size_bytes || 1024000) / 1024)} KB`,
              ipfsHash: r.ipfs_cid || "QmLocalReplica",
              sha256Digest: r.sha256_digest,
              blockchainAnchored: Boolean(r.blockchain_tx_hash),
              blockNumber: r.block_number || 6815000,
              summary: r.summary || "",
              clinicalDetails: (r.clinical_details as any) || { findings: [] },
            }))
          );
        }

        const storedPrescriptions = await prescriptionService.getPrescriptions(DEMO_PATIENT.did);
        if (storedPrescriptions && storedPrescriptions.length > 0) {
          setPrescriptions(
            storedPrescriptions.map((p) => ({
              id: p.id || `rx-${Date.now()}`,
              genericName: p.generic_name,
              brandName: p.brand_name || "",
              rxNormCode: p.rxnorm_code || undefined,
              strength: p.strength,
              form: (p.form as any) || "Tablet",
              dosage: p.dosage,
              frequency: p.frequency,
              route: (p.route as any) || "Oral",
              duration: p.duration || "",
              prescribedDate: p.prescribed_date,
              prescriberName: p.prescriber_name,
              prescriberRegistration: p.prescriber_license || "REG-DOC-2026",
              facility: p.facility,
              indication: p.indication || "",
              specialInstructions: p.special_instructions || "",
              isActive: p.is_active ?? true,
              isSynthetic: false,
            }))
          );
        }

        const storedAllergies = await allergyService.getAllergies(DEMO_PATIENT.did);
        if (storedAllergies && storedAllergies.length > 0) {
          setAllergies(
            storedAllergies.map((a) => ({
              id: a.id || `alg-${Date.now()}`,
              substance: a.substance,
              category: a.category,
              snomedCode: a.snomed_code || "",
              reaction: a.reaction_description,
              severity: a.severity,
              clinicalStatus: (a.clinical_status as any) || "Active",
              diagnosedDate: a.diagnosed_date || "",
              diagnosedBy: a.diagnosed_by || "",
              verificationSource: "Clinical Governance Record",
              isSynthetic: false,
            }))
          );
        }

        const storedGuardians = await emergencyService.getGuardians(DEMO_PATIENT.did);
        if (storedGuardians && storedGuardians.length > 0) {
          setGuardians(
            storedGuardians.map((g) => ({
              id: g.id || `guard-${Date.now()}`,
              name: g.name,
              relationship: g.relationship,
              did: g.did || "",
              phone: g.phone,
              accessLevel: g.access_level,
              status: (g.status as any) || "Active",
              addedDate: g.created_at ? g.created_at.split("T")[0] : "2026-01-15",
            }))
          );
        }
      } catch (err) {
        console.warn("[AppStateProvider] Initial persistent data load error:", err);
      }
    }

    loadInitialData();
  }, []);

  const showNotice = (message: string, type: "success" | "error" | "info" = "info") => {
    setNotice({ message, type });
    setTimeout(() => {
      setNotice((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const clearNotice = () => setNotice(null);

  const updatePatient = (partial: Partial<PatientProfile>) => {
    setPatient((prev) => {
      const updated = { ...prev, ...partial };
      patientService.upsertProfile({
        did: updated.did,
        wallet_address: updated.walletAddress,
        abha_id: updated.abhaId,
        full_name: updated.name,
        date_of_birth: updated.dob,
        biological_sex: updated.gender,
        blood_group: updated.bloodGroup,
        phone: updated.emergencyContact?.phone,
        kyc_tier: updated.kycTier,
        organ_donor: updated.organDonor,
      });
      return updated;
    });
    showNotice("Profile successfully updated", "success");
  };

  const addRecord = (newRec: Omit<MedicalRecord, "id" | "sha256Digest" | "blockchainAnchored"> & { date?: string }) => {
    // Generate deterministic sha256 mock digest
    const randomHex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    const record: MedicalRecord = {
      ...newRec,
      id: `rec-${Date.now().toString().slice(-4)}`,
      date: newRec.date || new Date().toISOString().split("T")[0],
      sha256Digest: randomHex,
      blockchainAnchored: true,
      blockNumber: 6815000 + Math.floor(Math.random() * 500),
    };
    setRecords((prev) => [record, ...prev]);

    recordService.createRecord({
      id: record.id,
      patient_did: patient.did,
      title: record.title,
      category: record.category,
      facility: record.facility,
      doctor_name: record.doctorName,
      date_of_record: record.date,
      file_type: record.fileType,
      sha256_digest: record.sha256Digest,
      blockchain_tx_hash: "0x" + Array.from({ length: 64 }, () => "d").join(""),
      block_number: record.blockNumber,
      summary: record.summary,
      clinical_details: record.clinicalDetails,
    });

    showNotice(`Document "${record.title}" encrypted and anchored`, "success");
  };

  const deleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    recordService.deleteRecord(id);
    showNotice("Record removed", "info");
  };

  const approveRequest = async (requestId: string, customScopes?: string[], durationHours: number = 48) => {
    const target = requests.find((r) => r.id === requestId);
    if (!target) return;

    const scopesToGrant = customScopes || target.requestedScopes;

    // Check if wallet is connected to perform real or simulated signature
    if (wallet.signer) {
      await grantConsentOnChain(
        wallet.signer,
        target.providerAddress,
        "0x0000000000000000000000000000000000000000000000000000000000000007",
        durationHours,
        "0x" + Array.from({ length: 64 }, () => "a").join("")
      );
    }

    const newPerm: ConsentRecord = {
      patient: patient.walletAddress,
      provider: target.providerAddress,
      providerName: target.providerName,
      scopeMask: "0x0000000000000000000000000000000000000000000000000000000000000007",
      scopes: scopesToGrant,
      validFrom: Date.now(),
      validUntil: Date.now() + durationHours * 3600 * 1000,
      isActive: true,
      nonce: permissions.length + 1,
      policyHash: "0x" + Array.from({ length: 64 }, () => "e").join(""),
      isSimulated: !isLiveSepolia,
    };

    setPermissions((prev) => [newPerm, ...prev.filter((p) => p.provider.toLowerCase() !== target.providerAddress.toLowerCase())]);
    setRequests((prev) => prev.filter((r) => r.id !== requestId));

    consentService.savePermission({
      patient_wallet: patient.walletAddress,
      patient_did: patient.did,
      provider_wallet: target.providerAddress,
      provider_name: target.providerName,
      scope_mask: newPerm.scopeMask,
      allowed_scopes: newPerm.scopes,
      valid_from: new Date(newPerm.validFrom).toISOString(),
      valid_until: new Date(newPerm.validUntil).toISOString(),
      is_active: true,
      onchain_nonce: newPerm.nonce,
      policy_hash: newPerm.policyHash,
    });
    requestService.updateRequestStatus(requestId, "Approved");

    showNotice(`Access granted to ${target.providerName} (${durationHours}h)`, "success");
  };

  const rejectRequest = (requestId: string) => {
    const target = requests.find((r) => r.id === requestId);
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
    requestService.updateRequestStatus(requestId, "Rejected");
    showNotice(`Access request from ${target?.providerName || "provider"} rejected`, "info");
  };

  const revokePermission = async (providerAddress: string) => {
    const target = permissions.find((p) => p.provider.toLowerCase() === providerAddress.toLowerCase());
    if (wallet.signer) {
      await revokeConsentOnChain(wallet.signer, providerAddress);
    }
    setPermissions((prev) =>
      prev.map((p) =>
        p.provider.toLowerCase() === providerAddress.toLowerCase()
          ? { ...p, isActive: false, validUntil: Date.now() }
          : p
      )
    );
    consentService.revokePermission(patient.walletAddress, providerAddress);
    showNotice(`Access revoked for ${target?.providerName || "provider"}`, "info");
  };

  const grantNewPermission = async (
    providerName: string,
    providerAddress: string,
    scopes: string[],
    durationHours: number
  ) => {
    const newPerm: ConsentRecord = {
      patient: patient.walletAddress,
      provider: providerAddress,
      providerName,
      scopeMask: "0x0000000000000000000000000000000000000000000000000000000000000007",
      scopes,
      validFrom: Date.now(),
      validUntil: Date.now() + durationHours * 3600 * 1000,
      isActive: true,
      nonce: permissions.length + 1,
      policyHash: "0x" + Array.from({ length: 64 }, () => "f").join(""),
      isSimulated: !isLiveSepolia,
    };
    setPermissions((prev) => [newPerm, ...prev]);

    consentService.savePermission({
      patient_wallet: patient.walletAddress,
      patient_did: patient.did,
      provider_wallet: providerAddress,
      provider_name: providerName,
      scope_mask: newPerm.scopeMask,
      allowed_scopes: scopes,
      valid_from: new Date(newPerm.validFrom).toISOString(),
      valid_until: new Date(newPerm.validUntil).toISOString(),
      is_active: true,
      onchain_nonce: newPerm.nonce,
      policy_hash: newPerm.policyHash,
    });

    showNotice(`Granted consent to ${providerName}`, "success");
  };

  const addGuardian = (g: Omit<GuardianMember, "id" | "addedDate" | "status">) => {
    const newG: GuardianMember = {
      ...g,
      id: `guard-${Date.now().toString().slice(-4)}`,
      status: "Active",
      addedDate: new Date().toISOString().split("T")[0],
    };
    setGuardians((prev) => [...prev, newG]);

    emergencyService.addGuardian({
      id: newG.id,
      patient_did: patient.did,
      name: g.name,
      relationship: g.relationship,
      phone: g.phone,
      did: g.did,
      access_level: g.accessLevel,
      status: "Active",
    });

    showNotice(`Guardian ${g.name} added with ${g.accessLevel} permissions`, "success");
  };

  const removeGuardian = (id: string) => {
    const target = guardians.find((g) => g.id === id);
    setGuardians((prev) => prev.filter((g) => g.id !== id));
    emergencyService.removeGuardian(id);
    showNotice(`Guardian ${target?.name || ""} removed`, "info");
  };

  const addPrescription = (item: Omit<PrescriptionItem, "id" | "isSynthetic">) => {
    const newRx: PrescriptionItem = {
      ...item,
      id: `rx-${Date.now().toString().slice(-4)}`,
      isSynthetic: false,
    };
    setPrescriptions((prev) => [newRx, ...prev]);

    prescriptionService.createPrescription({
      id: newRx.id,
      patient_did: patient.did,
      generic_name: item.genericName,
      brand_name: item.brandName,
      rxnorm_code: item.rxNormCode,
      strength: item.strength,
      form: item.form,
      dosage: item.dosage,
      frequency: item.frequency,
      route: item.route,
      duration: item.duration,
      prescribed_date: item.prescribedDate,
      prescriber_name: item.prescriberName,
      prescriber_license: item.prescriberRegistration,
      facility: item.facility,
      indication: item.indication,
      special_instructions: item.specialInstructions,
    });

    showNotice(`Prescription for ${item.brandName || item.genericName} recorded`, "success");
  };

  const addAllergy = (item: Omit<AllergyRecord, "id" | "isSynthetic">) => {
    const newAlg: AllergyRecord = {
      ...item,
      id: `alg-${Date.now().toString().slice(-4)}`,
      isSynthetic: false,
    };
    setAllergies((prev) => [newAlg, ...prev]);

    allergyService.createAllergy({
      id: newAlg.id,
      patient_did: patient.did,
      substance: item.substance,
      category: item.category,
      snomed_code: item.snomedCode,
      reaction_description: item.reaction,
      severity: item.severity,
      clinical_status: item.clinicalStatus,
      diagnosed_date: item.diagnosedDate,
      diagnosed_by: item.diagnosedBy,
    });

    showNotice(`Documented allergy to ${item.substance} recorded`, "success");
  };

  const triggerEmergencyAccess = (providerName: string, providerAddress: string, reason: string) => {
    const newLog: EmergencyAccessLog = {
      id: `em-log-${Date.now().toString().slice(-4)}`,
      patientAddress: patient.walletAddress,
      providerAddress,
      providerName,
      timestamp: Date.now(),
      validUntil: Date.now() + emergencyDurationHours * 3600 * 1000,
      reason,
      reasonHash: "0x" + Array.from({ length: 64 }, () => "9").join(""),
      scope: emergencyScope,
      notifiedGuardians: guardians.map((g) => `${g.name} (${g.phone})`),
    };
    setEmergencyLogs((prev) => [newLog, ...prev]);

    emergencyService.recordBreakGlass({
      id: newLog.id,
      patient_did: patient.did,
      patient_address: patient.walletAddress,
      provider_address: providerAddress,
      provider_name: providerName,
      reason,
      reason_hash: newLog.reasonHash,
      scope: emergencyScope,
      valid_until: new Date(newLog.validUntil).toISOString(),
      notified_guardians: newLog.notifiedGuardians,
    });

    showNotice(`EMERGENCY BREAK-GLASS: Access opened for ${providerName}. All guardians alerted.`, "error");
  };

  const connectWallet = async () => {
    try {
      const res = await connectInjectedWallet();
      setWallet({
        isConnected: true,
        address: res.address,
        chainId: res.chainId,
        isSepolia: res.chainId === 11155111,
        balance: "0.245 SEP",
        provider: res.provider,
        signer: res.signer,
        error: null,
      });
      // Synchronize patient address with connected wallet
      setPatient((prev) => ({
        ...prev,
        walletAddress: res.address,
        did: `did:saathi:sep:${res.address}`,
      }));
      showNotice(`Wallet connected: ${formatAddress(res.address)}`, "success");
    } catch (err: any) {
      // If MetaMask is not present or user rejected, connect fallback demo wallet
      setWallet({
        isConnected: true,
        address: DEMO_PATIENT.walletAddress,
        chainId: 11155111,
        isSepolia: true,
        balance: "1.450 SEP",
        provider: null,
        signer: null,
        error: null,
      });
      showNotice("Connected to SAATHI Sepolia Demo Wallet (EIP-712 Active)", "info");
    }
  };

  const disconnectWallet = () => {
    setWallet({
      isConnected: false,
      address: null,
      chainId: null,
      isSepolia: false,
      balance: null,
      provider: null,
      signer: null,
      error: null,
    });
    showNotice("Wallet disconnected", "info");
  };

  return (
    <AppStateContext.Provider
      value={{
        patient,
        updatePatient,
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
        requests,
        permissions,
        approveRequest,
        rejectRequest,
        revokePermission,
        grantNewPermission,
        guardians,
        addGuardian,
        removeGuardian,
        emergencyEnabled,
        setEmergencyEnabled,
        emergencyScope,
        setEmergencyScope,
        emergencyDurationHours,
        setEmergencyDurationHours,
        emergencyLogs,
        triggerEmergencyAccess,
        credentials,
        wallet,
        connectWallet,
        disconnectWallet,
        notice,
        clearNotice,
        showNotice,
        isLiveSepolia,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
}
