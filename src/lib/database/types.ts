export interface DbPatientProfile {
  id?: string;
  did: string;
  wallet_address: string;
  abha_id: string;
  full_name: string;
  date_of_birth: string;
  biological_sex: string;
  blood_group: string;
  phone?: string;
  email?: string;
  kyc_tier?: string;
  organ_donor?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DbMedicalRecord {
  id?: string;
  patient_did: string;
  title: string;
  category: "lab" | "prescription" | "consultation" | "imaging" | "vaccination" | "other";
  facility: string;
  doctor_name?: string;
  date_of_record: string;
  file_type: string;
  file_size_bytes?: number;
  storage_path?: string;
  ipfs_cid?: string;
  ipfs_hash?: string;
  sha256_digest: string;
  encryption_algorithm?: string;
  blockchain_tx_hash?: string;
  block_number?: number;
  summary?: string;
  clinical_details?: Record<string, any>;
  created_at?: string;
}

export interface DbLabObservation {
  id?: string;
  record_id?: string;
  patient_did: string;
  panel_type: string;
  loinc_code: string;
  test_name: string;
  observed_result: string;
  unit?: string;
  reference_range_low?: number;
  reference_range_high?: number;
  reference_range_text: string;
  status: "Normal" | "Elevated" | "Low" | "Critical";
  source_of_range?: string;
  observed_at: string;
  clinical_interpretation?: string;
  methodology?: string;
  laboratory_caveat?: string;
  created_at?: string;
}

export interface DbPrescription {
  id?: string;
  patient_did: string;
  generic_name: string;
  brand_name?: string;
  rxnorm_code?: string;
  strength: string;
  form: string;
  dosage: string;
  frequency: string;
  route: string;
  duration?: string;
  prescribed_date: string;
  prescriber_name: string;
  prescriber_license?: string;
  facility: string;
  indication?: string;
  special_instructions?: string;
  is_active?: boolean;
  created_at?: string;
}

export interface DbAllergy {
  id?: string;
  patient_did: string;
  substance: string;
  category: "Medication" | "Food" | "Environmental" | "Biologic";
  snomed_code?: string;
  reaction_description: string;
  severity: "Mild" | "Moderate" | "Severe / Anaphylactoid";
  clinical_status?: string;
  diagnosed_date?: string;
  diagnosed_by?: string;
  created_at?: string;
}

export interface DbConsultation {
  id?: string;
  patient_did: string;
  doctor_name: string;
  specialty: string;
  facility: string;
  consultation_type: string;
  date_of_consultation: string;
  chief_complaint: string;
  clinical_findings?: string[];
  treatment_plan: string;
  follow_up_recommendation?: string;
  created_at?: string;
}

export interface DbConsentRecord {
  id?: string;
  patient_wallet: string;
  patient_did?: string;
  provider_wallet: string;
  provider_name: string;
  scope_mask: string;
  allowed_scopes: string[];
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  onchain_nonce: number;
  policy_hash: string;
  blockchain_tx_hash?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbAccessRequest {
  id?: string;
  patient_did: string;
  provider_address: string;
  provider_name: string;
  provider_type: string;
  license_number?: string;
  requested_scopes: string[];
  purpose: string;
  requested_duration_hours: number;
  status: "Pending" | "Approved" | "Rejected" | "Expired";
  created_at?: string;
}

export interface DbEmergencyContact {
  id?: string;
  patient_did: string;
  name: string;
  relationship: string;
  phone: string;
  did?: string;
  access_level: "Emergency Only" | "Vital Summaries" | "Full Proxy";
  status?: string;
  created_at?: string;
}

export interface DbEmergencyLog {
  id?: string;
  patient_did: string;
  patient_address: string;
  provider_address: string;
  provider_name: string;
  reason: string;
  reason_hash: string;
  scope: string;
  valid_until: string;
  notified_guardians?: string[];
  created_at?: string;
}

export interface DbNotification {
  id?: string;
  recipient_address: string;
  title: string;
  message: string;
  category: "consent_request" | "consent_revoked" | "emergency_alert" | "record_uploaded" | "credential_issued";
  is_read: boolean;
  action_url?: string;
  created_at?: string;
}

export interface DbProviderCredential {
  id?: string;
  title: string;
  issuer_name: string;
  issuer_address: string;
  type: string;
  credential_hash: string;
  issued_at: string;
  valid_until: string;
  status: "Valid" | "Revoked" | "Expired";
  claims: Record<string, any>;
  created_at?: string;
}
