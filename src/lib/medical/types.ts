/**
 * SAATHI Medical Data Standards & Type Definitions
 * Inspired by HL7 FHIR R4 (Fast Healthcare Interoperability Resources)
 * and LOINC (Logical Observation Identifiers Names and Codes).
 * 
 * STRICT COMPLIANCE:
 * - Demarcated as SYNTHETIC DEMONSTRATION DATA (Zero real Protected Health Information).
 * - Off-chain storage models with cryptographic digest anchoring.
 */

export type LabStatus = "Normal" | "Elevated" | "Low" | "Critical";

export interface LabAnalyte {
  id: string;
  name: string;
  loincCode: string;
  result: number | string;
  unit: string;
  referenceRange: {
    low?: number;
    high?: number;
    text: string;
  };
  status: LabStatus;
  date: string;
  sourceOfRange: "MedlinePlus / NIH" | "NCEP ATP III / AHA" | "ADA 2026 Standards" | "NKF KDOQI" | "ATA Guidelines" | "WHO Clinical Laboratory Manual" | "NHS Reference Intervals";
  clinicalInterpretation?: string;
  methodology?: string;
}

export interface LabPanel {
  id: string;
  panelType: "CBC" | "LIPID" | "GLUCOSE" | "LFT" | "KFT" | "TFT" | "URINALYSIS";
  title: string;
  loincCode: string;
  sampleCollectedDate: string;
  reportedDate: string;
  facility: string;
  pathologist: string;
  laboratoryCaveat: string;
  analytes: LabAnalyte[];
  summaryNote: string;
  isSynthetic: boolean;
}

export interface PrescriptionItem {
  id: string;
  genericName: string;
  brandName: string;
  rxNormCode?: string;
  strength: string;
  form: "Tablet" | "Inhaler" | "Capsule" | "Syrup" | "Injection" | "Topical";
  dosage: string;
  frequency: string;
  route: "Oral" | "Inhalation" | "Subcutaneous" | "Topical";
  duration: string;
  prescribedDate: string;
  prescriberName: string;
  prescriberRegistration: string;
  facility: string;
  indication: string;
  specialInstructions: string;
  warningAlerts?: string[];
  isActive: boolean;
  isSynthetic: boolean;
}

export interface AllergyRecord {
  id: string;
  substance: string;
  category: "Medication" | "Food" | "Environmental" | "Biologic";
  snomedCode: string;
  reaction: string;
  severity: "Mild" | "Moderate" | "Severe / Anaphylactoid";
  clinicalStatus: "Active" | "Resolved" | "Refuted";
  diagnosedDate: string;
  diagnosedBy: string;
  verificationSource: string;
  isSynthetic: boolean;
}

export interface ClinicalVitals {
  bloodPressureSys: number;
  bloodPressureDia: number;
  heartRateBpm: number;
  respiratoryRate: number;
  bodyTemperatureF: number;
  oxygenSaturationSpo2: number;
  bodyMassIndex: number;
}

export interface ConsultationRecord {
  id: string;
  consultationType: "Outpatient" | "Emergency" | "Specialist Review" | "Telehealth";
  date: string;
  facility: string;
  doctorName: string;
  specialty: string;
  doctorLicense: string;
  subjectiveChiefComplaint: string;
  historyOfPresentIllness: string;
  vitals: ClinicalVitals;
  objectiveExamFindings: string[];
  clinicalAssessmentSummary: string; // Patient summary, strictly non-diagnostic from AI perspective
  documentedCarePlan: string[];
  followUp: string;
  isSynthetic: boolean;
}

export interface MedicalTimelineEvent {
  id: string;
  date: string;
  category: "lab" | "prescription" | "consultation" | "hospital" | "allergy" | "vaccination";
  title: string;
  facility: string;
  provider: string;
  summary: string;
  highlightBadge?: string;
  relatedRecordId?: string;
  isSynthetic: true;
}

export interface SyntheticPatientRecord {
  metadata: {
    datasetSource: "Synthea / SyntheticMass Inspired Patient Simulation";
    version: "2.1-FHIR-R4";
    disclaimer: "SYNTHETIC CLINICAL DEMONSTRATION RECORD. Contains zero real patient identifiers.";
    generationTimestamp: string;
  };
  patientInfo: {
    did: string;
    abhaId: string;
    fullName: string;
    birthDate: string;
    age: number;
    biologicalSex: "Male" | "Female";
    bloodType: string;
    residenceCity: string;
  };
  labPanels: LabPanel[];
  prescriptions: PrescriptionItem[];
  allergies: AllergyRecord[];
  consultations: ConsultationRecord[];
  timeline: MedicalTimelineEvent[];
}
