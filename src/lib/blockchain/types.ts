export type ProviderStatus = "Inactive" | "PendingVerification" | "Accredited" | "Suspended" | "Revoked";

export interface ProviderInfo {
  walletAddress: string;
  licenseNumber: string;
  organizationName: string;
  jurisdiction: string;
  status: ProviderStatus;
  accreditedAt: number;
  validUntil: number;
  metadataHash: string;
}

export interface ConsentScope {
  id: string;
  name: string;
  description: string;
  mask: string; // Hex representation
}

export const CONSENT_SCOPES: Record<string, ConsentScope> = {
  LABS: {
    id: "LABS",
    name: "Laboratory Reports",
    description: "Blood tests, pathology, metabolic panels and urinalysis",
    mask: "0x0000000000000000000000000000000000000000000000000000000000000001",
  },
  PRESCRIPTIONS: {
    id: "PRESCRIPTIONS",
    name: "Prescriptions & Medications",
    description: "Active medications, dosage schedules, and past pharmaceutical orders",
    mask: "0x0000000000000000000000000000000000000000000000000000000000000002",
  },
  CONSULTATIONS: {
    id: "CONSULTATIONS",
    name: "Consultation Notes",
    description: "Doctor visit clinical notes, treatment plans, and discharge summaries",
    mask: "0x0000000000000000000000000000000000000000000000000000000000000004",
  },
  IMAGING: {
    id: "IMAGING",
    name: "Diagnostic Imaging",
    description: "X-Rays, MRI scans, CT scans, and Ultrasound radiologist notes",
    mask: "0x0000000000000000000000000000000000000000000000000000000000000008",
  },
  VACCINATIONS: {
    id: "VACCINATIONS",
    name: "Immunization Records",
    description: "Vaccine batches, immunization schedule, and antibody titers",
    mask: "0x0000000000000000000000000000000000000000000000000000000000000010",
  },
  FULL_HISTORY: {
    id: "FULL_HISTORY",
    name: "Complete Longitudinal History",
    description: "Comprehensive lifetime medical record archive (high privilege)",
    mask: "0x00000000000000000000000000000000000000000000000000000000000000ff",
  },
};

export interface ConsentRecord {
  patient: string;
  provider: string;
  providerName: string;
  scopeMask: string;
  scopes: string[];
  validFrom: number;
  validUntil: number;
  isActive: boolean;
  nonce: number;
  policyHash: string;
  txHash?: string;
  isSimulated?: boolean;
}

export interface AccessRequest {
  id: string;
  providerAddress: string;
  providerName: string;
  providerType: "Hospital" | "Clinic" | "Diagnostic Lab" | "Specialist";
  licenseNumber: string;
  requestedScopes: string[];
  purpose: string;
  requestedDurationHours: number;
  timestamp: number;
  status: "Pending" | "Approved" | "Rejected" | "Revoked";
}

export interface VerifiableCredential {
  id: string;
  title: string;
  issuerName: string;
  issuerAddress: string;
  type: "IdentityAnchor" | "Immunization" | "Insurance" | "ClinicalAttestation";
  credentialHash: string;
  issuedAt: number;
  validUntil: number;
  status: "Valid" | "Revoked" | "Suspended";
  claims: Record<string, string>;
  onChainTx?: string;
}

export interface EmergencyAccessLog {
  id: string;
  patientAddress: string;
  providerAddress: string;
  providerName: string;
  timestamp: number;
  validUntil: number;
  reason: string;
  reasonHash: string;
  scope: string;
  notifiedGuardians: string[];
}
