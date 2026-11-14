import { CONSENT_SCOPES, ConsentRecord, AccessRequest, VerifiableCredential, EmergencyAccessLog } from "./blockchain/types";

export interface PatientProfile {
  did: string;
  name: string;
  abhaId: string;
  dob: string;
  age: number;
  gender: string;
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  organDonor: boolean;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  kycTier: "Level 3 - Biometric ABHA Verified";
  walletAddress: string;
  patientId?: string;
  location?: string;
  photoUrl?: string;
}

export interface MedicalRecord {
  id: string;
  title: string;
  category: "lab" | "prescription" | "consultation" | "vaccination" | "imaging" | "other";
  facility: string;
  doctorName: string;
  date: string;
  fileType: "pdf" | "dicom" | "jpeg";
  fileSize: string;
  ipfsHash: string;
  sha256Digest: string;
  blockchainAnchored: boolean;
  blockNumber?: number;
  summary: string;
  clinicalDetails: {
    findings: string[];
    vitalMetrics?: Record<string, string>;
    medications?: Array<{ name: string; dosage: string; frequency: string }>;
  };
}

export interface GuardianMember {
  id: string;
  name: string;
  relationship: string;
  did: string;
  phone: string;
  accessLevel: "Emergency Only" | "Vital Summaries" | "Full Proxy";
  status: "Active" | "Pending Approval";
  addedDate: string;
}

export const DEMO_PATIENT: PatientProfile = {
  did: "did:saathi:sep:0x9F64A810928B8d9a2217cCd6498F2817e01239Aa",
  name: "Aditya Kr Singh",
  patientId: "STHA-9F64-2817",
  abhaId: "91-3847-5621-9083",
  dob: "2006-08-16",
  age: 19,
  gender: "Male",
  bloodGroup: "B+",
  location: "Kanchrapara, West Bengal",
  photoUrl: "/aditya-photo.png",
  allergies: [],
  chronicConditions: [],
  organDonor: true,
  emergencyContact: {
    name: "Sunita Sharma",
    relationship: "Mother",
    phone: "+91 98201 44521",
  },
  kycTier: "Level 3 - Biometric ABHA Verified",
  walletAddress: "0x9F64A810928B8d9a2217cCd6498F2817e01239Aa",
};

export const INITIAL_RECORDS: MedicalRecord[] = [
  {
    id: "rec-01",
    title: "Comprehensive Metabolic & Lipid Profile",
    category: "lab",
    facility: "Apollo Diagnostics Centre",
    doctorName: "Dr. Rajesh Mehta, MD Pathology",
    date: "2026-10-18",
    fileType: "pdf",
    fileSize: "1.4 MB",
    ipfsHash: "QmZ84bT2Wv...e9x3Y",
    sha256Digest: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    blockchainAnchored: true,
    blockNumber: 6814209,
    summary: "Routine fasting metabolic screen showing optimal glycemic index and normal lipid levels.",
    clinicalDetails: {
      findings: [
        "Fasting Blood Glucose: 92 mg/dL (Normal: 70-99)",
        "HbA1c Glycated Hemoglobin: 5.3% (Normal: < 5.7%)",
        "Total Cholesterol: 178 mg/dL (Desirable: < 200)",
        "Serum Creatinine: 0.9 mg/dL (Normal: 0.7-1.3)",
        "Estimated GFR: > 90 mL/min/1.73m² (Normal)",
      ],
      vitalMetrics: {
        "Fasting Glucose": "92 mg/dL",
        HbA1c: "5.3%",
        "Total Cholesterol": "178 mg/dL",
        HDL: "54 mg/dL",
        LDL: "102 mg/dL",
      },
    },
  },
  {
    id: "rec-02",
    title: "Cardiovascular Risk Assessment & ECG",
    category: "consultation",
    facility: "Max Super Speciality Hospital",
    doctorName: "Dr. Ananya Sharma, DM Cardiology",
    date: "2026-09-04",
    fileType: "pdf",
    fileSize: "2.1 MB",
    ipfsHash: "QmX91jK4Pf...t7z2A",
    sha256Digest: "8f4803297a7a723e71d374415fa9d1e39a5840656a12b489a2b8e3a2b7f382a1",
    blockchainAnchored: true,
    blockNumber: 6791102,
    summary: "Normal sinus rhythm with no signs of ischemia or arrhythmia. Resting BP 118/76 mmHg.",
    clinicalDetails: {
      findings: [
        "Resting Heart Rate: 68 bpm, regular",
        "Blood Pressure: 118/76 mmHg sitting",
        "12-Lead ECG: Normal sinus rhythm, normal PR & QTc intervals",
        "Echocardiogram: Left ventricular ejection fraction 62%, normal wall motion",
      ],
      vitalMetrics: {
        "Resting HR": "68 bpm",
        "Blood Pressure": "118/76 mmHg",
        LVEF: "62%",
      },
    },
  },
  {
    id: "rec-03",
    title: "MRI Right Knee Joint (Non-contrast)",
    category: "imaging",
    facility: "Fortis Healthcare Radiology Center",
    doctorName: "Dr. K. S. Verma, Senior Radiologist",
    date: "2026-07-12",
    fileType: "pdf",
    fileSize: "14.8 MB",
    ipfsHash: "QmW73tB9Lr...k3q8M",
    sha256Digest: "4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b",
    blockchainAnchored: true,
    blockNumber: 6710488,
    summary: "Mild patellar tendinopathy; intact anterior and posterior cruciate ligaments and menisci.",
    clinicalDetails: {
      findings: [
        "ACL and PCL fibers intact with normal signal intensity",
        "Medial and lateral menisci reveal no tear or subluxation",
        "Mild signal hyperintensity at the proximal patellar tendon origin",
        "No significant joint effusion or intra-articular loose bodies",
      ],
    },
  },
  {
    id: "rec-04",
    title: "Electronic Prescription: Bronchodilator & Micronutrients",
    category: "prescription",
    facility: "Dr. Priya Nair Family Medicine Clinic",
    doctorName: "Dr. Priya Nair, MBBS DNB",
    date: "2026-10-18",
    fileType: "pdf",
    fileSize: "480 KB",
    ipfsHash: "QmP55zM2Yw...v8k1L",
    sha256Digest: "91b892a014902898c6166412f8e13a40490b4d45543cf0f8eb5e1e813a48e718",
    blockchainAnchored: true,
    blockNumber: 6814215,
    summary: "Maintenance inhaler for seasonal exercise-induced asthma with prophylactic vitamin supplementation.",
    clinicalDetails: {
      findings: [
        "Avoid NSAIDs and Penicillin derivatives (documented allergy)",
        "Review in 6 months or in case of acute wheezing episode",
      ],
      medications: [
        { name: "Budesonide + Formoterol 200mcg", dosage: "1 puff", frequency: "SOS before strenuous sports" },
        { name: "Cholecalciferol (Vit D3) 60,000 IU", dosage: "1 pouch weekly with milk", frequency: "For 8 weeks" },
        { name: "Levocetirizine 5mg", dosage: "1 tablet", frequency: "At bedtime if allergic rhinitis triggers" },
      ],
    },
  },
  {
    id: "rec-05",
    title: "Digital Immunization Certificate (CoWIN / Manipal)",
    category: "vaccination",
    facility: "Manipal Hospital Vaccination Hub",
    doctorName: "Dr. Sameer Joshi, Head of Preventive Health",
    date: "2025-11-20",
    fileType: "pdf",
    fileSize: "620 KB",
    ipfsHash: "QmV11yP8Qw...c4b9N",
    sha256Digest: "3c7b89d412850901e4a7a810b4293817f51199a008c2a8b9829f798e1e779a99",
    blockchainAnchored: true,
    blockNumber: 6542109,
    summary: "WHO-compliant international digital certificate of vaccination for Tdap and Influenza.",
    clinicalDetails: {
      findings: [
        "Tdap Booster (Tetanus, Diphtheria, Acellular Pertussis) - Batch #TD-99014",
        "Quadrivalent Influenza Vaccine 2025/2026 - Batch #FLU-2025-X",
        "Zero adverse events following immunization (AEFI) reported",
      ],
    },
  },
];

// Deterministic clinical reference anchor timestamp (2026-10-18T10:00:00Z)
// Guarantees zero SSR/Hydration timestamp discrepancy between server & client
export const CLINICAL_ANCHOR_TIME = 1792317600000;

export const INITIAL_REQUESTS: AccessRequest[] = [
  {
    id: "req-01",
    providerAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    providerName: "Max Super Speciality Hospital (Dept of Cardiology)",
    providerType: "Hospital",
    licenseNumber: "MED-REG-DEL-2018-9411",
    requestedScopes: ["LABS", "PRESCRIPTIONS", "CONSULTATIONS"],
    purpose: "Pre-procedure cardiovascular risk review and medication reconciliation prior to elective dental surgery",
    requestedDurationHours: 48,
    timestamp: CLINICAL_ANCHOR_TIME - 1000 * 60 * 35, // 35 minutes ago
    status: "Pending",
  },
  {
    id: "req-02",
    providerAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    providerName: "SRL Diagnostic Reference Laboratories",
    providerType: "Diagnostic Lab",
    licenseNumber: "NABL-LAB-MH-4421",
    requestedScopes: ["LABS"],
    purpose: "Direct pathology upload authorization and comparative baseline analysis",
    requestedDurationHours: 24,
    timestamp: CLINICAL_ANCHOR_TIME - 1000 * 60 * 180, // 3 hours ago
    status: "Pending",
  },
];

export const INITIAL_PERMISSIONS: ConsentRecord[] = [
  {
    patient: DEMO_PATIENT.walletAddress,
    provider: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    providerName: "Dr. Priya Nair (Primary Care Clinic)",
    scopeMask: "0x0000000000000000000000000000000000000000000000000000000000000007",
    scopes: ["LABS", "PRESCRIPTIONS", "CONSULTATIONS"],
    validFrom: CLINICAL_ANCHOR_TIME - 1000 * 60 * 60 * 24 * 14,
    validUntil: CLINICAL_ANCHOR_TIME + 1000 * 60 * 60 * 24 * 45,
    isActive: true,
    nonce: 1,
    policyHash: "0x78a1bc49...89b1",
    isSimulated: true,
  },
  {
    patient: DEMO_PATIENT.walletAddress,
    provider: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
    providerName: "Apollo Hospital (Emergency Dept - Break Glass Policy)",
    scopeMask: "0x0000000000000000000000000000000000000000000000000000000000000003",
    scopes: ["PRESCRIPTIONS", "LABS"],
    validFrom: CLINICAL_ANCHOR_TIME - 1000 * 60 * 60 * 24 * 60,
    validUntil: CLINICAL_ANCHOR_TIME + 1000 * 60 * 60 * 24 * 300,
    isActive: true,
    nonce: 2,
    policyHash: "0x22c4fd89...110a",
    isSimulated: true,
  },
];

export const INITIAL_CREDENTIALS: VerifiableCredential[] = [
  {
    id: "vc-01",
    title: "ABHA Sovereign Health ID Anchor",
    issuerName: "National Health Authority (NHA / ABDM)",
    issuerAddress: "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
    type: "IdentityAnchor",
    credentialHash: "0x5b38da6a701c568545dcfcb03fcb875f56beddc48a47ff78e1b1e62678f21958",
    issuedAt: CLINICAL_ANCHOR_TIME - 1000 * 60 * 60 * 24 * 180,
    validUntil: CLINICAL_ANCHOR_TIME + 1000 * 60 * 60 * 24 * 550,
    status: "Valid",
    claims: {
      ABHA_Number: "91-4829-1923-8841",
      ABHA_Address: "aaravsharma@abdm",
      KYC_Level: "Level 3 - Aadhaar Biometric",
      Cryptographic_Proof: "Ed25519Signature2020",
    },
  },
  {
    id: "vc-02",
    title: "Critical Allergy & Blood Group Attestation",
    issuerName: "Apollo Hospitals Clinical Governance Board",
    issuerAddress: "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955",
    type: "ClinicalAttestation",
    credentialHash: "0x6849a0a03ff23a78bf91992764b868e8334466b04859a0fef043924f33fb8744",
    issuedAt: CLINICAL_ANCHOR_TIME - 1000 * 60 * 60 * 24 * 90,
    validUntil: CLINICAL_ANCHOR_TIME + 1000 * 60 * 60 * 24 * 900,
    status: "Valid",
    claims: {
      Blood_Group: "O Positive (O RhD+)",
      Verified_Allergy: "Penicillin Anaphylactoid Response (Grade III)",
      Secondary_Allergy: "Sulfamethoxazole",
      Attestation_Doctor: "Dr. K. Raghavan, Clinical Immunologist",
    },
  },
  {
    id: "vc-03",
    title: "Universal Comprehensive Health Insurance Policy",
    issuerName: "Star Health & Allied Insurance Co. Ltd.",
    issuerAddress: "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f",
    type: "Insurance",
    credentialHash: "0x892a00bf881a7b823e44501239aa827b5c19283746a5b4c3d2e1f0a9b8c7d6e5",
    issuedAt: CLINICAL_ANCHOR_TIME - 1000 * 60 * 60 * 24 * 40,
    validUntil: CLINICAL_ANCHOR_TIME + 1000 * 60 * 60 * 24 * 325,
    status: "Valid",
    claims: {
      Policy_Number: "STAR-IND-2026-781992",
      Sum_Insured: "₹25,00,000 INR",
      Cashless_Network: "14,200+ Hospitals Pan-India",
      TPA_Identifier: "FHPL-HEALTH-991",
    },
  },
];

export const INITIAL_GUARDIANS: GuardianMember[] = [
  {
    id: "guard-01",
    name: "Sunita Sharma",
    relationship: "Mother",
    did: "did:saathi:sep:0x88F1102A11B45F2048593A17B80556CD78294411",
    phone: "+91 98201 44521",
    accessLevel: "Vital Summaries",
    status: "Active",
    addedDate: "2026-01-15",
  },
  {
    id: "guard-02",
    name: "Rohan Sharma",
    relationship: "Brother (Adult)",
    did: "did:saathi:sep:0x44B99182375821099859A111002934BB78219904",
    phone: "+91 98201 88923",
    accessLevel: "Emergency Only",
    status: "Active",
    addedDate: "2026-03-22",
  },
];

export const INITIAL_EMERGENCY_LOGS: EmergencyAccessLog[] = [
  {
    id: "em-log-01",
    patientAddress: DEMO_PATIENT.walletAddress,
    providerAddress: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
    providerName: "Apollo Hospital Trauma Centre (Bandra)",
    timestamp: CLINICAL_ANCHOR_TIME - 1000 * 60 * 60 * 24 * 75,
    validUntil: CLINICAL_ANCHOR_TIME - 1000 * 60 * 60 * 24 * 75 + 1000 * 60 * 60 * 4,
    reason: "Severe Acute Asthma exacerbation post marathon finish line, patient unresponsive",
    reasonHash: "0x892ba091...33d1",
    scope: "Critical Allergies + Active Medications",
    notifiedGuardians: ["Sunita Sharma (+91 98201 44521)", "Rohan Sharma (+91 98201 88923)"],
  },
];
